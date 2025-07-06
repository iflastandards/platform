import NextAuth, { type NextAuthConfig, User, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';
import { createUser } from './mock-auth';

const authConfig: NextAuthConfig = {
  debug: process.env.NODE_ENV === 'development',
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: 'read:user,user:email,read:org',
        },
      },
    }),
    ...(process.env.NODE_ENV === 'development'
      ? [
          Credentials({
            name: 'Mock User',
            credentials: {
              username: { label: 'Username', type: 'text' },
              roles: { label: 'Roles (comma-separated)', type: 'text' },
            },
            async authorize(credentials) {
              if (
                typeof credentials.username !== 'string' ||
                typeof credentials.roles !== 'string'
              ) {
                return null;
              }

              const user = createUser({
                name: credentials.username,
                roles: credentials.roles.split(',').map((role) => role.trim()),
              });

              return user as User;
            },
          }),
        ]
      : []),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, account, user }) {
      // Initialize roles if not present
      if (!token.roles) {
        token.roles = [];
      }

      if (account && user) {
        token.accessToken = account.access_token;

        // Store GitHub login for role checking
        if ('login' in user) {
          token.login = user.login as string;
        }

        console.log(
          `[AUTH] GitHub user login: ${token.login}, email: ${user?.email}`,
        );
        if (token.accessToken) {
          try {
            // Fetch organization memberships for iflastandards org
            const orgsResponse = await fetch(
              'https://api.github.com/user/orgs',
              {
                headers: {
                  Authorization: `Bearer ${token.accessToken}`,
                },
              },
            );

            let roles: string[] = [];

            if (orgsResponse.ok) {
              const orgs = await orgsResponse.json();
              const iflaOrg = orgs.find(
                (org: { login: string }) => org.login === 'iflastandards',
              );

              if (iflaOrg) {
                // User is member of iflastandards org, fetch teams
                const teamsResponse = await fetch(
                  'https://api.github.com/orgs/iflastandards/teams',
                  {
                    headers: {
                      Authorization: `Bearer ${token.accessToken}`,
                    },
                  },
                );

                if (teamsResponse.ok) {
                  const teams = await teamsResponse.json();

                  // Check which teams the user is a member of
                  for (const team of teams) {
                    const memberResponse = await fetch(
                      `https://api.github.com/teams/${team.id}/memberships/${token.sub}`,
                      {
                        headers: {
                          Authorization: `Bearer ${token.accessToken}`,
                        },
                      },
                    );

                    if (memberResponse.ok) {
                      const membership = await memberResponse.json();
                      if (membership.state === 'active') {
                        roles.push(team.slug);
                      }
                    }
                  }
                }

                // For now, give admin access to org members (temporary)
                roles.push('ifla-admin');
              }
            }

            // Grant admin access to site owner and specific users
            const adminUsers = ['jonphipps', 'jphipps']; // Site owner gets full admin access
            const adminEmails = ['jphipps@madcreek.com']; // Add your actual email

            const isAdmin =
              (token.login && adminUsers.includes(token.login)) ||
              (token.email && adminEmails.includes(token.email));

            if (isAdmin) {
              roles.push('site-admin'); // Full admin access to everything
              console.log('[AUTH] Granted site-admin access to site owner');
            }

            // Fallback: If no roles assigned and it's the site owner, give admin access
            if (
              roles.length === 0 &&
              (token.login === 'jonphipps' ||
                token.login === 'jphipps' ||
                token.email === 'jphipps@madcreek.com')
            ) {
              roles.push('site-admin');
              console.log(
                '[AUTH] Fallback: Granted site-admin access to repository owner',
              );
            }

            token.roles = roles;
            console.log(
              `[AUTH] Final roles for ${token.email || token.login}:`,
              roles,
            );
          } catch (error) {
            console.error('[AUTH] Error fetching roles:', error);
            token.roles = [];
          }
        }
      } else if (user) {
        // For mock user
        token.roles = (user as { roles: string[] }).roles;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.roles = token.roles || [];
        session.user.name = token.name;
        session.user.email = token.email;
      }
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // If URL is already within our app, respect it
      if (url.startsWith(baseUrl)) {
        return url;
      }

      // For sign-in redirects, we need to get the user's session to determine the right landing page
      // Since we don't have access to session here, we'll use a default and handle smart routing in middleware
      return `${baseUrl}/dashboard`;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
