"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, ShoppingBag, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<"form" | "loading" | "success">("form");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  if (!isOpen) return null;

  // Calculate Shipping (Free over ₦30,000, else ₦3,000)
  const shippingCost = cartTotal >= 30000 ? 0 : 3000;
  const orderTotal = cartTotal + shippingCost;
  const orderRef = "DV-" + Math.floor(100000 + Math.random() * 900000);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !address || !phone) {
      alert("Please fill in all required shipping fields.");
      return;
    }

    setStep("loading");

    try {
      // 1. Insert order record
      const { error: orderError } = await supabase
        .from("orders")
        .insert({
          id: orderRef,
          user_id: user?.id || null,
          full_name: fullName,
          email: email,
          address: address,
          phone: phone,
          shipping_cost: shippingCost,
          total_amount: orderTotal,
          payment_status: "Pending Payment",
          status: "Pending Payment"
        });

      if (orderError) throw orderError;

      // 2. Insert order items record
      const itemsToInsert = cartItems.map((item) => ({
        order_id: orderRef,
        product_id: item.id,
        product_name: item.name,
        size: item.size,
        color: item.color || "Default",
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // 3. Clear cart and redirect
      clearCart();
      router.push(`/checkout/success?amount=${orderTotal}&ref=${orderRef}`);
      onClose();
      setStep("form");
    } catch (err: any) {
      alert("Error placing order: " + (err.message || err));
      setStep("form");
    }
  };

  const handleClose = () => {
    setStep("form");
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black cursor-pointer"
        />

        {/* Modal Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl relative border border-[#1C1512]/5 z-10"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-[#FAF7F2] rounded-full text-[#1C1512] transition-colors cursor-pointer z-20"
          >
            <X className="h-5 w-5" />
          </button>

          {step === "form" && (
            <div className="grid grid-cols-1 md:grid-cols-2 max-h-[90vh] md:max-h-[85vh] overflow-y-auto">
              {/* Left Column: Form details */}
              <form onSubmit={handlePlaceOrder} className="p-8 md:p-10 space-y-6">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#1C1512] tracking-wide">
                    Shipping & Payment
                  </h2>
                  <p className="font-sans text-xs text-[#8C8682] mt-1">
                    Complete your details to place your order.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-sans text-xs font-bold text-[#B78A62] uppercase tracking-wider">
                    1. Shipping Information
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#1C1512]/10 rounded-lg text-sm focus:outline-none focus:border-[#B78A62] font-sans"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#1C1512]/10 rounded-lg text-sm focus:outline-none focus:border-[#B78A62] font-sans"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Shipping Address (Nigeria)"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#1C1512]/10 rounded-lg text-sm focus:outline-none focus:border-[#B78A62] font-sans"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Phone Number (e.g. +234...)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#1C1512]/10 rounded-lg text-sm focus:outline-none focus:border-[#B78A62] font-sans"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#B78A62] hover:bg-[#9E734D] text-white font-sans text-sm font-semibold rounded-lg shadow-md transition-colors cursor-pointer text-center"
                >
                  Place Order (Bank Transfer)
                </button>
              </form>

              {/* Right Column: Order Summary */}
              <div className="bg-[#FAF7F2] p-8 md:p-10 border-t md:border-t-0 md:border-l border-[#1C1512]/5 flex flex-col justify-between">
                <div className="space-y-6">
                  <h3 className="font-serif text-lg font-bold text-[#1C1512] tracking-wide">
                    Order Summary
                  </h3>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {cartItems.length === 0 ? (
                      <p className="font-sans text-sm text-[#8C8682]">No items in cart</p>
                    ) : (
                      cartItems.map((item) => (
                        <div key={`${item.id}-${item.size}`} className="flex items-center space-x-3 text-sm">
                          <div className="w-12 h-16 object-cover rounded-lg bg-white border border-[#1C1512]/5 overflow-hidden relative shrink-0">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-grow min-w-0">
                            <h4 className="font-sans font-semibold text-[#1C1512] truncate">
                              {item.name}
                            </h4>
                            <p className="font-sans text-xs text-[#8C8682]">
                              Size: {item.size} • Qty: {item.quantity}
                            </p>
                          </div>
                          <span className="font-sans font-bold text-[#1C1512]">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="border-t border-[#1C1512]/10 pt-6 mt-6 space-y-3 font-sans text-sm">
                  <div className="flex justify-between text-[#8C8682]">
                    <span>Subtotal</span>
                    <span className="font-bold text-[#1C1512]">₦{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#8C8682] items-center">
                    <span className="flex items-center gap-1">
                      <Truck className="h-4 w-4" /> Shipping
                    </span>
                    <span className="font-bold text-[#1C1512]">
                      {shippingCost === 0 ? "FREE" : `₦${shippingCost.toLocaleString()}`}
                    </span>
                  </div>
                  <hr className="border-[#1C1512]/10" />
                  <div className="flex justify-between items-center text-base">
                    <span className="font-semibold text-[#1C1512]">Order Total</span>
                    <span className="font-extrabold text-[#B78A62] text-lg">
                      ₦{orderTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "loading" && (
            <div className="p-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 border-4 border-[#B78A62] border-t-transparent rounded-full animate-spin" />
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1C1512]">Processing Payment</h3>
                <p className="font-sans text-sm text-[#8C8682] mt-1">
                  Please do not refresh the page or click back.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
