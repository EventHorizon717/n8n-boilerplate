# If Node Production Patterns

## Overview
The If node demonstrates sophisticated production patterns for conditional workflow routing, featuring versioned node architecture, dual-output design, and comprehensive error handling strategies.

## Core Architecture Patterns

### 1. VersionedNodeType Pattern
```typescript
export class If extends VersionedNodeType {
    constructor() {
        const baseDescription: INodeTypeBaseDescription = {
            displayName: 'If',
            name: 'if',
            icon: 'fa:map-signs',
            iconColor: 'green',
            group: ['transform'],
            description: 'Route items to different branches (true/false)',
            defaultVersion: 2.2,
        };

        const nodeVersions: IVersionedNodeType['nodeVersions'] = {
            1: new IfV1(baseDescription),
            2: new IfV2(baseDescription),
            2.1: new IfV2(baseDescription),
            2.2: new IfV2(baseDescription),
        };

        super(nodeVersions, baseDescription);
    }
}
```

**Key Benefits:**
- **Version Management**: Clean separation of version-specific implementations
- **Backward Compatibility**: Maintains support for older workflow versions
- **Upgrade Path**: Smooth migration between node versions
- **Code Reuse**: Shared implementations across compatible versions

### 2. Dual-Output Routing Pattern
```typescript
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const trueItems: INodeExecutionData[] = [];
    const falseItems: INodeExecutionData[] = [];

    this.getInputData().forEach((item, itemIndex) => {
        const pass = this.getNodeParameter('conditions', itemIndex, false, {
            extractValue: true,
        }) as boolean;

        if (item.pairedItem === undefined) {
            item.pairedItem = { item: itemIndex };
        }

        if (pass) {
            trueItems.push(item);
        } else {
            falseItems.push(item);
        }
    });

    return [trueItems, falseItems];
}
```

**Key Features:**
- **Semantic Outputs**: Clear 'true' and 'false' output naming
- **Data Lineage**: Automatic pairedItem assignment for tracking
- **Batch Processing**: Efficient collection-based routing
- **Memory Efficiency**: Direct array manipulation without intermediate structures

### 3. Advanced Error Handling Pattern
```typescript
try {
    pass = this.getNodeParameter('conditions', itemIndex, false, {
        extractValue: true,
    }) as boolean;
} catch (error) {
    if (
        !getTypeValidationParameter(2.1)(this, itemIndex, options.looseTypeValidation) &&
        !error.description
    ) {
        set(error, 'description', ENABLE_LESS_STRICT_TYPE_VALIDATION);
    }
    set(error, 'context.itemIndex', itemIndex);
    set(error, 'node', this.getNode());
    throw error;
}
```

**Error Enhancement Features:**
- **Context Preservation**: Adds itemIndex and node information to errors
- **User Guidance**: Provides specific error descriptions and remediation hints
- **Type Validation Integration**: Handles type validation failures gracefully
- **Debugging Support**: Rich error context for troubleshooting

### 4. Version-Gated Type Validation
```typescript
const typeValidationStrictness = getTypeValidationStrictness(2.1);
const isLooseValidation = getTypeValidationParameter(2.1)(
    this, 
    itemIndex, 
    options.looseTypeValidation
);

// Filter configuration with version-dependent behavior
typeOptions: {
    filter: {
        caseSensitive: '={{!$parameter.options.ignoreCase}}',
        typeValidation: typeValidationStrictness,
        version: '={{ $nodeVersion >= 2.2 ? 2 : 1 }}',
    },
}
```

**Validation Strategy:**
- **Progressive Enhancement**: Stricter validation in newer versions
- **User Override**: Configurable loose validation for compatibility
- **Version Detection**: Automatic behavior adjustment based on node version
- **Backward Compatibility**: Maintains older behavior when needed

## Filter Parameter Integration

### Filter Type Configuration
```typescript
{
    displayName: 'Conditions',
    name: 'conditions',
    type: 'filter',
    default: {},
    typeOptions: {
        filter: {
            caseSensitive: '={{!$parameter.options.ignoreCase}}',
            typeValidation: getTypeValidationStrictness(2.1),
            version: '={{ $nodeVersion >= 2.2 ? 2 : 1 }}',
        },
    },
}
```

