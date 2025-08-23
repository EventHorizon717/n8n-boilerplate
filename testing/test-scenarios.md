# Test Scenarios - Production-Grade n8n Workflow Testing

## Testing Strategy
Based on n8n's internal testing patterns, this comprehensive testing framework validates workflow functionality, performance, reliability, authentication, and authorization using production-proven approaches.

## Authentication & Authorization Testing

### User Role-Based Testing
Following n8n's user management patterns with comprehensive permission validation:

#### Test User Setup
```javascript
const testUsers = {
  owner: {
    role: 'global:owner',
    permissions: ['workflow:create', 'workflow:read', 'workflow:update', 'workflow:delete', 'workflow:execute', 'workflow:share', 'admin:access'],
    canAccess: 'all_resources'
  },
  admin: {
    role: 'global:admin', 
    permissions: ['workflow:create', 'workflow:read', 'workflow:update', 'workflow:delete', 'workflow:execute', 'credential:manage'],
    canAccess: 'assigned_resources'
  },
  member: {
    role: 'global:member',
    permissions: ['workflow:create', 'workflow:read', 'workflow:update', 'workflow:execute'],
    canAccess: 'own_and_shared_resources'
  },
  viewer: {
    role: 'global:viewer',
    permissions: ['workflow:read'],
    canAccess: 'shared_resources_readonly'
  }
};
```

#### Authentication Test Scenarios

##### Owner Permission Testing
- **Test Scenario**: Owner full access validation
  - **User**: Owner
  - **Endpoint**: `GET /workflows`
  - **Expected Status**: 200
  - **Validation**: Can access all workflows
  - **Test Pattern**: `authOwnerAgent.get('/workflows').expect(200)`

- **Test Scenario**: Owner workflow creation
  - **User**: Owner
  - **Endpoint**: `POST /workflows`
  - **Data**: `{ name: 'Test Workflow', active: false, nodes: [...], connections: {...} }`
  - **Expected Status**: 201
  - **Validation**: Workflow created successfully with correct owner assignment

##### Member Permission Testing
- **Test Scenario**: Member workflow access
  - **User**: Member
  - **Endpoint**: `GET /workflows/{workflowId}`
  - **Expected Status**: 200 (if shared) / 404 (if not shared)
  - **Validation**: Access control based on sharing permissions

- **Test Scenario**: Member admin restriction
  - **User**: Member
  - **Endpoint**: `GET /admin/users`
  - **Expected Status**: 403
  - **Validation**: Admin endpoints are properly restricted

##### Workflow Sharing Permission Testing
- **Test Scenario**: Workflow sharing by owner
  - **User**: Owner
  - **Endpoint**: `PUT /workflows/{workflowId}/share`
  - **Data**: `{ shareWithIds: [memberPersonalProjectId] }`
  - **Expected Status**: 200
  - **Validation**: Sharing permissions correctly applied

- **Test Scenario**: Shared workflow access by member
  - **Setup**: Owner shares workflow with member
  - **User**: Member
  - **Endpoint**: `GET /workflows/{sharedWorkflowId}/test-runs`
  - **Expected Status**: 200
  - **Validation**: Member can access shared workflow resources

##### Unauthenticated Access Testing
- **Test Scenario**: Unauthenticated request rejection
  - **User**: None (no auth header)
  - **Endpoint**: `GET /workflows`
  - **Expected Status**: 401
  - **Validation**: All endpoints require authentication

### Integration Testing Patterns

