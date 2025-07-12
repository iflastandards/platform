import { ClerkLoaded, ClerkLoading } from "@clerk/nextjs";

export default function TestClerkPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Clerk Test Page</h1>
      
      <ClerkLoading>
        <p>Clerk is loading...</p>
      </ClerkLoading>
      
      <ClerkLoaded>
        <p>Clerk is loaded!</p>
        <p>If you see this, Clerk is working.</p>
      </ClerkLoaded>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>Environment Check:</h2>
        <pre style={{ background: '#f0f0f0', padding: '1rem' }}>
          {JSON.stringify({
            publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 20) + '...',
            signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
            signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}