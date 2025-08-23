# Google Sheets Trigger - Implementation Guide

## Architecture Overview

The Google Sheets Trigger implements a sophisticated polling mechanism that combines Google Drive API revision tracking with Google Sheets API data access to provide efficient change detection and flexible data processing.

## Core Implementation Components

### 1. Polling Infrastructure

#### Base Polling Function
```typescript
async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
  const workflowStaticData = this.getWorkflowStaticData('node');
  const event = this.getNodeParameter('event', 0) as string;
  
  // Document and sheet identification
  const documentId = this.getNodeParameter('documentId', undefined, {
    extractValue: true,
  }) as string;
  
  const sheetWithinDocument = this.getNodeParameter('sheetName', undefined, {
    extractValue: true,
  }) as string;
  
  // Process based on event type
  if (event === 'rowAdded') {
    return await this.handleRowAddedEvent();
  } else {
    return await this.handleRevisionBasedEvents();
  }
}
```

#### State Management
```typescript
// Persistent state across workflow executions
interface WorkflowStaticData {
  documentId?: string;
  sheetId?: string;
  lastRevision?: number;
  lastRevisionLink?: string;
  lastIndexChecked?: number;
}

// State reset logic
if (this.getMode() !== 'manual' &&
    (workflowStaticData.documentId !== documentId || 
     workflowStaticData.sheetId !== sheetId)) {
  workflowStaticData.documentId = documentId;
  workflowStaticData.sheetId = sheetId;
  workflowStaticData.lastRevision = undefined;
  workflowStaticData.lastRevisionLink = undefined;
  workflowStaticData.lastIndexChecked = undefined;
}
```

### 2. Revision Tracking System

#### Drive API Revision Fetching
```typescript
// Paginated revision retrieval
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

  if (nextPageToken) {
    pageToken = nextPageToken as string;
  } else {
    pageToken = undefined;
    
    const lastRevision = +revisions[revisions.length - 1].id;
    if (lastRevision > previousRevision) {
      workflowStaticData.lastRevision = lastRevision;
      workflowStaticData.lastRevisionLink = 
        revisions[revisions.length - 1].exportLinks[BINARY_MIME_TYPE];
      return await this.processRevisionChange();
    }
  }
} while (pageToken);
```

#### Binary Data Processing
```typescript
// Revision file retrieval and processing
const getRevisionFile = async function(
  this: IPollFunctions,
  exportLink: string
): Promise<Buffer> {
  const response = await apiRequest.call(
    this,
    'GET',
    '',
    undefined,
    {},
    exportLink,
    { encoding: null, resolveWithFullResponse: true }
  );
  
  return Buffer.from(response.body);
};

// Convert binary data to sheet arrays
const sheetBinaryToArrayOfArrays = (
  binaryData: Buffer,
  sheetName: string,
  range?: string
): string[][] => {
  // Process Excel binary data to extract sheet information
  // Implementation handles XLSX parsing and range extraction
};
```

### 3. Resource Locator Implementation

#### Document Resolution
```typescript
// Multi-mode document identification
const { mode: documentMode } = this.getNodeParameter('documentId', 0) as {
  mode: ResourceLocator;
};

switch (documentMode) {
  case 'list':
    // Use spreadSheetsSearch results
    break;
  case 'url':
    // Extract ID from URL using regex
    const urlMatch = documentUrl.match(GOOGLE_DRIVE_FILE_URL_REGEX);
    documentId = urlMatch ? urlMatch[1] : null;
    break;
  case 'id':
    // Use direct ID
    documentId = this.getNodeParameter('documentId.value', 0) as string;
    break;
}
```

#### Sheet Resolution with GoogleSheet Helper
```typescript
// Sheet identification and validation
const googleSheet = new GoogleSheet(documentId, this);
const { sheetId, title: sheetName } = await googleSheet.spreadsheetGetSheet(
  this.getNode(),
  sheetMode,
  sheetWithinDocument,
);

// Sheet name length validation
if (sheetName.length > 31) {
  throw new NodeOperationError(
    this.getNode(),
    'Sheet name is too long choose a name with 31 characters or less',
  );
}
```

