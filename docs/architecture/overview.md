# 🏗️ Architecture Overview - Conexão Treinamento

> Visão geral da arquitetura do sistema

---

## 🎨 System Architecture Diagram

![System Architecture](system-architecture.svg)

---

## 📊 High-Level Architecture (ASCII)

```
┌───────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                          │
│                                                            │
│         Next.js 15 (React 19) + TypeScript                │
│    TanStack Query + shadcn/ui + Tailwind CSS             │
│                                                            │
│  Edge Middleware (Auth) → Pages → Components → Hooks      │
└────────────────────┬──────────────────────────────────────┘
                     │
                     │ HTTPS / REST API (JSON)
                     │ JWT Authentication
                     │
┌────────────────────┴──────────────────────────────────────┐
│                    BACKEND LAYER                           │
│                                                            │
│              Spring Boot 3.2 (Java 21)                    │
│      Spring Security + Spring Data JPA + Hibernate       │
│                                                            │
│  Controllers → Services → Mappers → Repositories          │
│                    ↓ Validators ↓                          │
└────────────────────┬──────────────────────────────────────┘
                     │
                     │ JDBC (Connection Pool)
                     │ Flyway Migrations
                     │
┌────────────────────┴──────────────────────────────────────┐
│                   PERSISTENCE LAYER                        │
│                                                            │
│                  PostgreSQL 16                            │
│            Soft Deletes + Audit Fields                    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Design Principles

### 1. **Separation of Concerns**
Cada camada tem responsabilidades bem definidas:
- **Frontend**: Apresentação e UX
- **Backend**: Lógica de negócio e dados
- **Database**: Persistência

### 2. **Domain-Driven Design**
Organização por domínios de negócio:
- Students, Trainers, Administrators
- Exercises, Events, Schedules
- Plans, Evaluations

### 3. **RESTful API**
- Verbos HTTP semânticos (GET, POST, PUT, DELETE)
- Recursos bem definidos (`/students`, `/trainers`)
- Status codes apropriados (200, 201, 404, etc.)

### 4. **Single Responsibility Principle**
- Controllers: Apenas HTTP handling
- Services: Lógica de negócio
- Repositories: Acesso a dados
- Mappers: Conversão DTO ↔ Entity

### 5. **Security First**
- JWT Authentication
- Role-based Access Control
- Password hashing (BCrypt)
- SQL Injection prevention
- XSS protection

---

## 🏛️ Backend Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    REST Controllers                      │
│  @RestController + OpenAPI annotations                  │
│  - HTTP handling                                        │
│  - Request validation                                   │
│  - Response formatting                                  │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────────┐
│                      Services                           │
│  @Service + Business logic                              │
│  - Business rules                                       │
│  - Orchestration                                        │
│  - Transaction management                               │
└─────────────┬───────────┬──────────────────────────────┘
              │           │
    ┌─────────┴───┐  ┌───┴──────────┐
    │   Mappers   │  │  Validators  │
    │  DTO ↔ Entity │  │ Business rules│
    └─────────┬───┘  └───┬──────────┘
              │           │
┌─────────────┴───────────┴──────────────────────────────┐
│                    Repositories                         │
│  @Repository + Spring Data JPA                         │
│  - CRUD operations                                      │
│  - Custom queries                                       │
│  - Transaction handling                                 │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────────┐
│                    Database                             │
│  PostgreSQL + Flyway migrations                         │
│  - Schema management                                    │
│  - Data persistence                                     │
│  - Constraints and indexes                              │
└─────────────────────────────────────────────────────────┘
```

### Key Patterns

#### 1. **Controller-Service-Repository**
```java
// Controller: HTTP handling
@RestController
@RequestMapping("/students")
public class StudentController {
    @PostMapping
    public ResponseEntity<StudentResponseDTO> create(@Valid @RequestBody StudentRequestDTO request) {
        return ResponseEntity.created(location).body(studentService.create(request));
    }
}

// Service: Business logic
@Service
public class StudentService {
    public StudentResponseDTO create(StudentRequestDTO request) {
        validateBusinessRules(request);
        Student entity = studentMapper.toEntity(request);
        Student saved = studentRepository.save(entity);
        return studentMapper.toResponse(saved);
    }
}

// Repository: Data access
@Repository
public interface StudentRepository extends JpaRepository<Student, UUID> {
    List<Student> findByDeletedAtIsNull();
}
```

#### 2. **Mapper Pattern**
```java
@Component
public class StudentMapper {
    public StudentResponseDTO toResponse(Student entity) { /* ... */ }
    public Student toEntity(StudentRequestDTO dto) { /* ... */ }
    public void updateEntity(StudentRequestDTO dto, Student entity) { /* ... */ }
}
```

#### 3. **Validation Service Pattern**
```java
@Component
public class StudentValidationService {
    public void validateEmailUniqueness(String email, UUID excludeId) { /* ... */ }
    public void validateAgeRange(Integer minAge, Integer maxAge) { /* ... */ }
}
```

**[Ver todos os padrões →](../../backend/docs/architecture/patterns.md)**

---

## 🎨 Frontend Architecture

### Component-Based Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js App Router                    │
│  app/students/page.tsx                                  │
│  - Routing                                              │
│  - Layouts                                              │
│  - Server/Client components                             │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────────┐
│                   Page View Components                   │
│  "use client" components                                │
│  - State management                                     │
│  - Data fetching                                        │
│  - Event handling                                       │
└─────────────┬───────────┬──────────────────────────────┘
              │           │
    ┌─────────┴───┐  ┌───┴──────────┐
    │  Hooks      │  │  Services    │
    │ (TanStack)  │  │  (API calls) │
    └─────────┬───┘  └───┬──────────┘
              │           │
