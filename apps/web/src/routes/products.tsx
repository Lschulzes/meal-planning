import { Button } from "@meal-planning/ui/components/button";
import { Card, CardContent } from "@meal-planning/ui/components/card";
import { Input } from "@meal-planning/ui/components/input";
import { Skeleton } from "@meal-planning/ui/components/skeleton";
import { createFileRoute } from "@tanstack/react-router";
import { Package, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NutritionBadge } from "@/components/shared/nutrition-badge";
import { PriceTag } from "@/components/shared/price-tag";
import { PRODUCT_CATEGORIES, mockProducts } from "@/lib/mock-data";

export const Route = createFileRoute("/products")({
  component: ProductsPage,
});

function ProductsPage() {
  // TODO: wire to oRPC — fetch products
  const products = mockProducts;
  const loading = false;

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !selectedCategory || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  if (loading) {
    return (
      <div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-64 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Products"
        description={`${products.length} products synced from your grocery store.`}
      />

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="xs"
          onClick={() => setSelectedCategory(null)}
        >
          All
        </Button>
        {PRODUCT_CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            size="xs"
            onClick={() => setSelectedCategory(cat)}
            className="shrink-0"
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Product grid */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description="Try adjusting your search or category filter."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:ring-primary/20 transition-all">
              <CardContent className="flex flex-col gap-3">
                {/* Image placeholder */}
                <div className="w-full h-32 rounded-lg bg-muted flex items-center justify-center">
                  <Package className="size-8 text-muted-foreground/40" />
                </div>

                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium truncate">{product.name}</h3>
                      <p className="text-xs text-muted-foreground">{product.brand}</p>
                    </div>
                    <PriceTag amount={product.price} size="md" />
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                      {product.category}
                    </span>
                    <span
                      className={`text-[10px] font-medium ${
                        product.inStock ? "text-primary" : "text-destructive"
                      }`}
                    >
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border">
                    <NutritionBadge nutrition={product.nutrition} compact />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
