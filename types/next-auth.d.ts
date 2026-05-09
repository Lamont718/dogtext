
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      subscriptionTier?: string;
    };
  }

  interface User {
    id: string;
    subscriptionTier?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    subscriptionTier?: string;
  }
}
