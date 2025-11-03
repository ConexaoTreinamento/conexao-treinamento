# Arquitetura da API - Training Management System

## Visão Geral

A **Training Management API** é uma API RESTful desenvolvida em OpenAPI 3.1.0 que fornece endpoints para gerenciamento completo de uma academia de treinamento, incluindo alunos, instrutores, exercícios, eventos, planos de treino e agendamentos. A API segue princípios de Domain-Driven Design (DDD) e padrões RESTful estabelecidos pela indústria.

**Versão:** 1.0.0  
**Base URL:** `http://localhost:8080`  
**Autenticação:** Bearer JWT (JSON Web Token)

---

## 1. Arquitetura por Domínios

A API é organizada em **8 domínios arquiteturais** distintos, cada um representando um contexto delimitado de negócio:

### 1.1 Authentication Domain (`authentication`)
Gerencia autenticação e autorização de usuários.

**Endpoints:**
- `POST /auth/login` - Autenticação de usuário (retorna JWT)
- `POST /auth/logout` - Encerramento de sessão

**Características:**
- Endpoint de login é público (sem autenticação requerida)
- Retorna token JWT para uso em requisições subsequentes
- Schema de resposta: `JwtResponseDTO` (contém `id` e `token`)

### 1.2 Users Management Domain (`users`)
Gerenciamento de entidades de usuário do sistema.

**Endpoints:**
- `GET /users` - Listagem paginada de usuários
- `POST /users` - Criação de novo usuário
- `PATCH /users/{userId}` - Atualização parcial de usuário (principalmente role)
- `POST /users/me/change-password` - Alteração de senha do usuário autenticado

**Características:**
- Paginação obrigatória via `pageable` object
- Suporta roles: `ROLE_ADMIN`, `ROLE_TRAINER`, `ROLE_STUDENT`
- Path parameter: `{userId}` (UUID)

### 1.3 People Management Domain (`people`)
Gerenciamento de pessoas físicas do sistema: administradores, instrutores e alunos.

#### 1.3.1 Administrators (`/administrators`)
- `GET /administrators` - Lista todos os administradores
- `GET /administrators/paginated` - Lista paginada com filtros
- `GET /administrators/{administratorId}` - Busca por ID
- `GET /administrators/user-profile/{userId}` - Busca por userId
- `POST /administrators` - Criação de administrador
- `PUT /administrators/{administratorId}` - Atualização completa
- `PATCH /administrators/{administratorId}` - Atualização parcial
- `DELETE /administrators/{administratorId}` - Exclusão lógica
- `PATCH /administrators/{administratorId}/restore` - Restauração

**Schemas:**
- `CreateAdministratorDTO` - Requisição de criação
- `AdministratorResponseDTO` - Resposta completa
- `ListAdministratorsDTO` - Resposta simplificada para listagens
- `PatchAdministratorRequestDTO` - Atualização parcial

#### 1.3.2 Trainers (`/trainers`)
- `GET /trainers` - Lista todos os instrutores
- `GET /trainers/{trainerId}` - Busca por ID
- `GET /trainers/user-profile/{userId}` - Busca por userId
- `POST /trainers` - Criação de instrutor
- `PUT /trainers/{trainerId}` - Atualização completa
- `DELETE /trainers/{trainerId}` - Exclusão lógica
- `PATCH /trainers/{trainerId}/reset-password` - Reset de senha

**Schemas:**
- `CreateTrainerDTO` - Inclui: name, email, phone, password, address, birthDate, specialties[], compensationType
- `TrainerResponseDTO` - Resposta completa com joinDate e hoursWorked
- `ListTrainersDTO` - Resposta simplificada

**Características:**
- Suporta `compensationType`: `HOURLY`, `MONTHLY`
- `specialties` é um array de strings
- Path parameter: `{trainerId}` (UUID)

#### 1.3.3 Students (`/students`)
- `GET /students` - Lista paginada com filtros avançados
- `GET /students/{studentId}` - Busca por ID
- `POST /students` - Criação de aluno
- `PUT /students/{studentId}` - Atualização completa
- `DELETE /students/{studentId}` - Exclusão lógica
- `PATCH /students/{studentId}/restore` - Restauração

**Filtros de Busca:**
- `search` - Busca textual (nome, email)
- `gender` - Filtro por gênero (`M`, `F`, `O`)
- `profession` - Filtro por profissão
- `minAge`, `maxAge` - Faixa etária (0-150)
- `registrationPeriodMinDate`, `registrationPeriodMaxDate` - Período de cadastro
- `includeInactive` - Incluir registros excluídos
- `pageable` - Paginação obrigatória

