import './global.css';
import { SessionProvider } from 'next-auth/react';
import { auth } from './lib/auth';
import MockUserIndicator from './components/mock-user-indicator';

export const metadata = {
  title: 'IFLA Admin Portal',
  description: 'Administrative portal for IFLA Standards management',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isMockUser = session?.user?.email?.endsWith('@example.com');

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <SessionProvider>
          {process.env.NODE_ENV === 'development' && isMockUser && session?.user && (
            <MockUserIndicator user={session.user!} />
          )}
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
