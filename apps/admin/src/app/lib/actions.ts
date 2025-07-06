'use server';

import { signIn } from '@/app/lib/auth';

export async function signInWithGitHub() {
  await signIn('github');
}
