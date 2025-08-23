# Google Sheets V2 Node - Production Patterns

## Overview
The Google Sheets V2 node implements a sophisticated router-based architecture that provides comprehensive CRUD operations for Google Sheets with advanced resource mapping, flexible data transformation, and modular operation handling.

## Core Architectural Patterns

### 1. Router-Based Execution Pattern

#### Centralized Operation Dispatch
```typescript
// Main execution entry point
export class GoogleSheetsV2 implements INodeType {
  async execute(this: IExecuteFunctions) {
    return await router.call(this);
  }
}

// Router implementation
export async function router(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
  const resource = this.getNodeParameter('resource', 0) as string;
  const operation = this.getNodeParameter('operation', 0) as string;
  
  // Dynamic operation dispatch
  const operationHandler = operations[resource][operation];
  return await operationHandler.call(this);
}
```

#### Operation Matrix Architecture
```typescript
// Structured operation organization
const operations = {
  sheet: {
    create: sheetCreate,
    read: sheetRead,
    update: sheetUpdate,
    delete: sheetDelete,
    append: sheetAppend,
    clear: sheetClear,
  },
  spreadsheet: {
    create: spreadsheetCreate,
    read: spreadsheetRead,
    update: spreadsheetUpdate,
    copy: spreadsheetCopy,
  },
  row: {
    create: rowCreate,
    read: rowRead,
    update: rowUpdate,
    delete: rowDelete,
  }
};
```

### 2. Modular Architecture Pattern

#### Three-Layer Separation
```typescript
// Layer 1: Node Definition with Router
export class GoogleSheetsV2 implements INodeType {
  description: INodeTypeDescription;
  methods = { loadOptions, credentialTest, listSearch, resourceMapping };
  
  constructor(baseDescription: INodeTypeBaseDescription) {
    this.description = { ...baseDescription, ...versionDescription };
  }
  
  async execute(this: IExecuteFunctions) {
    return await router.call(this);
  }
}

// Layer 2: Action Handlers
export async function sheetRead(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
  // Operation-specific logic
}

// Layer 3: Transport and Utilities
export async function apiRequest(/* ... */) {
  // Low-level API communication
}
```

#### Method Abstractions
```typescript
// Reusable method implementations
methods = {
  loadOptions: {
    getSpreadsheets: async function(this: ILoadOptionsFunctions) {
      // Dynamic spreadsheet loading
    },
    getSheets: async function(this: ILoadOptionsFunctions) {
      // Dynamic sheet enumeration
    }
  },
  credentialTest: {
    testCredentials: async function(this: ICredentialTestFunctions) {
      // OAuth2 credential validation
    }
  },
  listSearch: {
    searchSpreadsheets: async function(this: ILoadOptionsFunctions) {
      // Real-time spreadsheet search
    }
  },
  resourceMapping: {
    mapFields: async function(this: ILoadOptionsFunctions) {
      // Intelligent field mapping
    }
  }
};
```

### 3. Version Description Pattern

#### Centralized Configuration Management
```typescript
// versionDescription.ts - Centralized parameter definitions
export const versionDescription: Partial<INodeTypeDescription> = {
  displayName: 'Google Sheets V2',
  name: 'googleSheetsV2',
  group: ['input', 'output'],
  version: 2,
  properties: [
    // Resource selection
    {
      displayName: 'Resource',
      name: 'resource',
      type: 'options',
      options: [
        { name: 'Sheet', value: 'sheet' },
        { name: 'Spreadsheet', value: 'spreadsheet' },
        { name: 'Row', value: 'row' },
        { name: 'Column', value: 'column' }
      ],
      default: 'sheet',
      noDataExpression: true,
    },
    // Operation selection (resource-dependent)
    {
      displayName: 'Operation',
      name: 'operation',
      type: 'options',
      displayOptions: {
        show: { resource: ['sheet'] }
      },
      options: [
        { name: 'Read', value: 'read' },
        { name: 'Create', value: 'create' },
        { name: 'Update', value: 'update' },
        { name: 'Delete', value: 'delete' },
        { name: 'Append', value: 'append' },
        { name: 'Clear', value: 'clear' }
      ],
      default: 'read',
      noDataExpression: true,
    }
  ]
};
```

