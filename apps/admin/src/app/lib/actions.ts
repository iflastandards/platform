'use server';

import { signIn } from '@/app/lib/auth';

export async function signInWithGitHub(callbackUrl?: string) {
  await signIn('github', {
    redirectTo: callbackUrl || '/dashboard'
  });
}
