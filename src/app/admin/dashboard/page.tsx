"use client";

import React, { useState, useEffect } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  FileCheck,
  CheckCircle,
  Users,
  CheckCheck,
  Upload,
  Package,
  Truck,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface StatItem {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

interface RecentOrder {
  id: string;
  customer: string;
  amount: string;
  status: string;
  date: string;
  statusColor: string;
}

const statusColorMap: Record<string, string> = {
  "Delivered": "text-emerald-600 bg-emerald-50",
  "Shipped": "text-blue-600 bg-blue-50",
  "Preparing Order": "text-yellow-600 bg-yellow-50",
  "Awaiting Verification": "text-orange-600 bg-orange-50",
  "Pending Payment": "text-gray-600 bg-gray-100",
  "Payment Confirmed": "text-emerald-600 bg-emerald-50",
  "Driver Assigned": "text-purple-600 bg-purple-50",
};

const recentActivity = [
  { icon: CheckCheck, color: "bg-emerald-100 text-emerald-600", text: "Dashboard loaded with live data", time: "Just now" },
  { icon: Upload, color: "bg-blue-100 text-blue-600", text: "Supabase integration active", time: "Active" },
  { icon: Package, color: "bg-orange-100 text-orange-600", text: "Orders synced from database", time: "Real-time" },
  { icon: Truck, color: "bg-purple-100 text-purple-600", text: "Delivery tracking enabled", time: "Live" },
  { icon: CheckCircle, color: "bg-emerald-100 text-emerald-600", text: "Payment verification active", time: "Online" },
  { icon: AlertTriangle, color: "bg-red-100 text-red-500", text: "Low stock alerts monitoring", time: "Enabled" },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch all orders
        const { data: orders, error } = await supabase
          .from("orders")
          .select("id, status, payment_status, total_amount, created_at, full_name, email, phone")
          .order("created_at", { ascending: false });

        if (error) {
          console.warn("Dashboard: Could not fetch orders (RLS may be blocking):", error.message);
          // Don't throw — just use empty array
        }

        const allOrders = orders || [];

        // Total Revenue = only confirmed payments, not pending
        const totalRevenue = allOrders
          .filter(o => o.payment_status === "Confirmed")
          .reduce((acc, o) => acc + Number(o.total_amount || 0), 0);

        const totalCount = allOrders.length;
        const pendingOrders = allOrders.filter(o =>
          o.status === "Pending Payment" || o.status === "Awaiting Verification"
        );
        const pendingCount = pendingOrders.length;
        const pendingTotal = pendingOrders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0);
        const awaitingCount = allOrders.filter(o => o.status === "Awaiting Verification").length;
        const deliveredCount = allOrders.filter(o => o.status === "Delivered").length;

        // Count unique customers by email
        const uniqueEmails = new Set(allOrders.map(o => o.email).filter(Boolean));
        const customerCount = uniqueEmails.size;

        setStats([
          {
            label: "Total Revenue",
            value: "₦" + totalRevenue.toLocaleString(),
            icon: TrendingUp,
            color: "text-green-500",
            bg: "bg-green-50",
          },
          {
            label: "Total Orders",
            value: String(totalCount),
            icon: ShoppingBag,
            color: "text-orange-500",
            bg: "bg-orange-50",
          },
          {
            label: "Pending Orders",
            value: `${pendingCount} · ₦${pendingTotal.toLocaleString()}`,
            icon: Clock,
            color: "text-yellow-500",
            bg: "bg-yellow-50",
          },
          {
            label: "Awaiting Verification",
            value: String(awaitingCount),
            icon: FileCheck,
            color: "text-blue-500",
            bg: "bg-blue-50",
          },
          {
            label: "Delivered",
            value: String(deliveredCount),
            icon: CheckCircle,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
          },
          {
            label: "Customers",
            value: customerCount.toLocaleString(),
            icon: Users,
            color: "text-purple-500",
            bg: "bg-purple-50",
          },
        ]);

        // Recent orders (top 5)
        const recent: RecentOrder[] = allOrders.slice(0, 5).map((o) => ({
          id: o.id,
          customer: o.full_name || o.email || "Unknown",
          amount: "₦" + Number(o.total_amount || 0).toLocaleString(),
          status: o.status,
          date: new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          statusColor: statusColorMap[o.status] || "text-gray-600 bg-gray-100",
        }));

        setRecentOrders(recent);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        // Fallback to zeros
        setStats([
          { label: "Total Revenue", value: "₦0", icon: TrendingUp, color: "text-green-500", bg: "bg-green-50" },
          { label: "Total Orders", value: "0", icon: ShoppingBag, color: "text-orange-500", bg: "bg-orange-50" },
          { label: "Pending Orders", value: "0", icon: Clock, color: "text-yellow-500", bg: "bg-yellow-50" },
          { label: "Awaiting Verification", value: "0", icon: FileCheck, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Delivered", value: "0", icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Customers", value: "0", icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <AdminTopbar title="Dashboard" />

      <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse">
                <div className="w-9 h-9 rounded-xl bg-gray-100 mb-3" />
                <div className="h-6 bg-gray-100 rounded w-16 mb-1" />
                <div className="h-3 bg-gray-50 rounded w-20" />
              </div>
            ))
          ) : (
            stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                  <stat.icon className={`h-4.5 w-4.5 ${stat.color}`} style={{ width: 18, height: 18 }} />
                </div>
                <p className="font-serif text-xl font-bold text-[#1C1512] leading-tight">{stat.value}</p>
                <p className="font-sans text-xs text-[#8C8682] mt-0.5">{stat.label}</p>
              </div>
            ))
          )}
        </div>

        {/* Bottom Row: Recent Orders + Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-sans text-base font-semibold text-[#1C1512]">Recent Orders</h2>
              <Link
                href="/admin/orders"
                className="font-sans text-xs font-semibold text-[#C9956A] hover:text-[#A87A52] transition-colors"
              >
                View All →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#FAF7F2]">
                    <th className="text-left px-6 py-3 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">Order #/Customer</th>
                    <th className="text-right px-6 py-3 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">Amount</th>
                    <th className="text-center px-6 py-3 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">Status</th>
                    <th className="text-right px-6 py-3 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#C9956A]" />
                      </td>
                    </tr>
                  ) : recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center font-sans text-sm text-[#8C8682]">
                        No orders yet. Orders will appear here once customers place them.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                        <td className="px-6 py-4">
                          <Link href={`/admin/orders/${order.id}`} className="hover:underline inline-block">
                            <p className="font-sans text-sm font-semibold text-[#C9956A]">{order.id}</p>
                          </Link>
                          <p className="font-sans text-sm text-[#1C1512]">{order.customer}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-sans text-sm font-semibold text-[#1C1512]">{order.amount}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold font-sans ${order.statusColor}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-sans text-sm text-[#8C8682]">{order.date}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-sans text-base font-semibold text-[#1C1512]">Recent Activity</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {recentActivity.map((item, index) => (
                <div key={index} className="flex items-start gap-3.5 px-5 py-4">
                  <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <item.icon style={{ width: 14, height: 14 }} />
                  </div>
                  <div>
                    <p className="font-sans text-sm text-[#1C1512] leading-snug">{item.text}</p>
                    <p className="font-sans text-xs text-[#8C8682] mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
