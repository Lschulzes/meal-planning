import { drizzle } from "drizzle-orm/node-postgres";
import { userPreferences } from "./schema/user-preferences";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:password@localhost:5432/meal-planning";

async function seed() {
  const db = drizzle(DATABASE_URL);

  console.log("Seeding default user preferences...");

  await db
    .insert(userPreferences)
    .values({
      householdSize: 2,
      dietaryRestrictions: [],
      allergies: [],
      cuisinePreferences: ["american", "mexican", "italian", "asian"],
      dislikedIngredients: [],
      weeklyBudget: "150.00",
      maxPrepTimeMinutes: 45,
      cookingSkill: "intermediate",
      preferredMealTypes: ["dinner"],
      servingsPerMeal: 2,
      notes: null,
    })
    .onConflictDoNothing();

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
