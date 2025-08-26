# Product Mission

## Pitch

IFLA Standards Platform is a comprehensive library standards documentation and management system that helps library professionals, standards editors, vocabulary managers, and content authors collaborate on international library standards by providing multi-site documentation, administrative workflows, and RDF-based vocabulary management.

## Users

### Primary Customers

- **Library Professionals**: Academic and public librarians who implement and reference IFLA standards
- **Standards Editors**: IFLA working groups and subject experts who develop and maintain standards  
- **Vocabulary Managers**: Technical staff who manage RDF vocabularies and translations
- **Content Authors**: Contributors who write and maintain standards documentation

### User Personas

**Standards Editor** (35-55 years old)
- **Role:** IFLA Working Group Chair or Subject Expert
- **Context:** Academic or national library environment, standards development committees
- **Pain Points:** Complex vocabulary management workflows, translation coordination, version control challenges
- **Goals:** Streamline standards publication, enable collaborative editing, maintain quality control

**Library Professional** (25-65 years old)  
- **Role:** Cataloger, Systems Librarian, or Technical Services Manager
- **Context:** Implementation of IFLA standards in day-to-day library operations
- **Pain Points:** Finding current standards information, understanding implementation guidance, accessing multilingual content
- **Goals:** Quick access to authoritative standards documentation, implementation examples, community discussions

**Vocabulary Manager** (30-50 years old)
- **Role:** Technical specialist managing RDF vocabularies and metadata
- **Context:** National libraries, standards organizations, technical working groups
- **Pain Points:** Manual CSV/RDF conversion processes, configuration management, deployment coordination
- **Goals:** Automated vocabulary workflows, integrated testing, streamlined publication pipelines

## The Problem

### Fragmented Standards Management

Library standards are complex, multilingual, and constantly evolving. Current solutions are fragmented across different platforms, making it difficult to maintain consistency and enable effective collaboration. This results in outdated documentation, inconsistent implementations, and barriers to international cooperation.

**Our Solution:** Unified platform with Git-based version control and collaborative editing workflows.

### Technical Workflow Gaps

While powerful command-line tools exist for CSV and RDF generation, they lack user-friendly interfaces and proper documentation. Administrative dashboards contain mock data without functional backends. This creates a disconnect between technical capabilities and user accessibility.

**Our Solution:** Complete admin feature factory implementation bridging command-line tools with intuitive user interfaces.

### Configuration Complexity

The current system has scattered and incoherent configuration files across multiple sites and applications. This makes maintenance difficult and creates inconsistencies in behavior across different parts of the platform.

**Our Solution:** Consolidated configuration architecture with shared patterns and automated validation.

## Differentiators

### Git-Centric Standards Management

Unlike traditional content management systems, we use Git as the primary source of truth for all vocabulary data and documentation. This enables version control, collaborative workflows, and automated publication pipelines that are familiar to technical users.

### Multi-Site Architecture with Shared Components

Unlike monolithic documentation platforms, we provide dedicated sites for each standard (FRBR, LRM, ISBD, ISBDM, MULDICAT, UNIMARC) while maintaining consistency through shared theme packages and component libraries. This results in specialized user experiences while reducing maintenance overhead.

### Sophisticated Development Workflow

Unlike basic documentation platforms, we implement a 6-phase admin feature factory with comprehensive testing strategies, including unit tests, integration tests, E2E tests with tag-based execution, and mock service workers for deterministic testing environments.

## Key Features

### Core Features (Implemented)

- **Multi-Site Documentation**: Individual Docusaurus sites for each IFLA standard with shared theme
- **Monorepo Architecture**: Nx-powered workspace with affected builds and distributed caching
- **Authentication System**: Clerk-based auth with GitHub OAuth and RBAC foundations
- **CSV/RDF Processing**: Command-line tools for vocabulary import/export and generation
- **5-Phase Testing**: Comprehensive testing strategy from development to production
- **Git-Based Workflows**: All content versioned with collaborative editing support
- **CI/CD Pipeline**: Automated deployment to GitHub Pages with preview environments

### Admin Features (In Development)

- **Administrative Portal**: Next.js-based interface for vocabulary and user management
- **API Contracts**: RESTful APIs with OpenAPI documentation and type safety
- **Vocabulary CRUD**: Create, read, update, delete operations for all vocabulary types
- **Translation Management**: Multilingual content editing with workflow support
- **User Interface Implementation**: Replace mock data with functional admin dashboards
- **Configuration Management**: Unified configuration architecture across all applications

### Future Enhancements

- **Automated Publishing**: Direct admin-to-documentation site publishing workflows  
- **Advanced Search**: Enhanced search capabilities across all standards sites
- **Community Features**: Discussion forums and feedback mechanisms integrated with documentation
- **Analytics Integration**: Usage tracking and content analytics for continuous improvement