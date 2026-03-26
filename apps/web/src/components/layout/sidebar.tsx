import { Link, useRouterState } from "@tanstack/react-router";
import { ChefHat, Clock, Home, Settings, ShoppingCart } from "lucide-react";

import { ModeToggle } from "@/components/mode-toggle";

const navItems = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/plan/new", label: "Plan Meal", icon: ChefHat },
  { to: "/history", label: "History", icon: Clock },
  { to: "/products", label: "Products", icon: ShoppingCart },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <aside className="hidden md:flex flex-col w-60 border-r border-border bg-sidebar h-svh sticky top-0">
      {/* Brand */}
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground text-sm font-bold">
          M
        </div>
        <span className="font-display text-xl font-semibold tracking-tight text-sidebar-foreground">
          MealPilot
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 px-3 py-2">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive =
            to === "/" ? currentPath === "/" : currentPath.startsWith(to);

          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="size-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border px-4 py-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Theme</span>
        <ModeToggle />
      </div>
    </aside>
  );
}
