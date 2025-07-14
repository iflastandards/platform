import './global.css';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/contexts/theme-context';
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
        >
          <ThemeProvider>{children}</ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
