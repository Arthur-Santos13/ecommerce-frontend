# Frontend ↔ Backend Integration

This document describes how the frontend integrates with the `ecommerce-microservices-kafka` backend stack in detail: the HTTP client setup, the gateway constraints the client must respect, authentication flow, error surface, and the eventual-consistency handling required by the event-driven architecture.

---

## Overview

```
Browser
  └── apiClient (Axios)
        ├── Request interceptor
        │     ├── Authorization: Bearer <JWT>
        │     └── X-Correlation-Id: crypto.randomUUID()
        └── Response interceptor
              ├── 200–299  → pass through
              ├── 401      → silent token refresh → retry original request
              └── 4xx/5xx  → parseApiError() → ApiException
                                  │
                                  ▼
                             UI error boundary / toast
```

All traffic goes to a single gateway at `VITE_API_BASE_URL` (default `http://localhost:8080`). The gateway performs JWT validation, rate limiting (Redis sliding window) and circuit breaking (Resilience4j) before forwarding to the downstream microservices.

---

## Gateway constraints

### Timeout alignment

The gateway has:
- `timelimiter.timeout-duration: 30s` — cancels upstream requests after 30 s
- `response-timeout: 60s` — maximum time to wait for the upstream response

The Axios client is configured with `timeout: 9_000 ms`. This is intentionally below both values so that:
1. Axios surfaces a timeout error to the UI rather than waiting for the gateway to close the connection with a `504`
2. The user gets immediate feedback (spinner → error state) instead of a hanging request

### Rate limiting

The gateway applies a Redis-backed sliding-window rate limiter. When the limit is exceeded it returns `429 Too Many Requests`. The response interceptor maps this to:

```
ApiException { status: 429, message: "Too many requests. Please wait a moment." }
```

### Circuit breaker

When a downstream service is unavailable the gateway's Resilience4j circuit breaker opens after `minimum-number-of-calls: 10` failures at a `failure-rate-threshold: 60%`. While open it returns `503 Service Unavailable` immediately. The interceptor maps this to:

```
ApiException { status: 503, message: "Service temporarily unavailable. Try again in a moment." }
```

The circuit enters `HALF_OPEN` with `permitted-number-of-calls-in-half-open-state: 2` probe requests before re-closing.

---

## Authentication

### Login flow

```
POST /api/v1/auth/login
Body: { username, password }

Response: { token: "eyJ..." }
```

1. `authService.login()` sends credentials
2. Response token is decoded by `decodeToken()` into `AuthUser { id, username, roles, exp }`
3. Token stored via `tokenStorage.setAccessToken()` (localStorage key `access_token`)
4. `AuthContext.setUser()` triggers re-render with authenticated state

### Token refresh

```
Request → 401 Unauthorized
  │
  ├── isRefreshing == false → call authService.refresh()
  │     └── success → flushQueue(newToken) → retry all queued requests
  │     └── failure → flushQueue(null) → logout → redirect /login
  │
  └── isRefreshing == true → push to pendingQueue (resolved when refresh completes)
```

Multiple simultaneous `401` responses only trigger one refresh call. All concurrent requests are queued and retried with the new token.

### JWT claims decoded on the client

| Claim | Used for |
|-------|---------|
| `sub` | User ID (passed as `customerId` to order endpoints) |
| `preferred_username` | Display name in sidebar |
| `roles` | `RequireRole` guard, admin-only UI sections |
| `exp` | Proactive refresh 60 s before expiry |

---

## API endpoints

### Auth

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/auth/login` | Obtain JWT |
| `POST` | `/api/v1/auth/refresh` | Refresh expired JWT |

### Products

| Method | Path | Query params | Description |
|--------|------|-------------|-------------|
| `GET` | `/api/v1/products` | `name`, `categoryId`, `minPrice`, `maxPrice`, `inStock`, `page`, `size`, `sort` | Paginated product list |
| `GET` | `/api/v1/products/:id` | — | Product detail |
| `GET` | `/api/v1/categories` | — | Category list for filter dropdown |

### Orders

| Method | Path | Query params | Description |
|--------|------|-------------|-------------|
| `POST` | `/api/v1/orders` | — | Create order from cart |
| `GET` | `/api/v1/orders` | `customerId` | Orders for the authenticated user |
| `GET` | `/api/v1/orders/:id` | — | Order detail with items |
| `PATCH` | `/api/v1/orders/:id/cancel` | — | Cancel a pending order |

### Request headers on every call

| Header | Value | Source |
|--------|-------|--------|
| `Authorization` | `Bearer <token>` | `tokenStorage.getAccessToken()` |
| `X-Correlation-Id` | UUID v4 | `crypto.randomUUID()` |
| `Content-Type` | `application/json` | Axios default |

---

## Eventual consistency

The order lifecycle is driven by Kafka events. After `POST /api/v1/orders` succeeds, the order is in `AWAITING_PAYMENT` status. Payment processing is asynchronous:

```
POST /api/v1/orders → 201 Created
        │
        │  Order status: AWAITING_PAYMENT
        │
        │  (Kafka: order.created → payment-service)
        │
        ├── Payment approved → order.confirmed → status: CONFIRMED
        └── Payment failed  → payment.failed  → status: CANCELLED
```

### Polling strategy (OrderDetailPage)

The UI polls `GET /api/v1/orders/:id` while `status === 'AWAITING_PAYMENT'`:

| Attempt | Delay |
|---------|-------|
| 1 | 2 s |
| 2 | 4 s |
| 3 | 8 s |
| 4+ | 10 s (capped) |

Polling stops when status reaches a terminal state (`CONFIRMED`, `CANCELLED`, `PAID`).

### Status badge mapping

| Backend status | Badge colour | Label |
|---------------|-------------|-------|
| `AWAITING_PAYMENT` | Yellow | Awaiting Payment |
| `CONFIRMED` | Blue | Confirmed |
| `PAID` | Green | Paid |
| `CANCELLED` | Red | Cancelled |

---

## Error handling reference

The `parseApiError()` function in `errorHandler.ts` converts every Axios error into a typed `ApiException`:

```typescript
class ApiException extends Error {
    readonly status: number          // HTTP status (0 = network error)
    readonly errors?: Record<string, string[]>  // field-level validation errors
}
```

Components consume it via:
```typescript
catch (err) {
    const apiErr = parseApiError(err)
    setError(apiErr.message)
    // or: notificationStore.push('error', apiErr.message)
}
```

---

## Running the full stack locally

1. Start the backend:
```bash
cd ecommerce-microservices-kafka
docker compose up -d
```

2. Start the frontend:
```bash
cd ecommerce-frontend
cp .env.example .env.local
npm install
npm run dev
```

3. Seed data is available via Flyway migrations (`V7` in product-service, `V4` in order-service). Use the credentials from the gateway's auth endpoint or register a new user.

4. Access the application at `http://localhost:5173`. The API Gateway is at `http://localhost:8080`.
