import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
} as const;

export function StarRating({ value, onChange, size = "md" }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            className="transition-transform hover:scale-110 focus:outline-none"
            onMouseEnter={() => setHovered(star)}
            onClick={() => onChange(star)}
          >
            <Star
              className={`${sizeMap[size]} transition-colors ${
                filled
                  ? "fill-accent text-accent"
                  : "fill-none text-muted-foreground/40"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