**Schemas:**
- `StudentRequestDTO` - Inclui dados pessoais, endereço, contato de emergência, anamnesis, physicalImpairments[]
- `StudentResponseDTO` - Resposta completa com timestamps e soft delete info
- `AnamnesisRequestDTO` - Anamnese médica detalhada
- `PhysicalImpairmentRequestDTO` - Deficiências físicas (visual, auditory, motor, intellectual, other)

**Sub-recursos:**
- `GET /students/{studentId}/evaluations` - Lista avaliações físicas
- `POST /students/{studentId}/evaluations` - Cria avaliação física
- `GET /students/{studentId}/evaluations/{evaluationId}` - Busca avaliação específica
- `PUT /students/{studentId}/evaluations/{evaluationId}` - Atualiza avaliação
- `DELETE /students/{studentId}/evaluations/{evaluationId}` - Remove avaliação

**Path parameter:** `{studentId}` (UUID)

### 1.4 Training Resources Domain (`training`)
Gerenciamento de recursos de treinamento: exercícios.

#### Exercises (`/exercises`)
- `GET /exercises` - Lista paginada com busca
- `GET /exercises/{exerciseId}` - Busca por ID
- `POST /exercises` - Criação de exercício
- `PUT /exercises/{exerciseId}` - Atualização completa
- `PATCH /exercises/{exerciseId}` - Atualização parcial
- `DELETE /exercises/{exerciseId}` - Exclusão lógica
- `PATCH /exercises/{exerciseId}/restore` - Restauração

**Filtros:**
- `search` - Busca por nome ou descrição
- `includeInactive` - Incluir excluídos
- `pageable` - Paginação obrigatória

**Schemas:**
- `ExerciseRequestDTO` - name (max 120), description (max 255)
- `ExerciseResponseDTO` - Inclui timestamps e deletedAt
- `PatchExerciseRequestDTO` - Atualização parcial

**Path parameter:** `{exerciseId}` (UUID)

### 1.5 Events Domain (`events`)
Gerenciamento de eventos e atividades.

- `GET /events` - Lista todos os eventos
- `GET /events/{eventId}` - Busca por ID
- `POST /events` - Criação de evento
- `PUT /events/{eventId}` - Atualização completa
- `PATCH /events/{eventId}` - Atualização parcial
- `DELETE /events/{eventId}` - Exclusão lógica
- `PATCH /events/{eventId}/restore` - Restauração

**Filtros:**
- `search` - Busca textual
- `includeInactive` - Incluir excluídos

**Sub-recursos de Participantes:**
- `POST /events/{eventId}/participants/{studentId}` - Adiciona participante
- `DELETE /events/{eventId}/participants/{studentId}` - Remove participante
- `PATCH /events/{eventId}/participants/{studentId}/attendance` - Toggle presença

**Endpoints de Lookup:**
- `GET /events/lookup/trainers` - Lista simplificada de instrutores para seleção
- `GET /events/lookup/students` - Lista simplificada de alunos para seleção

**Schemas:**
- `EventRequestDTO` - name, date, startTime, endTime, location, description, trainerId, participantIds[]
- `EventResponseDTO` - Inclui participants[], instructorId, timestamps
- `EventParticipantResponseDTO` - Dados do participante com presença
- `TrainerLookupDTO`, `StudentLookupDTO` - Schemas simplificados (id, name)

**Path parameters:** `{eventId}` (UUID), `{studentId}` (UUID)

### 1.6 Scheduling Domain (`scheduling`)
Gerenciamento de agendamentos: sessões de treino e horários de instrutores.

#### Sessions (`/sessions`)
- `GET /sessions` - Lista sessões por período (query params: `startDate`, `endDate` - obrigatórios)
- `GET /sessions/{sessionId}` - Busca sessão específica (query param opcional: `trainerId`)
- `POST /sessions` - Cria sessão avulsa (one-off)
- `PATCH /sessions/{sessionId}` - Atualiza sessão
- `PATCH /sessions/{sessionId}/trainer` - Atualiza instrutor da sessão
- `PATCH /sessions/{sessionId}/cancel` - Cancela ou restaura sessão