#### Version-Specific Feature Management
```typescript
// Version-dependent parameter visibility
{
  displayName: 'Advanced Options',
  name: 'advancedOptions',
  type: 'collection',
  displayOptions: {
    show: {
      '@version': [{ _cnd: { gte: 2 } }] // Only in version 2+
    }
  },
  default: {},
  options: [
    // Version 2+ specific options
  ]
}
```

### 4. Resource Locator Integration Pattern

#### Multi-Mode Resource Selection
```typescript
// Document locator with validation
{
  displayName: 'Document',
  name: 'documentId',
  type: 'resourceLocator',
  default: { mode: 'list', value: '' },
  required: true,
  modes: [
    {
      displayName: 'From List',
      name: 'list',
      type: 'list',
      typeOptions: {
        searchListMethod: 'spreadSheetsSearch',
        searchable: true,
      },
    },
    {
      displayName: 'By URL',
      name: 'url',
      type: 'string',
      extractValue: {
        type: 'regex',
        regex: GOOGLE_DRIVE_FILE_URL_REGEX,
      },
      validation: [
        {
          type: 'regex',
          properties: {
            regex: GOOGLE_DRIVE_FILE_URL_REGEX,
            errorMessage: 'Not a valid Google Drive File URL',
          },
        },
      ],
    },
    {
      displayName: 'By ID',
      name: 'id',
      type: 'string',
      validation: [
        {
          type: 'regex',
          properties: {
            regex: '[a-zA-Z0-9\\-_]{2,}',
            errorMessage: 'Not a valid Google Drive File ID',
          },
        },
      ],
    },
  ],
}
```

#### Dynamic Dependency Loading
```typescript
// Sheet selection depends on document
{
  displayName: 'Sheet',
  name: 'sheetName',
  type: 'resourceLocator',
  typeOptions: {
    loadOptionsDependsOn: ['documentId.value'],
  },
  modes: [
    {
      displayName: 'From List',
      name: 'list',
      type: 'list',
      typeOptions: {
        searchListMethod: 'sheetsSearch',
        searchable: false,
      },
    }
  ],
}
```

### 5. Data Processing Pipeline Pattern

#### Input Transformation Chain
```typescript
// Value input option processing
const valueInputOption = this.getNodeParameter('options.valueInputOption', 0, 'RAW') as string;

switch (valueInputOption) {
  case 'RAW':
    // Store values as-is without interpretation
    break;
  case 'USER_ENTERED':
    // Parse values as if entered in UI (formulas, dates, etc.)
    break;
}

// Range processing and validation
const range = this.getNodeParameter('options.range', 0, 'A:Z') as string;
const validatedRange = validateA1Notation(range);

// Data transformation pipeline
const processedData = await this.processInputData()
  .then(data => this.validateData(data))
  .then(data => this.transformForAPI(data))
  .catch(error => this.handleDataError(error));
```

#### Output Transformation Pipeline
```typescript
// Configurable output rendering
const valueRenderOption = this.getNodeParameter('options.valueRenderOption', 0, 'UNFORMATTED_VALUE');
const dateTimeRenderOption = this.getNodeParameter('options.dateTimeRenderOption', 0, 'SERIAL_NUMBER');

// API response processing
const apiResponse = await apiRequest(/* ... */);

// Transform based on render options
const transformedData = this.transformOutputData(
  apiResponse,
  valueRenderOption,
  dateTimeRenderOption
);

// Convert to n8n format
return this.helpers.returnJsonArray(transformedData);
```

### 6. Error Handling and Resilience Pattern

#### Structured Error Processing
```typescript
// API error translation
try {
  const result = await apiRequest.call(this, method, endpoint, body, qs);
  return result;
} catch (error) {
  if (error.code === 'PERMISSION_DENIED') {
    throw new NodeOperationError(
      this.getNode(),
      'Insufficient permissions. Ensure the credential has access to the spreadsheet.',
      {
        description: 'Check sharing settings and OAuth2 scopes.',
        level: 'error'
      }
    );
  }
  
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    // Implement exponential backoff
    await this.delay(Math.pow(2, retryCount) * 1000);
    return this.retryOperation();
  }
  
  throw new NodeOperationError(this.getNode(), error.message);
}
```

