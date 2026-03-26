import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/plan/$id")({
  component: PlanLayout,
});

function PlanLayout() {
  return <Outlet />;
}
