import type { NutritionInfo } from "@/lib/mock-data";

interface NutritionBadgeProps {
  nutrition: NutritionInfo;
  compact?: boolean;
}

export function NutritionBadge({ nutrition, compact = false }: NutritionBadgeProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{nutrition.calories} cal</span>
        <span className="text-border">|</span>
        <span>{nutrition.protein}g P</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-xs">
      <div className="flex flex-col items-center gap-0.5">
        <span className="font-semibold text-foreground">{nutrition.calories}</span>
        <span className="text-muted-foreground">cal</span>
      </div>
      <div className="w-px h-6 bg-border" />
      <div className="flex flex-col items-center gap-0.5">
        <span className="font-semibold text-primary">{nutrition.protein}g</span>
        <span className="text-muted-foreground">protein</span>
      </div>
      <div className="w-px h-6 bg-border" />
      <div className="flex flex-col items-center gap-0.5">
        <span className="font-semibold text-accent">{nutrition.carbs}g</span>
        <span className="text-muted-foreground">carbs</span>
      </div>
      <div className="w-px h-6 bg-border" />
      <div className="flex flex-col items-center gap-0.5">
        <span className="font-semibold text-foreground">{nutrition.fat}g</span>
        <span className="text-muted-foreground">fat</span>
      </div>
    </div>
  );
}
