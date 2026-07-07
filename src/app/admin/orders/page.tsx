"use client";

import React, { useState, useEffect } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import MobileMenuButton from "@/components/admin/MobileMenuButton";
import { Search, Filter, Download, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type OrderStatus = "Delivered" | "Shipped" | "Preparing Order" | "Awaiting Verification" | "Pending Payment" | "Payment Confirmed" | "Driver Assigned";

const statusStyle: Record<string, string> = {
  "Delivered": "text-emerald-600 bg-emerald-50",
  "Shipped": "text-blue-600 bg-blue-50",
  "Preparing Order": "text-yellow-600 bg-yellow-50",
  "Awaiting Verification": "text-orange-600 bg-orange-50",
  "Pending Payment": "text-gray-500 bg-gray-100",
  "Payment Confirmed": "text-emerald-600 bg-emerald-50",
  "Driver Assigned": "text-purple-600 bg-purple-50",
};

interface Order {
  id: string;
  customer: string;
  phone: string;
  amount: string;
  status: OrderStatus;
  date: string;
}

interface TabDef {
  label: string;
  count: number;
  filter: string | null;
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabs, setTabs] = useState<TabDef[]>([]);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("id, full_name, email, phone, total_amount, status, created_at")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const orders: Order[] = (data || []).map((o: any) => ({
          id: o.id,
          customer: o.full_name || o.email || "Unknown",
          phone: o.phone || "—",
          amount: "₦" + Number(o.total_amount || 0).toLocaleString(),
          status: o.status as OrderStatus,
          date: new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        }));

        setAllOrders(orders);

        // Build tabs with real counts
        const statusCounts: Record<string, number> = {};
        orders.forEach((o) => {
          statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
        });

        setTabs([
          { label: "All Orders", count: orders.length, filter: null },
          { label: "Pending", count: statusCounts["Pending Payment"] || 0, filter: "Pending Payment" },
          { label: "Awaiting Verification", count: statusCounts["Awaiting Verification"] || 0, filter: "Awaiting Verification" },
          { label: "Confirmed", count: statusCounts["Payment Confirmed"] || 0, filter: "Payment Confirmed" },
          { label: "Preparing", count: statusCounts["Preparing Order"] || 0, filter: "Preparing Order" },
          { label: "Shipped", count: statusCounts["Shipped"] || 0, filter: "Shipped" },
          { label: "Delivered", count: statusCounts["Delivered"] || 0, filter: "Delivered" },
        ]);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

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
      <header className="py-3 sm:h-16 bg-white border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-8 flex-shrink-0 gap-3 sm:gap-0">
        <div className="flex items-center gap-3">
          <MobileMenuButton />
          <h1 className="font-sans text-lg sm:text-xl font-semibold text-[#1C1512]">Orders</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8C8682]" />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#C9956A] transition-colors w-full sm:w-56"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-sans font-medium text-[#1C1512] hover:border-gray-300 transition-colors cursor-pointer">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </button>
          <button className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-sans font-medium text-[#1C1512] hover:border-gray-300 transition-colors cursor-pointer">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
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
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#C9956A]" />
                    </td>
                  </tr>
                ) : (
                  filtered.map((order) => (
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
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold font-sans ${statusStyle[order.status] || "text-gray-500 bg-gray-100"}`}>
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="font-sans text-sm text-[#8C8682]">No orders found.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
