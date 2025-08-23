# Edit Fields (Set) Node - Usage Guide

## Overview
The Edit Fields (Set) node is one of n8n's most versatile core processing nodes, providing powerful field manipulation capabilities through dual operation modes, comprehensive version management, and advanced data transformation features.

## When to Use the Set Node

### Primary Use Cases
- **Data Standardization**: Normalize field formats across different data sources
- **Field Enrichment**: Add computed fields, metadata, and derived values
- **Data Restructuring**: Transform flat data into nested objects or vice versa
- **Conditional Processing**: Apply different transformations based on data conditions
- **API Response Formatting**: Structure data for specific API requirements
- **Data Quality Enhancement**: Add validation, scoring, and quality metrics

### Node Selection Guidelines
- **Use Set Node**: When you need to modify existing data while preserving workflow context
- **Use Function Node**: For complex JavaScript logic requiring external libraries
- **Use Code Node**: For multi-language support or extensive custom logic
- **Use Merge Node**: For combining data from multiple sources

## Operation Modes

### Manual Mode (Recommended for Most Cases)

#### When to Use Manual Mode
- Simple field transformations
- Readable and maintainable workflows
- Team collaboration environments
- When individual field error handling is important
- For documentation and auditability

#### Basic Field Operations
```json
{
  "mode": "manual",
  "fields": {
    "values": [
      {
        "name": "full_name",
        "type": "string",
        "value": "={{ ($json.first_name || '') + ' ' + ($json.last_name || '') }}"
      },
      {
        "name": "processed_at",
        "type": "string", 
        "value": "={{ new Date().toISOString() }}"
      },
      {
        "name": "is_active",
        "type": "boolean",
        "value": "={{ $json.status === 'active' }}"
      }
    ]
  }
}
```

### Raw Mode (Advanced Users)

#### When to Use Raw Mode
- Complete data restructuring required
- Performance-critical operations
- Complex array/object manipulations
- Advanced JavaScript logic needed
- When output structure differs significantly from input

#### Complete Data Transformation
```json
{
  "mode": "raw",
  "jsonOutput": "={{ { user: { id: $json.id, profile: { name: $json.name, email: $json.email } }, metadata: { processed_at: new Date().toISOString(), workflow_id: $workflow.id } } }}"
}
```

## Common Usage Patterns

### 1. Data Standardization

#### Name Standardization
```json
{
  "name": "standardized_name",
  "type": "string",
  "value": "={{ ($json.first_name || '').trim().toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + ' ' + ($json.last_name || '').trim().toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') }}"
}
```

#### Email Standardization
```json
{
  "name": "clean_email",
  "type": "string",
  "value": "={{ $json.email ? $json.email.trim().toLowerCase() : '' }}"
}
```

#### Phone Number Standardization
```json
{
  "name": "formatted_phone",
  "type": "string",
  "value": "={{ $json.phone ? $json.phone.replace(/[^\\d]/g, '').replace(/^1/, '') : '' }}"
}
```

### 2. Data Validation and Quality

#### Email Validation
```json
{
  "name": "email_valid",
  "type": "boolean",
  "value": "={{ $json.email && /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test($json.email) }}"
}
```

#### Data Completeness Score
```json
{
  "name": "completeness_score",
  "type": "number",
  "value": "={{ ($json.name ? 20 : 0) + ($json.email ? 20 : 0) + ($json.phone ? 20 : 0) + ($json.address ? 20 : 0) + ($json.company ? 20 : 0) }}"
}
```

#### Data Quality Assessment
```json
{
  "name": "data_quality",
  "type": "object",
  "value": "={{ { completeness: ($json.name ? 1 : 0) + ($json.email ? 1 : 0), validity: { email: $json.email && /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test($json.email), phone: $json.phone && /^[\\+]?[1-9][\\d]{0,15}$/.test($json.phone) }, score: (($json.name ? 25 : 0) + ($json.email ? 25 : 0) + ($json.phone ? 25 : 0) + ($json.address ? 25 : 0)) } }}"
}
```

### 3. Computed Fields and Enrichment

#### Age Calculation
```json
{
  "name": "age",
  "type": "number",
  "value": "={{ $json.birth_date ? Math.floor((new Date() - new Date($json.birth_date)) / (365.25 * 24 * 60 * 60 * 1000)) : null }}"
}
```

#### Domain Extraction
```json
{
  "name": "email_domain",
  "type": "string",
  "value": "={{ $json.email && $json.email.includes('@') ? $json.email.split('@')[1] : '' }}"
}
```

#### Account Age in Days
```json
{
  "name": "account_age_days",
  "type": "number",
  "value": "={{ $json.created_at ? Math.floor((new Date() - new Date($json.created_at)) / (24 * 60 * 60 * 1000)) : 0 }}"
}
```

### 4. Conditional Processing

#### Status-Based Field Assignment
```json
{
  "name": "priority_level",
  "type": "string",
  "value": "={{ $json.subscription_type === 'premium' ? 'high' : $json.subscription_type === 'pro' ? 'medium' : 'low' }}"
}
```

#### Conditional Object Creation
```json
{
  "name": "features",
  "type": "object",
  "value": "={{ $json.plan === 'premium' ? { analytics: true, support: '24/7', api_calls: 10000 } : $json.plan === 'pro' ? { analytics: true, support: 'business_hours', api_calls: 5000 } : { analytics: false, support: 'email', api_calls: 1000 } }}"
}
```

### 5. Workflow Metadata and Context

#### Execution Context
```json
{
  "name": "execution_context",
  "type": "object",
  "value": "={{ { workflow: { id: $workflow.id, name: $workflow.name }, execution: { id: $execution.id, mode: $execution.mode }, node: $node.name, timestamp: new Date().toISOString() } }}"
}
```

