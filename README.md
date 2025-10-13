# Conexão Treinamento

Sistema de gerenciamento de treinamentos e academias desenvolvido com Spring Boot e Next.js.

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Arquitetura](#-arquitetura)
- [Pré-requisitos](#-pré-requisitos)
- [Configuração Rápida com Docker Compose](#-configuração-rápida-com-docker-compose)
- [Executando Serviços Individualmente](#-executando-serviços-individualmente)
- [Executando Testes](#-executando-testes)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Guia para Novos Desenvolvedores](#-guia-para-novos-desenvolvedores)
- [API Documentation](#-api-documentation)

## 🎯 Visão Geral

O **Conexão Treinamento** é uma plataforma completa para gestão de academias e centros de treinamento, oferecendo:

- **Gestão de Usuários**: Administradores, treinadores e alunos
- **Agendamento**: Sistema de agendamento de sessões e aulas
- **Planos de Treino**: Criação e acompanhamento de planos personalizados
- **Exercícios**: Biblioteca de exercícios com instruções
- **Relatórios**: Acompanhamento de progresso e compromissos

## 🏗 Arquitetura

O projeto é dividido em três principais componentes:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│    Frontend     │◄──►│     Backend     │◄──►│   PostgreSQL    │
│   (Next.js)     │    │  (Spring Boot)  │    │   (Database)    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

- **Frontend**: Aplicação Next.js com TypeScript, Tailwind CSS e shadcn/ui
- **Backend**: API REST com Spring Boot 3, Spring Security e JWT
- **Database**: PostgreSQL 16 com migrações Flyway

## 📋 Pré-requisitos

### Para desenvolvimento com Docker (Recomendado)

- [Docker](https://www.docker.com/) v20.10+
- [Docker Compose](https://docs.docker.com/compose/) v2.0+

### Para desenvolvimento local

- [Java JDK 21](https://www.oracle.com/java/technologies/downloads/#java21)
- [Node.js](https://nodejs.org/) v18+
- [pnpm](https://pnpm.io/) v8+
- [PostgreSQL](https://www.postgresql.org/) 16+ (opcional, pode usar Docker)

## 🐳 Configuração Rápida com Docker Compose

### Desenvolvimento (Recomendado)

Execute toda a aplicação com um único comando:

```bash
# Clona o repositório
git clone <repository-url>
cd conexao-treinamento

# Inicia todos os serviços
docker compose up -d

# Para acompanhar os logs
docker compose logs -f
```

Isso iniciará:

- **PostgreSQL**: `localhost:5432`
- **Backend**: `localhost:8080`
- **Frontend**: `localhost:3000`

### Comandos Úteis do Docker Compose

```bash
# Rebuild e restart dos serviços
docker compose up -d --build

# Parar todos os serviços
docker compose down

# Remover volumes (apaga dados do banco)
docker compose down -v

# Ver status dos serviços
docker compose ps

# Logs de um serviço específico
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### Ambiente de Testes

Para executar testes em containers isolados:

```bash
# Configurar arquivo de ambiente de teste (se necessário)
cp .env.example .env.test

# Executar testes
docker compose -f docker-compose.test.yml up --build
```

## 🔧 Executando Serviços Individualmente

### 1. Banco de Dados (PostgreSQL)

#### Opção A: Com Docker (Recomendado)

```bash
# Apenas o PostgreSQL
docker compose up postgres -d

# Verificar se está rodando
docker compose ps postgres
```

#### Opção B: PostgreSQL Local

```bash
# Instalar PostgreSQL e criar banco
createdb conexaotreinamento
psql -d conexaotreinamento -c "CREATE USER postgres WITH PASSWORD 'postgres123';"
```

### 2. Backend (Spring Boot)

```bash
cd backend

# Linux/macOS
chmod +x ./mvnw
./mvnw clean install
./mvnw spring-boot:run

# Windows
.\mvnw.cmd clean install
.\mvnw.cmd spring-boot:run

# Ou usando Maven instalado globalmente
mvn clean install
mvn spring-boot:run
```

**Configurações de ambiente para o backend:**

```bash
# Variáveis de ambiente (opcional)
export SPRING_PROFILES_ACTIVE=dev
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/conexaotreinamento
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=postgres123
```

O backend estará disponível em: `http://localhost:8080`

### 3. Frontend (Next.js)

```bash
cd web

# Instalar dependências
pnpm install

# Modo desenvolvimento
pnpm dev

# Ou modo produção
pnpm build
pnpm start
```

**Configurações de ambiente para o frontend:**

```bash
# Criar arquivo .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.local
```

O frontend estará disponível em: `http://localhost:3000`

## 🧪 Executando Testes

### Testes do Backend

```bash
cd backend

# Executar todos os testes
./mvnw test

# Executar testes com relatório de cobertura
./mvnw test jacoco:report

# Executar apenas testes unitários
./mvnw test -Dtest="**/*Test.java"

# Executar apenas testes de integração
./mvnw test -Dtest="**/*IntegrationTest.java"

# Executar testes com perfil específico
./mvnw test -Dspring.profiles.active=test
```

# <<<<<<< HEAD

### Testes do Frontend

```bash
cd web

# Verificação de tipos
pnpm type-check

# Linting
pnpm lint

# Formatação de código
pnpm format:check
pnpm format

# Testes (quando implementados)
pnpm test:smoke
pnpm test:integration
```

### Testes com Docker

```bash
# Executar testes em ambiente isolado
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit

# Limpar após testes
docker compose -f docker-compose.test.yml down -v
```

## 📁 Estrutura do Projeto

### Organização dos Repositórios

O projeto está organizado em um **monorepo** com separação clara de responsabilidades:

```
conexao-treinamento/
├── backend/                 # API Spring Boot
│   ├── src/
│   │   ├── main/java/       # Código fonte principal
│   │   │   └── org/conexaotreinamento/
│   │   │       ├── config/          # Configurações (Security, OpenAPI, etc.)
│   │   │       ├── controller/      # Controllers REST
│   │   │       ├── dto/            # Data Transfer Objects
│   │   │       ├── entity/         # Entidades JPA
│   │   │       ├── enums/          # Enumerações
│   │   │       ├── exception/      # Tratamento de exceções
│   │   │       ├── repository/     # Repositórios JPA
│   │   │       ├── service/        # Lógica de negócio
│   │   │       └── specification/  # Especificações para queries dinâmicas
│   │   ├── resources/
│   │   │   ├── db/migration/       # Scripts Flyway
│   │   │   └── application.properties
│   │   └── test/           # Testes unitários e integração
│   ├── Dockerfile
│   └── pom.xml
├── web/                    # Frontend Next.js
│   ├── app/               # App Router (Next.js 13+)
│   │   ├── administrators/ # Páginas de administradores
│   │   ├── students/      # Páginas de alunos
│   │   ├── trainers/      # Páginas de treinadores
│   │   └── ...
│   ├── components/        # Componentes React reutilizáveis
│   │   ├── ui/           # Componentes base (shadcn/ui)
│   │   └── ...
│   ├── lib/              # Utilitários e configurações
│   │   ├── api-client/   # Cliente API gerado automaticamente
│   │   └── ...
│   ├── hooks/            # Custom React hooks
│   ├── Dockerfile
│   └── package.json
├── docs/                 # Documentação adicional
├── docker-compose.yml    # Ambiente de desenvolvimento
├── docker-compose.test.yml # Ambiente de testes
└── README.md
```

### Principais Diretórios

#### Backend (`/backend`)

- **Controllers**: Endpoints REST organizados por domínio
- **Services**: Lógica de negócio e regras da aplicação
- **Repositories**: Acesso a dados com Spring Data JPA
- **DTOs**: Objetos para transferência de dados entre camadas
- **Entities**: Modelos de dados JPA com relacionamentos
- **Config**: Configurações de segurança, CORS, OpenAPI, etc.

#### Frontend (`/web`)

- **App Router**: Estrutura de rotas do Next.js 13+
- **Components**: Componentes React organizados por funcionalidade
- **Lib**: Cliente API auto-gerado, utilitários e configurações
- **Hooks**: Hooks customizados para gerenciamento de estado

## 👥 Guia para Novos Desenvolvedores

### 1. Primeiro Setup

```bash
# 1. Clone o repositório
git clone <repository-url>
cd conexao-treinamento

# 2. Inicie com Docker (mais fácil)
docker compose up -d

# 3. Aguarde todos os serviços subirem
docker compose logs -f
```

### 2. Verificando se está funcionando

- **Frontend**: Acesse http://localhost:3000
- **Backend API**: Acesse http://localhost:8080/swagger-ui.html
- **Database**: Conecte em `localhost:5432` (postgres/postgres123)

### 3. Fluxo de Desenvolvimento

#### Workflow Recomendado

```bash
# 1. Sincronizar com a branch principal
git checkout develop
git pull origin develop

# 2. Criar nova branch a partir da develop
git checkout -b feature/nova-funcionalidade

# 3. Fazer alterações no código
# ... desenvolver sua feature ...

# 4. Executar testes e validações
# Backend
cd backend && ./mvnw test

# Frontend
cd web && pnpm type-check && pnpm lint

# 5. Commit das alterações (seguindo Conventional Commits)
git add .
git commit -m "feat: adiciona nova funcionalidade"

# 6. Antes de fazer push - sincronizar com develop
git checkout develop
git pull origin develop
git checkout feature/nova-funcionalidade

# 7. Resolver conflitos se houver
git rebase develop
# Se houver conflitos, resolva-os e continue:
# git add .
# git rebase --continue

# 8. Push da branch
git push origin feature/nova-funcionalidade

# 9. Abrir Pull Request no GitHub/GitLab
# Aguardar review e aprovação antes do merge
```

#### Padrão de Commits (Conventional Commits)

Use os seguintes prefixos para seus commits:

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Alterações na documentação
- `style:` - Formatação, sem mudança de lógica
- `refactor:` - Refatoração de código
- `test:` - Adição ou correção de testes
- `chore:` - Tarefas de manutenção

**Exemplos:**

```bash
git commit -m "feat: adiciona endpoint para listar exercícios"
git commit -m "fix: corrige validação de email no cadastro"
git commit -m "docs: atualiza README com instruções de deploy"
```

### 4. Comandos Úteis do Dia a Dia

```bash
# Ver logs em tempo real
docker compose logs -f backend
docker compose logs -f frontend

# Reiniciar apenas um serviço
docker compose restart backend

# Executar comando dentro do container
docker compose exec backend bash
docker compose exec postgres psql -U postgres -d conexaotreinamento

# Limpar cache e rebuild
docker compose down
docker compose up -d --build
```

### 5. Debugando Problemas Comuns

#### Backend não inicia

```bash
# Verificar logs
docker compose logs backend

# Verificar se PostgreSQL está rodando
docker compose ps postgres

# Reiniciar com rebuild
docker compose up backend --build
```

#### Frontend não carrega

```bash
# Verificar se backend está respondendo
curl http://localhost:8080/actuator/health

# Verificar variáveis de ambiente
docker compose exec frontend env | grep NEXT_PUBLIC
```

#### Banco de dados com problemas

```bash
# Resetar banco (CUIDADO: apaga dados)
docker compose down -v
docker compose up postgres -d
```

## 📚 API Documentation

Após iniciar o backend, a documentação da API estará disponível em:

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/v3/api-docs

### Principais Endpoints

#### Autenticação

- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/refresh` - Renovar token JWT

#### Usuários

- `GET /api/students` - Listar alunos
- `POST /api/students` - Criar novo aluno
- `GET /api/students/{id}` - Buscar aluno por ID
- `PUT /api/students/{id}` - Atualizar aluno

#### Treinadores

- `GET /api/trainers` - Listar treinadores
- `POST /api/trainers` - Criar novo treinador
- `GET /api/trainers/{id}` - Buscar treinador por ID

#### Exercícios

- `GET /api/exercises` - Listar exercícios
- `POST /api/exercises` - Criar novo exercício
- `GET /api/exercises/{id}` - Buscar exercício por ID

#### Agendamentos

- `GET /api/schedules` - Consultar agendamentos
- `POST /api/schedules` - Criar novo agendamento
- `GET /api/schedules/{id}` - Buscar agendamento por ID

> 💡 **Dica**: Use o Swagger UI para testar os endpoints interativamente

### Diretrizes

- ✅ Siga o padrão de commits (Conventional Commits)
- ✅ Execute testes antes de fazer push
- ✅ Mantenha o código bem documentado
- ✅ Teste suas alterações localmente
- ✅ Abra PRs pequenos e focados
- ❌ Não faça commit diretamente na `main` ou `develop`

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

> > > > > > > b14608049df75c38913995ca3082ea74a90b2f18
