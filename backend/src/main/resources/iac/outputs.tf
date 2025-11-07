# Database Outputs
output "db_password" {
  description = "Senha do banco de dados"
  value       = random_password.db_password.result
  sensitive   = true
}

output "db_connection_string" {
  description = "String de conexão com o banco de dados"
  value       = "postgresql://${local.db_username}:${local.db_password}@${aws_db_instance.postgres.address}:${aws_db_instance.postgres.port}/postgres"
  sensitive   = true
}

output "db_host" {
  description = "Endpoint do banco de dados"
  value       = aws_db_instance.postgres.address
}

output "db_port" {
  description = "Porta do banco de dados"
  value       = aws_db_instance.postgres.port
}

output "db_secret_arn" {
  description = "ARN do secret com as credenciais do banco"
  value       = aws_secretsmanager_secret.db_credentials.arn
}

# App Runner Outputs
output "apprunner_service_url" {
  description = "URL do serviço App Runner"
  value       = "https://${aws_apprunner_service.app.service_url}"
}

output "apprunner_service_arn" {
  description = "ARN do serviço App Runner"
  value       = aws_apprunner_service.app.arn
}

output "apprunner_service_id" {
  description = "ID do serviço App Runner"
  value       = aws_apprunner_service.app.service_id
}

output "apprunner_service_status" {
  description = "Status do serviço App Runner"
  value       = aws_apprunner_service.app.status
}

# IAM Outputs
output "apprunner_instance_role_arn" {
  description = "ARN da role de instância do App Runner"
  value       = aws_iam_role.apprunner_instance_role.arn
}

output "apprunner_access_role_arn" {
  description = "ARN da role de acesso do App Runner"
  value       = aws_iam_role.apprunner_access_role.arn
}

# VPC Outputs
output "vpc_connector_arn" {
  description = "ARN do VPC Connector"
  value       = aws_apprunner_vpc_connector.connector.arn
}

output "security_group_apprunner_id" {
  description = "ID do Security Group do App Runner"
  value       = aws_security_group.apprunner.id
}

output "security_group_rds_id" {
  description = "ID do Security Group do RDS"
  value       = aws_security_group.rds.id
}
