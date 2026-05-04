import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db

TEST_DB = "sqlite:///./test.db"
engine = create_engine(TEST_DB, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

SAMPLE = {
    "invoice_number": "TEST001",
    "customer_name": "Test User",
    "date": "2024-11-12",
    "details": [
        {"description": "Item A", "quantity": 2, "unit_price": 50.0},
        {"description": "Item B", "quantity": 1, "unit_price": 75.0}
    ]
}

def test_create_invoice():
    res = client.post("/api/invoices/", json=SAMPLE)
    assert res.status_code == 201
    data = res.json()
    assert data["invoice_number"] == "TEST001"
    assert data["total_amount"] == 175.0
    assert len(data["details"]) == 2

def test_duplicate_invoice_number():
    res = client.post("/api/invoices/", json=SAMPLE)
    assert res.status_code == 400

def test_list_invoices():
    res = client.get("/api/invoices/")
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert data["total"] >= 1

def test_get_invoice():
    res = client.get("/api/invoices/1")
    assert res.status_code == 200

def test_update_invoice():
    res = client.put("/api/invoices/1", json={"customer_name": "Updated User"})
    assert res.status_code == 200
    assert res.json()["customer_name"] == "Updated User"

def test_delete_invoice():
    res = client.delete("/api/invoices/1")
    assert res.status_code == 204

def test_get_deleted_invoice():
    res = client.get("/api/invoices/1")
    assert res.status_code == 404
