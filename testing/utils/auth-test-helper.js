/**
 * Authentication Test Helper
 * Based on n8n's authentication and authorization testing patterns
 */

const crypto = require('crypto');

class AuthTestHelper {
  constructor() {
    this.testUsers = null;
    this.mockTokens = new Map();
    this.sessionStore = new Map();
  }

  /**
   * Initialize test users following n8n's user management patterns
   */
  initializeTestUsers() {
    if (this.testUsers) return this.testUsers;

    this.testUsers = {
      owner: {
        id: 'owner-' + crypto.randomUUID(),
        firstName: 'Test',
        lastName: 'Owner',
        email: 'owner@test.n8n.local',
        password: this.hashPassword('owner-test-password'),
        role: 'global:owner',
        isOwner: true,
        isPending: false,
        personalProject: {
          id: 'owner-project-' + crypto.randomUUID(),
          name: 'Owner Personal Project',
          type: 'personal'
        },
        permissions: [
          'workflow:create',
          'workflow:read',
          'workflow:update', 
          'workflow:delete',
          'workflow:execute',
          'workflow:share',
          'user:create',
          'user:read',
          'user:update',
          'user:delete',
          'credential:create',
          'credential:read',
          'credential:update',
          'credential:delete',
          'admin:access'
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },

      admin: {
        id: 'admin-' + crypto.randomUUID(),
        firstName: 'Test',
        lastName: 'Admin',
        email: 'admin@test.n8n.local',
        password: this.hashPassword('admin-test-password'),
        role: 'global:admin',
        isOwner: false,
        isPending: false,
        personalProject: {
          id: 'admin-project-' + crypto.randomUUID(),
          name: 'Admin Personal Project',
          type: 'personal'
        },
        permissions: [
          'workflow:create',
          'workflow:read',
          'workflow:update',
          'workflow:delete',
          'workflow:execute',
          'workflow:share',
          'user:read',
          'user:update',
          'credential:create',
          'credential:read',
          'credential:update',
          'credential:delete'
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },

      member: {
        id: 'member-' + crypto.randomUUID(),
        firstName: 'Test',
        lastName: 'Member',
        email: 'member@test.n8n.local',
        password: this.hashPassword('member-test-password'),
        role: 'global:member',
        isOwner: false,
        isPending: false,
        personalProject: {
          id: 'member-project-' + crypto.randomUUID(),
          name: 'Member Personal Project',
          type: 'personal'
        },
        permissions: [
          'workflow:create',
          'workflow:read',
          'workflow:update',
          'workflow:execute',
          'credential:create',
          'credential:read',
          'credential:update'
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },

      viewer: {
        id: 'viewer-' + crypto.randomUUID(),
        firstName: 'Test',
        lastName: 'Viewer',
        email: 'viewer@test.n8n.local',
        password: this.hashPassword('viewer-test-password'),
        role: 'global:viewer',
        isOwner: false,
        isPending: false,
        personalProject: {
          id: 'viewer-project-' + crypto.randomUUID(),
          name: 'Viewer Personal Project',
          type: 'personal'
        },
        permissions: [
          'workflow:read',
          'credential:read'
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },

      guest: {
        id: 'guest-' + crypto.randomUUID(),
        firstName: 'Test',
        lastName: 'Guest',
        email: 'guest@test.n8n.local',
        password: this.hashPassword('guest-test-password'),
        role: 'global:guest',
        isOwner: false,
        isPending: true,
        personalProject: null,
        permissions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    return this.testUsers;
  }

  /**
   * Generate authentication token for test user
   */
  generateAuthToken(userId, expiresIn = '24h') {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    
    if (expiresIn === '24h') {
      expiresAt.setHours(expiresAt.getHours() + 24);
    } else if (expiresIn === '1h') {
      expiresAt.setHours(expiresAt.getHours() + 1);
    } else if (expiresIn === '15m') {
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);
    }

    const tokenData = {
      token,
      userId,
      expiresAt,
      createdAt: new Date(),
      isValid: true
    };

    this.mockTokens.set(token, tokenData);
    return token;
  }

  /**
   * Create authenticated agent for testing (similar to n8n's authAgentFor)
   */
  createAuthAgent(userRole, testServer = null) {
    const users = this.initializeTestUsers();
    const user = users[userRole];
    
    if (!user) {
      throw new Error(`Unknown user role: ${userRole}`);
    }

    const token = this.generateAuthToken(user.id);
    
    return {
      user,
      token,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      
      // Mock HTTP methods following n8n test patterns
      get: (path, options = {}) => this.mockRequest('GET', path, null, user, options),
      post: (path, data = null, options = {}) => this.mockRequest('POST', path, data, user, options),
      put: (path, data = null, options = {}) => this.mockRequest('PUT', path, data, user, options),
      patch: (path, data = null, options = {}) => this.mockRequest('PATCH', path, data, user, options),
      delete: (path, options = {}) => this.mockRequest('DELETE', path, null, user, options),
      
      // Helper methods
      send: (data) => ({ data, headers: headers }),
      expect: (statusCode) => ({ statusCode })
    };
  }

  /**
   * Mock HTTP request with permission validation
   */
  mockRequest(method, path, data, user, options = {}) {
    // Parse path to extract resource and action
    const pathParts = path.split('/').filter(p => p);
    const resource = pathParts[0];
    const resourceId = pathParts[1];
    const action = pathParts[2];

    // Determine required permission
    const requiredPermission = this.determineRequiredPermission(method, resource, action);
    
    // Check user permissions
    const hasPermission = this.checkPermission(user, requiredPermission, resourceId);
    
    // Generate mock response
    const response = {
      statusCode: hasPermission ? 200 : (user ? 403 : 401),
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID()
      },
      body: hasPermission ? this.generateSuccessResponse(method, resource, data) : this.generateErrorResponse(user ? 403 : 401)
    };

    // Log request for testing purposes
    this.logRequest(method, path, user?.role || 'anonymous', response.statusCode);

    return response;
  }

  /**
   * Determine required permission based on HTTP method and resource
   */
  determineRequiredPermission(method, resource, action) {
    const permissionMap = {
      'GET': {
        'workflows': 'workflow:read',
        'credentials': 'credential:read',
        'users': 'user:read',
        'executions': 'workflow:read'
      },
      'POST': {
        'workflows': 'workflow:create',
        'credentials': 'credential:create',
        'users': 'user:create',
        'executions': 'workflow:execute'
      },
      'PUT': {
        'workflows': 'workflow:update',
        'credentials': 'credential:update',
        'users': 'user:update'
      },
      'PATCH': {
        'workflows': 'workflow:update',
        'credentials': 'credential:update',
        'users': 'user:update'
      },
      'DELETE': {
        'workflows': 'workflow:delete',
        'credentials': 'credential:delete',
        'users': 'user:delete'
      }
    };

    // Special cases for specific actions
    if (action === 'share') return 'workflow:share';
    if (action === 'execute') return 'workflow:execute';
    if (resource === 'admin') return 'admin:access';

    return permissionMap[method]?.[resource] || 'unknown:permission';
  }

  /**
   * Check if user has required permission
   */
  checkPermission(user, requiredPermission, resourceId = null) {
    if (!user) return false;
    
    // Owner has all permissions
    if (user.isOwner) return true;
    
    // Check if user has the required permission
    if (!user.permissions.includes(requiredPermission)) return false;

    // Additional checks for resource-specific permissions
    if (resourceId && !this.checkResourceAccess(user, resourceId)) {
      return false;
    }

    return true;
  }

  /**
   * Check if user has access to specific resource
   */
  checkResourceAccess(user, resourceId) {
    // For testing, assume users can only access their own resources
    // unless they have admin privileges
    return user.isOwner || user.role.includes('admin') || resourceId.includes(user.id);
  }

  /**
   * Generate success response based on request
   */
  generateSuccessResponse(method, resource, data) {
    const baseResponse = {
      success: true,
      timestamp: new Date().toISOString()
    };

    switch (method) {
      case 'GET':
        return {
          ...baseResponse,
          data: this.generateResourceData(resource)
        };
      
      case 'POST':
        return {
          ...baseResponse,
          data: {
            id: crypto.randomUUID(),
            ...data,
            createdAt: new Date().toISOString()
          }
        };
      
      case 'PUT':
      case 'PATCH':
        return {
          ...baseResponse,
          data: {
            id: crypto.randomUUID(),
            ...data,
            updatedAt: new Date().toISOString()
          }
        };
      
      case 'DELETE':
        return {
          ...baseResponse,
          message: `${resource} deleted successfully`
        };
      
      default:
        return baseResponse;
    }
  }

  /**
   * Generate error response
   */
  generateErrorResponse(statusCode) {
    const errorMessages = {
      401: {
        error: 'Unauthorized',
        message: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      },
      403: {
        error: 'Forbidden', 
        message: 'Insufficient permissions',
        code: 'ACCESS_DENIED'
      },
      404: {
        error: 'Not Found',
        message: 'Resource not found',
        code: 'RESOURCE_NOT_FOUND'
      }
    };

    return {
      success: false,
      timestamp: new Date().toISOString(),
      ...errorMessages[statusCode]
    };
  }

  /**
   * Generate mock resource data
   */
  generateResourceData(resource) {
    switch (resource) {
      case 'workflows':
        return [{
          id: crypto.randomUUID(),
          name: 'Test Workflow',
          active: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }];
      
      case 'users':
        return Object.values(this.testUsers || {}).map(user => ({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }));
      
      default:
        return [];
    }
  }

  /**
   * Create test scenarios for authentication testing
   */
  createAuthTestScenarios() {
    return [
      {
        name: 'owner_full_access',
        user: 'owner',
        endpoint: '/workflows',
        method: 'GET',
        expectedStatus: 200,
        description: 'Owner can access all workflows'
      },
      {
        name: 'owner_create_workflow',
        user: 'owner', 
        endpoint: '/workflows',
        method: 'POST',
        data: { name: 'New Workflow', active: false },
        expectedStatus: 200,
        description: 'Owner can create workflows'
      },
      {
        name: 'member_read_workflows',
        user: 'member',
        endpoint: '/workflows',
        method: 'GET',
        expectedStatus: 200,
        description: 'Member can read workflows'
      },
      {
        name: 'member_restricted_admin',
        user: 'member',
        endpoint: '/admin/users',
        method: 'GET',
        expectedStatus: 403,
        description: 'Member cannot access admin endpoints'
      },
      {
        name: 'viewer_read_only',
        user: 'viewer',
        endpoint: '/workflows',
        method: 'POST',
        data: { name: 'Test' },
        expectedStatus: 403,
        description: 'Viewer cannot create workflows'
      },
      {
        name: 'unauthenticated_access',
        user: null,
        endpoint: '/workflows',
        method: 'GET',
        expectedStatus: 401,
        description: 'Unauthenticated requests are rejected'
      },
      {
        name: 'workflow_sharing_owner',
        user: 'owner',
        endpoint: '/workflows/test-id/share',
        method: 'PUT',
        data: { shareWithIds: ['project-123'] },
        expectedStatus: 200,
        description: 'Owner can share workflows'
      },
      {
        name: 'workflow_sharing_member',
        user: 'member',
        endpoint: '/workflows/test-id/share',
        method: 'PUT',
        data: { shareWithIds: ['project-123'] },
        expectedStatus: 403,
        description: 'Member cannot share workflows'
      }
    ];
  }

  /**
   * Execute authentication test scenario
   */
  async executeAuthTest(scenario) {
    const agent = scenario.user ? this.createAuthAgent(scenario.user) : null;
    
    let response;
    if (agent) {
      response = agent[scenario.method.toLowerCase()](scenario.endpoint, scenario.data);
    } else {
      // Simulate unauthenticated request
      response = {
        statusCode: 401,
        body: this.generateErrorResponse(401)
      };
    }

    const result = {
      scenario: scenario.name,
      description: scenario.description,
      expected: scenario.expectedStatus,
      actual: response.statusCode,
      passed: response.statusCode === scenario.expectedStatus,
      response: response.body,
      timestamp: new Date().toISOString()
    };

    this.logTestResult(result);
    return result;
  }

  /**
   * Run all authentication test scenarios
   */
  async runAllAuthTests() {
    const scenarios = this.createAuthTestScenarios();
    const results = [];

    for (const scenario of scenarios) {
      try {
        const result = await this.executeAuthTest(scenario);
        results.push(result);
      } catch (error) {
        results.push({
          scenario: scenario.name,
          description: scenario.description,
          expected: scenario.expectedStatus,
          actual: 'ERROR',
          passed: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    const summary = {
      total: results.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
      success_rate: results.filter(r => r.passed).length / results.length * 100
    };

    return { summary, results };
  }

  // Utility methods
  hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  validateToken(token) {
    const tokenData = this.mockTokens.get(token);
    if (!tokenData) return null;
    
    if (!tokenData.isValid || new Date() > tokenData.expiresAt) {
      return null;
    }
    
    return tokenData;
  }

  logRequest(method, path, userRole, statusCode) {
    console.log(`[AUTH TEST] ${method} ${path} - User: ${userRole} - Status: ${statusCode}`);
  }

  logTestResult(result) {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.scenario} - Expected: ${result.expected}, Actual: ${result.actual}`);
  }

  // Cleanup methods
  clearTokens() {
    this.mockTokens.clear();
  }

  reset() {
    this.testUsers = null;
    this.mockTokens.clear();
    this.sessionStore.clear();
  }
}

module.exports = AuthTestHelper;