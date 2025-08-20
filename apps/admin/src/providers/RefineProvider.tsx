'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Refine } from '@refinedev/core';
import { App as AntdApp, ConfigProvider } from 'antd';
import routerProvider from '@refinedev/nextjs-router';
import { dataProvider } from './dataProvider';
import { initMsw } from '@/lib/msw-init';
import { antdTheme } from '@/lib/antd-theme';

interface RefineProviderProps {
  children: ReactNode;
}

/**
 * Refine Provider Component
 * Configures refine with resources, data provider, and routing
 */
export function RefineProvider({ children }: RefineProviderProps) {
  const [mswReady, setMswReady] = useState(false);

  // Initialize MSW before rendering
  useEffect(() => {
    initMsw().then(() => {
      setMswReady(true);
    });
  }, []);

  // Don't render refine until MSW is ready (in mock mode)
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true' && !mswReady) {
    return <div>Initializing mock services...</div>;
  }

  return (
    <ConfigProvider theme={antdTheme}>
      <AntdApp>
        <Refine
          dataProvider={dataProvider}
          routerProvider={routerProvider}
          resources={[
          {
            name: 'rdf-builds',
            list: '/rdf-builds',
            create: '/rdf-builds/new',
            show: '/rdf-builds/:id',
            meta: {
              label: 'RDF Builds',
              icon: '🔧',
            },
          },
          {
            name: 'jobs',
            list: '/jobs',
            show: '/jobs/:id',
            meta: {
              label: 'Jobs',
              icon: '📋',
            },
          },
        ]}
        options={{
          syncWithLocation: true,
          warnWhenUnsavedChanges: true,
          projectId: 'ifla-admin',
        }}
      >
          {children}
        </Refine>
      </AntdApp>
    </ConfigProvider>
  );
}
