export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  const pages = [];

  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">

      {/* Previous */}
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="
          rounded-lg
          border
          px-3
          py-2
          text-sm
          font-medium
          transition
          disabled:cursor-not-allowed
          disabled:opacity-40
          hover:bg-gray-100
        "
      >
        ← Prev
      </button>

      {/* Page Numbers */}
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          className={`
            min-w-9
            rounded-lg
            px-3
            py-2
            text-sm
            font-semibold
            transition
            ${
              currentPage === page
                ? "bg-black text-white"
                : "border bg-white text-gray-700 hover:bg-gray-100"
            }
          `}
        >
          {page}
        </button>
      ))}

      {/* Next */}
      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="
          rounded-lg
          border
          px-3
          py-2
          text-sm
          font-medium
          transition
          disabled:cursor-not-allowed
          disabled:opacity-40
          hover:bg-gray-100
        "
      >
        Next →
      </button>

    </div>
  );
}

