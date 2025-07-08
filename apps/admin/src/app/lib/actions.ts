'use server';

import { signIn } from '@/app/lib/auth';

export async function signInWithGitHub(callbackUrl?: string) {
  // Pass the callbackUrl as a query parameter that will be preserved through OAuth
  const redirectUrl = callbackUrl || '/dashboard';
  
  await signIn('github', {
    redirectTo: redirectUrl
  });
}
