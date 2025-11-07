variable "app_name" {
  description = "Nome da aplicação"
  type        = string
  default     = "conexao-treinamento"
}

variable "environment" {
  description = "Ambiente de deploy (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "Região AWS"
  type        = string
  default     = "us-east-2"
}

variable "docker_image_uri" {
  description = "URI da imagem Docker no ECR (obrigatório)"
  type        = string
}

variable "app_port" {
  description = "Porta da aplicação"
  type        = number
  default     = 8080
}

variable "cpu" {
  description = "CPU para o App Runner (0.25 vCPU, 0.5 vCPU, 1 vCPU, 2 vCPU)"
  type        = string
  default     = "0.5 vCPU"
}

variable "memory" {
  description = "Memória para o App Runner (0.5 GB, 1 GB, 2 GB, 3 GB, 4 GB)"
  type        = string
  default     = "1 GB"
}

variable "auto_scaling_max_concurrency" {
  description = "Número máximo de requisições concorrentes por instância"
  type        = number
  default     = 100
}

variable "auto_scaling_max_size" {
  description = "Número máximo de instâncias"
  type        = number
  default     = 10
}

variable "auto_scaling_min_size" {
  description = "Número mínimo de instâncias"
  type        = number
  default     = 1
}
