// In: apps/admin-portal/next-auth.d.ts

import type { DefaultSession } from '@auth/core/types';

declare module '@auth/core/types' {
  /**
   * The user's session object.
   * Returned by `auth()`, `useSession()`, `getSession()`
   */
  interface Session {
    user: {
      /** An array of strings representing the user's GitHub team slugs. */
      roles?: string[];
      // By default, session.user only has name, email, image.
      // Here, we are adding our custom roles property.
    } & DefaultSession['user']; // Inherit the default properties.
  }

  // We can also extend the User model if we need to pass the roles
  // from the provider to the JWT callback.
  // interface User {
  //   roles?: string[];
  // }
}

declare module '@auth/core/jwt' {
  /**
   * The JWT token object.
   * Returned by the `jwt` callback and sent to the `session` callback.
   */
  interface JWT {
    /** An array of strings representing the user's GitHub team slugs. */
    roles?: string[];
  }
}
