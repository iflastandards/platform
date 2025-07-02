import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

const config = {
  debug: process.env.NODE_ENV === "development",
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
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, account, user }: any) {
      if (account) {
        token.accessToken = account.access_token;
        
        // Store GitHub login for role checking
        if (user?.login) {
          token.login = user.login;
        }
        
        console.log(`[AUTH] GitHub user login: ${user?.login}, email: ${user?.email}`);
        if (token.accessToken) {
          try {
            // Fetch organization memberships for iflastandards org
            const orgsResponse = await fetch("https://api.github.com/user/orgs", {
              headers: {
                Authorization: `Bearer ${token.accessToken}`,
              },
            });
            
            let roles: string[] = [];
            
            if (orgsResponse.ok) {
              const orgs = await orgsResponse.json();
              const iflaOrg = orgs.find((org: { login: string }) => org.login === 'iflastandards');
              
              if (iflaOrg) {
                // User is member of iflastandards org, fetch teams
                const teamsResponse = await fetch("https://api.github.com/orgs/iflastandards/teams", {
                  headers: {
                    Authorization: `Bearer ${token.accessToken}`,
                  },
                });
                
                if (teamsResponse.ok) {
                  const teams = await teamsResponse.json();
                  
                  // Check which teams the user is a member of
                  for (const team of teams) {
                    const memberResponse = await fetch(`https://api.github.com/teams/${team.id}/memberships/${token.sub}`, {
                      headers: {
                        Authorization: `Bearer ${token.accessToken}`,
                      },
                    });
                    
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
            
            const isAdmin = (token.login && adminUsers.includes(token.login)) || 
                           (token.email && adminEmails.includes(token.email));
                           
            if (isAdmin) {
              roles.push('site-admin'); // Full admin access to everything
              console.log('[AUTH] Granted site-admin access to site owner');
            }
            
            // Fallback: If no roles assigned and it's the site owner, give admin access
            if (roles.length === 0 && (token.login === 'jonphipps' || token.login === 'jphipps' || token.email === 'jphipps@madcreek.com')) {
              roles.push('site-admin');
              console.log('[AUTH] Fallback: Granted site-admin access to repository owner');
            }
            
            token.roles = roles;
            console.log(`[AUTH] Final roles for ${token.email || token.login}:`, roles);
          } catch (error) {
            console.error('[AUTH] Error fetching roles:', error);
            token.roles = [];
          }
        }
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
      // Redirect to dashboard after successful sign-in
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // Default redirect to dashboard
      return `${baseUrl}/dashboard`;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);