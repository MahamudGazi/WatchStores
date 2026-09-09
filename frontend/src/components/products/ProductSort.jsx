export default function ProductSort({
  search,
  setSearch,
  sort,
  setSort,
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">

      {/* Search */}
      <div className="w-full sm:max-w-md">
        <input
          type="text"
          placeholder="Search watch..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            w-full
            rounded-lg
            border
            px-4
            py-2.5
            text-sm
            outline-none
            transition
            focus:border-black
            focus:ring-1
            focus:ring-black
          "
        />
      </div>

      {/* Sort */}
      <div className="w-full sm:w-auto">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="
            w-full
            rounded-lg
            border
            bg-white
            px-4
            py-2.5
            text-sm
            outline-none
            transition
            focus:border-black
            focus:ring-1
            focus:ring-black
            sm:min-w-[190px]
          "
        >
          <option value="newest">
            Newest
          </option>

          <option value="price_low">
            Price Low → High
          </option>

          <option value="price_high">
            Price High → Low
          </option>
        </select>
      </div>

    </div>
  );
}

