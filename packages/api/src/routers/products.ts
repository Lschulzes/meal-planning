import { z } from "zod";
import { and, eq, ilike, or, sql } from "drizzle-orm";
import { products } from "@meal-planning/db/schema";

import { publicProcedure } from "../index";

export const productsRouter = {
  /** List products with pagination and filters */
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        category: z.string().optional(),
        subcategory: z.string().optional(),
        inStock: z.boolean().optional(),
        search: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }),
    )
    .handler(async ({ context, input }) => {
      const conditions = [];

      if (input.category) {
        conditions.push(eq(products.category, input.category));
      }
      if (input.subcategory) {
        conditions.push(eq(products.subcategory, input.subcategory));
      }
      if (input.inStock !== undefined) {
        conditions.push(eq(products.inStock, input.inStock));
      }
      if (input.search) {
        const term = `%${input.search}%`;
        conditions.push(
          or(
            ilike(products.name, term),
            ilike(products.brand, term),
            ilike(products.description, term),
          ),
        );
      }
      if (input.tags && input.tags.length > 0) {
        conditions.push(
          sql`${products.tags} && ${input.tags}`,
        );
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, countResult] = await Promise.all([
        context.db
          .select()
          .from(products)
          .where(where)
          .limit(input.limit)
          .offset(input.offset)
          .orderBy(products.name),
        context.db
          .select({ count: sql<number>`count(*)` })
          .from(products)
          .where(where),
      ]);

      return {
        items,
        total: Number(countResult[0]?.count ?? 0),
        limit: input.limit,
        offset: input.offset,
      };
    }),

  /** Get a single product by ID */
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      const result = await context.db
        .select()
        .from(products)
        .where(eq(products.id, input.id))
        .limit(1);

      return result[0] ?? null;
    }),

  /** Search products by text query */
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .handler(async ({ context, input }) => {
      const term = `%${input.query}%`;

      return context.db
        .select()
        .from(products)
        .where(
          or(
            ilike(products.name, term),
            ilike(products.brand, term),
            ilike(products.description, term),
          ),
        )
        .limit(input.limit)
        .orderBy(products.name);
    }),

  /** Get distinct categories with product counts */
  categories: publicProcedure.handler(async ({ context }) => {
    const result = await context.db
      .select({
        category: products.category,
        count: sql<number>`count(*)`,
      })
      .from(products)
      .groupBy(products.category)
      .orderBy(products.category);

    return result.filter((r) => r.category !== null);
  }),

  /** Get products filtered by tag */
  byTag: publicProcedure
    .input(
      z.object({
        tag: z.string(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }),
    )
    .handler(async ({ context, input }) => {
      return context.db
        .select()
        .from(products)
        .where(sql`${products.tags} @> ARRAY[${input.tag}]::text[]`)
        .limit(input.limit)
        .offset(input.offset)
        .orderBy(products.name);
    }),
};
