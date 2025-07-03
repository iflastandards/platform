// apps/admin-portal/src/app/components/mock-user-indicator.tsx
'use client';

import { Session } from "next-auth";

interface MockUserIndicatorProps {
  user: Session['user'];
}

export default function MockUserIndicator({ user }: MockUserIndicatorProps) {
  return (
    <div style={{
      backgroundColor: 'red',
      color: 'white',
      textAlign: 'center',
      padding: '5px',
      fontWeight: 'bold',
    }}>
      <p>
        MOCK USER ACTIVE: {user?.name} ({user?.email}) - Roles: {user?.roles?.join(', ')}
      </p>
    </div>
  );
}
