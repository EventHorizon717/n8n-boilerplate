# n8n Implementation Patterns

## Overview
Real implementation patterns extracted from the n8n repository for creating production-grade nodes and workflows.

## Node Implementation Patterns

### Versioned Node Architecture
**Pattern**: Use `VersionedNodeType` for backward compatibility
```typescript
export class Slack extends VersionedNodeType {
    constructor() {
        const baseDescription: INodeTypeBaseDescription = {
            displayName: 'Slack',
            name: 'slack',
            icon: 'file:slack.svg',
            group: ['output'],
            subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
            description: 'Consume Slack API',
            defaultVersion: 2.3,
        };

        const nodeVersions: IVersionedNodeType['nodeVersions'] = {
            1: new SlackV1(baseDescription),
            2: new SlackV2(baseDescription),
            2.1: new SlackV2(baseDescription),
            2.2: new SlackV2(baseDescription),
            2.3: new SlackV2(baseDescription),
        };

        super(nodeVersions, baseDescription);
    }
}
```

**Key Insights**:
- Use version management for all nodes from the start
- Maintain backward compatibility across versions
- Use shared base descriptions across versions
- Default to latest stable version

## Trigger Node Implementation Patterns

### Webhook-Based Triggers
**Pattern**: Standard webhook trigger with comprehensive validation
```typescript
export class SlackTrigger implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Slack Trigger',
        name: 'slackTrigger',
        icon: 'file:slack.svg',
        group: ['trigger'],
        version: 1,
        subtitle: '={{$parameter["eventFilter"].join(", ")}}',
        description: 'Handle Slack events via webhooks',
        defaults: {
            name: 'Slack Trigger',
        },
        inputs: [],
        outputs: [NodeConnectionTypes.Main],
        webhooks: [
            {
                name: 'default',
                httpMethod: 'POST',
                responseMode: 'onReceived',
                path: 'webhook',
            },
        ],
        credentials: [
            {
                name: 'slackApi',
                required: true,
            },
        ],
        properties: [
            // Property definitions...
        ],
    };
}
```

**Key Insights**:
- Always define webhook configuration in node description
- Use `NodeConnectionTypes.Main` for standard output
- Require credentials for authenticated services
- Include comprehensive property definitions

### Authentication and Security Patterns

#### Webhook Signature Verification
**Pattern**: Always verify webhook authenticity
```typescript
async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    if (!(await verifySignature.call(this))) {
        const res = this.getResponseObject();
        res.status(401).send('Unauthorized').end();
        return {
            noWebhookResponse: true,
        };
    }
    // Process webhook...
}
```

**Key Insights**:
- Implement signature verification for all webhooks
- Return 401 for unauthorized requests
- Use `noWebhookResponse: true` to prevent further processing

#### URL Verification Challenge
**Pattern**: Handle service-specific verification flows
```typescript
if (req.body.type === 'url_verification') {
    const res = this.getResponseObject();
    res.status(200).json({ challenge: req.body.challenge }).end();
    return {
        noWebhookResponse: true,
    };
}
```

**Key Insights**:
- Handle service-specific verification patterns
- Respond appropriately to challenge requests
- Prevent workflow execution during verification

### Data Processing Patterns

#### Event Filtering
**Pattern**: Multi-level filtering for efficiency
```typescript
// Check if the event type is in the filters
const eventType = req.body.event.type as string;

if (
    !filters.includes('file_share') &&
    !filters.includes('any_event') &&
    !filters.includes(eventType)
) {
    return {};
}

// Check for single channel
if (!watchWorkspace) {
    if (
        eventChannel !==
        (this.getNodeParameter('channelId', {}, { extractValue: true }) as string)
    ) {
        return {};
    }
}

// Check if user should be ignored
if (options.userIds) {
    const userIds = options.userIds as string[];
    if (userIds.includes(req.body.event.user)) {
        return {};
    }
}
```

**Key Insights**:
- Implement multiple levels of filtering to reduce unnecessary processing
- Return empty object `{}` to skip workflow execution
- Use early returns for efficiency
- Support both workspace-wide and channel-specific filtering

#### Data Enhancement
**Pattern**: Resolve IDs to human-readable information
```typescript
if (options.resolveIds) {
    if (req.body.event.user) {
        if (req.body.event.type === 'reaction_added') {
            req.body.event.user_resolved = await getUserInfo.call(this, req.body.event.user);
            req.body.event.item_user_resolved = await getUserInfo.call(
                this,
                req.body.event.item_user,
            );
        } else {
            req.body.event.user_resolved = await getUserInfo.call(this, req.body.event.user);
        }
    }

    if (eventChannel) {
        const channel = await getChannelInfo.call(this, eventChannel);
        req.body.event.channel_resolved = channel;
    }
}
```

**Key Insights**:
- Provide options to resolve IDs to readable names
- Handle different event types with specific resolution logic
- Use helper functions for external API calls
- Enhance data without modifying original structure

### Property Configuration Patterns

