'use client';

import React from 'react';
import { Button } from '@mui/material';
import dynamic from 'next/dynamic';

// Dynamically import SignInButton to avoid SSR issues and chunk loading problems
const ClerkSignInButton = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.SignInButton),
  {
    ssr: false,
    loading: () => (
      <Button
        variant="contained"
        color="secondary"
        size="large"
        sx={{
          fontWeight: 'bold',
          px: 4,
          py: 1.5,
          fontSize: '1.1rem',
        }}
        disabled
      >
        Loading...
      </Button>
    ),
  }
);

interface SafeSignInButtonProps {
  children: React.ReactNode;
}

export default function SafeSignInButton({ children }: SafeSignInButtonProps) {
  return (
    <ClerkSignInButton mode="modal">
      {children}
    </ClerkSignInButton>
  );
}