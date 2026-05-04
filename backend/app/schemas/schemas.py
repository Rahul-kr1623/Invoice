from pydantic import BaseModel, field_validator
from typing import List, Optional
from datetime import date


class InvoiceDetailCreate(BaseModel):
    description: str
    quantity: int
    unit_price: float

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Quantity must be greater than 0")
        return v

    @field_validator("unit_price")
    @classmethod
    def unit_price_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Unit price must be greater than 0")
        return v


class InvoiceDetailOut(BaseModel):
    id: int
    description: str
    quantity: int
    unit_price: float
    line_total: float

    model_config = {"from_attributes": True}


class InvoiceCreate(BaseModel):
    invoice_number: str
    customer_name: str
    date: date
    details: List[InvoiceDetailCreate]

    @field_validator("details")
    @classmethod
    def details_must_not_be_empty(cls, v):
        if not v:
            raise ValueError("Invoice must have at least one line item")
        return v


class InvoiceUpdate(BaseModel):
    customer_name: Optional[str] = None
    date: Optional[date] = None
    details: Optional[List[InvoiceDetailCreate]] = None


class InvoiceOut(BaseModel):
    id: int
    invoice_number: str
    customer_name: str
    date: date
    total_amount: float
    details: List[InvoiceDetailOut]

    model_config = {"from_attributes": True}


class PaginatedInvoices(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    items: List[InvoiceOut]
