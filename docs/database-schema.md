# Database Schema

## Overview
[Describe database requirements for this workflow]

## Database Selection
- **Database Type**: [PostgreSQL/MySQL/MongoDB/etc.]
- **Version**: [Specific version requirements]
- **Connection**: [Connection method and credentials needed]

## Tables/Collections

### Table 1: [table_name]
**Purpose**: [Description of table purpose]

#### Schema
```sql
CREATE TABLE table_name (
    id SERIAL PRIMARY KEY,
    field1 VARCHAR(255) NOT NULL,
    field2 INTEGER,
    field3 TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    field4 BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Fields
- **id**: Primary key, auto-increment
- **field1**: [Description and constraints]
- **field2**: [Description and constraints]
- **field3**: [Description and constraints]
- **field4**: [Description and constraints]
- **created_at**: Record creation timestamp
- **updated_at**: Record update timestamp

#### Indexes
```sql
CREATE INDEX idx_table_name_field1 ON table_name(field1);
CREATE INDEX idx_table_name_created_at ON table_name(created_at);
```

### Table 2: [another_table]
[Similar structure for additional tables]

## Relationships

### Foreign Keys
```sql
ALTER TABLE child_table 
ADD CONSTRAINT fk_parent_id 
FOREIGN KEY (parent_id) REFERENCES parent_table(id);
```

### Relationship Diagram
```
parent_table (1) ──── (many) child_table
```

## Data Rules and Constraints

### Business Rules
- [Specific business logic constraints]
- [Data validation rules]
- [Required field combinations]
- [Conditional constraints]

### Technical Constraints
- **Character Limits**: [Field length restrictions]
- **Data Types**: [Specific type requirements]
- **Unique Constraints**: [Fields that must be unique]
- **Check Constraints**: [Value validation rules]

## Queries Used by Workflow

### Insert Operations
```sql
-- Insert new record
INSERT INTO table_name (field1, field2, field3) 
VALUES ($1, $2, $3);
```

### Update Operations
```sql
-- Update existing record
UPDATE table_name 
SET field2 = $1, updated_at = CURRENT_TIMESTAMP 
WHERE id = $2;
```

### Select Operations
```sql
-- Get records for processing
SELECT id, field1, field2 
FROM table_name 
WHERE field3 > $1 
ORDER BY created_at DESC;
```

### Delete Operations
```sql
-- Archive old records
DELETE FROM table_name 
WHERE created_at < $1;
```

## Performance Considerations

### Indexing Strategy
- Primary indexes on frequently queried fields
- Composite indexes for multi-column queries
- Partial indexes for filtered queries
- Consider index maintenance overhead

### Query Optimization
- Use appropriate data types
- Limit result sets with pagination
- Use EXISTS instead of IN for large datasets
- Avoid N+1 query patterns

## Data Migration

### Initial Setup
```sql
-- Create database
CREATE DATABASE workflow_db;

-- Create user
CREATE USER workflow_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE workflow_db TO workflow_user;
```

### Schema Versioning
- Track schema changes with migrations
- Use version numbers for schema updates
- Plan clean migration paths
- Document breaking changes

## Backup and Maintenance

### Backup Strategy
- Regular automated backups
- Point-in-time recovery capability
- Test backup restoration procedures
- Store backups securely

### Maintenance Tasks
- Regular VACUUM and ANALYZE
- Index maintenance and rebuilding
- Statistics updates
- Archive old data

## Security Considerations

### Access Control
- Principle of least privilege
- Role-based access control
- Connection encryption (SSL/TLS)
- Regular password rotation

### Data Protection
- Encrypt sensitive data at rest
- Mask PII in logs
- Implement data retention policies
- Comply with privacy regulations

## Monitoring and Alerting

### Performance Metrics
- Query execution times
- Connection pool usage
- Disk space utilization
- Lock contention

### Alert Thresholds
- Slow query alerts (> 5 seconds)
- High connection count (> 80% of max)
- Disk space warnings (> 90% full)
- Replication lag alerts

## Connection Configuration

### n8n Database Node Settings
```json
{
  "host": "localhost",
  "port": 5432,
  "database": "workflow_db",
  "user": "workflow_user",
  "password": "[stored in n8n credentials]",
  "ssl": true,
  "connectionTimeout": 30000,
  "queryTimeout": 60000
}
```

### Connection Pool Settings
- **Max Connections**: 10
- **Idle Timeout**: 30000ms
- **Connection Timeout**: 30000ms
- **Query Timeout**: 60000ms