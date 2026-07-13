import { z } from "zod";
import { eq, and, like, gte, lte, inArray, desc, asc, sql } from "drizzle-orm";
import { createRouter, publicQuery, adminProcedure } from "./middleware";
import { getDb } from "./queries/connection";
import { products, categories, subcategories } from "@db/schema";

export const productRouter = createRouter({
  // Get all products with filters
  list: publicQuery
    .input(
      z.object({
        categoryId: z.number().optional(),
        subcategoryId: z.number().optional(),
        brand: z.string().optional(),
        model: z.string().optional(),
        year: z.number().optional(),
        qualityType: z.string().optional(),
        condition: z.string().optional(),
        search: z.string().optional(),
        featured: z.boolean().optional(),
        sortBy: z.enum(["name", "price_asc", "price_desc", "newest"]).default("newest"),
        page: z.number().default(1),
        limit: z.number().default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const filters = input || {};
      const conditions = [];

      if (filters.categoryId) {
        conditions.push(eq(products.categoryId, filters.categoryId));
      }
      if (filters.subcategoryId) {
        conditions.push(eq(products.subcategoryId, filters.subcategoryId));
      }
      if (filters.brand) {
        conditions.push(eq(products.carBrand, filters.brand));
      }
      if (filters.model) {
        conditions.push(eq(products.carModel, filters.model));
      }
      if (filters.year) {
        conditions.push(
          and(
            gte(products.yearFrom, filters.year),
            lte(products.yearTo, filters.year)
          )
        );
      }
      if (filters.qualityType) {
        conditions.push(eq(products.qualityType, filters.qualityType as "genuine" | "oem" | "aftermarket"));
      }
      if (filters.condition) {
        conditions.push(eq(products.condition, filters.condition as "new" | "used"));
      }
      if (filters.search) {
        // Match each word independently (AND across words, OR across fields) so
        // multi-word queries like "Toyota Corolla brake pads" still match a name
        // like "Toyota Corolla Front Brake Pads" even though the words aren't
        // contiguous in that exact order.
        const words = filters.search.trim().split(/\s+/).filter(Boolean);
        for (const word of words) {
          const term = `%${word}%`;
          conditions.push(
            sql`(${products.name} LIKE ${term} OR ${products.sku} LIKE ${term} OR ${products.carBrand} LIKE ${term} OR ${products.carModel} LIKE ${term} OR ${products.description} LIKE ${term})`
          );
        }
      }
      if (filters.featured) {
        conditions.push(eq(products.featured, true));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Build order by
      let orderBy;
      switch (filters.sortBy) {
        case "price_asc":
          orderBy = asc(products.sellingPrice);
          break;
        case "price_desc":
          orderBy = desc(products.sellingPrice);
          break;
        case "name":
          orderBy = asc(products.name);
          break;
        default:
          orderBy = desc(products.createdAt);
      }

      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const offset = (page - 1) * limit;

      const items = await db
        .select()
        .from(products)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(products)
        .where(whereClause);

      const total = countResult[0]?.count || 0;

      return {
        items,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }),

  // Get single product by slug
  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(products)
        .where(eq(products.slug, input.slug))
        .limit(1);
      return result[0] || null;
    }),

  // Get single product by ID
  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(products)
        .where(eq(products.id, input.id))
        .limit(1);
      return result[0] || null;
    }),

  // Get featured products
  getFeatured: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(products)
      .where(eq(products.featured, true))
      .limit(8);
  }),

  // Get related products
  getRelated: publicQuery
    .input(z.object({ productId: z.number(), categoryId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(products)
        .where(
          and(
            eq(products.categoryId, input.categoryId),
            sql`${products.id} != ${input.productId}`
          )
        )
        .limit(4);
    }),

  // Search products
  search: publicQuery
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = getDb();
      const words = input.query.trim().split(/\s+/).filter(Boolean);
      const wordConditions = words.map((word) => {
        const term = `%${word}%`;
        return sql`(${products.name} LIKE ${term} OR ${products.carBrand} LIKE ${term} OR ${products.carModel} LIKE ${term} OR ${products.sku} LIKE ${term} OR ${products.description} LIKE ${term})`;
      });
      return db
        .select()
        .from(products)
        .where(and(...wordConditions))
        .limit(20);
    }),

  // Get all unique brands
  getBrands: publicQuery.query(async () => {
    const db = getDb();
    const result = await db
      .select({ brand: products.carBrand })
      .from(products)
      .groupBy(products.carBrand);
    return result.map((r) => r.brand);
  }),

  // Get models for a brand
  getModels: publicQuery
    .input(z.object({ brand: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select({ model: products.carModel })
        .from(products)
        .where(eq(products.carBrand, input.brand))
        .groupBy(products.carModel);
      return result.map((r) => r.model);
    }),

  // Create product (admin)
  create: adminProcedure
    .input(
      z.object({
        sku: z.string(),
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        specifications: z.string().optional(),
        image: z.string().optional(),
        images: z.string().optional(),
        categoryId: z.number(),
        subcategoryId: z.number().optional(),
        carBrand: z.string(),
        carModel: z.string(),
        yearFrom: z.number().optional(),
        yearTo: z.number().optional(),
        engineVariant: z.string().optional(),
        condition: z.enum(["new", "used"]).default("new"),
        qualityType: z.enum(["genuine", "oem", "aftermarket"]).default("aftermarket"),
        purchasePrice: z.string().or(z.number()).default("0"),
        sellingPrice: z.string().or(z.number()),
        marketPriceMin: z.string().or(z.number()).optional(),
        marketPriceMax: z.string().or(z.number()).optional(),
        stockQuantity: z.number().default(0),
        minStockAlert: z.number().default(5),
        supplierName: z.string().optional(),
        warranty: z.string().optional(),
        returnPolicy: z.string().optional(),
        featured: z.boolean().default(false),
        stockStatus: z.enum(["in_stock", "low_stock", "out_of_stock"]).default("in_stock"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(products).values({
        ...input,
        purchasePrice: String(input.purchasePrice),
        sellingPrice: String(input.sellingPrice),
        marketPriceMin: input.marketPriceMin ? String(input.marketPriceMin) : undefined,
        marketPriceMax: input.marketPriceMax ? String(input.marketPriceMax) : undefined,
      });
      return { id: Number(result[0].insertId), success: true };
    }),

  // Update product (admin)
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        sku: z.string().optional(),
        name: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        specifications: z.string().optional(),
        image: z.string().optional(),
        images: z.string().optional(),
        categoryId: z.number().optional(),
        subcategoryId: z.number().optional(),
        carBrand: z.string().optional(),
        carModel: z.string().optional(),
        yearFrom: z.number().optional(),
        yearTo: z.number().optional(),
        engineVariant: z.string().optional(),
        condition: z.enum(["new", "used"]).optional(),
        qualityType: z.enum(["genuine", "oem", "aftermarket"]).optional(),
        purchasePrice: z.string().or(z.number()).optional(),
        sellingPrice: z.string().or(z.number()).optional(),
        marketPriceMin: z.string().or(z.number()).optional(),
        marketPriceMax: z.string().or(z.number()).optional(),
        stockQuantity: z.number().optional(),
        minStockAlert: z.number().optional(),
        supplierName: z.string().optional(),
        warranty: z.string().optional(),
        returnPolicy: z.string().optional(),
        featured: z.boolean().optional(),
        stockStatus: z.enum(["in_stock", "low_stock", "out_of_stock"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = { ...data };
      if (data.purchasePrice !== undefined) updateData.purchasePrice = String(data.purchasePrice);
      if (data.sellingPrice !== undefined) updateData.sellingPrice = String(data.sellingPrice);
      if (data.marketPriceMin !== undefined) updateData.marketPriceMin = data.marketPriceMin ? String(data.marketPriceMin) : null;
      if (data.marketPriceMax !== undefined) updateData.marketPriceMax = data.marketPriceMax ? String(data.marketPriceMax) : null;
      await db.update(products).set(updateData).where(eq(products.id, id));
      return { success: true };
    }),

  // Delete product (admin)
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(products).where(eq(products.id, input.id));
      return { success: true };
    }),
});
