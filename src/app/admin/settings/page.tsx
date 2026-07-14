"use client";

import React, { useState, useEffect } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import MobileMenuButton from "@/components/admin/MobileMenuButton";
import { Settings, Shield, CreditCard, Truck, Save, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface StoreSettings {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  flatDeliveryFee: string;
  freeDeliveryThreshold: string;
  stateFees: Record<string, number>;
}

const NIGERIA_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "DORCY VOGUE",
  supportEmail: "hello@dorcyvogue.com",
  supportPhone: "08012345678",
  bankName: "Access Bank",
  accountNumber: "0011223344",
  accountName: "Dorcy Vogue Enterprises",
  flatDeliveryFee: "3500",
  freeDeliveryThreshold: "50000",
  stateFees: Object.fromEntries(NIGERIA_STATES.map((s) => [s, 3500])),
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load settings from Supabase on mount
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("cms_settings")
          .select("store_settings")
          .eq("id", 1)
          .single();

        if (error) {
          // If column doesn't exist yet, just use defaults
          console.warn("Could not load store_settings:", error.message);
        } else if (data?.store_settings) {
          setSettings({ ...DEFAULT_SETTINGS, ...data.store_settings });
        }
      } catch (e) {
        console.warn("Settings load error:", e);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const updateField = (key: keyof StoreSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const updateStateFee = (state: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      stateFees: { ...prev.stateFees, [state]: Number(value) || 0 },
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const { error } = await supabase
        .from("cms_settings")
        .update({ store_settings: settings, updated_at: new Date().toISOString() })
        .eq("id", 1);

      if (error) throw error;

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 bg-[#FAF7F2] border border-gray-100 rounded-xl text-sm font-sans text-[#1C1512] focus:outline-none focus:border-[#C9956A] focus:ring-1 focus:ring-[#C9956A]/30 transition";

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Top Header */}
      <header className="py-3 sm:h-16 bg-white border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-8 flex-shrink-0 gap-3 sm:gap-0">
        <div className="flex items-center gap-3">
          <MobileMenuButton />
          <h1 className="font-sans text-lg sm:text-xl font-semibold text-[#1C1512]">Settings</h1>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {error && (
            <p className="text-xs text-red-500 font-sans">{error}</p>
          )}
          {saved && (
            <span className="flex items-center gap-1.5 text-green-600 text-sm font-sans font-medium">
              <CheckCircle className="w-4 h-4" /> Saved!
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center justify-center gap-2 px-5 py-2 w-full sm:w-auto bg-[#C9956A] hover:bg-[#A87A52] disabled:opacity-60 text-white text-sm font-semibold font-sans rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{saving ? "Saving…" : "Save Settings"}</span>
            <span className="inline sm:hidden">{saving ? "Saving…" : "Save"}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-4xl space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#C9956A] animate-spin" />
            <span className="ml-3 text-[#8C8682] font-sans text-sm">Loading settings…</span>
          </div>
        ) : (
          <>
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
                    value={settings.storeName}
                    onChange={(e) => updateField("storeName", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => updateField("supportEmail", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">
                    Support Phone
                  </label>
                  <input
                    type="text"
                    value={settings.supportPhone}
                    onChange={(e) => updateField("supportPhone", e.target.value)}
                    className={inputClass}
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
                    value={settings.bankName}
                    onChange={(e) => updateField("bankName", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={settings.accountNumber}
                    onChange={(e) => updateField("accountNumber", e.target.value)}
                    className={`${inputClass} font-mono`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={settings.accountName}
                    onChange={(e) => updateField("accountName", e.target.value)}
                    className={inputClass}
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
                    Flat Rate Delivery Fee (₦)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#8C8682] font-sans">₦</span>
                    <input
                      type="number"
                      value={settings.flatDeliveryFee}
                      onChange={(e) => updateField("flatDeliveryFee", e.target.value)}
                      className={`${inputClass} pl-8`}
                      placeholder="3500"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">
                    Free Delivery Threshold (₦)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#8C8682] font-sans">₦</span>
                    <input
                      type="number"
                      value={settings.freeDeliveryThreshold}
                      onChange={(e) => updateField("freeDeliveryThreshold", e.target.value)}
                      className={`${inputClass} pl-8`}
                      placeholder="50000"
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#8C8682] font-sans">
                Orders above the free delivery threshold will have shipping cost automatically waived at checkout.
              </p>
            </div>

            {/* Per-State Delivery Fees */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                <div className="flex items-center gap-2.5">
                  <Truck className="w-5 h-5 text-[#C9956A]" />
                  <h2 className="font-serif text-base font-bold text-[#1C1512]">Delivery Fee Per State</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const fee = prompt("Set same fee for all states (₦):");
                    if (fee !== null && !isNaN(Number(fee))) {
                      setSettings((prev) => ({
                        ...prev,
                        stateFees: Object.fromEntries(NIGERIA_STATES.map((s) => [s, Number(fee)])),
                      }));
                      setSaved(false);
                    }
                  }}
                  className="text-xs font-semibold font-sans text-[#C9956A] hover:text-[#A87A52] cursor-pointer"
                >
                  Set all to same fee
                </button>
              </div>
              <p className="text-xs text-[#8C8682] font-sans -mt-2">
                Set the delivery fee for each Nigerian state. Customers select their state at checkout and this fee is added to their order.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {NIGERIA_STATES.map((state) => (
                  <div key={state} className="flex items-center gap-2">
                    <span className="font-sans text-xs font-semibold text-[#1C1512] w-32 shrink-0 truncate">{state}</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#8C8682] font-sans">₦</span>
                      <input
                        type="number"
                        min="0"
                        value={settings.stateFees?.[state] ?? 3500}
                        onChange={(e) => updateStateFee(state, e.target.value)}
                        className="w-full pl-7 pr-2 py-2 bg-[#FAF7F2] border border-gray-100 rounded-lg text-sm font-sans text-[#1C1512] focus:outline-none focus:border-[#C9956A] transition"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security note */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex gap-3">
              <Shield className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-sans text-sm font-semibold text-amber-800">Admin Access Only</p>
                <p className="font-sans text-xs text-amber-700 mt-1">
                  These settings are protected and only visible to authenticated admins. Payment details entered here will be shown to customers at checkout.
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
