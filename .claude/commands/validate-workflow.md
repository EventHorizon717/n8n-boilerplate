# Validate Workflow Command

## Purpose
Comprehensive validation of n8n workflow JSON files using multiple validation agents.

## Command Usage
Use this command to validate workflow JSON files before testing or deployment.

## Validation Process

### 1. JSON Structure Validation
Invoke the `json-validator.md` agent to check:
- Valid JSON syntax
- Required n8n workflow properties
- Node configuration completeness
- Connection format correctness

### 2. Workflow Continuity Check
Use the `workflow-continuity.md` agent to verify:
- End-to-end data flow integrity
- No orphaned or unreachable nodes
- Proper error handling paths
- Logical workflow progression

### 3. Node Configuration Review
Leverage the `n8n-node-expert.md` agent to confirm:
- Appropriate node selection for tasks
- Correct parameter configurations
- Performance optimization settings
- Security best practices compliance

### 4. Visual Verification
Generate ASCII diagram using `diagram-generator.md` agent to:
- Create workflow visualization
- Identify potential flow issues
- Document workflow structure
- Validate against requirements

## Validation Checklist
- [ ] JSON syntax is valid
- [ ] All required n8n properties present
- [ ] Node IDs are unique
- [ ] All nodes have valid connections
- [ ] No orphaned nodes exist
- [ ] Error handling paths defined
- [ ] Node parameters are complete
- [ ] Security configurations are proper
- [ ] Performance settings optimized
- [ ] Workflow diagram generated

## Output
The validation process should produce:
1. Validation report with pass/fail status
2. List of issues found (if any)
3. Recommendations for improvements
4. Updated workflow diagram

## Integration with Development
Run this command:
- Before merging subsection workflows
- After making significant changes
- Prior to testing with mock data
- Before deployment to n8n instance

## Error Handling
If validation fails:
1. Review specific error messages
2. Fix identified issues
3. Re-run validation
4. Update documentation if needed