# If Node Usage Guide

## Overview
The If node is a fundamental workflow control node that routes data to different branches based on conditional logic. It features dual outputs ('true' and 'false'), advanced filtering capabilities, and robust error handling.

## Basic Usage

### Simple Conditional Routing
```json
{
  "node": {
    "parameters": {
      "conditions": {
        "combinator": "and",
        "conditions": [
          {
            "leftValue": "={{ $json.status }}",
            "rightValue": "active",
            "operator": {
              "type": "string",
              "operation": "equals"
            }
          }
        ]
      }
    }
  }
}
```

### Multiple Conditions with AND Logic
```json
{
  "node": {
    "parameters": {
      "conditions": {
        "combinator": "and",
        "conditions": [
          {
            "leftValue": "={{ $json.age }}",
            "rightValue": 18,
            "operator": {
              "type": "number",
              "operation": "gte"
            }
          },
          {
            "leftValue": "={{ $json.country }}",
            "rightValue": "US",
            "operator": {
              "type": "string",
              "operation": "equals"
            }
          }
        ]
      },
      "options": {
        "ignoreCase": true
      }
    }
  }
}
```

## Advanced Configuration

### Using OR Logic with Complex Conditions
```json
{
  "node": {
    "parameters": {
      "conditions": {
        "combinator": "or",
        "conditions": [
          {
            "leftValue": "={{ $json.priority }}",
            "rightValue": "high",
            "operator": {
              "type": "string",
              "operation": "equals"
            }
          },
          {
            "leftValue": "={{ $json.urgency_score }}",
            "rightValue": 8,
            "operator": {
              "type": "number",
              "operation": "gt"
            }
          }
        ]
      }
    }
  }
}
```

### Case-Sensitive String Matching
```json
{
  "node": {
    "parameters": {
      "conditions": {
        "conditions": [
          {
            "leftValue": "={{ $json.product_code }}",
            "rightValue": "PRD-001",
            "operator": {
              "type": "string",
              "operation": "equals"
            }
          }
        ]
      },
      "options": {
        "ignoreCase": false
      }
    }
  }
}
```

## Error Handling Configuration

### Enable Graceful Degradation
```json
{
  "node": {
    "parameters": {
      "conditions": {
        "conditions": [
          {
            "leftValue": "={{ $json.data.nested_field }}",
            "rightValue": "expected_value",
            "operator": {
              "type": "string",
              "operation": "equals"
            }
          }
        ]
      },
      "looseTypeValidation": true
    },
    "continueOnFail": true
  }
}
```

### Strict Type Validation (Recommended for Production)
```json
{
  "node": {
    "parameters": {
      "conditions": {
        "conditions": [
          {
            "leftValue": "={{ $json.amount }}",
            "rightValue": 100,
            "operator": {
              "type": "number",
              "operation": "gte"
            }
          }
        ]
      },
      "looseTypeValidation": false
    },
    "continueOnFail": false
  }
}
```

## Common Use Cases

### 1. Data Quality Filtering
Filter out incomplete or invalid records:
```json
{
  "node": {
    "parameters": {
      "conditions": {
        "combinator": "and",
        "conditions": [
          {
            "leftValue": "={{ $json.email }}",
            "rightValue": "",
            "operator": {
              "type": "string",
              "operation": "notEquals"
            }
          },
          {
            "leftValue": "={{ $json.email }}",
            "rightValue": ".*@.*\\..*",
            "operator": {
              "type": "string",
              "operation": "regex"
            }
          }
        ]
      }
    }
  }
}
```

### 2. Business Logic Routing
Route orders based on business rules:
```json
{
  "node": {
    "parameters": {
      "conditions": {
        "combinator": "or",
        "conditions": [
          {
            "leftValue": "={{ $json.total_amount }}",
            "rightValue": 1000,
            "operator": {
              "type": "number",
              "operation": "gte"
            }
          },
          {
            "leftValue": "={{ $json.customer_tier }}",
            "rightValue": "premium",
            "operator": {
              "type": "string",
              "operation": "equals"
            }
          }
        ]
      }
    }
  }
}
```

### 3. Date-Based Processing
Process items based on date conditions:
```json
{
  "node": {
    "parameters": {
      "conditions": {
        "conditions": [
          {
            "leftValue": "={{ new Date($json.created_date) }}",
            "rightValue": "={{ new Date(Date.now() - 24*60*60*1000) }}",
            "operator": {
              "type": "dateTime",
              "operation": "after"
            }
          }
        ]
      }
    }
  }
}
```

