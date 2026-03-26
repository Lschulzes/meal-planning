import { Button } from "@meal-planning/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@meal-planning/ui/components/card";
import { Checkbox } from "@meal-planning/ui/components/checkbox";
import { Input } from "@meal-planning/ui/components/input";
import { Label } from "@meal-planning/ui/components/label";
import { Skeleton } from "@meal-planning/ui/components/skeleton";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Loader2, RefreshCw, X } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { CUISINE_OPTIONS, DIETARY_OPTIONS, mockPreferences } from "@/lib/mock-data";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  // TODO: wire to oRPC — fetch user preferences
  const loading = false;
  const [syncing, setSyncing] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form state initialized from mock preferences
  const [dietary, setDietary] = useState<string[]>(mockPreferences.dietaryRestrictions);
  const [allergies, setAllergies] = useState<string[]>(mockPreferences.allergies);
  const [allergyInput, setAllergyInput] = useState("");
  const [cuisines, setCuisines] = useState<string[]>(mockPreferences.cuisinePreferences);
  const [householdSize, setHouseholdSize] = useState(mockPreferences.householdSize);
  const [weeklyBudget, setWeeklyBudget] = useState(mockPreferences.weeklyBudget);
  const [maxPrepTime, setMaxPrepTime] = useState(mockPreferences.maxPrepTime);
  const [cookingSkill, setCookingSkill] = useState<"beginner" | "intermediate" | "advanced">(mockPreferences.cookingSkill);
  const [servingsPerMeal, setServingsPerMeal] = useState(mockPreferences.servingsPerMeal);

  const toggleDietary = (item: string) => {
    setDietary((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  };

  const toggleCuisine = (name: string) => {
    setCuisines((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const addAllergy = () => {
    const trimmed = allergyInput.trim();
    if (trimmed && !allergies.includes(trimmed)) {
      setAllergies((prev) => [...prev, trimmed]);
      setAllergyInput("");
    }
  };

  const handleSave = () => {
    // TODO: wire to oRPC — update user preferences
    console.log("Saving settings:", {
      dietaryRestrictions: dietary,
      allergies,
      cuisinePreferences: cuisines,
      householdSize,
      weeklyBudget,
      maxPrepTime,
      cookingSkill,
      servingsPerMeal,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSync = () => {
    // TODO: wire to oRPC — trigger product sync
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000);
  };

  if (loading) {
    return (
      <div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-64 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" description="Manage your preferences and app settings." />

      {/* Sync status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm">Product Sync</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Last synced: <span className="font-medium">2 hours ago</span></p>
              <p className="text-xs text-muted-foreground mt-0.5">9 of 10 products in stock</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
              {syncing ? (
                <Loader2 className="size-4 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="size-4 mr-1" />
              )}
              {syncing ? "Syncing..." : "Sync Now"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dietary restrictions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm">Dietary Restrictions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DIETARY_OPTIONS.map((option) => {
              const selected = dietary.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleDietary(option)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    selected
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <Checkbox checked={selected} />
                  {option}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Allergies */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm">Allergies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-3">
            <Input
              value={allergyInput}
              onChange={(e) => setAllergyInput(e.target.value)}
              placeholder="Add an allergy..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addAllergy();
                }
              }}
            />
            <Button variant="outline" onClick={addAllergy}>
              Add
            </Button>
          </div>
          {allergies.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allergies.map((allergy) => (
                <span
                  key={allergy}
                  className="inline-flex items-center gap-1 rounded-full bg-destructive/10 text-destructive px-3 py-1 text-xs font-medium"
                >
                  {allergy}
                  <button
                    type="button"
                    onClick={() => setAllergies((prev) => prev.filter((a) => a !== allergy))}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cuisine preferences */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm">Cuisine Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {CUISINE_OPTIONS.map(({ name, flag }) => {
              const selected = cuisines.includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleCuisine(name)}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-3 transition-all ${
                    selected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <span className="text-xl">{flag}</span>
                  <span className="text-[10px] font-medium">{name}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lifestyle */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm">Lifestyle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="household">Household Size</Label>
              <Input
                id="household"
                type="number"
                min={1}
                max={12}
                value={householdSize}
                onChange={(e) => setHouseholdSize(Number(e.target.value))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="servings">Servings Per Meal</Label>
              <Input
                id="servings"
                type="number"
                min={1}
                max={12}
                value={servingsPerMeal}
                onChange={(e) => setServingsPerMeal(Number(e.target.value))}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label>Weekly Budget</Label>
              <span className="text-sm font-medium">${weeklyBudget}</span>
            </div>
            <input
              type="range"
              min={50}
              max={300}
              step={10}
              value={weeklyBudget}
              onChange={(e) => setWeeklyBudget(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label>Max Prep Time</Label>
              <span className="text-sm font-medium">{maxPrepTime} min</span>
            </div>
            <input
              type="range"
              min={15}
              max={120}
              step={5}
              value={maxPrepTime}
              onChange={(e) => setMaxPrepTime(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div>
            <Label className="mb-1.5">Cooking Skill</Label>
            <div className="grid grid-cols-3 gap-2 mt-1.5">
              {(["beginner", "intermediate", "advanced"] as const).map((skill) => (
                <Button
                  key={skill}
                  variant={cookingSkill === skill ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCookingSkill(skill)}
                  className="capitalize"
                >
                  {skill}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2">
          {saved ? <Check className="size-4" /> : null}
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
