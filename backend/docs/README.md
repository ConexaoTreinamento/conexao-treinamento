# 📡 Backend Documentation - Conexão Treinamento

> Documentação completa da API REST (Spring Boot)

---

## 🏗️ Arquitetura

![Backend Architecture](../../docs/architecture/system-architecture.svg)

O backend segue uma arquitetura em camadas (Layered Architecture) com padrões modernos de design. Para mais detalhes sobre os padrões implementados, consulte a [documentação de patterns](architecture/patterns.md).

---

## 📚 Índice

### 🚀 Getting Started
- **[Quick Start](../../docs/getting-started/quick-start.md)** - Comece aqui
- **[API Overview](api/overview.md)** - Visão geral da API
- **[Authentication](api/authentication.md)** - Como autenticar

### 🏗️ Architecture
- **[Overview](architecture/overview.md)** - Arquitetura geral
- **[Design Patterns](ARCHITECTURE.md)** - Padrões implementados
- **[Security](architecture/security.md)** - Segurança e autenticação

### 📖 API Reference
- **[OpenAPI Spec](../API/openapi.yml)** - Especificação OpenAPI completa
- **[Swagger UI](http://localhost:8080/swagger-ui.html)** - Documentação interativa
- **[Migration Guide](MIGRATION-GUIDE.md)** - Mudanças de versão

### 🎯 Domains (Por Domínio)
- **[Students](domains/students/overview.md)** - Alunos
- **[Trainers](domains/trainers/overview.md)** - Professores
- **[Administrators](domains/administrators/overview.md)** - Administradores
- **[Exercises](domains/exercises/overview.md)** - Exercícios
- **[Events](domains/events/overview.md)** - Eventos
- **[Schedules](domains/schedules/overview.md)** - Agendamento
- **[Plans](domains/plans/overview.md)** - Planos de treinamento
- **[Evaluations](domains/evaluations/overview.md)** - Avaliações físicas
- **[Users](domains/users/overview.md)** - Sistema de usuários


---

## 🔗 Quick Links

| Recurso | URL |
|---------|-----|
| **Swagger UI** | http://localhost:8080/swagger-ui.html |
| **OpenAPI JSON** | http://localhost:8080/v3/api-docs |
| **Health Check** | http://localhost:8080/actuator/health |
| **Metrics** | http://localhost:8080/actuator/metrics |

---

## 🎯 API Endpoints (Resumo)

### Authentication
```
POST   /auth/login     # Login (público)
POST   /auth/logout    # Logout
```

### Students
```
GET    /students             # Listar (paginado)
GET    /students/{id}        # Buscar por ID
POST   /students             # Criar
PUT    /students/{id}        # Atualizar
DELETE /students/{id}        # Soft delete
POST   /students/{id}/restore # Restaurar
```

### Trainers
```
GET    /trainers             # Listar
GET    /trainers/{id}        # Buscar por ID
POST   /trainers             # Criar
PUT    /trainers/{id}        # Atualizar
DELETE /trainers/{id}        # Soft delete
POST   /trainers/{id}/restore # Restaurar
```

### Administrators
```
GET    /administrators          # Listar
GET    /administrators/{id}     # Buscar por ID
POST   /administrators          # Criar
PUT    /administrators/{id}     # Atualizar
PATCH  /administrators/{id}     # Atualizar parcial
DELETE /administrators/{id}     # Soft delete
POST   /administrators/{id}/restore # Restaurar
```

### Exercises
```
GET    /exercises             # Listar (paginado)
GET    /exercises/{id}        # Buscar por ID
POST   /exercises             # Criar
PUT    /exercises/{id}        # Atualizar
PATCH  /exercises/{id}        # Atualizar parcial
DELETE /exercises/{id}        # Soft delete
POST   /exercises/{id}/restore # Restaurar
```

**[Ver todos os endpoints →](api/overview.md)**

---

## 🔒 Authentication

### JWT Token
```bash
# 1. Login
POST /auth/login
{
  "email": "admin@example.com",
  "password": "admin123"
}

# Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "type": "Bearer"
}

# 2. Use o token em requests subsequentes
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**[Guia completo de autenticação →](api/authentication.md)**

---

## 📊 Data Models

### Student
```json
{
  "id": "uuid",
  "name": "string",
  "surname": "string",
  "email": "string",
  "phone": "string",
  "gender": "M|F|O",
  "birthDate": "date",
  "profession": "string",
  "anamnesis": {
    "hasHeartDisease": "boolean",
    "medication": "string",
    // ...
  },
  "physicalImpairments": [...]
}
```

**[Ver todos os models →](api/models.md)**

---

## 🏗️ Architecture Patterns

### Controller-Service-Repository
```
Controller (REST API)
    ↓
Service (Business Logic)
    ↓
Repository (Data Access)
    ↓
Database (PostgreSQL)
```

### Mapper Pattern
```java
@Component
public class StudentMapper {
    public StudentResponseDTO toResponse(Student entity) { }
    public Student toEntity(StudentRequestDTO dto) { }
}
```

### Validation Service Pattern
```java
@Component
public class StudentValidationService {
    public void validateEmailUniqueness(String email) { }
    public void validateAgeRange(Integer minAge, Integer maxAge) { }
}
```

**[Ver todos os padrões →](ARCHITECTURE.md)**

---

## 🧪 Testing

```bash
# Testes unitários
./mvnw test

# Testes de integração
./mvnw verify -P integration-tests

# Cobertura de código
./mvnw verify
# Ver: target/site/jacoco/index.html
```

**[Guia completo de testes →](guides/testing.md)**

---

## 🔧 Configuration

### application.properties
```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/conexao_treinamento
spring.datasource.username=conexao
spring.datasource.password=conexao123

# JWT
jwt.secret=your-secret-key-here
jwt.expiration=86400000  # 24 hours

# Server
server.port=8080
```

**[Configuração completa →](guides/configuration.md)**

---

## 📦 Dependencies

### Core
- **Spring Boot** 3.2.1
- **Spring Security** (JWT + OAuth2)
- **Spring Data JPA** + Hibernate
- **PostgreSQL Driver** 42.7.1
- **Flyway** (migrations)

### Documentation
- **SpringDoc OpenAPI** 2.3.0
- **Swagger UI** (incluído)

### Testing
- **JUnit 5**
- **Testcontainers**
- **JaCoCo** (cobertura)
- **PIT** (mutation testing)

**[Ver pom.xml completo →](../pom.xml)**

---

## 🐛 Error Handling

### Standard Error Response
```json
{
  "status": 404,
  "message": "Student with ID abc123 not found",
  "errorCode": "RESOURCE_NOT_FOUND",
  "timestamp": "2025-11-12T17:30:00Z",
  "path": "/students/abc123"
}
```

### Validation Error Response
```json
{
  "status": 400,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "errors": {
    "email": "Email já está em uso",
    "name": "Nome é obrigatório"
  },
  "timestamp": "2025-11-12T17:30:00Z",
  "path": "/students"
}
```

**[Guia completo de erros →](guides/error-handling.md)**

---

## 📈 Monitoring

### Actuator Endpoints
```bash
# Health check
GET /actuator/health

# Metrics
GET /actuator/metrics

# Info
GET /actuator/info
```

**[Guia de monitoramento →](../../docs/deployment/monitoring.md)**

---

## 🚀 Próximos Passos

1. **[Entenda a arquitetura](architecture/overview.md)**
2. **[Explore um domínio específico](domains/students/overview.md)**
3. **[Aprenda a criar testes](guides/testing.md)**
4. **[Contribua com o projeto](../../docs/contributing/code-standards.md)**

---

**Documentação Backend - Conexão Treinamento** 📡

