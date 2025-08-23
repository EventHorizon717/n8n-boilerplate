# Edit Fields (Set) Node - Implementation Guide

## Node Configuration

### Basic Setup
```json
{
  "name": "Edit Fields",
  "type": "n8n-nodes-base.set",
  "typeVersion": 3.4,
  "parameters": {
    "mode": "manual",
    "duplicateItem": false,
    "includeOtherFields": true,
    "include": "all"
  }
}
```

### Version-Specific Configuration

#### Version 3.4 (Latest)
```json
{
  "typeVersion": 3.4,
  "parameters": {
    "includeOtherFields": true,
    "include": "selected",
    "options": {
      "stripBinary": true,
      "dotNotation": true,
      "ignoreConversionErrors": false
    }
  }
}
```

#### Legacy Versions (3.0-3.2)
```json
{
  "typeVersion": 3.2,
  "parameters": {
    "include": "all",
    "options": {
      "includeBinary": true,
      "dotNotation": true
    }
  }
}
```

## Implementation Patterns

### 1. Manual Mode Implementation

#### Basic Field Transformation
```json
{
  "mode": "manual",
  "fields": {
    "values": [
      {
        "name": "processed_at",
        "type": "string",
        "value": "={{ new Date().toISOString() }}"
      },
      {
        "name": "full_name",
        "type": "string", 
        "value": "={{ ($json.first_name || '') + ' ' + ($json.last_name || '') }}"
      },
      {
        "name": "status",
        "type": "string",
        "value": "processed"
      }
    ]
  }
}
```

#### Advanced Field Transformations
```json
{
  "fields": {
    "values": [
      {
        "name": "email_validated",
        "type": "boolean",
        "value": "={{ $json.email && /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test($json.email) }}"
      },
      {
        "name": "data_quality_score",
        "type": "number",
        "value": "={{ ($json.name ? 25 : 0) + ($json.email ? 25 : 0) + ($json.phone ? 25 : 0) + ($json.address ? 25 : 0) }}"
      },
      {
        "name": "user_profile",
        "type": "object",
        "value": "={{ { name: $json.name, email: $json.email, preferences: { theme: 'dark', notifications: true } } }}"
      },
      {
        "name": "calculated_age",
        "type": "number",
        "value": "={{ $json.birth_date ? Math.floor((new Date() - new Date($json.birth_date)) / (365.25 * 24 * 60 * 60 * 1000)) : null }}"
      }
    ]
  }
}
```

### 2. Raw Mode Implementation

#### Complete Data Restructuring
```json
{
  "mode": "raw",
  "jsonOutput": "={{ { id: $json.id, user: { profile: { name: ($json.first_name || '') + ' ' + ($json.last_name || ''), email: $json.email, phone: $json.phone }, metadata: { created_at: $json.created_at, updated_at: new Date().toISOString(), source: 'api' } }, workflow_context: { execution_id: $execution.id, workflow_id: $workflow.id } } }}"
}
```

#### Conditional Data Structure
```json
{
  "mode": "raw", 
  "jsonOutput": "={{ $json.type === 'premium' ? { id: $json.id, premium_features: { advanced_analytics: true, priority_support: true, custom_branding: true }, billing: { plan: 'premium', amount: $json.amount } } : { id: $json.id, basic_features: { standard_analytics: true }, billing: { plan: 'basic', amount: 0 } } }}"
}
```

#### Array Processing
```json
{
  "mode": "raw",
  "jsonOutput": "={{ { processed_items: $json.items.map(item => ({ ...item, processed: true, processed_at: new Date().toISOString() })), summary: { total_items: $json.items.length, processed_count: $json.items.length } } }}"
}
```

### 3. Field Inclusion Strategies

#### Include All Fields
```json
{
  "includeOtherFields": true,
  "include": "all"
}
```

#### Select Specific Fields
```json
{
  "includeOtherFields": true,
  "include": "selected",
  "includeFields": "id,name,email,created_at"
}
```

#### Exclude Specific Fields
```json
{
  "includeOtherFields": true,
  "include": "except", 
  "excludeFields": "password,internal_id,temp_data"
}
```

#### Transform Only (No Input Fields)
```json
{
  "includeOtherFields": false
}
```

### 4. Error Handling Implementation

#### Fault-Tolerant Configuration
```json
{
  "options": {
    "ignoreConversionErrors": true,
    "dotNotation": true
  }
}
```

#### Safe Field Access Patterns
```javascript
// Null coalescing
{{ $json.field ?? 'default_value' }}

// Conditional with validation
{{ $json.email && typeof $json.email === 'string' ? $json.email.toLowerCase() : '' }}

// Try/catch pattern in raw mode
{{ 
  (() => {
    try {
      return complexCalculation($json);
    } catch (error) {
      return { error: 'calculation_failed', input: $json };
    }
  })()
}}
```

