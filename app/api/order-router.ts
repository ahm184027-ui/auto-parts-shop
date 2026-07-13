import { z } from "zod";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, adminProcedure } from "./middleware";
import { getDb } from "./queries/connection";
import { orders, orderItems, products } from "@db/schema";

export const orderRouter = createRouter({
  // Create new order
  create: publicQuery
    .input(
      z.object({
        fullName: z.string(),
        phone: z.string(),
        whatsapp: z.string().optional(),
        email: z.string().optional(),
        address: z.string(),
        city: z.string(),
        deliveryMethod: z.enum(["pickup", "local_delivery", "courier"]),
        paymentMethod: z.enum(["easypaisa", "jazzcash", "bank_transfer", "cod"]),
        items: z.array(
          z.object({
            productId: z.number(),
            name: z.string(),
            image: z.string().optional(),
            sku: z.string(),
            quantity: z.number(),
            unitPrice: z.number(),
            totalPrice: z.number(),
          })
        ),
        subtotal: z.number(),
        deliveryCharge: z.number().default(0),
        serviceFee: z.number().default(0),
        grandTotal: z.number(),
        notes: z.string().optional(),
        paymentScreenshot: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Verify stock availability for every line item before committing the
      // order — prevents overselling from stale carts or race conditions.
      for (const item of input.items) {
        const [product] = await db
          .select({ stockQuantity: products.stockQuantity, name: products.name })
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);

        if (!product) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `"${item.name}" is no longer available.` });
        }
        if (product.stockQuantity < item.quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Only ${product.stockQuantity} unit(s) of "${product.name}" left in stock. Please update the quantity in your cart.`,
          });
        }
      }

      // Generate order number
      const orderNumber = `APS${Date.now().toString(36).toUpperCase()}`;

      // Create order
      const result = await db.insert(orders).values({
        orderNumber,
        fullName: input.fullName,
        phone: input.phone,
        whatsapp: input.whatsapp || null,
        email: input.email || null,
        address: input.address,
        city: input.city,
        deliveryMethod: input.deliveryMethod,
        paymentMethod: input.paymentMethod,
        paymentScreenshot: input.paymentScreenshot || null,
        subtotal: String(input.subtotal),
        deliveryCharge: String(input.deliveryCharge),
        serviceFee: String(input.serviceFee),
        grandTotal: String(input.grandTotal),
        notes: input.notes || null,
      });

      const orderId = Number(result[0].insertId);

      // Create order items
      for (const item of input.items) {
        await db.insert(orderItems).values({
          orderId,
          productId: item.productId,
          productName: item.name,
          productImage: item.image || null,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: String(item.unitPrice),
          totalPrice: String(item.totalPrice),
        });

        // Update stock and recompute stock status
        await db
          .update(products)
          .set({
            stockQuantity: sql`stockQuantity - ${item.quantity}`,
          })
          .where(eq(products.id, item.productId));

        const updated = await db
          .select({ stockQuantity: products.stockQuantity, minStockAlert: products.minStockAlert })
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);

        if (updated[0]) {
          const qty = updated[0].stockQuantity;
          const stockStatus: "in_stock" | "low_stock" | "out_of_stock" =
            qty <= 0 ? "out_of_stock" : qty <= updated[0].minStockAlert ? "low_stock" : "in_stock";
          await db.update(products).set({ stockStatus }).where(eq(products.id, item.productId));
        }
      }

      return { orderId, orderNumber, success: true };
    }),

  // Get order by number and phone
  track: publicQuery
    .input(
      z.object({
        orderNumber: z.string(),
        phone: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const order = await db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.orderNumber, input.orderNumber),
            eq(orders.phone, input.phone)
          )
        )
        .limit(1);
      
      if (!order[0]) return null;
      
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order[0].id));
      
      return { ...order[0], items };
    }),

  // Get all orders (admin)
  list: adminProcedure
    .input(
      z.object({
        status: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const filters = input || {};
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const offset = (page - 1) * limit;

      let conditions;
      if (filters.status) {
        conditions = eq(orders.status, filters.status as any);
      }

      const items = await db
        .select()
        .from(orders)
        .where(conditions)
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(orders)
        .where(conditions);

      return {
        items,
        total: countResult[0]?.count || 0,
        page,
        totalPages: Math.ceil((countResult[0]?.count || 0) / limit),
      };
    }),

  // Get single order with items (admin)
  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.id))
        .limit(1);
      
      if (!order[0]) return null;
      
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, input.id));
      
      return { ...order[0], items };
    }),

  // Update order status (admin)
  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum([
          "order_received",
          "payment_pending",
          "payment_verified",
          "confirmed",
          "packed",
          "out_for_delivery",
          "delivered",
          "cancelled",
          "returned",
        ]),
        paymentStatus: z.enum(["pending", "verified", "rejected"]).optional(),
        paymentNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(orders).set(data).where(eq(orders.id, id));
      return { success: true };
    }),

  // Update payment verification status only (admin)
  updatePayment: adminProcedure
    .input(
      z.object({
        id: z.number(),
        paymentStatus: z.enum(["pending", "verified", "rejected"]),
        paymentNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(orders).set(data).where(eq(orders.id, id));
      return { success: true };
    }),

  // Get order statistics (admin)
  getStats: adminProcedure.query(async () => {
    const db = getDb();
    
    const totalOrders = await db.select({ count: sql<number>`COUNT(*)` }).from(orders);
    const totalRevenue = await db.select({ total: sql<string>`COALESCE(SUM(grandTotal), 0)` }).from(orders);
    
    const statusCounts = await db
      .select({
        status: orders.status,
        count: sql<number>`COUNT(*)`,
      })
      .from(orders)
      .groupBy(orders.status);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(orders)
      .where(gte(orders.createdAt, today));
    
    return {
      totalOrders: totalOrders[0]?.count || 0,
      totalRevenue: totalRevenue[0]?.total || "0",
      todayOrders: todayOrders[0]?.count || 0,
      statusCounts,
    };
  }),
});
