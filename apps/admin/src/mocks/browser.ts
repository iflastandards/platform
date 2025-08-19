/**
 * MSW Browser Setup
 * Configures Mock Service Worker for browser environments
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Create the service worker instance
export const worker = setupWorker(...handlers);
