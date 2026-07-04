"use client";

import React, { useState } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { MessageSquare, RefreshCw, Key, Power, Bell, CheckCircle } from "lucide-react";

export default function WhatsAppPage() {
  const [isConnected, setIsConnected] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("+234 801 234 5678");
  const [apiKey, setApiKey] = useState("••••••••••••••••••••••••");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [triggers, setTriggers] = useState([
    { id: "order_created", label: "Send notification when order is created", enabled: true },
    { id: "payment_confirmed", label: "Send receipt when payment is verified", enabled: true },
    { id: "driver_assigned", label: "Send driver details on assignment", enabled: false },
    { id: "delivery_completed", label: "Send delivery confirmation feedback link", enabled: true },
  ]);

  const toggleTrigger = (id: string) => {
    setTriggers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    );
  };

  const handleTestMessage = () => {
    const testNum = prompt("Enter phone number to send test message (with country code):", "+234");
    if (testNum) {
      alert(`Test WhatsApp message sent successfully to ${testNum}!`);
    }
  };

  const handleDisconnect = () => {
    if (confirm("Are you sure you want to disconnect WhatsApp API?")) {
      setIsConnected(false);
    }
  };

  const handleConnect = () => {
    const num = prompt("Enter WhatsApp Business Phone Number:", phoneNumber);
    if (num) {
      setPhoneNumber(num);
      setIsConnected(true);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 flex-shrink-0">
        <h1 className="font-sans text-xl font-semibold text-[#1C1512]">WhatsApp Integration</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 max-w-4xl space-y-6">
        {/* Connection Status Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${isConnected ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-[#1C1512]">WhatsApp Business Cloud API</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-sans ${
                  isConnected ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                }`}>
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <p className="font-sans text-sm text-[#8C8682] mt-1.5">
                {isConnected
                  ? `Active connection using number ${phoneNumber}`
                  : "Connect your WhatsApp Business API account to automate customer updates."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleTestMessage}
              disabled={!isConnected}
              className="px-4 py-2 border border-gray-200 hover:border-gray-300 disabled:opacity-50 text-[#1C1512] text-xs font-bold font-sans rounded-xl transition-colors cursor-pointer"
            >
              Send Test
            </button>
            {isConnected ? (
              <button
                onClick={handleDisconnect}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold font-sans rounded-xl transition-colors cursor-pointer"
              >
                <Power className="w-3.5 h-3.5" />
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleConnect}
                className="flex items-center gap-2 px-4 py-2 bg-[#C9956A] hover:bg-[#A87A52] text-white text-xs font-bold font-sans rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                <Power className="w-3.5 h-3.5" />
                Connect API
              </button>
            )}
          </div>
        </div>

        {/* Credentials Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-gray-50 pb-3">
            <Key className="w-5 h-5 text-[#C9956A]" />
            <h2 className="font-serif text-base font-bold text-[#1C1512]">API Credentials</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">
                WhatsApp Phone ID
              </label>
              <input
                type="text"
                value="109848575020193"
                disabled
                className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-gray-100 rounded-xl text-sm font-sans text-[#1C1512] focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">
                API Token / Access Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-gray-100 rounded-xl text-sm font-mono text-[#1C1512] focus:outline-none focus:border-[#C9956A]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications & Triggers Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-gray-50 pb-3">
            <Bell className="w-5 h-5 text-[#C9956A]" />
            <h2 className="font-serif text-base font-bold text-[#1C1512]">Auto Message Triggers</h2>
          </div>

          <div className="divide-y divide-gray-50">
            {triggers.map((trigger) => (
              <div key={trigger.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <span className="font-sans text-sm font-semibold text-[#1C1512]">{trigger.label}</span>
                <button
                  onClick={() => toggleTrigger(trigger.id)}
                  className={`w-11 h-6 rounded-full transition-colors relative outline-none cursor-pointer ${
                    trigger.enabled ? "bg-[#C9956A]" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.75 transition-all ${
                      trigger.enabled ? "left-5.5" : "left-0.75"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
