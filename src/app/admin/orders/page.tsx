"use client";

import React, { useState, useEffect } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import MobileMenuButton from "@/components/admin/MobileMenuButton";
import { Search, Filter, Download, Eye, Loader2, X } from "lucide-react";
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
  email: string;
  phone: string;
  address: string;
  state: string;
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

  // Date range export modal
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("id, full_name, email, phone, address, state, total_amount, status, created_at, order_items(product_name, quantity, size, color, price)")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const orders: Order[] = (data || []).map((o: any) => ({
          id: o.id,
          customer: o.full_name || o.email || "Unknown",
          email: o.email || "—",
          phone: o.phone || "—",
          address: o.address || "—",
          state: o.state || "—",
          amount: "₦" + Number(o.total_amount || 0).toLocaleString(),
          rawAmount: Number(o.total_amount || 0),
          items: (o.order_items || []).map((i: any) => `${i.product_name} (${i.size}${i.color && i.color !== "Default" ? "/" + i.color : ""} x${i.quantity})`).join("; "),
          status: o.status as OrderStatus,
          date: new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
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

  const handleExport = (fromDate?: string, toDate?: string) => {
    let exportOrders: any[] = filtered.length > 0 ? filtered : allOrders;

    // Apply date range filter if provided
    if (fromDate || toDate) {
      exportOrders = exportOrders.filter((o: any) => {
        const orderDate = new Date(o.date);
        if (fromDate && orderDate < new Date(fromDate)) return false;
        if (toDate && orderDate > new Date(toDate + "T23:59:59")) return false;
        return true;
      });
    }

    const exportDate = new Date().toLocaleDateString("en-NG", { dateStyle: "medium" });
    const dateRange = fromDate || toDate
      ? ` | ${fromDate ? new Date(fromDate).toLocaleDateString("en-NG", { dateStyle: "medium" }) : "All"} — ${toDate ? new Date(toDate).toLocaleDateString("en-NG", { dateStyle: "medium" }) : "Today"}`
      : "";

    const rows = exportOrders.map((o: any, idx: number) => `
      <tr style="background:${idx % 2 === 0 ? "#fff" : "#faf7f2"}">
        <td>${o.id}</td>
        <td>${o.customer}</td>
        <td>${o.email}</td>
        <td>${o.phone}</td>
        <td>${o.address}, ${o.state}</td>
        <td style="max-width:200px;word-break:break-word">${(o as any).items || "—"}</td>
        <td style="font-weight:700;color:#b78a62">${o.amount}</td>
        <td><span style="padding:2px 8px;border-radius:20px;font-size:11px;background:#f0fdf4;color:#16a34a">${o.status}</span></td>
        <td>${o.date}</td>
      </tr>`).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>Dorcy Vogue — Orders Export</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 11px; color: #1c1512; padding: 20px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #b78a62; padding-bottom: 12px; }
        .header h1 { font-size: 20px; color: #1c1512; }
        .header p { font-size: 11px; color: #8c8682; }
        .badge { background: #b78a62; color: white; padding: 3px 10px; border-radius: 20px; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th { background: #1c1512; color: white; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        td { padding: 7px 10px; border-bottom: 1px solid #f0ece6; vertical-align: top; }
        .footer { margin-top: 20px; text-align: center; font-size: 10px; color: #8c8682; border-top: 1px solid #f0ece6; padding-top: 10px; }
        @media print { body { padding: 0; } }
      </style></head><body>
      <div class="header">
        <div>
          <h1>DORCY VOGUE</h1>
          <p>Orders Report — Exported on ${exportDate}${dateRange}</p>
        </div>
        <span class="badge">${exportOrders.length} Orders</span>
      </div>
      <table>
        <thead><tr>
          <th>Order ID</th><th>Customer</th><th>Email</th><th>Phone</th>
          <th>Delivery Address</th><th>Items Ordered</th><th>Amount</th><th>Status</th><th>Date</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="footer">Dorcy Vogue — Premium Nigerian Fashion &nbsp;|&nbsp; dorcyvogue.com</div>
      </body></html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => { win.print(); }, 500);
    }
  };

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
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-[#C9956A] hover:bg-[#A87A52] text-white border border-[#C9956A] rounded-xl text-sm font-sans font-semibold transition-colors cursor-pointer">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export PDF</span>
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

      {/* Export Date Range Modal — bottom sheet mobile, centered on desktop */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center sm:p-4" style={{ background: "rgba(0,0,0,0.4)" }} onClick={() => setShowExportModal(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-sm sm:rounded-2xl"
            style={{
              background: "#fff",
              borderRadius: "20px 20px 0 0",
              padding: "20px 20px 32px",
              boxSizing: "border-box",
            }}
          >
            {/* Mobile drag handle */}
            <div className="sm:hidden" style={{ width: 40, height: 4, background: "#e5e0d8", borderRadius: 2, margin: "0 auto 16px" }} />

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontFamily: "serif", fontSize: 16, fontWeight: 700, color: "#1C1512" }}>Export Orders as PDF</span>
              <button onClick={() => setShowExportModal(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                <X style={{ width: 16, height: 16, color: "#8C8682" }} />
              </button>
            </div>

            {/* Description */}
            <p style={{ fontFamily: "sans-serif", fontSize: 12, color: "#8C8682", marginBottom: 16, lineHeight: 1.5 }}>
              Select a date range to filter orders before exporting. Leave blank to export all current orders.
            </p>

            {/* From Date */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontFamily: "sans-serif", fontSize: 10, fontWeight: 700, color: "#1C1512", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                From Date
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="date"
                  value={exportFrom}
                  onChange={(e) => setExportFrom(e.target.value)}
                  style={{
                    display: "block",
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "11px 12px",
                    background: "#FAF7F2",
                    border: "1px solid #e5e0d8",
                    borderRadius: 10,
                    fontSize: 14,
                    outline: "none",
                    color: exportFrom ? "#1C1512" : "transparent",
                  }}
                />
                {!exportFrom && (
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#aaa", pointerEvents: "none", fontFamily: "sans-serif" }}>
                    dd/mm/yyyy
                  </span>
                )}
              </div>
            </div>

            {/* To Date */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontFamily: "sans-serif", fontSize: 10, fontWeight: 700, color: "#1C1512", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                To Date
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="date"
                  value={exportTo}
                  onChange={(e) => setExportTo(e.target.value)}
                  style={{
                    display: "block",
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "11px 12px",
                    background: "#FAF7F2",
                    border: "1px solid #e5e0d8",
                    borderRadius: 10,
                    fontSize: 14,
                    outline: "none",
                    color: exportTo ? "#1C1512" : "transparent",
                  }}
                />
                {!exportTo && (
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#aaa", pointerEvents: "none", fontFamily: "sans-serif" }}>
                    dd/mm/yyyy
                  </span>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowExportModal(false)}
                style={{ flex: 1, padding: "12px 8px", background: "#fff", border: "1px solid #e5e0d8", borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: "sans-serif", color: "#1C1512", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowExportModal(false); handleExport(exportFrom || undefined, exportTo || undefined); }}
                style={{ flex: 1, padding: "12px 8px", background: "#C9956A", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: "sans-serif", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                <Download style={{ width: 14, height: 14, flexShrink: 0 }} />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
