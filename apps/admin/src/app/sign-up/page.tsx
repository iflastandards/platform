import { SignUp } from '@clerk/nextjs';
import { Suspense } from 'react';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <Suspense fallback={<div>Loading...</div>}>
          <SignUp 
            forceRedirectUrl="/dashboard"
            fallbackRedirectUrl="/dashboard"
          />
        </Suspense>
      </div>
    </div>
  );
}