#### Multi-Option Properties
**Pattern**: Comprehensive event type selection
```typescript
{
    displayName: 'Trigger On',
    name: 'trigger',
    type: 'multiOptions',
    options: [
        {
            name: 'Any Event',
            value: 'any_event',
            description: 'Triggers on any event',
        },
        {
            name: 'Bot / App Mention',
            value: 'app_mention',
            description: 'When your bot or app is mentioned in a channel the app is added to',
        },
        // More options...
    ],
    default: [],
}
```

**Key Insights**:
- Use descriptive display names and clear descriptions
- Provide meaningful default values
- Use `multiOptions` for multiple event selection
- Include comprehensive option sets

#### Resource Locator Pattern
**Pattern**: Flexible resource selection methods
```typescript
{
    displayName: 'Channel to Watch',
    name: 'channelId',
    type: 'resourceLocator',
    required: true,
    default: { mode: 'list', value: '' },
    modes: [
        {
            displayName: 'From List',
            name: 'list',
            type: 'list',
            typeOptions: {
                searchListMethod: 'getChannels',
                searchable: true,
            },
        },
        {
            displayName: 'By ID',
            name: 'id',
            type: 'string',
            validation: [
                {
                    type: 'regex',
                    properties: {
                        regex: '[a-zA-Z0-9]{2,}',
                        errorMessage: 'Not a valid Slack Channel ID',
                    },
                },
            ],
        },
        {
            displayName: 'By URL',
            name: 'url',
            type: 'string',
            validation: [
                {
                    type: 'regex',
                    properties: {
                        regex: 'http(s)?://app.slack.com/client/.*/([a-zA-Z0-9]{2,})',
                        errorMessage: 'Not a valid Slack Channel URL',
                    },
                },
            ],
            extractValue: {
                type: 'regex',
                regex: 'https://app.slack.com/client/.*/([a-zA-Z0-9]{2,})',
            },
        },
    ],
}
```

**Key Insights**:
- Provide multiple ways to specify resources (list, ID, URL)
- Use regex validation with clear error messages
- Implement value extraction for URL inputs
- Make resource selection user-friendly with searchable lists

### File Handling Patterns
**Pattern**: Optional file download with binary data handling
```typescript
if (
    req.body.event.subtype === 'file_share' &&
    (filters.includes('file_share') || filters.includes('any_event'))
) {
    if (this.getNodeParameter('downloadFiles', false) as boolean) {
        for (let i = 0; i < req.body.event.files.length; i++) {
            const file = (await downloadFile.call(
                this,
                req.body.event.files[i].url_private_download,
            )) as Buffer;

            binaryData[`file_${i}`] = await this.helpers.prepareBinaryData(
                file,
                req.body.event.files[i].name,
                req.body.event.files[i].mimetype,
            );
        }
    }
}
```

**Key Insights**:
- Handle binary data with proper preparation methods
- Use optional file download to control data volume
- Process file arrays with indexed naming
- Maintain original file metadata (name, mimetype)

### Dynamic Loading Patterns
**Pattern**: Load options from external APIs
```typescript
methods = {
    listSearch: {
        async getChannels(
            this: ILoadOptionsFunctions,
            filter?: string,
        ): Promise<INodeListSearchResult> {
            const qs = { types: 'public_channel,private_channel' };
            const channels = (await slackApiRequestAllItems.call(
                this,
                'channels',
                'GET',
                '/conversations.list',
                {},
                qs,
            )) as Array<{ id: string; name: string }>;
            
            const results: INodeListSearchItems[] = channels
                .map((c) => ({
                    name: c.name,
                    value: c.id,
                }))
                .filter(
                    (c) =>
                        !filter ||
                        c.name.toLowerCase().includes(filter.toLowerCase()) ||
                        c.value?.toString() === filter,
                )
                .sort((a, b) => {
                    if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
                    if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
                    return 0;
                });
            return { results };
        },
    },
}
```

**Key Insights**:
- Implement dynamic option loading for better UX
- Use filtering and sorting for large datasets
- Cache API responses when possible
- Provide case-insensitive search functionality

## Production-Grade Patterns Summary

### 1. **Security First**
- Always implement signature verification
- Handle authentication challenges properly
- Validate all inputs with regex patterns
- Return appropriate HTTP status codes

### 2. **User Experience Focus**
- Provide multiple input methods (list, ID, URL)
- Include helpful descriptions and validation messages
- Implement searchable and filterable options
- Use dynamic content loading for better performance

### 3. **Robust Error Handling**
- Multiple levels of filtering to prevent unnecessary processing
- Early returns for efficiency
- Proper HTTP response handling
- Graceful handling of missing or invalid data

### 4. **Performance Optimization**
- Optional data enhancement (resolveIds)
- Conditional file downloading
- Efficient filtering and early exits
- Proper binary data handling

### 5. **Maintainability**
- Version management from day one
- Modular helper function organization
- Clear separation of concerns
- Comprehensive property documentation

## Application to Our Template
These patterns will be integrated into:
- **Node Templates**: Real parameter structures and validation
- **Error Handling**: Production-grade patterns
- **Security**: Authentic authentication and verification
- **UX Patterns**: User-friendly configuration options
- **Performance**: Optimized data processing approaches