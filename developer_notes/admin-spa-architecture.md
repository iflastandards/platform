# Admin Architecture Decision: Next.js Application (January 2025)

## Status: DEPRECATED - Next.js Approach Chosen

**Date:** January 2025  
**Decision:** Use Next.js admin application instead of Docusaurus SPA  
**Reason:** Existing Next.js app has substantial functionality and provides better separation of concerns  

## Current Architecture

Instead of implementing an admin SPA within Docusaurus, we chose to continue with the **Next.js admin application** located at `/apps/admin`.

### Key Advantages of Next.js Approach

1. **Separation of Concerns**
   - Admin functionality isolated from content sites
   - Clear API boundaries
   - Independent deployment and scaling

2. **Existing Functionality**
   - 44 TypeScript files with substantial features
   - Complete authentication system
   - Role-based access control
   - Site management dashboards

3. **Better Development Experience**
   - Full Next.js ecosystem
   - Server-side rendering capabilities
   - API routes for backend functionality
   - TypeScript support throughout

### URL Structure

All admin functionality uses the `/admin` base path:
- **Main portal**: `http://localhost:3007/admin`
- **Authentication**: `http://localhost:3007/admin/auth/signin`
- **Dashboard**: `http://localhost:3007/admin/dashboard`
- **Site management**: `http://localhost:3007/admin/dashboard/[siteKey]`

### Integration with Docusaurus Sites

While the admin is a separate Next.js app, it integrates with Docusaurus sites through:

1. **Shared Configuration**
   - Centralized in `packages/theme/src/config/siteConfig.ts`
   - Environment-aware URL generation
   - Consistent admin portal references

2. **Cross-Site Authentication**
   - CORS-enabled session sharing
   - Login redirects from Docusaurus to admin
   - Session validation across domains

3. **Portal Integration**
   - Portal site includes admin navigation
   - Seamless user experience between content and admin
   - Role-based feature visibility

### Future Considerations

While this document originally proposed a Docusaurus SPA approach, the Next.js architecture provides:
- **Immediate productivity** with existing codebase
- **Scalability** for complex admin features
- **Maintainability** with clear boundaries
- **Flexibility** for future enhancements

The admin functionality remains accessible and integrated while maintaining architectural clarity.

## Reference

For current admin architecture details, see:
- `developer_notes/admin-architecture-implementation-plan.md`
- `developer_notes/admin-portal-authentication-architecture.md`