# n8n Nodes Catalog

## Core Nodes

### Trigger Nodes
- **Manual Trigger** (`n8n-nodes-base.manualTrigger`)
  - For testing and manual workflow execution
  - No configuration required

- **Webhook** (`n8n-nodes-base.webhook`)
  - HTTP endpoints for receiving data
  - Authentication options: Basic, Header Auth, Query Auth
  - Response configuration for immediate replies

- **Cron** (`n8n-nodes-base.cron`)
  - Schedule-based triggers
  - Supports complex cron expressions
  - Timezone configuration

- **File Trigger** (`n8n-nodes-base.fileTrigger`)
  - Monitor file system changes
  - Watch for file creation, modification, deletion
  - Filter by file patterns

### Core Processing Nodes
- **Code** (`n8n-nodes-base.code`)
  - Execute JavaScript or Python code
  - Access to input data via `$input` object
  - Return data using `return` statement

- **HTTP Request** (`n8n-nodes-base.httpRequest`)
  - Make API calls to external services
  - Authentication: None, Basic, Header, OAuth1, OAuth2
  - Request methods: GET, POST, PUT, PATCH, DELETE
  - Custom headers and query parameters

- **Set** (`n8n-nodes-base.set`)
  - Modify, add, or remove data fields
  - Data type conversions
  - Expression-based field values

- **Switch** (`n8n-nodes-base.switch`)
  - Route data based on conditions
  - Multiple comparison operations
  - Fallback routing for unmatched conditions

- **Merge** (`n8n-nodes-base.merge`)
  - Combine data from multiple inputs
  - Merge modes: Append, Keep Key Matches, Merge By Index
  - Handle different data structures

### Data Processing Nodes
- **Edit Fields** (`n8n-nodes-base.editFields`)
  - Advanced field manipulation
  - Rename, remove, or modify fields
  - Batch field operations

- **Sort** (`n8n-nodes-base.sort`)
  - Sort data by specified fields
  - Ascending or descending order
  - Multiple sort criteria

- **Aggregate** (`n8n-nodes-base.aggregate`)
  - Group and summarize data
  - Aggregation functions: count, sum, average, min, max
  - Group by multiple fields

- **Split In Batches** (`n8n-nodes-base.splitInBatches`)
  - Process large datasets in chunks
  - Configurable batch size
  - Reset after processing

### Utility Nodes
- **Wait** (`n8n-nodes-base.wait`)
  - Pause workflow execution
  - Wait for specific time or until specific datetime
  - Useful for rate limiting

- **NoOp** (`n8n-nodes-base.noOp`)
  - Pass-through node for workflow organization
  - No data modification
  - Useful for documentation and flow control

- **Error Trigger** (`n8n-nodes-base.errorTrigger`)
  - Handle workflow errors
  - Catch and process failed executions
  - Implement custom error handling logic

## Database Nodes

### SQL Databases
- **Postgres** (`n8n-nodes-base.postgres`)
  - PostgreSQL database operations
  - Raw SQL queries and operations
  - Transaction support

- **MySQL** (`n8n-nodes-base.mySql`)
  - MySQL/MariaDB database operations
  - CRUD operations and raw queries
  - Connection pooling

- **Microsoft SQL Server** (`n8n-nodes-base.microsoftSql`)
  - SQL Server database operations
  - Windows and SQL authentication
  - Stored procedure support

### NoSQL Databases
- **MongoDB** (`n8n-nodes-base.mongoDb`)
  - MongoDB document operations
  - Find, insert, update, delete operations
  - Aggregation pipeline support

- **Redis** (`n8n-nodes-base.redis`)
  - Redis key-value operations
  - String, hash, list, set operations
  - Pub/sub messaging

## Communication Nodes

### Email
- **Email** (`n8n-nodes-base.emailSend`)
  - Send emails via SMTP
  - HTML and text content
  - Attachments support

- **Gmail** (`n8n-nodes-base.gmail`)
  - Gmail API integration
  - Send, receive, search emails
  - OAuth2 authentication

### Messaging
- **Slack** (`n8n-nodes-base.slack`)
  - Slack API integration
  - Send messages, upload files
  - Channel and direct message support

- **Discord** (`n8n-nodes-base.discord`)
  - Discord bot integration
  - Send messages to channels
  - Webhook support

- **Telegram** (`n8n-nodes-base.telegram`)
  - Telegram bot API
  - Send messages, photos, documents
  - Inline keyboards support

## File and Storage Nodes

### File Operations
- **Read/Write File** (`n8n-nodes-base.readWriteFile`)
  - Local file system operations
  - Read and write text/binary files
  - Create directories

- **CSV** (`n8n-nodes-base.csv`)
  - Parse and generate CSV files
  - Custom delimiters and encoding
  - Header row handling

- **XML** (`n8n-nodes-base.xml`)
  - Parse and generate XML
  - XPath queries
  - Namespace support

### Cloud Storage
- **AWS S3** (`n8n-nodes-base.awsS3`)
  - Amazon S3 operations
  - Upload, download, list objects
  - Bucket management

- **Google Drive** (`n8n-nodes-base.googleDrive`)
  - Google Drive file operations
  - Upload, download, share files
  - Folder management

## Integration Nodes

### Popular Services
- **OpenAI** (`n8n-nodes-base.openAi`)
  - OpenAI API integration
  - GPT models for text generation
  - Image generation with DALL-E

- **Stripe** (`n8n-nodes-base.stripe`)
  - Stripe payment processing
  - Customers, charges, subscriptions
  - Webhook handling

- **Shopify** (`n8n-nodes-base.shopify`)
  - Shopify e-commerce platform
  - Products, orders, customers
  - Admin API and Storefront API

### CRM Systems
- **HubSpot** (`n8n-nodes-base.hubspot`)
  - HubSpot CRM integration
  - Contacts, companies, deals
  - Marketing automation

- **Salesforce** (`n8n-nodes-base.salesforce`)
  - Salesforce CRM operations
  - Lead, account, opportunity management
  - SOQL queries

## Node Configuration Best Practices

### Authentication
- Store credentials securely in n8n credential system
- Use environment variables for sensitive data
- Implement proper OAuth flows for supported services
- Regular credential rotation

### Error Handling
- Configure retry logic for unreliable services
- Set appropriate timeout values
- Use try/catch patterns with Error Trigger
- Implement fallback mechanisms

### Performance
- Use batch operations for multiple records
- Implement pagination for large datasets
- Configure connection pooling for databases
- Monitor resource usage

### Security
- Validate all input data
- Sanitize data before external API calls
- Use HTTPS for all external communications
- Implement rate limiting where necessary

## Custom Node Development
When existing nodes don't meet requirements:
- Create custom community nodes
- Use Code node for simple transformations
- Implement HTTP Request nodes for API integrations
- Consider contributing back to community

## Node Selection Guidelines

### For Data Input
- Use appropriate trigger based on data source
- Webhook for real-time data
- Cron for scheduled data fetching
- File Trigger for file-based workflows

### For Processing
- HTTP Request for API integrations
- Code node for complex transformations
- Switch node for conditional logic
- Database nodes for data persistence

### For Output
- Email/messaging nodes for notifications
- Database nodes for data storage
- File nodes for report generation
- HTTP Request for webhook deliveries

## Deprecated Nodes
- Check n8n documentation for deprecated nodes
- Plan migration to replacement nodes
- Test thoroughly when upgrading
- Monitor breaking changes in updates