# IFLA Standards Platform - System Design Documentation

**Version:** 2.0  
**Date:** January 2025  
**Status:** Current Architecture

## Overview

This directory contains the comprehensive system design documentation for the IFLA Standards Platform. These documents consolidate and update all previous design specifications, incorporating the latest architectural decisions and implementation patterns.

## Document Structure

1. **[System Architecture Overview](./01-system-architecture-overview.md)** - High-level architecture, technology stack, and design principles
2. **[Data Architecture](./02-data-architecture.md)** - Data storage strategy, models, and flow patterns
3. **[Configuration Architecture](./03-configuration-architecture.md)** - Site configuration, environment management, and routing
4. **[Development Workflow](./04-development-workflow.md)** - Standards development lifecycle, roles, and processes
5. **[API Architecture](./05-api-architecture.md)** - API design, authentication, and integration patterns
6. **[Testing Strategy](./06-testing-strategy.md)** - Five-phase testing approach and quality gates
7. **[Deployment Architecture](./07-deployment-architecture.md)** - CI/CD, environments, and deployment strategies
8. **[Security Architecture](./08-security-architecture.md)** - Authentication, authorization, and security patterns
9. **[Frontend Architecture](./09-frontend-architecture.md)** - UI components, admin portal, and Docusaurus sites
10. **[Integration Patterns](./10-integration-patterns.md)** - External services, MCP servers, and third-party integrations
11. **[Discussion Points](./11-discussion-points.md)** - Areas requiring clarification or team decisions

## Quick Reference

### Technology Stack
- **Monorepo**: Nx 21.2.2 with pnpm workspace
- **Frontend**: React 19.1.0, TypeScript 5.7
- **Documentation**: Docusaurus 3.8+
- **Admin Portal**: Next.js 15.2.5 with App Router
- **Backend**: Vercel Edge Functions
- **Authentication**: Clerk + NextAuth.js 5.0
- **Authorization**: Cerbos policy engine
- **Database**: Supabase (operational data)
- **Version Control**: Git/GitHub (source of truth)
- **Testing**: Vitest + Playwright
- **CI/CD**: GitHub Actions + Nx Cloud

### Key Architectural Decisions
- Git as single source of truth for all vocabulary data
- Distributed storage across multiple systems
- Five-phase progressive testing strategy
- Centralized TypeScript configuration matrix
- Role-based workflow governance
- Environment-aware basePath handling

### Recent Updates (December 2024 - January 2025)
- Migration from 36+ environment files to centralized configuration
- Introduction of OMR25 vocabulary management system
- Enhanced testing strategy with Nx optimizations
- Simplified environment structure (local/preview/production)
- Admin portal basePath architecture implementation

## Navigation Guide

- **For new developers**: Start with documents 1, 3, and 6
- **For architects**: Focus on documents 1, 2, 5, and 8
- **For operations**: Review documents 6, 7, and 10
- **For project managers**: See documents 4, 11

## Document Status

These documents represent the current state of the IFLA Standards Platform as of January 2025. They supersede all previous design documents, incorporating:
- Lessons learned from initial implementation
- Performance optimizations
- Simplified configuration approach
- Enhanced testing and quality gates
- Improved developer experience

## Related Resources

- `/developer_notes/` - Implementation notes and guides
- `/docs/` - API and workflow documentation
- `/.kiro/` - Recent specifications and steering documents
- `/CLAUDE.md` - AI assistant context and guidelines