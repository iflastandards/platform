import { auth } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { SignIn } from "@/app/components/sign-in";

export default async function SignInPage() {
  const session = await auth();
  
  // If already authenticated, redirect to dashboard
  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Sign in to Admin Portal
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage IFLA standards and documentation
            </p>
          </div>
          
          <SignIn />
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Access restricted to authorized IFLA team members
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}