# Supabase Node - Usage Guide

## Overview
The Supabase node provides comprehensive database operations for Supabase projects, offering both beginner-friendly auto-mapping and advanced filtering capabilities for production workflows.

## Getting Started

### Prerequisites
1. **Supabase Project**: Active Supabase project with database tables
2. **Service Key**: Supabase service role key (not anon key)
3. **API Access**: Database tables exposed through Supabase API
4. **Schema Access**: Custom schemas configured in API settings (if needed)

### Initial Setup
1. **Add Credentials**: Configure Supabase API credentials in n8n
   - Use your Supabase project URL
   - Use the service role key (never anon key for server-side operations)
   - Test credentials to ensure connectivity

2. **Verify Table Access**: Ensure your tables are accessible via Supabase API
   - Check Row Level Security (RLS) policies
   - Verify service role has necessary permissions
   - Test API endpoints in Supabase dashboard

## Basic Operations

### Creating Records

#### Auto-Map Input Data (Recommended for Dynamic Workflows)
```json
{
  "operation": "create",
  "tableId": "users",
  "dataToSend": "autoMapInputData",
  "inputsToIgnore": "id, created_at"
}
```

**Use Case**: When input data structure matches your database table
- Automatically maps all input fields to database columns
- Excludes specified fields (like auto-generated IDs)
- Perfect for data import and ETL workflows

#### Manual Field Mapping (Recommended for Static Workflows)
```json
{
  "operation": "create",
  "tableId": "users",
  "dataToSend": "defineBelow",
  "fieldsUi": {
    "fieldValues": [
      { "fieldId": "email", "fieldValue": "{{ $json.userEmail }}" },
      { "fieldId": "name", "fieldValue": "{{ $json.fullName }}" },
      { "fieldId": "status", "fieldValue": "active" }
    ]
  }
}
```

**Use Case**: When you need precise control over data mapping
- Explicit field-to-column mapping
- Data transformation during insertion
- Static schema with consistent structure

### Reading Records

#### Get Specific Records
```json
{
  "operation": "get",
  "tableId": "users",
  "filters": {
    "conditions": [
      {
        "keyName": "email",
        "keyValue": "{{ $json.email }}"
      },
      {
        "keyName": "status", 
        "keyValue": "active"
      }
    ]
  }
}
```

**Use Case**: Retrieve specific records with simple equality conditions
- Simplified filter structure for GET operation
- Multiple conditions act as AND filters
- Returns first matching record only
- Useful for exact record lookups and validation

#### Get All Records with Filtering
```json
{
  "operation": "getAll",
  "tableId": "users",
  "filterType": "manual",
  "matchType": "anyFilter",
  "returnAll": false,
  "limit": 100,
  "filtersUI": {
    "conditions": [
      {
        "keyName": "status",
        "condition": "eq",
        "keyValue": "active"
      },
      {
        "keyName": "created_at",
        "condition": "gte",
        "keyValue": "2024-01-01"
      }
    ]
  }
}
```

**Use Case**: Retrieve multiple records with advanced filtering
- Enhanced filter UI with condition operators
- Support for AND/OR logic with matchType
- Automatic pagination for large datasets
- Control over result limits with flexible operators

### Updating Records
```json
{
  "operation": "update",
  "tableId": "users",
  "filterType": "manual",
  "matchType": "allFilters",
  "filtersUI": {
    "conditions": [
      {
        "keyName": "id",
        "condition": "eq",
        "keyValue": "{{ $json.userId }}"
      }
    ]
  },
  "dataToSend": "defineBelow",
  "fieldsUi": {
    "fieldValues": [
      { "fieldId": "last_login", "fieldValue": "{{ $now }}" },
      { "fieldId": "login_count", "fieldValue": "{{ $json.loginCount + 1 }}" }
    ]
  }
}
```

**Use Case**: Modify existing records with precise filtering
- Enhanced filter UI with condition operators
- Requires filter conditions to identify records
- Supports both auto-mapping and manual field definition
- Can update multiple records if filter matches multiple rows

### Deleting Records
```json
{
  "operation": "delete",
  "tableId": "users",
  "filterType": "manual",
  "matchType": "allFilters",
  "filtersUI": {
    "conditions": [
      {
        "keyName": "status",
        "condition": "eq",
        "keyValue": "deleted"
      },
      {
        "keyName": "last_login",
        "condition": "lt",
        "keyValue": "2023-01-01"
      }
    ]
  }
}
```

