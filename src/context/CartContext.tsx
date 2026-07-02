"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number; // Numeric value in Naira (e.g. 45000)
  image: string;
  quantity: number;
  size: string;
  color?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  addToCart: (item: Omit<CartItem, "quantity">, quantityToAdd?: number) => void;
  removeFromCart: (id: string, size: string, color?: string) => void;
  updateQuantity: (id: string, size: string, quantity: number, color?: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("dorcy_vogue_cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error parsing cart storage:", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage when changed
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("dorcy_vogue_cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized]);

  const addToCart = (newItem: Omit<CartItem, "quantity">, quantityToAdd = 1) => {
    setCartItems((prevItems) => {
      // Check if product with same id AND size AND color already exists
      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === newItem.id && item.size === newItem.size && item.color === newItem.color
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantityToAdd;
        return updatedItems;
      } else {
        return [...prevItems, { ...newItem, quantity: quantityToAdd }];
      }
    });
    // Open the cart automatically when item is added
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string, size: string, color?: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => !(item.id === id && item.size === size && item.color === color))
    );
  };

  const updateQuantity = (id: string, size: string, quantity: number, color?: string) => {
    if (quantity <= 0) {
      removeFromCart(id, size, color);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id && item.size === size && item.color === color ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const toggleCart = () => setIsCartOpen((prev) => !prev);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
