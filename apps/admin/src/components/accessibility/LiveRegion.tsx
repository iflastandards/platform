'use client';

interface LiveRegionProps {
  message: string;
  priority?: 'polite' | 'assertive';
  atomic?: boolean;
}

export default function LiveRegion({ 
  message, 
  priority = 'polite',
  atomic = true 
}: LiveRegionProps) {
  if (!message) {return null;}

  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic={atomic}
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }}
    >
      {message}
    </div>
  );
}