interface PriceTagProps {
  amount: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PriceTag({ amount, size = "md", className = "" }: PriceTagProps) {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm font-medium",
    lg: "text-lg font-semibold",
  } as const;

  return (
    <span className={`${sizeClasses[size]} text-foreground ${className}`}>
      {formatted}
    </span>
  );
}
