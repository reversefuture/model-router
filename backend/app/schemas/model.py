from pydantic import BaseModel
from datetime import datetime


class ModelResponse(BaseModel):
    id: str
    name: str
    display_name: str
    provider: str
    description: str
    input_price: float
    output_price: float
    unit: str
    is_active: bool
    is_popular: bool
    sort_order: int
    created_at: datetime

    model_config = {"from_attributes": True}


class CreateModelRequest(BaseModel):
    name: str
    display_name: str
    provider: str = "openai"
    description: str = ""
    input_price: float = 0.0
    output_price: float = 0.0
    unit: str = "per_1k_tokens"
    is_popular: bool = False
    sort_order: int = 0


class UpdateModelRequest(BaseModel):
    display_name: str | None = None
    provider: str | None = None
    description: str | None = None
    input_price: float | None = None
    output_price: float | None = None
    unit: str | None = None
    is_active: bool | None = None
    is_popular: bool | None = None
    sort_order: int | None = None
