# IFLA Review Groups Structure

## Overview
IFLA organizes its standards development through Review Groups (RGs), which are specialized committees responsible for managing related standards and element sets. This document provides the definitive mapping of review groups to their associated standards and sites.

## Review Groups and Element Sets

### 1. ICP (International Cataloguing Principles)
**Committee Focus**: Cataloguing principles and multilingual terminology
- **MulDiCat**: Multilingual Dictionary of Cataloguing Terms

### 2. BCM (Bibliographic Conceptual Models)
**Committee Focus**: Conceptual models for bibliographic information
- **LRM**: Library Reference Model
- **FRBR**: Functional Requirements for Bibliographic Records
- **FRAD**: Functional Requirements for Authority Data
- **FRBRer**: FRBR Entity-Relationship Model
- **FRBRoo**: FRBR Object-Oriented Model
- **FRSAD**: Functional Requirements for Subject Authority Data

### 3. ISBD (International Standard Bibliographic Description)
**Committee Focus**: Bibliographic description standards
- **ISBD**: International Standard Bibliographic Description (General)
- **ISBDM**: ISBD for Monographic Publications
- **ISBDW**: ISBD for Websites (planned)
- **ISBDE**: ISBD for Electronic Resources (planned)
- **ISBDI**: ISBD for Integrating Resources (planned)
- **ISBDAP**: ISBD for Archival Publications (planned)
- **ISBDAC**: ISBD for Audiovisual and Cartographic Materials (planned)
- **ISBDN**: ISBD for Non-Book Materials (planned)
- **ISBDP**: ISBD for Printed Materials (planned)
- **ISBDT**: ISBD for Theses and Dissertations (planned)

### 4. PUC (Permanent UNIMARC Committee)
**Committee Focus**: UNIMARC format development and maintenance
- **UNIMARC**: Universal MARC Format elements
  - Control fields (OXX)
  - Descriptive fields (1XX-8XX)

## Site-to-Review Group Mappings

### Implementation in Code
The authoritative mapping is maintained in `apps/admin-portal/src/app/lib/role-based-routing.ts`:

```typescript
const siteToRg: Record<string, string> = {
  // ICP (International Cataloguing Principles)
  muldicat: 'ICP',
  
  // BCM (Bibliographic Conceptual Models)
  lrm: 'BCM',
  frbr: 'BCM',
  frad: 'BCM',
  frbrer: 'BCM',
  frbroo: 'BCM',
  frsad: 'BCM',
  
  // ISBD (International Standard Bibliographic Description)
  isbd: 'ISBD',
  isbdm: 'ISBD',
  isbdw: 'ISBD',
  isbde: 'ISBD',
  isbdi: 'ISBD',
  isbdap: 'ISBD',
  isbdac: 'ISBD',
  isbdn: 'ISBD',
  isbdp: 'ISBD',
  isbdt: 'ISBD',
  
  // PUC (Permanent UNIMARC Committee)
  unimarc: 'PUC',
  
  // Testing
  newtest: 'ISBD'
};
```

## Authorization Model

### Three-Tier Permissions
1. **System Level**: Global administrators (`system-admin`, `ifla-admin`)
2. **Review Group Level**: RG administrators and roles (`{rg}-admin`, `{rg}-editor`, `{rg}-translator`)
3. **Site Level**: Site-specific roles (`{site}-admin`, `{site}-editor`, `{site}-translator`)

### Role Examples
- `ISBD-admin`: Administrator for all ISBD-related standards
- `isbdm-editor`: Editor for ISBDM site specifically
- `BCM-translator`: Translator for all BCM standards
- `lrm-admin`: Administrator for LRM site only

## Development Considerations

### Adding New Sites
When adding a new site to an existing review group:
1. Add the site key to the `siteToRg` mapping
2. Update Cerbos test fixtures if needed
3. Add any specific site configurations

### Adding New Review Groups
When creating a new review group:
1. Update the `siteToRg` mapping
2. Update Cerbos policies to include the new RG
3. Update test fixtures and examples
4. Update documentation

### Testing
- Use `newtest` site (mapped to ISBD) for testing RG-based permissions
- E2E tests validate cross-RG access controls
- Mock authentication supports all RG combinations

## Future Expansion

### Planned ISBD Sites
The ISBD review group has 7 additional sites planned:
- ISBDW, ISBDE, ISBDI, ISBDAP, ISBDAC, ISBDN, ISBDP, ISBDT

### UNIMARC Elements
PUC manages UNIMARC elements grouped by field ranges:
- Control fields (OXX)
- Descriptive fields (1XX-8XX)

## References
- [IFLA Standards Official Site](https://www.ifla.org/standards/)
- [RBAC Implementation Plan](./rbac-implementation-plan.md)
- [Admin Portal Authentication Architecture](./admin-portal-authentication-architecture.md)
- [Cerbos Policies](../cerbos/policies/)