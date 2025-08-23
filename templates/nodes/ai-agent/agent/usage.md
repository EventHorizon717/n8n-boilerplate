# AI Agent - Usage Guide

## Overview

The AI Agent node is the primary conversational AI component in n8n workflows. It provides comprehensive AI functionality including tool integration, streaming responses, output parsing, and fallback model support. This node can be placed anywhere in a workflow and serves as the central hub for AI-powered automation.

## Getting Started

### Quick Setup Resources

1. **Tutorial**: [n8n AI Agent Tutorial](https://docs.n8n.io/advanced-ai/intro-tutorial/)
2. **Examples**: Access workflow templates with AI Agent examples
3. **Pre-built Agents**: Use the "pre-built agents" collection for common use cases

### Basic Configuration

#### 1. Prompt Configuration

**Auto Mode**: Automatically uses data from previous nodes
```json
{
  "promptType": "auto"
}
```
- Best for: Processing data from webhooks, databases, or API responses
- The agent automatically understands the context from incoming data

**Define Mode**: Manually specify the prompt
```json
{
  "promptType": "define", 
  "text": "Analyze this customer feedback and provide sentiment analysis: {{ $json.feedback }}"
}
```
- Best for: Specific instructions or complex prompts
- Allows full control over agent behavior

#### 2. Output Configuration

**Standard Output**: Default JSON response
```json
{
  "hasOutputParser": false
}
```

**Structured Output**: Connect an Output Parser for specific formats
```json
{
  "hasOutputParser": true
}
```

#### 3. Reliability Configuration

**Basic Setup**: Single language model
```json
{
  "needsFallback": false
}
```

**Production Setup**: Primary + fallback models (v2.1+)
```json
{
  "needsFallback": true
}
```

#### 4. Response Mode

**Standard Response**: Complete response after processing
```json
{
  "enableStreaming": false
}
```

**Streaming Response**: Real-time response delivery
```json
{
  "enableStreaming": true
}
```

## Connection Patterns

### Minimum Setup
```
[Previous Node] → [AI Agent] → [Next Node]
                      ↑
               [Language Model]
```

### Full Production Setup
```
[Trigger/Data] → [AI Agent] → [Processing] → [Output]
                      ↑
        [Primary Language Model]
        [Fallback Language Model]
        [Output Parser]
        [Tool 1] [Tool 2] [Tool N]
```

## Implementation Examples

### 1. Customer Support Agent

```json
{
  "promptType": "define",
  "text": "You are a customer support agent. Analyze this inquiry and provide: 1) Issue category, 2) Urgency level, 3) Suggested response. Customer inquiry: {{ $json.message }}",
  "hasOutputParser": true,
  "needsFallback": true,
  "enableStreaming": false
}
```

**Connect**: Language model, JSON Output Parser, fallback model

### 2. Real-time Chat Bot

```json
{
  "promptType": "auto",
  "hasOutputParser": false,
  "needsFallback": true,
  "enableStreaming": true
}
```

**Connect**: Language model, fallback model
**Note**: Configure trigger node for "Streaming Response" mode

### 3. Data Analysis Agent with Tools

```json
{
  "promptType": "define",
  "text": "Analyze the provided data and use available tools to gather additional context if needed. Provide comprehensive insights.",
  "hasOutputParser": true,
  "needsFallback": true,
  "enableStreaming": false
}
```

**Connect**: Language model, analysis tools, database lookup tools, output parser

### 4. Multi-language Translation Agent

```json
{
  "promptType": "define",
  "text": "Translate the following text to {{ $json.targetLanguage }}. Maintain tone and context. Text: {{ $json.originalText }}",
  "hasOutputParser": false,
  "needsFallback": true,
  "enableStreaming": true
}
```

## Advanced Usage Patterns

### Multi-Agent Workflows

Chain multiple AI Agents for complex processing:

```
[Input] → [Classification Agent] → [Processing Agent] → [Response Agent] → [Output]
```

### Conditional Agent Selection

Use Switch nodes to route to specialized agents:

```
[Input] → [Switch] → [Technical Support Agent]
               ↓
            [Sales Agent]  
               ↓
            [General Agent]
```

### Tool-Enhanced Agents

Connect various tools to extend agent capabilities:

```
[AI Agent] ← [Database Tool]
     ↑ ← [API Tool]
     ↑ ← [Calculation Tool]
     ↑ ← [Email Tool]
```

### Feedback Loop Systems

Implement learning and improvement cycles:

```
[Input] → [AI Agent] → [Quality Check] → [Feedback Collection] → [Training Data Store]
                ↓
            [Output] → [User Interaction] → [Satisfaction Metrics] ↗
```

## Version-Specific Features

### Version 2.0 (Base Features)
- Basic AI agent functionality
- Tool integration
- Output parsing support

### Version 2.1 (Enhanced Reliability)
- Fallback model support
- Enhanced error handling
- Improved connection management

### Version 2.2 (Advanced Features)
- Streaming response capability
- Advanced UI hints system
- Performance optimizations

## Best Practices

### Prompt Engineering

1. **Be Specific**: Clear instructions yield better results
   ```
   Good: "Extract customer name, email, and issue type from this support ticket"
   Poor: "Process this customer message"
   ```

2. **Provide Context**: Include relevant background information
   ```
   Context: Customer support ticket from premium user
   Priority: High (paying customer)
   Ticket: {{ $json.ticketContent }}
   ```

3. **Define Output Format**: Specify expected response structure
   ```
   Respond in JSON format with fields: summary, priority, nextSteps
   ```

### Performance Optimization

1. **Use Streaming** for user-facing applications
2. **Enable Fallback Models** in production environments
3. **Connect Relevant Tools** only - avoid tool overload
4. **Optimize Prompts** to be clear and concise

### Error Handling

1. **Always Use Fallback Models** in production
2. **Validate Inputs** before processing
3. **Handle Tool Failures** gracefully
4. **Monitor Performance** through execution logs

### Security Considerations

1. **Credential Management**: Store API keys securely in n8n credentials
2. **Input Sanitization**: Validate and sanitize user inputs
3. **Access Control**: Limit tool access based on user permissions
4. **Data Privacy**: Be mindful of sensitive data in prompts and outputs

## Troubleshooting

### Common Issues

1. **No Language Model Connected**
   - **Symptom**: Node fails to execute
   - **Solution**: Connect at least one language model

2. **Streaming Not Working**
   - **Symptom**: No real-time responses
   - **Solution**: Set trigger node to "Streaming Response" mode

3. **Inconsistent Outputs**
   - **Symptom**: Varying response formats
   - **Solution**: Enable output parser and define schema

4. **Tool Connection Errors**
   - **Symptom**: Tools not accessible to agent
   - **Solution**: Verify tool connections and permissions

5. **Fallback Model Not Triggering**
   - **Symptom**: Failures without fallback activation
   - **Solution**: Check fallback model configuration and connection

### Performance Issues

1. **Slow Response Times**
   - Check language model performance
   - Optimize prompt length and complexity
   - Consider tool execution overhead

2. **High Resource Usage**
   - Monitor concurrent agent executions
   - Optimize tool connections
   - Consider batching operations

### Configuration Validation

The node provides real-time hints for configuration issues:
- Streaming setup validation
- Connection requirement checks  
- Version compatibility warnings

## Integration Examples

### CRM Integration
```
[CRM Webhook] → [AI Agent] → [Lead Scoring] → [CRM Update]
                     ↑
              [Customer Data Tool]
              [Industry Analysis Tool]
```

### Content Generation
```
[Content Brief] → [AI Agent] → [Content Review] → [Publication]
                      ↑
               [SEO Analysis Tool]
               [Fact Checking Tool]
               [Style Guide Tool]
```

### Support Automation
```
[Support Ticket] → [AI Agent] → [Auto Response] → [Ticket Update]
                       ↑
                [Knowledge Base Tool]
                [Escalation Rules Tool]
                [Customer History Tool]
```

## Monitoring and Analytics

### Key Metrics to Track
- Response time and latency
- Tool usage patterns
- Fallback model activation rate
- Output quality scores
- User satisfaction ratings

### Logging Best Practices
- Log all agent interactions
- Track tool performance
- Monitor error rates and types
- Measure business impact metrics