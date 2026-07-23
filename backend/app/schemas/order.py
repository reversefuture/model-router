from pydantic import BaseModel
from datetime import datetime
from typing import List


class RechargeRequest(BaseModel):
    amount: float
    method: str = "mock"


class RechargeResponse(BaseModel):
    id: str
    amount: float
    method: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class UsageRecordResponse(BaseModel):
    id: str
    model_name: str
    input_tokens: int
    output_tokens: int
    cost: float
    created_at: datetime

    model_config = {"from_attributes": True}


class UsageStatsResponse(BaseModel):
    total_calls: int
    total_cost: float
    total_input_tokens: int
    total_output_tokens: int
    recent_records: List[UsageRecordResponse]