**Use Case**: Remove records based on specific criteria
- Enhanced filter UI with condition operators
- Requires filter conditions for safety
- Can delete multiple records if filter matches multiple rows
- Use with caution in production environments

## Advanced Usage

### Custom Schema Support
```json
{
  "useCustomSchema": true,
  "schema": "analytics",
  "tableId": "user_events",
  "operation": "create"
}
```

**Requirements**: 
- Schema must be exposed in Supabase API settings
- Service role must have access to the custom schema
- Tables in custom schema must be accessible via PostgREST

### Advanced Filtering with Raw Strings
```json
{
  "operation": "getAll",
  "tableId": "users",
  "filterType": "string",
  "filterString": "age.gte.18&age.lte.65&status.eq.active&select=id,name,email"
}
```

**Use Case**: Complex queries requiring PostgREST syntax
- Direct PostgREST query parameter control
- Advanced operators and functions
- Custom select fields and joins
- Power user scenarios

### Full-Text Search Capabilities
```json
{
  "operation": "getAll",
  "tableId": "articles",
  "filterType": "manual",
  "matchType": "allFilters",
  "filters": {
    "conditions": [
      {
        "keyName": "content",
        "condition": "fullText",
        "searchFunction": "websearch_to_tsquery",
        "keyValue": "database performance optimization"
      }
    ]
  }
}
```

**Full-Text Search Functions**:
- `to_tsquery` (fts): Advanced query syntax with operators (AND, OR, NOT)
- `plainto_tsquery` (plfts): Plain text search, automatically handles common words
- `phraseto_tsquery` (phfts): Exact phrase matching
- `websearch_to_tsquery` (wfts): Web-style search with quotes and operators

**Use Case**: Advanced text search in content fields
- Search blog posts, articles, or documentation
- Natural language query processing
- Relevance-based result ranking
- Support for complex search expressions

### Batch Processing with Error Handling
```json
{
  "operation": "create",
  "tableId": "orders",
  "dataToSend": "autoMapInputData",
  "continueOnFail": true
}
```

**Configuration**: 
- Enable "Continue on Fail" in node settings
- Process large batches without stopping on individual failures
- Review execution results for error details
- Implement error handling in downstream nodes

## Filter Operators Reference

### Comparison Operators
- `eq`: Equal to (`field.eq.value`)
- `neq`: Not equal to (`field.neq.value`)
- `gt`: Greater than (`field.gt.10`)
- `gte`: Greater than or equal (`field.gte.10`)
- `lt`: Less than (`field.lt.100`)
- `lte`: Less than or equal (`field.lte.100`)

### Pattern Matching
- `like`: Pattern matching with wildcards (`field.like.*pattern*`)
- `ilike`: Case-insensitive pattern matching (`field.ilike.*PATTERN*`)

### Exact Value Operations
- `is`: Exact equality for null, true, false, unknown (`field.is.null`, `field.is.true`)

### Full-Text Search (PostgreSQL)
- `fullText` with search functions:
  - `fts` (to_tsquery): Advanced syntax with AND, OR, NOT operators
  - `plfts` (plainto_tsquery): Plain text search, natural language
  - `phfts` (phraseto_tsquery): Exact phrase matching with quotes
  - `wfts` (websearch_to_tsquery): Web-style search with mixed operators

### Set Operations
- `in`: In list (`field.in.(value1,value2,value3)`)

### Array Operations (for JSON columns)
- `cs`: Contains (`tags.cs.{technology}`)
- `cd`: Contained in (`permissions.cd.{read,write}`)

## Common Use Cases

### 1. User Registration Workflow
```json
{
  "operation": "create",
  "tableId": "users",
  "dataToSend": "autoMapInputData",
  "inputsToIgnore": "id, created_at, updated_at"
}
```

**Scenario**: New user signs up through your application
- Auto-map registration form data
- Exclude system-generated fields
- Handle validation errors gracefully

### 2. Order Processing System
```json
{
  "operation": "update",
  "tableId": "orders",
  "filterType": "manual",
  "filters": {
    "conditions": [
      { "key": "order_id", "operator": "eq", "value": "{{ $json.orderId }}" }
    ]
  },
  "fieldsUi": {
    "fieldValues": [
      { "fieldId": "status", "fieldValue": "processing" },
      { "fieldId": "updated_at", "fieldValue": "{{ $now }}" }
    ]
  }
}
```

**Scenario**: Update order status as it moves through fulfillment
- Find specific order by ID
- Update status and timestamp
- Track order progression

