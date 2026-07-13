import { z } from "zod";
import * as cookie from "cookie";
import { TRPCError } from "@trpc/server";
import { eq, desc, sql, gte } from "drizzle-orm";
import { createRouter, publicQuery, adminProcedure } from "./middleware";
import { getDb } from "./queries/connection";
import { products, orders, orderItems, aiChatLogs, feedback } from "@db/schema";
import { ADMIN_SESSION_COOKIE, createAdminSession, revokeAdminSession } from "./lib/admin-session";
import { getSessionCookieOptions } from "./lib/cookies";
import { env } from "./lib/env";
import { checkRateLimit } from "./lib/rate-limit";

const LOGIN_ATTEMPT_LIMIT = 5;
const LOGIN_ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export const adminRouter = createRouter({
  // Admin login (username/password, sets httpOnly session cookie)
  login: publicQuery
    .input(z.object({ username: z.string(), password: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { allowed, retryAfterMs } = checkRateLimit(
        `admin-login:${input.username.toLowerCase()}`,
        LOGIN_ATTEMPT_LIMIT,
        LOGIN_ATTEMPT_WINDOW_MS,
      );
      if (!allowed) {
        const minutes = Math.ceil(retryAfterMs / 60000);
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Too many login attempts. Try again in ${minutes} minute(s).`,
        });
      }

      if (input.username !== env.adminUsername || input.password !== env.adminPassword) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid username or password" });
      }

      const token = createAdminSession();
      const opts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(ADMIN_SESSION_COOKIE, token, {
          httpOnly: opts.httpOnly,
          path: opts.path,
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          secure: opts.secure,
          maxAge: 7 * 24 * 60 * 60,
        }),
      );
      return { success: true };
    }),

  // Admin logout
  logout: adminProcedure.mutation(async ({ ctx }) => {
    const cookies = cookie.parse(ctx.req.headers.get("cookie") || "");
    revokeAdminSession(cookies[ADMIN_SESSION_COOKIE]);
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(ADMIN_SESSION_COOKIE, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),

  // Verify current admin session
  me: adminProcedure.query(() => ({ ok: true })),

  // Dashboard statistics
  getDashboardStats: adminProcedure.query(async () => {
    const db = getDb();
    
    // Total products
    const totalProducts = await db.select({ count: sql<number>`COUNT(*)` }).from(products);
    
    // Low stock products
    const lowStock = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products)
      .where(sql`stockQuantity <= minStockAlert AND stockQuantity > 0`);
    
    // Out of stock
    const outOfStock = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products)
      .where(sql`stockQuantity = 0`);
    
    // Total orders
    const totalOrders = await db.select({ count: sql<number>`COUNT(*)` }).from(orders);
    
    // Total revenue
    const totalRevenue = await db.select({ total: sql<string>`COALESCE(SUM(grandTotal), 0)` }).from(orders);
    
    // Today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(orders)
      .where(gte(orders.createdAt, today));
    
    // Recent orders
    const recentOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(10);
    
    // Sales by payment method
    const paymentMethodStats = await db
      .select({
        method: orders.paymentMethod,
        count: sql<number>`COUNT(*)`,
        total: sql<string>`COALESCE(SUM(grandTotal), 0)`,
      })
      .from(orders)
      .groupBy(orders.paymentMethod);
    
    return {
      totalProducts: totalProducts[0]?.count || 0,
      lowStock: lowStock[0]?.count || 0,
      outOfStock: outOfStock[0]?.count || 0,
      totalOrders: totalOrders[0]?.count || 0,
      totalRevenue: totalRevenue[0]?.total || "0",
      todayOrders: todayOrders[0]?.count || 0,
      recentOrders,
      paymentMethodStats,
    };
  }),

  // Get inventory report
  getInventory: adminProcedure
    .input(
      z.object({
        filter: z.enum(["all", "low_stock", "out_of_stock", "featured"]).default("all"),
        page: z.number().default(1),
        limit: z.number().default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const filters = input || {};
      let condition;
      
      if (filters.filter === "low_stock") {
        condition = sql`stockQuantity <= minStockAlert AND stockQuantity > 0`;
      } else if (filters.filter === "out_of_stock") {
        condition = sql`stockQuantity = 0`;
      } else if (filters.filter === "featured") {
        condition = sql`featured = true`;
      }
      
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const offset = (page - 1) * limit;
      
      const items = await db
        .select()
        .from(products)
        .where(condition)
        .orderBy(desc(products.createdAt))
        .limit(limit)
        .offset(offset);
      
      const countResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(products)
        .where(condition);
      
      return {
        items,
        total: countResult[0]?.count || 0,
        page,
        totalPages: Math.ceil((countResult[0]?.count || 0) / limit),
      };
    }),

  // Get AI chat logs
  getChatLogs: adminProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page || 1;
      const limit = input?.limit || 20;
      const offset = (page - 1) * limit;
      
      const items = await db
        .select()
        .from(aiChatLogs)
        .orderBy(desc(aiChatLogs.createdAt))
        .limit(limit)
        .offset(offset);
      
      const countResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(aiChatLogs);
      
      return {
        items,
        total: countResult[0]?.count || 0,
        page,
        totalPages: Math.ceil((countResult[0]?.count || 0) / limit),
      };
    }),

  // Get feedback list
  getFeedback: adminProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page || 1;
      const limit = input?.limit || 20;
      const offset = (page - 1) * limit;
      
      const items = await db
        .select()
        .from(feedback)
        .orderBy(desc(feedback.createdAt))
        .limit(limit)
        .offset(offset);
      
      const countResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(feedback);
      
      return {
        items,
        total: countResult[0]?.count || 0,
        page,
        totalPages: Math.ceil((countResult[0]?.count || 0) / limit),
      };
    }),

  // Update product stock (admin)
  updateStock: adminProcedure
    .input(
      z.object({
        productId: z.number(),
        stockQuantity: z.number(),
        stockStatus: z.enum(["in_stock", "low_stock", "out_of_stock"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(products)
        .set({
          stockQuantity: input.stockQuantity,
          stockStatus: input.stockStatus,
        })
        .where(eq(products.id, input.productId));
      return { success: true };
    }),

  // Get profit report
  getProfitReport: adminProcedure.query(async () => {
    const db = getDb();
    
    const productProfits = await db
      .select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        sellingPrice: products.sellingPrice,
        purchasePrice: products.purchasePrice,
        stockQuantity: products.stockQuantity,
        totalSold: sql<number>`COALESCE((SELECT SUM(quantity) FROM order_items WHERE productId = ${products.id}), 0)`,
      })
      .from(products);
    
    const totalProfit = productProfits.reduce((sum, p) => {
      const profit = (Number(p.sellingPrice) - Number(p.purchasePrice)) * (p.totalSold || 0);
      return sum + profit;
    }, 0);
    
    return {
      products: productProfits,
      totalEstimatedProfit: totalProfit,
    };
  }),

  // Get sales report (daily revenue for last N days + top-selling / slow-moving products)
  getSalesReport: adminProcedure
    .input(z.object({ days: z.number().default(30) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const days = input?.days || 30;
      const since = new Date();
      since.setHours(0, 0, 0, 0);
      since.setDate(since.getDate() - (days - 1));

      const dailySales = await db
        .select({
          date: sql<string>`DATE(${orders.createdAt})`,
          orderCount: sql<number>`COUNT(*)`,
          revenue: sql<string>`COALESCE(SUM(${orders.grandTotal}), 0)`,
        })
        .from(orders)
        .where(gte(orders.createdAt, since))
        .groupBy(sql`DATE(${orders.createdAt})`)
        .orderBy(sql`DATE(${orders.createdAt})`);

      const topSelling = await db
        .select({
          productId: orderItems.productId,
          name: orderItems.productName,
          sku: orderItems.sku,
          totalSold: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`,
          totalRevenue: sql<string>`COALESCE(SUM(${orderItems.totalPrice}), 0)`,
        })
        .from(orderItems)
        .groupBy(orderItems.productId, orderItems.productName, orderItems.sku)
        .orderBy(desc(sql`SUM(${orderItems.quantity})`))
        .limit(10);

      const slowMoving = await db
        .select({
          id: products.id,
          name: products.name,
          sku: products.sku,
          stockQuantity: products.stockQuantity,
          totalSold: sql<number>`COALESCE((SELECT SUM(quantity) FROM order_items WHERE productId = ${products.id}), 0)`,
        })
        .from(products)
        .orderBy(sql`COALESCE((SELECT SUM(quantity) FROM order_items WHERE productId = ${products.id}), 0) ASC`)
        .limit(10);

      return { dailySales, topSelling, slowMoving };
    }),
});
