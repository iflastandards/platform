'use client';

import React from 'react';
import { SignInButton } from '@clerk/nextjs';

interface SafeSignInButtonProps {
  children: React.ReactNode;
}

export default function SafeSignInButton({ children }: SafeSignInButtonProps) {
  return (
    <SignInButton mode="modal">
      {children}
    </SignInButton>
  );
}