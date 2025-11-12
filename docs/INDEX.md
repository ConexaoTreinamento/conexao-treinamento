# 📚 Documentation Index - Conexão Treinamento

> Índice completo da documentação do projeto

---

## 🚀 Getting Started

### Para Começar
- **[Quick Start](getting-started/quick-start.md)** ⭐ - Inicie em 5 minutos
- **[Installation Guide](getting-started/installation.md)** - Instalação detalhada
- **[Configuration](getting-started/configuration.md)** - Configurar ambiente

### Primeiros Passos
- Como fazer login
- Como criar um aluno
- Como agendar um treino
- Como explorar a API

---

## 🏗️ Architecture

### Visão Geral
- **[Architecture Overview](architecture/overview.md)** ⭐ - Arquitetura completa
- **[Tech Stack](architecture/tech-stack.md)** - Tecnologias usadas
- **[Design Patterns](architecture/design-patterns.md)** - Padrões de projeto
- **[Project Structure](architecture/project-structure.md)** - Estrutura de pastas

### Por Camada
- **[Frontend Architecture](../web/docs/architecture/overview.md)** - Next.js + React
- **[Backend Architecture](../backend/docs/architecture/patterns.md)** - Spring Boot
- **[Database Schema](database/schema.md)** - Modelo de dados

---

## 📡 Backend Documentation

