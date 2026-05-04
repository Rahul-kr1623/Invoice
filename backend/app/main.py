from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import invoices

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Invoice Management API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(invoices.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Invoice Management API is running"}
