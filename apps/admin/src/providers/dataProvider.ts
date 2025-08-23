/**
 * Main Data Provider
 * Switches between mock and live providers based on environment configuration
 */

import { type DataProvider } from '@refinedev/core';
import { config } from '@/config/environment';
import { mockDataProvider } from './mockDataProvider';
import { liveDataProvider } from './liveDataProvider';

// Determine which provider to use based on environment
const {useMock} = config.env;

// Export the appropriate data provider
export const dataProvider: DataProvider = useMock
  ? mockDataProvider
  : liveDataProvider;

// Export provider type for debugging
export const dataProviderType = useMock ? 'mock' : 'live';

// Log which provider is being used
if (typeof window !== 'undefined') {
  console.log(`[DataProvider] Using ${dataProviderType} data provider`);
}
