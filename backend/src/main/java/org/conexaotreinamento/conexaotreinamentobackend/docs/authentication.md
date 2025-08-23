# Fluxo de Autenticação - ConexaoTreinamento

## Visão Geral

Este documento descreve o fluxo completo de autenticação do sistema ConexaoTreinamento, desde o login até o acesso a recursos protegidos.

## Fluxo Passo a Passo

## Fluxo Passo a Passo

### 1. **Processo de Login**

#### Passo 1.1: Requisição de Login
**Cliente → AuthController**

```http
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Validações Aplicadas**:
- Email obrigatório e formato válido
- Senha obrigatória
- Tamanho máximo do email: 120 caracteres

#### Passo 1.2: Validação de Credenciais
**AuthController → AuthenticationManager**

```java
Authentication authentication = authenticationManager.authenticate(
    new UsernamePasswordAuthenticationToken(
        loginRequest.email(), 
        loginRequest.password()
    )
);
```

**Processo Interno**:
1. `DaoAuthenticationProvider` é acionado
2. `UserDetailsServiceImpl.loadUserByUsername()` busca usuário no banco
3. `BCryptPasswordEncoder` compara senhas
4. Se válido, cria objeto `Authentication`

#### Passo 1.3: Busca do Usuário
**UserDetailsServiceImpl → Database**

```sql
SELECT id, email, password, role, created_at, updated_at, deleted_at 
FROM users 
WHERE email = ? AND deleted_at IS NULL;
```

**Resultado**: Objeto `User` convertido para `UserDetailsImpl`

#### Passo 1.4: Geração do Token JWT
**AuthController → JwtService**

```java
String token = jwtService.generateToken(authentication);
```

**Processo de Geração**:
1. Extrai `UserDetailsImpl` da autenticação
2. Define claims do token:
   ```json
   {
     "iss": "conexao-treinamento",
     "sub": "usuario@exemplo.com",
     "userId": "uuid-do-usuario",
     "role": "ROLE_TRAINER",
     "iat": 1640995200,
     "exp": 1641081600
   }
   ```
3. Assina token com HS256 e chave secreta
4. Retorna token JWT completo

#### Passo 1.5: Resposta de Sucesso
**AuthController → Cliente**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "uuid-do-usuario",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. **Acesso a Recursos Protegidos**

#### Passo 2.1: Requisição com Token
**Cliente → API Endpoint**

```http
GET /api/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Passo 2.2: Interceptação pelo Filtro
**JwtAuthenticationFilter.doFilterInternal()**

```java
// 1. Extrai token do header Authorization
String token = extractJwtFromRequest(request);

// 2. Valida token
if (StringUtils.hasText(token) && jwtService.isTokenValid(token)) {
    // 3. Extrai username do token
    String username = jwtService.extractUsername(token);
    
    // 4. Carrega detalhes do usuário
    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
    
    // 5. Cria autenticação
    var auth = new UsernamePasswordAuthenticationToken(
        userDetails, null, userDetails.getAuthorities()
    );
    
    // 6. Define no contexto de segurança
    SecurityContextHolder.getContext().setAuthentication(auth);
}
```

#### Passo 2.3: Validação do Token
**JwtService.isTokenValid()**

```java
public boolean isTokenValid(String token) {
    try {
        jwtDecoder.decode(token); // Valida assinatura e expiração
        return true;
    } catch (JwtException e) {
        return false;
    }
}
```

**Verificações Realizadas**:
- ✅ Assinatura válida (HS256)
- ✅ Token não expirado
- ✅ Formato correto
- ✅ Issuer correto

#### Passo 2.4: Carregamento do Usuário
**UserDetailsServiceImpl → Database**

```sql
SELECT id, email, password, role, created_at, updated_at, deleted_at 
FROM users 
WHERE email = ? AND deleted_at IS NULL;
```

#### Passo 2.5: Autorização
**Spring Security Authorization**

Atualmente configurado como:
```java
.authorizeHttpRequests(authorize -> authorize
    .anyRequest().permitAll() // ⚠️ Trocar ao longo das sprints pois está muito permissivo.
)
```

**Recomendação**:
```java
.authorizeHttpRequests(authorize -> authorize
    .requestMatchers("/auth/login").permitAll()
    .requestMatchers("/admin/**").hasRole("ADMIN")
    .anyRequest().authenticated()
)
```

#### Passo 2.6: Execução do Endpoint
**Controller → Service → Repository**

Com usuário autenticado, o endpoint é executado normalmente.

### 3. **Tratamento de Erros**

#### 3.1: Credenciais Inválidas
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "message": "Credenciais inválidas"
}
```

#### 3.2: Token Inválido/Expirado
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "error": "Unauthorized",
  "message": "You may login and try again!"
}
```

#### 3.3: Usuário Não Encontrado
```http
HTTP/1.1 401 Unauthorized
Content-Type: text/plain

User not found with username: usuario@exemplo.com
```

### 4. **Logout**

#### Passo 4.1: Requisição de Logout
```http
POST /auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Passo 4.2: Limpeza do Contexto
```java
SecurityContextHolder.clearContext();
```

**⚠️ Limitação Atual**: O token continua válido até expirar (24h)

**Recomendação**: Implementar blacklist de tokens para logout real

### 5. **Refresh Token (Implementado mas não usado)**

```java
public String generateRefreshToken(Authentication authentication) {
    // Token com expiração de 7 dias
    // Claim "type": "refresh" para diferenciação
}
```

## Configurações Importantes

### Tempo de Expiração
- **Access Token**: 24 horas (configurável)
- **Refresh Token**: 7 dias

### Algoritmo de Assinatura
- **HS256** (HMAC SHA-256)
- Chave simétrica compartilhada

### Armazenamento de Senhas
- **BCrypt** com salt automático

## Checklist de Segurança

### ✅ Implementado
- [x] Autenticação JWT
- [x] Hash de senhas com BCrypt
- [x] Validação de entrada
- [x] Tratamento de erros
- [x] Stateless authentication
- [x] Role-based access (estrutura)

### ⚠️ Podemos Melhorar
- [ ] Configuração de autorização adequada // Definir endpoints públicos e privados
- [ ] Chave JWT segura para produção
- [ ] Rate limiting para login
- [ ] CORS configuration
- [ ] Blacklist de tokens para logout
- [ ] Logs de auditoria

### 🔄 Opcional
- [ ] Refresh token rotation
- [ ] Multi-factor authentication
- [ ] Session management
- [ ] Password policies
- [ ] Account lockout