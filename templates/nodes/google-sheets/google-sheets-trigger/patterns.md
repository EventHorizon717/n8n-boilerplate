# Google Sheets Trigger Node - Production Patterns

## Overview
The Google Sheets Trigger is a sophisticated polling trigger that monitors Google Sheets for data changes using Google Drive API revision tracking combined with Google Sheets API data access. It implements advanced change detection, state persistence, and flexible data transformation patterns.

## Core Patterns

### 1. Polling Mechanism with Revision Tracking

#### Revision-Based Change Detection
The trigger uses Google Drive API revision history to detect changes efficiently:

```typescript
// Revision fetching with pagination
let pageToken;
do {
  const { revisions, nextPageToken } = await apiRequest.call(
    this,
    'GET',
    '',
    undefined,
    {
      fields: 'revisions(id, exportLinks), nextPageToken',
      pageToken,
      pageSize: 1000,
    },
    `https://www.googleapis.com/drive/v3/files/${documentId}/revisions`,
  );
  
  const lastRevision = +revisions[revisions.length - 1].id;
  if (lastRevision > previousRevision) {
    // Process changes
  }
} while (pageToken);
```

#### Workflow Static Data Persistence
```typescript
// State management across executions
const workflowStaticData = this.getWorkflowStaticData('node');

// Reset state when document/sheet changes
if (workflowStaticData.documentId !== documentId || 
    workflowStaticData.sheetId !== sheetId) {
  workflowStaticData.documentId = documentId;
  workflowStaticData.sheetId = sheetId;
  workflowStaticData.lastRevision = undefined;
  workflowStaticData.lastRevisionLink = undefined;
  workflowStaticData.lastIndexChecked = undefined;
}
```

### 2. Resource Locator Pattern

#### Multi-Mode Resource Selection
```json
{
  "displayName": "Document",
  "name": "documentId",
  "type": "resourceLocator",
  "modes": [
    {
      "displayName": "From List",
      "name": "list",
      "type": "list",
      "typeOptions": {
        "searchListMethod": "spreadSheetsSearch",
        "searchable": true
      }
    },
    {
      "displayName": "By URL",
      "name": "url", 
      "type": "string",
      "extractValue": {
        "type": "regex",
        "regex": "GOOGLE_DRIVE_FILE_URL_REGEX"
      },
      "validation": [{
        "type": "regex",
        "properties": {
          "regex": "GOOGLE_DRIVE_FILE_URL_REGEX",
          "errorMessage": "Not a valid Google Drive File URL"
        }
      }]
    },
    {
      "displayName": "By ID",
      "name": "id",
      "type": "string",
      "validation": [{
        "type": "regex",
        "properties": {
          "regex": "[a-zA-Z0-9\\-_]{2,}",
          "errorMessage": "Not a valid Google Drive File ID"
        }
      }],
      "url": "=https://docs.google.com/spreadsheets/d/{{$value}}/edit"
    }
  ]
}
```

#### Dynamic Sheet Selection
```json
{
  "displayName": "Sheet",
  "name": "sheetName", 
  "type": "resourceLocator",
  "typeOptions": {
    "loadOptionsDependsOn": ["documentId.value"]
  },
  "modes": [
    {
      "displayName": "From List",
      "name": "list",
      "typeOptions": {
        "searchListMethod": "sheetsSearch"
      }
    },
    {
      "displayName": "By URL", 
      "name": "url",
      "extractValue": {
        "type": "regex",
        "regex": "GOOGLE_SHEETS_SHEET_URL_REGEX"
      }
    }
  ]
}
```

### 3. Event Handling Patterns

#### Row Added Detection
```typescript
// Index-based change detection for new rows
if (this.getMode() !== 'manual') {
  if (workflowStaticData.lastIndexChecked === undefined) {
    workflowStaticData.lastIndexChecked = sheetData.length;
    return null; // Initialize baseline
  }
  
  const rowsStartIndex = Math.max(
    workflowStaticData.lastIndexChecked as number,
    dataStartIndex,
  );
  const addedRows = sheetData?.slice(rowsStartIndex) || [];
  
  workflowStaticData.lastIndexChecked = sheetData.length;
  
  if (addedRows.length > 0) {
    return [this.helpers.returnJsonArray(arrayOfArraysToJson(addedRows, columns))];
  }
}
```

#### Row Update Detection with Revision Comparison
```typescript
// Binary data comparison for change detection
const previousRevisionBinaryData = await getRevisionFile.call(this, previousRevisionLink);
const previousRevisionSheetData = sheetBinaryToArrayOfArrays(
  previousRevisionBinaryData,
  sheetName,
  rangeDefinition === 'specifyRangeA1' ? range : undefined,
) || [];

