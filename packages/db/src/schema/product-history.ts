import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { products } from "./products";

export const productHistory = pgTable(
  "product_history",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }),
    pricePerUnit: numeric("price_per_unit", { precision: 10, scale: 2 }),
    inStock: boolean("in_stock"),
    snapshot: jsonb("snapshot"),
    changedAt: timestamp("changed_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("product_history_product_version_idx").on(
      table.productId,
      table.version,
    ),
    index("product_history_changed_at_idx").on(table.changedAt),
  ],
);

export const productHistoryRelations = relations(
  productHistory,
  ({ one }) => ({
    product: one(products, {
      fields: [productHistory.productId],
      references: [products.id],
    }),
  }),
);
