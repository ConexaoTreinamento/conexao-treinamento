# 🎨 Frontend Documentation - Conexão Treinamento

> Documentação completa do frontend (Next.js + React)

---

## 📚 Índice

### 🚀 Getting Started
- **[Quick Start](../../docs/getting-started/quick-start.md)** - Comece aqui
- **[Installation](../../docs/getting-started/installation.md)** - Instalação detalhada
- **[Development Workflow](guides/development.md)** - Fluxo de desenvolvimento

### 🏗️ Architecture
- **[Overview](architecture/overview.md)** - Arquitetura geral
- **[Routing](architecture/routing.md)** - Next.js App Router
- **[State Management](architecture/state-management.md)** - TanStack Query
- **[Authentication](architecture/authentication.md)** - JWT + Middleware

### 🎨 Components
- **[Overview](components/overview.md)** - Estrutura de componentes
- **[UI Library](components/ui-library.md)** - shadcn/ui
- **[Base Components](components/base-components.md)** - Componentes reutilizáveis
- **[Forms](components/forms.md)** - React Hook Form + Zod

### 🎯 Domains (Por Domínio)
- **[Students](domains/students/overview.md)** - Alunos
- **[Trainers](domains/trainers/overview.md)** - Professores
- **[Administrators](domains/administrators/overview.md)** - Administradores
- **[Exercises](domains/exercises/overview.md)** - Exercícios
- **[Events](domains/events/overview.md)** - Eventos
- **[Schedules](domains/schedules/overview.md)** - Agendamento
- **[Plans](domains/plans/overview.md)** - Planos

### 🛠️ Guides
- **[Testing](guides/testing.md)** - Como testar
- **[Styling](guides/styling.md)** - Tailwind CSS
- **[API Integration](guides/api-integration.md)** - Chamadas de API
- **[Error Handling](guides/error-handling.md)** - Tratamento de erros

---

## 🔗 Quick Links

| Recurso | URL |
|---------|-----|
| **App** | http://localhost:3000 |
| **API Backend** | http://localhost:8080 |
| **Swagger UI** | http://localhost:8080/swagger-ui.html |

---

## 🛠️ Tech Stack

### Core
- **Next.js** 15.2.4 (App Router)
- **React** 19
- **TypeScript** 5.x

### State & Data
- **TanStack Query** 5.84 (React Query)
- **@hey-api/openapi-ts** (API client generation)
- **Zod** (schema validation)

### UI & Styling
- **Tailwind CSS** 3.4
- **shadcn/ui** (Radix UI components)
- **Lucide React** (icons)
- **next-themes** (dark mode)

### Forms
- **React Hook Form** 7.54
- **Zod** schemas
- **@hookform/resolvers**

---

## 📁 Project Structure

```
web/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes
│   │   └── page.tsx       # Login
│   ├── dashboard/         # Dashboard
│   ├── students/          # Students pages
│   │   ├── page.tsx       # List
│   │   └── [id]/          # Detail pages
│   ├── layout.tsx         # Root layout
│   └── providers.tsx      # React providers
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── base/             # Reusable components
│   ├── students/         # Student components
│   ├── trainers/         # Trainer components
│   └── ...
├── lib/                   # Utilities & hooks
│   ├── api-client/       # Generated API client
│   ├── auth/             # Auth utilities
│   ├── students/         # Student hooks & utils
│   ├── trainers/         # Trainer hooks & utils
│   └── ...
├── middleware.ts          # Next.js middleware (auth)
└── package.json
```

---

## 🎯 Key Features

### 1. App Router (Next.js 15)
```tsx
// app/students/page.tsx
export default function StudentsPage() {
  return <StudentsPageView />
}

// Automatic routing
// /students → app/students/page.tsx
// /students/123 → app/students/[id]/page.tsx
```

### 2. TanStack Query (React Query)
```tsx
// Automatic caching, refetching, and state management
const { data, isLoading } = useStudents({
  page: 0,
  pageSize: 20,
  search: "John"
})
```

### 3. API Client Generation
```bash
# Generates TypeScript client from OpenAPI spec
npm run generate-api-client

# Creates:
# - lib/api-client/types.gen.ts
# - lib/api-client/@tanstack/react-query.gen.ts
```

### 4. Edge Middleware Auth
```tsx
// middleware.ts - Runs on edge before rendering
export function middleware(request: NextRequest) {
  // Verify JWT token
  // Redirect to login if unauthorized
}
```

