provider "aws" {
  region = "us-east-2"
}

resource "random_password" "db_password" {
  length  = 16
  special = true
}

resource "aws_secretsmanager_secret" "db_credentials" {
  name = "conexao-treinamento-db-credentials"
}

resource "aws_secretsmanager_secret_version" "db_credentials_version" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = "conexao_treinamento_admin"
    password = random_password.db_password.result
  })
}

# Use locals from the known inputs (no need to re-read the secret)
locals {
  db_username = "conexao_treinamento_admin"
  db_password = random_password.db_password.result
}

resource "aws_db_instance" "postgres" {
  identifier             = "conexao-treinamento-db"
  allocated_storage      = 20
  engine                 = "postgres"
  engine_version         = "17.6"
  instance_class         = "db.t3.micro"
  username               = local.db_username
  password               = local.db_password
  skip_final_snapshot    = true
  publicly_accessible    = true
}

output "db_password" {
  value     = local.db_password
  sensitive = true
}

output "db_connection_string" {
  value     = "postgresql://${local.db_username}:${local.db_password}@${aws_db_instance.postgres.address}:${aws_db_instance.postgres.port}/postgres"
  sensitive = true
}
