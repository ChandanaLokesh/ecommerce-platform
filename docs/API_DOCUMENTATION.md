# API Documentation
## E-Commerce Platform REST API v1.0

Base URL: `http://localhost:8080/api`
Auth: `Authorization: Bearer <JWT_TOKEN>`

---

## Authentication Endpoints

### POST /auth/register
Register a new customer account.

**Request:**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "password": "secret123",
  "phone": "+1-555-0100"
}
```

**Response 201:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "userId": 1,
  "email": "jane@example.com",
  "role": "CUSTOMER",
  "fullName": "Jane Doe"
}
```

**Errors:** 400 (validation), 400 (email taken)

---

### POST /auth/login
Login and receive JWT token.

**Request:**
```json
{ "email": "jane@example.com", "password": "secret123" }
```

**Response 200:** Same as register response.

**Errors:** 401 (invalid credentials)

---

## Product Endpoints

### GET /products
Get paginated product list. Public.

**Query params:** `page` (default 0), `size` (default 20), `sort`

**Response 200:**
```json
{
  "content": [
    { "id": 1, "name": "Laptop Pro", "price": 1299.99, "stockQuantity": 50, "category": "Electronics", "active": true }
  ],
  "totalElements": 42,
  "totalPages": 3,
  "number": 0
}
```

---

### GET /products/{id}
Get product by ID. Public.

**Response 200:** Single product object.
**Errors:** 404

---

### GET /products/search?keyword={q}
Full-text search. Public.

---

### POST /products
Create product. **Requires ADMIN role.**

**Request:**
```json
{ "name": "Widget X", "description": "...", "price": 49.99, "stockQuantity": 200, "category": "Gadgets" }
```

**Response 201:** Created product object.

---

### PUT /products/{id}
Update product. **Requires ADMIN role.**

---

### DELETE /products/{id}
Soft-delete product. **Requires ADMIN role.**

**Response 204 No Content**

---

## Cart Endpoints (Authenticated)

### GET /cart
Get current user's cart.

**Response 200:**
```json
{
  "id": 1, "userId": 3,
  "items": [{ "id": 1, "productId": 5, "productName": "Widget X", "unitPrice": 49.99, "quantity": 2, "subtotal": 99.98 }],
  "totalPrice": 99.98
}
```

---

### POST /cart/items
Add item to cart.

**Request:** `{ "productId": 5, "quantity": 2 }`
**Response 200:** Updated cart

---

### PUT /cart/items/{itemId}?quantity=3
Update item quantity. quantity=0 removes the item.

---

### DELETE /cart/items/{itemId}
Remove item from cart.

---

### DELETE /cart
Clear entire cart.

---

## Order Endpoints (Authenticated)

### POST /orders
Create order.

**Request:**
```json
{
  "items": [{ "productId": 5, "quantity": 2 }],
  "shippingAddress": "123 Main St, Springfield"
}
```

**Response 201:** Full order object with status CREATED.

**Errors:** 409 (insufficient stock), 404 (product not found)

---

### GET /orders
Get all orders for authenticated user.

**Response 200:** Array of order objects.

---

### GET /orders/{id}
Get specific order. User can only access own orders.

**Errors:** 403 (not your order), 404

---

### PUT /orders/{id}/status?status=CONFIRMED
Update order status. **Requires ADMIN role.**

Valid statuses: `CREATED`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`

---

## Error Response Format

All errors follow:
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Product not found with id: 99",
  "path": "/api/products/99"
}
```

Validation errors also include `fieldErrors` map.
