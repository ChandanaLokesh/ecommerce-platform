# 🛒 ShopNow — Enterprise E-Commerce Platform

Production-grade full-stack e-commerce system built with Spring Boot 3 + React 18.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3.3, Spring Security |
| Frontend | React 18, TypeScript, Vite |
| Database | PostgreSQL 16 |
| Auth | JWT (JJWT 0.12) + BCrypt |
| API Docs | Swagger UI (springdoc-openapi) |
| Testing | JUnit 5, Mockito, MockMvc |
| DevOps | Docker, Docker Compose |

## Quick Start

```bash
# Clone and start everything
git clone <repo-url>
cd ecommerce
docker-compose up --build
```

Then open:
- Frontend: http://localhost:3000
- Swagger UI: http://localhost:8080/swagger-ui.html
- Actuator: http://localhost:8080/actuator/health

## Development (without Docker)

### Backend
```bash
cd backend
# Set env vars or use application.yml defaults (PostgreSQL must be running)
export DB_URL=jdbc:postgresql://localhost:5432/ecommerce
export DB_USERNAME=ecommerce_user
export DB_PASSWORD=ecommerce_pass
mvn spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm run dev        # starts at http://localhost:3000
```

### Backend Tests
```bash
cd backend
mvn test           # runs JUnit 5 + Mockito + MockMvc tests
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| DB_URL | jdbc:postgresql://localhost:5432/ecommerce | PostgreSQL JDBC URL |
| DB_USERNAME | ecommerce_user | DB user |
| DB_PASSWORD | ecommerce_pass | DB password |
| JWT_SECRET | (see application.yml) | 256-bit base64 secret |
| JWT_EXPIRATION | 86400000 | Token TTL in ms (24h) |
| VITE_API_BASE_URL | http://localhost:8080 | Backend URL for frontend |

## Project Structure

```
ecommerce/
├── backend/
│   ├── src/main/java/com/ecommerce/
│   │   ├── config/          # Security, OpenAPI, ApplicationConfig
│   │   ├── controller/      # REST controllers (Auth, Product, Order, Cart, User)
│   │   ├── dto/             # Request/Response DTOs
│   │   ├── entity/          # JPA entities (User, Product, Order, Cart...)
│   │   ├── exception/       # Custom exceptions + GlobalExceptionHandler
│   │   ├── repository/      # Spring Data JPA repositories
│   │   ├── security/        # JwtService, JwtAuthenticationFilter
│   │   └── service/         # Business logic (interfaces + impl)
│   └── src/test/            # JUnit 5 + Mockito + MockMvc tests
├── frontend/
│   └── src/
│       ├── api/             # Axios API layer (auth, product, cart, order)
│       ├── components/      # Navbar, ProtectedRoute
│       ├── context/         # AuthContext, CartContext
│       ├── pages/           # Login, Register, Products, Cart, Checkout, Orders, Admin
│       └── types/           # TypeScript interfaces
├── docs/
│   ├── BRD.md               # Business Requirements Document
│   ├── TECHNICAL_DESIGN.md  # Architecture + DB schema + security design
│   └── API_DOCUMENTATION.md # Full REST API reference
└── docker-compose.yml

```

## API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Register user |
| POST | /api/auth/login | Public | Login → JWT |
| GET | /api/products | Public | List products |
| GET | /api/products/{id} | Public | Get product |
| GET | /api/products/search | Public | Search |
| POST | /api/products | ADMIN | Create product |
| PUT | /api/products/{id} | ADMIN | Update product |
| DELETE | /api/products/{id} | ADMIN | Delete product |
| GET | /api/cart | AUTH | Get cart |
| POST | /api/cart/items | AUTH | Add to cart |
| PUT | /api/cart/items/{id} | AUTH | Update qty |
| DELETE | /api/cart/items/{id} | AUTH | Remove item |
| POST | /api/orders | AUTH | Create order |
| GET | /api/orders | AUTH | My orders |
| GET | /api/orders/{id} | AUTH | Order detail |
| PUT | /api/orders/{id}/status | ADMIN | Update status |
| GET | /api/users/me | AUTH | My profile |

## Default Test Credentials

After first run, register via API or frontend. To create an admin:

```sql
-- Run against postgres DB after first startup
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```