**Sub-recursos de Participantes:**
- `POST /sessions/{sessionId}/participants` - Adiciona participante
- `DELETE /sessions/{sessionId}/participants/{studentId}` - Remove participante
- `PATCH /sessions/{sessionId}/participants/{studentId}/presence` - Atualiza presença

**Sub-recursos de Exercícios:**
- `POST /sessions/{sessionId}/participants/{studentId}/exercises` - Adiciona exercício ao participante
- `PATCH /sessions/participants/exercises/{exerciseRecordId}` - Atualiza exercício registrado
- `DELETE /sessions/participants/exercises/{exerciseRecordId}` - Remove exercício registrado

**Schemas:**
- `SessionResponseDTO` - sessionId, trainerId, trainerName, startTime, endTime, seriesName, notes, instanceOverride, students[], canceled, presentCount
- `OneOffSessionCreateRequestDTO` - seriesName, trainerId, startTime, endTime, notes
- `SessionUpdateRequestDTO` - participants[], notes
- `SessionCancelRequestDTO` - cancel (boolean), reason
- `SessionParticipantAddRequestDTO` - studentId
- `SessionParticipantPresenceRequestDTO` - present (boolean), notes
- `ParticipantExerciseCreateRequestDTO` - exerciseId, setsCompleted, repsCompleted, weightCompleted, exerciseNotes, done
- `ParticipantExerciseResponseDTO` - Dados completos do exercício registrado

**Path parameters:** `{sessionId}` (string), `{studentId}` (UUID), `{exerciseRecordId}` (UUID)

#### Trainer Schedules (`/trainers/{trainerId}/schedules` e `/schedules`)
- `GET /trainers/{trainerId}/schedules` - Lista horários de um instrutor
- `GET /schedules` - Lista todos os horários ativos
- `GET /schedules/{scheduleId}` - Busca horário específico
- `POST /trainers/{trainerId}/schedules` - Cria horário para instrutor
- `PUT /schedules/{scheduleId}` - Atualiza horário
- `DELETE /schedules/{scheduleId}` - Remove horário

**Schemas:**
- `TrainerScheduleRequestDTO` - trainerId, weekday (0-6), startTime, intervalDuration (min 15), seriesName
- `TrainerScheduleResponseDTO` - Inclui id, weekdayName, effectiveFromTimestamp, active, timestamps

**Path parameters:** `{trainerId}` (UUID), `{scheduleId}` (UUID)

#### Commitments (`/students/{studentId}/commitments`)
Gerenciamento de compromissos de alunos com séries de sessões.

- `GET /students/{studentId}/commitments` - Lista todos os compromissos do aluno
- `GET /students/{studentId}/commitments/active` - Lista compromissos ativos (query param opcional: `timestamp`)
- `GET /students/{studentId}/commitments/sessions/{sessionSeriesId}/status` - Status atual do compromisso (query param opcional: `timestamp`)
- `GET /students/{studentId}/commitments/sessions/{sessionSeriesId}/history` - Histórico de compromissos
- `POST /students/{studentId}/commitments/sessions/{sessionSeriesId}` - Cria/atualiza compromisso
- `POST /students/{studentId}/commitments/bulk` - Atualização em massa de compromissos
- `GET /schedules/{sessionSeriesId}/commitments` - Lista compromissos de uma série de sessões
- `GET /commitments/available-sessions` - Lista séries de sessões disponíveis

**Schemas:**
- `StudentCommitmentRequestDTO` - commitmentStatus (`ATTENDING`, `NOT_ATTENDING`, `TENTATIVE`), effectiveFromTimestamp
- `CommitmentDetailResponseDTO` - Dados completos do compromisso
- `BulkCommitmentRequestDTO` - sessionSeriesIds[], commitmentStatus, effectiveFromTimestamp

**Path parameters:** `{studentId}` (UUID), `{sessionSeriesId}` (UUID)

### 1.7 Plans Domain (`plans`)
Gerenciamento de planos de treino e atribuições.

- `GET /plans` - Lista todos os planos
- `GET /plans/{planId}` - Busca plano por ID
- `POST /plans` - Cria novo plano
- `DELETE /plans/{planId}` - Remove plano

**Sub-recursos de Atribuições:**
- `POST /students/{studentId}/plans/assignments` - Atribui plano a aluno
- `GET /students/{studentId}/plans/assignments` - Histórico de atribuições do aluno
- `GET /students/{studentId}/plans/assignments/current` - Plano atual do aluno

