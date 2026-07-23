from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.api.auth import router as auth_router
from app.api.api_keys import router as api_keys_router
from app.api.models import router as models_router
from app.api.orders import router as orders_router
from app.api.proxy import router as proxy_router
from app.api.admin import router as admin_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="Model Router API",
    description="大模型 API 中转站",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["认证"])
app.include_router(api_keys_router, prefix="/api/keys", tags=["API Key"])
app.include_router(models_router, prefix="/api/models", tags=["模型"])
app.include_router(orders_router, prefix="/api/orders", tags=["订单"])
app.include_router(proxy_router, prefix="/v1", tags=["代理"])
app.include_router(admin_router, prefix="/api/admin", tags=["管理"])


@app.get("/")
async def root():
    return {"message": "Model Router API is running"}
