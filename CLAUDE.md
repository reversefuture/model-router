# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Backend — run dev server
cd backend && uvicorn app.main:app --reload --port 8000

# Backend — seed DB (creates admin + default models)
cd backend && python seed.py

# Frontend — run dev server (proxies /api and /v1 to backend)
cd frontend && npm run dev

# Frontend — build
cd frontend && npm run build

# Frontend — preview production build
cd frontend && npm run preview
```

No tests, linters, or formatters are configured. There's no test framework installed.

## Architecture

**Model Router** is a unified LLM API proxy + billing platform. Users deposit balance, then call any supported model through an OpenAI-compatible endpoint. Token usage is deducted from balance in real time.

### Project layout

```
model-router/
├── backend/           # FastAPI server (Python 3.13)
│   ├── app/
│   │   ├── api/       # 6 routers: auth, api_keys, models, orders, proxy, admin
│   │   ├── models/    # SQLAlchemy ORM: User, ApiKey, Model, RechargeRecord, UsageRecord
│   │   ├── schemas/   # Pydantic request/response models
│   │   ├── services/  # proxy_service (upstream forwarding), billing_service (cost/balance), auth_service
│   │   ├── utils/     # auth (JWT), rate_limit (Redis sliding window)
│   │   ├── database.py  # Async SQLAlchemy engine + session
│   │   ├── redis.py     # Async Redis client
│   │   └── config.py    # Pydantic Settings
│   ├── seed.py        # DB seeder (gitignored — run manually)
│   └── requirements.txt
│
├── frontend/          # React SPA (Vite + Tailwind)
│   ├── src/
│   │   ├── api/       # client.ts (fetch wrapper), auth.tsx (AuthContext + provider)
│   │   ├── pages/     # Home, Login, Register, Dashboard, Models, Docs, ApiKeys, Recharge, Admin
│   │   ├── components/# Layout (nav + footer)
│   │   └── App.tsx    # Routes with ProtectedRoute / AdminRoute guards
│   └── package.json
│
├── analyze_plan.py    # Tool to analyze ECC plan JSON files
└── CLAUDE.md
```

### Key data flow

```
User → OpenAI-compatible request → POST /v1/chat/completions
  → resolve_api_key() looks up ApiKey by Bearer token
  → proxy_chat_completion():
      1. Map model name → upstream URL (OpenAI/Anthropic/DeepSeek)
      2. Estimate cost, check user balance (pessimistic lock)
      3. Forward request to upstream (httpx, 120s timeout)
      4. Calculate actual cost from usage response
      5. Deduct balance, record UsageRecord
      6. Return upstream response passthrough
  → Response sent to user
```

### API routes

| Prefix | Auth | Purpose |
|--------|------|---------|
| `/api/auth` | None / JWT | Register, login, get profile |
| `/api/keys` | JWT | CRUD API keys for programmatic access |
| `/api/models` | None / Admin | List models, admin CRUD |
| `/api/orders` | JWT | Recharge, records, usage stats |
| `/v1/chat/completions` | API Key | OpenAI-compatible proxy endpoint |
| `/api/admin` | Admin | List users, system stats |

### Billing

- Each model has `input_price` / `output_price` (USD per 1K tokens)
- Cost = (input_tokens / 1000) × input_price + (output_tokens / 1000) × output_price
- Balance deducted synchronously after each call
- Rate limiting uses Redis sliding window (60 req/min default)

### Default models (seeded)

GPT-4o, GPT-4o Mini, GPT-4 Turbo, Claude 3 Opus/Sonnet/Haiku, DeepSeek Chat/Reasoner. Prices are stored per-model in the database.

### Default admin credentials (seeded)

`admin@modelrouter.com` / `admin123` — has infinite balance (999999). Admin panel at `/admin`.

### Important notes

- `backend/.env` contains a **Redis URL with embedded password** and the JWT secret — these are dev/test values
- `backend/seed.py` contains a **hardcoded DeepSeek API key** in `DEFAULT_MODELS` — this is in .gitignore but sensitive if committed
- The frontend stores JWT in `localStorage` (acceptable for this project's scope)
- `CORS` is wide open (`allow_origins=["*"]`)
- No Alembic migrations — DB schema is created fresh from ORM metadata on startup
