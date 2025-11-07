# Documentação do Backend

## 1. Introdução

O backend é uma aplicação Spring Boot construída com Java 21. Ele é responsável pela lógica de negócios, gerenciamento de dados e por expor uma API RESTful segura para o frontend.

## 2. API RESTful

A API é documentada usando a especificação OpenAPI 3.0. A documentação interativa da API (Swagger UI) está disponível em `/swagger-ui.html` quando a aplicação está em execução.

- **Geração de Documentação**: A documentação é gerada automaticamente a partir do código usando a dependência `springdoc-openapi`.
- **Contrato da API**: O contrato da API gerado (em `API/openapi.yml`) é usado para criar um cliente de API tipado no frontend, garantindo a consistência entre o cliente e o servidor.

## 3. Autenticação e Segurança

A segurança é implementada usando Spring Security com autenticação baseada em JWT.

- **Fluxo de Autenticação**:
  1. O usuário envia as credenciais (email e senha) para o endpoint `/auth/login`.
  2. O `AuthService` valida as credenciais usando o `AuthenticationManager` do Spring Security.
  3. Se as credenciais forem válidas, o `JwtService` gera um JWT contendo o ID do usuário, o papel (role) e a data de expiração.
  4. O token é retornado ao cliente, que deve incluí-lo no cabeçalho `Authorization` de todas as requisições subsequentes.
- **Controle de Acesso**: O acesso aos endpoints é restrito com base nos papéis do usuário (ex: `ROLE_ADMIN`, `ROLE_TRAINER`) usando anotações de segurança em nível de método (`@PreAuthorize`).
- **CORS**: A configuração de Cross-Origin Resource Sharing (CORS) permite que o frontend (hospedado em um domínio diferente) acesse a API com segurança.

## 4. Arquitetura em Camadas

O backend segue uma arquitetura em camadas para promover a separação de responsabilidades:

- **`controller`**: Recebe requisições HTTP, valida a entrada e delega a lógica de negócios para a camada de serviço.
- **`service`**: Contém a lógica de negócios principal da aplicação. Orquestra o acesso aos dados e implementa as regras de negócio.
- **`repository`**: Interfaces que estendem o `JpaRepository` do Spring Data JPA. Abstraem o acesso aos dados e fornecem métodos para operações de CRUD.
- **`entity`**: Classes que representam as tabelas do banco de dados (mapeadas com anotações da JPA).
- **`dto`**: Data Transfer Objects (DTOs) são usados para desacoplar as entidades do banco de dados da API externa, prevenindo o vazamento de detalhes da implementação e moldando os dados para as necessidades do cliente.

## 5. Banco de Dados e Migrações

- **Banco de Dados**: PostgreSQL é o banco de dados relacional usado para persistir os dados.
- **Migrações**: O Flyway é usado para gerenciar o versionamento do schema do banco de dados. Os scripts de migração SQL estão localizados em `src/main/resources/db/migration`.

## 6. Testes

O projeto tem uma suíte de testes abrangente para garantir a qualidade e a estabilidade do código:

- **Testes Unitários**: Usando JUnit e Mockito para testar componentes individuais (serviços, controllers) de forma isolada.
- **Testes de Integração**: Usando Testcontainers para iniciar um banco de dados PostgreSQL real em um container Docker, permitindo que a aplicação seja testada de ponta a ponta em um ambiente semelhante ao de produção.
- **Cobertura de Código**: O JaCoCo é usado para medir a porcentagem de código coberta pelos testes.
- **Testes de Mutação**: O PIT é usado para avaliar a eficácia dos testes, introduzindo mutações no código e verificando se os testes falham.
