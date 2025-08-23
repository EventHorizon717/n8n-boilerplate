# Production-Grade n8n Workflow Testing Guide

## Overview

This guide provides production-proven testing patterns extracted from n8n's internal testing framework. It covers comprehensive testing strategies for enterprise-grade workflow development and deployment.

## Testing Philosophy

Based on n8n's production patterns, workflow testing follows these principles:

- **Test Environment Isolation**: Complete separation between test and production data
- **Authentication-First Testing**: All tests validate user access controls and permissions
- **Integration-Focused Validation**: Emphasis on end-to-end workflow testing with external services
- **Performance Validation**: Load testing and resource monitoring for production readiness
- **Error Resilience**: Comprehensive error handling and recovery testing

## Test Environment Architecture

### Database Testing Patterns

Following n8n's schema patterns, test databases include these core tables:

```sql
-- Workflow management (based on n8n WorkflowEntity)
CREATE TABLE workflow_entity (
    id INTEGER PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT 0,
    nodes TEXT NOT NULL,
    connections TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Execution tracking (based on n8n ExecutionEntity)
CREATE TABLE execution_entity (
    id INTEGER PRIMARY KEY,
    workflow_id INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    mode VARCHAR(50) NOT NULL,
    started_at DATETIME,
    finished_at DATETIME,
    data TEXT,
    FOREIGN KEY (workflow_id) REFERENCES workflow_entity(id)
);

-- Test run management (based on n8n TestRunRepository)
CREATE TABLE test_runs (
    id INTEGER PRIMARY KEY,
    workflow_id INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'new',
    run_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workflow_id) REFERENCES workflow_entity(id)
);
```

### Authentication Testing Framework

Based on n8n's user and role management:

#### User Role Definitions

```json
{
  "test_users": {
    "owner": {
      "id": "owner-user-id",
      "email": "owner@test.example",
      "role": "global:owner",
      "permissions": ["workflow:create", "workflow:read", "workflow:update", "workflow:delete"]
    },
    "member": {
      "id": "member-user-id", 
      "email": "member@test.example",
      "role": "global:member",
      "permissions": ["workflow:read", "workflow:execute"]
    },
    "viewer": {
      "id": "viewer-user-id",
      "email": "viewer@test.example", 
      "role": "global:viewer",
      "permissions": ["workflow:read"]
    }
  }
}
```

#### Authentication Test Scenarios

```javascript
// Based on n8n's authentication testing patterns
const authTestScenarios = [
  {
    name: "owner_full_access",
    user: "owner",
    endpoint: "/workflows",
    method: "POST",
    expected_status: 201,
    description: "Owner can create workflows"
  },
  {
    name: "member_restricted_access", 
    user: "member",
    endpoint: "/workflows/admin",
    method: "GET", 
    expected_status: 403,
    description: "Member cannot access admin endpoints"
  },
  {
    name: "unauthenticated_rejection",
    user: null,
    endpoint: "/workflows",
    method: "GET",
    expected_status: 401,
    description: "Unauthenticated requests are rejected"
  },
  {
    name: "workflow_sharing_permissions",
    user: "owner",
    action: "share_workflow",
    target_user: "member",
    expected_status: 200,
    description: "Owner can share workflows with members"
  }
];
```

## Integration Testing Patterns

### Test Server Setup

Following n8n's integration test patterns:

```javascript
// Test server configuration based on n8n patterns
const testServer = setupTestServer({
  endpointGroups: ['workflows', 'executions', 'credentials'],
  enabledFeatures: ['feat:sharing', 'feat:multipleMainInstances'],
  database: {
    type: 'sqlite',
    database: './testing/test.db'
  },
  port: 5679,
  logLevel: 'debug'
});

// Authentication agent setup
const authOwnerAgent = testServer.authAgentFor(ownerUser);
const authMemberAgent = testServer.authAgentFor(memberUser);
```

### Mock Service Integration

Based on n8n's mock service patterns:

