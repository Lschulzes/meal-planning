import { Button } from "@meal-planning/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@meal-planning/ui/components/card";
import { ChevronDown, ChevronUp, Clock, Users } from "lucide-react";
import { useState } from "react";

import type { Recipe } from "@/lib/mock-data";
import { NutritionBadge } from "@/components/shared/nutrition-badge";
import { PriceTag } from "@/components/shared/price-tag";

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="font-display text-base font-semibold">
              {recipe.name}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{recipe.cuisine}</p>
          </div>
          <PriceTag amount={recipe.estimatedCost} size="md" />
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" />
            {recipe.prepTime + recipe.cookTime} min
          </span>
          <span className="flex items-center gap-1">
            <Users className="size-3.5" />
            {recipe.servings} servings
          </span>
        </div>
        <div className="pt-2">
          <NutritionBadge nutrition={recipe.nutrition} />
        </div>
      </CardHeader>

      <CardContent>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between"
          onClick={() => setExpanded(!expanded)}
        >
          <span>{expanded ? "Hide details" : "Show recipe details"}</span>
          {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </Button>

        {expanded && (
          <div className="mt-4 space-y-4">
            {/* Ingredients */}
            <div>
              <h5 className="text-sm font-medium mb-2">Ingredients</h5>
              <ul className="space-y-1">
                {recipe.ingredients.map((ing) => (
                  <li key={ing.name} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span>
                      {ing.quantity} {ing.unit} {ing.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div>
              <h5 className="text-sm font-medium mb-2">Instructions</h5>
              <ol className="space-y-2">
                {recipe.instructions.map((step, idx) => (
                  <li key={step} className="flex gap-3 text-sm">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-muted-foreground pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
