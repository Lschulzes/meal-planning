import {
  boolean,
  index,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const products = pgTable(
  "products",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    samsclubProductId: text("samsclub_product_id").unique().notNull(),
    sku: text("sku"),
    upc: text("upc"),
    gtin: text("gtin"),
    name: text("name").notNull(),
    brand: text("brand"),
    description: text("description"),
    category: text("category"),
    subcategory: text("subcategory"),
    imageUrl: text("image_url"),
    price: numeric("price", { precision: 10, scale: 2 }),
    pricePerUnit: numeric("price_per_unit", { precision: 10, scale: 2 }),
    unitSize: text("unit_size"),
    unitType: text("unit_type"),
    inStock: boolean("in_stock").default(true),
    zipCode: text("zip_code").notNull(),
    nutrition: jsonb("nutrition"),
    nutritionSource: text("nutrition_source"),
    usdaFdcId: text("usda_fdc_id"),
    tags: text("tags").array(),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("products_category_idx").on(table.category),
    index("products_zip_code_idx").on(table.zipCode),
    index("products_upc_idx").on(table.upc),
  ],
);

export const productsRelations = relations(products, ({ many }) => ({
  history: many(productHistory),
  mealPlanIngredients: many(mealPlanIngredients),
  shoppingListItems: many(shoppingListItems),
}));

// Forward references — resolved after all tables are defined
import { productHistory } from "./product-history";
import { mealPlanIngredients } from "./meal-plan-ingredients";
import { shoppingListItems } from "./shopping-list-items";
