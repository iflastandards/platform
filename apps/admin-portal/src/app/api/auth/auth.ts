
import NextAuth, { NextAuthOptions } from "next-auth";
import GitHub from "next-auth/providers/github";
import type { JWT } from "next-auth/jwt";
import type { User, Account, Session } from "next-auth";

export const authOptions: NextAuthOptions = {
  theme: {
    logo: "https://next-auth.js.org/img/logo/logo-sm.png",
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: "read:user,user:email,read:org",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }: { token: JWT; user?: User; account?: Account | null }): Promise<JWT> {
      if (account && user) {
        token.accessToken = account.access_token;
        if (token.accessToken) {
          try {
            const response = await fetch("https://api.github.com/user/teams", {
              headers: {
                Authorization: `Bearer ${token.accessToken}`,
              },
            });
            if (response.ok) {
              const teams = await response.json();
              const teamSlugs = teams.map((team: { slug: string }) => team.slug);
              token.roles = teamSlugs;
            } else {
              token.roles = [];
            }
          } catch (_error) {
            token.roles = [];
          }
        }
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      if (token.roles && session.user) {
        session.user.roles = token.roles as string[];
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// For use in server actions and API routes
export const { auth, signIn, signOut } = NextAuth(authOptions);