```json
{
  "mock_services": {
    "webhook_endpoint": {
      "url": "http://localhost:3001/webhook",
      "method": "POST",
      "response": {
        "status": 200,
        "body": { "success": true, "id": "mock-12345" }
      }
    },
    "api_service": {
      "url": "http://localhost:3002/api",
      "authentication": {
        "type": "bearer",
        "token": "mock-api-token"
      },
      "responses": {
        "success": { "status": 200, "body": { "data": [] } },
        "error": { "status": 500, "body": { "error": "Internal Server Error" } },
        "timeout": { "delay": 30000, "status": 408 }
      }
    }
  }
}
```

## Test Case Examples from n8n Production

### Workflow Test Run Management

```javascript
// Based on actual n8n test patterns
describe('Workflow Test Runs', () => {
  let workflowUnderTest;
  let testRunRepository;
  
  beforeEach(async () => {
    // Database cleanup following n8n patterns
    await testDb.truncate(['TestRun', 'TestCaseExecution', 'WorkflowEntity']);
    
    // Create test workflow
    workflowUnderTest = await createWorkflow({ 
      name: 'test-workflow',
      nodes: testWorkflowNodes,
      connections: testWorkflowConnections
    }, ownerUser);
  });
  
  test('should create and retrieve test run', async () => {
    // Create test run
    const testRun = await testRunRepository.createTestRun(workflowUnderTest.id);
    
    // Retrieve test run
    const response = await authOwnerAgent
      .get(`/workflows/${workflowUnderTest.id}/test-runs/${testRun.id}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        id: testRun.id,
        status: 'new',
        runAt: null,
        completedAt: null
      })
    );
  });
  
  test('should handle pagination for test runs', async () => {
    // Create multiple test runs
    const testRun1 = await testRunRepository.createTestRun(workflowUnderTest.id);
    await testRunRepository.markAsRunning(testRun1.id);
    const testRun2 = await testRunRepository.createTestRun(workflowUnderTest.id);
    
    // Test pagination
    const firstPage = await authOwnerAgent
      .get(`/workflows/${workflowUnderTest.id}/test-runs?take=1`);
    
    expect(firstPage.statusCode).toBe(200);
    expect(firstPage.body.data).toHaveLength(1);
    expect(firstPage.body.data[0].id).toBe(testRun2.id);
    
    const secondPage = await authOwnerAgent
      .get(`/workflows/${workflowUnderTest.id}/test-runs?take=1&skip=1`);
    
    expect(secondPage.body.data[0].id).toBe(testRun1.id);
  });
});
```

### Workflow Sharing and Permissions

```javascript
// Based on n8n's sharing test patterns
describe('Workflow Sharing', () => {
  test('should share workflow with member and allow access', async () => {
    const memberUser = await createUserWithRole('global:member');
    const memberPersonalProject = await getPersonalProject(memberUser.id);
    
    // Share workflow
    const sharingResponse = await authOwnerAgent
      .put(`/workflows/${workflowUnderTest.id}/share`)
      .send({ shareWithIds: [memberPersonalProject.id] });
    
    expect(sharingResponse.statusCode).toBe(200);
    
    // Verify member can access shared workflow
    const memberAgent = testServer.authAgentFor(memberUser);
    const accessResponse = await memberAgent
      .get(`/workflows/${workflowUnderTest.id}/test-runs`);
    
    expect(accessResponse.statusCode).toBe(200);
  });
  
  test('should deny access to non-shared workflows', async () => {
    const otherWorkflow = await createWorkflow({ name: 'private-workflow' });
    const memberAgent = testServer.authAgentFor(memberUser);
    
    const response = await memberAgent
      .get(`/workflows/${otherWorkflow.id}/test-runs`);
    
    expect(response.statusCode).toBe(404);
  });
});
```

## Performance Testing Patterns

### Load Testing Configuration

```json
{
  "performance_tests": {
    "small_dataset": {
      "records": 100,
      "concurrent_executions": 1,
      "expected_duration_ms": 5000,
      "memory_limit_mb": 50
    },
    "medium_dataset": {
      "records": 1000,
      "concurrent_executions": 3,
      "expected_duration_ms": 30000,
      "memory_limit_mb": 100
    },
    "large_dataset": {
      "records": 10000,
      "concurrent_executions": 5,
      "expected_duration_ms": 300000,
      "memory_limit_mb": 200
    },
    "stress_test": {
      "records": 50000,
      "concurrent_executions": 10,
      "expected_duration_ms": 600000,
      "memory_limit_mb": 500,
      "failure_threshold": 0.05
    }
  }
}
```

### Performance Validation Script

```javascript
// Performance testing based on n8n patterns
const performanceTest = async (testConfig) => {
  const startTime = Date.now();
  const initialMemory = process.memoryUsage().heapUsed;
  
  const results = {
    test_name: testConfig.name,
    records_processed: 0,
    execution_time_ms: 0,
    memory_usage_mb: 0,
    throughput_per_second: 0,
    errors: []
  };
  
  try {
    // Execute workflow with test data
    for (let i = 0; i < testConfig.concurrent_executions; i++) {
      const execution = await executeWorkflowWithData(
        workflowUnderTest.id,
        generateTestData(testConfig.records / testConfig.concurrent_executions)
      );
      
      results.records_processed += execution.processedRecords;
    }
    
    results.execution_time_ms = Date.now() - startTime;
    results.memory_usage_mb = (process.memoryUsage().heapUsed - initialMemory) / 1024 / 1024;
    results.throughput_per_second = results.records_processed / (results.execution_time_ms / 1000);
    
    // Validate against thresholds
    if (results.execution_time_ms > testConfig.expected_duration_ms) {
      results.errors.push(`Execution time exceeded: ${results.execution_time_ms}ms > ${testConfig.expected_duration_ms}ms`);
    }
    
    if (results.memory_usage_mb > testConfig.memory_limit_mb) {
      results.errors.push(`Memory usage exceeded: ${results.memory_usage_mb}MB > ${testConfig.memory_limit_mb}MB`);
    }
    
  } catch (error) {
    results.errors.push(`Execution failed: ${error.message}`);
  }
  
  return results;
};
```

## Error Handling Test Patterns

### Error Scenario Testing

```javascript
// Error handling tests based on n8n patterns
const errorScenarios = [
  {
    name: "network_timeout",
    setup: async () => {
      // Mock slow/unresponsive external service
      mockService.setDelay(35000); // Exceeds 30s timeout
    },
    expectedBehavior: "timeout_handling_with_retry",
    validation: (result) => {
      expect(result.errors).toContain('timeout');
      expect(result.retryAttempts).toBeGreaterThan(0);
    }
  },
  {
    name: "invalid_credentials",
    setup: async () => {
      // Set invalid API credentials
      await updateWorkflowCredentials(workflowId, { apiKey: 'invalid-key' });
    },
    expectedBehavior: "authentication_error_handling",
    validation: (result) => {
      expect(result.status).toBe('error');
      expect(result.errorCode).toBe('AUTHENTICATION_FAILED');
    }
  },
  {
    name: "malformed_data",
    setup: async () => {
      // Inject malformed JSON data
      return { invalidJson: 'unclosed string', number: 'not-a-number' };
    },
    expectedBehavior: "data_validation_error",
    validation: (result) => {
      expect(result.errors).toContain('validation');
      expect(result.processedRecords).toBe(0);
    }
  }
];
```

### Circuit Breaker Testing

```javascript
// Circuit breaker pattern testing
describe('Circuit Breaker Error Handling', () => {
  test('should activate circuit breaker after consecutive failures', async () => {
    const failingEndpoint = 'http://localhost:3001/failing-service';
    
    // Configure mock to fail consistently
    mockService.setResponse(failingEndpoint, { status: 500, body: { error: 'Service Unavailable' } });
    
    let circuitBreakerActivated = false;
    
    // Execute multiple requests to trigger circuit breaker
    for (let i = 0; i < 5; i++) {
      const result = await executeWorkflowWithEndpoint(workflowId, failingEndpoint);
      if (result.circuitBreakerActive) {
        circuitBreakerActivated = true;
        break;
      }
    }
    
    expect(circuitBreakerActivated).toBe(true);
  });
});
```

## Test Data Management

### Test Data Factory Patterns

```javascript
// Test data generation based on n8n patterns
class TestDataFactory {
  static createValidWorkflowData(overrides = {}) {
    return {
      name: `test-workflow-${Date.now()}`,
      active: false,
      nodes: [
        {
          id: 'trigger',
          name: 'Manual Trigger',
          type: 'n8n-nodes-base.manualTrigger',
          position: [100, 100],
          parameters: {}
        },
        {
          id: 'process',
          name: 'Data Processing',
          type: 'n8n-nodes-base.set',
          position: [300, 100],
          parameters: {
            values: {
              string: [
                { name: 'processed', value: 'true' }
              ]
            }
          }
        }
      ],
      connections: {
        'Manual Trigger': {
          main: [
            [{ node: 'Data Processing', type: 'main', index: 0 }]
          ]
        }
      },
      ...overrides
    };
  }
  