### 5. shadcn/ui Components
```tsx
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

<Button variant="default">Click me</Button>
<Card>Content</Card>
```

---

## 🔒 Authentication Flow

```
1. User enters credentials
   ↓
2. POST /auth/login
   ↓
3. Receive JWT token
   ↓
4. Save in localStorage + cookie
   ↓
5. Middleware verifies token on each route
   ↓
6. Interceptor injects token in API calls
```

**[Guia completo de autenticação →](architecture/authentication.md)**

---

## 📊 Data Flow

```
Component
  ↓
TanStack Query Hook (useStudents)
  ↓
Generated API Client (@hey-api)
  ↓
Auth Interceptor (JWT injection)
  ↓
Backend API
  ↓
Response → Cache → Component Update
```

---

## 🎨 Component Pattern

### Page Component
```tsx
// app/students/page.tsx
export default function StudentsPage() {
  return <StudentsPageView />
}
```

### Page View Component
```tsx
// components/students/students-page-view.tsx
"use client"

export function StudentsPageView() {
  const { data, isLoading } = useStudents()
  
  return (
    <Layout>
      <PageHeader title="Alunos" />
      <StudentsList students={data} />
    </Layout>
  )
}
```

### Domain Hook
```tsx
// lib/students/hooks/student-queries.ts
export const useStudents = (params) => {
  return useQuery({
    ...findAllStudentsOptions({ client: apiClient, query: params }),
    staleTime: 1000 * 60 * 5, // 5 min cache
  })
}
```

**[Guia completo de componentes →](components/overview.md)**

---

## 🧪 Development

### Run Dev Server
```bash
npm run dev
# http://localhost:3000
```

### Type Check
```bash
npm run type-check
```

### Lint
```bash
npm run lint
```

### Build
```bash
npm run build
npm start
```

### Generate API Client
```bash
# Backend must be running on localhost:8080
npm run generate-api-client
```

---

## 🎯 Example: Creating a New Domain

### 1. Create Page
```tsx
// app/my-domain/page.tsx
export default function MyDomainPage() {
  return <MyDomainPageView />
}
```

### 2. Create Page View Component
```tsx
// components/my-domain/my-domain-page-view.tsx
"use client"

export function MyDomainPageView() {
  const { data, isLoading } = useMyDomain()
  
  if (isLoading) return <LoadingState />
  
  return (
    <Layout>
      <PageHeader title="My Domain" />
      <MyDomainList items={data} />
    </Layout>
  )
}
```

### 3. Create Hooks
```tsx
// lib/my-domain/hooks/my-domain-queries.ts
import { useQuery } from "@tanstack/react-query"
import { findAllMyDomainOptions } from "@/lib/api-client/@tanstack/react-query.gen"
import { apiClient } from "@/lib/client"

export const useMyDomain = () => {
  return useQuery({
    ...findAllMyDomainOptions({ client: apiClient }),
    staleTime: 1000 * 60 * 5,
  })
}
```

**[Guia completo →](guides/creating-new-domain.md)**

---

## 🐛 Error Handling

### Centralized Error Handler
```tsx
// lib/error-utils.ts
export function handleHttpError(error: unknown, context: string) {
  const normalized = normalizeError(error)
  
  // Shows user-friendly toast based on error code
  if (normalized.errorCode === 'RESOURCE_NOT_FOUND') {
    toast({ title: "Não encontrado", ... })
  }
  
  // Logs traceId for 500 errors
  if (normalized.traceId) {
    console.error(`TraceId: ${normalized.traceId}`)
  }
}
```

**[Guia completo de erros →](guides/error-handling.md)**

---

## 📦 Key Dependencies

```json
{
  "dependencies": {
    "next": "15.2.4",
    "react": "^19",
    "@tanstack/react-query": "^5.84.1",
    "@hey-api/openapi-ts": "0.80.5",
    "react-hook-form": "^7.54.1",
    "zod": "^3.24.1",
    "tailwindcss": "^3.4.17"
  }
}
```

---

## 🚀 Próximos Passos

1. **[Entenda a arquitetura](architecture/overview.md)**
2. **[Explore um domínio específico](domains/students/overview.md)**
3. **[Aprenda sobre componentes](components/overview.md)**
4. **[Contribua com o projeto](../../docs/contributing/code-standards.md)**

---

**Documentação Frontend - Conexão Treinamento** 🎨

