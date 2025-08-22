# n8n Workflow Scoping Questionnaire

## How to Use This Interactive Questionnaire

### **Response Rules**
Before answering any questions, understand these interactive options:

**📋 "please assist"** - Use this response when:
- You don't have the technical knowledge to answer the question
- You need help understanding what the question is asking
- You want Claude Code to guide you through the decision-making process
- You need recommendations based on best practices

*When you write "please assist", Claude Code will start a conversation with you to help determine the best answer for your specific situation.*

**🚫 "na" (not applicable)** - Use this response when:
- The question doesn't apply to your workflow
- Your use case doesn't require this functionality
- You want to skip a particular section entirely

*When you write "na", Claude Code will skip that section and won't implement related features.*

**💡 Regular Answers** - Provide specific details when:
- You know exactly what you need
- You have technical specifications ready
- You've used similar systems before

### **Example Responses**
```
Q: What database will you be using?
A: "please assist" → Claude Code will discuss database options with you
A: "PostgreSQL" → Claude Code will configure for PostgreSQL
A: "na" → Claude Code will skip database-related configurations

Q: What's your expected data volume?
A: "please assist" → Claude Code will help you estimate based on your use case
A: "10,000 records per hour" → Claude Code will optimize for this throughput
A: "na" → Claude Code will use default settings
```

### **Question Categories**
- 🏢 **Business Context**: Understanding the problem and requirements
- 🔧 **Data Engineering**: Technical data requirements and architecture
- ⚡ **Performance**: Scalability and performance needs
- 🔐 **Security**: Authentication, encryption, and compliance
- 📊 **Success Metrics**: How to measure and validate success

---

## 💭 Workflow Vision & Use Cases

### **Describe Your Workflow Vision**
*In your own words, describe how you envision this workflow functioning. Don't worry about technical details - just explain what you want to happen.*

**Example**: "I want to automatically sync customer data from our CRM to our email marketing platform every night, but only for customers who opted in to marketing emails and haven't purchased in the last 30 days. If there are any sync errors, I want my team to get notified immediately."

**Your Vision**: 
```
[Describe your workflow vision here - be as detailed or high-level as you prefer]
```

### **Provide Real-World Use Case Examples**
*Give 2-3 specific examples of how this workflow would be used in practice. Include the input data, what processing should happen, and what the expected output should be.*

**Example Scenario 1**:
```
Input: New customer registration with email "john@example.com", opted_in: true, signup_date: "2024-01-15"
Processing: Check if customer exists, validate email format, check opt-in status
Output: Add to email marketing list with welcome series tag
```

**Your Use Case 1**:
```
Input: [What triggers this workflow and what data comes in?]
Processing: [What should happen to that data?]
Output: [What should be the end result?]
```

**Your Use Case 2**:
```
Input: [What triggers this workflow and what data comes in?]
Processing: [What should happen to that data?]
Output: [What should be the end result?]
```

**Your Use Case 3** (optional):
```
Input: [What triggers this workflow and what data comes in?]
Processing: [What should happen to that data?]
Output: [What should be the end result?]
```

### **Edge Cases and Error Scenarios**
*What could go wrong? Describe scenarios where the workflow might fail or behave unexpectedly.*

**Example**: "What if the CRM API is down? What if a customer email is invalid? What if someone tries to sync the same data twice?"

**Your Edge Cases**:
```
[Describe potential problems, error conditions, or unusual scenarios]
```

### **Success Stories**
*How will you know this workflow is working well? What would a perfect execution look like?*

**Your Success Vision**:
```
[Describe what success looks like from a business and operational perspective]
```

---

## 🏢 Business Context Discovery

### Core Problem Definition
**What specific problem are you trying to solve with this workflow?**
*Be as detailed as possible about the business challenge or opportunity*

Answer: ________________________________

**Who are the primary stakeholders and end users?**
*Include internal teams, external customers, or systems that depend on this workflow*

Answer: ________________________________

**What's the business impact if this workflow fails or performs poorly?**
*Consider financial, operational, or customer impact*

Answer: ________________________________

### Compliance and Governance
**Are there any regulatory or compliance requirements? (GDPR, HIPAA, SOX, etc.)**
*Include data privacy, financial regulations, or industry-specific requirements*

Answer: ________________________________

**What data governance policies must be followed?**
*Data classification, access controls, retention policies, audit requirements*

Answer: ________________________________

**Are there any business rules or policies that must be enforced in the data processing?**
*Domain-specific validation rules, approval workflows, business constraints*

Answer: ________________________________

---

## 🔧 Data Engineering Assessment

### Data Sources
**What are your primary data sources?**
*List all APIs, databases, files, webhooks, or other data inputs*

Answer: ________________________________

**What data formats will you be working with?**
*JSON, CSV, XML, Parquet, database tables, API responses, etc.*

Answer: ________________________________

**How fresh does your data need to be?**
*Real-time, near real-time (minutes), batch (hourly/daily), or historical*

