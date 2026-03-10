import { initTRPC, TRPCError } from "@trpc/server";
import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import superjson from "superjson";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret-change-in-production";

export interface UserPayload {
  id: string;
  email: string;
}

export interface Context {
  req: CreateFastifyContextOptions["req"];
  res: CreateFastifyContextOptions["res"];
  user: UserPayload | null;
}

export async function createContext({
  req,
  res,
}: CreateFastifyContextOptions): Promise<Context> {
  let user: UserPayload | null = null;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      user = jwt.verify(token, JWT_SECRET) as UserPayload;
    } catch {
      // Invalid token — user remains null
    }
  }

  return { req, res, user };
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

const isAuthed = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);