  static createTestExecutionData(recordCount = 100) {
    return Array.from({ length: recordCount }, (_, index) => ({
      id: `record-${index + 1}`,
      timestamp: new Date().toISOString(),
      data: {
        field1: `value-${index + 1}`,
        field2: Math.random() * 100,
        field3: index % 2 === 0 ? true : false
      }
    }));
  }
  
  static createErrorTestData(errorType = 'validation') {
    const errorPatterns = {
      validation: { field1: null, field2: 'not-a-number', field3: 'invalid-boolean' },
      missing: { field1: 'value' }, // Missing required field2
      malformed: 'invalid-json-string',
      oversized: { field1: 'x'.repeat(10000000) } // 10MB string
    };
    
    return errorPatterns[errorType] || errorPatterns.validation;
  }
}
```

## Continuous Testing Integration

### CI/CD Pipeline Integration

```yaml
# GitHub Actions workflow for continuous testing
name: n8n Workflow Testing
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Setup test environment
        run: |
          mkdir -p testing/{logs,temp,fixtures}
          chmod +x .claude/commands/test-workflow.sh
      
      - name: Run comprehensive test suite
        run: |
          ./.claude/commands/test-workflow.sh
        env:
          TEST_ENV: ci
          CI: true
      
      - name: Upload test results
        uses: actions/upload-artifact@v2
        with:
          name: test-results
          path: testing/logs/
      
      - name: Report test coverage
        run: |
          echo "Test results summary:"
          cat testing/logs/test-report-*.json | jq '.summary'
