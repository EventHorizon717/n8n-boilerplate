# AI Agent Tool - Production Patterns

## Dynamic Input Generation Pattern

The AI Agent Tool uses an innovative dynamic input generation pattern that adapts the node's inputs based on parameter configuration:

```typescript
inputs: `={{
    ((hasOutputParser, needsFallback) => {
        ${getInputs.toString()};
        return getInputs(false, hasOutputParser, needsFallback)
    })($parameter.hasOutputParser === undefined || $parameter.hasOutputParser === true, $parameter.needsFallback !== undefined && $parameter.needsFallback === true)
}}`
```

### Key Pattern Elements

1. **Embedded Function Expression**: JavaScript function embedded directly in the inputs property
2. **Parameter-Driven Logic**: Input configuration changes based on node parameters
3. **Runtime Evaluation**: Inputs are calculated dynamically when the workflow is executed

## AI Connection Types

### Specialized Connection Types
- `NodeConnectionTypes.AiTool` - Output connection type for tool nodes
- `NodeConnectionTypes.AiOutputParser` - Input for structured output formatting
- Language model connections for AI functionality

### Connection Pattern
```typescript
inputs: // Dynamic based on configuration
outputs: [NodeConnectionTypes.AiTool] // Always provides tool output
```

## Version-Aware Feature Display

### Conditional Feature Availability
```typescript
displayOptions: {
    show: {
        '@version': [{ _cnd: { gte: 2.1 } }]
    }
}
```

This pattern enables features only for specific versions, allowing backward compatibility while introducing new functionality.

## Interface Flexibility Pattern

### Dual Interface Support
```typescript
async execute(this: IExecuteFunctions | ISupplyDataFunctions): Promise<INodeExecutionData[][]>
```

The tool supports both regular execution and supply data functions, enabling use in different n8n contexts.

## Tool Wrapping Pattern

### Automatic Tool Integration
The node is "automatically wrapped as a tool", meaning it integrates seamlessly into agent workflows without manual configuration.

## UI Enhancement Patterns

### Dynamic Help Text
```typescript
{
    displayName: `Connect an <a data-action='openSelectiveNodeCreator' data-action-parameter-connectiontype='${NodeConnectionTypes.AiOutputParser}'>output parser</a>`,
    name: 'notice',
    type: 'notice'
}
```

### Interactive UI Elements
- Clickable links that trigger node creation
- Dynamic notices based on configuration
- Conditional help text display

## Error Handling Patterns

### Fallback Model Strategy
- Optional fallback model connection
- Graceful degradation when primary model fails
- Version-gated fallback features

## Performance Patterns

### Minimal Overhead Design
- Tool wrapping adds minimal execution overhead
- Dynamic input generation optimized for runtime
- Efficient connection type handling

## Security Patterns

### Delegated Security Model
- No direct authentication in the tool itself
- Security handled by connected language models
- Input validation through output parsers

## Best Practices Extracted

1. **Dynamic Configuration**: Use embedded expressions for adaptive node behavior
2. **Version Management**: Implement feature gates based on node versions
3. **Connection Typing**: Leverage specialized AI connection types
4. **UI Guidance**: Provide interactive help and connection guidance
5. **Dual Interface**: Support multiple execution contexts for flexibility
6. **Graceful Fallbacks**: Implement optional fallback mechanisms for reliability