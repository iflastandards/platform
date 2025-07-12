import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ClerkProvider } from '@clerk/nextjs';

interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children }) => {
  return <ClerkProvider>{children}</ClerkProvider>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
