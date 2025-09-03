# 🚀 Quickstart

Guia rápido para rodar o projeto em ambiente local.  

# 📋Pré-requisitos
Antes de começar, certifique-se de ter instalado:

- [Docker](https://www.docker.com/) (com Docker Desktop ou equivalente rodando)
- [Java JDK 21](https://www.oracle.com/br/java/technologies/downloads/#java21)
- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)


Será necessário abrir **3 terminais** diferentes.

---

## 📦 Terminal 1: Banco de Dados (Docker)

```bash
cd backend
docker compose build # Necessário apenas na primeira vez ou caso sejam feitas alterações
docker compose up
```
Para remover todos os dados do banco e começar do zero (não deve ser necessário, mas é bom saber):
```bash
docker compose down -v # Apaga todos os dados
```


---

## 🔧 Terminal 2: Backend

### Pré-requisitos:
- **Java JDK 21** instalado  
- Verifique com:
  ```bash
  java -version
  ```

### Passos:
#### 🐧Linux:
```bash
cd backend
chmod +x ./mvnw   # ou chmod +x mvn
./mvnw spring-boot:run   # em alguns casos pode ser "mvn spring-boot:run"
```

#### 🪟 Windows:
```bash
cd backend
.\mvnw.cmd spring-boot:run   # em alguns casos pode ser "mvn spring-boot:run"
```

---

## 💻 Terminal 3: Frontend

### Pré-requisitos:
- **Node.js** instalado  
- **pnpm** instalado  

### Passos:
```bash
cd web
pnpm install
pnpm dev
```

---

## 🛠 Estrutura do Projeto

```bash
/
├── backend/    # Código do backend
├── docs/       # Documentação
└── web/        # Código do frontend
```
