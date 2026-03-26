import { Link, useRouterState } from "@tanstack/react-router";
import { ChefHat, Clock, Home, Settings, ShoppingCart } from "lucide-react";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/plan/new", label: "Plan", icon: ChefHat },
  { to: "/history", label: "History", icon: Clock },
  { to: "/products", label: "Products", icon: ShoppingCart },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function MobileNav() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-around px-2 py-1.5">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive =
            to === "/" ? currentPath === "/" : currentPath.startsWith(to);

          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