**Schemas:**
- `StudentPlanRequestDTO` - name, maxDays, durationDays, description
- `StudentPlanResponseDTO` - Inclui id, active, createdAt
- `AssignPlanRequestDTO` - planId, startDate, assignmentNotes
- `StudentPlanAssignmentResponseDTO` - Dados completos da atribuição incluindo: studentName, planName, durationDays, startDate, assignedByUserId, assignedByUserEmail, active, expired, expiringSoon, daysRemaining

**Path parameters:** `{planId}` (UUID), `{studentId}` (UUID)

### 1.8 Analytics Domain (`analytics`)
Endpoints de relatórios e análises.

- `GET /reports` - Relatórios gerais (query params obrigatórios: `startDate`, `endDate` - date-time; opcional: `trainerId`)
- `GET /plans/assignments/active` - Lista todas as atribuições ativas
- `GET /plans/assignments/expiring-soon` - Lista atribuições expirando em breve (query param opcional: `days`, default: 7)

**Schemas:**
- `ReportsResponseDTO` - trainerReports[], ageDistribution[]
- `TrainerReportDTO` - id, name, hoursWorked, classesGiven, studentsManaged, compensation, specialties[]
- `AgeDistributionDTO` - ageRange, count, percentage

---

## 2. Convenções RESTful

### 2.1 Estrutura de URLs

#### Recursos Principais (Plural)
Todos os recursos principais são nomeados no **plural**:
- ✅ `/students`, `/trainers`, `/exercises`, `/events`, `/plans`, `/administrators`
- ✅ `/sessions`, `/schedules`

#### Nested Resources (Recursos Aninhados)
Recursos que pertencem hierarquicamente a outro recurso são aninhados:
- ✅ `/students/{studentId}/evaluations`
- ✅ `/students/{studentId}/evaluations/{evaluationId}`
- ✅ `/trainers/{trainerId}/schedules`
- ✅ `/events/{eventId}/participants/{studentId}`
- ✅ `/sessions/{sessionId}/participants/{studentId}`
- ✅ `/students/{studentId}/plans/assignments`
- ✅ `/students/{studentId}/commitments`

#### Path Variables (camelCase)
Todas as variáveis de path usam **camelCase**:
- ✅ `{studentId}`, `{trainerId}`, `{administratorId}`, `{eventId}`, `{exerciseId}`, `{scheduleId}`, `{sessionId}`, `{planId}`, `{userId}`, `{evaluationId}`, `{sessionSeriesId}`, `{exerciseRecordId}`

### 2.2 Métodos HTTP

| Método | Uso | Status Code |
|--------|-----|-------------|
| `GET` | Buscar/Listar recursos | 200 OK |
| `POST` | Criar novo recurso | 200 OK (alguns 201 Created) |
| `PUT` | Substituir completamente um recurso | 200 OK |
| `PATCH` | Atualizar parcialmente um recurso | 200 OK |
| `DELETE` | Remover um recurso (soft delete) | 200 OK |

#### Ações Específicas (PATCH)
Para ações que não são puramente CRUD:
- ✅ `PATCH /exercises/{exerciseId}/restore`
- ✅ `PATCH /students/{studentId}/restore`
- ✅ `PATCH /events/{eventId}/restore`
- ✅ `PATCH /trainers/{trainerId}/reset-password`
- ✅ `PATCH /sessions/{sessionId}/cancel`
- ✅ `PATCH /events/{eventId}/participants/{studentId}/attendance`

### 2.3 Status Codes

| Código | Uso |
|--------|-----|
| 200 OK | Sucesso em GET, PUT, PATCH, DELETE |
| 201 Created | Recurso criado com sucesso (POST) |
| 400 Bad Request | Dados inválidos na requisição |
| 401 Unauthorized | Não autenticado |
| 403 Forbidden | Sem permissão |
| 404 Not Found | Recurso não encontrado |
| 500 Internal Server Error | Erro do servidor |

---

## 3. Autenticação e Segurança

### 3.1 Autenticação JWT
- **Tipo:** Bearer Token (JWT)
- **Header:** `Authorization: Bearer {token}`
- **Endpoints públicos:** Apenas `POST /auth/login`
- **Todos os outros endpoints:** Requerem autenticação

### 3.2 Security Scheme
```yaml
securitySchemes:
  bearerAuth:
    type: http
    scheme: bearer
    bearerFormat: JWT
```

---

## 4. Paginação e Filtros

### 4.1 Paginação
Paginação é implementada via objeto `Pageable`:

