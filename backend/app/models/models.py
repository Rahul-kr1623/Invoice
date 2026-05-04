from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, index=True, nullable=False)
    customer_name = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    total_amount = Column(Float, default=0.0)

    details = relationship("InvoiceDetail", back_populates="invoice", cascade="all, delete-orphan")


class InvoiceDetail(Base):
    __tablename__ = "invoice_details"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    description = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    line_total = Column(Float, nullable=False)

    invoice = relationship("Invoice", back_populates="details")
