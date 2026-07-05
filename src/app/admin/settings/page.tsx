"use client";

import React, { useState } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import MobileMenuButton from "@/components/admin/MobileMenuButton";
import { Settings, Shield, CreditCard, Truck, Save } from "lucide-react";

export default function SettingsPage() {
  const [storeName, setStoreName] = useState("DORCY VOGUE");
  const [supportEmail, setSupportEmail] = useState("hello@dorcyvogue.com");
  const [supportPhone, setSupportPhone] = useState("08012345678");

  const [bankName, setBankName] = useState("Access Bank");
  const [accountNumber, setAccountNumber] = useState("0011223344");
  const [accountName, setAccountName] = useState("Dorcy Vogue Enterprises");

  const [flatDeliveryFee, setFlatDeliveryFee] = useState("₦3,500");
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState("₦50,000");

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Top Header */}
      <header className="py-3 sm:h-16 bg-white border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-8 flex-shrink-0 gap-3 sm:gap-0">
        <div className="flex items-center gap-3">
          <MobileMenuButton />
          <h1 className="font-sans text-lg sm:text-xl font-semibold text-[#1C1512]">Settings</h1>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-2 px-5 py-2 w-full sm:w-auto bg-[#C9956A] hover:bg-[#A87A52] text-white text-sm font-semibold font-sans rounded-xl transition-colors shadow-sm cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span className="hidden sm:inline">Save Settings</span>
          <span className="inline sm:hidden">Save</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-4xl space-y-6">
        {/* Store Profile */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-gray-50 pb-3">
            <Settings className="w-5 h-5 text-[#C9956A]" />
            <h2 className="font-serif text-base font-bold text-[#1C1512]">Store Profile</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">
                Store Name
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-gray-100 rounded-xl text-sm font-sans text-[#1C1512] focus:outline-none focus:border-[#C9956A]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">
                Support Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-gray-100 rounded-xl text-sm font-sans text-[#1C1512] focus:outline-none focus:border-[#C9956A]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">
                Support Phone
              </label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-gray-100 rounded-xl text-sm font-sans text-[#1C1512] focus:outline-none focus:border-[#C9956A]"
              />
            </div>
          </div>
        </div>

        {/* Bank Transfer details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-gray-50 pb-3">
            <CreditCard className="w-5 h-5 text-[#C9956A]" />
            <h2 className="font-serif text-base font-bold text-[#1C1512]">Payment Settings (Bank Transfer)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">
                Bank Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-gray-100 rounded-xl text-sm font-sans text-[#1C1512] focus:outline-none focus:border-[#C9956A]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">
                Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-gray-100 rounded-xl text-sm font-mono text-[#1C1512] focus:outline-none focus:border-[#C9956A]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">
                Account Name
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-gray-100 rounded-xl text-sm font-sans text-[#1C1512] focus:outline-none focus:border-[#C9956A]"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Delivery settings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-gray-50 pb-3">
            <Truck className="w-5 h-5 text-[#C9956A]" />
            <h2 className="font-serif text-base font-bold text-[#1C1512]">Delivery Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">
                Flat Rate Delivery Fee
              </label>
              <input
                type="text"
                value={flatDeliveryFee}
                onChange={(e) => setFlatDeliveryFee(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-gray-100 rounded-xl text-sm font-sans text-[#1C1512] focus:outline-none focus:border-[#C9956A]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">
                Free Delivery Threshold
              </label>
              <input
                type="text"
                value={freeDeliveryThreshold}
                onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-gray-100 rounded-xl text-sm font-sans text-[#1C1512] focus:outline-none focus:border-[#C9956A]"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
