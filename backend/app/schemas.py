from pydantic import BaseModel, EmailStr, ConfigDict, Field
from typing import List, Optional
from decimal import Decimal
from datetime import datetime

class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(...)
    phone_number: str = Field(..., min_length=7, max_length=20)
    address: Optional[str] = None
    city: Optional[str] = None
    segment: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[str] = None
    phone_number: Optional[str] = Field(None, min_length=7, max_length=20)
    address: Optional[str] = None
    city: Optional[str] = None
    segment: Optional[str] = None

class CustomerResponse(CustomerBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    sku: str = Field(..., min_length=1, max_length=100)
    price: Decimal = Field(..., gt=0)
    quantity_in_stock: int = Field(..., ge=0)

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    sku: Optional[str] = Field(None, min_length=1, max_length=100)
    price: Optional[Decimal] = Field(None, gt=0)
    quantity_in_stock: Optional[int] = Field(None, ge=0)

class ProductResponse(ProductBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class OrderItemBase(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)
    note: Optional[str] = None

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int
    product: Optional[ProductResponse] = None

    model_config = ConfigDict(from_attributes=True)



class OrderBase(BaseModel):
    customer_id: int

class OrderCreate(OrderBase):
    items: List[OrderItemCreate] = Field(..., min_length=1)

class OrderResponse(BaseModel):
    id: int
    customer_id: int
    total_amount: Optional[Decimal] = None
    created_at: datetime
    items: List[OrderItemResponse] = []
    customer: Optional[CustomerResponse] = None

    model_config = ConfigDict(from_attributes=True)


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(...)
    password: str = Field(..., min_length=6)
    role: str = Field(..., pattern="^(admin|buyer)$")
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    segment: Optional[str] = "Retail"


class UserLogin(BaseModel):
    username_or_email: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    customer_id: Optional[int] = None
    customer: Optional[CustomerResponse] = None

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

