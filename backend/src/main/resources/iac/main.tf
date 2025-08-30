# main.tf
provider "aws" {
  region = "us-east-1"
}

# -----------------
# Postgres RDS with Secrets Manager
# -----------------

# Generate a secure password for the database
resource "random_password" "db_password" {
  length  = 16
  special = true
}

# Create a secret in Secrets Manager for the database credentials
resource "aws_secretsmanager_secret" "db_credentials" {
  name = "conexao-treinamento-db-credentials"
}

# Store the username and generated password in the secret
resource "aws_secretsmanager_secret_version" "db_credentials_version" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = "conexao_treinamento_admin"
    password = random_password.db_password.result
  })
}

# Retrieve the secret values for use in the RDS resource
data "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
}

locals {
  db_creds = jsondecode(data.aws_secretsmanager_secret_version.db_credentials.secret_string)
}

resource "aws_db_instance" "postgres" {
  identifier             = "conexao-treinamento-db"
  allocated_storage      = 20
  engine                 = "postgres"
  engine_version         = "15.5"
  instance_class         = "db.t3.micro"
  username               = local.db_creds.username
  password               = local.db_creds.password
  skip_final_snapshot    = true
  publicly_accessible    = true
}

# -----------------
# Outputs
# -----------------

output "db_password" {
  value     = local.db_creds.password
}

# Output the full database connection string
output "db_connection_string" {
  value = "postgresql://${local.db_creds.username}:${local.db_creds.password}@${aws_db_instance.postgres.address}:${aws_db_instance.postgres.port}/postgres"
  sensitive = true
}