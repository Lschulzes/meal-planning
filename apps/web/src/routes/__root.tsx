import type { AppRouterClient } from "@meal-planning/api/routers/index";
import { Toaster } from "@meal-planning/ui/components/sonner";
import { createORPCClient } from "@orpc/client";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeadContent, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useState } from "react";

import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { link, orpc } from "@/utils/orpc";

import "../index.css";

export interface RouterAppContext {
  orpc: typeof orpc;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: "MealPilot",
      },
      {
        name: "description",
        content: "MealPilot - Your AI-powered meal planning assistant",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
});

function RootComponent() {
  const [_client] = useState<AppRouterClient>(() => createORPCClient(link));
  const [_orpcUtils] = useState(() => createTanstackQueryUtils(_client));

  return (
    <>
      <HeadContent />
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        disableTransitionOnChange
        storageKey="vite-ui-theme"
      >
        <div className="flex min-h-svh">
          <Sidebar />
          <main className="flex-1 min-w-0 pb-20 md:pb-0">
            <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
              <Outlet />
            </div>
          </main>
          <MobileNav />
        </div>
        <Toaster richColors />
      </ThemeProvider>
      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
    </>
  );
}