### 4. Array and Object Validation
Check for array length and object properties:
```json
{
  "node": {
    "parameters": {
      "conditions": {
        "combinator": "and",
        "conditions": [
          {
            "leftValue": "={{ $json.items.length }}",
            "rightValue": 0,
            "operator": {
              "type": "number",
              "operation": "gt"
            }
          },
          {
            "leftValue": "={{ $json.metadata }}",
            "rightValue": "",
            "operator": {
              "type": "object",
              "operation": "notEmpty"
            }
          }
        ]
      }
    }
  }
}
```

## Version-Specific Features

### Version 2.2 (Latest)
- Enhanced filter processing performance
- Improved type validation accuracy
- Better error messages and debugging support

### Version 2.1
- Configurable loose type validation
- Enhanced error context preservation
- Improved backward compatibility

### Version 2.0
- Introduction of filter-based condition system
- Dual-output architecture
- Advanced error handling

### Version 1.0 (Legacy)
- Basic conditional logic
- Limited error handling
- Simple true/false evaluation

## Performance Considerations

### Optimize for High Volume
```json
{
  "node": {
    "parameters": {
      "conditions": {
        "conditions": [
          {
            "leftValue": "={{ $json.status }}",
            "rightValue": ["active", "pending"],
            "operator": {
              "type": "string",
              "operation": "in"
            }
          }
        ]
      }
    }
  }
}
```

### Minimize Complex Expressions
```json
// Good: Simple field comparison
{
  "leftValue": "={{ $json.category }}",
  "rightValue": "electronics"
}

// Avoid: Complex nested expressions in conditions
{
  "leftValue": "={{ $json.items.filter(item => item.price > 100).length }}",
  "rightValue": 5
}
```

## Best Practices

### 1. Clear Condition Logic
- Use descriptive condition structures
- Group related conditions with appropriate combinators
- Document complex business logic in node notes

### 2. Error Handling Strategy
- Enable `continueOnFail` for fault-tolerant workflows
- Use `looseTypeValidation` for dynamic data sources
- Monitor error patterns in production workflows

### 3. Type Safety
- Validate data types before comparison
- Use appropriate operators for data types
- Handle null/undefined values explicitly

### 4. Performance Optimization
- Minimize complex expressions in conditions
- Use efficient operators (equals vs regex)
- Consider splitting complex logic across multiple nodes

### 5. Testing and Validation
```json
{
  "testing": {
    "test_cases": [
      {
        "description": "Valid data passes condition",
        "input": {"status": "active", "score": 85},
        "expected_output": "true"
      },
      {
        "description": "Invalid data fails condition", 
        "input": {"status": "inactive", "score": 45},
        "expected_output": "false"
      },
      {
        "description": "Missing data with graceful handling",
        "input": {"status": null},
        "expected_output": "false",
        "node_config": {"continueOnFail": true}
      }
    ]
  }
}
```

## Troubleshooting

### Common Issues

1. **Type Validation Errors**
   - Enable loose type validation for mixed data types
   - Verify data structure matches expected format
   - Use appropriate type operators

2. **Missing Data Handling**
   - Enable `continueOnFail` to handle missing fields
   - Use null-safe expressions: `{{ $json.field ?? 'default' }}`
   - Validate required fields before condition evaluation

3. **Performance Issues**
   - Simplify complex condition expressions
   - Use indexed database queries instead of node filtering when possible
   - Consider batching strategies for high-volume processing

4. **Case Sensitivity Problems**
   - Configure `ignoreCase` option appropriately
   - Use consistent casing in comparison values
   - Consider data normalization before condition evaluation

### Debug Strategies

1. **Add Debug Outputs**
   - Log condition values before evaluation
   - Use Set node to capture intermediate values
   - Enable workflow execution logging

2. **Test with Sample Data**
   - Use known good/bad data samples
   - Test edge cases and boundary conditions
   - Validate with production-like data volumes

3. **Monitor Error Patterns**
   - Track error rates and types
   - Set up alerts for condition failures
   - Review error logs for data quality issues

This comprehensive usage guide ensures effective implementation of conditional logic in n8n workflows with production-ready reliability and performance.