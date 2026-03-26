import { Button } from "@meal-planning/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@meal-planning/ui/components/card";
import { Input } from "@meal-planning/ui/components/input";
import { Label } from "@meal-planning/ui/components/label";
import { Skeleton } from "@meal-planning/ui/components/skeleton";
import { createFileRoute } from "@tanstack/react-router";
import { Check, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { StarRating } from "@/components/feedback/star-rating";
import { mockFeedback, mockMealPlans, mockRecipes } from "@/lib/mock-data";

export const Route = createFileRoute("/plan/$id/feedback")({
  component: FeedbackPage,
});

interface FeedbackForm {
  rating: number;
  wouldRepeat: boolean | null;
  difficulty: number;
  actualPrepTime: string;
  tasteNotes: string;
  portionFeedback: "too-little" | "just-right" | "too-much" | null;
}

const defaultForm: FeedbackForm = {
  rating: 0,
  wouldRepeat: null,
  difficulty: 0,
  actualPrepTime: "",
  tasteNotes: "",
  portionFeedback: null,
};

function FeedbackPage() {
  const { id } = Route.useParams();
  // TODO: wire to oRPC — fetch plan & existing feedback
  const plan = mockMealPlans.find((p) => p.id === id);
  const recipes = mockRecipes;
  const [activeRecipe, setActiveRecipe] = useState(recipes[0]?.id ?? "");
  const [forms, setForms] = useState<Record<string, FeedbackForm>>({});
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());
  const loading = false;

  const currentForm = forms[activeRecipe] ?? defaultForm;

  const updateForm = (updates: Partial<FeedbackForm>) => {
    setForms((prev) => ({
      ...prev,
      [activeRecipe]: { ...(prev[activeRecipe] ?? defaultForm), ...updates },
    }));
  };

  const handleSubmit = () => {
    // TODO: wire to oRPC — submit feedback
    console.log("Submitting feedback:", { recipeId: activeRecipe, ...currentForm });
    setSubmitted((prev) => new Set([...prev, activeRecipe]));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Meal Feedback"
        description="Rate your meals so we can improve future plans."
        breadcrumbs={[
          { label: "Dashboard", to: "/" },
          { label: plan?.name ?? "Plan", to: `/plan/${id}` },
          { label: "Feedback" },
        ]}
      />

      {/* Recipe selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {recipes.map((recipe) => {
          const isActive = activeRecipe === recipe.id;
          const isDone = submitted.has(recipe.id);
          return (
            <button
              key={recipe.id}
              type="button"
              onClick={() => setActiveRecipe(recipe.id)}
              className={`flex items-center gap-2 shrink-0 rounded-lg border px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-primary/40"
              }`}
            >
              {isDone && <Check className="size-3.5 text-primary" />}
              {recipe.name}
            </button>
          );
        })}
      </div>

      {/* Previous feedback */}
      {mockFeedback.filter((f) => f.recipeId === activeRecipe).length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-sm">Previous Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            {mockFeedback
              .filter((f) => f.recipeId === activeRecipe)
              .map((f) => (
                <div key={f.id} className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 mb-1">
                    <StarRating value={f.rating} onChange={() => {}} size="sm" />
                    <span>{f.wouldRepeat ? "Would repeat" : "Would not repeat"}</span>
                  </div>
                  <p className="italic">"{f.tasteNotes}"</p>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Feedback form */}
      {submitted.has(activeRecipe) ? (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-3">
              <Check className="size-6 text-primary" />
            </div>
            <h3 className="font-display text-lg font-semibold">Thanks for your feedback!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              This helps us plan better meals for you.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-6 py-4">
            {/* Star rating */}
            <div>
              <Label className="mb-2">Overall Rating</Label>
              <StarRating
                value={currentForm.rating}
                onChange={(rating) => updateForm({ rating })}
                size="lg"
              />
            </div>

            {/* Would repeat */}
            <div>
              <Label className="mb-2">Would you make this again?</Label>
              <div className="flex gap-2">
                <Button
                  variant={currentForm.wouldRepeat === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateForm({ wouldRepeat: true })}
                  className="gap-1.5"
                >
                  <ThumbsUp className="size-4" />
                  Yes
                </Button>
                <Button
                  variant={currentForm.wouldRepeat === false ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateForm({ wouldRepeat: false })}
                  className="gap-1.5"
                >
                  <ThumbsDown className="size-4" />
                  No
                </Button>
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <Label className="mb-2">Difficulty (1 = Easy, 5 = Hard)</Label>
              <StarRating
                value={currentForm.difficulty}
                onChange={(difficulty) => updateForm({ difficulty })}
                size="md"
              />
            </div>

            {/* Actual prep time */}
            <div>
              <Label htmlFor="prep-time" className="mb-1.5">Actual Prep Time (minutes)</Label>
              <Input
                id="prep-time"
                type="number"
                min={1}
                placeholder="e.g., 30"
                value={currentForm.actualPrepTime}
                onChange={(e) => updateForm({ actualPrepTime: e.target.value })}
                className="max-w-32"
              />
            </div>

            {/* Portion feedback */}
            <div>
              <Label className="mb-2">Portion Size</Label>
              <div className="flex gap-2">
                {(
                  [
                    { value: "too-little", label: "Too Little" },
                    { value: "just-right", label: "Just Right" },
                    { value: "too-much", label: "Too Much" },
                  ] as const
                ).map((opt) => (
                  <Button
                    key={opt.value}
                    variant={currentForm.portionFeedback === opt.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateForm({ portionFeedback: opt.value })}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Taste notes */}
            <div>
              <Label htmlFor="notes" className="mb-1.5">Taste Notes</Label>
              <textarea
                id="notes"
                rows={3}
                placeholder="What did you think of this meal?"
                value={currentForm.tasteNotes}
                onChange={(e) => updateForm({ tasteNotes: e.target.value })}
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 resize-none"
              />
            </div>

            <Button onClick={handleSubmit} className="w-full gap-2">
              <Check className="size-4" />
              Submit Feedback
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
