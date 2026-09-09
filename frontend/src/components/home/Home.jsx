import { useEffect, useState } from "react";

import Hero from "../components/home/Hero";
import Categories from "../components/home/Categories";
import FeaturedProducts from "./FeaturedProducts";
import FlashSale from "../components/home/FlashSale";
import LatestProducts from "../components/home/LatestProducts";
import Newsletter from "../components/home/Newsletter";
import { getProducts } from "../api/productApi";


export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const data = await getProducts();

      setProducts(
        Array.isArray(data)
          ? data
          : data?.results || []
      );
    } catch (error) {
      console.error("Home products error:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>

      <Hero />

      <Categories />

      {loading ? (
        <div className="py-16 text-center text-gray-500">
          Loading products...
        </div>
      ) : (
        <>
          <FeaturedProducts products={products} />

          <FlashSale products={products} />

          <LatestProducts products={products} />
        </>
      )}

      <Newsletter />

    </main>
  );
}