Answer: ________________________________

**What's your expected data volume and growth?**
*Current volume, projected growth, peak loads, seasonal patterns*

Answer: ________________________________

### Data Quality and Validation
**What data quality issues do you expect?**
*Missing fields, format inconsistencies, duplicate records, stale data, etc.*

Answer: ________________________________

**What validation rules need to be enforced?**
*Required fields, format validation, business rule checks, referential integrity*

Answer: ________________________________

**How should data quality failures be handled?**
*Stop processing, quarantine bad records, alert operators, attempt correction*

Answer: ________________________________

### Data Transformation Requirements
**What data transformations are needed?**
*Cleaning, enrichment, aggregation, format conversion, business calculations*

Answer: ________________________________

**Are there any complex business calculations or logic?**
*Pricing rules, eligibility calculations, scoring algorithms, etc.*

Answer: ________________________________

---

## ⚡ Performance and Technical Requirements

### Processing Requirements
**What's your required processing frequency?**
*Continuous, every few minutes, hourly, daily, weekly, or event-driven*

Answer: ________________________________

**What are your performance requirements?**
*Maximum processing time, throughput needs, latency requirements*

Answer: ________________________________

**Do you need the workflow to handle concurrent executions?**
*Multiple instances running simultaneously, parallel processing needs*

Answer: ________________________________

### Scalability and Resources
**What are your scalability requirements?**
*Expected growth, peak capacity needs, resource limitations*

Answer: ________________________________

**Are there any resource constraints?**
*Memory limits, CPU constraints, network bandwidth, storage limits*

Answer: ________________________________

---

## 🔐 Security and Integration Requirements

### Authentication and Access
**What authentication methods will be required?**
*API keys, OAuth, database credentials, certificate-based auth*

Answer: ________________________________

**What systems need to be integrated?**
*External APIs, databases, file systems, message queues, webhooks*

Answer: ________________________________

**Are there any security requirements for data in transit and at rest?**
*Encryption requirements, network security, data masking needs*

Answer: ________________________________

### External Dependencies
**What external services or APIs will be called?**
*Third-party services, internal APIs, rate limits, availability requirements*

Answer: ________________________________

**What happens if external dependencies are unavailable?**
*Retry logic, fallback options, graceful degradation strategies*

Answer: ________________________________

---

## 📊 Success Criteria and Validation

### Success Metrics
**How will you measure if the workflow is successful?**
*Business KPIs, data quality metrics, performance benchmarks*

Answer: ________________________________

**What constitutes a failed workflow execution?**
*Error thresholds, data quality failures, performance degradation*

Answer: ________________________________

### Testing and Validation
**What test scenarios need to be validated?**
*Happy path, error conditions, edge cases, performance tests*

Answer: ________________________________

**How will you validate data accuracy and completeness?**
*Reconciliation processes, spot checks, automated validation*

Answer: ________________________________

### Monitoring and Alerting
**Who needs to be notified when issues occur?**
*Operations team, business users, external stakeholders*

Answer: ________________________________

**What monitoring and alerting is required?**
*Real-time dashboards, email alerts, Slack notifications, log aggregation*

Answer: ________________________________

---

## 🎯 Output and Delivery Requirements

### Data Destinations
**Where does the processed data need to be delivered?**
*Databases, APIs, file systems, data warehouses, message queues*

Answer: ________________________________

**What output formats are required?**
*JSON, CSV, XML, database inserts, API calls, file uploads*

Answer: ________________________________

**Are there any delivery guarantees required?**
*At-least-once, exactly-once, eventual consistency, immediate consistency*

Answer: ________________________________

### Downstream Dependencies
**What systems or processes depend on this workflow's output?**
*Reporting systems, other workflows, real-time applications, batch processes*

Answer: ________________________________

**What happens if output delivery fails?**
*Retry strategies, manual intervention, alternative delivery methods*

Answer: ________________________________

---

## 📝 Final Review

### Implementation Priority
**What's the priority order for implementing different features?**
*MVP requirements, nice-to-have features, future enhancements*

Answer: ________________________________

**Are there any existing workflows or systems this needs to integrate with?**
*Legacy systems, current n8n workflows, other automation tools*

Answer: ________________________________

**What's your timeline and any critical deadlines?**
*Go-live dates, testing periods, rollout phases*

Answer: ________________________________

---

## ✅ Questionnaire Completion

Once you've completed this questionnaire, Claude Code will use your responses to:

1. **Design the data architecture** based on your sources, volumes, and quality requirements
2. **Plan the workflow structure** optimized for your performance and scalability needs  
3. **Configure security and compliance** according to your governance requirements
4. **Set up monitoring and alerting** tailored to your operational needs
5. **Create comprehensive test scenarios** based on your validation requirements
6. **Generate the ASCII workflow diagram** showing your specific data flow

**Next Steps**: Save this completed questionnaire and reference it throughout the development process. Claude Code will validate the final workflow against these requirements to ensure all needs are met.