**Advanced Features:**
- **Dynamic Case Sensitivity**: Configurable via options parameter
- **Version-Aware Processing**: Different filter versions based on node version
- **Type Safety Integration**: Coordinated with node-level type validation
- **Expression Support**: Full n8n expression language integration

### Options Collection Pattern
```typescript
{
    displayName: 'Options',
    name: 'options',
    type: 'collection',
    default: {},
    options: [
        {
            displayName: 'Ignore Case',
            name: 'ignoreCase',
            type: 'boolean',
            default: true,
        },
        {
            displayName: 'Loose Type Validation',
            name: 'looseTypeValidation',
            type: 'boolean',
            default: false,
            displayOptions: {
                show: {
                    '@version': [{ _cnd: { gte: 2.1 } }],
                },
            },
        },
    ],
}
```

## Error Recovery Strategies

### Graceful Degradation with continueOnFail
```typescript
try {
    // Main condition evaluation logic
    pass = evaluateConditions();
    
    if (pass) {
        trueItems.push(item);
    } else {
        falseItems.push(item);
    }
} catch (error) {
    if (this.continueOnFail()) {
        falseItems.push(item); // Route failed items to false output
    } else {
        throw enrichedError; // Propagate error with context
    }
}
```

**Recovery Benefits:**
- **Fault Tolerance**: Continues processing when individual items fail
- **Predictable Routing**: Failed items go to false output for handling
- **Error Context**: Preserves error information while continuing workflow
- **User Control**: Configurable behavior via continueOnFail setting

### Error Classification and Handling
```typescript
if (error instanceof NodeOperationError) {
    throw error; // Already properly formatted
}

if (error instanceof ApplicationError) {
    set(error, 'context.itemIndex', itemIndex);
    throw error; // Add context to application errors
}

throw new NodeOperationError(this.getNode(), error, {
    itemIndex,
}); // Wrap unknown errors
```

## Performance Optimization Patterns

### Efficient Item Processing
```typescript
// Use forEach for direct processing without map overhead
this.getInputData().forEach((item, itemIndex) => {
    // Process item directly
    const result = processItem(item, itemIndex);
    
    // Direct array push (no intermediate collections)
    if (result) {
        trueItems.push(item);
    } else {
        falseItems.push(item);
    }
});
```

### Memory Management
- **Direct Array Operations**: No intermediate data structures
- **Minimal Object Creation**: Reuse existing item objects when possible
- **Efficient Error Handling**: Context enrichment without object recreation
- **Batch Return**: Single return operation with complete result arrays

## Version Management Strategy

### Implementation Mapping
- **Version 1**: Legacy implementation with basic conditional logic
- **Versions 2, 2.1, 2.2**: Shared IfV2 implementation with feature flags
- **Feature Gating**: Version-specific features controlled by displayOptions
- **Default Version**: Always points to latest stable version (2.2)

### Migration Path
```typescript
// Version detection in parameters
displayOptions: {
    show: {
        '@version': [{ _cnd: { gte: 2.1 } }], // Show for versions 2.1+
    },
}

// Runtime version checking
version: '={{ $nodeVersion >= 2.2 ? 2 : 1 }}'
```

## Security Considerations

### Type Safety
- **Input Validation**: Strict type checking with configurable looseness
- **Parameter Sanitization**: Safe parameter extraction with error handling
- **Expression Safety**: Proper expression evaluation with error boundaries

### Data Integrity
- **PairedItem Tracking**: Maintains data lineage for audit trails
- **Error Context**: Preserves context for security analysis
- **Validation Logging**: Comprehensive error reporting for monitoring

## Testing Strategies

### Unit Testing Approach
```typescript
// Test condition evaluation
const testConditions = [
    { input: { value: 5 }, condition: "{{ $json.value > 3 }}", expected: true },
    { input: { value: 1 }, condition: "{{ $json.value > 3 }}", expected: false },
];

// Test error handling
const testErrors = [
    { input: invalid_data, shouldContinue: true, expectedOutput: 'false' },
    { input: invalid_data, shouldContinue: false, expectedError: true },
];
```

### Integration Testing
- **Multi-Item Processing**: Test with various batch sizes
- **Version Compatibility**: Validate behavior across all supported versions
- **Error Scenarios**: Test all error paths and recovery mechanisms
- **Performance Testing**: Validate with high-volume data sets

This pattern documentation serves as a comprehensive guide for implementing similar conditional logic nodes with production-grade reliability and performance characteristics.