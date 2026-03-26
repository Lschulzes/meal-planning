import { Skeleton } from "@meal-planning/ui/components/skeleton";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { CartTotal } from "@/components/shopping/cart-total";
import { ShoppingList } from "@/components/shopping/shopping-list";
import type { ShoppingListItem } from "@/lib/mock-data";
import { mockMealPlans, mockShoppingList } from "@/lib/mock-data";

export const Route = createFileRoute("/plan/$id/shopping-list")({
  component: ShoppingListPage,
});

function ShoppingListPage() {
  const { id } = Route.useParams();
  // TODO: wire to oRPC — fetch shopping list for plan
  const plan = mockMealPlans.find((p) => p.id === id);
  const [items, setItems] = useState<ShoppingListItem[]>(mockShoppingList);
  const loading = false;

  const handleToggle = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const total = items.reduce((sum, item) => sum + item.estimatedPrice, 0);
  const checkedCount = items.filter((i) => i.checked).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Shopping List"
        description={plan ? `For ${plan.name}` : "Your grocery shopping list"}
        breadcrumbs={[
          { label: "Dashboard", to: "/" },
          { label: plan?.name ?? "Plan", to: `/plan/${id}` },
          { label: "Shopping List" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Checklist */}
        <ShoppingList items={items} onToggle={handleToggle} />

        {/* Sidebar with total */}
        <div className="lg:sticky lg:top-6 h-fit">
          <CartTotal
            total={total}
            checkedCount={checkedCount}
            totalCount={items.length}
          />
        </div>
      </div>
    </div>
  );
}