### 4. Event-Specific Processing

#### Row Added Event Handler
```typescript
async handleRowAddedEvent(): Promise<INodeExecutionData[][] | null> {
  // Get column headers
  const [columns] = ((
    (await apiRequest.call(
      this,
      'GET',
      `/v4/spreadsheets/${documentId}/values/${encodeURIComponent(sheetName)}!${keyRange}`,
    )) as IDataObject
  ).values as string[][]) || [[]];

  if (!columns?.length) {
    throw new NodeOperationError(
      this.getNode(),
      'Could not retrieve the columns from key row',
    );
  }

  // Get sheet data
  const sheetData = await googleSheet.getData(
    `${sheetName}!${rangeToCheck}`,
    (options.valueRender as ValueRenderOption) || 'UNFORMATTED_VALUE',
    (options.dateTimeRenderOption as string) || 'FORMATTED_STRING',
  );

  // Process based on execution mode
  if (this.getMode() === 'manual') {
    // Return all data for manual testing
    const returnData = arrayOfArraysToJson(sheetData.slice(dataStartIndex), columns);
    return [this.helpers.returnJsonArray(returnData)];
  } else {
    // Track new rows based on index
    if (workflowStaticData.lastIndexChecked === undefined) {
      workflowStaticData.lastIndexChecked = sheetData.length;
      return null; // Initialize baseline
    }
    
    const addedRows = sheetData?.slice(workflowStaticData.lastIndexChecked) || [];
    workflowStaticData.lastIndexChecked = sheetData.length;
    
    if (addedRows.length > 0) {
      return [this.helpers.returnJsonArray(arrayOfArraysToJson(addedRows, columns))];
    }
  }
  
  return null;
}
```

#### Row Update Event Handler
```typescript
async handleRowUpdateEvent(): Promise<INodeExecutionData[][] | null> {
  // Get current sheet data
  const currentData = (await googleSheet.getData(
    sheetRange,
    'UNFORMATTED_VALUE',
    'SERIAL_NUMBER',
  )) as string[][];

  // Handle first-time execution
  if (previousRevision === undefined) {
    if (this.getMode() === 'manual') {
      const columns = currentData[keyRow - 1];
      const dataToProcess = rangeDefinition !== 'specifyRangeA1' 
        ? currentData.slice(dataStartIndex) 
        : currentData;
      
      return [this.helpers.returnJsonArray(arrayOfArraysToJson(dataToProcess, columns))];
    }
    return null; // Initialize for automatic mode
  }

  // Get previous revision data
  const previousRevisionBinaryData = await getRevisionFile.call(this, previousRevisionLink);
  const previousRevisionSheetData = sheetBinaryToArrayOfArrays(
    previousRevisionBinaryData,
    sheetName,
    rangeDefinition === 'specifyRangeA1' ? range : undefined,
  ) || [];

  // Compare revisions
  const includeInOutput = this.getNodeParameter('includeInOutput', 'new') as string;
  const columnsToWatch = options.columnsToWatch as string[] || [];
  
  const returnData = compareRevisions(
    previousRevisionSheetData,
    currentData,
    keyRow,
    includeInOutput,
    columnsToWatch,
    dataStartIndex,
    event,
  );

  if (returnData.length > 0) {
    return [this.helpers.returnJsonArray(returnData)];
  }
  
  return null;
}
```

### 5. Data Processing Pipeline

