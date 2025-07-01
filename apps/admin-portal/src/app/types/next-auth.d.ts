import type { User } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      roles?: string[];
    } & User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    roles?: string[];
    accessToken?: string;
  }
}
