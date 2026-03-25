import {
  boolean,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { shoppingLists } from "./shopping-lists";
import { products } from "./products";

export const shoppingListItems = pgTable("shopping_list_items", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  shoppingListId: uuid("shopping_list_id")
    .notNull()
    .references(() => shoppingLists.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => products.id),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").default(1),
  estimatedCost: numeric("estimated_cost", { precision: 10, scale: 2 }),
  purchased: boolean("purchased").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const shoppingListItemsRelations = relations(
  shoppingListItems,
  ({ one }) => ({
    shoppingList: one(shoppingLists, {
      fields: [shoppingListItems.shoppingListId],
      references: [shoppingLists.id],
    }),
    product: one(products, {
      fields: [shoppingListItems.productId],
      references: [products.id],
    }),
  }),
);