#### Range Processing
```typescript
// Range definition and coordinate calculation
let range = 'A:ZZZ';
let keyRow = 1;
let startIndex = 2;

if (options.dataLocationOnSheet) {
  const locationDefine = (options.dataLocationOnSheet as IDataObject).values as IDataObject;
  const rangeDefinition = locationDefine.rangeDefinition as string;

  if (rangeDefinition === 'specifyRangeA1') {
    range = locationDefine.range as string;
    if (!range) {
      throw new NodeOperationError(
        this.getNode(),
        "The field 'Range' is empty, please provide a range",
      );
    }
  } else if (rangeDefinition === 'specifyRange') {
    keyRow = parseInt(locationDefine.headerRow as string, 10);
    startIndex = parseInt(locationDefine.firstDataRow as string, 10);
  }

  // Calculate key range and data range
  const [rangeFrom, rangeTo] = range.split(':');
  const cellDataFrom = rangeFrom.match(/([a-zA-Z]{1,10})([0-9]{0,10})/) || [];
  const cellDataTo = rangeTo.match(/([a-zA-Z]{1,10})([0-9]{0,10})/) || [];

  if (rangeDefinition === 'specifyRangeA1' && cellDataFrom[2] !== undefined) {
    keyRange = `${cellDataFrom[1]}${+cellDataFrom[2]}:${cellDataTo[1]}${+cellDataFrom[2]}`;
    rangeToCheck = `${cellDataFrom[1]}${+cellDataFrom[2] + 1}:${rangeTo}`;
  } else {
    keyRange = `${cellDataFrom[1]}${keyRow}:${cellDataTo[1]}${keyRow}`;
    rangeToCheck = `${cellDataFrom[1]}${keyRow}:${rangeTo}`;
  }
}
```

#### Array to JSON Transformation
```typescript
// Convert 2D array to JSON objects with headers
function arrayOfArraysToJson(
  data: string[][],
  headers: string[]
): IDataObject[] {
  const result: IDataObject[] = [];
  
  for (const row of data) {
    const item: IDataObject = {};
    
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const value = row[i];
      
      // Handle null/undefined values
      item[header] = value !== undefined ? value : null;
    }
    
    result.push(item);
  }
  
  return result;
}
```

#### Revision Comparison Engine
```typescript
function compareRevisions(
  previousData: string[][],
  currentData: string[][],
  keyRow: number,
  includeInOutput: string,
  columnsToWatch: string[],
  dataStartIndex: number,
  event: string
): IDataObject[] {
  const result: IDataObject[] = [];
  const headers = currentData[keyRow - 1] || [];
  
  // Build column watch indices if specified
  const watchIndices = columnsToWatch.length > 0 
    ? columnsToWatch.map(col => headers.indexOf(col)).filter(idx => idx !== -1)
    : headers.map((_, idx) => idx);

  // Compare each row
  for (let i = dataStartIndex; i < Math.max(previousData.length, currentData.length); i++) {
    const prevRow = previousData[i] || [];
    const currRow = currentData[i] || [];
    
    // Check for changes in watched columns
    const hasChanges = watchIndices.some(colIdx => 
      (prevRow[colIdx] || '') !== (currRow[colIdx] || '')
    );
    
    if (hasChanges) {
      if (includeInOutput === 'old' || includeInOutput === 'both') {
        result.push(arrayToObject(prevRow, headers));
      }
      
      if (includeInOutput === 'new' || includeInOutput === 'both') {
        result.push(arrayToObject(currRow, headers));
      }
    }
  }
  
  return result;
}

function arrayToObject(row: string[], headers: string[]): IDataObject {
  const obj: IDataObject = {};
  headers.forEach((header, idx) => {
    obj[header] = row[idx] || null;
  });
  return obj;
}
```

### 6. Load Options and List Search

