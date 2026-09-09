import ProductCard from "./ProductCard";

export default function ProductGrid({ products }) {
  // No products
  if (!products || products.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 text-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">
            No Products Found
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Try changing your filters or search.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        grid
        grid-cols-1
        gap-4
        sm:grid-cols-2
        sm:gap-5
        lg:grid-cols-2
        xl:grid-cols-3
        2xl:grid-cols-4
      "
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
}

