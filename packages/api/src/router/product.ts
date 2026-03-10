import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../trpc";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  sellerId: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory store for demo purposes — replace with @socialbazaar/db in production
const products: Product[] = [];

export const productRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().nullish(),
        })
        .optional(),
    )
    .query(({ input }) => {
      const limit = input?.limit ?? 20;
      const cursor = input?.cursor;

      let startIndex = 0;
      if (cursor) {
        const cursorIndex = products.findIndex((p) => p.id === cursor);
        if (cursorIndex >= 0) {
          startIndex = cursorIndex + 1;
        }
      }

      const items = products.slice(startIndex, startIndex + limit);
      const nextCursor = items.length === limit ? items[items.length - 1]?.id : null;

      return { items, nextCursor };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const product = products.find((p) => p.id === input.id);
      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }
      return product;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        description: z.string().min(1).max(5000),
        price: z.number().positive(),
        imageUrl: z.string().url().nullish(),
      }),
    )
    .mutation(({ input, ctx }) => {
      const now = new Date();
      const product: Product = {
        id: crypto.randomUUID(),
        title: input.title,
        description: input.description,
        price: input.price,
        imageUrl: input.imageUrl ?? null,
        sellerId: ctx.user.id,
        createdAt: now,
        updatedAt: now,
      };
      products.push(product);
      return product;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(200).optional(),
        description: z.string().min(1).max(5000).optional(),
        price: z.number().positive().optional(),
        imageUrl: z.string().url().nullish(),
      }),
    )
    .mutation(({ input, ctx }) => {
      const product = products.find((p) => p.id === input.id);
      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }
      if (product.sellerId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only update your own products",
        });
      }

      if (input.title !== undefined) product.title = input.title;
      if (input.description !== undefined) product.description = input.description;
      if (input.price !== undefined) product.price = input.price;
      if (input.imageUrl !== undefined) product.imageUrl = input.imageUrl ?? null;
      product.updatedAt = new Date();

      return product;
    }),
});
