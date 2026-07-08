"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutModal } from "@/components/CheckoutModal";
import { useCart } from "@/context/CartContext";
import { Plus, Minus, X, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    cartTotal,
    cartCount,
  } = useCart();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Delivery Fee Calculation (₦5,000 Flat to match mockup if items exist, otherwise 0)
  const deliveryFee = cartItems.length > 0 ? 5000 : 0;
  const grandTotal = cartTotal + deliveryFee;

  return (
    <div className="flex-grow flex flex-col pt-[80px] bg-[#FAF7F2] min-h-screen select-none">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow">
        {cartItems.length === 0 ? (
          <div className="py-20 text-center space-y-4 max-w-md mx-auto">
            <div className="inline-flex p-4 bg-white border border-[#1C1512]/5 rounded-full text-[#B78A62] shadow-sm">
              <ShoppingBag className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h1 className="font-serif text-2xl font-bold text-[#1C1512]">Your Cart is Empty</h1>
              <p className="font-sans text-sm text-[#8C8682] leading-relaxed">
                Add premium items to your cart to explore the checkout experience.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 px-6 py-3 bg-[#B78A62] text-white font-sans text-xs font-semibold rounded-lg hover:bg-[#9E734D] transition-colors shadow-sm"
            >
              Continue Shopping <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Cart items (8 cols on desktop) */}
            <div className="lg:col-span-8 space-y-6">
              <div>
                <h1 className="font-serif text-3xl font-bold text-[#1C1512] tracking-wide">
                  Shopping Cart
                </h1>
                <p className="font-sans text-xs text-[#8C8682] mt-1.5 font-semibold">
                  {cartCount} {cartCount === 1 ? "item" : "items"}
                </p>
              </div>

              <div className="border-t border-[#1C1512]/10 divide-y divide-[#1C1512]/5">
                <AnimatePresence initial={false}>
                  {cartItems.map((item) => (
                    <motion.div
                      layout
                      key={`${item.id}-${item.size}-${item.color || ""}`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="py-6 flex items-start sm:items-center justify-between gap-4"
                    >
                      {/* Image & Details Column */}
                      <div className="flex items-center space-x-4 min-w-0">
                        {/* Image */}
                        <div className="w-20 h-24 sm:w-24 sm:h-30 bg-[#FAF7F2] rounded-lg overflow-hidden border border-[#1C1512]/5 flex-shrink-0 relative">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </div>

                        {/* Title & Selection options */}
                        <div className="min-w-0">
                          <h3 className="font-serif text-base sm:text-lg font-bold text-[#1C1512] truncate hover:text-[#B78A62] transition-colors">
                            <Link href={`/product/${item.id}`}>{item.name}</Link>
                          </h3>
                          <p className="font-sans text-xs text-[#8C8682] mt-1">
                            Size: <span className="font-bold text-[#1C1512]">{item.size}</span>
                            {item.color && (
                              <>
                                {" "}• Color: <span className="font-bold text-[#1C1512]">{item.color}</span>
                              </>
                            )}
                          </p>

                          {/* Quantity selectors */}
                          <div className="flex items-center border border-[#1C1512]/10 rounded-md bg-[#FAF7F2] w-fit mt-3 sm:mt-4 shadow-sm">
                            <button
                              onClick={() => updateQuantity(item.id, item.size, item.quantity - 1, item.color)}
                              className="p-1.5 hover:text-[#B78A62] transition-colors cursor-pointer"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="px-3.5 font-sans text-xs font-bold text-[#1C1512]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.size, item.quantity + 1, item.color)}
                              className="p-1.5 hover:text-[#B78A62] transition-colors cursor-pointer"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Price & Action Column */}
                      <div className="flex items-center space-x-6 shrink-0">
                        <span className="font-sans text-base sm:text-lg font-extrabold text-[#1C1512]">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </span>
                        
                        <button
                          onClick={() => removeFromCart(item.id, item.size, item.color)}
                          className="p-2 hover:bg-red-50 hover:text-red-500 text-[#8C8682] rounded-lg transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Column: Order Summary (4 cols on desktop) */}
            <div className="lg:col-span-4 bg-white border border-[#1C1512]/5 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="font-serif text-xl font-bold text-[#1C1512] tracking-wide">
                Order Summary
              </h2>

              <div className="space-y-4 font-sans text-sm">
                <div className="flex justify-between text-[#8C8682]">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#1C1512]">₦{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#8C8682]">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-[#1C1512]">₦{deliveryFee.toLocaleString()}</span>
                </div>
                <hr className="border-[#1C1512]/10" />
                <div className="flex justify-between items-center text-base">
                  <span className="font-semibold text-[#1C1512]">Total</span>
                  <span className="font-extrabold text-[#B78A62] text-lg">
                    ₦{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full py-4 bg-[#B78A62] hover:bg-[#9E734D] text-white font-sans text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-center cursor-pointer"
              >
                Proceed to Checkout
              </button>
            </div>
            
          </div>
        )}
      </main>

      {/* Global Modals */}
      <CartDrawer onCheckout={() => setIsCheckoutOpen(true)} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </div>
  );
}
