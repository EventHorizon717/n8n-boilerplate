# AI Intent Classification

## Overview
[Describe the AI classification requirements for this workflow]

## Intent Categories

### Category 1: [Intent Category Name]
**Description**: [What this category represents]

#### Intents
- **intent_name_1**
  - **Description**: [Intent purpose and usage]
  - **Training Examples**:
    - "Example phrase 1"
    - "Example phrase 2" 
    - "Example phrase 3"
  - **Expected Action**: [What the workflow should do for this intent]
  - **Confidence Threshold**: 0.8

- **intent_name_2**
  - **Description**: [Intent purpose and usage]
  - **Training Examples**:
    - "Example phrase 1"
    - "Example phrase 2"
    - "Example phrase 3"
  - **Expected Action**: [What the workflow should do for this intent]
  - **Confidence Threshold**: 0.75

### Category 2: [Another Intent Category]
[Similar structure for additional categories]

## Fallback Handling

### Low Confidence Intents
- **Threshold**: Below 0.6 confidence
- **Action**: Route to human review
- **Response**: "I'm not sure I understand. Could you rephrase that?"

### Unknown Intents
- **Action**: Log for analysis and route to default handler
- **Response**: "I don't recognize that request. Please try again or contact support."

### Ambiguous Intents
- **Multiple High Confidence**: When multiple intents score > 0.7
- **Action**: Present options to user or use context to decide
- **Response**: "Did you mean [option 1] or [option 2]?"

## Entity Extraction

### Entity Types
- **entity_type_1**: [Description and examples]
- **entity_type_2**: [Description and examples]
- **entity_type_3**: [Description and examples]

### Entity Patterns
```json
{
  "date_patterns": [
    "\\d{4}-\\d{2}-\\d{2}",
    "\\d{1,2}/\\d{1,2}/\\d{4}",
    "(today|tomorrow|yesterday)"
  ],
  "email_patterns": [
    "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b"
  ]
}
```

## AI Model Configuration

### Model Selection
- **Primary Model**: [GPT-4/Claude/Local model]
- **Backup Model**: [Fallback option]
- **Specialized Models**: [For specific tasks]

### Prompt Templates

#### Intent Classification Prompt
```
Classify the following user input into one of these intents:
{intent_list}

User input: "{user_input}"

Respond with:
- Intent: [intent_name]
- Confidence: [0.0-1.0]
- Entities: [extracted entities]
- Reasoning: [brief explanation]
```

#### Entity Extraction Prompt
```
Extract the following entities from this text:
{entity_types}

Text: "{input_text}"

Return as JSON:
{
  "entities": [
    {"type": "entity_type", "value": "extracted_value", "confidence": 0.9}
  ]
}
```

## Training Data

### Data Sources
- Historical user interactions
- Support ticket analysis
- User surveys and feedback
- Domain expert input

### Data Format
```json
{
  "training_examples": [
    {
      "text": "I want to cancel my subscription",
      "intent": "cancel_subscription",
      "entities": [
        {"type": "action", "value": "cancel"},
        {"type": "object", "value": "subscription"}
      ]
    }
  ]
}
```

### Data Quality Guidelines
- Minimum 20 examples per intent
- Diverse phrasing and vocabulary
- Include edge cases and variations
- Regular data review and updates

## Performance Metrics

### Accuracy Metrics
- **Intent Accuracy**: Target > 90%
- **Entity Extraction F1**: Target > 85%
- **Confidence Calibration**: Confidence matches actual accuracy

### Operational Metrics
- **Response Time**: < 2 seconds
- **API Availability**: > 99.5%
- **Cost per Request**: Track and optimize

## Testing and Validation

### Test Sets
- **Validation Set**: 20% of labeled data
- **Test Set**: 15% held out for final evaluation
- **Live Testing**: A/B testing with real users

### Evaluation Process
1. Regular model performance reviews
2. Intent drift detection
3. New intent identification
4. Model retraining triggers

## Model Management

### Version Control
- Track model versions and performance
- Rollback procedures for poor performing models
- Gradual rollout of new models

### Retraining Schedule
- **Regular Retraining**: Monthly
- **Triggered Retraining**: When accuracy drops below threshold
- **Data Updates**: Weekly addition of new training examples

## Integration with Workflow

### n8n Configuration
- **AI Classification Node**: Custom function or HTTP request
- **Confidence Routing**: Switch node based on confidence scores
- **Entity Processing**: Set nodes to extract and format entities
- **Fallback Handling**: Error paths for low confidence or unknown intents

### API Integration
```json
{
  "endpoint": "https://ai-service.com/classify",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer {api_key}",
    "Content-Type": "application/json"
  },
  "body": {
    "text": "{{$json.user_input}}",
    "model": "intent-classifier-v2"
  }
}
```

## Monitoring and Alerting

### Performance Alerts
- Accuracy drops below 85%
- Response time exceeds 5 seconds
- High rate of low-confidence predictions
- Unusual intent distribution patterns

### Data Drift Detection
- Monitor vocabulary changes
- Track new intent emergence
- Identify failing intent categories
- Alert on significant distribution shifts