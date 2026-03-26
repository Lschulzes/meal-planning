import { Checkbox } from "@meal-planning/ui/components/checkbox";

import type { ShoppingListItem } from "@/lib/mock-data";
import { PriceTag } from "@/components/shared/price-tag";

interface ShoppingListProps {
  items: ShoppingListItem[];
  onToggle: (id: string) => void;
}

export function ShoppingList({ items, onToggle }: ShoppingListProps) {
  // Group items by category
  const grouped = items.reduce<Record<string, ShoppingListItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort();

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <div key={category}>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {category}
          </h3>
          <div className="space-y-1">
            {grouped[category].map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                  item.checked ? "bg-muted/50" : "hover:bg-muted/30"
                }`}
              >
                <Checkbox
                  checked={item.checked}
                  onCheckedChange={() => onToggle(item.id)}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${
                      item.checked
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} {item.unit}
                  </p>
                </div>
                <PriceTag amount={item.estimatedPrice} size="sm" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
