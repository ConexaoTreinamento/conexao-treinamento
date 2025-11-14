# Documentação da API

Documentação completa da API REST do backend Conexão Treinamento.

## 📚 Índice

- [Acesso à Documentação](#acesso-à-documentação)
- [Especificação OpenAPI](#especificação-openapi)
- [Autenticação](#autenticação)
- [Endpoints Principais](#endpoints-principais)
- [Como Usar](#como-usar)

## 🌐 Acesso à Documentação

Após iniciar o backend, a documentação interativa estará disponível em:

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/v3/api-docs
- **OpenAPI YAML**: `API/openapi.yml` (especificação completa em formato YAML)

## 📄 Especificação OpenAPI

### Localização

A especificação OpenAPI completa está armazenada em:

```
backend/API/openapi.yml
```

### Características

- **Versão**: OpenAPI 3.1.0
- **Formato**: YAML (mais legível que JSON)
- **Tamanho**: ~82KB
- **Conteúdo**: Todos os endpoints, schemas de dados e configurações de segurança

### Atualizar a Especificação

Para atualizar o arquivo `API/openapi.yml`:

#### Método 1: Via curl (quando o servidor está rodando)
```bash
curl -s http://localhost:8080/v3/api-docs | python3 -c "import json, sys, yaml; print(yaml.dump(json.load(sys.stdin), default_flow_style=False, sort_keys=False, allow_unicode=True, width=120))" > API/openapi.yml
```

#### Método 2: Via Maven plugin
```bash
./mvnw springdoc:generate
```

#### Método 3: Baixar JSON e converter manualmente
```bash
curl -s http://localhost:8080/v3/api-docs -o openapi.json
python3 -c "import json, yaml; f=open('openapi.json'); data=json.load(f); f.close(); yf=open('API/openapi.yml','w'); yaml.dump(data, yf, default_flow_style=False, sort_keys=False, allow_unicode=True); yf.close()"
rm openapi.json
```

## 🔐 Autenticação

A maioria dos endpoints requer autenticação JWT Bearer Token.

### Como autenticar no Swagger UI

1. Acesse http://localhost:8080/swagger-ui.html
2. Use o endpoint `/auth/login` para fazer login:
   - **POST** `/auth/login`
   - Body: `{ "email": "usuario@example.com", "password": "senha123" }`
3. Copie o token JWT retornado no campo `token`
4. Clique no botão **"Authorize"** no topo do Swagger UI
5. Cole o token no campo "Value" no formato: `Bearer <seu-token>`
6. Clique em **"Authorize"**

Agora você pode testar os endpoints protegidos diretamente no Swagger UI.

### Usar autenticação em requisições

```bash
curl -X GET http://localhost:8080/students \
  -H "Authorization: Bearer <seu-token-jwt>"
```

## 🎯 Endpoints Principais

### Autenticação
- `POST /auth/login` - Fazer login e obter token JWT
- `POST /auth/logout` - Fazer logout

### Alunos (Students)
- `GET /students` - Listar alunos com filtros e paginação
- `POST /students` - Criar novo aluno
- `GET /students/{id}` - Buscar aluno por ID
- `PUT /students/{id}` - Atualizar aluno
- `DELETE /students/{id}` - Deletar aluno (soft delete)
- `PATCH /students/{id}/restore` - Restaurar aluno deletado

### Treinadores (Trainers)
- `GET /trainers` - Listar treinadores
- `POST /trainers` - Criar novo treinador
- `GET /trainers/{id}` - Buscar treinador por ID
- `PUT /trainers/{id}` - Atualizar treinador
- `DELETE /trainers/{id}` - Deletar treinador (soft delete)
- `PATCH /trainers/{id}/reset-password` - Redefinir senha do treinador

### Administradores
- `GET /administrators` - Listar administradores
- `POST /administrators` - Criar novo administrador
- `GET /administrators/{id}` - Buscar administrador por ID
- `PUT /administrators/{id}` - Atualizar administrador
- `DELETE /administrators/{id}` - Deletar administrador (soft delete)
- `PATCH /administrators/{id}/restore` - Restaurar administrador

### Exercícios (Exercises)
- `GET /exercises` - Listar exercícios com busca e paginação
- `POST /exercises` - Criar novo exercício
- `GET /exercises/{id}` - Buscar exercício por ID
- `PUT /exercises/{id}` - Atualizar exercício
- `PATCH /exercises/{id}` - Atualizar parcialmente exercício
- `DELETE /exercises/{id}` - Deletar exercício (soft delete)
- `PATCH /exercises/{id}/restore` - Restaurar exercício

### Eventos (Events)
- `GET /events` - Listar eventos
- `POST /events` - Criar novo evento
- `GET /events/{id}` - Buscar evento por ID
- `PUT /events/{id}` - Atualizar evento
- `PATCH /events/{id}` - Atualizar parcialmente evento
- `DELETE /events/{id}` - Deletar evento (soft delete)
- `PATCH /events/{id}/restore` - Restaurar evento
- `POST /events/{id}/participants/{studentId}` - Adicionar participante ao evento
- `DELETE /events/{id}/participants/{studentId}` - Remover participante do evento
- `PATCH /events/{id}/participants/{studentId}/attendance` - Alternar presença do participante

### Agendamentos (Schedule)
- `GET /schedule` - Obter agendamento por período
- `GET /schedule/sessions/{sessionId}` - Obter sessão específica
- `POST /schedule/sessions/{sessionId}` - Atualizar sessão
- `POST /schedule/sessions/one-off` - Criar sessão única
- `POST /schedule/sessions/{sessionId}/cancel` - Cancelar ou restaurar sessão

### Planos de Treinamento (Student Plans)
- `GET /plans` - Listar todos os planos
- `POST /plans` - Criar novo plano
- `GET /plans/{planId}` - Buscar plano por ID
- `DELETE /plans/{planId}` - Deletar plano
- `POST /plans/students/{studentId}/assign` - Atribuir plano a aluno
- `GET /plans/students/{studentId}/current` - Obter plano atual do aluno
- `GET /plans/students/{studentId}/history` - Obter histórico de planos do aluno

### Avaliações Físicas (Physical Evaluations)
- `GET /students/{studentId}/evaluations` - Listar avaliações do aluno
- `POST /students/{studentId}/evaluations` - Criar nova avaliação
- `GET /students/{studentId}/evaluations/{evaluationId}` - Buscar avaliação por ID
- `PUT /students/{studentId}/evaluations/{evaluationId}` - Atualizar avaliação
- `DELETE /students/{studentId}/evaluations/{evaluationId}` - Deletar avaliação

### Compromissos (Student Commitments)
- `GET /commitments/students/{studentId}` - Obter compromissos do aluno
- `POST /commitments/students/{studentId}/sessions/{sessionSeriesId}` - Atualizar compromisso
- `POST /commitments/students/{studentId}/bulk` - Atualizar múltiplos compromissos
- `GET /commitments/available-sessions` - Obter sessões disponíveis

### Relatórios (Reports)
- `GET /reports` - Gerar relatórios completos
  - Parâmetros: `startDate`, `endDate`, `trainerId` (opcional)
  - Retorna: Relatório de treinadores e distribuição de idade dos alunos

## 🛠️ Como Usar

### Gerar Clientes de API

A especificação OpenAPI pode ser usada para gerar clientes em diferentes linguagens:

#### TypeScript/JavaScript
```bash
# Usando openapi-typescript
npx openapi-typescript http://localhost:8080/v3/api-docs -o api-types.ts

# Usando @hey-api/openapi-ts (já configurado no frontend)
cd web
pnpm openapi-ts
```

#### Python
```bash
# Usando openapi-generator
openapi-generator-cli generate \
  -i API/openapi.yml \
  -g python \
  -o python-client/
```

#### Java
```bash
openapi-generator-cli generate \
  -i API/openapi.yml \
  -g java \
  -o java-client/
```

### Validar Requests/Responses

A especificação pode ser usada para validar requisições e respostas da API em testes automatizados.

### Importar em Ferramentas

#### Postman
1. Abra o Postman
2. Clique em "Import"
3. Selecione "Link" ou "File"
4. Use `http://localhost:8080/v3/api-docs` ou `API/openapi.yml`

#### Insomnia
1. Abra o Insomnia
2. Clique em "Application" > "Preferences" > "Data"
3. Use "Import" e selecione o arquivo `API/openapi.yml`

## 📋 Estrutura da Especificação

A especificação OpenAPI contém:

- **openapi**: Versão da especificação (3.1.0)
- **info**: Informações sobre a API (título, versão)
- **servers**: URLs dos servidores disponíveis
- **paths**: Todos os endpoints da API com métodos HTTP, parâmetros e respostas
- **components**: 
  - **schemas**: Modelos de dados (DTOs, entidades)
  - **securitySchemes**: Esquemas de segurança (JWT Bearer)

## 🔧 Configuração

A configuração do OpenAPI está em:

```
src/main/java/org/conexaotreinamento/conexaotreinamentobackend/config/OpenApiConfig.java
```

Principais configurações:
- **Segurança**: Bearer JWT Token
- **Título**: "My API"
- **Versão**: "v1"

## 📝 Notas Importantes

- A especificação é gerada automaticamente pelo SpringDoc a partir das anotações nos controllers
- Mantenha o arquivo `API/openapi.yml` sincronizado com a API em produção
- Use a especificação para documentação externa, geração de clientes e testes de contrato
- Todos os endpoints (exceto `/auth/login`) requerem autenticação JWT

## 🔗 Links Úteis

- [Documentação SpringDoc OpenAPI](https://springdoc.org/)
- [Especificação OpenAPI 3.1.0](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)

