# Documentação de Segurança - ConexaoTreinamento

## Visão Geral

O sistema ConexaoTreinamento implementa uma arquitetura de segurança moderna baseada em JWT (JSON Web Tokens) com Spring Security 6, fornecendo autenticação stateless e autorização baseada em roles.

## Componentes de Segurança

### 1. **Configuração Principal (SecurityConfig)**

**Localização**: `config/SecurityConfig.java`

**Responsabilidades**:
- Configuração do Spring Security
- Definição de beans de segurança
- Configuração de filtros JWT
- Configuração de autenticação OAuth2

**Características**:
- **Algoritmo JWT**: HS256 (HMAC SHA-256)
- **Sessões**: Stateless (STATELESS)
- **CSRF**: Desabilitado (adequado para APIs REST)
- **Encoder de Senha**: BCrypt

### 2. **Serviço JWT (JwtService)**

**Localização**: `config/security/jwt/JwtService.java`

**Funcionalidades**:
- **Geração de Tokens**: Cria tokens JWT com claims personalizados
- **Validação**: Verifica integridade e expiração dos tokens
- **Extração de Dados**: Obtém informações do usuário do token
- **Refresh Tokens**: Suporte a tokens de renovação (7 dias)

**Claims Incluídos**:
- `iss` (issuer): "conexao-treinamento"
- `sub` (subject): Email do usuário
- `userId`: ID único do usuário
- `role`: Role do usuário (ROLE_ADMIN, ROLE_TRAINER)
- `iat` (issued at): Data de emissão
- `exp` (expiration): Data de expiração

### 3. **Filtro de Autenticação (JwtAuthenticationFilter)**

**Localização**: `config/security/jwt/JwtAuthenticationFilter.java`

**Processo**:
1. Extrai token do header `Authorization: Bearer <token>`
2. Valida o token usando JwtService
3. Carrega detalhes do usuário via UserDetailsService
4. Define autenticação no SecurityContext
5. Trata erros apenas para URLs protegidas

**URLs Protegidas**:
- `/api/*` - Endpoints da API
- `/auth/*` - Endpoints de autenticação

### 4. **Detalhes do Usuário (UserDetailsImpl)**

**Localização**: `config/security/user/UserDetailsImpl.java`

**Implementa**: `UserDetails` do Spring Security

**Características**:
- Usa email como username
- Suporte a roles simples
- Contas sempre ativas e não expiradas

### 5. **Serviço de Detalhes (UserDetailsServiceImpl)**

**Localização**: `config/security/user/UserDetailsServiceImpl.java`

**Função**: Carrega usuários do banco de dados por email

### 6. **Ponto de Entrada de Autenticação (JwtAuthEntryPoint)**

**Localização**: `config/security/jwt/JwtAuthEntryPoint.java`

**Função**: Trata tentativas de acesso não autorizadas

**Resposta**:
```json
{
  "error": "Unauthorized",
  "message": "You may login and try again!"
}
```

## Fluxo de Autenticação

### Login
1. Cliente envia `POST /auth/login` com email/senha
2. AuthenticationManager valida credenciais
3. JwtService gera token JWT
4. Retorna token e ID do usuário

### Acesso a Recursos Protegidos
1. Cliente inclui token no header: `Authorization: Bearer <token>`
2. JwtAuthenticationFilter intercepta requisição
3. Token é validado e usuário autenticado
4. Acesso liberado se autorizado

## Autorização

### Roles Disponíveis
- **ROLE_ADMIN**: Administrador do sistema
- **ROLE_TRAINER**: Treinador/Professor

### Configuração Atual
- **Permissão Total**: `.anyRequest().permitAll()`
- **Method Security**: Habilitada com `@EnableMethodSecurity`

## Configurações de Segurança

### Variáveis de Ambiente
```properties
# Chave secreta JWT (deve ser forte em produção)
JWT_SECRET=mySecretKeyForJWTTokenGeneration123456789

# Tempo de expiração em horas
JWT_EXPIRATION_HOURS=24
```

### Configurações de Banco
- **Senhas**: Hash BCrypt
- **Usuários**: Tabela `users` com roles

## Pontos Fortes

✅ **Arquitetura Moderna**: Uso do Spring Security 6 com OAuth2
✅ **Stateless**: Não depende de sessões do servidor
✅ **Flexível**: Suporte a múltiplas roles
✅ **Seguro**: BCrypt para senhas, JWT assinado
✅ **Tratamento de Erros**: Respostas adequadas para falhas

## Recomendações de Melhoria

### Críticas (Alta Prioridade) - Modificar ao criar endpoints novos baseado na regra de negócio.
1. **Configurar Autorização Adequada**:
   ```java
   .authorizeHttpRequests(authorize -> authorize
       .requestMatchers("/auth/login", "/auth/register").permitAll()
       .requestMatchers("/admin/**").hasRole("ADMIN")
       .anyRequest().authenticated())
   ```

2. **Chave JWT Segura**:
   - Usar chave de pelo menos 256 bits
   - Gerar chave aleatória para produção
   - Considerar rotação de chaves

### Importantes (Média Prioridade)
3. **Configuração CORS**:
   ```java
   @Bean
   public CorsConfigurationSource corsConfigurationSource() {
       // Configurar CORS adequadamente
   }
   ```

4. **Rate Limiting**: Implementar limitação de tentativas de login

5. **Logs de Segurança**: Remover logs de debug em produção

### Opcionais (Baixa Prioridade)
6. **Refresh Token**: Implementar rotação automática
7. **Blacklist de Tokens**: Para logout real
8. **Auditoria**: Log de eventos de segurança

## Conformidade e Padrões

- ✅ **OWASP**: Segue práticas básicas de segurança
- ✅ **JWT RFC 7519**: Implementação correta
- ✅ **Spring Security**: Uso adequado do framework
- ⚠️ **Princípio do Menor Privilégio**: Precisa ajustar autorizações

## Monitoramento

### Logs Disponíveis
- Spring Security DEBUG
- OAuth2 DEBUG
- Tentativas de autenticação

### Métricas Recomendadas
- Taxa de sucesso/falha de login
- Tokens expirados
- Tentativas de acesso não autorizado