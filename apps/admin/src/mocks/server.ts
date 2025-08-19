/**
 * MSW Server Setup
 * Configures Mock Service Worker for Node/server environments
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Create the server instance
export const server = setupServer(...handlers);
