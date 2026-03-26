import { Button } from "@meal-planning/ui/components/button";
import { Card, CardContent } from "@meal-planning/ui/components/card";
import { Skeleton } from "@meal-planning/ui/components/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar, ChevronRight, Clock } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PriceTag } from "@/components/shared/price-tag";
import { mockMealPlans } from "@/lib/mock-data";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const navigate = useNavigate();
  // TODO: wire to oRPC — fetch all meal plans
  const plans = mockMealPlans;
  const loading = false;

  if (loading) {
    return (
      <div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-64 mb-6" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full mb-3" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Plan History"
        description="Browse and manage your past meal plans."
        actions={
          <Button onClick={() => navigate({ to: "/plan/new" })} size="sm">
            New Plan
          </Button>
        }
      />

      {plans.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No meal plans yet"
          description="Create your first meal plan to get started."
          actionLabel="Create Plan"
          onAction={() => navigate({ to: "/plan/new" })}
        />
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className="cursor-pointer hover:ring-primary/30 transition-all"
              onClick={() => navigate({ to: "/plan/$id", params: { id: plan.id } })}
            >
              <CardContent className="flex items-center gap-4 py-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
                  <Calendar className="size-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium truncate">{plan.name}</h3>
                    <StatusBadge status={plan.status} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span>{plan.concepts.length} meals</span>
                    <span>{plan.recipes.length} recipes</span>
                    <PriceTag amount={plan.totalCost} size="sm" />
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {new Date(plan.createdAt).toLocaleDateString()}
                  </span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-primary/10 text-primary",
    completed: "bg-muted text-muted-foreground",
    draft: "bg-accent/10 text-accent",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
        styles[status] ?? styles.draft
      }`}
    >
      {status}
    </span>
  );
}
