import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignIn
        path="/sign-in"
        routing="path"
        forceRedirectUrl="/dashboard"
        appearance={{
          baseTheme: undefined,
          elements: {
            formButtonPrimary: 'bg-gray-900 hover:bg-gray-800 text-white',
            card: 'shadow-lg',
            headerTitle: 'text-2xl font-bold',
            headerSubtitle: 'text-gray-600',
            socialButtonsBlockButton: 'border-gray-300 hover:bg-gray-50',
            socialButtonsBlockButtonText: 'font-medium',
            formFieldLabel: 'text-gray-700',
            footerActionLink: 'text-blue-600 hover:text-blue-500',
          },
        }}
      />
    </div>
  );
}
