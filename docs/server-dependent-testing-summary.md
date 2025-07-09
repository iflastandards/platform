# Server-Dependent Testing System - Summary

A comprehensive testing infrastructure for integration tests requiring live servers, implemented for the IFLA Standards Development project.

## 🎯 **Purpose**

Tests cross-site authentication, CORS functionality, and server integration scenarios between the Next.js admin application and Docusaurus standard sites.

## ✅ **Current Status: 14/14 Tests Passing**

### Test Categories:
- **Basic Server Management** (1 test) - Server lifecycle
- **Admin Server Startup** (1 test) - Detailed startup validation  
- **Cross-Site Authentication** (5 tests) - Admin ↔ Docusaurus auth flows
- **CORS Integration** (4 tests) - Cross-origin request handling
- **Process Management** (3 tests) - Command execution and spawning

## 🚀 **Quick Start**

```bash
# Run all server-dependent tests
cd apps/admin
pnpm test:server-dependent

# Run with debug output
TEST_SERVER_DEBUG=1 pnpm test:server-dependent
```

## 🏗️ **Key Features**

- ✅ **Automatic server lifecycle management** (start/stop/cleanup)
- ✅ **Multi-server parallel startup** (admin + Docusaurus sites)
- ✅ **Health check monitoring** with timeout handling
- ✅ **Port conflict resolution** with automatic process cleanup
- ✅ **Cross-site authentication testing** 
- ✅ **CORS integration validation**
- ✅ **Graceful error handling** and resource cleanup

## 📚 **Documentation**

- **Complete Guide**: [`apps/admin/docs/server-dependent-testing.md`](../apps/admin/docs/server-dependent-testing.md)
- **Test Directory**: [`apps/admin/src/test/integration/server-dependent/`](../apps/admin/src/test/integration/server-dependent/)
- **Configuration**: [`apps/admin/vitest.config.server-dependent.ts`](../apps/admin/vitest.config.server-dependent.ts)

## 🔧 **Architecture**

### Core Components:
1. **Test Server Manager** - Manages server lifecycles
2. **Server Configurations** - Pre-configured setups for admin/Docusaurus sites
3. **Test Configuration** - Specialized Vitest config with extended timeouts
4. **Setup Files** - Node-fetch integration and environment setup

### Supported Servers:
- **Admin** (port 3007) - Next.js application
- **Portal** (port 3000) - Main Docusaurus site
- **NewTest** (port 3008) - Test Docusaurus site
- **Standard Sites** (ports 3001-3006) - ISBDM, LRM, FRBR, etc.

## 🎯 **Use Cases**

- **Cross-site authentication flows** between admin and Docusaurus sites
- **CORS header validation** for localhost development
- **Server startup/shutdown lifecycle testing**
- **Integration testing** requiring multiple live servers
- **Port conflict resolution** and process management

## 🔮 **Future Enhancements**

- Docker integration for consistent environments
- Database seeding for data-dependent tests  
- Mock external services for isolated testing
- Performance benchmarking and load testing
- CI/CD optimization for faster execution

---

*Implemented as part of the IFLA Standards Development project's comprehensive testing strategy.*