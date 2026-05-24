# Technical Design Document
## E-Commerce Platform v1.0

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Docker Compose                         │
│                                                         │
│  ┌──────────────┐    ┌────────────────┐    ┌─────────┐  │
│  │   React 18   │───▶│  Spring Boot   │───▶│  Postgres│  │
│  │  (port 3000) │    │  (port 8080)   │    │ (5432)  │  │
│  └──────────────┘    └────────────────┘    └─────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Backend Layers

```
HTTP Request
     │
     ▼
JwtAuthenticationFilter  ← Spring Security Chain
     │
     ▼
@RestController          ← Validates input via @Valid, delegates to service
     │
     ▼
@Service                 ← Business logic, transactional, SLF4J logging
     │
     ▼
@Repository              ← Spring Data JPA / JPQL queries
     │
     ▼
PostgreSQL
```

---

## 2. Database Schema (ER Summary)

```
users
  id (PK), email (UNIQUE), password, first_name, last_name, phone, role, enabled, created_at, updated_at

products
  id (PK), name, description, price, stock_quantity, category, image_url, active, created_at, updated_at

orders
  id (PK), user_id (FK→users), status, total_amount, shipping_address, created_at, updated_at

order_items
  id (PK), order_id (FK→orders), product_id (FK→products), quantity, unit_price

carts
  id (PK), user_id (FK→users UNIQUE), updated_at

cart_items
  id (PK), cart_id (FK→carts), product_id (FK→products), quantity
```

**Key design decisions:**
- Prices stored as `NUMERIC(10,2)` — never float
- Product `unit_price` snapshotted on order creation (price changes don't affect past orders)
- Product deletion is soft-delete (active=false) — preserves historical order data
- One cart per user enforced at DB level (UNIQUE constraint on user_id)

---

## 3. Security Design

### JWT Flow
```
Client                Backend
  │── POST /auth/login ──▶│
  │                        │ validate credentials
  │                        │ generate JWT (HMAC-SHA256, 24h exp)
  │◀── { token: "..." } ──│
  │
  │── GET /api/orders ──▶│
  │   Authorization:       │ JwtAuthenticationFilter extracts token
  │   Bearer eyJ...        │ validates signature + expiry
  │                        │ loads UserDetails, sets SecurityContext
  │◀── 200 OK ────────────│
```

### Authorization Rules
| Endpoint Pattern | Public | CUSTOMER | ADMIN |
|---|---|---|---|
| GET /api/products/** | ✓ | ✓ | ✓ |
| POST/PUT/DELETE /api/products | | | ✓ |
| /api/cart/** | | ✓ | ✓ |
| /api/orders (own) | | ✓ | ✓ |
| PUT /api/orders/{id}/status | | | ✓ |

---

## 4. API Design Principles

- RESTful resource naming (plural nouns)
- HTTP verbs map to CRUD: GET=read, POST=create, PUT=update, DELETE=remove
- Pagination via Spring `Pageable` on all collection endpoints
- Structured error responses from GlobalExceptionHandler
- Request validation via Bean Validation (`@Valid`, `@NotBlank`, etc.)
- DTOs used at all controller boundaries (entities never exposed directly)

---

## 5. Deployment Architecture

### Docker Compose Services
1. **postgres** — PostgreSQL 16 with named volume for data persistence and health check
2. **backend** — Spring Boot JAR in JRE-17 Alpine image; waits for postgres health check
3. **frontend** — React app built with Vite, served by Nginx, reverse proxies /api to backend

### Environment Variables (all required for production)
```
DB_URL               jdbc:postgresql://postgres:5432/ecommerce
DB_USERNAME          ecommerce_user
DB_PASSWORD          (strong password)
JWT_SECRET           (256-bit base64 encoded secret)
JWT_EXPIRATION       86400000
PORT                 8080
VITE_API_BASE_URL    http://localhost:8080
```

### Cloud IDE Support (Gitpod / Codespaces)
- No hardcoded localhost references
- All URLs driven by environment variables
- `docker-compose up` brings entire stack in one command
- Swagger UI available at `http://localhost:8080/swagger-ui.html`
- Actuator health: `http://localhost:8080/actuator/health`

---

## 6. Code Quality Standards

- **SOLID principles**: Single responsibility enforced by layer separation; interfaces for all services
- **Clean Code**: Meaningful names, short methods, no business logic in controllers
- **DTO pattern**: Request/Response DTOs at all API boundaries; entities stay in service/repo layer
- **Logging**: SLF4J + `@Slf4j` at INFO level for business events, WARN for auth failures
- **Transactions**: `@Transactional` on all service write operations; `readOnly=true` on reads
- **Exceptions**: Checked exceptions mapped to HTTP status codes via GlobalExceptionHandler
