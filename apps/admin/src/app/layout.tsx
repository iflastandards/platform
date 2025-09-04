import './global.css';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/contexts/theme-context';
import { QueryClientContextProvider } from '@/contexts/query-client-context';
import { RefineProvider } from '@/providers/RefineProvider';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { config } from '@/config/environment';

export const metadata: Metadata = {
  title: 'IFLA Admin Portal',
  description: 'Administrative portal for IFLA Standards management',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <ClerkProvider
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'shadow-none',
            },
          }}
          signInUrl={config.env.clerkSignInUrl}
          signUpUrl={config.env.clerkSignUpUrl}
          afterSignOutUrl={config.env.clerkAfterSignOutUrl}
        >
          <QueryClientContextProvider>
            <ThemeProvider>
              <Suspense fallback={<div>Loading...</div>}>
                <RefineProvider>{children}</RefineProvider>
              </Suspense>
            </ThemeProvider>
          </QueryClientContextProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