#### Processing Metadata
```json
{
  "name": "processing_info",
  "type": "object", 
  "value": "={{ { processed_by: 'n8n', processed_at: new Date().toISOString(), version: '1.0', input_hash: JSON.stringify($json).length } }}"
}
```

### 6. Array and Object Manipulation

#### Array Processing (Raw Mode)
```json
{
  "mode": "raw",
  "jsonOutput": "={{ { ...($json), processed_items: $json.items ? $json.items.map(item => ({ ...item, processed: true, processed_at: new Date().toISOString() })) : [] } }}"
}
```

#### Object Filtering (Raw Mode)
```json
{
  "mode": "raw",
  "jsonOutput": "={{ Object.fromEntries(Object.entries($json).filter(([key, value]) => value !== null && value !== '' && value !== undefined)) }}"
}
```

#### Nested Object Creation
```json
{
  "name": "user_profile",
  "type": "object",
  "value": "={{ { personal: { name: $json.name, email: $json.email }, professional: { company: $json.company, role: $json.role }, preferences: { theme: 'light', notifications: true } } }}"
}
```

## Field Inclusion Strategies

### Include All Input Fields (Default)
```json
{
  "includeOtherFields": true,
  "include": "all"
}
```
**Use Case**: Preserve all existing data while adding new fields

### Include Selected Fields Only
```json
{
  "includeOtherFields": true,
  "include": "selected",
  "includeFields": "id,name,email,created_at"
}
```
**Use Case**: Selective field preservation for payload optimization

### Exclude Specific Fields
```json
{
  "includeOtherFields": true,
  "include": "except",
  "excludeFields": "password,internal_notes,temp_data"
}
```
**Use Case**: Remove sensitive or unnecessary fields while keeping others

### Transform Only (No Input Preservation)
```json
{
  "includeOtherFields": false
}
```
**Use Case**: Complete data restructuring with only transformed fields

## Advanced Usage Techniques

### 1. Dynamic Field Generation

#### Field Name Generation
```json
{
  "mode": "raw",
  "jsonOutput": "={{ Object.fromEntries(Object.entries($json).map(([key, value]) => [`processed_${key}`, value])) }}"
}
```

### 2. Error Handling and Resilience

#### Safe Type Conversion
```json
{
  "name": "safe_number",
  "type": "number",
  "value": "={{ isNaN(Number($json.value)) ? 0 : Number($json.value) }}"
}
```

#### Try/Catch Pattern (Raw Mode)
```json
{
  "mode": "raw",
  "jsonOutput": "={{ (() => { try { return { result: complexCalculation($json) }; } catch (e) { return { error: e.message, original: $json }; } })() }}"
}
```

### 3. Performance Optimization

#### Efficient Binary Handling
```json
{
  "options": {
    "stripBinary": true
  }
}
```

#### Minimal Output Structure
```json
{
  "includeOtherFields": false,
  "fields": {
    "values": [
      {
        "name": "essential_data",
        "type": "object",
        "value": "={{ { id: $json.id, name: $json.name, status: $json.status } }}"
      }
    ]
  }
}
```

## Best Practices

### 1. Expression Writing
- **Use null coalescing**: `{{ $json.field ?? 'default' }}`
- **Validate before processing**: `{{ $json.email && $json.email.includes('@') ? ... : '' }}`
- **Handle empty strings**: `{{ $json.field && $json.field.trim() !== '' ? ... : 'default' }}`
- **Type checking**: `{{ typeof $json.field === 'string' ? ... : '' }}`

### 2. Performance Considerations
- **Use Manual Mode** for simple transformations (better error isolation)
- **Use Raw Mode** for complex restructuring (better performance)
- **Strip binary data** when processing large datasets
- **Minimize field inclusion** for large payloads

### 3. Error Prevention
- **Always provide fallbacks** for optional fields
- **Validate input types** before complex operations
- **Use ignoreConversionErrors** for fault tolerance
- **Test with edge cases** (null, empty, malformed data)

### 4. Maintainability
- **Use descriptive field names** that indicate transformation logic
- **Document complex expressions** in node notes
- **Break complex transformations** into multiple Set nodes
- **Version control** expression changes for complex workflows

## Common Pitfalls to Avoid

### 1. Expression Errors
- **Missing null checks**: Can cause workflow failures
- **Incorrect regex syntax**: Use proper escaping in JSON
- **Type assumptions**: Always validate input types
- **Complex nested expressions**: Break into simpler parts

### 2. Performance Issues
- **Unnecessary field inclusion**: Can bloat payloads
- **Complex expressions in loops**: Consider Raw Mode for batch operations
- **Binary data retention**: Strip when not needed
- **Deep object nesting**: Can impact performance

### 3. Data Quality Issues
- **Missing validation**: Always validate critical fields
- **Inconsistent formatting**: Use standardization patterns
- **No error handling**: Provide meaningful fallbacks
- **Lost data lineage**: Include processing metadata

## Debugging and Testing

### Debug Information Fields
```json
{
  "name": "debug_info",
  "type": "object",
  "value": "={{ { input_keys: Object.keys($json), input_size: JSON.stringify($json).length, node_name: $node.name, execution_time: new Date().toISOString() } }}"
}
```

### Test Data Validation
```json
{
  "name": "validation_results",
  "type": "object",
  "value": "={{ { email_valid: $json.email && /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test($json.email), phone_valid: $json.phone && /^[\\+]?[1-9][\\d]{0,15}$/.test($json.phone), required_fields: ($json.name ? 1 : 0) + ($json.email ? 1 : 0) } }}"
}
```

### Output Validation
- **Verify field types** match expected output
- **Check conditional logic** with various input scenarios
- **Test error handling** with malformed data
- **Validate performance** with large datasets
- **Confirm field inclusion** settings work as expected