import { z } from "zod";
import { eq, asc } from "drizzle-orm";
import { createRouter, publicQuery, adminProcedure } from "./middleware";
import { getDb } from "./queries/connection";
import { categories, subcategories, products } from "@db/schema";

export const categoryRouter = createRouter({
  // Get all categories
  list: publicQuery.query(async () => {
    const db = getDb();
    const cats = await db.select().from(categories).orderBy(asc(categories.sortOrder));
    
    // Get product counts for each category
    const result = [];
    for (const cat of cats) {
      const subs = await db
        .select()
        .from(subcategories)
        .where(eq(subcategories.categoryId, cat.id))
        .orderBy(asc(subcategories.sortOrder));
      
      const productCount = await db
        .select({ id: products.id })
        .from(products)
        .where(eq(products.categoryId, cat.id));

      result.push({
        ...cat,
        subcategories: subs,
        productCount: productCount.length,
      });
    }
    
    return result;
  }),

  // Get single category with subcategories
  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const cat = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, input.slug))
        .limit(1);
      
      if (!cat[0]) return null;
      
      const subs = await db
        .select()
        .from(subcategories)
        .where(eq(subcategories.categoryId, cat[0].id))
        .orderBy(asc(subcategories.sortOrder));
      
      return { ...cat[0], subcategories: subs };
    }),

  // Get subcategory by slug
  getSubcategory: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const sub = await db
        .select()
        .from(subcategories)
        .where(eq(subcategories.slug, input.slug))
        .limit(1);
      return sub[0] || null;
    }),

  // Create category (admin)
  create: adminProcedure
    .input(
      z.object({
        slug: z.string(),
        name: z.string(),
        description: z.string().optional(),
        image: z.string().optional(),
        sortOrder: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(categories).values(input);
      return { id: Number(result[0].insertId), success: true };
    }),

  // Update category (admin)
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        image: z.string().optional(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(categories).set(data).where(eq(categories.id, id));
      return { success: true };
    }),

  // Create subcategory (admin)
  createSub: adminProcedure
    .input(
      z.object({
        categoryId: z.number(),
        slug: z.string(),
        name: z.string(),
        description: z.string().optional(),
        sortOrder: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(subcategories).values(input);
      return { id: Number(result[0].insertId), success: true };
    }),
});
