#!/usr/bin/env node

/**
 * API exports for Script Inventory
 */

export { ScriptInventoryServer, type ServerOptions } from './server';
export { scriptRoutes } from './routes/scripts';
export { healthRoutes } from './routes/health';