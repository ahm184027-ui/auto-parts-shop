import { z } from "zod";
import { eq, desc, sql, gte } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { products, orders, aiChatLogs, feedback } from "@db/schema";

export const adminRouter = createRouter({
  // Dashboard statistics
  getDashboardStats: publicQuery.query(async () => {
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
  getInventory: publicQuery
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
  getChatLogs: publicQuery
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
  getFeedback: publicQuery
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
  updateStock: publicQuery
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
  getProfitReport: publicQuery.query(async () => {
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
});