### API Reference
- **[Backend Overview](../backend/docs/README.md)** ⭐ - Índice backend
- **[API Overview](../backend/docs/api/overview.md)** - Todos os endpoints
- **[Authentication](../backend/docs/api/authentication.md)** - Como autenticar
- **[OpenAPI Spec](../backend/API/openapi.yml)** - Especificação completa
- **[Swagger UI](http://localhost:8080/swagger-ui.html)** - Docs interativa

### Domains (Por Domínio)
- **[Students](../backend/docs/domains/students/overview.md)** - Alunos
- **[Trainers](../backend/docs/domains/trainers/overview.md)** - Professores
- **[Administrators](../backend/docs/domains/administrators/overview.md)** - Admins
- **[Exercises](../backend/docs/domains/exercises/overview.md)** - Exercícios
- **[Events](../backend/docs/domains/events/overview.md)** - Eventos
- **[Schedules](../backend/docs/domains/schedules/overview.md)** - Agendamento
- **[Plans](../backend/docs/domains/plans/overview.md)** - Planos
- **[Evaluations](../backend/docs/domains/evaluations/overview.md)** - Avaliações
- **[Users](../backend/docs/domains/users/overview.md)** - Usuários

### Guides
- **[Testing](../backend/docs/guides/testing.md)** - Como testar
- **[Database Migrations](../backend/docs/guides/database-migrations.md)** - Flyway
- **[Error Handling](../backend/docs/guides/error-handling.md)** - Tratamento de erros
- **[Migration Guide](../backend/docs/guides/migration-guide.md)** - Breaking changes

---

## 🎨 Frontend Documentation

### Overview
- **[Frontend Overview](../web/docs/README.md)** ⭐ - Índice frontend
- **[Architecture](../web/docs/architecture/overview.md)** - Arquitetura
- **[Routing](../web/docs/architecture/routing.md)** - Next.js App Router
- **[State Management](../web/docs/architecture/state-management.md)** - TanStack Query

### Components
- **[Component Overview](../web/docs/components/overview.md)** - Estrutura
- **[UI Library](../web/docs/components/ui-library.md)** - shadcn/ui
- **[Base Components](../web/docs/components/base-components.md)** - Reutilizáveis
- **[Forms](../web/docs/components/forms.md)** - React Hook Form + Zod

### Domains (Por Domínio)
- **[Students](../web/docs/domains/students/overview.md)** - Alunos
- **[Trainers](../web/docs/domains/trainers/overview.md)** - Professores
- **[Administrators](../web/docs/domains/administrators/overview.md)** - Admins
- **[Exercises](../web/docs/domains/exercises/overview.md)** - Exercícios
- **[Events](../web/docs/domains/events/overview.md)** - Eventos
- **[Schedules](../web/docs/domains/schedules/overview.md)** - Agendamento
- **[Plans](../web/docs/domains/plans/overview.md)** - Planos

### Guides
- **[Testing](../web/docs/guides/testing.md)** - Como testar
- **[Styling](../web/docs/guides/styling.md)** - Tailwind CSS
- **[API Integration](../web/docs/guides/api-integration.md)** - Chamadas de API
- **[Error Handling](../web/docs/guides/error-handling.md)** - Tratamento de erros

---

## 🚢 Deployment

### Guides
- **[Docker Deployment](deployment/docker.md)** ⭐ - Deploy com Docker
- **[Production Deployment](deployment/production.md)** - Deploy em produção
- **[Environment Variables](deployment/environment-variables.md)** - Variáveis de ambiente
- **[Monitoring](deployment/monitoring.md)** - Monitoramento

### CI/CD
- **[GitHub Actions](deployment/github-actions.md)** - CI/CD pipeline
- **[Docker Registry](deployment/docker-registry.md)** - Publicar imagens

---

## 🤝 Contributing

### Guidelines
- **[Code Standards](contributing/code-standards.md)** ⭐ - Padrões de código
- **[Pull Request Guide](contributing/pull-request-guide.md)** - Como contribuir
- **[Commit Convention](contributing/commit-convention.md)** - Conventional Commits
- **[Branch Strategy](contributing/branch-strategy.md)** - GitFlow

### Development
- **[Development Workflow](contributing/development-workflow.md)** - Fluxo de dev
- **[Code Review](contributing/code-review.md)** - Revisão de código
- **[Testing Standards](contributing/testing-standards.md)** - Padrões de teste

---

## 📊 Additional Resources

### API
- **[Postman Collection](../postman/conexao-treinamento.json)** - Collection de requisições
- **[Swagger UI](http://localhost:8080/swagger-ui.html)** - Documentação interativa
- **[OpenAPI JSON](http://localhost:8080/v3/api-docs)** - Spec em JSON

### Database
- **[ER Diagram](database/er-diagram.png)** - Diagrama de entidades
- **[Schema Documentation](database/schema.md)** - Documentação do schema
- **[Migration History](database/migrations.md)** - Histórico de migrations

### Diagrams
- **[Architecture Diagram](diagrams/architecture.png)** - Diagrama de arquitetura
- **[Data Flow Diagram](diagrams/data-flow.png)** - Fluxo de dados
- **[Security Diagram](diagrams/security.png)** - Diagrama de segurança

---

## 🔍 Quick Search

### Por Funcionalidade
- Authentication & Authorization
- Students Management
- Trainers Management
- Exercise Library
- Schedule & Sessions
- Plans & Evaluations
- Events Management
- Reports & Analytics

### Por Tecnologia
- Spring Boot & Java
- Next.js & React
- PostgreSQL & Flyway
- TanStack Query
- shadcn/ui & Tailwind
- Docker & Docker Compose

### Por Tipo
- API Endpoints
- Database Models
- React Components
- Business Rules
- Design Patterns
- Testing Strategies

---

## 📚 External Resources

### Documentação Oficial
- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

### Tutoriais e Guias
- Spring Security JWT
- Next.js App Router
- TanStack Query
- Tailwind CSS

---

## 🆘 Need Help?

### Support Channels
- **GitHub Issues** - [Report bugs or request features](https://github.com/seu-usuario/conexao-treinamento/issues)
- **Documentation** - Você está aqui!
- **API Docs** - [Swagger UI](http://localhost:8080/swagger-ui.html)

### FAQ
- Como fazer login?
- Como criar um novo aluno?
- Como agendar um treino?
- Como atualizar o schema do banco?
- Como fazer deploy em produção?

---

## 📝 Contributing to Docs

Encontrou um erro na documentação ou quer melhorá-la?

1. Fork o repositório
2. Edite os arquivos `.md` em `/docs`, `/backend/docs` ou `/web/docs`
3. Envie um Pull Request

**[Ver guia de contribuição →](contributing/code-standards.md)**

---

**Última Atualização**: Novembro 2025  
**Versão**: 1.0.0

---

[⬆️ Voltar ao início](#-documentation-index---conexão-treinamento) | [📖 README Principal](../README.md)

