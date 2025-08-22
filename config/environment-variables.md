# Environment Variables

## Required Environment Variables

### Database Configuration
- **DB_HOST**: Database server hostname or IP address
  - Example: `localhost` or `192.168.1.100`
  - Required for database operations

- **DB_PORT**: Database server port
  - Example: `5432` (PostgreSQL), `3306` (MySQL)
  - Default: Varies by database type

- **DB_NAME**: Database name for the workflow
  - Example: `workflow_production` or `workflow_staging`
  - Required for database connections

- **DB_USER**: Database username
  - Example: `workflow_user`
  - Should have appropriate permissions for workflow operations

- **DB_PASSWORD**: Database user password
  - Store securely, never commit to version control
  - Use n8n credential management system

### API Integration Variables
- **API_BASE_URL**: Base URL for primary external API
  - Example: `https://api.external-service.com/v1`
  - Used for HTTP request nodes

- **API_KEY**: API authentication key
  - Store in n8n credentials, reference as environment variable
  - Required for authenticated API calls

- **API_SECRET**: API secret for OAuth or signed requests
  - Store securely in n8n credential system
  - Used for advanced authentication schemes

### Email Configuration
- **SMTP_HOST**: SMTP server hostname
  - Example: `smtp.gmail.com` or `mail.company.com`
  - Required for email notifications

- **SMTP_PORT**: SMTP server port
  - Example: `587` (TLS), `465` (SSL), `25` (plain)
  - Default: `587`

- **EMAIL_USER**: SMTP username/email address
  - Example: `notifications@company.com`
  - Used for SMTP authentication

- **EMAIL_PASSWORD**: SMTP password or app password
  - Store in n8n credential system
  - Required for SMTP authentication

- **DEFAULT_FROM_EMAIL**: Default sender email address
  - Example: `noreply@company.com`
  - Used when no specific sender is configured

- **DEFAULT_TO_EMAIL**: Default recipient for notifications
  - Example: `admin@company.com`
  - Used for system notifications and alerts

### Webhook Configuration
- **WEBHOOK_BASE_URL**: Base URL for incoming webhooks
  - Example: `https://n8n.company.com/webhook`
  - Used for webhook URL generation

- **WEBHOOK_SECRET**: Secret for webhook verification
  - Generate unique secret for security
  - Used to validate incoming webhook requests

### File Storage Configuration
- **STORAGE_TYPE**: File storage type
  - Options: `local`, `s3`, `gcs`, `azure`
  - Default: `local`

- **STORAGE_PATH**: Local storage path (if using local storage)
  - Example: `/var/lib/n8n/files`
  - Must be writable by n8n process

- **AWS_ACCESS_KEY_ID**: AWS access key (if using S3)
  - Required for S3 operations
  - Store in n8n credential system

- **AWS_SECRET_ACCESS_KEY**: AWS secret key (if using S3)
  - Required for S3 operations
  - Store securely

- **AWS_REGION**: AWS region (if using S3)
  - Example: `us-east-1`
  - Required for S3 operations

- **S3_BUCKET_NAME**: S3 bucket name (if using S3)
  - Example: `company-n8n-files`
  - Must exist and be accessible

## Optional Environment Variables

### Performance Configuration
- **MAX_EXECUTION_TIMEOUT**: Maximum workflow execution timeout (seconds)
  - Example: `3600` (1 hour)
  - Default: `1200` (20 minutes)

- **MAX_MEMORY_USAGE**: Maximum memory usage per execution (MB)
  - Example: `512`
  - Default: `256`

- **BATCH_SIZE**: Default batch size for data processing
  - Example: `100`
  - Default: `50`

### Monitoring and Logging
- **LOG_LEVEL**: Application log level
  - Options: `error`, `warn`, `info`, `debug`
  - Default: `info`

- **ENABLE_METRICS**: Enable performance metrics collection
  - Options: `true`, `false`
  - Default: `false`

- **METRICS_ENDPOINT**: Endpoint for metrics collection
  - Example: `http://prometheus:9090/metrics`
  - Required if ENABLE_METRICS is true

