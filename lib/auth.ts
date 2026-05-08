import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validation/auth";
import { isRole } from "@/lib/roles";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { identifier, password } = parsed.data;
        const lowered = identifier.toLowerCase();
        const isEmail = lowered.includes("@");
        const user = await db.user.findFirst({
          where: isEmail
            ? { email: lowered }
            : { username: identifier },
        });
        if (!user || !user.passwordHash) {
          return null;
        }

        const passwordMatches = await compare(password, user.passwordHash);
        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id.toString(),
          name: user.username,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "member";
      }
      // On explicit `update()` calls (e.g. after profile edit), refresh from DB.
      if (trigger === "update" && token.sub) {
        const idNum = Number(token.sub);
        if (Number.isFinite(idNum)) {
          const fresh = await db.user.findUnique({
            where: { id: idNum },
            select: { username: true, email: true, role: true },
          });
          if (fresh) {
            token.name = fresh.username ?? token.name;
            token.email = fresh.email ?? token.email;
            token.role = fresh.role;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        const tokenRole = typeof token.role === "string" ? token.role : undefined;
        session.user.role = tokenRole && isRole(tokenRole) ? tokenRole : "member";
      }
      return session;
    },
  },
};
