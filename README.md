# ◈ InvoiceOS — Full Stack Invoice Management System

> Built with **FastAPI** · **React** · **SQLAlchemy** · **Pydantic v2** · **SQLite** · **Docker**

![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688?style=flat-square&logo=fastapi)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00?style=flat-square)
![Pydantic](https://img.shields.io/badge/Pydantic-v2-E92063?style=flat-square)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker)

---

## 🔗 Live Links

| | URL |
|---|---|
| 🌐 **Frontend** | https://appinvoice.vercel.app |
| ⚙️ **API Docs (Swagger)** | https://invoice-app-backend-tlfk.onrender.com/docs |
| 📦 **GitHub Repo** | https://github.com/Rahul-kr1623/Invoice |

---

## 📋 Table of Contents

- Project Overview
- Features
- Tech Stack
- Project Structure
- Local Setup
- API Documentation
- Running Tests
- Docker Setup
- Deployment
- Using PostgreSQL
- Evaluation Criteria Coverage

---

## Project Overview

InvoiceOS is a full-stack web application for managing invoices. Users can create, view, edit, and delete invoices — each with multiple line items. The system automatically calculates line totals and grand totals on the server side, supports paginated listing, and provides real-time search and filter functionality.

**Architecture:**

```
Browser (React) ──HTTP Request──► FastAPI Backend ──SQL Query──► SQLite Database
React App ◄──JSON Response ◄──FastAPI Backend ◄──Data ◄──SQLite Database
```

---

## Features

| | Feature |
|---|---|
| ✅ | Full CRUD — Create, Read, Update, Delete invoices |
| ✅ | Multiple line items per invoice in a **single API request** |
| ✅ | Auto-calculated `line_total` and `total_amount` on the server |
| ✅ | Paginated GET with `page` and `page_size` query params |
| ✅ | Search / filter by invoice number or customer name |
| ✅ | Structured validation errors from Pydantic v2 |
| ✅ | Unique invoice number enforcement |
| ✅ | Loading states and toast notifications (React) |
| ✅ | Responsive dark UI with real-time total preview |
| ✅ | Inline form validation on both create and edit |
| ✅ | Unit tests with pytest covering all endpoints |
| ✅ | Docker + docker-compose setup *(bonus)* |
| ✅ | SQLite default, PostgreSQL-ready via env var *(bonus)* |
| ✅ | Live deployment on Render + Vercel *(bonus)* |

---

## Tech Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Python | 3.11 | Primary programming language |
| FastAPI | 0.115.0 | Web framework for building the REST API |
| Uvicorn | 0.27.1 | ASGI server to run FastAPI |
| SQLAlchemy | 2.0.25 | ORM for database models and queries |
| Pydantic | v2.6.4 | Request/response validation and serialization |
| SQLite | Built-in | Default database (file-based, no server needed) |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18.2 | Frontend UI library with functional components and hooks |
| Axios | 1.6.7 | HTTP client for API calls from React |
| react-hot-toast | 2.4.1 | Toast notifications for success/error feedback |

---

## Project Structure

```
invoice-app/
├── backend/
│   ├── app/
│   │   ├── main.py              ← FastAPI app entry point, CORS setup
│   │   ├── database.py          ← SQLAlchemy engine and session config
│   │   ├── models/
│   │   │   └── models.py        ← Invoice & InvoiceDetail ORM models
│   │   ├── schemas/
│   │   │   └── schemas.py       ← Pydantic v2 request/response schemas
│   │   └── routers/
│   │       └── invoices.py      ← All CRUD route handlers
│   ├── tests/
│   │   └── test_invoices.py     ← Unit tests (pytest)
│   ├── requirements.txt
│   ├── .python-version          ← Pins Python 3.11 for Render
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── invoices.js      ← Axios API call functions
│   │   ├── hooks/
│   │   │   └── useInvoices.js   ← Custom hook: list, pagination, delete
│   │   ├── pages/
│   │   │   ├── InvoiceList.js   ← List page with search and pagination
│   │   │   └── InvoiceForm.js   ← Create/Edit form (shared component)
│   │   ├── App.js               ← Root component and view routing
│   │   └── App.css              ← All styles (dark theme)
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf               ← Nginx config for production frontend
├── docker-compose.yml           ← Runs both services together
└── README.md
```

---

## Local Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm or yarn
- Git

---

### 1. Clone the Repository

```bash
git clone https://github.com/Rahul-kr1623/Invoice.git
cd invoice-app
```

---

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Start the development server
uvicorn app.main:app --reload --port 8000
```

| | URL |
|---|---|
| API Base | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |

> The SQLite database file (`invoices.db`) is automatically created in the `backend/` folder on first run. No setup required.

---

### 3. Frontend Setup

Open a **new terminal window** and run from the `frontend/` folder:

```bash
cd frontend
npm install
npm start
```

The app will open automatically at **http://localhost:3000**

> The frontend proxies `/api` requests to the backend via the `"proxy"` field in `package.json` — no CORS issues in development.

---

## API Documentation

All endpoints are prefixed with `/api/invoices/`.  
Interactive documentation is available at **http://localhost:8000/docs** (Swagger UI).

### Endpoints

| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `GET` | `/api/invoices/` | List all invoices (paginated + search) | 200 OK |
| `GET` | `/api/invoices/{id}` | Get a single invoice by ID | 200 OK |
| `POST` | `/api/invoices/` | Create a new invoice with line items | 201 Created |
| `PUT` | `/api/invoices/{id}` | Update invoice and replace line items | 200 OK |
| `DELETE` | `/api/invoices/{id}` | Delete invoice and all its line items | 204 No Content |

---

### Query Parameters — `GET /api/invoices/`

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | integer | `1` | Page number to retrieve |
| `page_size` | integer | `10` | Results per page (max 100) |
| `search` | string | `None` | Filter by invoice number or customer name (case-insensitive) |

**Example:**
```
GET /api/invoices/?page=1&page_size=10&search=john
```

---

### Sample Request — `POST /api/invoices/`

```json
{
  "invoice_number": "INV001",
  "customer_name": "John Doe",
  "date": "2024-11-12",
  "details": [
    { "description": "Product A", "quantity": 2, "unit_price": 50.00 },
    { "description": "Product B", "quantity": 1, "unit_price": 75.00 }
  ]
}
```

### Sample Response — `201 Created`

```json
{
  "id": 1,
  "invoice_number": "INV001",
  "customer_name": "John Doe",
  "date": "2024-11-12",
  "total_amount": 175.00,
  "details": [
    { "id": 1, "description": "Product A", "quantity": 2, "unit_price": 50.00, "line_total": 100.00 },
    { "id": 2, "description": "Product B", "quantity": 1, "unit_price": 75.00, "line_total": 75.00 }
  ]
}
```

---

### Error Response — `422 Validation Error`

```json
{
  "detail": [
    { "loc": ["body", "quantity"], "msg": "Quantity must be greater than 0", "type": "value_error" }
  ]
}
```

### Error Response — `400 Duplicate Invoice`

```json
{
  "detail": "Invoice number 'INV001' already exists"
}
```

---

### HTTP Status Codes

| Code | Name | When returned |
|---|---|---|
| 200 | OK | Successful GET or PUT |
| 201 | Created | New invoice successfully created (POST) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Duplicate invoice number |
| 404 | Not Found | Invoice ID does not exist |
| 422 | Unprocessable Entity | Validation failed (e.g. negative quantity) |

---

## Running Tests

Unit tests cover all API endpoints — create, read, update, delete, duplicate detection, and 404 handling.  
Tests use an isolated in-memory SQLite database that is independent of your development data.

```bash
cd backend

# Install test dependencies
pip install pytest httpx

# Run all tests
pytest tests/ -v
```

**Test coverage:**

| Test | What it checks |
|---|---|
| `test_create_invoice` | POST creates invoice with correct totals |
| `test_duplicate_invoice_number` | Returns 400 for duplicate invoice number |
| `test_list_invoices` | GET returns paginated list |
| `test_get_invoice` | GET single invoice by ID |
| `test_update_invoice` | PUT updates customer name correctly |
| `test_delete_invoice` | DELETE returns 204 |
| `test_get_deleted_invoice` | GET after delete returns 404 |

---

## Docker Setup

Run both frontend and backend together with a single command from the project root:

```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

To stop:
```bash
docker-compose down
```

### How it works

**Backend Dockerfile** — Uses `python:3.11-slim`, installs dependencies, and starts Uvicorn.

**Frontend Dockerfile** — Multi-stage build:
- Stage 1: Uses Node.js to run `npm run build` (produces optimized static files)
- Stage 2: Uses lightweight `nginx:alpine` to serve those files (final image ~25MB vs ~1GB)

**docker-compose.yml** — Defines both services, maps ports, and ensures the backend starts before the frontend.

---

## Deployment

### Backend — Render.com

1. Create a new **Web Service** on [render.com](https://render.com) and connect your GitHub repo
2. Set **Root Directory** → `backend`
3. Set **Build Command** → `pip install -r requirements.txt`
4. Set **Start Command** → `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Select **Free** tier and click **Deploy**
6. The `.python-version` file in the backend folder automatically pins Python 3.11

> ⚠️ **Free tier note:** Render spins down the service after 15 minutes of inactivity. The first request after that takes ~30 seconds to wake up. This is expected on the free plan.

---

### Frontend — Vercel

1. Import your repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** → `frontend`
3. **Framework Preset** → `Create React App` (auto-detected)
4. Add **Environment Variable**:
   - Name: `REACT_APP_API_URL`
   - Value: `https://your-backend-name.onrender.com`
5. Click **Deploy**

> Both Render and Vercel automatically redeploy whenever you push new commits to the `main` branch on GitHub.

---

## Using PostgreSQL

The project defaults to SQLite but is fully PostgreSQL-ready. To switch:

1. Create a PostgreSQL database (e.g. on Render, Supabase, or Railway)
2. Add `psycopg2-binary` to `requirements.txt`:
   ```
   psycopg2-binary==2.9.9
   ```
3. Set the `DATABASE_URL` environment variable on your server:
   ```
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   ```
4. Redeploy — no code changes needed. SQLAlchemy handles the rest automatically.

---

## Evaluation Criteria Coverage

| Criterion | How it is addressed |
|---|---|
| **Code Quality** | Modular structure: separate routers, schemas, models. Custom hook `useInvoices` in React. Reusable `InvoiceForm` for both create and edit. |
| **Functionality** | Full CRUD, pagination, search, auto-calculation, delete with cascade — all working end-to-end. |
| **API Design** | RESTful conventions, correct HTTP methods and status codes, single endpoint handles create/update with line items in one request. |
| **UI/UX** | Responsive dark theme, real-time total calculation preview, toast notifications, loading spinners, inline form validation errors. |
| **Error Handling** | Structured Pydantic v2 validation errors (422), custom 400 for duplicates, 404 for missing records, frontend displays inline errors per field. |
| **Unit Tests** *(bonus)* | pytest suite with 7 tests covering all endpoints using an isolated test database. |
| **Docker** *(bonus)* | Dockerfile for backend and frontend, docker-compose to run the full stack with one command. |
| **PostgreSQL** *(bonus)* | Supported via `DATABASE_URL` env var — no code changes required to switch from SQLite. |
| **Live Deployment** *(bonus)* | Backend on Render, frontend on Vercel. Both auto-deploy on git push to main. |

---

<div align="center">

Built with ❤️ using **FastAPI + React**


</div>