import ProductCard from "../products/ProductCard";

export default function LatestProducts({ products = [] }) {
  return (
    <section className="bg-gray-50 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 text-center sm:mb-10">

          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-600 sm:text-sm">
            New Arrivals
          </p>

          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
            Latest Products
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
            Discover our newest watches and stay updated with
            the latest additions to our collection.
          </p>

        </div>

        {/* Products */}
        {products.length > 0 ? (

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">

            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}

          </div>

        ) : (

          /* Empty State */
          <div className="rounded-2xl border border-gray-100 bg-white px-5 py-12 text-center shadow-sm">

            <div className="text-4xl">
              ⌚
            </div>

            <h3 className="mt-4 text-lg font-semibold text-gray-800">
              No Products Available
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              New products will appear here soon.
            </p>

          </div>

        )}

      </div>

    </section>
  );
}
