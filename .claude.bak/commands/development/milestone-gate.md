# Milestone Gate - Automated Checkpoint Detection

Monitor for critical milestones in IFLA-Platform and trigger human verification.

## Auto-Checkpoint Milestones

<Task>
<Agent role="milestone-monitor">
Continuously monitor for these critical milestones and automatically call /checkpoint:

### Automatic Triggers
- **Database Connection**: Database connection established or schema modified
- **Authentication System**: Authentication or authorization system changes
- **API Endpoints**: API endpoints that modify data created
- **External Integrations**: Third-party service integrations configured
- **Production Deployment**: Production deployment configuration or release
- **Data Migration**: Database migrations or data transformations

### Detection Logic
When any milestone condition is met, automatically execute:
```
/checkpoint [milestone name]

🛑 MILESTONE ACHIEVED: [Milestone Name]

I've reached a critical milestone in IFLA-Platform and need verification before proceeding...
```

### Milestone Categories

#### 🔴 Critical Infrastructure
- Database connections and schema changes
- Authentication and authorization systems
- Security implementations
- Production deployment configurations

#### 🟡 Major Features
- Core business logic completion
- Integration with external services
- Complex algorithms or calculations
- User-facing feature completion

#### 🟢 Quality Gates
- Test coverage milestones
- Performance benchmarks achieved
- Security scans completed
- Documentation milestones

### Custom Milestone Detection
No custom milestones configured

When triggered, include specific verification instructions for each milestone type.
</Agent>
</Task>

Remember: Never proceed past a critical milestone without human verification!