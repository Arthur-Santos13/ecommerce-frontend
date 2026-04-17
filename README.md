# ecommerce-frontend

Frontend application for the ecommerce-microservices-kafka platform, responsible for interacting with the API Gateway and consuming backend services.

---

## Sumário

- [Tech Stack](#tech-stack)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Estratégia de branches](#estratégia-de-branches)
- [Como executar](#como-executar)
- [Roadmap](#roadmap)

---

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| Roteamento | React Router v7 |
| Estado global | Zustand *(fase 5)* |
| HTTP | Axios *(fase 2)* |
| Estilização | CSS Variables (Primer design tokens) |
| Testes | Vitest + React Testing Library *(fase 12)* |
| Linting | ESLint + typescript-eslint |

---

## Estrutura do projeto

```
src/
├── app/              # Configuração global (router, providers, layouts, estilos)
│   ├── layouts/      # RootLayout, Header
│   ├── styles/       # global.css, header.css, layout.css
│   └── router.tsx    # Definição de rotas (lazy-loaded)
├── features/         # Domínios da aplicação
│   ├── auth/         # Login, Register
│   ├── product/      # Listagem e detalhe de produtos
│   ├── cart/         # Carrinho
│   ├── order/        # Pedidos
│   └── notification/ # Notificações em tempo real
├── shared/           # Componentes reutilizáveis
├── services/         # Integração com a API Gateway
├── hooks/            # Hooks customizados
├── store/            # Estado global (Zustand)
├── utils/            # Helpers
└── types/            # Tipos TypeScript globais
```

---

## Estratégia de branches

```
main          ← código estável / releases
└── develop   ← integração contínua
    └── feature/* / chore/* / fix/* / docs/* / test/*  ← desenvolvimento
```

Cada fase é desenvolvida em uma ou mais branches dedicadas, integradas ao `develop` via **Pull Request**, e promovida para `main` ao final da fase.

---

## Como executar

### Pré-requisitos

- Node.js 20+
- npm 10+

### Instalação e desenvolvimento

```bash
npm install
npm run dev
```

### Build de produção

```bash
npm run build
npm run preview
```

> O frontend consome a API Gateway em `http://localhost:8080`. Certifique-se de que a stack de microsserviços está rodando via `docker compose up -d`.

---

## Roadmap

- [x] 1. Setup — Vite + React + TypeScript, estrutura de pastas, React Router, estilos globais
- [x] 2. Integração base — cliente HTTP (Axios), interceptors, variáveis de ambiente
- [ ] 3. Autenticação — login, register, JWT, rotas protegidas
- [ ] 4. Product — listagem, detalhe, busca e filtros
- [ ] 5. Carrinho — estado global com Zustand, persistência local
- [ ] 6. Order — criação de pedido, listagem, detalhe
- [ ] 7. Consistência eventual — polling, estados intermediários de pedido
- [ ] 8. UX para sistema assíncrono — loading states, skeleton, feedback de operações assíncronas
- [ ] 9. Notificações — toast em tempo real via SSE/polling
- [ ] 10. Segurança frontend — sanitização, CSRF, headers, renovação de token
- [ ] 11. Integração final com o backend — validação end-to-end de todos os fluxos
- [ ] 12. Testes — unitários, integração e E2E
- [ ] 13. README final
