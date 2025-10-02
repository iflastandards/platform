'use client';

interface LiveRegionProps extends React.HTMLAttributes<HTMLOutputElement> {
  message: string;
  priority?: 'polite' | 'assertive';
  atomic?: boolean;
}

export default function LiveRegion({
  message,
  priority = 'polite',
  atomic = true,
  className,
  ...props
}: LiveRegionProps) {
  if (!message) {
    return null;
  }

  return (
    <output
      aria-live={priority}
      aria-atomic={atomic}
      className={className}
      {...props}
    >
      {message}
    </output>
  );
}