#### Data Validation Framework
```typescript
// Input data validation
function validateInputData(data: any[], expectedSchema: Schema): ValidationResult {
  const errors: string[] = [];
  
  data.forEach((row, index) => {
    expectedSchema.fields.forEach(field => {
      const value = row[field.name];
      
      if (field.required && (value === null || value === undefined)) {
        errors.push(`Row ${index + 1}: Missing required field '${field.name}'`);
      }
      
      if (value && !field.validator(value)) {
        errors.push(`Row ${index + 1}: Invalid value '${value}' for field '${field.name}'`);
      }
    });
  });
  
  return { valid: errors.length === 0, errors };
}
```

### 7. Resource Mapping Pattern

#### Intelligent Schema Detection
```typescript
// Automatic field mapping
async function detectSchema(
  this: IExecuteFunctions,
  spreadsheetId: string,
  sheetName: string
): Promise<SchemaDefinition> {
  // Get header row
  const headerData = await apiRequest.call(
    this,
    'GET',
    `/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!1:1`
  );
  
  // Get sample data for type inference
  const sampleData = await apiRequest.call(
    this,
    'GET', 
    `/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!2:10`
  );
  
  // Analyze data patterns
  const fields = headerData.values[0].map((header: string, index: number) => {
    const columnData = sampleData.values.map((row: any[]) => row[index]);
    const inferredType = inferDataType(columnData);
    
    return {
      name: header,
      type: inferredType,
      nullable: columnData.some((value: any) => value === null || value === ''),
      format: inferDataFormat(columnData, inferredType)
    };
  });
  
  return { fields };
}

// Type inference logic
function inferDataType(values: any[]): DataType {
  const nonNullValues = values.filter(v => v !== null && v !== '');
  
  if (nonNullValues.every(v => typeof v === 'number')) return 'number';
  if (nonNullValues.every(v => /^\d{4}-\d{2}-\d{2}/.test(v))) return 'date';
  if (nonNullValues.every(v => /^(true|false)$/i.test(v))) return 'boolean';
  
  return 'string';
}
```

### 8. Batch Operation Pattern

#### Efficient Bulk Processing
```typescript
// Batch update implementation
async function executeBatchUpdate(
  this: IExecuteFunctions,
  spreadsheetId: string,
  requests: BatchUpdateRequest[]
): Promise<BatchUpdateResponse> {
  
  // Group requests by type for optimization
  const groupedRequests = groupRequestsByType(requests);
  
  // Execute in optimal batches
  const results: any[] = [];
  
  for (const [requestType, requestGroup] of Object.entries(groupedRequests)) {
    const batchSize = getBatchSizeForRequestType(requestType);
    
    for (let i = 0; i < requestGroup.length; i += batchSize) {
      const batch = requestGroup.slice(i, i + batchSize);
      
      const batchResult = await apiRequest.call(
        this,
        'POST',
        `/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
        { requests: batch }
      );
      
      results.push(...batchResult.replies);
    }
  }
  
  return { replies: results };
}

// Request grouping logic
function groupRequestsByType(requests: BatchUpdateRequest[]): Record<string, BatchUpdateRequest[]> {
  return requests.reduce((groups, request) => {
    const requestType = Object.keys(request)[0];
    groups[requestType] = groups[requestType] || [];
    groups[requestType].push(request);
    return groups;
  }, {} as Record<string, BatchUpdateRequest[]>);
}
```

### 9. Load Options Integration Pattern

#### Dynamic Option Loading
```typescript
// Spreadsheet enumeration with search
async function getSpreadsheets(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  try {
    const response = await apiRequest.call(
      this,
      'GET',
      '/v3/files',
      undefined,
      {
        q: "mimeType='application/vnd.google-apps.spreadsheet'",
        fields: 'files(id,name,modifiedTime)',
        orderBy: 'modifiedTime desc',
        pageSize: 100
      }
    );
    
    return response.files.map((file: any) => ({
      name: `${file.name} (${new Date(file.modifiedTime).toLocaleDateString()})`,
      value: file.id,
    }));
  } catch (error) {
    return [];
  }
}