### 3. Analytics Data Collection
```json
{
  "operation": "create",
  "tableId": "events",
  "useCustomSchema": true,
  "schema": "analytics",
  "dataToSend": "autoMapInputData"
}
```

**Scenario**: Collect user interaction events for analysis
- Use dedicated analytics schema
- Auto-map event data structure
- High-volume data insertion

### 4. Data Cleanup Operations
```json
{
  "operation": "delete",
  "tableId": "temp_data",
  "filterType": "manual",
  "filters": {
    "conditions": [
      { "keyName": "created_at", "condition": "lt", "keyValue": "{{ $now - 86400 }}" }
    ]
  }
}
```

**Scenario**: Remove temporary data older than 24 hours
- Time-based cleanup filtering
- Automated maintenance workflows
- Bulk deletion operations

### 5. Content Search System
```json
{
  "operation": "getAll",
  "tableId": "knowledge_base",
  "filterType": "manual",
  "matchType": "anyFilter",
  "filters": {
    "conditions": [
      {
        "keyName": "title",
        "condition": "fullText",
        "searchFunction": "websearch_to_tsquery",
        "keyValue": "{{ $json.searchQuery }}"
      },
      {
        "keyName": "content",
        "condition": "fullText",
        "searchFunction": "plainto_tsquery",
        "keyValue": "{{ $json.searchQuery }}"
      }
    ]
  }
}
```

**Scenario**: Search through documentation or knowledge base
- Full-text search across multiple content fields
- Natural language query processing
- Relevance-based ranking
- Support for complex search expressions

## Performance Optimization

### 1. Batch Operations
- Process multiple records in single operations when possible
- Use auto-mapping for consistent data structures
- Enable continue-on-fail for resilient batch processing

### 2. Efficient Filtering
- Create database indexes for commonly filtered columns
- Use specific filters to reduce result set size
- Limit results when full dataset isn't needed

### 3. Schema Optimization
- Use appropriate data types for your columns
- Implement Row Level Security (RLS) for data access control
- Consider table partitioning for very large datasets

## Security Best Practices

### 1. Credential Management
- Use service role key for server-side operations
- Never expose service keys in client-side code
- Rotate keys regularly per security policy
- Store keys securely in n8n credential system

### 2. Data Access Control
- Implement Row Level Security (RLS) policies
- Use least privilege principle for service role
- Audit data access patterns regularly
- Monitor for suspicious query patterns

### 3. Input Validation
- Validate data types before database operations
- Sanitize user input to prevent injection attacks
- Use parameterized queries (handled automatically)
- Implement business logic validation

## Troubleshooting

### Common Issues

#### 1. "Table not found" Error
**Symptoms**: Cannot load tables or get "table not found" errors
**Solutions**:
- Verify table exists in Supabase dashboard
- Check table is exposed in API settings
- Ensure service role has access permissions
- Confirm correct schema selection (public vs custom)

#### 2. "Insufficient privileges" Error
**Symptoms**: Authentication succeeds but operations fail
**Solutions**:
- Review Row Level Security (RLS) policies
- Check service role permissions
- Verify table-level access controls
- Test with simpler operations first

#### 3. "Invalid filter" Error
**Symptoms**: Filter conditions cause query failures
**Solutions**:
- Validate column names and types
- Check operator compatibility with data types
- Use string filters for complex PostgREST queries
- Review PostgREST documentation for syntax

#### 4. Performance Issues
**Symptoms**: Slow queries or timeouts
**Solutions**:
- Add database indexes for filtered columns
- Use limits for large datasets
- Optimize filter conditions
- Consider pagination for very large results

### Debug Strategies

1. **Test Credentials**: Use the built-in credential test feature
2. **Start Simple**: Begin with basic operations before complex filtering
3. **Check Logs**: Review n8n execution logs for detailed error messages
4. **Supabase Dashboard**: Test queries directly in Supabase SQL editor
5. **API Testing**: Use Postman or curl to test API endpoints directly

## Migration from Other Database Nodes

### From PostgreSQL Node
- Replace SQL queries with Supabase operations
- Map WHERE clauses to filter conditions
- Convert INSERT statements to create operations
- Adapt JOIN operations to separate node calls or string filters

### From Generic HTTP Node
- Replace manual API calls with structured operations
- Use built-in credential management instead of custom headers
- Leverage dynamic table/column loading instead of hardcoded values
- Utilize error handling features instead of custom error logic

This usage guide provides comprehensive coverage of Supabase node functionality for both beginners and advanced users, ensuring successful database integration in your n8n workflows.