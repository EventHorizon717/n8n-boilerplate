# Workflow Subsection Template

## Purpose
This template provides a standardized structure for creating workflow subsections that can be developed independently and later merged into the main workflow.

## Directory Structure
```
subsection-name/
├── README.md                 # This file - subsection documentation
├── workflow.json            # Subsection workflow JSON
├── diagram.txt             # ASCII diagram of subsection flow
├── test-data.json          # Test data specific to this subsection
└── interface-spec.md       # Input/output interface specification
```

## Subsection Development Process

### 1. Define Interface Specification
Document the expected inputs and outputs in `interface-spec.md`:
- Input data format and requirements
- Output data structure
- Error handling approach
- Dependencies on external services

### 2. Create Workflow JSON
Build the subsection workflow in `workflow.json`:
- Use template node configurations from `../../templates/node-templates.json`
- Follow naming conventions: `subsection-name-node-purpose`
- Include proper error handling
- Add comprehensive logging

### 3. Generate Diagram
Create ASCII visualization in `diagram.txt`:
- Show all nodes and connections
- Indicate data flow direction
- Mark error handling paths
- Include input/output points

### 4. Prepare Test Data
Create test scenarios in `test-data.json`:
- Valid input data samples
- Edge cases and boundary conditions
- Invalid data for error testing
- Performance testing data sets

### 5. Document Functionality
Update this README.md with:
- Specific purpose of this subsection
- Business logic implemented
- External integrations used
- Performance characteristics
- Known limitations

## Interface Standards

### Input Interface
```json
{
  "data": {
    "payload": "[actual data from previous subsection]",
    "metadata": {
      "source": "subsection identifier",
      "timestamp": "ISO8601 datetime",
      "processing_id": "unique processing identifier"
    }
  },
  "context": {
    "workflow_id": "main workflow identifier",
    "execution_id": "execution instance id",
    "user_context": "[user-specific data if applicable]"
  }
}
```

### Output Interface
```json
{
  "results": {
    "processed_data": "[transformed/processed data]",
    "metadata": {
      "subsection": "subsection identifier",
      "processing_time_ms": "execution duration",
      "records_processed": "number of items processed",
      "operations_performed": ["list of operations"]
    }
  },
  "status": "success|warning|error",
  "errors": ["array of error messages if any"],
  "next_subsection_data": "[data formatted for next subsection]"
}
```

## Development Guidelines

### Node Naming Convention
- Format: `{subsection-name}-{node-purpose}`
- Examples: `data-input-webhook`, `processing-validate`, `output-format`
- Use descriptive names that indicate both subsection and function

### Error Handling Requirements
- Every external integration must have error handling
- Include retry logic for transient failures
- Log all errors with sufficient detail for debugging
- Provide meaningful error messages for troubleshooting

### Performance Considerations
- Set appropriate timeouts for all operations
- Use batch processing for large datasets
- Monitor memory usage and optimize if needed
- Implement connection pooling for database operations

### Testing Requirements
- Test with valid data scenarios
- Test error conditions and edge cases
- Validate performance with expected data volumes
- Verify interface compliance with main workflow

## Integration Checklist

Before merging with main workflow:
- [ ] Interface specification matches expected format
- [ ] All nodes have unique IDs within subsection
- [ ] Error handling is comprehensive
- [ ] Logging provides sufficient debugging information
- [ ] Test data covers all scenarios
- [ ] Performance meets requirements
- [ ] Documentation is complete and accurate
- [ ] ASCII diagram is up to date

## Common Patterns

### Input Processing Subsection
```json
{
  "pattern": "input-processing",
  "nodes": ["webhook-trigger", "validate-input", "clean-data", "format-output"],
  "purpose": "Receive, validate, and normalize input data",
  "output_format": "standardized_data_object"
}
```

### Business Logic Subsection
```json
{
  "pattern": "business-logic",
  "nodes": ["receive-data", "apply-rules", "calculate-results", "format-results"],
  "purpose": "Apply business rules and perform calculations",
  "output_format": "processed_business_data"
}
```

### External Integration Subsection
```json
{
  "pattern": "external-integration", 
  "nodes": ["prepare-request", "api-call", "handle-response", "format-output"],
  "purpose": "Integrate with external API or service",
  "output_format": "integrated_data_response"
}
```

### Output Processing Subsection
```json
{
  "pattern": "output-processing",
  "nodes": ["receive-results", "format-output", "deliver-results", "send-notifications"],
  "purpose": "Format and deliver final results",
  "output_format": "delivery_confirmation"
}
```

## Troubleshooting

### Common Issues
- **Node ID conflicts**: Ensure all node IDs are unique across subsections
- **Interface mismatches**: Verify input/output formats match specifications
- **Missing error handling**: Add error paths for all external operations
- **Performance issues**: Check timeout settings and batch sizes

### Debugging Tips
- Use console.log statements in Code nodes for debugging
- Test subsection independently before merging
- Verify all required credentials are configured
- Check n8n execution logs for detailed error information

## Versioning
- Track changes to subsection interface in this README
- Use semantic versioning for major interface changes
- Maintain backward compatibility when possible
- Document breaking changes clearly

## Dependencies
List any external dependencies:
- Required n8n node versions
- External API requirements
- Database schema dependencies
- Credential configurations needed

## Performance Metrics
Document expected performance characteristics:
- Typical execution time
- Memory usage patterns
- Throughput capabilities
- Resource requirements