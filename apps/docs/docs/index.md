---
title: IFLA Standards Documentation
sidebar_position: 0
slug: /
---

# IFLA Standards Documentation Hub

Welcome to the comprehensive documentation for the IFLA Standards Platform. This documentation portal provides technical guidance, architecture details, and development resources for working with the platform.

## 📚 Documentation Sections

### System Design Documentation
Comprehensive architecture and design documentation for the entire platform.
- [System Architecture Overview](/system-design)
- [Development Workflow](/system-design/development-workflow)
- [API Architecture](/system-design/api-architecture)
- [Testing Strategy](/system-design/testing-strategy)

### User Documentation
Guides and documentation for platform users and administrators.
- [Admin Portal Documentation](/docs/admin-portal)
- [API Documentation](/docs/admin-api-specification)
- [Authorization Model](/docs/admin-authorization-model)
- [Getting Started Guide](/intro/getting-started)
- [Tutorial Basics](/intro/tutorial-basics)
- [Advanced Topics](/intro/tutorial-extras)

### Developer Notes
Technical implementation details and development guidelines.
- [Development Best Practices](/developer-notes)
- [Implementation Plans](/developer-notes/vocabulary-management-implementation-plan-2025)
- [Architecture Decisions](/developer-notes/architectural-analysis-2025-07)

## 🚀 Quick Start

### For Developers

1. **Clone the repository**
   ```bash
   git clone https://github.com/iflastandards/platform.git
   cd platform
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development servers**
   ```bash
   pnpm nx start docs
   ```

### For Content Editors

1. Navigate to the appropriate documentation section
2. Use the edit button on any page to suggest changes
3. Changes are reviewed through the GitHub pull request process

## 🏗️ Architecture Overview

The IFLA Standards Platform is built as a monorepo using:

- **Nx** for monorepo management
- **Next.js** for the admin application
- **Docusaurus** for documentation sites
- **Supabase** for database and authentication
- **GitHub Actions** for CI/CD

## 📖 Key Resources

### Admin Portal
- [Admin Dashboard](http://localhost:3007/admin) (local development)
- [Production Admin](https://admin.iflastandards.info)

### Documentation Sites
- [Portal](http://localhost:3000) (this site)
- [ISBD](http://localhost:3001)
- [UNIMARC](http://localhost:3002)
- Additional Standards Sites (ports 3003-3008)

### Development Tools
- [Nx Console](https://nx.dev/core-features/integrate-with-editors)
- [Supabase Dashboard](https://app.supabase.com)
- [GitHub Repository](https://github.com/iflastandards/platform)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](/docs/contributing) for details on:
- Code style and standards
- Testing requirements
- Pull request process
- Documentation guidelines

## 📞 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/iflastandards/platform/issues)
- **Discussions**: [Ask questions and share ideas](https://github.com/iflastandards/platform/discussions)
- **Email**: support@iflastandards.info

## 🔍 Search Documentation

Use the search bar at the top of the page to quickly find what you're looking for across all documentation sections.

---

*This documentation is continuously updated. Last update: {new Date().toLocaleDateString()}*