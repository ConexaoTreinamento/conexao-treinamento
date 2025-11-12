# 🔒 API Authentication Guide

> Como autenticar na API do Conexão Treinamento

---

## 📋 Overview

A API utiliza **JWT (JSON Web Tokens)** para autenticação. Todos os endpoints (exceto `/auth/login`) requerem um token válido.

---

## 🚀 Quick Start

### 1. Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### 2. Receba o Token
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "expiresIn": 86400
}
```

### 3. Use o Token
```bash
curl -X GET http://localhost:8080/students \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🔑 Endpoints de Autenticação

### POST `/auth/login` (Público)

Autentica um usuário e retorna um JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDEiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE2MzI0ODc2MDAsImV4cCI6MTYzMjU3NDAwMH0.signature",
  "type": "Bearer",
  "expiresIn": 86400
}
```

**Error Responses:**

```json
// 401 Unauthorized - Credenciais inválidas
{
  "status": 401,
  "message": "Invalid credentials",
  "errorCode": "UNAUTHORIZED",
  "timestamp": "2025-11-12T17:30:00Z",
  "path": "/auth/login"
}

// 400 Bad Request - Validação falhou
{
  "status": 400,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "errors": {
    "email": "Email é obrigatório",
    "password": "Senha é obrigatória"
  },
  "timestamp": "2025-11-12T17:30:00Z",
  "path": "/auth/login"
}
```

---

### POST `/auth/logout`

Invalida o token atual (requer autenticação).

**Request:**
```bash
curl -X POST http://localhost:8080/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (204 No Content):**
```
(empty body)
```

---

## 🔐 JWT Token Structure

### Token Payload
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440001",  // User ID
  "email": "user@example.com",
  "role": "ADMIN",  // ADMIN, TRAINER
  "iat": 1632487600,  // Issued at
  "exp": 1632574000   // Expiration
}
```

### Token Expiration
- **Default:** 24 horas (86400 segundos)
- **Configurável em:** `application.properties` → `jwt.expiration`

---

## 🛡️ Authorization Header

### Format
```
Authorization: Bearer <token>
```

### Examples

**cURL:**
```bash
curl -X GET http://localhost:8080/students \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**JavaScript (fetch):**
```javascript
fetch('http://localhost:8080/students', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

**JavaScript (Axios):**
```javascript
axios.get('http://localhost:8080/students', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

**Python (requests):**
```python
headers = {'Authorization': f'Bearer {token}'}
response = requests.get('http://localhost:8080/students', headers=headers)
```

---

## 👥 Roles & Permissions

### ADMIN Role
- ✅ Acesso total a todos os endpoints
- ✅ Gerenciar administradores
- ✅ Gerenciar professores
- ✅ Gerenciar alunos
- ✅ Gerenciar exercícios, eventos, planos
- ✅ Visualizar relatórios

### TRAINER Role
- ✅ Gerenciar alunos
- ✅ Gerenciar exercícios
- ✅ Gerenciar agenda
- ✅ Gerenciar eventos
- ❌ Gerenciar administradores
- ❌ Gerenciar professores
- ❌ Visualizar relatórios

---

## 🔒 Protected Endpoints

### By Authentication (All users)
```
GET    /students
POST   /students
PUT    /students/{id}
DELETE /students/{id}
...
```

### Admin Only
```
GET    /administrators
POST   /administrators
DELETE /administrators/{id}

GET    /trainers
POST   /trainers
DELETE /trainers/{id}

GET    /reports
```

---

## 🚫 Error Responses

### 401 Unauthorized
Token ausente ou inválido:
```json
{
  "status": 401,
  "message": "Full authentication is required to access this resource",
  "errorCode": "UNAUTHORIZED",
  "timestamp": "2025-11-12T17:30:00Z",
  "path": "/students"
}
```

### 403 Forbidden
Token válido mas sem permissão:
```json
{
  "status": 403,
  "message": "Access is denied",
  "errorCode": "FORBIDDEN",
  "timestamp": "2025-11-12T17:30:00Z",
  "path": "/administrators"
}
```

### 401 Token Expired
```json
{
  "status": 401,
  "message": "JWT token has expired",
  "errorCode": "TOKEN_EXPIRED",
  "timestamp": "2025-11-12T17:30:00Z",
  "path": "/students"
}
```

---

## 🔧 Token Validation

### Backend (Spring Security)
```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) {
        // 1. Extract token from header
        String token = extractToken(request);
        
        // 2. Validate token
        if (token != null && jwtUtil.validateToken(token)) {
            // 3. Set authentication context
            Authentication auth = getAuthentication(token);
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        
        filterChain.doFilter(request, response);
    }
}
```

### Frontend (Interceptor)
```typescript
// lib/auth/interceptor.ts
export const authInterceptor: Config['auth'] = () => {
  const token = getAuthToken()
  
  if (!token) {
    return undefined
  }
  
  // Validate expiration
  if (isTokenExpired(token)) {
    clearAuthToken()
    window.location.href = '/'
    return undefined
  }
  
  return `Bearer ${token}`
}
```

---

## 🔄 Token Refresh

### Current Status
⚠️ **Refresh token não está implementado ainda**

### Planned Implementation
```bash
# Future endpoint
POST /auth/refresh
Authorization: Bearer <refresh_token>

# Response
{
  "token": "new_access_token",
  "refreshToken": "new_refresh_token",
  "expiresIn": 86400
}
```

---

## 🧪 Testing Authentication

### Postman
```
1. Create a new request
2. Set method to POST
3. Set URL: http://localhost:8080/auth/login
4. Set body (JSON):
   {
     "email": "admin@example.com",
     "password": "admin123"
   }
5. Send request
6. Copy the token from response
7. For subsequent requests:
   - Go to "Authorization" tab
   - Select "Bearer Token"
   - Paste the token
```

### Swagger UI
```
1. Open http://localhost:8080/swagger-ui.html
2. Find "auth-controller" section
3. Execute POST /auth/login with credentials
4. Copy the token from response
5. Click "Authorize" button (top right)
6. Enter: Bearer <token>
7. Click "Authorize"
8. Now you can test protected endpoints
```

---

## 📚 Related Documentation

- **[Security Architecture](../architecture/security.md)**
- **[Frontend Authentication](../../../web/docs/architecture/authentication.md)**
- **[Error Handling](../guides/error-handling.md)**

---

**Authentication Guide - Conexão Treinamento** 🔒


