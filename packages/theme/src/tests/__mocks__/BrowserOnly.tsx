import React from 'react';

interface BrowserOnlyProps {
  children: () => React.ReactNode;
  fallback?: React.ReactNode;
}

// Mock BrowserOnly to immediately render children in tests
const BrowserOnly: React.FC<BrowserOnlyProps> = ({ children, fallback }) => {
  try {
    return <>{children()}</>;
  } catch (error) {
    return <>{fallback || null}</>;
  }
};

export default BrowserOnly;