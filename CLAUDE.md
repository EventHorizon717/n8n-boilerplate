# n8n Workflow Project

## Project Overview
[Describe the specific n8n workflow you're building here]

## Workflow Goals
- [Primary objective of this workflow]
- [Secondary objectives]
- [Success metrics]

## Architecture Overview
This project follows a modular architecture with the following components:

### Input Layer
- Data sources and triggers
- Input validation and preprocessing

### Processing Layer
- Core business logic
- Data transformations
- External API integrations

### Output Layer
- Result formatting
- Data storage/forwarding
- Error handling and notifications

## Workflow Subsections
- **data-input/**: Handles all incoming data and triggers
- **processing/**: Contains core workflow logic
- **output/**: Manages results and final actions

## Development Approach
1. Define requirements in `docs/workflow-requirements.md`
2. Design database schema in `docs/database-schema.md` (if applicable)
3. Create modular subsections in `workflows/subsections/`
4. Validate with testing scenarios in `testing/test-scenarios.md`
5. Merge subsections into main workflow
6. Generate ASCII diagram for visualization

## Success Criteria
[Define what constitutes a successful workflow execution - reference `docs/success-criteria.md`]

## Notes
- Use `references/n8n-nodes-catalog.md` for available nodes
- Follow JSON structure guidelines in `references/json-structure-guide.md`
- Leverage workflow examples in `references/workflow-examples/`
- Run validation commands from `.claude/commands/`