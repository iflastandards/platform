import React from 'react';
export default function CodeBlock({ children, language, 'data-testid': dataTestId, ...props }: { children: React.ReactNode; language: string; 'data-testid'?: string; [key: string]: unknown }) {
  return (
    <pre data-testid={dataTestId || `codeblock-${language || 'unknown'}`} {...props}>
      <code>{children}</code>
    </pre>
  );
} 