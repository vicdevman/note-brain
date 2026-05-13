import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./mongodb";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Zod schema for input validation and sanitization
const credentialsSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt" }, // Use JWT for easier handling with Credentials
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Validate and sanitize inputs
          const validatedFields = credentialsSchema.safeParse(credentials);
          
          if (!validatedFields.success) {
            console.error("Validation error:", validatedFields.error.issues);
            throw new Error("Invalid credentials format");
          }

          const { email, password } = validatedFields.data;

          const client = await clientPromise;
          const db = client.db();
          
          // Find user by email
          const user = await db.collection("users").findOne({
            email: email
          });

          if (!user) {
            console.log(`User not found: ${email}`);
            throw new Error("NO_ACCOUNT");
          }

          if (!user.password) {
            console.log(`User ${email} has no password (likely OAuth account)`);
            throw new Error("OAUTH_ACCOUNT");
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
            console.log(`Invalid password for user: ${email}`);
            throw new Error("INVALID_PASSWORD");
          }
          
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error("Auth error:", error);
          // Re-throw custom errors
          throw error;
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});