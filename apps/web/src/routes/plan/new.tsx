import { Button } from "@meal-planning/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@meal-planning/ui/components/card";
import { Skeleton } from "@meal-planning/ui/components/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Check, ChefHat, Loader2, ShoppingCart, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { RecipeCard } from "@/components/plan/recipe-card";
import { WeekView } from "@/components/plan/week-view";
import { PriceTag } from "@/components/shared/price-tag";
import { mockConcepts, mockRecipes } from "@/lib/mock-data";

export const Route = createFileRoute("/plan/new")({
  component: NewPlanPage,
});

type PlanStep = "generating" | "concepts" | "recipes" | "review";

function NewPlanPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<PlanStep>("generating");
  const [concepts, setConcepts] = useState(mockConcepts);

  // Simulate generation delay
  useEffect(() => {
    if (step === "generating") {
      const timer = setTimeout(() => setStep("concepts"), 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleSwap = useCallback((id: string) => {
    // TODO: wire to oRPC — request alternate meal concept
    setConcepts((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, name: "Swapped Meal", emoji: "🔄" } : c
      )
    );
  }, []);

  const totalCost = concepts.reduce((sum, c) => sum + c.estimatedCost, 0);

  return (
    <div>
      <PageHeader
        title="Create Meal Plan"
        description="Let AI generate a personalized weekly meal plan for you."
        breadcrumbs={[
          { label: "Dashboard", to: "/" },
          { label: "New Meal Plan" },
        ]}
      />

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {(["generating", "concepts", "recipes", "review"] as const).map((s, idx) => {
          const labels = ["Generate", "Choose Meals", "Recipes", "Review"];
          const isCurrent = s === step;
          const isPast =
            ["generating", "concepts", "recipes", "review"].indexOf(step) > idx;
          return (
            <div key={s} className="flex-1">
              <div
                className={`h-1.5 rounded-full transition-colors ${
                  isCurrent || isPast ? "bg-primary" : "bg-muted"
                }`}
              />
              <p
                className={`text-[10px] mt-1 font-medium ${
                  isCurrent
                    ? "text-primary"
                    : isPast
                      ? "text-primary/60"
                      : "text-muted-foreground"
                }`}
              >
                {labels[idx]}
              </p>
            </div>
          );
        })}
      </div>

      {/* Step content */}
      {step === "generating" && <GeneratingView />}
      {step === "concepts" && (
        <ConceptsView
          concepts={concepts}
          totalCost={totalCost}
          onSwap={handleSwap}
          onNext={() => setStep("recipes")}
        />
      )}
      {step === "recipes" && (
        <RecipesView
          onNext={() => setStep("review")}
          onBack={() => setStep("concepts")}
        />
      )}
      {step === "review" && (
        <ReviewView
          totalCost={totalCost}
          mealCount={concepts.length}
          onBack={() => setStep("recipes")}
          onSave={() => {
            // TODO: wire to oRPC — save meal plan
            navigate({ to: "/plan/$id", params: { id: "mp1" } });
          }}
        />
      )}
    </div>
  );
}

function GeneratingView() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="relative mb-8">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10">
          <ChefHat className="size-10 text-primary" />
        </div>
        <Loader2 className="absolute -top-2 -right-2 size-8 text-primary animate-spin" />
      </div>
      <h2 className="font-display text-xl font-semibold mb-2">Generating meal ideas...</h2>
      <p className="text-sm text-muted-foreground max-w-sm">
        Our AI is crafting a personalized week of meals based on your preferences, budget,
        and available products.
      </p>
      <div className="grid grid-cols-3 gap-4 mt-8 w-full max-w-md">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ConceptsView({
  concepts,
  totalCost,
  onSwap,
  onNext,
}: {
  concepts: typeof mockConcepts;
  totalCost: number;
  onSwap: (id: string) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-lg font-semibold">Your Meal Plan</h2>
          <p className="text-sm text-muted-foreground">
            Hover over a meal and click the swap icon to get a different suggestion.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Estimated total</p>
          <PriceTag amount={totalCost} size="lg" />
        </div>
      </div>

      <WeekView concepts={concepts} onSwap={onSwap} />

      <div className="flex justify-end mt-6">
        <Button onClick={onNext} className="gap-2">
          <Sparkles className="size-4" />
          Generate Recipes
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function RecipesView({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  // TODO: wire to oRPC — fetch generated recipes
  const recipes = mockRecipes;

  return (
    <div>
      <div className="mb-4">
        <h2 className="font-display text-lg font-semibold">Generated Recipes</h2>
        <p className="text-sm text-muted-foreground">
          Review the full recipes with instructions and ingredients.
        </p>
      </div>

      <div className="space-y-4">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      <div className="flex items-center justify-between mt-6">
        <Button variant="ghost" onClick={onBack}>
          Back to meal ideas
        </Button>
        <Button onClick={onNext} className="gap-2">
          Review & Save
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function ReviewView({
  totalCost,
  mealCount,
  onBack,
  onSave,
}: {
  totalCost: number;
  mealCount: number;
  onBack: () => void;
  onSave: () => void;
}) {
  return (
    <div>
      <h2 className="font-display text-lg font-semibold mb-4">Plan Summary</h2>

      <Card className="mb-6">
        <CardContent className="space-y-3 py-4">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Meals planned</span>
            <span className="text-sm font-medium">{mealCount}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Recipes generated</span>
            <span className="text-sm font-medium">{mockRecipes.length}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-muted-foreground">Estimated total cost</span>
            <PriceTag amount={totalCost} size="md" />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          Back to recipes
        </Button>
        <Button onClick={onSave} className="gap-2">
          <ShoppingCart className="size-4" />
          Save & Create Shopping List
        </Button>
      </div>
    </div>
  );
}
