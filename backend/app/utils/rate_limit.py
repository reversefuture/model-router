from fastapi import HTTPException, Request
from app.redis import redis_client


async def check_rate_limit(key: str, max_requests: int = 60, window: int = 60):
    """简单滑动窗口速率限制"""
    current = await redis_client.incr(f"ratelimit:{key}")
    if current == 1:
        await redis_client.expire(f"ratelimit:{key}", window)
    if current > max_requests:
        raise HTTPException(status_code=429, detail="请求过于频繁，请稍后再试")
