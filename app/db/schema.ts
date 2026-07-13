import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  int,
  decimal,
  boolean,
  json,
  index,
  customType,
} from "drizzle-orm/mysql-core";

// MySQL LONGTEXT column — used for base64-encoded image/screenshot data,
// which regularly exceeds TEXT's 64KB cap even after client-side compression.
const longtext = customType<{ data: string }>({
  dataType() {
    return "longtext";
  },
});

// ==================== USERS ====================
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

// ==================== CATEGORIES ====================
export const categories = mysqlTable("categories", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  image: longtext("image"),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ==================== SUBCATEGORIES ====================
export const subcategories = mysqlTable("subcategories", {
  id: serial("id").primaryKey(),
  categoryId: bigint("categoryId", { mode: "number", unsigned: true }).notNull(),
  slug: varchar("slug", { length: 64 }).notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ==================== PRODUCTS ====================
export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  sku: varchar("sku", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  specifications: text("specifications"),
  image: longtext("image"),
  images: longtext("images"),
  categoryId: bigint("categoryId", { mode: "number", unsigned: true }).notNull(),
  subcategoryId: bigint("subcategoryId", { mode: "number", unsigned: true }),
  carBrand: varchar("carBrand", { length: 64 }).notNull(),
  carModel: varchar("carModel", { length: 64 }).notNull(),
  yearFrom: int("yearFrom"),
  yearTo: int("yearTo"),
  engineVariant: varchar("engineVariant", { length: 64 }),
  condition: mysqlEnum("condition", ["new", "used"]).default("new").notNull(),
  qualityType: mysqlEnum("qualityType", ["genuine", "oem", "aftermarket"]).default("aftermarket").notNull(),
  purchasePrice: decimal("purchasePrice", { precision: 12, scale: 2 }).default("0").notNull(),
  sellingPrice: decimal("sellingPrice", { precision: 12, scale: 2 }).notNull(),
  marketPriceMin: decimal("marketPriceMin", { precision: 12, scale: 2 }),
  marketPriceMax: decimal("marketPriceMax", { precision: 12, scale: 2 }),
  stockQuantity: int("stockQuantity").default(0).notNull(),
  minStockAlert: int("minStockAlert").default(5).notNull(),
  supplierName: varchar("supplierName", { length: 128 }),
  warranty: varchar("warranty", { length: 128 }),
  returnPolicy: varchar("returnPolicy", { length: 255 }),
  featured: boolean("featured").default(false).notNull(),
  stockStatus: mysqlEnum("stockStatus", ["in_stock", "low_stock", "out_of_stock"]).default("in_stock").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
}, (table) => [
  index("idx_category").on(table.categoryId),
  index("idx_subcategory").on(table.subcategoryId),
  index("idx_brand_model").on(table.carBrand, table.carModel),
  index("idx_featured").on(table.featured),
  index("idx_stock").on(table.stockStatus),
]);

// ==================== ORDERS ====================
export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("orderNumber", { length: 32 }).notNull().unique(),
  userId: bigint("userId", { mode: "number", unsigned: true }),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 20 }),
  email: varchar("email", { length: 320 }),
  address: text("address").notNull(),
  city: varchar("city", { length: 64 }).notNull(),
  deliveryMethod: mysqlEnum("deliveryMethod", ["pickup", "local_delivery", "courier"]).default("courier").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["easypaisa", "jazzcash", "bank_transfer", "cod"]).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "verified", "rejected"]).default("pending").notNull(),
  paymentScreenshot: longtext("paymentScreenshot"),
  paymentNotes: text("paymentNotes"),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  deliveryCharge: decimal("deliveryCharge", { precision: 10, scale: 2 }).default("0").notNull(),
  serviceFee: decimal("serviceFee", { precision: 10, scale: 2 }).default("0").notNull(),
  grandTotal: decimal("grandTotal", { precision: 12, scale: 2 }).notNull(),
  status: mysqlEnum("status", [
    "order_received",
    "payment_pending",
    "payment_verified",
    "confirmed",
    "packed",
    "out_for_delivery",
    "delivered",
    "cancelled",
    "returned",
  ]).default("order_received").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// ==================== ORDER ITEMS ====================
export const orderItems = mysqlTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: bigint("orderId", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  productImage: varchar("productImage", { length: 512 }),
  sku: varchar("sku", { length: 64 }).notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unitPrice", { precision: 12, scale: 2 }).notNull(),
  totalPrice: decimal("totalPrice", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ==================== WEBSITE SETTINGS ====================
export const websiteSettings = mysqlTable("website_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 64 }).notNull().unique(),
  value: longtext("value"),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// ==================== AI CHAT LOGS ====================
export const aiChatLogs = mysqlTable("ai_chat_logs", {
  id: serial("id").primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  userName: varchar("userName", { length: 128 }),
  userPhone: varchar("userPhone", { length: 20 }),
  userWhatsapp: varchar("userWhatsapp", { length: 20 }),
  userAddress: text("userAddress"),
  carBrand: varchar("carBrand", { length: 64 }),
  carModel: varchar("carModel", { length: 64 }),
  carYear: varchar("carYear", { length: 16 }),
  requestedPart: varchar("requestedPart", { length: 128 }),
  messages: text("messages").notNull(),
  isConverted: boolean("isConverted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ==================== FEEDBACK ====================
export const feedback = mysqlTable("feedback", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  rating: int("rating").default(5).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ==================== TYPE EXPORTS ====================
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export type Subcategory = typeof subcategories.$inferSelect;
export type InsertSubcategory = typeof subcategories.$inferInsert;

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

export type WebsiteSetting = typeof websiteSettings.$inferSelect;
export type InsertWebsiteSetting = typeof websiteSettings.$inferInsert;

export type AiChatLog = typeof aiChatLogs.$inferSelect;
export type InsertAiChatLog = typeof aiChatLogs.$inferInsert;

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = typeof feedback.$inferInsert;
