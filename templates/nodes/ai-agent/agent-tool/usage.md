# AI Agent Tool - Usage Guide

## Overview

The AI Agent Tool node provides conversational AI functionality that can be seamlessly integrated into agent workflows. It acts as a tool that can be called by AI agents to perform specific tasks or provide specialized functionality.

## Basic Configuration

### Required Parameters

1. **Tool Description**
   - Provide a clear description of what this tool does
   - This description helps the AI agent understand when and how to use the tool
   - Example: "Analyzes customer feedback and extracts sentiment scores"

2. **Input Text**
   - The primary input for the AI processing
   - Can be static text or dynamic data from previous nodes
   - Example: `{{ $json.customerMessage }}`

### Optional Features

3. **Output Parser Integration**
   - Enable "Require Specific Output Format" 
   - Connect an AI Output Parser node to structure the response
   - Useful when you need JSON, XML, or other structured formats

4. **Fallback Model** (v2.1+)
   - Enable "Enable Fallback Model"
   - Connect a secondary language model for redundancy
   - Improves reliability in production environments

## Connection Requirements

### Minimum Setup
```
[Language Model] → [AI Agent Tool] → [Next Node]
```

### Full Setup with Options
```
[Primary Language Model] → [AI Agent Tool] → [Output]
[Fallback Language Model] →        ↑
[Output Parser] →                  ↑
```

## Implementation Examples

### Basic Sentiment Analysis Tool
```json
{
  "toolDescription": "Analyzes text sentiment and returns positive, negative, or neutral classification",
  "text": "{{ $json.feedback }}",
  "hasOutputParser": false,
  "needsFallback": false
}
```

### Structured Data Extraction Tool
```json
{
  "toolDescription": "Extracts structured information from customer inquiries including intent, urgency, and required actions",
  "text": "{{ $json.customerInquiry }}",
  "hasOutputParser": true,
  "needsFallback": true
}
```

## Connection Patterns

### Dynamic Input Connections

The node automatically adjusts its available input connections based on configuration:

- **Language Model**: Always required for AI processing
- **Output Parser**: Available when `hasOutputParser` is enabled
- **Fallback Model**: Available when `needsFallback` is enabled (v2.1+)

### Output Behavior

- Always outputs as `ai-tool` type
- Can be connected to other AI nodes or standard workflow nodes
- Maintains data structure from language model responses

## Best Practices

### Tool Description Guidelines

1. **Be Specific**: Clearly describe what the tool does
   - Good: "Converts customer complaints into support tickets with priority levels"
   - Poor: "Processes customer messages"

2. **Include Context**: Mention expected input and output
   - "Analyzes product reviews (text input) and returns structured sentiment data (JSON)"

3. **Define Scope**: Specify limitations or special behaviors
   - "Handles English language customer feedback only"

### Input Text Optimization

1. **Dynamic Data**: Use expressions to pull data from workflow
   ```
   {{ $json.messageContent || $json.text || "No input provided" }}
   ```

2. **Data Validation**: Include fallback values for robust operation
   ```
   {{ $json.userMessage ? $json.userMessage : "Please provide valid input" }}
   ```

3. **Context Enhancement**: Add context for better AI understanding
   ```
   Context: Customer support inquiry
   Message: {{ $json.customerMessage }}
   Priority: {{ $json.urgencyLevel }}
   ```

### Error Handling Strategies

1. **Enable Fallback Models** in production environments
2. **Use Output Parsers** for consistent response formats  
3. **Validate Inputs** before processing to avoid errors
4. **Monitor Tool Performance** through workflow execution logs

## Advanced Usage Patterns

### Multi-Tool Agent Workflows

Chain multiple AI Agent Tools for complex processing:

```
[Input] → [Classification Tool] → [Processing Tool] → [Format Tool] → [Output]
```

### Conditional Tool Selection

Use Switch nodes to route to different AI Agent Tools based on data:

```
[Input] → [Switch] → [Technical Support Tool]
               ↓
              [Sales Inquiry Tool]
               ↓
              [General Question Tool]
```

### Feedback Loop Implementation

Create learning systems with AI Agent Tools:

```
[Input] → [AI Agent Tool] → [Validation] → [Feedback Collection] → [Training Data]
```

## Troubleshooting

### Common Issues

1. **No Language Model Connected**
   - Symptom: Node fails to execute
   - Solution: Connect at least one language model input

2. **Invalid Tool Description**
   - Symptom: AI agent doesn't use the tool appropriately
   - Solution: Provide more specific, actionable descriptions

3. **Output Format Issues**
   - Symptom: Inconsistent response formats
   - Solution: Enable output parser and define structured format

4. **Performance Problems**
   - Symptom: Slow execution or timeouts
   - Solution: Enable fallback model and optimize input text

### Version-Specific Features

- **v2.1+**: Fallback model support
- **v2.2**: Enhanced streaming capabilities and improved error handling

## Security Considerations

- Tool inherits security context from connected language models
- No direct external API access - security managed by connected components
- Input validation handled through connected parsers
- Monitor for sensitive data in tool descriptions and inputs