# 🏋️ Conexão Treinamento

> Sistema de gerenciamento de academia com foco em personal trainers, alunos e agendamento de treinos.

[![Java](https://img.shields.io/badge/Java-21-orange)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)

---

## ⚡ Quick Start

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/conexao-treinamento.git
cd conexao-treinamento

# Inicie com Docker
docker-compose up -d
```

**Acesse:**
- 🌐 **Frontend:** http://localhost:3000
- 📡 **Backend API:** http://localhost:8080
- 📚 **Swagger UI:** http://localhost:8080/swagger-ui.html

**Login padrão:**
- Email: `admin@example.com`
- Senha: `admin123`

> ⚠️ **Importante:** Altere as credenciais padrão em produção!

---

## 📚 Documentação Completa

### 🚀 Getting Started
- **[Quick Start](docs/getting-started/quick-start.md)** - Inicie em 5 minutos
- **[Instalação](docs/getting-started/installation.md)** - Guia completo de instalação
- **[Desenvolvimento](docs/getting-started/development.md)** - Configurar ambiente de dev

### 🏗️ Arquitetura & Design
- **[Visão Geral](docs/architecture/overview.md)** - Arquitetura completa do sistema
- **[Estrutura do Projeto](docs/architecture/project-structure.md)** - Organização de pastas
- **[Design Patterns](docs/architecture/design-patterns.md)** - Padrões implementados

### 📡 Backend (Spring Boot)
- **[Backend Overview](backend/docs/README.md)** - Documentação completa da API
- **[API Reference](backend/docs/api/overview.md)** - Todos os endpoints
- **[Autenticação JWT](backend/docs/api/authentication.md)** - Como autenticar
- **[Segurança](backend/docs/architecture/security.md)** - Arquitetura de segurança
- **[Padrões de Código](backend/docs/architecture/patterns.md)** - Mapper, Service, Repository

**Domínios:**
- [Students](backend/docs/domains/students/overview.md) • [Trainers](backend/docs/domains/trainers/overview.md) • [Administrators](backend/docs/domains/administrators/overview.md)
- [Exercises](backend/docs/domains/exercises/overview.md) • [Events](backend/docs/domains/events/overview.md) • [Schedules](backend/docs/domains/schedules/overview.md)
- [Plans](backend/docs/domains/plans/overview.md) • [Evaluations](backend/docs/domains/evaluations/overview.md) • [Users](backend/docs/domains/users/overview.md)

### 🎨 Frontend (Next.js + React)
- **[Frontend Overview](web/docs/README.md)** - Documentação completa do frontend
- **[Arquitetura](web/docs/architecture/overview.md)** - Next.js App Router + TanStack Query
- **[Componentes](web/docs/components/overview.md)** - shadcn/ui + Componentes customizados
- **[Autenticação](web/docs/architecture/authentication.md)** - JWT + Middleware Edge

**Domínios:**
- [Students](web/docs/domains/students/overview.md) • [Trainers](web/docs/domains/trainers/overview.md) • [Administrators](web/docs/domains/administrators/overview.md)
- [Exercises](web/docs/domains/exercises/overview.md) • [Events](web/docs/domains/events/overview.md) • [Schedules](web/docs/domains/schedules/overview.md)

### 🚢 Deploy & Operações
- **[Docker Deploy](docs/deployment/docker.md)** - Deploy com Docker Compose
- **[Produção](docs/deployment/production.md)** - Deploy em produção
- **[Monitoramento](docs/deployment/monitoring.md)** - Health checks e métricas

### 🤝 Contribuindo
- **[Code Standards](docs/contributing/code-standards.md)** - Padrões Java + TypeScript
- **[Pull Requests](docs/contributing/pull-request-guide.md)** - Como contribuir
- **[Git Workflow](docs/contributing/branch-strategy.md)** - GitFlow + Conventional Commits

### 📖 Índice Completo
- **[Documentação Completa](docs/INDEX.md)** - Índice de toda a documentação

---

## 🏗️ Arquitetura

![System Architecture](docs/architecture/system-architecture.svg)

**Backend:** Spring Boot 3.2 (Java 21) • PostgreSQL 16 • Spring Security + JWT • Flyway  
**Frontend:** Next.js 15 • React 19 • TypeScript • TanStack Query • shadcn/ui • Tailwind CSS  
**DevOps:** Docker • Docker Compose • Maven • npm

📖 **[Arquitetura detalhada →](docs/architecture/overview.md)** | **[Tech Stack completo →](docs/architecture/tech-stack.md)**

---

## 🎯 Funcionalidades

- ✅ **Gestão de Alunos** - CRUD, anamnese, avaliações físicas, histórico
- ✅ **Gestão de Professores** - Personal trainers e especialidades
- ✅ **Biblioteca de Exercícios** - Catálogo personalizado de exercícios
- ✅ **Agendamento** - Agenda semanal com sessões recorrentes
- ✅ **Prescrição de Treinos** - Exercícios individualizados por aluno
- ✅ **Planos de Treinamento** - Gestão de planos com validade
- ✅ **Eventos** - Eventos especiais da academia
- ✅ **Relatórios** - Dashboard com métricas e estatísticas
- ✅ **Sistema de Permissões** - Controle RBAC (Admin/Trainer)

📖 **[Funcionalidades detalhadas →](docs/architecture/domains.md)**

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**Desenvolvido com ❤️ pela equipe Conexão Treinamento**
