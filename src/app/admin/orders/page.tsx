"use client";

import React, { useState } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import MobileMenuButton from "@/components/admin/MobileMenuButton";
import { Search, Filter, Download, Eye } from "lucide-react";
import Link from "next/link";

type OrderStatus = "Delivered" | "Shipped" | "Preparing" | "Awaiting Verification" | "Pending Payment" | "Payment Confirmed";

const statusStyle: Record<OrderStatus, string> = {
  "Delivered": "text-emerald-600 bg-emerald-50",
  "Shipped": "text-blue-600 bg-blue-50",
  "Preparing": "text-yellow-600 bg-yellow-50",
  "Awaiting Verification": "text-orange-600 bg-orange-50",
  "Pending Payment": "text-gray-500 bg-gray-100",
  "Payment Confirmed": "text-emerald-600 bg-emerald-50",
};

interface Order {
  id: string;
  customer: string;
  phone: string;
  amount: string;
  status: OrderStatus;
  date: string;
}

const allOrders: Order[] = [
  { id: "DV-000156", customer: "Amara Johnson", phone: "0801234****", amount: "₦45,000", status: "Delivered", date: "Jun 20" },
  { id: "DV-000155", customer: "Chioma Eze", phone: "0803456****", amount: "₦32,500", status: "Shipped", date: "Jun 19" },
  { id: "DV-000154", customer: "Fatima Bello", phone: "0805678****", amount: "₦78,000", status: "Preparing", date: "Jun 19" },
  { id: "DV-000153", customer: "Grace Okafor", phone: "0807890****", amount: "₦15,000", status: "Awaiting Verification", date: "Jun 18" },
  { id: "DV-000152", customer: "Blessing Adeyemi", phone: "0809012****", amount: "₦95,000", status: "Pending Payment", date: "Jun 18" },
  { id: "DV-000151", customer: "Ngozi Udeh", phone: "0812345****", amount: "₦22,000", status: "Payment Confirmed", date: "Jun 17" },
  { id: "DV-000150", customer: "Kemi Adewale", phone: "0814567****", amount: "₦55,500", status: "Delivered", date: "Jun 17" },
];

const tabs = [
  { label: "All Orders", count: 156, filter: null },
  { label: "Pending", count: 23, filter: "Pending Payment" },
  { label: "Awaiting Verification", count: 12, filter: "Awaiting Verification" },
  { label: "Confirmed", count: 8, filter: "Payment Confirmed" },
  { label: "Shipped", count: 15, filter: "Shipped" },
  { label: "Delivered", count: 98, filter: "Delivered" },
];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = allOrders.filter((order) => {
    const matchesTab = activeTab === null || order.status === activeTab;
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Custom topbar */}
      <header className="h-14 sm:h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 flex-shrink-0">
        <div className="flex items-center gap-3">
          <MobileMenuButton />
          <h1 className="font-sans text-lg sm:text-xl font-semibold text-[#1C1512]">Orders</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8C8682]" />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#C9956A] transition-colors w-56"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-sans font-medium text-[#1C1512] hover:border-gray-300 transition-colors cursor-pointer">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-sans font-medium text-[#1C1512] hover:border-gray-300 transition-colors cursor-pointer">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-0">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.filter;
            return (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.filter)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold font-sans transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-[#C9956A] text-white shadow-sm"
                    : "text-[#8C8682] hover:text-[#1C1512] hover:bg-[#FAF7F2]"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            );
          })}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-gray-100">
                  <th className="text-left px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">Order #/Customer</th>
                  <th className="text-left px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">Phone</th>
                  <th className="text-right px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">Amount</th>
                  <th className="text-center px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">Date</th>
                  <th className="text-center px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF7F2]/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-sans text-sm font-semibold text-[#C9956A]">{order.id}</p>
                      <p className="font-sans text-sm text-[#1C1512]">{order.customer}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-sans text-sm text-[#8C8682]">{order.phone}</span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <span className="font-sans text-sm font-semibold text-[#1C1512]">{order.amount}</span>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold font-sans ${statusStyle[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <span className="font-sans text-sm text-[#8C8682]">{order.date}</span>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex p-1.5 text-[#8C8682] hover:text-[#C9956A] hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="font-sans text-sm text-[#8C8682]">No orders found.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
