import { useEffect, useState } from "react";
import api from "../api/axios";

import ProductGrid from "../components/products/ProductGrid";
import ProductFilter from "../components/products/ProductFilter";
import ProductSort from "../components/products/ProductSort";
import Loading from "../components/common/Loading";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [productRes, categoryRes, brandRes] =
          await Promise.all([
            api.get("/products/"),
            api.get("/categories/"),
            api.get("/brands/"),
          ]);

        setProducts(productRes.data.results || []);
        setFilteredProducts(productRes.data.results || []);

        setCategories(categoryRes.data.results || []);
        setBrands(brandRes.data.results || []);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    let result = [...products];

    if (search) {
      result = result.filter((item) =>
        item.name
          ?.toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    if (category) {
      result = result.filter(
        (item) => item.category === Number(category)
      );
    }

    if (brand) {
      result = result.filter(
        (item) => item.brand === Number(brand)
      );
    }

    if (minPrice) {
      result = result.filter(
        (item) =>
          Number(item.price) >= Number(minPrice)
      );
    }

    if (maxPrice) {
      result = result.filter(
        (item) =>
          Number(item.price) <= Number(maxPrice)
      );
    }

    setFilteredProducts(result);
  }, [
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    products,
  ]);

  if (loading) {
    return <Loading />;
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Page Header */}
      <section className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
            All Products
          </h1>

          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            Discover our complete collection of premium watches.
          </p>

        </div>
      </section>

      {/* Products Area */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-8">

          {/* Sidebar Filter */}
          <aside className="lg:col-span-1">
            <div className="rounded-xl bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-24">
              
              <ProductFilter
                categories={categories}
                brands={brands}
                category={category}
                setCategory={setCategory}
                brand={brand}
                setBrand={setBrand}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
              />

            </div>
          </aside>

          {/* Products */}
          <div className="min-w-0 lg:col-span-3">

            {/* Search / Sort */}
            <div className="mb-6 rounded-xl bg-white p-4 shadow-sm sm:p-5">
              <ProductSort
                search={search}
                setSearch={setSearch}
              />
            </div>

            {/* Result Count */}
            <div className="mb-5 flex items-center justify-between">

              <p className="text-sm text-gray-600 sm:text-base">
                <span className="font-semibold text-gray-900">
                  {filteredProducts.length}
                </span>{" "}
                products found
              </p>

            </div>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <ProductGrid
                products={filteredProducts}
              />
            ) : (
              <div className="rounded-xl bg-white px-4 py-16 text-center shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800">
                  No products found
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Try changing your search or filters.
                </p>
              </div>
            )}

          </div>

        </div>

      </section>

    </main>
  );
}