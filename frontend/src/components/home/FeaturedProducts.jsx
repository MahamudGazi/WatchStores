import ProductCard from "../products/ProductCard";

export default function FeaturedProducts({ products = [] }) {
  const featuredProducts = products.filter(
    (product) => product.is_featured
  );

  return (
    <section className="bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 text-center sm:mb-10">
          
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-600 sm:text-sm">
            Our Collection
          </p>

          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
            Featured Watches
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
            Explore our hand-picked collection of premium watches
            from the world's most trusted brands.
          </p>

        </div>


        {/* Products */}
        {featuredProducts.length > 0 ? (

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">

            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}

          </div>

        ) : (

          /* Empty State */
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-12 text-center">

            <div className="text-4xl">
              ⌚
            </div>

            <h3 className="mt-4 text-lg font-semibold text-gray-800">
              No Featured Watches
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Featured watches will appear here soon.
            </p>

          </div>

        )}

      </div>

    </section>
  );
}
