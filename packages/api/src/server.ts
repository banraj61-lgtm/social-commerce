import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { appRouter } from "./router";
import { createContext } from "./trpc";

const PORT = Number(process.env.PORT) || 4000;
const HOST = process.env.HOST || "0.0.0.0";

async function main() {
  const server = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || "info",
    },
    maxParamLength: 5000,
  });

  // Register CORS
  await server.register(cors, {
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  });

  // Register cookie support
  await server.register(cookie, {
    secret: process.env.COOKIE_SECRET || "cookie-secret-change-in-production",
  });

  // Register tRPC
  await server.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: {
      router: appRouter,
      createContext,
      onError({ error, path }) {
        server.log.error(`tRPC error on '${path}':`, error);
      },
    },
  });

  // Health check endpoint
  server.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  // Graceful shutdown
  const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
  for (const signal of signals) {
    process.on(signal, async () => {
      server.log.info(`Received ${signal}, shutting down gracefully...`);
      await server.close();
      process.exit(0);
    });
  }

  // Start server
  try {
    await server.listen({ port: PORT, host: HOST });
    server.log.info(`Server listening on http://${HOST}:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
