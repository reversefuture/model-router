import uuid
import json
import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.billing_service import calculate_cost, record_usage, deduct_balance

# 上游模型映射
UPSTREAM_MAP = {
    "gpt-4o": "https://api.openai.com/v1/chat/completions",
    "gpt-4o-mini": "https://api.openai.com/v1/chat/completions",
    "gpt-4-turbo": "https://api.openai.com/v1/chat/completions",
    "claude-3-opus-20240229": "https://api.anthropic.com/v1/messages",
    "claude-3-sonnet-20240229": "https://api.anthropic.com/v1/messages",
    "claude-3-haiku-20240307": "https://api.anthropic.com/v1/messages",
    "deepseek-chat": "https://api.deepseek.com/v1/chat/completions",
    "deepseek-reasoner": "https://api.deepseek.com/v1/chat/completions",
}

MODEL_PROVIDER = {
    "gpt-4o": "openai",
    "gpt-4o-mini": "openai",
    "gpt-4-turbo": "openai",
    "claude-3-opus-20240229": "anthropic",
    "claude-3-sonnet-20240229": "anthropic",
    "claude-3-haiku-20240307": "anthropic",
    "deepseek-chat": "deepseek",
    "deepseek-reasoner": "deepseek",
}


async def proxy_chat_completion(
    body: dict,
    user_id: str,
    api_key_id: str,
    db: AsyncSession,
    upstream_api_key: str = "",
):
    model = body.get("model", "")
    request_id = f"req_{uuid.uuid4().hex[:12]}"

    upstream_url = UPSTREAM_MAP.get(model)
    if not upstream_url:
        raise ValueError(f"不支持的模型: {model}")

    # 先按最大可能 tokens 估算费用做预扣检查
    max_input = len(json.dumps(body.get("messages", [])))
    estimated_input_tokens = max(100, max_input // 2)
    estimated_cost = await calculate_cost(estimated_input_tokens, 100, model, db)

    # 用 Redis Lua 脚本或者事务做余额检查
    from app.database import async_session
    async with async_session() as session:
        from sqlalchemy import select
        from app.models.user import User
        result = await session.execute(select(User).where(User.id == user_id).with_for_update())
        user = result.scalar_one_or_none()
        if not user or user.balance < estimated_cost:
            raise ValueError("余额不足")

        # 转发请求到上游
        from app.models.model import Model as ModelModel
        result = await db.execute(select(ModelModel).where(ModelModel.name == model))
        model_row = result.scalar_one_or_none()
        api_key = upstream_api_key or (model_row.api_key if model_row else "")
        provider = MODEL_PROVIDER.get(model, "openai")
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(upstream_url, json=body, headers=headers)
            upstream_data = resp.json()

        # 计算实际 tokens
        usage = upstream_data.get("usage", {})
        input_tokens = usage.get("prompt_tokens", 0) or usage.get("input_tokens", 0)
        output_tokens = usage.get("completion_tokens", 0) or usage.get("output_tokens", 0)

        actual_cost = await calculate_cost(input_tokens, output_tokens, model, session)
        await deduct_balance(session, user, actual_cost)
        await record_usage(session, user_id, api_key_id, model, input_tokens, output_tokens, actual_cost, request_id)

    return upstream_data
