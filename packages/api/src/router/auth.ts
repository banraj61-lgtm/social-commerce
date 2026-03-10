import { z } from "zod";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { router, publicProcedure, protectedProcedure } from "../trpc";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// In-memory store for demo purposes — replace with @socialbazaar/db in production
const users: Array<{
  id: string;
  email: string;
  name: string;
  passwordHash: string;
}> = [];

export const authRouter = router({
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().min(2),
        password: z.string().min(8),
      }),
    )
    .mutation(async ({ input }) => {
      const existing = users.find((u) => u.email === input.email);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A user with this email already exists",
        });
      }

      const passwordHash = await bcrypt.hash(input.password, 12);
      const user = {
        id: crypto.randomUUID(),
        email: input.email,
        name: input.name,
        passwordHash,
      };
      users.push(user);

      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN },
      );

      return {
        token,
        user: { id: user.id, email: user.email, name: user.name },
      };
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const user = users.find((u) => u.email === input.email);
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN },
      );

      return {
        token,
        user: { id: user.id, email: user.email, name: user.name },
      };
    }),

  me: protectedProcedure.query(({ ctx }) => {
    const user = users.find((u) => u.id === ctx.user.id);
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }
    return { id: user.id, email: user.email, name: user.name };
  }),
});
