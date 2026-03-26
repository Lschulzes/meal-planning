// Mock data for development — replace with oRPC calls

export interface UserPreferences {
  dietaryRestrictions: string[];
  allergies: string[];
  cuisinePreferences: string[];
  householdSize: number;
  weeklyBudget: number;
  maxPrepTime: number;
  cookingSkill: "beginner" | "intermediate" | "advanced";
  servingsPerMeal: number;
}

export interface MealConcept {
  id: string;
  name: string;
  cuisine: string;
  prepTime: number;
  estimatedCost: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  day: number; // 0-6
  emoji: string;
}

export interface Recipe {
  id: string;
  conceptId: string;
  name: string;
  cuisine: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  instructions: string[];
  ingredients: RecipeIngredient[];
  nutrition: NutritionInfo;
  estimatedCost: number;
}

export interface RecipeIngredient {
  name: string;
  quantity: string;
  unit: string;
  productId?: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealPlan {
  id: string;
  name: string;
  weekStartDate: string;
  status: "draft" | "active" | "completed";
  concepts: MealConcept[];
  recipes: Recipe[];
  totalCost: number;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  imageUrl?: string;
  unit: string;
  nutrition: NutritionInfo;
  inStock: boolean;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  category: string;
  checked: boolean;
  product?: Product;
  estimatedPrice: number;
}

export interface FeedbackEntry {
  id: string;
  recipeId: string;
  recipeName: string;
  rating: number;
  wouldRepeat: boolean;
  difficulty: number;
  actualPrepTime: number;
  tasteNotes: string;
  portionFeedback: "too-little" | "just-right" | "too-much";
  createdAt: string;
}

// ---------- Mock instances ----------

export const mockPreferences: UserPreferences = {
  dietaryRestrictions: ["gluten-free"],
  allergies: ["peanuts"],
  cuisinePreferences: ["Italian", "Mexican", "Thai"],
  householdSize: 2,
  weeklyBudget: 120,
  maxPrepTime: 45,
  cookingSkill: "intermediate",
  servingsPerMeal: 2,
};

export const mockConcepts: MealConcept[] = [
  { id: "c1", name: "Avocado Toast with Poached Eggs", cuisine: "American", prepTime: 15, estimatedCost: 4.5, mealType: "breakfast", day: 0, emoji: "🥑" },
  { id: "c2", name: "Chicken Caesar Salad", cuisine: "American", prepTime: 20, estimatedCost: 8.0, mealType: "lunch", day: 0, emoji: "🥗" },
  { id: "c3", name: "Lemon Herb Salmon", cuisine: "Italian", prepTime: 30, estimatedCost: 12.0, mealType: "dinner", day: 0, emoji: "🐟" },
  { id: "c4", name: "Greek Yogurt Parfait", cuisine: "Greek", prepTime: 5, estimatedCost: 3.0, mealType: "breakfast", day: 1, emoji: "🫐" },
  { id: "c5", name: "Black Bean Tacos", cuisine: "Mexican", prepTime: 25, estimatedCost: 6.5, mealType: "lunch", day: 1, emoji: "🌮" },
  { id: "c6", name: "Pad Thai with Shrimp", cuisine: "Thai", prepTime: 35, estimatedCost: 10.0, mealType: "dinner", day: 1, emoji: "🍜" },
  { id: "c7", name: "Smoothie Bowl", cuisine: "American", prepTime: 10, estimatedCost: 4.0, mealType: "breakfast", day: 2, emoji: "🍓" },
  { id: "c8", name: "Caprese Panini", cuisine: "Italian", prepTime: 15, estimatedCost: 7.0, mealType: "lunch", day: 2, emoji: "🧀" },
  { id: "c9", name: "Teriyaki Chicken Bowl", cuisine: "Japanese", prepTime: 30, estimatedCost: 9.0, mealType: "dinner", day: 2, emoji: "🍗" },
  { id: "c10", name: "Oatmeal with Berries", cuisine: "American", prepTime: 10, estimatedCost: 2.5, mealType: "breakfast", day: 3, emoji: "🥣" },
  { id: "c11", name: "Mediterranean Wrap", cuisine: "Greek", prepTime: 15, estimatedCost: 6.0, mealType: "lunch", day: 3, emoji: "🫓" },
  { id: "c12", name: "Butter Chicken", cuisine: "Indian", prepTime: 40, estimatedCost: 11.0, mealType: "dinner", day: 3, emoji: "🍛" },
  { id: "c13", name: "Banana Pancakes", cuisine: "American", prepTime: 20, estimatedCost: 3.5, mealType: "breakfast", day: 4, emoji: "🥞" },
  { id: "c14", name: "Pho", cuisine: "Thai", prepTime: 25, estimatedCost: 7.5, mealType: "lunch", day: 4, emoji: "🍲" },
  { id: "c15", name: "Grilled Steak & Veggies", cuisine: "American", prepTime: 35, estimatedCost: 14.0, mealType: "dinner", day: 4, emoji: "🥩" },
  { id: "c16", name: "Eggs Benedict", cuisine: "French", prepTime: 30, estimatedCost: 5.5, mealType: "breakfast", day: 5, emoji: "🍳" },
  { id: "c17", name: "Chicken Quesadilla", cuisine: "Mexican", prepTime: 20, estimatedCost: 6.0, mealType: "lunch", day: 5, emoji: "🫔" },
  { id: "c18", name: "Mushroom Risotto", cuisine: "Italian", prepTime: 45, estimatedCost: 9.5, mealType: "dinner", day: 5, emoji: "🍄" },
  { id: "c19", name: "French Toast", cuisine: "French", prepTime: 15, estimatedCost: 3.0, mealType: "breakfast", day: 6, emoji: "🍞" },
  { id: "c20", name: "Bibimbap", cuisine: "Korean", prepTime: 30, estimatedCost: 8.0, mealType: "lunch", day: 6, emoji: "🍚" },
  { id: "c21", name: "Margherita Pizza", cuisine: "Italian", prepTime: 40, estimatedCost: 8.5, mealType: "dinner", day: 6, emoji: "🍕" },
];

export const mockRecipes: Recipe[] = [
  {
    id: "r1",
    conceptId: "c3",
    name: "Lemon Herb Salmon",
    cuisine: "Italian",
    prepTime: 10,
    cookTime: 20,
    servings: 2,
    instructions: [
      "Pat salmon fillets dry and season with salt, pepper, and garlic powder.",
      "Mix fresh lemon juice, olive oil, minced garlic, and chopped dill.",
      "Place salmon on a lined baking sheet and pour the herb mixture over.",
      "Bake at 400 F for 18-20 minutes until flaky.",
      "Serve with steamed asparagus and a lemon wedge.",
    ],
    ingredients: [
      { name: "Salmon fillets", quantity: "2", unit: "pieces" },
      { name: "Lemon", quantity: "1", unit: "whole" },
      { name: "Fresh dill", quantity: "2", unit: "tbsp" },
      { name: "Garlic", quantity: "3", unit: "cloves" },
      { name: "Olive oil", quantity: "2", unit: "tbsp" },
      { name: "Asparagus", quantity: "1", unit: "bunch" },
    ],
    nutrition: { calories: 420, protein: 38, carbs: 8, fat: 26 },
    estimatedCost: 12.0,
  },
  {
    id: "r2",
    conceptId: "c6",
    name: "Pad Thai with Shrimp",
    cuisine: "Thai",
    prepTime: 15,
    cookTime: 20,
    servings: 2,
    instructions: [
      "Soak rice noodles in warm water for 20 minutes, then drain.",
      "Mix tamarind paste, fish sauce, brown sugar, and lime juice for the sauce.",
      "Heat oil in a wok over high heat. Cook shrimp 2 minutes per side, remove.",
      "Scramble eggs in the wok, then add noodles and sauce.",
      "Add shrimp back, toss with bean sprouts and green onions.",
      "Serve topped with crushed peanuts, lime wedge, and cilantro.",
    ],
    ingredients: [
      { name: "Rice noodles", quantity: "200", unit: "g" },
      { name: "Shrimp", quantity: "250", unit: "g" },
      { name: "Tamarind paste", quantity: "2", unit: "tbsp" },
      { name: "Fish sauce", quantity: "2", unit: "tbsp" },
      { name: "Eggs", quantity: "2", unit: "whole" },
      { name: "Bean sprouts", quantity: "1", unit: "cup" },
      { name: "Lime", quantity: "1", unit: "whole" },
    ],
    nutrition: { calories: 520, protein: 32, carbs: 62, fat: 16 },
    estimatedCost: 10.0,
  },
];

export const mockProducts: Product[] = [
  {
    id: "p1",
    name: "Atlantic Salmon Fillet",
    brand: "Fresh Catch",
    price: 8.99,
    category: "Seafood",
    unit: "lb",
    nutrition: { calories: 208, protein: 20, carbs: 0, fat: 13 },
    inStock: true,
  },
  {
    id: "p2",
    name: "Organic Brown Rice",
    brand: "Nature's Best",
    price: 3.49,
    category: "Grains",
    unit: "2 lb bag",
    nutrition: { calories: 216, protein: 5, carbs: 45, fat: 2 },
    inStock: true,
  },
  {
    id: "p3",
    name: "Extra Virgin Olive Oil",
    brand: "Terra Delyssa",
    price: 6.99,
    category: "Oils & Condiments",
    unit: "500ml",
    nutrition: { calories: 120, protein: 0, carbs: 0, fat: 14 },
    inStock: true,
  },
  {
    id: "p4",
    name: "Free-Range Eggs",
    brand: "Happy Hens",
    price: 4.29,
    category: "Dairy & Eggs",
    unit: "dozen",
    nutrition: { calories: 70, protein: 6, carbs: 0, fat: 5 },
    inStock: true,
  },
  {
    id: "p5",
    name: "Baby Spinach",
    brand: "Fresh Fields",
    price: 3.99,
    category: "Produce",
    unit: "5 oz bag",
    nutrition: { calories: 7, protein: 1, carbs: 1, fat: 0 },
    inStock: true,
  },
  {
    id: "p6",
    name: "Chicken Breast Boneless",
    brand: "Farm Pride",
    price: 5.49,
    category: "Meat & Poultry",
    unit: "lb",
    nutrition: { calories: 165, protein: 31, carbs: 0, fat: 4 },
    inStock: true,
  },
  {
    id: "p7",
    name: "Greek Yogurt Plain",
    brand: "Fage",
    price: 5.99,
    category: "Dairy & Eggs",
    unit: "32 oz",
    nutrition: { calories: 100, protein: 17, carbs: 6, fat: 1 },
    inStock: false,
  },
  {
    id: "p8",
    name: "Sourdough Bread",
    brand: "Artisan Bakery",
    price: 4.49,
    category: "Bakery",
    unit: "loaf",
    nutrition: { calories: 120, protein: 4, carbs: 24, fat: 1 },
    inStock: true,
  },
  {
    id: "p9",
    name: "Avocados",
    brand: "Green Gold",
    price: 1.29,
    category: "Produce",
    unit: "each",
    nutrition: { calories: 240, protein: 3, carbs: 13, fat: 22 },
    inStock: true,
  },
  {
    id: "p10",
    name: "Rice Noodles",
    brand: "Thai Kitchen",
    price: 2.99,
    category: "Grains",
    unit: "8 oz",
    nutrition: { calories: 190, protein: 3, carbs: 44, fat: 0 },
    inStock: true,
  },
];

export const mockShoppingList: ShoppingListItem[] = [
  { id: "s1", name: "Atlantic Salmon Fillet", quantity: "1.5", unit: "lb", category: "Seafood", checked: false, product: mockProducts[0], estimatedPrice: 13.49 },
  { id: "s2", name: "Organic Brown Rice", quantity: "1", unit: "bag", category: "Grains", checked: true, product: mockProducts[1], estimatedPrice: 3.49 },
  { id: "s3", name: "Extra Virgin Olive Oil", quantity: "1", unit: "bottle", category: "Oils & Condiments", checked: false, product: mockProducts[2], estimatedPrice: 6.99 },
  { id: "s4", name: "Free-Range Eggs", quantity: "1", unit: "dozen", category: "Dairy & Eggs", checked: false, product: mockProducts[3], estimatedPrice: 4.29 },
  { id: "s5", name: "Baby Spinach", quantity: "2", unit: "bags", category: "Produce", checked: true, product: mockProducts[4], estimatedPrice: 7.98 },
  { id: "s6", name: "Chicken Breast", quantity: "2", unit: "lb", category: "Meat & Poultry", checked: false, product: mockProducts[5], estimatedPrice: 10.98 },
  { id: "s7", name: "Greek Yogurt", quantity: "1", unit: "tub", category: "Dairy & Eggs", checked: false, product: mockProducts[6], estimatedPrice: 5.99 },
  { id: "s8", name: "Sourdough Bread", quantity: "1", unit: "loaf", category: "Bakery", checked: false, product: mockProducts[7], estimatedPrice: 4.49 },
  { id: "s9", name: "Avocados", quantity: "4", unit: "each", category: "Produce", checked: false, product: mockProducts[8], estimatedPrice: 5.16 },
  { id: "s10", name: "Rice Noodles", quantity: "2", unit: "packs", category: "Grains", checked: false, product: mockProducts[9], estimatedPrice: 5.98 },
  { id: "s11", name: "Fresh Dill", quantity: "1", unit: "bunch", category: "Produce", checked: false, estimatedPrice: 1.99 },
  { id: "s12", name: "Lemons", quantity: "4", unit: "each", category: "Produce", checked: false, estimatedPrice: 2.00 },
];

export const mockFeedback: FeedbackEntry[] = [
  {
    id: "f1",
    recipeId: "r1",
    recipeName: "Lemon Herb Salmon",
    rating: 5,
    wouldRepeat: true,
    difficulty: 2,
    actualPrepTime: 28,
    tasteNotes: "Absolutely delicious! The lemon and dill worked perfectly. Will make again for sure.",
    portionFeedback: "just-right",
    createdAt: "2026-03-18T19:30:00Z",
  },
  {
    id: "f2",
    recipeId: "r2",
    recipeName: "Pad Thai with Shrimp",
    rating: 4,
    wouldRepeat: true,
    difficulty: 3,
    actualPrepTime: 40,
    tasteNotes: "Great flavor but took longer than expected. Next time I'll prep the sauce in advance.",
    portionFeedback: "too-little",
    createdAt: "2026-03-19T20:15:00Z",
  },
];

export const mockMealPlans: MealPlan[] = [
  {
    id: "mp1",
    name: "Week of March 23",
    weekStartDate: "2026-03-23",
    status: "active",
    concepts: mockConcepts,
    recipes: mockRecipes,
    totalCost: 98.5,
    createdAt: "2026-03-22T10:00:00Z",
  },
  {
    id: "mp2",
    name: "Week of March 16",
    weekStartDate: "2026-03-16",
    status: "completed",
    concepts: mockConcepts.slice(0, 12),
    recipes: mockRecipes,
    totalCost: 105.0,
    createdAt: "2026-03-15T10:00:00Z",
  },
  {
    id: "mp3",
    name: "Week of March 9",
    weekStartDate: "2026-03-09",
    status: "completed",
    concepts: mockConcepts.slice(0, 15),
    recipes: mockRecipes,
    totalCost: 89.75,
    createdAt: "2026-03-08T10:00:00Z",
  },
];

export const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
export const MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const;

export const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Keto",
  "Paleo",
  "Nut-Free",
  "Halal",
  "Kosher",
] as const;

export const CUISINE_OPTIONS = [
  { name: "Mexican", flag: "\ud83c\uddf2\ud83c\uddfd" },
  { name: "Italian", flag: "\ud83c\uddee\ud83c\uddf9" },
  { name: "Thai", flag: "\ud83c\uddf9\ud83c\udded" },
  { name: "Japanese", flag: "\ud83c\uddef\ud83c\uddf5" },
  { name: "American", flag: "\ud83c\uddfa\ud83c\uddf8" },
  { name: "Indian", flag: "\ud83c\uddee\ud83c\uddf3" },
  { name: "Korean", flag: "\ud83c\uddf0\ud83c\uddf7" },
  { name: "Greek", flag: "\ud83c\uddec\ud83c\uddf7" },
  { name: "Chinese", flag: "\ud83c\udde8\ud83c\uddf3" },
  { name: "French", flag: "\ud83c\uddeb\ud83c\uddf7" },
] as const;

export const PRODUCT_CATEGORIES = [
  "Produce",
  "Meat & Poultry",
  "Seafood",
  "Dairy & Eggs",
  "Grains",
  "Oils & Condiments",
  "Bakery",
  "Frozen",
  "Snacks",
  "Beverages",
] as const;
