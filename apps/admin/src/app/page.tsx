import { auth } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import { SignIn } from '@/app/components/sign-in';

export default async function Home() {
  const session = await auth();

  // If authenticated, redirect to dashboard
  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Admin Portal</h1>
      <SignIn />
    </main>
  );
}
