from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
import math

from app.database import get_db
from app.models.models import Invoice, InvoiceDetail
from app.schemas.schemas import InvoiceCreate, InvoiceUpdate, InvoiceOut, PaginatedInvoices

router = APIRouter(prefix="/invoices", tags=["Invoices"])


def calculate_totals(details_data):
    line_items = []
    total = 0.0
    for d in details_data:
        line_total = round(d.quantity * d.unit_price, 2)
        total += line_total
        line_items.append((d, line_total))
    return line_items, round(total, 2)


@router.get("/", response_model=PaginatedInvoices)
def list_invoices(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Invoice)
    if search:
        query = query.filter(
            or_(
                Invoice.invoice_number.ilike(f"%{search}%"),
                Invoice.customer_name.ilike(f"%{search}%")
            )
        )
    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "items": items
    }


@router.get("/{invoice_id}", response_model=InvoiceOut)
def get_invoice(invoice_id: int, db: Session = Depends(get_db)):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice


@router.post("/", response_model=InvoiceOut, status_code=201)
def create_invoice(payload: InvoiceCreate, db: Session = Depends(get_db)):
    existing = db.query(Invoice).filter(Invoice.invoice_number == payload.invoice_number).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Invoice number '{payload.invoice_number}' already exists")

    line_items, total = calculate_totals(payload.details)

    invoice = Invoice(
        invoice_number=payload.invoice_number,
        customer_name=payload.customer_name,
        date=payload.date,
        total_amount=total
    )
    db.add(invoice)
    db.flush()

    for detail_data, line_total in line_items:
        detail = InvoiceDetail(
            invoice_id=invoice.id,
            description=detail_data.description,
            quantity=detail_data.quantity,
            unit_price=detail_data.unit_price,
            line_total=line_total
        )
        db.add(detail)

    db.commit()
    db.refresh(invoice)
    return invoice


@router.put("/{invoice_id}", response_model=InvoiceOut)
def update_invoice(invoice_id: int, payload: InvoiceUpdate, db: Session = Depends(get_db)):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if payload.customer_name is not None:
        invoice.customer_name = payload.customer_name
    if payload.date is not None:
        invoice.date = payload.date

    if payload.details is not None:
        db.query(InvoiceDetail).filter(InvoiceDetail.invoice_id == invoice_id).delete()
        line_items, total = calculate_totals(payload.details)
        invoice.total_amount = total
        for detail_data, line_total in line_items:
            detail = InvoiceDetail(
                invoice_id=invoice.id,
                description=detail_data.description,
                quantity=detail_data.quantity,
                unit_price=detail_data.unit_price,
                line_total=line_total
            )
            db.add(detail)

    db.commit()
    db.refresh(invoice)
    return invoice


@router.delete("/{invoice_id}", status_code=204)
def delete_invoice(invoice_id: int, db: Session = Depends(get_db)):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    db.delete(invoice)
    db.commit()
