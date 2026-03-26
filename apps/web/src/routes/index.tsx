import { Button } from "@meal-planning/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@meal-planning/ui/components/card";
import { Skeleton } from "@meal-planning/ui/components/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar, ChefHat, Clock, Package, ShoppingCart, Sparkles } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PriceTag } from "@/components/shared/price-tag";
import { mockMealPlans, mockProducts } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  // TODO: wire to oRPC — fetch user preferences to determine onboarding state
  const [hasPreferences] = useState(true);
  // TODO: wire to oRPC — fetch active meal plan
  const activePlan = mockMealPlans.find((p) => p.status === "active");
  const syncedProducts = mockProducts.filter((p) => p.inStock).length;

  if (!hasPreferences) {
    return <WelcomeView />;
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's your meal planning overview."
      />

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={Calendar}
          label="Active Plan"
          value={activePlan ? "1" : "0"}
          color="text-primary"
        />
        <StatCard
          icon={Package}
          label="Products Synced"
          value={String(syncedProducts)}
          color="text-accent"
        />
        <StatCard
          icon={Clock}
          label="Last Sync"
          value="2h ago"
          color="text-muted-foreground"
        />
        <StatCard
          icon={ShoppingCart}
          label="Shopping Lists"
          value="3"
          color="text-primary"
        />
      </div>

      {/* Active meal plan */}
      {activePlan ? (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-lg font-semibold">
                {activePlan.name}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ to: "/plan/$id", params: { id: activePlan.id } })}
              >
                View Plan
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-sm font-medium capitalize">{activePlan.status}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Meals Planned</p>
                <p className="text-sm font-medium">{activePlan.concepts.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Estimated Cost</p>
                <PriceTag amount={activePlan.totalCost} size="sm" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Recipes Ready</p>
                <p className="text-sm font-medium">{activePlan.recipes.length}</p>
              </div>
            </div>

            {/* Today's meals preview */}
            <div className="mt-4 pt-4 border-t border-border">
              <h4 className="text-sm font-medium mb-3">Today's Meals</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {activePlan.concepts
                  .filter((c) => c.day === 2) // Wednesday mock
                  .map((concept) => (
                    <div
                      key={concept.id}
                      className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2"
                    >
                      <span className="text-lg">{concept.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{concept.name}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">
                          {concept.mealType}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardContent className="py-8">
            <EmptyState
              icon={ChefHat}
              title="No active meal plan"
              description="Create a new meal plan to get started with your weekly meals."
              actionLabel="Plan a Meal"
              onAction={() => navigate({ to: "/plan/new" })}
            />
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-auto p-4 justify-start gap-3"
          onClick={() => navigate({ to: "/plan/new" })}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <Sparkles className="size-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium">New Meal Plan</p>
            <p className="text-xs text-muted-foreground">Generate AI-powered meals</p>
          </div>
        </Button>
        <Button
          variant="outline"
          className="h-auto p-4 justify-start gap-3"
          onClick={() => navigate({ to: "/history" })}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10">
            <Clock className="size-5 text-accent" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium">View History</p>
            <p className="text-xs text-muted-foreground">Browse past meal plans</p>
          </div>
        </Button>
      </div>
    </div>
  );
}

function WelcomeView() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
        <ChefHat className="size-10 text-primary" />
      </div>
      <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3">
        Welcome to MealPilot
      </h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Your AI-powered meal planning assistant. Let's get started by setting up your
        preferences so we can create personalized meal plans just for you.
      </p>
      <Button
        size="lg"
        onClick={() => navigate({ to: "/onboarding" })}
        className="gap-2"
      >
        <Sparkles className="size-4" />
        Get Started
      </Button>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-3">
        <div className={`${color}`}>
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-lg font-semibold leading-none">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
