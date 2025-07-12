import './global.css';
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IFLA Admin Portal',
  description: 'Administrative portal for IFLA Standards management',
  icons: {
    icon: '/admin/favicon.ico',
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
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}