#### Test Database Setup
```sql
-- Test database schema following n8n patterns
CREATE TABLE workflow_entity (
  id INTEGER PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT 0,
  nodes TEXT NOT NULL,
  connections TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE test_runs (
  id INTEGER PRIMARY KEY,
  workflow_id INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'new',
  run_at DATETIME,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Test Environment Setup
```javascript
beforeEach(async () => {
  // Database cleanup following n8n patterns
  await testDb.truncate(['TestRun', 'TestCaseExecution', 'WorkflowEntity', 'SharedWorkflow']);
  
  // Create test workflows
  workflowUnderTest = await createWorkflow({
    name: 'test-workflow',
    nodes: testWorkflowNodes,
    connections: testWorkflowConnections
  }, ownerUser);
  
  otherWorkflow = await createWorkflow({
    name: 'private-workflow'
  }, otherUser);
});
```

## Unit Testing (Individual Node Testing)

### Trigger Node Testing with Authentication

#### Manual Trigger Testing
- **Test Scenario**: Authenticated manual trigger activation
  - **Setup**: `const authAgent = createAuthAgent('owner');`
  - **Input**: `authAgent.post('/workflows/{workflowId}/execute')`
  - **Expected Output**: Workflow starts successfully with proper user context
  - **Validation**: 
    ```javascript
    expect(response.statusCode).toBe(200);
    expect(response.body.data.executionId).toBeDefined();
    expect(response.body.data.status).toBe('running');
    ```

- **Test Scenario**: Unauthorized manual trigger attempt
  - **Setup**: No authentication headers
  - **Input**: Direct POST to execution endpoint
  - **Expected Output**: Authentication error
  - **Validation**: `expect(response.statusCode).toBe(401);`

#### Webhook Trigger Testing
- **Test Scenario**: Webhook trigger with valid payload and auth
  - **Setup**: Configure webhook with authentication token
  - **Input**: 
    ```javascript
    const webhookPayload = {
      timestamp: new Date().toISOString(),
      data: TestDataFactory.createTestExecutionData({ recordCount: 1 })[0],
      source: 'test_system',
      webhook_id: 'test-webhook-123'
    };
    ```
  - **Expected Output**: Workflow triggers and processes data with audit trail
  - **Validation**: 
    ```javascript
    expect(webhookResponse.statusCode).toBe(200);
    expect(executionData.status).toBe('success');
    expect(executionData.data.webhook_payload).toEqual(webhookPayload);
    ```

- **Test Scenario**: Webhook trigger with malformed payload
  - **Input**: 
    ```javascript
    const malformedPayload = TestDataFactory.createErrorTestData('malformed_json')[0];
    ```
  - **Expected Output**: Error handling activates with detailed error context
  - **Validation**: 
    ```javascript
    expect(response.statusCode).toBe(400);
    expect(response.body.error.code).toBe('MALFORMED_PAYLOAD');
    expect(response.body.error.details).toContain('JSON');
    ```

### Data Processing Node Testing with Production Patterns

#### Valid Data Transformation Testing
- **Test Scenario**: Authenticated data transformation with complex data
  - **Setup**: 
    ```javascript
    const authAgent = createAuthAgent('member');
    const testData = TestDataFactory.createTestExecutionData({
      recordCount: 10,
      dataComplexity: 'medium',
      includeNested: true,
      includeArrays: true
    });
    ```
  - **Input**: Well-formed data matching expected schema with user context
  - **Expected Output**: Correctly transformed data with audit trail
  - **Validation**: 
    ```javascript
    const result = await authAgent.post('/workflows/{workflowId}/execute', { data: testData });
    expect(result.statusCode).toBe(200);
    expect(result.body.data.processed_records).toBe(10);
    expect(result.body.data.transformations_applied).toContain('data_enrichment');
    expect(result.body.data.execution_user).toBe(memberUser.id);
    ```

#### Error Handling with Authentication Context
- **Test Scenario**: Missing required fields with user permissions
  - **Setup**: 
    ```javascript
    const errorData = TestDataFactory.createErrorTestData('missing_fields', 5);
    ```
  - **Input**: Data with missing required fields from authenticated user
  - **Expected Output**: Error handling with user-specific error messages
  - **Validation**: 
    ```javascript
    expect(errorResponse.statusCode).toBe(400);
    expect(errorResponse.body.error.user_id).toBe(memberUser.id);
    expect(errorResponse.body.error.missing_fields).toContain('required_field');
    expect(errorResponse.body.error.recovery_suggestions).toBeDefined();
    ```

- **Test Scenario**: Data type mismatches with validation strictness
  - **Setup**: 
    ```javascript
    const typeMismatchData = TestDataFactory.createErrorTestData('type_mismatch', 3);
    ```
  - **Input**: Data with incorrect field types and validation settings
  - **Expected Output**: Type conversion or detailed validation errors
  - **Validation**: 
    ```javascript
    // Test with strict validation
    const strictResult = await authAgent.post('/workflows/{workflowId}/execute', {
      data: typeMismatchData,
      validation: 'strict'
    });
    expect(strictResult.statusCode).toBe(400);
    expect(strictResult.body.error.validation_errors).toHaveLength(3);
    
    // Test with loose validation  
    const looseResult = await authAgent.post('/workflows/{workflowId}/execute', {
      data: typeMismatchData,
      validation: 'loose'
    });
    expect(looseResult.statusCode).toBe(200);
    expect(looseResult.body.data.type_conversions_applied).toBeGreaterThan(0);
    ```

### External Integration Testing with Mock Services

#### Successful API Integration Testing
- **Test Scenario**: Authenticated API call with mock service
  - **Setup**: 
    ```javascript
    const mockApiResponses = TestDataFactory.createMockApiResponses();
    mockService.setResponse('/api/data', mockApiResponses.success);
    ```
  - **Input**: Valid API request parameters with user credentials
  - **Expected Output**: Successful API response processing with audit logging
  - **Validation**: 
    ```javascript
    const result = await authAgent.post('/workflows/{workflowId}/execute');
    expect(result.statusCode).toBe(200);
    expect(result.body.data.api_calls_made).toBe(1);
    expect(result.body.data.api_responses[0].status).toBe(200);
    expect(result.body.data.audit_trail.user_id).toBe(memberUser.id);
    ```

#### API Timeout and Retry Testing
- **Test Scenario**: API timeout with exponential backoff
  - **Setup**: 
    ```javascript
    const timeoutResponse = TestDataFactory.createMockApiResponses().timeout;
    mockService.setResponse('/api/slow-endpoint', timeoutResponse);
    ```
  - **Input**: Request to slow/unresponsive endpoint with retry configuration
  - **Expected Output**: Timeout handling and retry logic with detailed logging
  - **Validation**: 
    ```javascript
    const result = await authAgent.post('/workflows/{workflowId}/execute', {
      timeout: 10000,
      retry: { maxAttempts: 3, backoffMultiplier: 2 }
    });
    expect(result.body.data.timeout_occurred).toBe(true);
    expect(result.body.data.retry_attempts).toBe(3);
    expect(result.body.data.total_duration_ms).toBeGreaterThan(10000);
    ```

#### API Authentication Failure Testing
- **Test Scenario**: Invalid credentials with circuit breaker
  - **Setup**: 
    ```javascript
    const authFailureResponse = TestDataFactory.createMockApiResponses().error_401;
    mockService.setResponse('/api/secure-endpoint', authFailureResponse);
    ```
  - **Input**: Invalid or expired API credentials
  - **Expected Output**: Authentication error handling with circuit breaker activation
  - **Validation**: 
    ```javascript
    // Test multiple failures to trigger circuit breaker
    for (let i = 0; i < 5; i++) {
      await authAgent.post('/workflows/{workflowId}/execute');
    }
    
    const finalResult = await authAgent.post('/workflows/{workflowId}/execute');
    expect(finalResult.body.data.circuit_breaker_active).toBe(true);
    expect(finalResult.body.data.auth_failures).toBe(5);
    expect(finalResult.body.error.recovery_time_seconds).toBeGreaterThan(0);
    ```

## Integration Testing (End-to-End) with Authentication

### Happy Path Testing with User Context
- **Scenario**: Complete authenticated workflow execution with comprehensive validation
  - **Setup**: 
    ```javascript
    // Configure test environment following n8n patterns
    const testServer = setupTestServer({
      endpointGroups: ['workflows', 'executions', 'credentials'],
      enabledFeatures: ['feat:sharing', 'feat:multipleMainInstances']
    });
    
    // Create authenticated agents
    const authOwnerAgent = testServer.authAgentFor(ownerUser);
    const authMemberAgent = testServer.authAgentFor(memberUser);
    
    // Setup test workflow with authentication
    const workflowData = TestDataFactory.createValidWorkflowData({
      name: 'Integration Test Workflow',
      nodes: productionNodeConfiguration,
      credentials: testCredentials
    });
    ```
  - **Input**: Valid trigger data that exercises all workflow paths with user permissions
    ```javascript
    const triggerData = TestDataFactory.createTestExecutionData({
      recordCount: 100,
      dataComplexity: 'complex',
      includeNested: true,
      includeArrays: true
    });
    ```
  - **Execution Steps**:
    1. **Authentication Validation**: Verify user permissions before execution
    2. **Workflow Triggering**: Start workflow with authenticated context
    3. **Node Execution Monitoring**: Track each node with user audit trail
    4. **Data Transformation Validation**: Verify transformations with data lineage
    5. **Output Verification**: Check final outputs and user-specific notifications
    6. **Audit Trail Validation**: Ensure complete execution logging
  - **Expected Results**:
    ```javascript
    const executionResult = await authOwnerAgent.post(`/workflows/${workflowId}/execute`, {
      data: triggerData
    });
    
    expect(executionResult.statusCode).toBe(200);
    expect(executionResult.body.data.status).toBe('success');
    expect(executionResult.body.data.nodes_executed).toBe(expectedNodeCount);
    expect(executionResult.body.data.records_processed).toBe(100);
    expect(executionResult.body.data.execution_time_ms).toBeLessThan(30000);
    expect(executionResult.body.data.user_id).toBe(ownerUser.id);
    expect(executionResult.body.data.audit_trail).toBeDefined();
    ```
  - **Validation Criteria**:
    - **Authentication**: User properly authenticated and authorized
    - **Execution Status**: Success with detailed status information
    - **Processing Time**: Within acceptable limits (< 30 seconds for 100 records)
    - **Data Integrity**: All required fields present and accurate with type validation
    - **Output Delivery**: Successful delivery to all destinations with confirmation
    - **Audit Trail**: Complete execution history with user context
    - **Resource Usage**: Memory and CPU within defined limits

### Error Handling Testing with Authentication Context

#### Database Connection Failure with User Context
- **Scenario**: Database failure during authenticated workflow execution
  - **Setup**: 
    ```javascript
    // Simulate database failure
    await testDb.disconnect();
    const authAgent = createAuthAgent('owner');
    ```
  - **Input**: Valid workflow data from authenticated user
  - **Expected Results**: 
    - Error detection and logging with user context
    - Retry mechanism activation with exponential backoff
    - Fallback procedures if configured
    - User-specific error notifications and admin alerts
  - **Validation**: 
    ```javascript
    const result = await authAgent.post(`/workflows/${workflowId}/execute`);
    expect(result.statusCode).toBe(500);
    expect(result.body.error.type).toBe('DATABASE_CONNECTION_FAILED');
    expect(result.body.error.user_id).toBe(ownerUser.id);
    expect(result.body.error.retry_attempts).toBeGreaterThan(0);
    expect(result.body.error.notification_sent).toBe(true);
    ```

#### External API Failure with Circuit Breaker
- **Scenario**: External API unavailable with authenticated requests
  - **Setup**: 
    ```javascript
    // Mock API to return 503 errors
    const errorResponse = TestDataFactory.createMockApiResponses().error_500;
    mockService.setResponse('/api/external-service', errorResponse);
    ```
  - **Input**: API-dependent workflow data from authenticated user
  - **Expected Results**:
    - Retry logic with exponential backoff and user-specific limits
    - Circuit breaker activation after max retries per user
    - Fallback to cached data if available for user
    - Error notification to user and administrators
  - **Validation**: 
    ```javascript
    // Execute multiple requests to trigger circuit breaker
    const results = [];
    for (let i = 0; i < 5; i++) {
      const result = await authAgent.post(`/workflows/${workflowId}/execute`);
      results.push(result);
    }
    
    const lastResult = results[results.length - 1];
    expect(lastResult.body.data.circuit_breaker_active).toBe(true);
    expect(lastResult.body.data.fallback_data_used).toBe(true);
    expect(lastResult.body.error.user_notification_sent).toBe(true);
    ```

- **Scenario**: External API unavailable
  - **Setup**: Mock API endpoint returning 503 errors
  - **Input**: API-dependent workflow data
  - **Expected Results**:
    - Retry logic with exponential backoff
    - Circuit breaker activation after max retries
    - Fallback to cached data if available
    - Error notification to administrators

### Performance Testing
- **Scenario**: Large dataset processing
  - **Setup**: Generate dataset with 1000+ records
  - **Input**: Large batch of data for processing
  - **Expected Results**:
    - Workflow completes within timeout limits
    - Memory usage stays within bounds
    - No data loss or corruption
    - Proper batch processing implementation
  - **Validation Criteria**:
    - Execution time: < 30 minutes for 1000 records
    - Memory usage: < 512MB peak
    - Data integrity: All records processed correctly

- **Scenario**: Concurrent executions
  - **Setup**: Trigger multiple workflow instances simultaneously
  - **Input**: Multiple trigger events within short time window
  - **Expected Results**:
    - Each execution processes independently
    - No data mixing between executions
    - Resource contention handled gracefully
    - All executions complete successfully

## Load Testing

### Volume Testing
- **Test**: Process maximum expected data volume
- **Parameters**: 
  - Records: 10,000 items
  - Duration: 1 hour
  - Concurrent executions: 5
- **Metrics to Monitor**:
  - Execution success rate
  - Average processing time
  - Resource utilization
  - Error rates

### Stress Testing
- **Test**: Process beyond normal capacity
- **Parameters**:
  - Records: 50,000 items
  - Duration: 2 hours
  - Concurrent executions: 10
- **Expected Behavior**:
  - Graceful degradation
  - Error handling activation
  - No system crashes
  - Recovery after load reduction

## Security Testing with Authentication

### Input Validation and Security Testing

#### Malicious Input Testing with User Context
- **Scenario**: SQL injection attempts from authenticated users
  - **Setup**: 
    ```javascript
    const maliciousData = TestDataFactory.createErrorTestData('sql_injection', 5);
    const authAgent = createAuthAgent('member');
    ```
  - **Input**: SQL injection attempts, XSS payloads, script injection from authenticated user
  - **Expected Output**: Input sanitization, rejection, and security logging
  - **Validation**: 
    ```javascript
    const result = await authAgent.post(`/workflows/${workflowId}/execute`, {
      data: maliciousData
    });
    expect(result.statusCode).toBe(400);
    expect(result.body.error.type).toBe('MALICIOUS_INPUT_DETECTED');
    expect(result.body.error.sanitized).toBe(true);
    expect(result.body.error.security_alert_sent).toBe(true);
    expect(result.body.error.user_flagged).toBe(true);
    ```

#### XSS and Script Injection Testing
- **Scenario**: Cross-site scripting attempts with authentication
  - **Setup**: 
    ```javascript
    const xssData = TestDataFactory.createErrorTestData('xss_payload', 3);
    ```
  - **Input**: XSS payloads in workflow data fields
  - **Expected Output**: Complete sanitization and user activity logging
  - **Validation**: 
    ```javascript
    const result = await authAgent.post('/workflows/create', {
      name: '<script>alert("XSS")</script>Test Workflow',
      description: xssData[0].html_content
    });
    expect(result.statusCode).toBe(400);
    expect(result.body.error.scripts_blocked).toBeGreaterThan(0);
    expect(result.body.error.user_security_score_updated).toBe(true);
    ```

#### Oversized Input Testing with User Limits
- **Scenario**: Large payload testing with user-specific limits
  - **Setup**: 
    ```javascript
    const oversizedData = TestDataFactory.createErrorTestData('oversized', 1);
    ```
  - **Input**: Extremely large payloads based on user tier limits
  - **Expected Output**: Size limits enforced per user role with detailed feedback
  - **Validation**: 
    ```javascript
    const result = await authAgent.post(`/workflows/${workflowId}/execute`, {
      data: oversizedData
    });
    expect(result.statusCode).toBe(413); // Payload Too Large
    expect(result.body.error.size_limit_mb).toBeDefined();
    expect(result.body.error.user_tier_limits).toBeDefined();
    expect(result.body.error.upgrade_suggestion).toBeDefined();
    ```

### Advanced Authentication & Session Testing

#### Token Expiration and Renewal Testing
- **Scenario**: Expired authentication tokens during workflow execution
  - **Setup**: 
    ```javascript
    const authHelper = new AuthTestHelper();
    const expiredToken = authHelper.generateAuthToken(memberUser.id, '1ms'); // Immediate expiry
    const agent = { headers: { 'Authorization': `Bearer ${expiredToken}` } };
    ```
  - **Input**: Workflow execution with expired token
  - **Expected Output**: Token refresh or authentication challenge
  - **Validation**: 
    ```javascript
    const result = await makeRequest('POST', '/workflows/execute', agent);
    expect(result.statusCode).toBe(401);
    expect(result.body.error.code).toBe('TOKEN_EXPIRED');
    expect(result.body.error.refresh_required).toBe(true);
    ```

#### Credential Rotation Testing
- **Scenario**: Seamless credential updates during active workflows
  - **Setup**: 
    ```javascript
    // Create workflow with initial credentials
    const initialCredentials = { apiKey: 'initial-key-123' };
    const workflowWithCreds = await createWorkflowWithCredentials(initialCredentials);
    ```
  - **Input**: Updated credentials during workflow execution
  - **Expected Output**: Seamless transition without execution interruption
  - **Validation**: 
    ```javascript
    // Start long-running workflow
    const executionPromise = authAgent.post(`/workflows/${workflowId}/execute`);
    
    // Update credentials mid-execution
    await authAgent.put(`/credentials/${credentialId}`, {
      apiKey: 'updated-key-456'
    });
    
    const result = await executionPromise;
    expect(result.statusCode).toBe(200);
    expect(result.body.data.credential_rotation_handled).toBe(true);
    expect(result.body.data.service_interruption).toBe(false);
    ```

#### Session Management and Concurrent Access
- **Scenario**: Multiple concurrent sessions per user
  - **Setup**: 
    ```javascript
    const agent1 = createAuthAgent('member');
    const agent2 = createAuthAgent('member'); // Same user, different session
    ```
  - **Input**: Concurrent workflow executions from same user
  - **Expected Output**: Proper session isolation and resource management
  - **Validation**: 
    ```javascript
    const [result1, result2] = await Promise.all([
      agent1.post(`/workflows/${workflowId}/execute`),
      agent2.post(`/workflows/${workflowId2}/execute`)
    ]);
    
    expect(result1.statusCode).toBe(200);
    expect(result2.statusCode).toBe(200);
    expect(result1.body.data.session_id).not.toBe(result2.body.data.session_id);
    expect(result1.body.data.execution_isolated).toBe(true);
    ```

## Data Quality Testing

### Data Validation Testing
- **Scenario**: Invalid data formats
  - **Input**: Malformed emails, invalid phone numbers, incorrect dates
  - **Expected Output**: Validation errors and data cleaning
  - **Validation**: Data quality rules enforced

- **Scenario**: Missing critical data
  - **Input**: Records missing required fields
  - **Expected Output**: Appropriate handling (reject, default values, or flag for review)
  - **Validation**: Data completeness maintained

### Data Transformation Testing
- **Scenario**: Complex data mapping
  - **Input**: Source data in various formats
  - **Expected Output**: Consistent target format
  - **Validation**: All transformations applied correctly

## Regression Testing

### Automated Test Suite
- **Test Cases**: 
  - All happy path scenarios
  - Critical error handling paths
  - Performance benchmarks
  - Data validation rules
- **Execution**: Run after any workflow changes
- **Criteria**: 100% of existing functionality must continue to work

### Version Compatibility Testing
- **Test**: Workflow compatibility with n8n updates
- **Process**: Test workflow on new n8n versions before upgrading
- **Validation**: All nodes function correctly with new versions

## Test Data Management with Production Patterns

### Enhanced Mock Data Sets
- **Location**: `testing/mock-data/` with organized structure
- **Data Factory Usage**: 
  ```javascript
  const TestDataFactory = require('./testing/utils/test-data-factory');
  
  // Generate various test data types
  const validData = TestDataFactory.createTestExecutionData({
    recordCount: 100,
    dataComplexity: 'medium',
    includeNested: true
  });
  
  const errorData = TestDataFactory.createErrorTestData('validation', 10);
  const performanceData = TestDataFactory.createPerformanceTestData();
  const mockResponses = TestDataFactory.createMockApiResponses();
  ```

### Test Data Types with Authentication Context
- **User-Specific Data**: 
  ```javascript
  // Data tied to specific user roles
  const ownerData = TestDataFactory.createTestExecutionData({ 
    recordCount: 1000, // Owner can process large datasets
    dataComplexity: 'complex'
  });
  
  const memberData = TestDataFactory.createTestExecutionData({ 
    recordCount: 100, // Member has limits
    dataComplexity: 'medium'
  });
  ```

- **Authentication Test Data**:
  ```javascript
  const AuthTestHelper = require('./testing/utils/auth-test-helper');
  const authHelper = new AuthTestHelper();
  const testUsers = authHelper.initializeTestUsers();
  const authScenarios = authHelper.createAuthTestScenarios();
  ```

### Test Data Characteristics
- **Variety**: Cover all data types, formats, and user contexts
- **Volume**: Multiple dataset sizes based on user tier limits
- **Validity**: Mix of valid and invalid data with authentication scenarios
- **Realism**: Representative of production data with real user patterns
- **Security**: Include malicious input patterns for security testing
- **Performance**: Graduated data sizes for load testing different user types

## Test Environment Setup with Production Patterns

### Prerequisites
- n8n test instance with production-like configuration
- Test database with complete n8n schema
- Authentication system with test user management
- Mock external services with realistic response patterns
- Comprehensive monitoring and audit logging
- Performance monitoring and resource tracking

### Enhanced Test Execution Process
1. **Environment Setup**: 
   ```bash
   # Initialize test environment with production patterns
   ./.claude/commands/test-workflow.sh
   ```
   - Configure test database with n8n schema
   - Initialize test users with proper roles and permissions
   - Setup mock services with realistic latency and error patterns
   - Configure monitoring and logging systems

2. **Authentication Setup**:
   ```javascript
   const authHelper = new AuthTestHelper();
   const testUsers = authHelper.initializeTestUsers();
   const authAgents = {
     owner: authHelper.createAuthAgent('owner'),
     member: authHelper.createAuthAgent('member'),
     viewer: authHelper.createAuthAgent('viewer')
   };
   ```

3. **Test Data Generation**:
   ```javascript
   const testData = {
     workflows: TestDataFactory.createValidWorkflowData(),
     executionData: TestDataFactory.createTestExecutionData({ recordCount: 100 }),
     errorScenarios: TestDataFactory.createErrorTestData('validation', 10),
     performanceData: TestDataFactory.createPerformanceTestData()
   };
   ```

4. **Execution with Monitoring**: 
   ```javascript
   const executionMetrics = {
     startTime: Date.now(),
     memoryUsage: process.memoryUsage(),
     userContext: currentUser.id
   };
   
   const result = await executeTestWithMetrics(testScenario, executionMetrics);
   ```

5. **Comprehensive Validation**: 
   - Functional validation with user context
   - Performance validation against user tier limits
   - Security validation with threat detection
   - Audit trail validation for compliance

6. **Advanced Reporting**: 
   ```javascript
   const testReport = {
     summary: collectTestMetrics(allResults),
     authentication: authTestResults,
     performance: performanceMetrics,
     security: securityTestResults,
     audit_trail: executionAuditTrail
   };
   ```

7. **Environment Cleanup**: 
   - Clear test database with proper truncation
   - Reset authentication tokens and sessions
   - Clear mock service configurations
   - Archive test logs and metrics
   - Validate complete cleanup for next test run

## Success Criteria with Authentication Context

### Functional Tests with User Context
- ✅ All happy path scenarios complete successfully with proper authentication
- ✅ User permissions enforced correctly across all endpoints
- ✅ Error handling works as designed with user-specific error messages
- ✅ Data transformations are accurate with audit trail
- ✅ External integrations function correctly with user credential management
- ✅ Workflow sharing and collaboration features work properly
- ✅ Session management handles concurrent users correctly

### Security and Authentication Tests
- ✅ All endpoints require proper authentication
- ✅ User roles and permissions enforced correctly
- ✅ Token expiration and renewal handled properly
- ✅ Malicious input detected and sanitized
- ✅ User activity logged for audit compliance
- ✅ Credential rotation handled seamlessly
- ✅ Security alerts triggered for suspicious activity

### Performance Tests with User Context
- ✅ Execution times within acceptable limits per user tier
- ✅ Resource usage within bounds based on user quotas
- ✅ Concurrent execution handling with proper user isolation
- ✅ Large dataset processing capability respects user limits
- ✅ Authentication overhead minimal (<100ms per request)
- ✅ User-specific performance metrics tracked

### Quality Tests with Audit Requirements
- ✅ Data validation rules enforced with user context
- ✅ Security measures effective with threat detection
- ✅ Error recovery mechanisms functional with user notification
- ✅ Monitoring and alerting operational with user-specific alerts
- ✅ Complete audit trail maintained for compliance
- ✅ User activity dashboard functional
- ✅ Test results meet production quality standards

### Integration Tests with Production Patterns
- ✅ Test database schema matches production n8n structure
- ✅ Authentication system mirrors production behavior
- ✅ Mock services provide realistic response patterns
- ✅ Error scenarios cover real-world failure modes
- ✅ Performance tests use production-equivalent data volumes
- ✅ Security tests include actual threat patterns
- ✅ Test automation ready for CI/CD integration

## Continuous Testing with Production Patterns

### Automated Testing Schedule
- **Hourly**: Authentication and security smoke tests
- **Daily**: Critical path testing with user context validation
- **Weekly**: Full regression suite including all user roles and permissions
- **Monthly**: Performance and load testing with realistic user distributions
- **Release**: Comprehensive testing including security penetration testing
- **On-Demand**: User-reported issue reproduction with exact user context

### Enhanced Monitoring Integration
- **Authentication Monitoring**: 
  ```javascript
  // Monitor auth test failures
  if (authTestResults.failureRate > 0.05) {
    sendSecurityAlert('High authentication test failure rate detected');
  }
  ```
- **Performance Monitoring**: Track user-specific performance metrics
- **Security Monitoring**: Monitor for malicious input patterns and user activity
- **Audit Compliance**: Maintain comprehensive test execution audit trails
- **CI/CD Integration**: 
  ```yaml
  # Enhanced CI/CD with authentication testing
  - name: Run Authentication Tests
    run: |
      npm run test:auth
      npm run test:security
      npm run test:compliance
  ```
- **Test Result Analytics**: Advanced reporting with user context analysis
- **Alerting System**: Multi-tier alerting based on test criticality and user impact

### Production Readiness Validation
- ✅ All tests pass with production-equivalent user loads
- ✅ Authentication system performs under stress
- ✅ Security tests validate against current threat landscape
- ✅ Performance meets SLA requirements for all user tiers
- ✅ Audit trails complete and compliant
- ✅ Error handling graceful with proper user communication
- ✅ Monitoring systems operational and alerting correctly