import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db';
import { verifyPassword } from '@/lib/auth-helpers';
import { isAccountLocked, recordFailedAttempt, clearFailedAttempts } from '@/lib/login-attempt-tracker';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        const email = credentials.email.toLowerCase();

        try {
          // Check brute-force lockout before any DB query
          const lockStatus = await isAccountLocked(email);
          if (lockStatus.locked) {
            throw new Error('Account temporarily locked due to too many failed attempts');
          }

          const user = await prisma.user.findUnique({
            where: { email },
            include: {
              organization: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          });

          if (!user || !user.passwordHash) {
            await recordFailedAttempt(email);
            throw new Error('Invalid credentials');
          }

          if (!user.isActive) {
            throw new Error('Account is deactivated');
          }

          const isValid = await verifyPassword(
            credentials.password,
            user.passwordHash
          );

          if (!isValid) {
            await recordFailedAttempt(email);
            throw new Error('Invalid credentials');
          }

          // Successful login — clear failed attempts
          await clearFailedAttempts(email);

          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
            organizationId: user.organizationId,
            organizationName: user.organization.name,
            ssoProvider: user.ssoProvider || undefined,
            mustChangePassword: user.mustChangePassword,
          };
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 30 * 60, // Refresh token every 30 minutes of activity
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.organizationId = user.organizationId;
        token.organizationName = user.organizationName;
        token.ssoProvider = user.ssoProvider;
        token.mustChangePassword = user.mustChangePassword;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.organizationId = token.organizationId as string;
        session.user.organizationName = token.organizationName as string;
        session.user.ssoProvider = token.ssoProvider as string | undefined;
        session.user.mustChangePassword = token.mustChangePassword as boolean | undefined;
      }
      return session;
    },
    async signIn({ user }) {
      // Allow SSO users (no password) to sign in
      // Credentials provider will handle password validation for non-SSO users
      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