### 5. Performance Optimization

#### Binary Data Handling
```json
{
  "options": {
    "stripBinary": true  // Remove binary data for performance
  }
}
```

#### Efficient Field Processing
```json
{
  "includeOtherFields": false,  // Only include transformed fields
  "fields": {
    "values": [
      {
        "name": "essential_data",
        "type": "object",
        "value": "={{ { id: $json.id, name: $json.name, email: $json.email } }}"
      }
    ]
  }
}
```

### 6. Development and Testing

#### Duplication for Testing
```json
{
  "duplicateItem": true,
  "duplicateCount": 2,  // Creates 3 total items (original + 2 duplicates)
  "duplicateWarning": "Item duplication is set in node settings"
}
```

#### Debug Information
```json
{
  "fields": {
    "values": [
      {
        "name": "debug_info",
        "type": "object",
        "value": "={{ { node_id: $node.id, workflow_id: $workflow.id, execution_id: $execution.id, input_data: $json, timestamp: new Date().toISOString() } }}"
      }
    ]
  }
}
```

## Advanced Implementation Techniques

### 1. Dynamic Field Generation
```json
{
  "mode": "raw",
  "jsonOutput": "={{ Object.fromEntries(Object.entries($json).map(([key, value]) => [key + '_processed', value])) }}"
}
```

### 2. Conditional Field Creation
```json
{
  "mode": "raw",
  "jsonOutput": "={{ { ...($json.type === 'user' ? { user_specific_field: 'value' } : {}), ...$json, processed: true } }}"
}
```

### 3. Data Validation and Cleansing
```json
{
  "fields": {
    "values": [
      {
        "name": "clean_email",
        "type": "string",
        "value": "={{ $json.email && typeof $json.email === 'string' && /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test($json.email.trim()) ? $json.email.trim().toLowerCase() : '' }}"
      },
      {
        "name": "formatted_phone",
        "type": "string", 
        "value": "={{ $json.phone ? $json.phone.replace(/[^\\d]/g, '') : '' }}"
      }
    ]
  }
}
```

### 4. Workflow Metadata Integration
```json
{
  "fields": {
    "values": [
      {
        "name": "processing_metadata",
        "type": "object",
        "value": "={{ { workflow: { id: $workflow.id, name: $workflow.name }, execution: { id: $execution.id, mode: $execution.mode }, node: { id: $node.id, name: $node.name }, timestamp: new Date().toISOString() } }}"
      }
    ]
  }
}
```

## Common Use Cases

### 1. Data Standardization
```json
{
  "mode": "manual",
  "fields": {
    "values": [
      {
        "name": "standardized_name",
        "type": "string",
        "value": "={{ ($json.first_name || '').trim() + ' ' + ($json.last_name || '').trim() }}"
      },
      {
        "name": "standardized_email", 
        "type": "string",
        "value": "={{ $json.email ? $json.email.toLowerCase().trim() : '' }}"
      }
    ]
  }
}
```

### 2. Data Enrichment
```json
{
  "fields": {
    "values": [
      {
        "name": "email_domain",
        "type": "string",
        "value": "={{ $json.email ? $json.email.split('@')[1] : '' }}"
      },
      {
        "name": "account_age_days",
        "type": "number",
        "value": "={{ $json.created_at ? Math.floor((new Date() - new Date($json.created_at)) / (24 * 60 * 60 * 1000)) : 0 }}"
      }
    ]
  }
}
```

### 3. API Response Formatting
```json
{
  "mode": "raw",
  "jsonOutput": "={{ { success: true, data: $json, metadata: { processed_at: new Date().toISOString(), version: '1.0' }, links: { self: '/api/items/' + $json.id } } }}"
}
```

## Testing and Validation

### Test Data Scenarios
1. **Valid Data**: Complete records with all expected fields
2. **Missing Fields**: Records with null/undefined values
3. **Invalid Types**: String values in number fields, etc.
4. **Edge Cases**: Empty strings, zero values, boundary conditions
5. **Large Data**: Performance testing with substantial payloads

### Validation Expressions
```javascript
// Email validation
/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test($json.email)

// Phone validation  
/^[\\+]?[1-9][\\d]{0,15}$/.test($json.phone)

// Date validation
!isNaN(Date.parse($json.date_field))

// URL validation
/^https?:\\/\\/.+/.test($json.url)
```

### Error Testing
```json
{
  "options": {
    "ignoreConversionErrors": true
  },
  "fields": {
    "values": [
      {
        "name": "safe_number",
        "type": "number", 
        "value": "={{ isNaN(Number($json.value)) ? 0 : Number($json.value) }}"
      }
    ]
  }
}
```