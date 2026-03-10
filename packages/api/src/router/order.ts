import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: string;
  buyerId: string;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

// In-memory store for demo purposes — replace with @socialbazaar/db in production
const orders: Order[] = [];

export const orderRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().nullish(),
        })
        .optional(),
    )
    .query(({ input, ctx }) => {
      const limit = input?.limit ?? 20;
      const cursor = input?.cursor;

      const userOrders = orders.filter((o) => o.buyerId === ctx.user.id);

      let startIndex = 0;
      if (cursor) {
        const cursorIndex = userOrders.findIndex((o) => o.id === cursor);
        if (cursorIndex >= 0) {
          startIndex = cursorIndex + 1;
        }
      }

      const items = userOrders.slice(startIndex, startIndex + limit);
      const nextCursor = items.length === limit ? items[items.length - 1]?.id : null;

      return { items, nextCursor };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input, ctx }) => {
      const order = orders.find((o) => o.id === input.id);
      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }
      if (order.buyerId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only view your own orders",
        });
      }
      return order;
    }),

  create: protectedProcedure
    .input(
      z.object({
        items: z
          .array(
            z.object({
              productId: z.string(),
              quantity: z.number().int().positive(),
              unitPrice: z.number().positive(),
            }),
          )
          .min(1),
      }),
    )
    .mutation(({ input, ctx }) => {
      const totalAmount = input.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
      );

      const now = new Date();
      const order: Order = {
        id: crypto.randomUUID(),
        buyerId: ctx.user.id,
        items: input.items,
        totalAmount,
        status: "pending",
        createdAt: now,
        updatedAt: now,
      };
      orders.push(order);

      return order;
    }),
});
