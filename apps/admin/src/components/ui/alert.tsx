import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function Alert({ children, className = '' }: AlertProps) {
  return (
    <div
      className={`rounded-lg border p-4 ${className}`}
      role="alert"
    >
      {children}
    </div>
  );
}

export function AlertTitle({ children, className = '' }: AlertTitleProps) {
  return (
    <h5 className={`mb-1 font-medium leading-none tracking-tight ${className}`}>
      {children}
    </h5>
  );
}

export function AlertDescription({ children, className = '' }: AlertDescriptionProps) {
  return (
    <div className={`text-sm [&_p]:leading-relaxed ${className}`}>
      {children}
    </div>
  );
}