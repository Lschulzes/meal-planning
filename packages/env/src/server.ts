import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    CORS_ORIGIN: z.url(),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    SAMSCLUB_ZIP_CODE: z.string().default("60601"),
    SYNC_ENABLED: z
      .string()
      .default("true")
      .transform((v) => v === "true"),
    USDA_API_KEY: z.string().default(""),
    ANTHROPIC_API_KEY: z.string().default(""),
    PORT: z.coerce.number().default(3000),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: false,
});
