import { Button } from "@meal-planning/ui/components/button";
import { Card, CardContent } from "@meal-planning/ui/components/card";
import { Skeleton } from "@meal-planning/ui/components/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar, ClipboardList, MessageSquare, ShoppingCart } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { RecipeCard } from "@/components/plan/recipe-card";
import { WeekView } from "@/components/plan/week-view";
import { EmptyState } from "@/components/shared/empty-state";
import { PriceTag } from "@/components/shared/price-tag";
import { mockMealPlans } from "@/lib/mock-data";

export const Route = createFileRoute("/plan/$id/")({
  component: MealPlanPage,
});

function MealPlanPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "recipes">("overview");

  // TODO: wire to oRPC — fetch meal plan by id
  const plan = mockMealPlans.find((p) => p.id === id);
  const loading = false;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="grid grid-cols-7 gap-3 mt-6">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <EmptyState
        icon={Calendar}
        title="Meal plan not found"
        description="The meal plan you're looking for doesn't exist or has been removed."
        actionLabel="Go to Dashboard"
        onAction={() => navigate({ to: "/" })}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title={plan.name}
        description={`Status: ${plan.status} | Created ${new Date(plan.createdAt).toLocaleDateString()}`}
        breadcrumbs={[
          { label: "Dashboard", to: "/" },
          { label: "History", to: "/history" },
          { label: plan.name },
        ]}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate({ to: "/plan/$id/shopping-list", params: { id } })
              }
            >
              <ShoppingCart className="size-4 mr-1" />
              Shopping List
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate({ to: "/plan/$id/feedback", params: { id } })
              }
            >
              <MessageSquare className="size-4 mr-1" />
              Feedback
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card>
          <CardContent className="py-3">
            <p className="text-xs text-muted-foreground">Meals</p>
            <p className="text-lg font-semibold">{plan.concepts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <p className="text-xs text-muted-foreground">Recipes</p>
            <p className="text-lg font-semibold">{plan.recipes.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <p className="text-xs text-muted-foreground">Total Cost</p>
            <PriceTag amount={plan.totalCost} size="md" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="text-lg font-semibold capitalize">{plan.status}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "overview"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Week Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("recipes")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "recipes"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Recipes ({plan.recipes.length})
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "overview" && <WeekView concepts={plan.concepts} />}
      {activeTab === "recipes" && (
        <div className="space-y-4">
          {plan.recipes.length > 0 ? (
            plan.recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))
          ) : (
            <EmptyState
              icon={ClipboardList}
              title="No recipes yet"
              description="Recipes haven't been generated for this meal plan."
            />
          )}
        </div>
      )}
    </div>
  );
}
