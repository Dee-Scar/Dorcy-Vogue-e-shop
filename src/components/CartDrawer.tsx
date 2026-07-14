"use client";

import React from "react";
import Image from "next/image";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface CartDrawerProps {
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout }) => {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    cartTotal,
    cartCount,
  } = useCart();

  const handleCheckoutClick = () => {
    closeCart();
    onCheckout();
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:max-w-md bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#1C1512]/5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-5 w-5 text-[#B78A62]" />
                <h2 className="font-serif text-xl font-bold text-[#1C1512]">
                  Your Cart ({cartCount})
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-[#FAF7F2] rounded-full text-[#1C1512] transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="p-4 bg-[#FAF7F2] rounded-full text-[#B78A62]">
                    <ShoppingBag className="h-10 w-10" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-[#1C1512]">
                      Your cart is empty
                    </h3>
                    <p className="font-sans text-sm text-[#8C8682] mt-1">
                      Looks like you haven't added anything to your cart yet.
                    </p>
                  </div>
                  <button
                    onClick={closeCart}
                    className="px-6 py-2.5 bg-[#B78A62] text-white font-sans text-sm font-semibold rounded-lg hover:bg-[#9E734D] transition-colors cursor-pointer"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <motion.div
                    layout
                    key={`${item.id}-${item.size}-${item.color || ""}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-start space-x-4 pb-6 border-b border-[#1C1512]/5 last:border-0 last:pb-0"
                  >
                    {/* Item Image */}
                    <div className="w-20 h-24 bg-[#FAF7F2] rounded-lg overflow-hidden flex-shrink-0 border border-[#1C1512]/5 relative">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-grow min-w-0">
                      <h4 className="font-sans text-sm font-semibold text-[#1C1512] truncate">
                        {item.name}
                      </h4>
                      <p className="font-sans text-xs text-[#8C8682] mt-0.5">
                        Size: <span className="font-bold text-[#1C1512]">{item.size}</span>
                        {item.color && (
                          <>
                            {" "}• Color: <span className="font-bold text-[#1C1512]">{item.color}</span>
                          </>
                        )}
                      </p>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-[#1C1512]/10 rounded-md bg-[#FAF7F2]">
                          <button
                            onClick={() => updateQuantity(item.id, item.size, item.quantity - 1, item.color)}
                            className="p-1.5 hover:text-[#B78A62] transition-colors cursor-pointer"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="px-2.5 font-sans text-xs font-bold text-[#1C1512]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.size, item.quantity + 1, item.color)}
                            className="p-1.5 hover:text-[#B78A62] transition-colors cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Price & Remove */}
                        <div className="flex items-center space-x-3">
                          <span className="font-sans text-sm font-bold text-[#B78A62]">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.id, item.size, item.color)}
                            className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-md text-[#8C8682] transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {cartItems.length > 0 && (
              <div className="p-6 bg-[#FAF7F2] border-t border-[#1C1512]/5 space-y-4">
                <div className="flex items-center justify-between font-sans">
                  <span className="text-sm font-medium text-[#8C8682]">Subtotal</span>
                  <span className="text-lg font-bold text-[#1C1512]">
                    ₦{cartTotal.toLocaleString()}
                  </span>
                </div>
                <p className="font-sans text-xs text-[#8C8682]">
                  Shipping calculated at checkout. Free shipping on orders over ₦50,000!
                </p>
                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={handleCheckoutClick}
                    className="w-full py-3.5 bg-[#B78A62] text-white font-sans text-sm font-semibold rounded-lg shadow hover:bg-[#9E734D] transition-colors cursor-pointer text-center"
                  >
                    Proceed to Checkout
                  </button>
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="w-full py-2.5 bg-white border border-[#1C1512]/10 hover:border-[#B78A62]/30 text-[#1C1512] font-sans text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
                  >
                    View Shopping Cart
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
