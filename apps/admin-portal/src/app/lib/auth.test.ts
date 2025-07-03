import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

// Test-only authentication configuration for E2E testing
// This should only be used when NODE_ENV === 'test' or when explicitly enabled for testing

const testAuthOptions = {
  debug: process.env.NODE_ENV === "development",
  providers: [
    Credentials({
      id: "test-credentials",
      name: "Test Credentials",
      credentials: {
        testUser: { label: "Test User Type", type: "text" },
      },
      authorize: async (credentials) => {
        // Only allow test authentication in development or test environment
        if (process.env.NODE_ENV === 'production') {
          return null;
        }

        // Define test users with different roles
        const testUsers = {
          admin: {
            id: 'test-admin-id',
            name: 'Test Admin',
            email: 'admin@test.example.com',
            image: 'https://avatars.githubusercontent.com/u/12345',
            roles: ['site-admin', 'ifla-admin'],
          },
          basicUser: {
            id: 'test-basic-id',
            name: 'Test User',
            email: 'user@test.example.com',
            image: 'https://avatars.githubusercontent.com/u/67890',
            roles: [],
          },
          siteEditor: {
            id: 'test-editor-id',
            name: 'Site Editor',
            email: 'editor@test.example.com',
            image: 'https://avatars.githubusercontent.com/u/54321',
            roles: ['portal-editor', 'newtest-admin'],
          },
        };

        const userType = credentials?.testUser as keyof typeof testUsers;
        const user = testUsers[userType];

        if (user) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            roles: user.roles,
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.roles = user.roles;
        token.login = user.email?.split('@')[0]; // Extract username from email for testing
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token.roles && session.user) {
        session.user.roles = token.roles as string[];
      }
      return session;
    },
    async redirect({ url, baseUrl }: any) {
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return `${baseUrl}/dashboard`;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'test-secret-for-e2e-testing',
};

export const { handlers: testHandlers, auth: testAuth, signIn: testSignIn, signOut: testSignOut } = NextAuth(testAuthOptions);