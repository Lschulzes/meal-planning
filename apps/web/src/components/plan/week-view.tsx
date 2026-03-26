import { Skeleton } from "@meal-planning/ui/components/skeleton";

import type { MealConcept } from "@/lib/mock-data";
import { DAYS_OF_WEEK, MEAL_TYPES } from "@/lib/mock-data";
import { ConceptCard } from "@/components/plan/concept-card";

interface WeekViewProps {
  concepts: MealConcept[];
  onSwap?: (id: string) => void;
  loading?: boolean;
}

export function WeekView({ concepts, onSwap, loading = false }: WeekViewProps) {
  const getMealForSlot = (day: number, mealType: string) =>
    concepts.find((c) => c.day === day && c.mealType === mealType);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-5 w-20" />
            {Array.from({ length: 3 }).map((_, j) => (
              <Skeleton key={j} className="h-28 w-full" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3 min-w-[900px] md:min-w-0">
        {DAYS_OF_WEEK.map((day, dayIdx) => (
          <div key={day} className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
              {day}
            </h3>
            {MEAL_TYPES.map((mealType) => {
              const concept = getMealForSlot(dayIdx, mealType);
              if (!concept) {
                return (
                  <div
                    key={mealType}
                    className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground"
                  >
                    No {mealType}
                  </div>
                );
              }
              return <ConceptCard key={concept.id} concept={concept} onSwap={onSwap} />;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
