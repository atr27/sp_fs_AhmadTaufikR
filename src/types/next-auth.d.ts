import 'next-auth';
import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    name?: string | null;
    email: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
  }
}