const returnData = compareRevisions(
  previousRevisionSheetData,
  currentData,
  keyRow,
  includeInOutput,
  options.columnsToWatch as string[],
  dataStartIndex,
  event,
);
```

### 4. Data Processing Patterns

#### Range Definition Handling
```typescript
// A1 notation range processing
let range = 'A:ZZZ';
let keyRow = 1;
let startIndex = 2;

if (options.dataLocationOnSheet) {
  const locationDefine = (options.dataLocationOnSheet as IDataObject).values as IDataObject;
  const rangeDefinition = locationDefine.rangeDefinition as string;
  
  if (rangeDefinition === 'specifyRangeA1') {
    range = locationDefine.range as string;
  } else if (rangeDefinition === 'specifyRange') {
    keyRow = parseInt(locationDefine.headerRow as string, 10);
    startIndex = parseInt(locationDefine.firstDataRow as string, 10);
  }
  
  // Calculate key range and data range
  const [rangeFrom, rangeTo] = range.split(':');
  const cellDataFrom = rangeFrom.match(/([a-zA-Z]{1,10})([0-9]{0,10})/) || [];
  const cellDataTo = rangeTo.match(/([a-zA-Z]{1,10})([0-9]{0,10})/) || [];
  
  keyRange = `${cellDataFrom[1]}${keyRow}:${cellDataTo[1]}${keyRow}`;
  rangeToCheck = `${cellDataFrom[1]}${keyRow}:${rangeTo}`;
}
```

#### Array to JSON Conversion
```typescript
// Convert sheet arrays to JSON objects
const returnData = arrayOfArraysToJson(sheetDataFromStartIndex, columns);

function arrayOfArraysToJson(data: string[][], headers: string[]): IDataObject[] {
  return data.map(row => {
    const item: IDataObject = {};
    headers.forEach((header, index) => {
      item[header] = row[index] || null;
    });
    return item;
  });
}
```

### 5. Authentication and API Integration

#### Multi-API OAuth2 Pattern
```json
{
  "credentials": [
    {
      "name": "googleSheetsTriggerOAuth2Api",
      "required": true,
      "displayOptions": {
        "show": {
          "authentication": ["triggerOAuth2"]
        }
      }
    }
  ]
}
```

#### API Request Abstraction
```typescript
// Unified API request handling
const { revisions, nextPageToken } = await apiRequest.call(
  this,
  'GET',
  '',
  undefined,
  {
    fields: 'revisions(id, exportLinks), nextPageToken',
    pageToken,
    pageSize: 1000,
  },
  `https://www.googleapis.com/drive/v3/files/${documentId}/revisions`,
);

// Sheets API data fetching
const sheetData = await googleSheet.getData(
  `${sheetName}!${rangeToCheck}`,
  (options.valueRender as ValueRenderOption) || 'UNFORMATTED_VALUE',
  (options.dateTimeRenderOption as string) || 'FORMATTED_STRING',
);
```

### 6. Error Handling Patterns

#### Permission-Based Error Handling
```typescript
if (
  error?.description
    ?.toLowerCase()
    .includes('user does not have sufficient permissions for file')
) {
  throw new NodeOperationError(
    this.getNode(),
    "Edit access to the document is required for the 'Row Update' and 'Row Added or Updated' triggers. Request edit access to the document's owner or select the 'Row Added' trigger in the 'Trigger On' dropdown.",
  );
}
```

#### API Error Processing
```typescript
if (
  error?.error?.error?.message !== undefined &&
  !(error.error.error.message as string).toLocaleLowerCase().includes('unknown error') &&
  !(error.error.error.message as string).toLocaleLowerCase().includes('bad request')
) {
  let [message, ...description] = (error.error.error.message as string).split('. ');
  if (message.toLowerCase() === 'access not configured') {
    message = 'Missing Google Drive API';
  }
  throw new NodeOperationError(this.getNode(), message, {
    description: description.join('.\n '),
  });
}
```

### 7. Load Options and List Search Patterns

#### Dynamic Option Loading
```typescript
methods = {
  listSearch: { spreadSheetsSearch, sheetsSearch },
  loadOptions: { getSheetHeaderRowAndSkipEmpty },
};

