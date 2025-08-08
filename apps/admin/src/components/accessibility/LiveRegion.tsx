'use client';

import { Box } from '@mui/material';

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
  if (!message) return null;

  return (
    <Box
      role="status"
      aria-live={priority}
      aria-atomic={atomic}
      sx={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }}
    >
      {message}
    </Box>
  );
}