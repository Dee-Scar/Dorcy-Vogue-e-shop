"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const NIGERIA_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<"form" | "loading">("form");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedState, setSelectedState] = useState("");

  // State delivery fees loaded from admin settings
  const [stateFees, setStateFees] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadStateFees() {
      try {
        const { data } = await supabase
          .from("cms_settings")
          .select("store_settings")
          .eq("id", 1)
          .single();
        if (data?.store_settings?.stateFees) {
          setStateFees(data.store_settings.stateFees);
        }
      } catch {
        // silently fail — shipping will show as 0
      }
    }
    if (isOpen) {
      loadStateFees();
      const interval = setInterval(loadStateFees, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const shippingCost = selectedState ? (stateFees[selectedState] ?? 0) : 0;
  const orderTotal = cartTotal + shippingCost;
  const orderRef = "DV-" + Math.floor(100000 + Math.random() * 900000);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !address || !phone || !selectedState) {
      alert("Please fill in all required fields including your state.");
      return;
    }

    setStep("loading");

    try {
      const { error: orderError } = await supabase
        .from("orders")
        .insert({
          id: orderRef,
          user_id: user?.id || null,
          full_name: fullName,
          email: email,
          address: address,
          state: selectedState,
          phone: phone,
          shipping_cost: shippingCost,
          total_amount: orderTotal,
          payment_status: "Pending Payment",
          status: "Pending Payment",
        });

      if (orderError) throw orderError;

      const itemsToInsert = cartItems.map((item) => ({
        order_id: orderRef,
        product_id: item.id,
        product_name: item.name,
        size: item.size,
        color: item.color || "Default",
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      clearCart();
      router.push(`/checkout/upload?ref=${orderRef}&amount=${orderTotal}`);
      onClose();
      setStep("form");

      // Fire admin email notification (non-blocking)
      fetch("/api/notify-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "new_order",
          orderId: orderRef,
          customerName: fullName,
          customerEmail: email,
          customerPhone: phone,
          address: `${address}, ${selectedState}`,
          items: cartItems.map((item) => ({
            name: item.name,
            size: item.size,
            color: item.color || "Default",
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal: cartTotal,
          shippingCost,
          total: orderTotal,
        }),
      }).catch(() => {});
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
              {/* Left Column: Form */}
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
                  {/* Important Notice */}
                  <div className="flex gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="shrink-0 mt-0.5">
                      <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                      </svg>
                    </div>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <p className="font-sans text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                          Important Notice — Delivery Within Kaduna
                        </p>
                        <p className="font-sans text-xs text-amber-700 leading-relaxed">
                          We can't guarantee an exact delivery time. Our rider moves from one location to another until all deliveries are completed. The rider will call before coming.
                        </p>
                      </div>
                      <div className="space-y-1 pt-1 border-t border-amber-200">
                        <p className="font-sans text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                          Delivery Outside Kaduna
                        </p>
                        <p className="font-sans text-xs text-amber-700 leading-relaxed">
                          Please note that deliveries outside Kaduna attract different delivery fees. Each state has its own unique delivery charge based on the destination.
                        </p>
                      </div>
                    </div>
                  </div>

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
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#1C1512]/10 rounded-lg text-base focus:outline-none focus:border-[#B78A62] font-sans"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#1C1512]/10 rounded-lg text-base focus:outline-none focus:border-[#B78A62] font-sans"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Shipping Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#1C1512]/10 rounded-lg text-base focus:outline-none focus:border-[#B78A62] font-sans"
                    />
                    {/* State dropdown */}
                    <div className="relative">
                      <select
                        required
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#1C1512]/10 rounded-lg text-base focus:outline-none focus:border-[#B78A62] font-sans appearance-none cursor-pointer text-[#1C1512]"
                      >
                        <option value="" disabled>Select State</option>
                        {NIGERIA_STATES.map((state) => (
                          <option key={state} value={state}>
                            {state}{stateFees[state] ? ` — ₦${stateFees[state].toLocaleString()} delivery` : ""}
                          </option>
                        ))}
                      </select>
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C8682] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="Phone Number (e.g. +234...)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#1C1512]/10 rounded-lg text-base focus:outline-none focus:border-[#B78A62] font-sans"
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
                      <Truck className="h-4 w-4" />
                      Delivery{selectedState ? ` (${selectedState})` : ""}
                    </span>
                    <span className="font-bold text-[#1C1512]">
                      {!selectedState ? "Select state" : shippingCost > 0 ? `₦${shippingCost.toLocaleString()}` : "—"}
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
                <h3 className="font-serif text-xl font-bold text-[#1C1512]">Placing Your Order</h3>
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
