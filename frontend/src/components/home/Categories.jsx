import { Link } from "react-router-dom";

const categories = [
  "Rolex",
  "Omega",
  "Casio",
  "Seiko",
];

export default function Categories() {
  return (
    <section className="bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 text-center sm:mb-10">

          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-600 sm:text-sm">
            Shop By Brand
          </p>

          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
            Categories
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-500 sm:text-base">
            Explore premium watches from some of the world's
            most trusted brands.
          </p>

        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">

          {categories.map((category) => (
            <Link
              key={category}
              to={`/products?brand=${encodeURIComponent(category)}`}
              className="group rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:border-yellow-400 hover:bg-black hover:shadow-xl sm:p-8 md:p-10"
            >

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100 text-xl font-bold text-yellow-700 transition duration-300 group-hover:bg-yellow-500 group-hover:text-black sm:h-16 sm:w-16">
                {category.charAt(0)}
              </div>

              <h3 className="text-base font-semibold text-gray-800 transition group-hover:text-yellow-500 sm:text-lg">
                {category}
              </h3>

              <p className="mt-2 text-xs text-gray-500 transition group-hover:text-gray-400 sm:text-sm">
                Explore Collection
              </p>

            </Link>
          ))}

        </div>

      </div>

    </section>
  );
}

