import { Button } from "@meal-planning/ui/components/button";
import { Card, CardContent } from "@meal-planning/ui/components/card";
import { Checkbox } from "@meal-planning/ui/components/checkbox";
import { Input } from "@meal-planning/ui/components/input";
import { Label } from "@meal-planning/ui/components/label";
import { useNavigate } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, ChefHat, X } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { CUISINE_OPTIONS, DIETARY_OPTIONS } from "@/lib/mock-data";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

const STEPS = ["Dietary", "Cuisines", "Lifestyle", "Review"] as const;

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Form state
  const [dietary, setDietary] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState("");
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [householdSize, setHouseholdSize] = useState(2);
  const [weeklyBudget, setWeeklyBudget] = useState(120);
  const [maxPrepTime, setMaxPrepTime] = useState(45);
  const [cookingSkill, setCookingSkill] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [servingsPerMeal, setServingsPerMeal] = useState(2);

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

  const removeAllergy = (allergy: string) => {
    setAllergies((prev) => prev.filter((a) => a !== allergy));
  };

  const handleSave = () => {
    // TODO: wire to oRPC — save user preferences
    console.log("Saving preferences:", {
      dietaryRestrictions: dietary,
      allergies,
      cuisinePreferences: cuisines,
      householdSize,
      weeklyBudget,
      maxPrepTime,
      cookingSkill,
      servingsPerMeal,
    });
    navigate({ to: "/" });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Set Up Your Preferences" description="Tell us about your eating habits so we can plan meals perfectly for you." />

      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((name, idx) => (
          <div key={name} className="flex-1">
            <div
              className={`h-1.5 rounded-full transition-colors ${
                idx <= step ? "bg-primary" : "bg-muted"
              }`}
            />
            <p
              className={`text-[10px] mt-1.5 font-medium ${
                idx <= step ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {name}
            </p>
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="min-h-[400px]">
        {step === 0 && (
          <StepDietary
            dietary={dietary}
            toggleDietary={toggleDietary}
            allergies={allergies}
            allergyInput={allergyInput}
            setAllergyInput={setAllergyInput}
            addAllergy={addAllergy}
            removeAllergy={removeAllergy}
          />
        )}
        {step === 1 && (
          <StepCuisines cuisines={cuisines} toggleCuisine={toggleCuisine} />
        )}
        {step === 2 && (
          <StepLifestyle
            householdSize={householdSize}
            setHouseholdSize={setHouseholdSize}
            weeklyBudget={weeklyBudget}
            setWeeklyBudget={setWeeklyBudget}
            maxPrepTime={maxPrepTime}
            setMaxPrepTime={setMaxPrepTime}
            cookingSkill={cookingSkill}
            setCookingSkill={setCookingSkill}
            servingsPerMeal={servingsPerMeal}
            setServingsPerMeal={setServingsPerMeal}
          />
        )}
        {step === 3 && (
          <StepReview
            dietary={dietary}
            allergies={allergies}
            cuisines={cuisines}
            householdSize={householdSize}
            weeklyBudget={weeklyBudget}
            maxPrepTime={maxPrepTime}
            cookingSkill={cookingSkill}
            servingsPerMeal={servingsPerMeal}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-border mt-8">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          <ArrowLeft className="size-4 mr-1" />
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)}>
            Next
            <ArrowRight className="size-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleSave}>
            <Check className="size-4 mr-1" />
            Save & Continue
          </Button>
        )}
      </div>
    </div>
  );
}

// --- Step Components ---

function StepDietary({
  dietary,
  toggleDietary,
  allergies,
  allergyInput,
  setAllergyInput,
  addAllergy,
  removeAllergy,
}: {
  dietary: string[];
  toggleDietary: (item: string) => void;
  allergies: string[];
  allergyInput: string;
  setAllergyInput: (v: string) => void;
  addAllergy: () => void;
  removeAllergy: (a: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold mb-1">Dietary Restrictions</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Select any that apply to your household.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {DIETARY_OPTIONS.map((option) => {
            const selected = dietary.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleDietary(option)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                  selected
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/40 text-foreground"
                }`}
              >
                <Checkbox checked={selected} />
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold mb-1">Allergies</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Add any food allergies we should know about.
        </p>
        <div className="flex gap-2">
          <Input
            value={allergyInput}
            onChange={(e) => setAllergyInput(e.target.value)}
            placeholder="e.g., peanuts, shellfish..."
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
          <div className="flex flex-wrap gap-2 mt-3">
            {allergies.map((allergy) => (
              <span
                key={allergy}
                className="inline-flex items-center gap-1 rounded-full bg-destructive/10 text-destructive px-3 py-1 text-xs font-medium"
              >
                {allergy}
                <button type="button" onClick={() => removeAllergy(allergy)}>
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StepCuisines({
  cuisines,
  toggleCuisine,
}: {
  cuisines: string[];
  toggleCuisine: (name: string) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-lg font-semibold mb-1">Cuisine Preferences</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Pick your favorite cuisines. We'll use these to inspire your meal plans.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {CUISINE_OPTIONS.map(({ name, flag }) => {
          const selected = cuisines.includes(name);
          return (
            <button
              key={name}
              type="button"
              onClick={() => toggleCuisine(name)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                selected
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <span className="text-3xl">{flag}</span>
              <span className="text-xs font-medium">{name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepLifestyle({
  householdSize,
  setHouseholdSize,
  weeklyBudget,
  setWeeklyBudget,
  maxPrepTime,
  setMaxPrepTime,
  cookingSkill,
  setCookingSkill,
  servingsPerMeal,
  setServingsPerMeal,
}: {
  householdSize: number;
  setHouseholdSize: (n: number) => void;
  weeklyBudget: number;
  setWeeklyBudget: (n: number) => void;
  maxPrepTime: number;
  setMaxPrepTime: (n: number) => void;
  cookingSkill: "beginner" | "intermediate" | "advanced";
  setCookingSkill: (s: "beginner" | "intermediate" | "advanced") => void;
  servingsPerMeal: number;
  setServingsPerMeal: (n: number) => void;
}) {
  const skills = [
    { value: "beginner" as const, label: "Beginner", desc: "Simple recipes, basic techniques", icon: "🥚" },
    { value: "intermediate" as const, label: "Intermediate", desc: "Comfortable in the kitchen", icon: "🍳" },
    { value: "advanced" as const, label: "Advanced", desc: "Complex dishes, diverse techniques", icon: "👨‍🍳" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-semibold">Lifestyle & Preferences</h2>

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
          <Label htmlFor="budget">Weekly Budget</Label>
          <span className="text-sm font-medium">${weeklyBudget}</span>
        </div>
        <input
          id="budget"
          type="range"
          min={50}
          max={300}
          step={10}
          value={weeklyBudget}
          onChange={(e) => setWeeklyBudget(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>$50</span>
          <span>$300</span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label htmlFor="prep">Max Prep Time</Label>
          <span className="text-sm font-medium">{maxPrepTime} min</span>
        </div>
        <input
          id="prep"
          type="range"
          min={15}
          max={120}
          step={5}
          value={maxPrepTime}
          onChange={(e) => setMaxPrepTime(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>15 min</span>
          <span>120 min</span>
        </div>
      </div>

      <div>
        <Label className="mb-2">Cooking Skill</Label>
        <div className="grid grid-cols-3 gap-3 mt-1.5">
          {skills.map((s) => {
            const selected = cookingSkill === s.value;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => setCookingSkill(s.value)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-4 transition-all text-center ${
                  selected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <span className="text-2xl">{s.icon}</span>
                <span className="text-xs font-semibold">{s.label}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">{s.desc}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StepReview({
  dietary,
  allergies,
  cuisines,
  householdSize,
  weeklyBudget,
  maxPrepTime,
  cookingSkill,
  servingsPerMeal,
}: {
  dietary: string[];
  allergies: string[];
  cuisines: string[];
  householdSize: number;
  weeklyBudget: number;
  maxPrepTime: number;
  cookingSkill: string;
  servingsPerMeal: number;
}) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-semibold mb-1">Review Your Preferences</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Everything look right? You can always change these later in Settings.
      </p>

      <Card>
        <CardContent className="space-y-3">
          <ReviewRow label="Dietary Restrictions" value={dietary.length > 0 ? dietary.join(", ") : "None"} />
          <ReviewRow label="Allergies" value={allergies.length > 0 ? allergies.join(", ") : "None"} />
          <ReviewRow label="Cuisines" value={cuisines.length > 0 ? cuisines.join(", ") : "None selected"} />
          <ReviewRow label="Household Size" value={String(householdSize)} />
          <ReviewRow label="Servings Per Meal" value={String(servingsPerMeal)} />
          <ReviewRow label="Weekly Budget" value={`$${weeklyBudget}`} />
          <ReviewRow label="Max Prep Time" value={`${maxPrepTime} minutes`} />
          <ReviewRow label="Cooking Skill" value={cookingSkill.charAt(0).toUpperCase() + cookingSkill.slice(1)} />
        </CardContent>
      </Card>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}
