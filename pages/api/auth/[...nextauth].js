import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials'; // Updated import
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import { clientPromise } from '../../../lib/mongodb';
import bcrypt from 'bcryptjs';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      authorize: async (credentials) => {
        const { email, password } = credentials;
        const client = await clientPromise;
        const usersCollection = client.db().collection('users');
        const user = await usersCollection.findOne({ email });

        if (user && await bcrypt.compare(password, user.password)) {
          return { id: user._id, name: user.name, email: user.email };
        } else {
          return null;
        }
      }
    })
  ],
  adapter: MongoDBAdapter(clientPromise),
  pages: {
    signIn: '/login',
    signUp: '/register'
  },
  session: {
    jwt: true,
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt(token, user) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session(session, token) {
      session.user.id = token.id;
      return session;
    }
  }
});