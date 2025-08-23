# AI Agent - Production Patterns

## Advanced Dynamic Input Generation

The AI Agent uses sophisticated dynamic input generation that adapts based on parameters and provides full workflow integration:

```typescript
inputs: `={{
    ((hasOutputParser, needsFallback) => {
        ${getInputs.toString()};
        return getInputs(true, hasOutputParser, needsFallback);
    })($parameter.hasOutputParser === undefined || $parameter.hasOutputParser === true, $parameter.needsFallback !== undefined && $parameter.needsFallback === true)
}}`
```

### Key Differences from Agent Tool

1. **Main Connection Support**: Accepts standard workflow connections (`getInputs(true, ...)`)
2. **Enhanced Input Types**: Supports main, AI language model, output parser, and tool connections
3. **Workflow Integration**: Can be placed anywhere in a workflow, not just as a tool

## Multi-Version Support Pattern

### Version Array Declaration
```typescript
version: [2, 2.1, 2.2]
```

This enables the node to support multiple versions simultaneously with different feature sets.

### Progressive Feature Enhancement
```typescript
displayOptions: {
    show: {
        '@version': [{ _cnd: { gte: 2.1 } }]
    }
}
```

Features are enabled based on version requirements, allowing backward compatibility.

## Advanced UI Patterns

### Interactive Callouts
```typescript
{
    displayName: 'Get started faster with our',
    name: 'preBuiltAgentsCallout',
    type: 'callout',
    typeOptions: {
        calloutAction: {
            label: 'pre-built agents',
            icon: 'bot',
            type: 'openPreBuiltAgentsCollection'
        }
    }
}
```

### Tutorial Integration
```typescript
{
    displayName: 'Tip: Get a feel for agents with our quick <a href="https://docs.n8n.io/advanced-ai/intro-tutorial/" target="_blank">tutorial</a>',
    name: 'aiAgentStarterCallout',
    type: 'callout'
}
```

## Dynamic Hints System

### Runtime Warnings
```typescript
hints: [
    {
        message: 'You are using streaming responses. Make sure to set the response mode to "Streaming Response" on the connected trigger node.',
        type: 'warning',
        location: 'outputPane',
        whenToDisplay: 'afterExecution',
        displayCondition: '={{ $parameter["enableStreaming"] === true }}'
    }
]
```

### Pattern Components
1. **Conditional Display**: Hints appear only when relevant conditions are met
2. **Expression-Based Logic**: Uses n8n expressions for dynamic evaluation
3. **Location-Specific**: Hints appear in specific UI locations
4. **Execution-Aware**: Different hints for different execution phases

## Streaming Response Pattern

### Configuration Integration
The node coordinates with trigger nodes to enable streaming responses:

```typescript
enableStreaming: {
    type: 'boolean',
    default: false
}
```

### Runtime Validation
Provides runtime hints to ensure proper streaming configuration across the workflow.

## Prompt Type Flexibility Pattern

### Conditional Input Display
```typescript
{
    ...textFromPreviousNode,
    displayOptions: {
        show: {
            promptType: ['auto']
        }
    }
},
{
    ...textInput,
    displayOptions: {
        show: {
            promptType: ['define']
        }
    }
}
```

This pattern allows users to choose between automatic prompt generation from previous node data or manual prompt definition.

## Tool Integration Architecture

### Comprehensive Connection Support
- **Main Connections**: Standard workflow data
- **Language Model Connections**: AI processing capabilities
- **Tool Connections**: Extended functionality through tool nodes
- **Output Parser Connections**: Structured response formatting

### Connection Type Management
```typescript
connectionTypes: {
    input: ["main", "ai-languageModel", "ai-outputParser", "ai-tool"],
    output: ["main"]
}
```

## Error Handling Evolution

### Multi-Layer Error Handling
1. **Fallback Models**: Secondary language models for primary model failures
2. **Tool Error Recovery**: Graceful handling of tool execution failures  
3. **Streaming Error Management**: Real-time error handling during streaming
4. **Connection Validation**: Ensure proper node connections

## Performance Optimization Patterns

### Streaming Optimization
- Real-time response delivery
- Reduced perceived latency
- Progressive result display

### Connection Efficiency
- Dynamic input calculation minimizes unused connections
- Efficient tool chaining patterns
- Optimized data flow management

## Security Architecture

### Layered Security Model
1. **Language Model Security**: Primary security context
2. **Tool Security**: Individual tool-level access controls
3. **Connection Security**: Secure data flow between components
4. **Input Validation**: Multi-stage input validation

## Development Evolution Pattern

### Feature Flag Pattern
```typescript
displayOptions: {
    show: {
        '@version': [{ _cnd: { gte: 2.1 } }]
    }
}
```

This allows for:
- Gradual feature rollout
- Backward compatibility maintenance  
- A/B testing of new features
- Safe production deployments

## Best Practices Extracted

1. **Progressive Enhancement**: Use version gates to introduce features gradually
2. **User Guidance**: Implement comprehensive callouts, hints, and notices
3. **Runtime Validation**: Provide execution-time hints for configuration issues
4. **Flexible Input Patterns**: Support multiple input modes for different use cases
5. **Streaming Integration**: Coordinate streaming across multiple workflow nodes
6. **Tool Ecosystem**: Design for extensibility through tool connections
7. **Error Recovery**: Implement multi-layer error handling and recovery mechanisms