// Sheet enumeration with caching
async function getSheets(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  const spreadsheetId = this.getNodeParameter('documentId.value') as string;
  
  if (!spreadsheetId) {
    return [];
  }
  
  try {
    const response = await apiRequest.call(
      this,
      'GET',
      `/v4/spreadsheets/${spreadsheetId}`,
      undefined,
      { fields: 'sheets(properties(sheetId,title,index))' }
    );
    
    return response.sheets
      .sort((a: any, b: any) => a.properties.index - b.properties.index)
      .map((sheet: any) => ({
        name: sheet.properties.title,
        value: sheet.properties.title,
      }));
  } catch (error) {
    return [];
  }
}
```

### 10. Credential Testing Pattern

#### Comprehensive Credential Validation
```typescript
async function testCredentials(this: ICredentialTestFunctions): Promise<INodeCredentialTestResult> {
  const credentials = this.getCredentials('googleSheetsOAuth2Api');
  
  try {
    // Test basic API access
    await apiRequest.call(
      this,
      'GET',
      '/v3/files',
      undefined,
      { 
        q: "mimeType='application/vnd.google-apps.spreadsheet'",
        pageSize: 1
      }
    );
    
    // Test Sheets API access
    await apiRequest.call(
      this,
      'GET',
      '/v4/spreadsheets/test',
      undefined,
      undefined,
      undefined,
      { simple: false, resolveWithFullResponse: true }
    ).catch(error => {
      // 404 is expected for test spreadsheet
      if (error.statusCode !== 404) {
        throw error;
      }
    });
    
    return {
      status: 'OK',
      message: 'Authentication successful',
    };
  } catch (error) {
    return {
      status: 'Error',
      message: `Authentication failed: ${error.message}`,
    };
  }
}
```

## Production Implementation Patterns

### 1. Performance Optimization
```typescript
// Efficient range processing
const optimizeRange = (requestedRange: string, dataSize: number): string => {
  if (requestedRange === 'A:ZZZ' && dataSize < 1000) {
    return `A1:Z${dataSize}`;
  }
  return requestedRange;
};

// Connection pooling and caching
const apiCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedData(key: string): any | null {
  const cached = apiCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  apiCache.delete(key);
  return null;
}
```

### 2. Error Recovery Strategies
```typescript
// Exponential backoff with jitter
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries || !isRetryableError(error)) {
        throw error;
      }
      
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
      const jitter = Math.random() * 0.1 * delay;
      await new Promise(resolve => setTimeout(resolve, delay + jitter));
    }
  }
  
  throw new Error('Max retries exceeded');
}
```

### 3. Data Type Handling
```typescript
// Intelligent type conversion
function convertDataTypes(
  data: any[][],
  schema: SchemaDefinition,
  valueInputOption: string
): any[][] {
  return data.map(row => 
    row.map((value, index) => {
      const field = schema.fields[index];
      if (!field || value === null || value === '') {
        return value;
      }
      
      switch (field.type) {
        case 'number':
          return valueInputOption === 'RAW' ? String(value) : Number(value);
        case 'boolean':
          return valueInputOption === 'RAW' ? String(value) : Boolean(value);
        case 'date':
          return valueInputOption === 'RAW' ? String(value) : new Date(value).toISOString();
        default:
          return String(value);
      }
    })
  );
}
```

## Best Practices

### Architecture Design
- Use the router pattern for clean operation dispatch
- Separate concerns across actions, methods, and transport layers
- Implement version-specific behavior through centralized configuration
- Design for extensibility with new resources and operations

### Performance Optimization  
- Implement intelligent caching for metadata operations
- Use batch operations for bulk data processing
- Optimize API calls through request consolidation
- Monitor and respect API rate limits

### Error Handling
- Provide clear, actionable error messages
- Implement proper retry logic for transient failures
- Validate inputs before API calls to prevent errors
- Use structured error responses for debugging

### Data Processing
- Support multiple data formats and rendering options
- Implement robust type conversion and validation
- Handle edge cases like empty cells and malformed data
- Provide flexible range specification and processing