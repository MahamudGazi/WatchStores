import ProductCard from "../products/ProductCard";

export default function FlashSale({ products = [] }) {
  
  const flashSaleProducts = products
  .filter((product) => product.is_flash_sale)
  .slice(0, 8);
  return (
    <section className="bg-red-50 px-4 py-12 sm:px-6 sm:py-16">

      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-red-500 sm:text-sm">
              Limited Time
            </p>

            <h2 className="text-2xl font-bold text-red-600 sm:text-3xl md:text-4xl">
              ⚡ Flash Sale
            </h2>

            <p className="mt-2 text-sm text-gray-600 sm:text-base">
              Grab your favorite watches before the sale ends.
            </p>
          </div>

        </div>

        {/* Products */}
        {flashSaleProducts.length > 0 ? (

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">

            {flashSaleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}

          </div>

        ) : (

          /* Empty State */
          <div className="rounded-2xl bg-white px-5 py-12 text-center shadow-sm">

            <div className="text-4xl">
              ⚡
            </div>

            <h3 className="mt-4 text-lg font-semibold text-gray-800">
              No Flash Sale Available
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Check back soon for amazing deals.
            </p>

          </div>

        )}

      </div>

    </section>
  );
}

