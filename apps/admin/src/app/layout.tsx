import './global.css';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/contexts/theme-context';
import { QueryClientContextProvider } from '@/contexts/query-client-context';
import { RefineProvider } from '@/providers/RefineProvider';
import { Suspense } from 'react';
import type { Metadata } from 'next';

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
      <body suppressHydrationWarning={true}>
        <ClerkProvider
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'shadow-none',
            },
          }}
          signInUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in'}
          signUpUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/sign-up'}
          afterSignOutUrl={
            process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL || '/'
          }
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
