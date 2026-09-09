import { createContext, useEffect, useState } from "react";

import { clearTokens, getAccessToken } from "../utils/storage";

import { getGuestCart, clearGuestCart } from "../utils/guestCart";

import { mergeGuestCart } from "../api/cart";

import { getProfile } from "../api/auth";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (userData) => {
    setUser(userData);

    // Merge guest cart after login
    try {
      const guestItems = getGuestCart();

      if (guestItems.length > 0) {
        await mergeGuestCart(
          guestItems.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
          }))
        );

        clearGuestCart();
      }
    } catch (e) {
      console.warn("Guest cart merge failed:", e);
    }
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      return;
    }

    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        setUser(profile);
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };

    loadProfile();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}