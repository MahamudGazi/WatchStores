export default function ProductFilter({
  category,
  setCategory,
  categories,
  brand,
  setBrand,
  brands,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">

      {/* Header */}
      <div className="mb-5 border-b pb-4">
        <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
          Filter Products
        </h2>

        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          Find your perfect watch
        </p>
      </div>

      {/* Category */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Categories
        </label>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
        >
          <option value="">
            All Categories
          </option>

          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Brand */}
      <div className="mt-5">
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Brands
        </label>

        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
        >
          <option value="">
            All Brands
          </option>

          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price */}
      <div className="mt-5">
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Price Range
        </label>

        <div className="grid grid-cols-2 gap-2">

          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            min="0"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
          />

          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            min="0"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
          />

        </div>
      </div>

      {/* Clear Filters */}
      {(category || brand || minPrice || maxPrice) && (
        <button
          type="button"
          onClick={() => {
            setCategory("");
            setBrand("");
            setMinPrice("");
            setMaxPrice("");
          }}
          className="mt-6 w-full rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          Clear Filters
        </button>
      )}

    </div>
  );
}

