import { Button } from "@meal-planning/ui/components/button";
import { Card, CardContent } from "@meal-planning/ui/components/card";
import { Clock, RefreshCw } from "lucide-react";

import type { MealConcept } from "@/lib/mock-data";
import { PriceTag } from "@/components/shared/price-tag";

interface ConceptCardProps {
  concept: MealConcept;
  onSwap?: (id: string) => void;
}

export function ConceptCard({ concept, onSwap }: ConceptCardProps) {
  return (
    <Card className="group relative hover:ring-primary/30 transition-all">
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{concept.emoji}</span>
            <div className="min-w-0">
              <h4 className="text-sm font-medium leading-tight truncate">
                {concept.name}
              </h4>
              <p className="text-xs text-muted-foreground">{concept.cuisine}</p>
            </div>
          </div>
          {onSwap && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onSwap(concept.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            >
              <RefreshCw className="size-3.5" />
            </Button>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="size-3" />
            <span>{concept.prepTime} min</span>
          </div>
          <PriceTag amount={concept.estimatedCost} size="sm" />
        </div>
      </CardContent>
    </Card>
  );
}
