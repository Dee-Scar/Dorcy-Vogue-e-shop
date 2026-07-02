"use client";

import React, { useState, Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { CartDrawer } from "@/components/CartDrawer";
import { useAuth } from "@/context/AuthContext";
import { Edit3, Check, Loader2, ArrowRight, Bell, Shield, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface OrderRow {
  ref: string;
  date: string;
  items: number;
  total: string;
  status: "Awaiting Payment" | "Delivered";
}

const MOCK_ORDERS: OrderRow[] = [
  { ref: "DV-2026-0042", date: "Jun 23, 2026", items: 3, total: "₦83,000", status: "Awaiting Payment" },
  { ref: "DV-2026-0038", date: "Jun 18, 2026", items: 1, total: "₦45,000", status: "Delivered" },
  { ref: "DV-2026-0031", date: "Jun 10, 2026", items: 2, total: "₦50,000", status: "Delivered" },
  { ref: "DV-2026-0025", date: "May 28, 2026", items: 4, total: "₦112,500", status: "Delivered" },
];

function ProfilePageContent() {
  const { user, login } = useAuth();
  const router = useRouter();

  // If no user is logged in, default to the Adaeze mockup session
  const displayName = user?.name || "Adaeze Okafor";
  const displayEmail = user?.email || "adaeze.okafor@gmail.com";

  // Tab state: "orders" | "profile" | "settings"
  const [activeTab, setActiveTab] = useState<"orders" | "profile" | "settings">("orders");

  // Form states
  const [editName, setEditName] = useState(displayName);
  const [editEmail, setEditEmail] = useState(displayEmail);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Settings states
  const [notifyOrder, setNotifyOrder] = useState(true);
  const [notifyPromo, setNotifyPromo] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      // Sync with context
      login(editName, editEmail);
      setTimeout(() => setSaveSuccess(false), 2000);
    }, 1200);
  };

  return (
    <div className="flex-grow flex flex-col pt-[80px] bg-[#FAF7F2] min-h-screen">
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow space-y-10">
        
        {/* Profile Header Block */}
        <div className="bg-white border border-[#1C1512]/5 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Avatar Circle */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#C19A6B] rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold border-2 border-white shadow-md">
              {getInitials(displayName)}
            </div>
            
            {/* Name/Email Info */}
            <div className="space-y-1">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1512] tracking-wide">
                {displayName}
              </h1>
              <p className="font-sans text-xs sm:text-sm text-[#8C8682]">
                {displayEmail}
              </p>
            </div>
          </div>

          {/* Edit Profile Button */}
          <button
            onClick={() => setActiveTab("profile")}
            className="flex items-center space-x-1.5 px-4 py-2 border border-[#1C1512]/10 hover:border-[#B78A62] text-[#1C1512] hover:text-[#B78A62] bg-white rounded-lg text-xs font-semibold shadow-sm transition-all duration-300 cursor-pointer"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Tab Controls Navigation */}
        <div className="border-b border-[#1C1512]/10 flex space-x-8">
          {[
            { id: "orders", label: "My Orders" },
            { id: "profile", label: "Profile" },
            { id: "settings", label: "Settings" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 font-sans text-xs sm:text-sm font-semibold tracking-wider transition-all duration-300 relative cursor-pointer ${
                  isActive ? "text-[#B78A62]" : "text-[#8C8682] hover:text-[#1C1512]"
                }`}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeProfileTabLine"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B78A62]"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            
            {/* Orders Tab */}
            {activeTab === "orders" && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-serif text-lg font-bold text-[#1C1512]">
                    Recent Orders
                  </h3>
                  <button
                    onClick={() => router.push("/shop")}
                    className="font-sans text-xs font-bold text-[#B78A62] hover:text-[#9E734D] flex items-center space-x-1 hover:translate-x-0.5 transition-all"
                  >
                    <span>View All</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Orders List Table Container */}
                <div className="bg-white border border-[#1C1512]/5 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm min-w-[700px]">
                      <thead>
                        <tr className="bg-[#F6F1EA] text-[#8C8682] font-semibold uppercase tracking-wider text-[10px] sm:text-xs">
                          <th className="py-4.5 px-6">Order #</th>
                          <th className="py-4.5 px-6">Date</th>
                          <th className="py-4.5 px-6 text-center">Items</th>
                          <th className="py-4.5 px-6 text-right">Total</th>
                          <th className="py-4.5 px-6 text-center">Status</th>
                          <th className="py-4.5 px-6 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1C1512]/5 font-semibold">
                        {MOCK_ORDERS.map((order) => (
                          <tr key={order.ref} className="hover:bg-[#FAF7F2]/40 transition-colors">
                            <td className="py-4.5 px-6 text-[#1C1512] font-mono">
                              #{order.ref}
                            </td>
                            <td className="py-4.5 px-6 text-[#8C8682]">
                              {order.date}
                            </td>
                            <td className="py-4.5 px-6 text-center text-[#1C1512]">
                              {order.items}
                            </td>
                            <td className="py-4.5 px-6 text-right text-[#1C1512]">
                              {order.total}
                            </td>
                            <td className="py-4.5 px-6 text-center">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${
                                  order.status === "Awaiting Payment"
                                    ? "bg-amber-50 text-amber-700 border border-amber-100/50"
                                    : "bg-green-50 text-green-700 border border-green-100/50"
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${order.status === "Awaiting Payment" ? "bg-amber-500 animate-pulse" : "bg-green-500"}`} />
                                {order.status}
                              </span>
                            </td>
                            <td className="py-4.5 px-6 text-center">
                              <button
                                onClick={() => {
                                  // Strip direct symbol parameters for tracker compatibility
                                  const searchRef = order.ref.replace("#", "");
                                  router.push(`/track?ref=${searchRef}`);
                                }}
                                className="font-sans text-xs font-bold text-[#B78A62] hover:text-[#9E734D] flex items-center justify-center space-x-0.5 mx-auto hover:translate-x-0.5 transition-transform cursor-pointer"
                              >
                                <span>View</span>
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-xl bg-white border border-[#1C1512]/5 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6"
              >
                <h3 className="font-serif text-lg font-bold text-[#1C1512] tracking-wide">
                  Account Details
                </h3>

                <form onSubmit={handleProfileSave} className="space-y-4">
                  {/* Name field */}
                  <div className="space-y-1.5 text-left">
                    <label className="font-sans text-[10px] font-bold text-[#1C1512] uppercase tracking-wider">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#1C1512]/10 rounded-lg text-sm focus:outline-none focus:border-[#B78A62] font-sans font-semibold"
                    />
                  </div>

                  {/* Email field */}
                  <div className="space-y-1.5 text-left">
                    <label className="font-sans text-[10px] font-bold text-[#1C1512] uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#1C1512]/10 rounded-lg text-sm focus:outline-none focus:border-[#B78A62] font-sans font-semibold"
                    />
                  </div>

                  {/* Submit buttons */}
                  <div className="pt-2 flex items-center space-x-4">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2.5 bg-[#B78A62] hover:bg-[#9E734D] text-white font-sans text-xs font-semibold rounded-lg shadow-sm transition-all duration-300 cursor-pointer flex items-center space-x-1.5"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Changes</span>
                      )}
                    </button>

                    {/* Success prompt */}
                    <AnimatePresence>
                      {saveSuccess && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          className="font-sans text-xs font-semibold text-green-600 flex items-center space-x-1"
                        >
                          <Check className="h-4 w-4" />
                          <span>Details updated!</span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl bg-white border border-[#1C1512]/5 rounded-2xl p-6 sm:p-8 shadow-sm divide-y divide-[#1C1512]/5 font-sans"
              >
                {/* Notification Settings */}
                <div className="pb-6 space-y-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-[#FAF7F2] text-[#B78A62] rounded-lg">
                      <Bell className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-[#1C1512] tracking-wide">
                      Notifications
                    </h3>
                  </div>

                  <div className="space-y-4 pt-2">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="space-y-0.5">
                        <p className="text-xs sm:text-sm font-bold text-[#1C1512]">Order Updates</p>
                        <p className="text-[11px] text-[#8C8682] font-semibold">Receive emails on order delivery steps</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifyOrder}
                        onChange={(e) => setNotifyOrder(e.target.checked)}
                        className="accent-[#B78A62] h-4.5 w-4.5 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="space-y-0.5">
                        <p className="text-xs sm:text-sm font-bold text-[#1C1512]">Exclusive Offers</p>
                        <p className="text-[11px] text-[#8C8682] font-semibold">Get notified on seasonal collection promotions</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifyPromo}
                        onChange={(e) => setNotifyPromo(e.target.checked)}
                        className="accent-[#B78A62] h-4.5 w-4.5 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* Privacy settings */}
                <div className="py-6 space-y-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-[#FAF7F2] text-[#B78A62] rounded-lg">
                      <Shield className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-[#1C1512] tracking-wide">
                      Security & Privacy
                    </h3>
                  </div>

                  <div className="space-y-4 pt-2">
                    <button
                      onClick={() => alert("Mock password reset link sent to your email.")}
                      className="text-xs sm:text-sm font-bold text-[#B78A62] hover:text-[#9E734D] transition-colors cursor-pointer"
                    >
                      Reset Password
                    </button>
                    <p className="text-[11px] text-[#8C8682] font-semibold leading-relaxed">
                      Your credentials are saved locally in the mock workspace session database and encrypted using standard browser containers.
                    </p>
                  </div>
                </div>

                {/* Preferences */}
                <div className="pt-6 space-y-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-[#FAF7F2] text-[#B78A62] rounded-lg">
                      <Globe className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-[#1C1512] tracking-wide">
                      Preferences
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs sm:text-sm font-bold text-[#1C1512]">Currency</span>
                    <span className="text-xs font-semibold text-[#8C8682] uppercase bg-[#FAF7F2] px-2.5 py-1 rounded border border-[#1C1512]/5">
                      NGN (₦)
                    </span>
                  </div>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>

      <CartDrawer onCheckout={() => {}} />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col pt-[80px] bg-[#FAF7F2] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#B78A62]" />
        </div>
      }
    >
      <Navbar />
      <ProfilePageContent />
      <CartDrawer onCheckout={() => {}} />
    </Suspense>
  );
}
