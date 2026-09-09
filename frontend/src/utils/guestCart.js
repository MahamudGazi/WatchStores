const GUEST_CART_KEY = "watchstore_guest_cart";

export function getGuestCart() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveGuestCart(items) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export function clearGuestCart() {
  localStorage.removeItem(GUEST_CART_KEY);
}

export function addGuestCartItem(product, quantity = 1) {
  const items = getGuestCart();
  const idx = items.findIndex((i) => i.product_id === product.id);
  if (idx >= 0) {
    items[idx].quantity += quantity;
  } else {
    items.push({
      product_id: product.id,
      product_name: product.name,
      product_price: product.discount_price ?? product.price,
      product_original_price: product.price,
      product_thumbnail: product.thumbnail || null,
      product_slug: product.slug || "",
      quantity,
    });
  }
  saveGuestCart(items);
  return items;
}

export function updateGuestCartItem(productId, quantity) {
  let items = getGuestCart();
  if (quantity <= 0) {
    items = items.filter((i) => i.product_id !== productId);
  } else {
    items = items.map((i) =>
      i.product_id === productId ? { ...i, quantity } : i
    );
  }
  saveGuestCart(items);
  return items;
}

export function removeGuestCartItem(productId) {
  const items = getGuestCart().filter((i) => i.product_id !== productId);
  saveGuestCart(items);
  return items;
}