```typescript
{
  page: number,      // 0-based
  size: number,      // min: 1
  sort?: string[]    // ex: ["name,asc", "email,desc"]
}
```

**Endpoints com paginação obrigatória:**
- `GET /users?pageable.page=0&pageable.size=20`
- `GET /students?pageable.page=0&pageable.size=20&pageable.sort=name,asc`
- `GET /exercises?pageable.page=0&pageable.size=20`
- `GET /administrators/paginated?pageable.page=0&pageable.size=20`

**Resposta paginada:**
```typescript
{
  totalElements: number,
  totalPages: number,
  size: number,
  number: number,
  content: T[],
  first: boolean,
  last: boolean,
  empty: boolean,
  // ... outros campos de paginação
}
```

### 4.2 Filtros Comuns

#### Busca Textual
- `search` - Busca textual em nome, descrição, email (string)

#### Filtros de Status
- `includeInactive` - Incluir registros excluídos (boolean, default: false)

#### Filtros de Data
- `startDate` - Data inicial (format: date ou date-time)
- `endDate` - Data final (format: date ou date-time)

#### Filtros Específicos por Recurso
- **Students:** `gender`, `profession`, `minAge`, `maxAge`, `registrationPeriodMinDate`, `registrationPeriodMaxDate`
- **Exercises:** `search`, `includeInactive`
- **Events:** `search`, `includeInactive`
- **Reports:** `trainerId` (opcional)

---

## 5. Schemas Principais

### 5.1 DTOs de Request
- `CreateTrainerDTO`, `CreateAdministratorDTO`, `CreateUserRequestDTO`
- `StudentRequestDTO`, `ExerciseRequestDTO`, `EventRequestDTO`
- `StudentPlanRequestDTO`, `AssignPlanRequestDTO`
- `PhysicalEvaluationRequestDTO`, `AnamnesisRequestDTO`, `PhysicalImpairmentRequestDTO`
- `SessionUpdateRequestDTO`, `OneOffSessionCreateRequestDTO`
- `StudentCommitmentRequestDTO`, `BulkCommitmentRequestDTO`
- `PatchExerciseRequestDTO`, `PatchEventRequestDTO`, `PatchAdministratorRequestDTO`
- `SessionParticipantAddRequestDTO`, `SessionParticipantPresenceRequestDTO`
- `ParticipantExerciseCreateRequestDTO`, `ParticipantExerciseUpdateRequestDTO`
- `SessionCancelRequestDTO`, `SessionTrainerUpdateRequestDTO`
- `ChangePasswordRequestDTO`, `ResetTrainerPasswordDTO`
- `LoginRequestDTO`

### 5.2 DTOs de Response
- `StudentResponseDTO`, `TrainerResponseDTO`, `AdministratorResponseDTO`
- `ExerciseResponseDTO`, `EventResponseDTO`
- `StudentPlanResponseDTO`, `StudentPlanAssignmentResponseDTO`
- `PhysicalEvaluationResponseDTO`, `AnamnesisResponseDTO`, `PhysicalImpairmentResponseDTO`
- `SessionResponseDTO`, `TrainerScheduleResponseDTO`
- `CommitmentDetailResponseDTO`, `StudentCommitmentResponseDTO`
- `ParticipantExerciseResponseDTO`, `EventParticipantResponseDTO`
- `UserResponseDTO`, `JwtResponseDTO`
- `ReportsResponseDTO`, `TrainerReportDTO`, `AgeDistributionDTO`
- `MessageResponseDTO` - Mensagens estruturadas (message, success)

### 5.3 DTOs de Listagem Simplificada
- `ListTrainersDTO`, `ListAdministratorsDTO`
- `TrainerLookupDTO`, `StudentLookupDTO`

### 5.4 Schemas de Paginação
- `Pageable` - Request de paginação
- `PageableObject` - Metadados de paginação na resposta
- `SortObject` - Informações de ordenação
- `PageUserResponseDTO`, `PageStudentResponseDTO`, `PageExerciseResponseDTO`, `PageListAdministratorsDTO`

---

## 6. Soft Delete e Restauração

A API implementa **soft delete** (exclusão lógica) para a maioria dos recursos:

- Campos `deletedAt` nos schemas de resposta
- Endpoint `PATCH /resource/{resourceId}/restore` para restauração
- Filtro `includeInactive` para incluir registros excluídos nas listagens

