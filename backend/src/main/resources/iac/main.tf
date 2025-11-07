provider "aws" {
  region = var.aws_region
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

# VPC e Security Groups
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

resource "aws_security_group" "rds" {
  name_prefix = "${var.app_name}-rds-"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.apprunner.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.app_name}-rds-sg"
    Environment = var.environment
  }
}

resource "aws_security_group" "apprunner" {
  name_prefix = "${var.app_name}-apprunner-"
  vpc_id      = data.aws_vpc.default.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.app_name}-apprunner-sg"
    Environment = var.environment
  }
}

resource "aws_db_subnet_group" "postgres" {
  name       = "${var.app_name}-db-subnet-group"
  subnet_ids = data.aws_subnets.default.ids

  tags = {
    Name        = "${var.app_name}-db-subnet-group"
    Environment = var.environment
  }
}

resource "aws_db_instance" "postgres" {
  identifier                = "${var.app_name}-db"
  allocated_storage         = 20
  engine                    = "postgres"
  engine_version            = "17.6"
  instance_class            = "db.t3.micro"
  username                  = local.db_username
  password                  = local.db_password
  skip_final_snapshot       = true
  publicly_accessible       = false
  vpc_security_group_ids    = [aws_security_group.rds.id]
  db_subnet_group_name      = aws_db_subnet_group.postgres.name
  backup_retention_period   = 7
  backup_window            = "03:00-04:00"
  maintenance_window       = "sun:04:00-sun:05:00"

  tags = {
    Name        = "${var.app_name}-database"
    Environment = var.environment
  }
}


# IAM Role para App Runner Instance
resource "aws_iam_role" "apprunner_instance_role" {
  name = "${var.app_name}-apprunner-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "tasks.apprunner.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.app_name}-apprunner-instance-role"
    Environment = var.environment
  }
}

# Política para acessar Secrets Manager
resource "aws_iam_policy" "apprunner_secrets_policy" {
  name        = "${var.app_name}-apprunner-secrets-policy"
  description = "Policy for App Runner to access Secrets Manager"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = [
          aws_secretsmanager_secret.db_credentials.arn
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "apprunner_secrets_policy_attachment" {
  role       = aws_iam_role.apprunner_instance_role.name
  policy_arn = aws_iam_policy.apprunner_secrets_policy.arn
}

# IAM Role para App Runner Access (para acessar ECR)
resource "aws_iam_role" "apprunner_access_role" {
  name = "${var.app_name}-apprunner-access-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "build.apprunner.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.app_name}-apprunner-access-role"
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "apprunner_access_role_policy" {
  role       = aws_iam_role.apprunner_access_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
}

# VPC Connector para App Runner
resource "aws_apprunner_vpc_connector" "connector" {
  vpc_connector_name = "${var.app_name}-vpc-connector"
  subnets            = data.aws_subnets.default.ids
  security_groups    = [aws_security_group.apprunner.id]

  tags = {
    Name        = "${var.app_name}-vpc-connector"
    Environment = var.environment
  }
}

# App Runner Service
resource "aws_apprunner_service" "app" {
  service_name = "${var.app_name}-backend"

  source_configuration {
    image_repository {
      image_identifier      = var.docker_image_uri
      image_configuration {
        port = var.app_port
        runtime_environment_variables = {
          SPRING_PROFILES_ACTIVE = var.environment
          AWS_REGION            = var.aws_region
          DB_SECRET_ARN         = aws_secretsmanager_secret.db_credentials.arn
          DB_HOST               = aws_db_instance.postgres.address
          DB_PORT               = tostring(aws_db_instance.postgres.port)
          DB_NAME               = "postgres"
        }
      }
      image_repository_type = "ECR"
    }
    access_role_arn = aws_iam_role.apprunner_access_role.arn
  }

  instance_configuration {
    cpu               = var.cpu
    memory            = var.memory
    instance_role_arn = aws_iam_role.apprunner_instance_role.arn
  }

  auto_scaling_configuration {
    auto_scaling_configuration_name = "${var.app_name}-auto-scaling"
    max_concurrency                = var.auto_scaling_max_concurrency
    max_size                       = var.auto_scaling_max_size
    min_size                       = var.auto_scaling_min_size
  }

  network_configuration {
    egress_configuration {
      egress_type       = "VPC"
      vpc_connector_arn = aws_apprunner_vpc_connector.connector.arn
    }
  }

  health_check_configuration {
    healthy_threshold   = 1
    interval            = 10
    path                = "/actuator/health"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 5
  }

  tags = {
    Name        = "${var.app_name}-backend-service"
    Environment = var.environment
  }

  depends_on = [
    aws_db_instance.postgres,
    aws_secretsmanager_secret_version.db_credentials_version
  ]
}

