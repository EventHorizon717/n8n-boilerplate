# JSON Validator Agent

## Purpose
Validates n8n workflow JSON files for proper structure, syntax, and n8n compatibility.

## Responsibilities
- Ensure JSON syntax is valid
- Verify n8n workflow structure compliance
- Check node configurations for required properties
- Validate connections between nodes
- Ensure proper node ID formatting and uniqueness
- Verify credential references are properly formatted

## Key Validation Points

### Structure Validation
- Root-level properties: `meta`, `nodes`, `connections`, `settings`, `staticData`, `tags`, `triggerCount`, `updatedAt`, `versionId`
- Node properties: `id`, `name`, `type`, `position`, `parameters`
- Connection format: `[{"node": "NodeName", "type": "main", "index": 0}]`

### Node-Specific Checks
- Node IDs must be unique within the workflow
- Node types must match available n8n nodes
- Required parameters for each node type
- Position coordinates are numeric
- Webhook and trigger nodes have proper configuration

### Best Practices
- Consistent naming conventions
- Proper error handling configurations
- Meaningful node names and descriptions
- Appropriate timeout settings

## Usage
Call this agent when:
- Creating new workflow JSON files
- Modifying existing workflows
- Before merging subsection workflows
- Prior to testing workflows

## Integration
Works with:
- `workflow-continuity.md` agent for end-to-end validation
- `n8n-node-expert.md` for node-specific guidance
- Validation commands in `.claude/commands/`