# Edit Fields (Set) Node - Production Patterns

## Overview
The Edit Fields (Set) node is a core n8n processing node that provides dual-mode field manipulation capabilities with comprehensive version management and advanced data transformation features.

## Core Patterns

### 1. Dual-Mode Operation Pattern

#### Manual Mode
- **Use Case**: Field-by-field transformations with individual control
- **Benefits**: Readable workflows, maintainable code, isolated error handling
- **Structure**: Array-based field definitions with name/type/value objects

```json
{
  "mode": "manual",
  "fields": {
    "values": [
      {
        "name": "field_name",
        "type": "string|number|boolean|object",
        "value": "={{ expression }}"
      }
    ]
  }
}
```

#### Raw Mode  
- **Use Case**: Complete data restructuring using JavaScript expressions
- **Benefits**: Maximum flexibility, complex transformations, performance optimization
- **Structure**: Single JavaScript expression for complete output control

```json
{
  "mode": "raw", 
  "jsonOutput": "={{ complex_transformation_expression }}"
}
```

### 2. Version Management Pattern

The Set node implements sophisticated version handling across multiple releases:

#### Version Evolution
- **3.0**: Basic field manipulation
- **3.1-3.2**: Enhanced field inclusion controls
- **3.3**: includeOtherFields parameter introduction  
- **3.4**: Advanced binary data handling and performance optimizations

#### Conditional Parameter Logic
```typescript
// Version-dependent parameter visibility
displayOptions: {
  show: {
    '@version': [3, 3.1, 3.2],
  },
  hide: {
    '@version': [{ _cnd: { gte: 3.4 } }],
  }
}
```

### 3. Field Inclusion Control Pattern

#### Inclusion Strategies
- **ALL**: Include all input fields plus transformations
- **SELECTED**: Explicitly control which fields to include via includeFields
- **EXCEPT**: Exclude specific fields via excludeFields while keeping others
- **NONE**: Include only transformed fields (no input preservation)

#### Implementation Pattern
```typescript
const include = this.getNodeParameter('include', i, 'all') as IncludeMods;
const includeOtherFields = this.getNodeParameter('includeOtherFields', i, false);

// Version-dependent logic
if (node.typeVersion >= 3.3) {
  options.include = includeOtherFields ? include : 'none';
} else {
  options.include = include;
}
```

### 4. Expression Processing Pattern

#### Raw Expression Detection
```typescript
// Detect and process raw expressions
if (jsonOutput?.startsWith('=')) {
  rawData.jsonOutput = jsonOutput.replace(/^=+/, '');
}

// Manual mode raw expression handling
for (const entry of workflowFieldsJson) {
  if (entry.type === 'objectValue' && (entry.objectValue as string).startsWith('=')) {
    rawData[entry.name] = (entry.objectValue as string).replace(/^=+/, '');
  }
}
```

### 5. Binary Data Handling Pattern

#### Version-Specific Binary Control
```json
{
  "options": {
    "includeBinary": true,    // Legacy versions (< 3.4)
    "stripBinary": true       // Modern versions (>= 3.4)
  }
}
```

#### Binary Processing Logic
- **includeBinary**: Controls whether binary data is included in output
- **stripBinary**: Removes binary data when includeOtherFields is enabled
- **Version Detection**: Different handling based on node version

### 6. Error Resilience Pattern

#### Graceful Error Handling
```json
{
  "options": {
    "ignoreConversionErrors": false  // Enable for fault-tolerant processing
  }
}
```

#### Fallback Value Pattern
```javascript
// Null coalescing for safe field access
{{ $json.field ?? 'default_value' }}

// Conditional assignment with validation
{{ $json.email && /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test($json.email) ? $json.email : '' }}
```

### 7. Dot Notation Pattern

#### Deep Object Manipulation
```json
{
  "options": {
    "dotNotation": true  // Enable nested property setting
  }
}
```

#### Usage Examples
```javascript
// Creates nested structure: { user: { profile: { name: "value" } } }
"user.profile.name": "={{ $json.full_name }}"

// Direct property setting when disabled: { "user.profile.name": "value" }
"user.profile.name": "={{ $json.full_name }}"
```

### 8. Duplication Pattern

#### Development/Testing Support
```json
{
  "duplicateItem": true,
  "duplicateCount": 3  // Creates 4 copies total (original + 3 duplicates)
}
```

#### Implementation Logic
```typescript
if (duplicateItem && this.getMode() === 'manual') {
  const duplicateCount = this.getNodeParameter('duplicateCount', 0, 0);
  for (let j = 0; j <= duplicateCount; j++) {
    returnData.push(newItem);
  }
}
```

## Production Implementation Patterns

### 1. Data Validation Pattern
```javascript
// Email validation with fallback
{{ $json.email && /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test($json.email) ? $json.email : '' }}

// Data quality scoring
{{ ($json.name ? 25 : 0) + ($json.email ? 25 : 0) + ($json.phone ? 25 : 0) + ($json.address ? 25 : 0) }}
```

### 2. Workflow Context Pattern
```javascript
// Comprehensive workflow metadata
{{ { 
  workflow_id: $workflow.id, 
  workflow_name: $workflow.name, 
  execution_id: $execution.id, 
  processed_by: 'n8n',
  processed_at: new Date().toISOString() 
} }}
```

### 3. Complex Transformation Pattern
```javascript
// Raw mode complete restructuring
{{
  {
    id: $json.id,
    profile: {
      name: ($json.first_name || '') + ' ' + ($json.last_name || ''),
      contact: {
        email: $json.email,
        phone: $json.phone
      }
    },
    metadata: {
      processed_at: new Date().toISOString(),
      data_quality: ($json.name ? 1 : 0) + ($json.email ? 1 : 0)
    }
  }
}}
```

### 4. Performance Optimization Pattern
```json
{
  "includeOtherFields": false,  // Reduce output size
  "options": {
    "stripBinary": true,        // Remove binary data for performance
    "dotNotation": true         // Efficient nested updates
  }
}
```

### 5. Error Boundary Pattern
```javascript
// Try/catch in raw mode expressions
{{
  try {
    return complexTransformation($json);
  } catch (error) {
    return { error: 'transformation_failed', original: $json };
  }
}}
```

## Best Practices

### Mode Selection Guidelines
- **Manual Mode**: Simple transformations, team collaboration, readable workflows
- **Raw Mode**: Performance-critical operations, complex restructuring, advanced logic

### Field Inclusion Strategy  
- Use `includeOtherFields: true` to preserve data structure
- Use `include: 'selected'` for explicit control
- Use field filtering to optimize payload size

### Error Handling
- Always provide fallback values for critical fields
- Use validation patterns for data quality assurance
- Enable `ignoreConversionErrors` for fault-tolerant processing

### Performance Considerations
- Batch similar transformations in single node
- Use field filtering to reduce output size
- Enable binary stripping for large datasets
- Leverage dot notation for efficient nested updates