# Visão Geral do Projeto: Conexão Treinamento

## 1. Introdução

O Conexão Treinamento é um sistema de gerenciamento de academia (SGA) full-stack projetado para otimizar as operações diárias de uma academia. Ele fornece ferramentas para administrar alunos, treinadores, agendamentos, planos, avaliações físicas e eventos.

A aplicação consiste em um backend robusto construído com Java e Spring Boot, e um frontend moderno e responsivo desenvolvido com Next.js e React.

## 2. Principais Funcionalidades

- **Gerenciamento de Alunos**: Cadastro, edição e visualização de alunos.
- **Gerenciamento de Treinadores e Administradores**: Controle de acesso e gerenciamento de pessoal.
- **Agendamento**: Sistema de agendamento de aulas e sessões de treinamento.
- **Planos de Treinamento**: Criação e atribuição de planos de treinamento aos alunos.
- **Avaliações Físicas**: Registro e acompanhamento das avaliações físicas dos alunos.
- **Gerenciamento de Eventos**: Criação e gerenciamento de eventos da academia com inscrições de participantes.
- **Autenticação Segura**: Sistema de login baseado em JWT (JSON Web Tokens) com controle de acesso baseado em papéis (Role-Based Access Control).

## 3. Arquitetura

A aplicação segue uma arquitetura de microsserviços desacoplada, com um backend e um frontend independentes que se comunicam através de uma API RESTful.

- **Backend**: Uma aplicação monolítica Spring Boot que expõe uma API REST. Segue uma arquitetura em camadas (Controller, Service, Repository) para uma clara separação de responsabilidades.
- **Frontend**: Uma Single-Page Application (SPA) construída com Next.js que consome a API do backend.
- **Banco de Dados**: Um banco de dados relacional PostgreSQL para persistir os dados da aplicação.
- **Containerização**: Docker é utilizado para containerizar o backend, o frontend e o banco de dados, facilitando a configuração do ambiente de desenvolvimento e o deploy.

## 4. Stack de Tecnologias

| Camada       | Tecnologia Principal | Detalhes                                                              |
| :----------- | :------------------- | :-------------------------------------------------------------------- |
| **Backend**  | Java 21, Spring Boot | Spring Web, Spring Data JPA, Spring Security (OAuth2/JWT)             |
| **Frontend** | Next.js 15, React 19 | TypeScript, TanStack Query, Tailwind CSS, shadcn/ui                   |
| **Banco de Dados** | PostgreSQL           | Persistência de dados relacional                                      |
| **Migrações**  | Flyway               | Versionamento e gerenciamento de schema de banco de dados             |
| **Testes**     | JUnit, Testcontainers| Testes unitários, de integração, de cobertura (JaCoCo) e de mutação (PIT) |
| **CI/CD**      | GitHub Actions       | Integração contínua e automação de deploy                             |
| **Container**  | Docker, Docker Compose | Orquestração de containers para desenvolvimento e produção            |
