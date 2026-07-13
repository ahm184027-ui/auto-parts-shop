import { z } from "zod";
import { eq } from "drizzle-orm";
import { createRouter, publicQuery, adminProcedure } from "./middleware";
import { getDb } from "./queries/connection";
import { websiteSettings, feedback, aiChatLogs } from "@db/schema";

export const settingsRouter = createRouter({
  // Get all settings
  getAll: publicQuery.query(async () => {
    const db = getDb();
    const all = await db.select().from(websiteSettings);
    const settings: Record<string, string> = {};
    for (const s of all) {
      settings[s.key] = s.value || "";
    }
    return settings;
  }),

  // Get single setting
  get: publicQuery
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(websiteSettings)
        .where(eq(websiteSettings.key, input.key))
        .limit(1);
      return result[0]?.value || "";
    }),

  // Set setting (admin)
  set: adminProcedure
    .input(z.object({ key: z.string(), value: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(websiteSettings)
        .where(eq(websiteSettings.key, input.key))
        .limit(1);
      
      if (existing[0]) {
        await db
          .update(websiteSettings)
          .set({ value: input.value })
          .where(eq(websiteSettings.key, input.key));
      } else {
        await db.insert(websiteSettings).values({
          key: input.key,
          value: input.value,
        });
      }
      
      return { success: true };
    }),

  // Bulk set settings (admin)
  setBulk: adminProcedure
    .input(z.record(z.string(), z.string()))
    .mutation(async ({ input }) => {
      const db = getDb();
      for (const [key, value] of Object.entries(input)) {
        const existing = await db
          .select()
          .from(websiteSettings)
          .where(eq(websiteSettings.key, key))
          .limit(1);
        
        if (existing[0]) {
          await db
            .update(websiteSettings)
            .set({ value })
            .where(eq(websiteSettings.key, key));
        } else {
          await db.insert(websiteSettings).values({ key, value });
        }
      }
      return { success: true };
    }),

  // Submit feedback
  submitFeedback: publicQuery
    .input(
      z.object({
        name: z.string(),
        email: z.string().optional(),
        phone: z.string().optional(),
        rating: z.number().min(1).max(5).default(5),
        message: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(feedback).values(input);
      return { success: true };
    }),

  // Save AI chat
  saveChat: publicQuery
    .input(
      z.object({
        sessionId: z.string(),
        userName: z.string().optional(),
        userPhone: z.string().optional(),
        userWhatsapp: z.string().optional(),
        userAddress: z.string().optional(),
        carBrand: z.string().optional(),
        carModel: z.string().optional(),
        carYear: z.string().optional(),
        requestedPart: z.string().optional(),
        messages: z.string(),
        isConverted: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(aiChatLogs).values(input);
      return { id: Number(result[0].insertId), success: true };
    }),
});
