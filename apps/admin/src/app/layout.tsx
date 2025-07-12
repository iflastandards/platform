import './global.css';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata = {
  title: 'IFLA Admin Portal',
  description: 'Administrative portal for IFLA Standards management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body suppressHydrationWarning={true}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}