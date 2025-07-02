declare module 'next-auth' {
  interface Session {
    user: {
      roles?: string[];
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
  
  interface User {
    login?: string;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    roles?: string[];
    accessToken?: string;
    login?: string;
  }
}
