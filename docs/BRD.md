# Business Requirements Document (BRD)
## E-Commerce Platform v1.0

---

## 1. Executive Summary

This document defines the business requirements for an enterprise-grade e-commerce platform that enables customers to browse, purchase, and track orders while providing administrators full control over catalog, inventory, and order fulfillment.

---

## 2. Business Objectives

| Objective | Success Metric |
|---|---|
| Enable online product sales | Orders processed end-to-end |
| Reduce manual order management | Admin order status update time < 30s |
| Secure user authentication | 0 unauthorized data breaches |
| Scalable architecture | Support 10,000+ concurrent users |
| Cloud-ready deployment | Single `docker-compose up` startup |

---

## 3. Actors

### 3.1 Customer
- Self-register and authenticate
- Browse and search product catalog
- Add products to cart, modify quantities
- Complete checkout and place orders
- View order history and real-time status

### 3.2 Administrator
- All Customer capabilities
- Create, update, and soft-delete products
- Manage product stock levels
- Update order status (CREATED → CONFIRMED → SHIPPED → DELIVERED)
- View all platform orders

---

## 4. User Journeys

### 4.1 Customer Purchase Journey
1. Register / Login → receive JWT token
2. Browse product catalog (paginated, searchable)
3. View product detail page
4. Add item(s) to cart
5. View and modify cart
6. Proceed to checkout → enter shipping address
7. Place order → stock decremented atomically
8. Receive order confirmation with tracking status
9. Monitor order progress: CREATED → CONFIRMED → SHIPPED → DELIVERED

### 4.2 Admin Product Management Journey
1. Login with ADMIN credentials
2. Access Admin Dashboard
3. Create new product (name, description, price, stock, category, image)
4. Update existing product details or stock
5. Soft-delete inactive products

---

## 5. Functional Requirements

### 5.1 User Module
- FR-U01: Users can register with email, password, first/last name, phone
- FR-U02: Passwords stored using BCrypt hashing (never plaintext)
- FR-U03: Login returns JWT token valid for 24 hours
- FR-U04: Role-based access: ADMIN and CUSTOMER
- FR-U05: Users can retrieve their own profile

### 5.2 Product Module
- FR-P01: Public product listing (paginated, 20 items/page default)
- FR-P02: Full-text search by name and description
- FR-P03: Products have: name, description, price, stock, category, image URL
- FR-P04: Admin-only: create, update, delete (soft) products
- FR-P05: Stock quantity tracked per product

### 5.3 Cart Module
- FR-C01: Authenticated users have one persistent cart
- FR-C02: Add, update quantity, remove individual items
- FR-C03: Cart total calculated server-side
- FR-C04: Cart persists across sessions

### 5.4 Order Module
- FR-O01: Order created from cart items or direct request
- FR-O02: Stock atomically decremented on order creation
- FR-O03: Order statuses: CREATED, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
- FR-O04: Customers view own orders only; Admin views all
- FR-O05: Order contains: items, quantities, unit prices, shipping address, timestamps

---

## 6. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Security | JWT auth, BCrypt passwords, CORS configured |
| Performance | API response < 500ms p95 |
| Availability | 99.9% uptime target |
| Scalability | Stateless backend; horizontal scaling ready |
| Data Integrity | Transactional order + stock updates |
| Documentation | Full Swagger UI at /swagger-ui.html |
| Observability | Spring Actuator health/metrics endpoints |

---

## 7. Constraints

- Technology stack fixed: Java 17+, Spring Boot 3.x, React 18, PostgreSQL
- JWT secret must be externalized via environment variables
- No hardcoded credentials in source code
- All API responses follow structured error format