┌─────────────┴───────────┴──────────────────────────────┐
│                   API Client Layer                      │
│  Generated from OpenAPI (@hey-api)                      │
│  - Type-safe API calls                                  │
│  - TanStack Query integration                           │
│  - Automatic TypeScript types                           │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────────┐
│                   Backend REST API                       │
└─────────────────────────────────────────────────────────┘
```

### Key Patterns

#### 1. **Page → PageView → Components**
```tsx
// app/students/page.tsx (Server Component)
export default function StudentsPage() {
  return <StudentsPageView />
}

// components/students/students-page-view.tsx (Client Component)
"use client"
export function StudentsPageView() {
  const { data, isLoading } = useStudents()
  return <StudentsList students={data} />
}
```

#### 2. **Custom Hooks (TanStack Query)**
```tsx
// lib/students/hooks/student-queries.ts
export const useStudents = (params) => {
  return useQuery({
    ...findAllStudentsOptions({ client: apiClient, query: params }),
    staleTime: 1000 * 60 * 5, // 5 min cache
  })
}
```

#### 3. **API Client Generation**
```bash
# Generates from OpenAPI spec
npm run generate-api-client

# Creates:
# - types.gen.ts (TypeScript types)
# - @tanstack/react-query.gen.ts (React Query hooks)
```

**[Ver arquitetura frontend completa →](../../web/docs/architecture/overview.md)**

---

## 🔒 Security Architecture

### Authentication Flow

```
1. User Login
   POST /auth/login { email, password }
   ↓
2. Backend validates credentials
   - BCrypt password verification
   - User exists & active
   ↓
3. Generate JWT Token
   - Include: userId, role, email
   - Sign with secret key
   - Set expiration (24h)
   ↓
4. Return token to client
   { token: "eyJhbGci..." }
   ↓
5. Client stores token
   - localStorage (for API calls)
   - Cookie (for middleware)
   ↓
6. Subsequent requests
   Authorization: Bearer eyJhbGci...
   ↓
7. Backend verifies token
   - Signature validation
   - Expiration check
   - Extract user context
   ↓
8. Process request with user context
```

### Security Layers

```
Frontend Security
├── Edge Middleware (Next.js)
│   ├── JWT validation
│   ├── Route protection
│   └── Role-based access
├── Auth Interceptor
│   ├── Token injection
│   └── Token expiration check
└── XSS Protection (React)

Backend Security
├── Spring Security Filter Chain
│   ├── CORS configuration
│   ├── JWT authentication filter
│   ├── Role-based authorization
│   └── CSRF protection (disabled for stateless API)
├── Input Validation
│   ├── Jakarta Bean Validation
│   ├── Custom validators
│   └── Request body validation
└── SQL Injection Prevention (JPA)

Database Security
├── Password hashing (BCrypt)
├── Soft deletes (data retention)
└── Audit fields (createdAt, updatedAt)
```

**[Ver guia completo de segurança →](../../backend/docs/architecture/security.md)**

---

## 📊 Data Flow

### Complete Request Flow

```
1. User Action (Frontend)
   ↓
2. Component Event Handler
   ↓
3. TanStack Query Hook
   ↓
4. Generated API Client
   ↓
5. Auth Interceptor (inject JWT)
   ↓
6. HTTP Request to Backend
   ↓
7. Next.js Edge Middleware (verify token)
   ↓
8. Backend: Spring Security Filter
   ↓
9. Backend: Controller
   ↓
10. Backend: Service (business logic)
   ↓
11. Backend: Mapper (DTO → Entity)
   ↓
12. Backend: Validator (business rules)
   ↓
13. Backend: Repository (JPA)
   ↓
14. Database Query
   ↓
15. Result: Entity
   ↓
16. Backend: Mapper (Entity → DTO)
   ↓
17. Backend: Controller (JSON response)
   ↓
18. HTTP Response
   ↓
19. Frontend: API Client (parse)
   ↓
20. TanStack Query (cache & update)
   ↓
21. Component Re-render (new data)
```

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **TanStack Query** - Server state management
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Component library (Radix UI)
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend
- **Spring Boot 3.2** - Application framework
- **Java 21** - Programming language
- **Spring Security** - Authentication & authorization
- **Spring Data JPA** - ORM abstraction
- **Hibernate** - ORM implementation
- **PostgreSQL** - Relational database
- **Flyway** - Database migrations
- **SpringDoc** - OpenAPI documentation
- **JUnit 5** - Testing framework
- **Testcontainers** - Integration testing

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Local orchestration
- **Maven** - Java build tool
- **npm** - JavaScript package manager

---

## 📈 Scalability Considerations

### Current Architecture
- Monolithic backend (Spring Boot)
- Stateless API (horizontal scalability)
- Client-side rendering (Next.js)
- Database connection pooling

### Future Improvements
- [ ] Add caching layer (Redis)
- [ ] Implement rate limiting
- [ ] Add message queue (RabbitMQ/Kafka)
- [ ] Microservices decomposition (if needed)
- [ ] CDN for static assets
- [ ] Load balancer (Nginx)

---

## 🗺️ Related Documentation

- **[Backend Architecture](../../backend/docs/architecture/patterns.md)**
- **[Frontend Architecture](../../web/docs/architecture/overview.md)**
- **[Security Guide](../../backend/docs/architecture/security.md)**
- **[Deployment Guide](../deployment/production.md)**

---

**Architecture Documentation - Conexão Treinamento** 🏗️

