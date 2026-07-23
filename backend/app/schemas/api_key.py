from pydantic import BaseModel
from datetime import datetime


class ApiKeyResponse(BaseModel):
    id: str
    name: str
    key: str
    is_active: bool
    last_used_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class CreateApiKeyRequest(BaseModel):
    name: str = ""