// Sheet header detection for column watching
async getSheetHeaderRowAndSkipEmpty(): Promise<INodePropertyOptions[]> {
  const documentId = this.getNodeParameter('documentId.value', 0, '') as string;
  const sheetName = this.getNodeParameter('sheetName.value', 0, '') as string;
  
  const googleSheet = new GoogleSheet(documentId, this);
  const { values } = await googleSheet.getData(`${sheetName}!1:1`, 'UNFORMATTED_VALUE');
  
  return (values?.[0] || []).map((header: string, index: number) => ({
    name: header || `Column ${index + 1}`,
    value: header || `Column ${index + 1}`,
  }));
}
```

### 8. Value Rendering Options

#### Flexible Data Format Control
```json
{
  "displayName": "Value Render",
  "name": "valueRender",
  "type": "options",
  "options": [
    {
      "name": "Unformatted",
      "value": "UNFORMATTED_VALUE",
      "description": "Values will be calculated, but not formatted in the reply"
    },
    {
      "name": "Formatted", 
      "value": "FORMATTED_VALUE",
      "description": "Values will be formatted and calculated according to the cell's formatting"
    },
    {
      "name": "Formula",
      "value": "FORMULA",
      "description": "Values will not be calculated. The reply will include the formulas."
    }
  ],
  "default": "UNFORMATTED_VALUE"
}
```

#### DateTime Rendering Control
```json
{
  "displayName": "DateTime Render",
  "name": "dateTimeRenderOption",
  "type": "options", 
  "options": [
    {
      "name": "Serial Number",
      "value": "SERIAL_NUMBER",
      "description": "Fields will be returned as doubles in \"serial number\" format"
    },
    {
      "name": "Formatted String", 
      "value": "FORMATTED_STRING",
      "description": "Fields will be rendered as strings in their given number format"
    }
  ],
  "default": "SERIAL_NUMBER"
}
```

## Production Implementation Patterns

### 1. Selective Column Monitoring
```json
{
  "event": "rowUpdate",
  "options": {
    "columnsToWatch": ["status", "priority", "assignee"],
    "includeInOutput": "both"
  }
}
```

### 2. Custom Range Processing
```json
{
  "options": {
    "dataLocationOnSheet": {
      "values": {
        "rangeDefinition": "specifyRangeA1",
        "range": "B2:E100"
      }
    }
  }
}
```

### 3. Performance-Optimized Configuration
```json
{
  "event": "rowAdded",
  "options": {
    "valueRender": "UNFORMATTED_VALUE",
    "dateTimeRenderOption": "SERIAL_NUMBER"
  }
}
```

### 4. Comprehensive Change Tracking
```json
{
  "event": "anyUpdate",
  "includeInOutput": "both",
  "options": {
    "valueRender": "FORMATTED_VALUE",
    "dateTimeRenderOption": "FORMATTED_STRING"
  }
}
```

## Best Practices

### Change Detection Strategy
- Use `rowAdded` for append-only scenarios (forms, logs)
- Use `rowUpdate` for specific field monitoring
- Use `anyUpdate` for comprehensive change tracking

### Performance Optimization
- Limit monitoring to specific columns when possible
- Use appropriate value rendering for data requirements
- Consider sheet size and update frequency for polling intervals

### Error Resilience
- Handle permission errors with clear user guidance
- Implement retry logic for transient API failures
- Validate sheet names and ranges before processing

### State Management
- Leverage workflow static data for persistence
- Reset state appropriately when configuration changes
- Handle first-run initialization gracefully

### Data Processing
- Use appropriate range definitions for data structure
- Handle empty cells and missing headers gracefully
- Convert data types appropriately for downstream processing