from datetime import datetime, date
from typing import List, Optional
from pydantic import BaseModel


class SignupRequest(BaseModel):
    employee_id: str
    name: str
    mobile: str


class LoginRequest(BaseModel):
    employee_id: str
    mobile: str


class AuthResponse(BaseModel):
    token: str
    employee_id: str
    name: str
    role: str


class MenuItemOut(BaseModel):
    id: int
    name: str
    price: float

    class Config:
        from_attributes = True


class OrderItemIn(BaseModel):
    menu_item_id: int
    quantity: int = 1


class CreateOrderRequest(BaseModel):
    employee_id: str
    items: List[OrderItemIn]


class UpdateStatusRequest(BaseModel):
    status: str  # one of: waiting, preparing, ready, collected


class OrderItemOut(BaseModel):
    menu_item_name: str
    quantity: int


class OrderOut(BaseModel):
    id: int
    token_number: int
    employee_id: str
    status: str
    total_amount: float
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemOut] = []


class BoardResponse(BaseModel):
    now_serving: Optional[int]
    preparing: List[OrderOut]
    ordered: List[OrderOut]
    prepared: List[OrderOut]


class TopItem(BaseModel):
    name: str
    quantity: int


class RevenueResponse(BaseModel):
    date: date
    tokens_served: int
    items_ordered: int
    revenue: float
    avg_order_value: float
    top_items: List[TopItem]
