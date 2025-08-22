# n8n JSON Structure Guide

## Workflow JSON Structure

### Root Level Properties
```json
{
  "meta": {},           // Workflow metadata
  "nodes": [],          // Array of workflow nodes
  "connections": {},    // Node connection definitions
  "settings": {},       // Workflow settings
  "staticData": {},     // Persistent data storage
  "tags": [],           // Workflow tags
  "triggerCount": 1,    // Number of trigger nodes
  "updatedAt": "",      // Last update timestamp
  "versionId": ""       // Workflow version identifier
}
```

### Meta Object
```json
{
  "meta": {
    "instanceId": "unique-instance-id",
    "templateName": "Workflow Name",
    "templateVersion": "1.0.0",
    "description": "Workflow description"
  }
}
```

### Node Structure
```json
{
  "parameters": {},          // Node-specific configuration
  "id": "unique-node-id",   // Unique identifier within workflow
  "name": "Node Name",      // Display name
  "type": "node-type",      // n8n node type identifier
  "typeVersion": 1,         // Node type version
  "position": [x, y],       // Canvas position coordinates
  "notes": "Node description", // Optional notes
  "disabled": false,        // Whether node is disabled
  "alwaysOutputData": false, // Always output data even if empty
  "executeOnce": false,     // Execute only once in loops
  "retryOnFail": false,     // Retry on failure
  "maxTries": 3,           // Maximum retry attempts
  "waitBetweenTries": 1000, // Wait time between retries (ms)
  "continueOnFail": false   // Continue workflow on node failure
}
```

### Connections Structure
```json
{
  "connections": {
    "Source Node Name": {
      "main": [
        [
          {
            "node": "Target Node Name",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

### Settings Structure
```json
{
  "settings": {
    "saveManualExecutions": true,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all",
    "callerPolicy": "workflowsFromSameOwner",
    "errorWorkflow": "",
    "timezone": "America/New_York",
    "executionTimeout": 3600
  }
}
```

## Node Parameter Examples

### HTTP Request Node
```json
{
  "parameters": {
    "url": "https://api.example.com/data",
    "method": "POST",
    "authentication": "genericCredentialType",
    "genericAuthType": "httpBasicAuth",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ]
    },
    "sendBody": true,
    "bodyContentType": "json",
    "jsonParameters": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "key1",
          "value": "={{ $json.field1 }}"
        }
      ]
    },
    "options": {
      "timeout": 30000,
      "retry": {
        "enabled": true,
        "maxTries": 3,
        "waitBetweenTries": 1000
      }
    }
  }
}
```

### Code Node (JavaScript)
```json
{
  "parameters": {
    "mode": "runOnceForAllItems",
    "jsCode": "// JavaScript code here\nconst items = $input.all();\nreturn items.map(item => ({\n  json: {\n    ...item.json,\n    processed: true\n  }\n}));"
  }
}
```

### Set Node
```json
{
  "parameters": {
    "mode": "manual",
    "duplicateItem": false,
    "assignments": {
      "assignments": [
        {
          "id": "field1",
          "name": "outputField",
          "type": "string",
          "value": "={{ $json.inputField }}"
        }
      ]
    },
    "options": {}
  }
}
```

### Switch Node
```json
{
  "parameters": {
    "mode": "expression",
    "output": "specified",
    "rules": {
      "rules": [
        {
          "id": "rule1",
          "outputIndex": 0,
          "value": "true"
        },
        {
          "id": "rule2", 
          "outputIndex": 1,
          "value": "false"
        }
      ]
    },
    "fallbackOutput": 2
  }
}
```

### Database Node (Postgres)
```json
{
  "parameters": {
    "operation": "executeQuery",
    "query": "SELECT * FROM users WHERE id = $1",
    "additionalFields": {
      "queryReplacement": [
        "={{ $json.userId }}"
      ]
    }
  }
}
```

## Expression Syntax

### Accessing Data
```javascript
// Access current item data
$json.fieldName
$json["field name with spaces"]

// Access all items
$input.all()

// Access specific item
$input.item(0)

// Access node data
$("Node Name").all()
$("Node Name").item(0).json.field

// Access workflow data
$workflow.id
$workflow.name

// Access execution data
$execution.id
$execution.resumeUrl
```

### Common Expressions
```javascript
// Date/Time
new Date().toISOString()
moment().format('YYYY-MM-DD')

// String manipulation
$json.text.toLowerCase()
$json.text.replace('old', 'new')
$json.text.split(',')

// Number operations
Math.round($json.value)
parseInt($json.stringNumber)

// Conditional logic
$json.status === 'active' ? 'enabled' : 'disabled'

// Array operations
$json.items.length
$json.items.map(item => item.name)
$json.items.filter(item => item.active)
```

## Connection Types

### Main Connection
Standard data flow between nodes:
```json
{
  "node": "Target Node",
  "type": "main", 
  "index": 0
}
```

### Error Connection
Error handling flow:
```json
{
  "node": "Error Handler",
  "type": "error",
  "index": 0  
}
```

### Multiple Outputs
Nodes with multiple output branches:
```json
{
  "Source Node": {
    "main": [
      [
        {"node": "Path 1", "type": "main", "index": 0}
      ],
      [
        {"node": "Path 2", "type": "main", "index": 0}
      ]
    ]
  }
}
```

## Best Practices

### Node IDs
- Use descriptive, unique identifiers
- Follow consistent naming conventions
- Avoid special characters and spaces
- Use kebab-case: `user-data-processor`

### Node Names
- Use clear, descriptive names
- Indicate node purpose
- Keep names concise but meaningful
- Use consistent terminology

### Parameters
- Use expressions for dynamic values
- Validate required parameters
- Set appropriate timeouts
- Configure retry logic for unreliable operations

### Error Handling
- Always configure error paths for critical operations
- Use meaningful error messages
- Implement proper logging
- Set up alerting for failures

### Performance
- Configure appropriate batch sizes
- Use pagination for large datasets
- Set reasonable timeouts
- Optimize database queries

## Validation Checklist
- [ ] All required node properties present
- [ ] Node IDs are unique within workflow
- [ ] Connection references valid node names
- [ ] Parameter values match expected types
- [ ] Expressions use correct syntax
- [ ] Error handling configured appropriately
- [ ] Authentication credentials referenced correctly
- [ ] Node positions are valid coordinates

## Common Patterns

### Try-Catch Pattern
```json
{
  "Try Operation": {
    "main": [
      [{"node": "Success Path", "type": "main", "index": 0}]
    ],
    "error": [
      [{"node": "Error Handler", "type": "main", "index": 0}]
    ]
  }
}
```

### Conditional Routing
```json
{
  "Switch Node": {
    "main": [
      [{"node": "Path A", "type": "main", "index": 0}],
      [{"node": "Path B", "type": "main", "index": 0}],
      [{"node": "Default Path", "type": "main", "index": 0}]
    ]
  }
}
```

### Parallel Processing with Merge
```json
{
  "Split Point": {
    "main": [
      [
        {"node": "Process A", "type": "main", "index": 0},
        {"node": "Process B", "type": "main", "index": 0}
      ]
    ]
  },
  "Process A": {
    "main": [[{"node": "Merge Point", "type": "main", "index": 0}]]
  },
  "Process B": {
    "main": [[{"node": "Merge Point", "type": "main", "index": 1}]]
  }
}
```