**Recursos com soft delete:**
- Students, Trainers, Administrators
- Exercises, Events
- Sessions (cancelamento)

---

## 7. Lookup Endpoints

Endpoints utilitários que retornam dados simplificados para seleção/autocomplete:

- `GET /events/lookup/trainers` - Retorna `TrainerLookupDTO[]` (id, name)
- `GET /events/lookup/students` - Retorna `StudentLookupDTO[]` (id, name)
- `GET /commitments/available-sessions` - Retorna `TrainerSchedule[]` disponíveis

---

## 8. Convenções de Nomenclatura

### 8.1 Operation IDs (camelCase)
Todos os `operationId` seguem padrão camelCase descritivo:
- `findAllTrainers`, `findTrainerById`, `createTrainer`, `updateTrainer`, `deleteTrainer`
- `getSchedule`, `getSession`, `createOneOffSession`
- `assignPlanToStudent`, `getStudentPlanHistory`, `getCurrentStudentPlan`
- `updateCommitment`, `bulkUpdateCommitments`, `getCurrentCommitmentStatus`

### 8.2 Tags (domínios)
Tags seguem os domínios arquiteturais:
- `authentication`, `users`, `people`, `training`, `events`, `scheduling`, `plans`, `analytics`

### 8.3 Schemas
- **Request DTOs:** Sufixo `RequestDTO` ou `DTO` (ex: `CreateTrainerDTO`, `StudentRequestDTO`)
- **Response DTOs:** Sufixo `ResponseDTO` (ex: `StudentResponseDTO`, `TrainerResponseDTO`)
- **List DTOs:** Prefixo `List` ou `Lookup` (ex: `ListTrainersDTO`, `TrainerLookupDTO`)
- **Page DTOs:** Prefixo `Page` (ex: `PageStudentResponseDTO`)

---

## 9. Exemplos de Uso

### 9.1 Autenticação
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}

Response:
{
  "id": "uuid",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 9.2 Listar Alunos com Filtros
```http
GET /students?search=João&gender=M&minAge=18&maxAge=65&includeInactive=false&pageable.page=0&pageable.size=20&pageable.sort=name,asc
Authorization: Bearer {token}
```

### 9.3 Criar Sessão de Treino
```http
POST /sessions
Authorization: Bearer {token}
Content-Type: application/json

{
  "seriesName": "Treino A",
  "trainerId": "uuid",
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T11:00:00Z",
  "notes": "Treino de força"
}
```

### 9.4 Atribuir Plano a Aluno
```http
POST /students/{studentId}/plans/assignments
Authorization: Bearer {token}
Content-Type: application/json

{
  "planId": "uuid",
  "startDate": "2024-01-15",
  "assignmentNotes": "Plano inicial de 30 dias"
}

Response: 201 Created
{
  "id": "uuid",
  "studentId": "uuid",
  "studentName": "João Silva",
  "planId": "uuid",
  "planName": "Plano Mensal",
  "startDate": "2024-01-15",
  "active": true,
  "expired": false,
  "expiringSoon": false,
  "daysRemaining": 30,
  ...
}
```

---

## 10. Versionamento

A API usa versionamento implícito através do OpenAPI:
- **Versão atual:** `v1.0.0`
- **Base path:** Pode incluir versão futura se necessário: `/api/v1/students`

---

## 11. Checklist para Novos Endpoints

Ao criar novos endpoints, verificar:

- [ ] Recurso principal está no plural?
- [ ] Nested resources seguem hierarquia lógica?
- [ ] Método HTTP é apropriado (GET/POST/PUT/PATCH/DELETE)?
- [ ] Path variables usam camelCase (`{resourceId}`)?
- [ ] Query parameters seguem padrão estabelecido?
- [ ] Status codes apropriados estão documentados?
- [ ] Endpoint está documentado no OpenAPI?
- [ ] Segue padrões RESTful estabelecidos?
- [ ] Tag corresponde ao domínio correto?
- [ ] OperationId segue convenção camelCase?
- [ ] Schemas de Request/Response estão definidos?
- [ ] Soft delete implementado (se aplicável)?
- [ ] Paginação implementada (se aplicável)?

---

## 12. Referências

- **OpenAPI Specification:** 3.1.0
- **Documentação de Arquitetura:** `backend/docs/api-architecture.md`
- **OpenAPI Spec:** `backend/API/openapi.yml`

---

**Última atualização:** 2024  
**Mantido por:** Equipe de Desenvolvimento Training Management System
