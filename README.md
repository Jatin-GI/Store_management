# Store Management System

Full-stack multi-role e-commerce and store management platform with JWT authentication, fine-grained RBAC, product variants, transactional inventory, and separate admin + customer storefronts.

**Resume one-liner:** Built a full-stack store management platform with role/permission-based access control, variant inventory, transactional order processing, Cloudinary media uploads, and React admin + customer UIs.

---

## Features

### Roles & Access Control
- **Admin** — full control over employees, catalog, orders, and dashboard
- **Product Lister** — catalog/inventory work with custom per-user permissions
- **Customer** — browse shop, manage cart, place and track orders

### Admin / Staff
- Dashboard with role & permission overview
- Employee management (create, update, delete, assign permissions)
- Category CRUD with image upload
- Product CRUD with variants, stock, pricing, discounts, multi-image upload, and auto SKU generation
- Order management with status updates (`pending → confirmed → shipped → delivered / cancelled`)

### Customer
- Product catalog and detail pages with variant selection
- Cart (Redux Toolkit + `localStorage` persistence)
- Place orders, view order history, cancel pending orders (stock restored)

### Backend Highlights
- JWT auth with bcrypt password hashing
- Permission middleware on protected routes
- Flexible product variants via JSONB attributes (size, color, weight, etc.)
- Order placement with DB transactions and row locks for safe stock updates
- Cloudinary image uploads via Multer
- Seed script with sample Fashion / Electronics / Grocery / Home catalog

---

## Tech Stack

| Layer | Technologies |
|--------|----------------|
| **Frontend** | React 19, Vite, React Router, Redux Toolkit, Axios, Tailwind CSS 4 |
| **Backend** | Node.js, Express 5, Sequelize 6, Multer, Cloudinary, bcrypt, JWT |
| **Database** | PostgreSQL (Neon-ready via `DATABASE_URL`) |
| **Auth** | JWT + role-based and permission-based access control |
| **Deploy** | Render (API), Vercel (frontend) |

---

## Architecture

```
Routes → Controllers → Sequelize Models (PostgreSQL)
         ↑
   Auth + Permission Middleware
```

- **MVC-style** backend layering
- **RBAC + per-user permissions** for product listers
- Frontend guards: `PrivateRoute`, `RoleRoute`, `PermissionRoute`, and `<Can>` UI gating
- Transactional inventory on order create/cancel

---

## Project Structure

```
Store_management/
├── backend/
│   └── src/
│       ├── config/          # DB, roles, permissions, Cloudinary
│       ├── models/          # Sequelize models & associations
│       ├── routes/          # auth, employee, product, category, order
│       ├── controller/      # Business logic
│       ├── middleware/      # JWT auth + permission checks
│       ├── helper/          # SKU generator
│       ├── seeders/         # Demo data
│       ├── app.js
│       └── server.js
└── frontend/
    └── src/
        ├── api/             # Axios instance
        ├── store/           # authSlice, cartSlice
        ├── pages/           # Login, Dashboard, Shop, Cart, Orders, etc.
        ├── components/      # Layout, ProtectedRoute, Can
        └── hooks/           # usePermission
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or [Neon](https://neon.tech))
- Cloudinary account (for image uploads)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in values
npm run seed           # optional: demo data (resets tables)
npm run dev            # http://localhost:8080
```

**Backend `.env` keys:** `PORT`, `DATABASE_URL`, `JWT_SECRET_KEY`, `FRONTEND_URL`, Cloudinary credentials.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL=http://localhost:8080/api/v1
npm run dev            # http://localhost:5173
```

### Demo Logins (after seeding)

| Role | Email | Password |
|------|--------|----------|
| Admin | `admin@store.com` | `Admin@123` |
| Product Lister | `lister@store.com` | `Lister@123` |
| Customer | `customer@store.com` | `Customer@123` |

---

## API Overview

Base URL: `/api/v1`

| Area | Endpoints |
|------|-----------|
| **Health** | `GET /health` |
| **Auth** | `POST /auth/login`, `GET /auth/get-me` |
| **Employees** | CRUD under `/employee/*` (`employee:manage`) |
| **Products** | CRUD under `/product/*` (variants + images) |
| **Categories** | CRUD under `/category/*` |
| **Orders** | `POST /order/create`, `GET /order/my-orders`, `GET /order/all`, `PUT /order/status/:id`, `PUT /order/cancel/:id` |

---

## Skills Demonstrated

- Full-stack JavaScript (React + Node/Express)
- Relational data modeling with Sequelize & PostgreSQL
- JWT authentication and fine-grained authorization
- Inventory-safe order flows with transactions
- File uploads and cloud media (Cloudinary)
- State management with Redux Toolkit
- Role-based UI routing and permission gating
- Environment-based local + cloud deployment (Render / Vercel)

---

## License

ISC
