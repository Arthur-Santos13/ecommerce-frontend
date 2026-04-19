# ecommerce-frontend

Frontend application for the ecommerce-microservices-kafka platform. Communicates exclusively with the API Gateway (`localhost:8080`) and reflects the full order lifecycle — from product browsing through payment confirmation — driven by the backend's event-driven architecture.

---

## Sumário

- [Arquitetura](#arquitetura)
- [Tech Stack](#tech-stack)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Fluxo de autenticação](#fluxo-de-autenticação)
- [Integração com o backend](#integração-com-o-backend)
- [Design system](#design-system)
- [Testes](#testes)
- [Estratégia de branches](#estratégia-de-branches)
- [Como executar](#como-executar)
- [Roadmap](#roadmap)

---

## Arquitetura

```
  ┌───────────────────────────────────────────────────┐
  │                   Browser (React SPA)             │
  │                                                   │
  │  ThemeProvider → AuthProvider → RouterProvider    │
  │                                                   │
  │  ┌──────────────────┐   ┌────────────────────┐   │
  │  │    RootLayout    │   │    AuthLayout      │   │
  │  │  Sidebar + Main  │   │  /login /register  │   │
  │  └────────┬─────────┘   └────────────────────┘   │
  │           │                                       │
  │  ┌────────▼────────────────────────────────────┐  │
  │  │              Feature Modules                │  │
  │  │  product  │  cart  │  order  │  notification│  │
  │  └────────────────────┬────────────────────────┘  │
  │                       │ Axios (apiClient)          │
  │                       │ JWT + X-Correlation-Id     │
  └───────────────────────┼───────────────────────────┘
                          │ HTTP/HTTPS
                          ▼
  ┌───────────────────────────────────────────────────┐
  │            API Gateway  :8080                     │
  │   Spring Cloud Gateway + JWT + Redis rate-limit   │
  │   Resilience4j circuit breaker + timelimiter      │
  └───┬────────────┬───────────────┬──────────────────┘
      │            │               │
      ▼            ▼               ▼
  product-service  order-service  payment-service
     :8081           :8082           :8083
```

All requests go through a single `apiClient` (Axios instance). The request interceptor attaches the JWT from `localStorage` and a `X-Correlation-Id` UUID. The response interceptor handles token refresh on `401` and maps all HTTP errors to typed `ApiException` objects before they reach the UI layer.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| Routing | React Router v7 (lazy-loaded routes) |
| Global state | Zustand |
| HTTP | Axios — single `apiClient` instance with interceptors |
| Styling | CSS custom properties (Primer-inspired design tokens) |
| Testing | Vitest + React Testing Library + MSW |
| Linting | ESLint + typescript-eslint |

---

## Estrutura do projeto

```
src/
├── app/
│   ├── context/          # ThemeContext — manual dark/light toggle
│   ├── layouts/          # RootLayout (sidebar), AuthLayout, Sidebar, Header
│   ├── styles/           # global.css (design tokens), per-page CSS
│   └── router.tsx        # Route tree — lazy-loaded, role-guarded
├── features/
│   ├── auth/             # Login, Register, JWT handling, ProtectedRoute, GuestRoute, RequireRole
│   ├── product/          # Product list (filters, pagination, sort), product detail
│   ├── cart/             # Zustand cart store, CartPage, localStorage persistence
│   ├── order/            # Order creation, list, detail, cancellation, polling
│   └── notification/     # Toast system, NotificationStore (Zustand)
├── services/
│   ├── apiClient.ts      # Axios instance — baseURL, 9 s timeout
│   ├── interceptors.ts   # JWT injection, X-Correlation-Id, 401 refresh, error normalisation
│   └── errorHandler.ts   # HTTP status → ApiException mapping
├── store/
│   └── notificationStore.ts  # Global toast queue (Zustand)
├── shared/               # Reusable UI components (ErrorState, LoadingSpinner, …)
├── hooks/                # Custom hooks
├── utils/                # Shared helpers
├── types/                # Global TypeScript types
└── test/
    ├── mocks/            # MSW handlers + server
    ├── unit/             # Component and utility unit tests
    ├── integration/      # Service layer and page async-state tests
    ├── utils/            # renderWithProviders helper
    └── setup.ts          # MSW lifecycle + jest-dom + matchMedia polyfill
```

---

## Fluxo de autenticação

```
User fills login form
        │
        ▼
authService.login(credentials)
        │
        ▼
POST /api/v1/auth/login  ──►  API Gateway  ──►  auth endpoint
        │
        │  { token: "eyJ..." }
        ▼
decodeToken(token) → AuthUser { id, username, roles, exp }
        │
        ▼
tokenStorage.setAccessToken(token)   ← localStorage
AuthContext.setUser(decoded)
        │
        ▼
Router redirects to /  (ProductListPage)
```

**Token refresh:** the response interceptor catches `401`, calls `authService.refresh()`, retries the original request. Concurrent requests are queued until the refresh resolves. On failure all pending requests reject and the user is logged out.

**Route guards:**
- `ProtectedRoute` — redirects to `/login` when `user` is `null`
- `GuestRoute` — redirects to `/` when a user is already authenticated
- `RequireRole` — renders `403` when the authenticated user lacks the required role

---

## Integração com o backend

### Endpoint map

| Feature | Method | Path | Backend service |
|---------|--------|------|-----------------|
| Login | `POST` | `/api/v1/auth/login` | `api-gateway` (auth) |
| List products | `GET` | `/api/v1/products` | `product-service` |
| Product detail | `GET` | `/api/v1/products/:id` | `product-service` |
| List categories | `GET` | `/api/v1/categories` | `product-service` |
| Create order | `POST` | `/api/v1/orders` | `order-service` |
| List orders | `GET` | `/api/v1/orders?customerId=` | `order-service` |
| Order detail | `GET` | `/api/v1/orders/:id` | `order-service` |
| Cancel order | `PATCH` | `/api/v1/orders/:id/cancel` | `order-service` |

### HTTP client configuration

| Setting | Value | Reason |
|---------|-------|--------|
| `baseURL` | `VITE_API_BASE_URL` (default `http://localhost:8080`) | Single gateway entry point |
| `timeout` | `9 000 ms` | Below gateway `response-timeout: 10 s` — Axios surfaces the error before the gateway returns `504` |
| `Authorization` | `Bearer <token>` | Injected by request interceptor on every call |
| `X-Correlation-Id` | `crypto.randomUUID()` | Enables end-to-end log correlation across gateway and microservices |

### Error handling

The response interceptor maps every HTTP error to a typed `ApiException` before it reaches the UI:

| Status | Displayed message |
|--------|------------------|
| `0` / network error | Unable to reach the server |
| `400` | Validation error (field-level detail when available) |
| `401` | Session expired — triggers silent refresh |
| `403` | You don't have permission |
| `404` | Resource not found |
| `429` | Too many requests — gateway rate limiter |
| `503` | Service temporarily unavailable — circuit breaker open |
| `5xx` | An unexpected error occurred |

### Consistency and async states

Order status is eventually consistent — payment confirmation flows through Kafka asynchronously. The order detail page polls `GET /api/v1/orders/:id` until the status leaves `AWAITING_PAYMENT`, with exponential back-off. Loading skeletons and status badges reflect every intermediate state (`AWAITING_PAYMENT`, `CONFIRMED`, `CANCELLED`).

---

## Design system

Styles are built on CSS custom properties defined in `global.css`. Dark mode is toggled manually via `ThemeProvider`, which writes `data-theme="dark"` on `<html>` and persists the preference in `localStorage`.

| Token group | Examples |
|-------------|---------|
| Color | `--color-primary`, `--color-surface`, `--color-border` |
| Typography | `--font-size-sm` … `--font-size-3xl`, `--font-sans` |
| Spacing | `--spacing-1` … `--spacing-16` |
| Layout | `--sidebar-width: 240px`, `--header-height: 64px`, `--container-max: 1200px` |
| Radius | `--radius-sm: 8px`, `--radius-md: 14px`, `--radius-lg: 20px` |
| Shadow | `--shadow-sm`, `--shadow-md`, `--shadow-lg` |
| Transition | `--transition-fast: 150ms`, `--transition-normal: 250ms` |

Responsive breakpoints: `768px` (sidebar collapses to drawer, hamburger appears) and `640px` (order/cart items stack vertically).

---

## Testes

```bash
npm test          # watch mode
npm run test:run  # single run (CI)
npm run coverage  # coverage report
```

### Test structure

| Folder | Scope | Tools |
|--------|-------|-------|
| `src/test/unit/` | Pure functions, utility hooks, isolated components | Vitest + Testing Library |
| `src/test/integration/` | Service layer (HTTP) + page async states | Vitest + Testing Library + MSW |

### Coverage areas

| File | What is tested |
|------|---------------|
| `decodeToken.ts` | JWT decoding, invalid inputs |
| `tokenStorage.ts` | localStorage round-trip, null on missing key |
| `errorHandler.ts` | All HTTP status mappings, network error, unknown fallback |
| `notificationStore.ts` | add / remove / clearAll, unique IDs |
| `ProductCard.tsx` | Renders price/name, disabled state on zero stock |
| `ErrorState.tsx` | Error message render, retry callback |
| `ProtectedRoute.tsx` | Redirect when unauthenticated, render children when authenticated |
| `orderService.ts` | Successful fetch, 500 error mapping, 401 surface |
| `OrderListPage.tsx` | Loading, success, empty, error and retry → success cycle |

---

## Estratégia de branches

```
main          ← stable releases (tagged vN.0.0)
└── develop   ← continuous integration
    └── feature/* / chore/* / fix/* / docs/* / test/*
```

Each phase is developed on a dedicated branch, merged into `develop` via Pull Request, and promoted to `main` at phase completion.

---

## Como executar

### Pré-requisitos

- Node.js 20+
- npm 10+
- Backend stack running (`docker compose up -d` in `ecommerce-microservices-kafka/`)

### Instalação e desenvolvimento

```bash
npm install
npm run dev        # http://localhost:5173
```

### Build de produção

```bash
npm run build
npm run preview
```

### Variáveis de ambiente

Copy `.env.example` to `.env.local` and adjust:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

---

## Roadmap

- [x] 1. Setup — Vite + React + TypeScript, estrutura de pastas, React Router, estilos globais
- [x] 2. Integração base — cliente HTTP (Axios), interceptors, variáveis de ambiente
- [x] 3. Autenticação — login, register, JWT, rotas protegidas
- [x] 4. Product — types + service layer, listagem com grid, filtros (nome, categoria, faixa de preço, in stock), paginação, ordenação, página de detalhe
- [x] 5. Carrinho — estado global com Zustand, persistência em localStorage, add/remove/update quantity, badge no header, CartPage com total
- [x] 6. Order — criação de pedido a partir do carrinho, listagem por cliente, detalhe com itens e total, cancelamento, feedback de status
- [x] 7. Consistência eventual — polling, estados intermediários de pedido
- [x] 8. UX para sistema assíncrono — loading states, skeleton, feedback de operações assíncronas
- [x] 9. Notificações — toast em tempo real via SSE/polling
- [x] 10. Segurança frontend — sanitização, CSRF, headers, renovação de token
- [x] 11. Integração final com o backend — validação end-to-end de todos os fluxos
- [x] 12. Testes — unitários, integração e async states
- [x] 13. README final
