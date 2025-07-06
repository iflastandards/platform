// types/next-auth.d.ts
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      roles: string[];
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } & DefaultSession['user'];
  }
  interface User {
    roles?: string[];
  }
}
declare module 'next-auth/jwt' {
  interface JWT {
    roles: string[];
    accessToken?: string;
    login?: string;
  }
}
