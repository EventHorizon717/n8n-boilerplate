/**
 * Test Data Factory - Production-Grade Test Data Generation
 * Based on n8n's internal testing patterns for comprehensive workflow testing
 */

const crypto = require('crypto');

class TestDataFactory {
  /**
   * Create valid workflow data following n8n's schema patterns
   * Based on n8n WorkflowEntity structure
   */
  static createValidWorkflowData(overrides = {}) {
    const timestamp = Date.now();
    const workflowId = `test-workflow-${timestamp}`;
    
    return {
      id: overrides.id || workflowId,
      name: overrides.name || `Test Workflow ${timestamp}`,
      active: overrides.active !== undefined ? overrides.active : false,
      nodes: overrides.nodes || this.createDefaultNodes(),
      connections: overrides.connections || this.createDefaultConnections(),
      settings: {
        executionOrder: 'v1',
        saveManualExecutions: true,
        callerPolicy: 'workflowsFromSameOwner',
        ...overrides.settings
      },
      tags: overrides.tags || [],
      meta: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...overrides.meta
      },
      ...overrides
    };
  }

  /**
   * Create default workflow nodes following n8n patterns
   */
  static createDefaultNodes() {
    return [
      {
        id: 'manual-trigger',
        name: 'Manual Trigger',
        type: 'n8n-nodes-base.manualTrigger',
        typeVersion: 1,
        position: [240, 300],
        parameters: {}
      },
      {
        id: 'set-data',
        name: 'Set Data',
        type: 'n8n-nodes-base.set',
        typeVersion: 1,
        position: [460, 300],
        parameters: {
          values: {
            string: [
              {
                name: 'processed',
                value: 'true'
              },
              {
                name: 'timestamp',
                value: '={{ new Date().toISOString() }}'
              }
            ],
            number: [
              {
                name: 'execution_count',
                value: 1
              }
            ]
          }
        }
      },
      {
        id: 'http-request',
        name: 'HTTP Request',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 1,
        position: [680, 300],
        parameters: {
          url: 'https://httpbin.org/post',
          method: 'POST',
          jsonParameters: true,
          options: {
            timeout: 10000,
            retry: {
              enabled: true,
              maxTries: 3
            }
          },
          parametersJson: '={{ JSON.stringify($json) }}'
        }
      }
    ];
  }

  /**
   * Create default workflow connections
   */
  static createDefaultConnections() {
    return {
      'Manual Trigger': {
        main: [
          [
            {
              node: 'Set Data',
              type: 'main',
              index: 0
            }
          ]
        ]
      },
      'Set Data': {
        main: [
          [
            {
              node: 'HTTP Request',
              type: 'main',
              index: 0
            }
          ]
        ]
      }
    };
  }

  /**
   * Create test execution data with varying complexity
   * Mimics real-world data patterns from n8n executions
   */
  static createTestExecutionData(config = {}) {
    const {
      recordCount = 100,
      dataComplexity = 'simple',
      includeNested = false,
      includeArrays = false,
      includeDates = true,
      includeNulls = false
    } = config;

    return Array.from({ length: recordCount }, (_, index) => {
      const baseRecord = {
        id: `record-${String(index + 1).padStart(6, '0')}`,
        index: index + 1,
        timestamp: new Date(Date.now() - (recordCount - index) * 60000).toISOString(),
        uuid: crypto.randomUUID(),
        status: this.getRandomStatus(),
        priority: this.getRandomPriority()
      };

      // Add complexity based on configuration
      if (dataComplexity === 'simple') {
        return {
          ...baseRecord,
          name: `Test Record ${index + 1}`,
          value: Math.round(Math.random() * 1000),
          active: Math.random() > 0.3
        };
      }

      if (dataComplexity === 'medium') {
        const record = {
          ...baseRecord,
          user: {
            id: Math.floor(Math.random() * 1000),
            name: this.generateRandomName(),
            email: this.generateRandomEmail(),
            role: this.getRandomRole()
          },
          metrics: {
            score: Math.round(Math.random() * 100),
            rating: parseFloat((Math.random() * 5).toFixed(1)),
            count: Math.floor(Math.random() * 50)
          }
        };

        if (includeArrays) {
          record.tags = this.generateRandomTags(3, 8);
          record.categories = this.generateRandomCategories(1, 4);
        }

        if (includeNested) {
          record.metadata = {
            source: this.getRandomSource(),
            processing: {
              attempts: Math.floor(Math.random() * 5) + 1,
              duration_ms: Math.floor(Math.random() * 5000),
              memory_mb: Math.floor(Math.random() * 100)
            }
          };
        }

        return record;
      }

      if (dataComplexity === 'complex') {
        const record = {
          ...baseRecord,
          profile: {
            personal: {
              firstName: this.generateRandomName().split(' ')[0],
              lastName: this.generateRandomName().split(' ')[1] || 'Doe',
              dateOfBirth: includeDates ? this.generateRandomDate('1950-01-01', '2000-12-31') : null,
              preferences: {
                language: this.getRandomLanguage(),
                timezone: this.getRandomTimezone(),
                notifications: {
                  email: Math.random() > 0.3,
                  sms: Math.random() > 0.7,
                  push: Math.random() > 0.5
                }
              }
            },
            professional: {
              company: this.generateRandomCompany(),
              position: this.getRandomPosition(),
              department: this.getRandomDepartment(),
              startDate: includeDates ? this.generateRandomDate('2015-01-01', '2023-12-31') : null
            }
          },
          analytics: {
            sessions: Array.from({ length: Math.floor(Math.random() * 10) + 1 }, (_, i) => ({
              id: crypto.randomUUID(),
              startTime: new Date(Date.now() - Math.random() * 86400000).toISOString(),
              duration: Math.floor(Math.random() * 3600),
              pages: Math.floor(Math.random() * 20) + 1,
              events: Math.floor(Math.random() * 50)
            }))
          }
        };

        if (includeNulls) {
          // Randomly set some fields to null to test null handling
          if (Math.random() > 0.8) record.profile.personal.dateOfBirth = null;
          if (Math.random() > 0.9) record.profile.professional.startDate = null;
        }

        return record;
      }

      return baseRecord;
    });
  }

  /**
   * Create test data with specific error patterns
   * Based on common n8n workflow error scenarios
   */
  static createErrorTestData(errorType = 'validation', count = 10) {
    const errorPatterns = {
      validation: () => ({
        id: null,
        name: '',
        email: 'invalid-email',
        age: 'not-a-number',
        active: 'not-a-boolean',
        date: 'invalid-date-format',
        nested: {
          required_field: null
        }
      }),

      missing_fields: () => ({
        id: crypto.randomUUID(),
        // Missing required name field
        email: this.generateRandomEmail()
        // Missing other required fields
      }),

      type_mismatch: () => ({
        id: crypto.randomUUID(),
        name: 12345, // Should be string
        email: true, // Should be string
        age: 'thirty', // Should be number
        active: 'yes', // Should be boolean
        score: [1, 2, 3] // Should be number
      }),

      malformed_json: () => '{"invalid": json, "unclosed": string}',

      oversized: () => ({
        id: crypto.randomUUID(),
        name: 'Test Record',
        data: 'x'.repeat(10000000), // 10MB string
        array: Array.from({ length: 100000 }, (_, i) => `item-${i}`)
      }),

      circular_reference: () => {
        const obj = { id: crypto.randomUUID(), name: 'Test' };
        obj.self = obj; // Circular reference
        return obj;
      },

      unicode_issues: () => ({
        id: crypto.randomUUID(),
        name: 'Test 👨‍💻🚀',
        description: 'Unicode: àáâãäåæçèéêë 中文 العربية ελληνικά',
        special_chars: '!@#$%^&*()_+-=[]{}|;:,.<>?`~',
        emojis: '😀😁😂🤣😃😄😅😆😉😊😋😎😍😘🥰😗'
      }),

      sql_injection: () => ({
        id: "'; DROP TABLE users; --",
        name: "Robert'; DELETE FROM workflows WHERE id = 1; --",
        query: "SELECT * FROM users WHERE name = 'admin' AND password = '' OR '1'='1'"
      }),

      xss_payload: () => ({
        id: crypto.randomUUID(),
        name: '<script>alert("XSS")</script>',
        description: '<img src="x" onerror="alert(1)">',
        html_content: '<iframe src="javascript:alert(\'XSS\')"></iframe>'
      })
    };

    const generator = errorPatterns[errorType];
    if (!generator) {
      throw new Error(`Unknown error type: ${errorType}`);
    }

    return Array.from({ length: count }, generator);
  }

  /**
   * Create test users following n8n's user management patterns
   */
  static createTestUsers() {
    return {
      owner: {
        id: 'owner-user-id-' + crypto.randomUUID(),
        firstName: 'Test',
        lastName: 'Owner',
        email: 'owner@test.example.com',
        password: 'secure-test-password-123',
        role: 'global:owner',
        isOwner: true,
        isPending: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      admin: {
        id: 'admin-user-id-' + crypto.randomUUID(),
        firstName: 'Test',
        lastName: 'Admin',
        email: 'admin@test.example.com',
        password: 'secure-test-password-456',
        role: 'global:admin',
        isOwner: false,
        isPending: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      member: {
        id: 'member-user-id-' + crypto.randomUUID(),
        firstName: 'Test',
        lastName: 'Member',
        email: 'member@test.example.com',
        password: 'secure-test-password-789',
        role: 'global:member',
        isOwner: false,
        isPending: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      viewer: {
        id: 'viewer-user-id-' + crypto.randomUUID(),
        firstName: 'Test',
        lastName: 'Viewer',
        email: 'viewer@test.example.com',
        password: 'secure-test-password-000',
        role: 'global:viewer',
        isOwner: false,
        isPending: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Create mock API responses for testing external service integration
   */
  static createMockApiResponses() {
    return {
      success: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': '99',
          'X-Request-ID': crypto.randomUUID()
        },
        body: {
          success: true,
          data: this.createTestExecutionData({ recordCount: 5, dataComplexity: 'simple' }),
          meta: {
            total: 5,
            page: 1,
            per_page: 5,
            total_pages: 1
          },
          timestamp: new Date().toISOString()
        }
      },

      error_400: {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        body: {
          error: 'Bad Request',
          message: 'Invalid request parameters',
          code: 'INVALID_PARAMETERS',
          details: {
            field: 'email',
            message: 'Invalid email format'
          }
        }
      },

      error_401: {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
        body: {
          error: 'Unauthorized',
          message: 'Invalid or expired authentication token',
          code: 'AUTHENTICATION_FAILED'
        }
      },

      error_403: {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
        body: {
          error: 'Forbidden',
          message: 'Insufficient permissions to access this resource',
          code: 'ACCESS_DENIED'
        }
      },

      error_429: {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': '0',
          'Retry-After': '60'
        },
        body: {
          error: 'Rate Limited',
          message: 'Too many requests, please try again later',
          code: 'RATE_LIMIT_EXCEEDED',
          retry_after: 60
        }
      },

      error_500: {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
        body: {
          error: 'Internal Server Error',
          message: 'An unexpected error occurred',
          code: 'INTERNAL_ERROR',
          request_id: crypto.randomUUID()
        }
      },

      timeout: {
        delay: 35000, // 35 second delay to trigger timeout
        status: 408,
        body: {
          error: 'Request Timeout',
          message: 'Request took too long to complete',
          code: 'TIMEOUT'
        }
      }
    };
  }

  /**
   * Create performance test data sets
   */
  static createPerformanceTestData() {
    return {
      small: this.createTestExecutionData({ recordCount: 100, dataComplexity: 'simple' }),
      medium: this.createTestExecutionData({ recordCount: 1000, dataComplexity: 'medium', includeNested: true }),
      large: this.createTestExecutionData({ recordCount: 10000, dataComplexity: 'complex', includeNested: true, includeArrays: true }),
      xlarge: this.createTestExecutionData({ recordCount: 50000, dataComplexity: 'simple' })
    };
  }

  // Helper methods for data generation
  static getRandomStatus() {
    const statuses = ['active', 'inactive', 'pending', 'completed', 'failed'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  static getRandomPriority() {
    const priorities = ['low', 'medium', 'high', 'critical'];
    return priorities[Math.floor(Math.random() * priorities.length)];
  }

  static generateRandomName() {
    const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Chris', 'Emma', 'Alex', 'Maria'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${firstName} ${lastName}`;
  }

  static generateRandomEmail() {
    const domains = ['example.com', 'test.com', 'demo.org', 'sample.net'];
    const name = this.generateRandomName().toLowerCase().replace(' ', '.');
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${name}@${domain}`;
  }

  static getRandomRole() {
    const roles = ['admin', 'user', 'moderator', 'viewer', 'editor'];
    return roles[Math.floor(Math.random() * roles.length)];
  }

  static generateRandomTags(min = 1, max = 5) {
    const allTags = ['important', 'urgent', 'review', 'approved', 'draft', 'published', 'archived', 'featured'];
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = allTags.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  static generateRandomCategories(min = 1, max = 3) {
    const categories = ['Technology', 'Business', 'Marketing', 'Sales', 'Support', 'Development', 'Design', 'Operations'];
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = categories.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  static getRandomSource() {
    const sources = ['api', 'upload', 'import', 'manual', 'sync', 'webhook'];
    return sources[Math.floor(Math.random() * sources.length)];
  }

  static getRandomLanguage() {
    const languages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'];
    return languages[Math.floor(Math.random() * languages.length)];
  }

  static getRandomTimezone() {
    const timezones = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'];
    return timezones[Math.floor(Math.random() * timezones.length)];
  }

  static generateRandomCompany() {
    const companies = ['Tech Corp', 'Data Systems', 'Innovation Labs', 'Digital Solutions', 'Cloud Services'];
    return companies[Math.floor(Math.random() * companies.length)];
  }

  static getRandomPosition() {
    const positions = ['Developer', 'Manager', 'Analyst', 'Engineer', 'Specialist', 'Coordinator'];
    return positions[Math.floor(Math.random() * positions.length)];
  }

  static getRandomDepartment() {
    const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
    return departments[Math.floor(Math.random() * departments.length)];
  }

  static generateRandomDate(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
    return new Date(randomTime).toISOString().split('T')[0];
  }
}

module.exports = TestDataFactory;