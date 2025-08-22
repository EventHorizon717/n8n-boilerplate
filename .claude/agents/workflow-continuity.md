# Workflow Continuity Agent

## Purpose
Ensures end-to-end workflow integrity and proper data flow between nodes.

## Responsibilities
- Verify complete data flow paths from triggers to final outputs
- Check for orphaned nodes (nodes with no connections)
- Validate logical workflow progression
- Ensure proper error handling paths
- Verify data transformation continuity
- Check for potential infinite loops or circular dependencies

## Validation Checks

### Flow Integrity
- Every workflow has at least one trigger node
- All nodes (except triggers) have incoming connections
- All non-terminal nodes have outgoing connections
- No unreachable nodes exist in the workflow

### Data Flow Analysis
- Input data types match node expectations
- Data transformations preserve required fields
- Branch merging handles different data structures
- Error paths are properly defined and connected

### Logic Validation
- Conditional branches cover all scenarios
- Switch nodes have appropriate case handling
- Loop nodes have proper exit conditions
- Webhook responses are properly formatted

### Error Handling
- Try/catch patterns are implemented where needed
- Error nodes are connected appropriately
- Fallback paths exist for critical failures
- Timeout handling is configured

## Workflow Patterns

### Common Flow Types
1. **Linear Flow**: Trigger → Process → Output
2. **Branching Flow**: Trigger → Condition → Multiple paths
3. **Merging Flow**: Multiple inputs → Merge → Process
4. **Loop Flow**: Trigger → Loop → Process → Condition → Loop/Exit

### Anti-patterns to Detect
- Dead-end nodes without outputs
- Missing error handling in API calls
- Unhandled empty data scenarios
- Complex nested conditions without documentation

## Usage
Invoke this agent when:
- Completing workflow development
- Merging multiple subsections
- Before final workflow testing
- During workflow reviews and audits

## Integration
Collaborates with:
- `json-validator.md` for structural validation
- `n8n-node-expert.md` for node behavior verification
- Testing framework for end-to-end validation