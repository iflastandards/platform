import { type ReactElement, type ReactNode, type FC } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { ClerkProvider } from '@clerk/nextjs';

interface AllTheProvidersProps {
  children: ReactNode;
}

const AllTheProviders: FC<AllTheProvidersProps> = ({ children }) => <ClerkProvider>{children}</ClerkProvider>;

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
