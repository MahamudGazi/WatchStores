import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Rating from "../ProductCard/Rating";
import WishlistButton from "../ProductCard/WishlistButton";
import QuickActions from "../ProductCard/QuickActions";

import { addToCart } from "../../api/cart";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../../api/wishlist";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(
    Boolean(product?.is_in_wishlist)
  );

  if (!product) return null;

  const productId = product.id;

  const productPrice =
    product.discount_price ?? product.price;

  const originalPrice = product.price;

  const hasDiscount =
    product.discount_price !== null &&
    product.discount_price !== undefined &&
    Number(product.discount_price) < Number(product.price);

  const stock = Number(product.stock ?? 0);

  const isOutOfStock =
    stock <= 0 ||
    product.stock_status === "Out of Stock";

  const handleAddToCart = async () => {
    if (isOutOfStock || addingToCart) return;

    try {
      setAddingToCart(true);

      await addToCart({
        product: productId,
        quantity: 1,
      });

      // Notify Navbar/cart badge
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Failed to add product to cart:", error);

      if (error?.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (wishlistLoading) return;

    try {
      setWishlistLoading(true);

      if (!isWishlisted) {
        await addToWishlist(productId);
        setIsWishlisted(true);
      } else {
        /*
         * Backend remove endpoint requires Wishlist ID,
         * not Product ID.
         *
         * So first find the wishlist item belonging
         * to this product.
         */
        const response = await getWishlist();

        const data = response?.data;

        const wishlistItems = Array.isArray(data)
          ? data
          : data?.results ||
            data?.data ||
            [];

        const wishlistItem = wishlistItems.find((item) => {
          const itemProductId =
            typeof item.product === "object"
              ? item.product?.id
              : item.product;

          return Number(itemProductId) === Number(productId);
        });

        if (wishlistItem?.id) {
          await removeFromWishlist(wishlistItem.id);
          setIsWishlisted(false);
        }
      }
    } catch (error) {
      console.error("Failed to update wishlist:", error);

      if (error?.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleView = () => {
    navigate(`/products/${productId}`);
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-900">

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">

        <Link to={`/products/${productId}`}>
          {product.thumbnail ? (
            <img
              src={product.thumbnail}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
              No Image
            </div>
          )}
        </Link>

        {/* Sale Badge */}
        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
            {product.discount_percentage
              ? `${product.discount_percentage}% OFF`
              : "SALE"}
          </span>
        )}

        {/* Stock Badge */}
        {product.stock_status && (
          <span
            className={`absolute bottom-3 left-3 rounded-full px-3 py-1 text-xs font-medium ${
              isOutOfStock
                ? "bg-red-100 text-red-700"
                : stock <= 5
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {product.stock_status}
          </span>
        )}

        {/* Wishlist */}
        <div className="absolute right-3 top-3">
          <WishlistButton
            productId={productId}
            isWishlisted={isWishlisted}
            onToggle={handleWishlistToggle}
            loading={wishlistLoading}
          />
        </div>

        {/* Quick Actions */}
        <div className="absolute bottom-3 right-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <QuickActions
            product={product}
            onView={handleView}
            onCart={handleAddToCart}
          />
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">

        {/* Brand */}
        {product.brand_name && (
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {product.brand_name}
          </p>
        )}

        {/* Product Name */}
        <Link to={`/products/${productId}`}>
          <h3 className="line-clamp-2 min-h-[3rem] text-base font-semibold text-gray-900 transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mt-2">
          <Rating
            rating={Number(product.average_rating ?? 0)}
            count={product.review_count ?? 0}
          />
        </div>

        {/* Description */}
        {product.short_description && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
            {product.short_description}
          </p>
        )}

        {/* Price */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            ৳{Number(productPrice).toLocaleString()}
          </span>

          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              ৳{Number(originalPrice).toLocaleString()}
            </span>
          )}
        </div>

        {/* Add To Cart */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock || addingToCart}
          className={`mt-4 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
            isOutOfStock
              ? "cursor-not-allowed bg-gray-200 text-gray-500"
              : addingToCart
              ? "cursor-wait bg-gray-400 text-white"
              : "bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          }`}
        >
          {isOutOfStock
            ? "Out of Stock"
            : addingToCart
            ? "Adding..."
            : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;