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
7. **[Subsystems Architecture](./07-subsystems-architecture.md)** - Major platform subsystems and their interactions
8. **[Architecture Evolution](./08-architecture-evolution.md)** - How the architecture has evolved and future directions
9. **[Collaboration Architecture](./09-collaboration-architecture.md)** - GitHub-based collaboration model and workflows
10. **[Implementation Strategy](./10-implementation-strategy.md)** - Phased implementation approach and timeline
11. **[Design System and UI Patterns](./11-design-system-ui-patterns.md)** - UI/UX guidelines and component library
12. **[RBAC Authorization Model](./12-rbac-authorization-model.md)** - Comprehensive role-based access control specification
13. **[Permission Matrix Detailed](./13-permission-matrix-detailed.md)** - Detailed permission mappings for all platform activities
14. **[Clerk RBAC Architecture](./14-clerk-rbac-architecture.md)** - Primary authorization architecture using Clerk.com organizations
15. **[Clerk RBAC Implementation Plan](./15-clerk-rbac-implementation-plan.md)** - Implementation plan for Clerk-based authorization

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
- **For architects**: Focus on documents 1, 2, 5, 7, and 8
- **For operations**: Review documents 6, 10, and implementation strategy
- **For project managers**: See documents 4, 9, 10, and 11
- **For security & compliance**: Focus on documents 12 and 13 for RBAC
- **For administrators**: Review documents 12 and 13 for role management

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