### Security Configuration
- **ENABLE_AUTH**: Enable workflow authentication
  - Options: `true`, `false`
  - Default: `true`

- **JWT_SECRET**: JWT token secret for authentication
  - Generate strong random secret
  - Required if ENABLE_AUTH is true

- **CORS_ORIGINS**: Allowed CORS origins
  - Example: `https://app.company.com,https://admin.company.com`
  - Comma-separated list of allowed origins

### Integration Specific Variables
- **SLACK_BOT_TOKEN**: Slack bot token for integrations
  - Required for Slack node operations
  - Store in n8n credential system

- **DISCORD_BOT_TOKEN**: Discord bot token
  - Required for Discord integrations
  - Store securely

- **OPENAI_API_KEY**: OpenAI API key for AI operations
  - Required for OpenAI node operations
  - Store in n8n credential system

## Environment-Specific Configurations

### Development Environment
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=workflow_dev
DB_USER=dev_user

# APIs
API_BASE_URL=https://api-staging.example.com
LOG_LEVEL=debug

# Email (use test accounts)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
DEFAULT_TO_EMAIL=test@mailtrap.io

# Performance (relaxed limits)
MAX_EXECUTION_TIMEOUT=7200
MAX_MEMORY_USAGE=1024
```

### Staging Environment
```bash
# Database
DB_HOST=staging-db.company.com
DB_PORT=5432
DB_NAME=workflow_staging
DB_USER=staging_user

# APIs
API_BASE_URL=https://api-staging.example.com
LOG_LEVEL=info

# Email
SMTP_HOST=smtp.company.com
DEFAULT_TO_EMAIL=staging-alerts@company.com

# Performance (production-like)
MAX_EXECUTION_TIMEOUT=3600
MAX_MEMORY_USAGE=512
```

### Production Environment
```bash
# Database
DB_HOST=prod-db.company.com
DB_PORT=5432
DB_NAME=workflow_production
DB_USER=prod_user

# APIs
API_BASE_URL=https://api.example.com
LOG_LEVEL=warn

# Email
SMTP_HOST=smtp.company.com
DEFAULT_TO_EMAIL=prod-alerts@company.com

# Performance (optimized)
MAX_EXECUTION_TIMEOUT=1800
MAX_MEMORY_USAGE=256
BATCH_SIZE=50

# Security (enhanced)
ENABLE_AUTH=true
CORS_ORIGINS=https://app.company.com

# Monitoring
ENABLE_METRICS=true
METRICS_ENDPOINT=http://prometheus:9090/metrics
```

## Security Best Practices

### Credential Management
- Never store sensitive values directly in environment variables
- Use n8n's built-in credential system for API keys and passwords
- Reference credentials in environment variables only for configuration
- Rotate credentials regularly

### Environment File Security
- Use `.env` files for local development only
- Never commit `.env` files to version control
- Set appropriate file permissions (600) for environment files
- Use container secrets or key management systems in production

### Validation and Defaults
- Validate all environment variables at startup
- Provide sensible defaults where possible
- Document required vs optional variables clearly
- Fail fast if critical variables are missing

## Configuration Validation

### Startup Checks
Implement checks for:
- Database connectivity
- API endpoint availability
- SMTP server accessibility
- File storage permissions
- Required credential availability

### Health Checks
Regular validation of:
- Database connection pool status
- External API response times
- Storage space availability
- Memory and CPU usage
- Authentication token validity

## Troubleshooting

### Common Issues
- **Database connection failures**: Check DB_HOST, DB_PORT, credentials
- **API authentication errors**: Verify API_KEY and API_SECRET
- **Email delivery failures**: Validate SMTP configuration
- **File storage errors**: Check permissions and available space
- **Timeout issues**: Adjust MAX_EXECUTION_TIMEOUT

### Environment Variable Priority
1. System environment variables (highest priority)
2. Docker environment variables
3. n8n environment file
4. Default values (lowest priority)

## Documentation Updates
Update this file when:
- Adding new integrations requiring configuration
- Changing default values
- Adding new environment-specific configurations
- Security requirements change