#### Dynamic Spreadsheet Search
```typescript
async spreadSheetsSearch(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
  const query = this.getNodeParameter('query', '') as string;
  
  const response = await apiRequest.call(
    this,
    'GET',
    '/v4/spreadsheets',
    undefined,
    {
      q: query ? `name contains '${query}'` : undefined,
      mimeType: 'application/vnd.google-apps.spreadsheet',
      pageSize: 100,
    }
  );
  
  const results: INodeListSearchItems[] = (response.files || []).map((file: any) => ({
    name: file.name,
    value: file.id,
    url: `https://docs.google.com/spreadsheets/d/${file.id}/edit`,
  }));
  
  return { results };
}
```

#### Sheet Enumeration
```typescript
async sheetsSearch(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
  const documentId = this.getNodeParameter('documentId.value', '') as string;
  
  if (!documentId) {
    return { results: [] };
  }
  
  const googleSheet = new GoogleSheet(documentId, this);
  const sheets = await googleSheet.getSpreadsheetDetails();
  
  const results: INodeListSearchItems[] = sheets.map((sheet: any) => ({
    name: sheet.properties.title,
    value: sheet.properties.title,
    url: `https://docs.google.com/spreadsheets/d/${documentId}/edit#gid=${sheet.properties.sheetId}`,
  }));
  
  return { results };
}
```

#### Header Row Detection
```typescript
async getSheetHeaderRowAndSkipEmpty(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  const documentId = this.getNodeParameter('documentId.value', '') as string;
  const sheetName = this.getNodeParameter('sheetName.value', '') as string;
  
  if (!documentId || !sheetName) {
    return [];
  }
  
  try {
    const googleSheet = new GoogleSheet(documentId, this);
    const sheetData = await googleSheet.getData(`${sheetName}!1:1`, 'UNFORMATTED_VALUE');
    
    const headers = (sheetData?.[0] || []) as string[];
    
    return headers
      .filter(header => header && header.trim() !== '')
      .map((header, index) => ({
        name: header,
        value: header,
      }));
  } catch (error) {
    return [];
  }
}
```

### 7. Error Handling Implementation

#### Permission Error Detection
```typescript
// Permission-specific error handling
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
// Structured API error handling
if (
  error?.error?.error?.message !== undefined &&
  !(error.error.error.message as string).toLowerCase().includes('unknown error') &&
  !(error.error.error.message as string).toLowerCase().includes('bad request')
) {
  let [message, ...description] = (error.error.error.message as string).split('. ');
  
  // Translate common error codes
  if (message.toLowerCase() === 'access not configured') {
    message = 'Missing Google Drive API';
  }
  
  throw new NodeOperationError(this.getNode(), message, {
    description: description.join('.\n '),
  });
}
```

#### Validation Error Handling
```typescript
// Input validation with specific error messages
if (sheetName.length > 31) {
  throw new NodeOperationError(
    this.getNode(),
    'Sheet name is too long choose a name with 31 characters or less',
  );
}

if (!columns?.length) {
  throw new NodeOperationError(
    this.getNode(),
    'Could not retrieve the columns from key row',
  );
}

if (locationDefine.range === '') {
  throw new NodeOperationError(
    this.getNode(),
    "The field 'Range' is empty, please provide a range",
  );
}
```

## Integration Patterns

### GoogleSheet Helper Class Usage
```typescript
// Instantiate GoogleSheet helper
const googleSheet = new GoogleSheet(documentId, this);

// Get sheet metadata
const { sheetId, title: sheetName } = await googleSheet.spreadsheetGetSheet(
  this.getNode(),
  sheetMode,
  sheetWithinDocument,
);

// Fetch data with rendering options
const sheetData = await googleSheet.getData(
  `${sheetName}!${rangeToCheck}`,
  (options.valueRender as ValueRenderOption) || 'UNFORMATTED_VALUE',
  (options.dateTimeRenderOption as string) || 'FORMATTED_STRING',
);
```

### API Request Abstraction
```typescript
// Unified API request with proper error handling
const response = await apiRequest.call(
  this,
  'GET',
  `/v4/spreadsheets/${documentId}/values/${encodeURIComponent(sheetName)}!${keyRange}`,
  undefined,
  queryParameters,
  customUrl,
  requestOptions
);
```

## Performance Considerations

### Efficient Change Detection
- Use revision tracking instead of full data comparison
- Implement column-specific watching to reduce processing
- Cache sheet metadata to minimize API calls
- Use appropriate value rendering for performance vs. accuracy tradeoffs

### Memory Management
- Stream large datasets instead of loading entirely into memory
- Process data in chunks for large sheets
- Clean up binary data after processing
- Use efficient data structures for comparison operations

### API Optimization
- Batch API requests where possible
- Implement proper pagination for large result sets
- Use appropriate field selections to reduce payload size
- Monitor and respect API rate limits