```

### Test Result Monitoring

```javascript
// Test metrics collection for monitoring
const collectTestMetrics = (testResults) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'test',
    metrics: {
      total_tests: testResults.length,
      passed_tests: testResults.filter(t => t.status === 'passed').length,
      failed_tests: testResults.filter(t => t.status === 'failed').length,
      avg_duration_ms: testResults.reduce((sum, t) => sum + t.duration, 0) / testResults.length,
      max_memory_usage_mb: Math.max(...testResults.map(t => t.memoryUsage || 0)),
      error_rate: testResults.filter(t => t.status === 'failed').length / testResults.length
    }
  };
  
  // Send metrics to monitoring system
  sendMetricsToMonitoring(metrics);
  
  // Check for alerts
  if (metrics.metrics.error_rate > 0.1) { // 10% error rate threshold
    sendAlert(`High error rate detected: ${metrics.metrics.error_rate * 100}%`);
  }
  
  return metrics;
};
```

## Best Practices Summary

### Testing Standards from n8n Production

1. **Authentication-First**: Every test validates user permissions and access controls
2. **Database Isolation**: Complete test data isolation with truncation between tests
3. **Mock External Services**: All external dependencies are mocked with realistic responses
4. **Performance Validation**: Every test includes performance and resource usage checks
5. **Error Recovery Testing**: Comprehensive error scenarios with recovery validation
6. **Test Data Realism**: Test data mirrors production data patterns and volumes
7. **Continuous Monitoring**: Test results are monitored and alerting is configured

### Implementation Checklist

- [ ] Set up test database with n8n schema patterns
- [ ] Configure authentication testing with multiple user roles
- [ ] Implement integration tests with mock services
- [ ] Add performance testing with realistic data volumes
- [ ] Create comprehensive error handling tests
- [ ] Set up continuous testing with CI/CD integration
- [ ] Configure test result monitoring and alerting
- [ ] Document test scenarios and update regularly

This production-grade testing framework ensures your n8n workflows are thoroughly validated before deployment and maintain reliability in production environments.