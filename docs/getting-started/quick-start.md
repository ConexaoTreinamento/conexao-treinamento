# 🚀 Quick Start - Conexão Treinamento

> Guia rápido para rodar o projeto em menos de 5 minutos

---

## 🎯 Objetivo

Este guia vai te ajudar a:
- ✅ Rodar o projeto localmente com Docker
- ✅ Fazer login e explorar a aplicação
- ✅ Entender a estrutura básica do projeto

---

## 📋 Pré-requisitos

### Opção 1: Docker (Recomendado)
- **Docker** 20.10+
- **Docker Compose** 2.0+

### Opção 2: Manual
- **Java** 21
- **Node.js** 20+
- **PostgreSQL** 16
- **Maven** 3.9+

---

## 🐳 Opção 1: Docker (Mais Rápido)

### Passo 1: Clone o projeto
```bash
git clone https://github.com/seu-usuario/conexao-treinamento.git
cd conexao-treinamento
```

### Passo 2: Inicie os serviços
```bash
docker-compose up -d
```

**O que está rodando:**
- ✅ **PostgreSQL** em `localhost:5432`
- ✅ **Backend API** em `localhost:8080`
- ✅ **Frontend** em `localhost:3000`

### Passo 3: Aguarde a inicialização
```bash
# Acompanhe os logs
docker-compose logs -f backend

# Aguarde até ver:
# "Started ConexaoTreinamentoBackendApplication in X.XXX seconds"
```

### Passo 4: Acesse a aplicação
```
🌐 Frontend: http://localhost:3000
📚 API Docs: http://localhost:8080/swagger-ui.html
💚 Health: http://localhost:8080/actuator/health
```

---

## 🖥️ Opção 2: Manual (Desenvolvimento)

### Passo 1: Clone e configure o banco
```bash
git clone https://github.com/seu-usuario/conexao-treinamento.git
cd conexao-treinamento

# Inicie o PostgreSQL (Docker)
docker run -d \
  --name postgres-conexao \
  -e POSTGRES_DB=conexao_treinamento \
  -e POSTGRES_USER=conexao \
  -e POSTGRES_PASSWORD=conexao123 \
  -p 5432:5432 \
  postgres:16-alpine
```

### Passo 2: Inicie o Backend
```bash
cd backend

# Configure as variáveis de ambiente (opcional)
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/conexao_treinamento
export SPRING_DATASOURCE_USERNAME=conexao
export SPRING_DATASOURCE_PASSWORD=conexao123

# Execute
./mvnw spring-boot:run
```

**Backend rodando em:** `http://localhost:8080`

### Passo 3: Inicie o Frontend
```bash
# Em outro terminal
cd web

# Instale dependências
npm install

# Configure variáveis de ambiente
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.local

# Execute
npm run dev
```

**Frontend rodando em:** `http://localhost:3000`

---

## 🔐 Login

### Credenciais Padrão

**Administrador:**
- Email: `admin@example.com`
- Senha: `admin123`

**Professor:**
- Email: `trainer@example.com`
- Senha: `trainer123`

> ⚠️ **IMPORTANTE:** Altere essas senhas em produção!

---

## 🗺️ Navegando na Aplicação

### 1. Dashboard
Após o login, você será direcionado para o **Schedule** (Agenda).

### 2. Menu Principal
- **📅 Agenda** - Visualize e gerencie treinos
- **👥 Alunos** - Cadastro e gestão de alunos
- **👨‍🏫 Professores** - Gestão de trainers (admin)
- **🛡️ Administradores** - Gestão de admins (admin)
- **💪 Exercícios** - Biblioteca de exercícios
- **🎉 Eventos** - Eventos especiais
- **👑 Planos** - Planos de treinamento
- **📊 Relatórios** - Estatísticas e métricas (admin)

### 3. Criar seu Primeiro Aluno
```
1. Clique em "Alunos" no menu
2. Clique no botão "+"
3. Preencha os dados
4. Clique em "Salvar"
```

### 4. Agendar um Treino
```
1. Vá para "Agenda"
2. Clique em um horário vazio
3. Adicione alunos
4. Prescreva exercícios
5. Salve a sessão
```

---

## 🧪 Testando a API

### Swagger UI
Acesse: `http://localhost:8080/swagger-ui.html`

### Exemplo com cURL
```bash
# 1. Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'

# Resposta: {"token": "eyJhbGciOiJIUzI1NiIs..."}

# 2. Listar Alunos (use o token acima)
curl -X GET http://localhost:8080/students \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 🔍 Verificando os Serviços

### Health Checks
```bash
# Backend
curl http://localhost:8080/actuator/health

# Database
curl http://localhost:8080/actuator/health/db

# Frontend (deve retornar HTML)
curl http://localhost:3000
```

### Logs
```bash
# Docker
docker-compose logs -f backend
docker-compose logs -f web

# Manual
# Backend: console do terminal
# Frontend: console do terminal
```

---

## 🛑 Parando os Serviços

### Docker
```bash
# Parar
docker-compose stop

# Parar e remover
docker-compose down

# Parar e remover com volumes (CUIDADO: apaga o banco!)
docker-compose down -v
```

### Manual
```bash
# Pressione Ctrl+C em cada terminal
```

---

## 🐛 Problemas Comuns

### Porta já em uso
```bash
# Verifique quem está usando a porta
lsof -i :8080  # Backend
lsof -i :3000  # Frontend
lsof -i :5432  # PostgreSQL

# Ou pare o serviço em conflito
```

### Backend não inicia
```bash
# Verifique se o PostgreSQL está rodando
docker ps | grep postgres

# Verifique as variáveis de ambiente
env | grep SPRING
```

### Frontend não conecta no backend
```bash
# Verifique se o backend está rodando
curl http://localhost:8080/actuator/health

# Verifique o arquivo .env.local
cat web/.env.local
```

### Banco de dados vazio
```bash
# Flyway roda automaticamente no primeiro start
# Verifique os logs do backend para ver as migrations

docker-compose logs backend | grep Flyway
```

---

## 📚 Próximos Passos

Agora que você tem tudo rodando:

1. **[📖 Entenda a Arquitetura](../architecture/overview.md)**
2. **[🔧 Configure seu Ambiente de Desenvolvimento](installation.md)**
3. **[🎨 Explore o Frontend](../../web/docs/README.md)**
4. **[📡 Entenda a API Backend](../../backend/docs/README.md)**
5. **[🤝 Contribua com o Projeto](../contributing/code-standards.md)**

---

## 🆘 Precisa de Ajuda?

- **Documentação:** [Ver índice completo](../)
- **Issues:** [GitHub Issues](https://github.com/seu-usuario/conexao-treinamento/issues)
- **API Reference:** [Swagger UI](http://localhost:8080/swagger-ui.html)

---

**Bom desenvolvimento! 🚀**

