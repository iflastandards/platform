import { redirect } from 'next/navigation';

export default function Home() {
  // Always redirect to dashboard - Clerk middleware will handle auth
  redirect('/dashboard');
}