# Infraestrutura AWS - Conexão Treinamento

Este diretório contém a configuração do Terraform para provisionar a infraestrutura AWS necessária para o projeto Conexão Treinamento.

## Recursos Criados

### 🗄️ Banco de Dados
- **RDS PostgreSQL 17.6** com instância `db.t3.micro`
- **AWS Secrets Manager** para armazenar credenciais do banco
- **Security Group** configurado para permitir acesso apenas do App Runner
- **DB Subnet Group** para isolamento de rede

### 🚀 App Runner
- **AWS App Runner Service** para hospedar a aplicação Spring Boot
- **VPC Connector** para comunicação segura com o RDS
- **Auto Scaling** configurável
- **Health Check** no endpoint `/actuator/health`

### 🔐 IAM Roles e Políticas
- **Instance Role** para o App Runner acessar Secrets Manager
- **Access Role** para o App Runner acessar ECR
- **Políticas** com permissões mínimas necessárias

### 🌐 Rede
- **Security Groups** para App Runner e RDS
- **VPC Connector** para conectividade privada

## Pré-requisitos

1. **AWS CLI** configurado com credenciais adequadas
2. **Terraform** >= 1.0 instalado
3. **Repositório ECR** já criado com a imagem da aplicação

## Como Usar

### 1. Configurar Variáveis

Copie o arquivo de exemplo e configure as variáveis:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edite o arquivo `terraform.tfvars` e configure:
- `docker_image_uri`: URI completa da imagem no ECR (obrigatório)
- Outras variáveis conforme necessário

### 2. Inicializar Terraform

```bash
terraform init
```

### 3. Planejar a Infraestrutura

```bash
terraform plan
```

### 4. Aplicar a Infraestrutura

```bash
terraform apply
```

### 5. Obter Outputs

Após a aplicação, você pode obter informações importantes:

```bash
# URL da aplicação
terraform output apprunner_service_url

# String de conexão do banco (sensível)
terraform output -raw db_connection_string

# ARN do secret com credenciais
terraform output db_secret_arn
```

## Variáveis de Ambiente da Aplicação

O App Runner será configurado automaticamente com as seguintes variáveis de ambiente:

- `SPRING_PROFILES_ACTIVE`: Perfil do Spring (baseado na variável `environment`)
- `AWS_REGION`: Região AWS
- `DB_SECRET_ARN`: ARN do secret com credenciais do banco
- `DB_HOST`: Endpoint do banco de dados
- `DB_PORT`: Porta do banco de dados
- `DB_NAME`: Nome do banco de dados

## Configuração da Aplicação Spring Boot

Para que a aplicação funcione corretamente, configure o `application.yml` para usar as variáveis de ambiente:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
    # As credenciais serão obtidas via AWS Secrets Manager
  
aws:
  region: ${AWS_REGION}
  secretsmanager:
    db-credentials-secret: ${DB_SECRET_ARN}
```

## Custos Estimados

### Desenvolvimento (configuração padrão):
- **RDS db.t3.micro**: ~$13/mês
- **App Runner**: ~$7/mês (0.5 vCPU, 1GB RAM, baixo tráfego)
- **Secrets Manager**: ~$0.40/mês
- **Total**: ~$20/mês

### Produção (configuração otimizada):
- **RDS db.t3.small**: ~$25/mês
- **App Runner**: ~$15-50/mês (dependendo do tráfego)
- **Secrets Manager**: ~$0.40/mês
- **Total**: ~$40-75/mês

## Monitoramento

O App Runner inclui:
- **Health Check** automático
- **Logs** integrados com CloudWatch
- **Métricas** de performance
- **Auto Scaling** baseado em CPU e requisições

## Segurança

- ✅ RDS em subnet privada
- ✅ Security Groups com regras mínimas
- ✅ Credenciais no Secrets Manager
- ✅ IAM roles com permissões mínimas
- ✅ Comunicação criptografada

## Limpeza

Para destruir toda a infraestrutura:

```bash
terraform destroy
```

⚠️ **Atenção**: Isso removerá permanentemente todos os recursos, incluindo o banco de dados!
