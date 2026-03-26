import { PriceTag } from "@/components/shared/price-tag";

interface CartTotalProps {
  total: number;
  deliveryMinimum?: number;
  checkedCount: number;
  totalCount: number;
}

export function CartTotal({
  total,
  deliveryMinimum = 50,
  checkedCount,
  totalCount,
}: CartTotalProps) {
  const progress = Math.min((total / deliveryMinimum) * 100, 100);
  const remaining = Math.max(deliveryMinimum - total, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Estimated Total</span>
        <PriceTag amount={total} size="lg" />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {checkedCount} of {totalCount} items checked
        </span>
      </div>

      {/* Delivery minimum progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Free delivery minimum</span>
          <span className="font-medium">
            {remaining > 0 ? (
              <>
                <PriceTag amount={remaining} size="sm" /> away
              </>
            ) : (
              <span className="text-primary">Free delivery!</span>
            )}
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
