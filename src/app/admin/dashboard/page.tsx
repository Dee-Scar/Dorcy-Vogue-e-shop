"use client";

import React from "react";
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
} from "lucide-react";
import Link from "next/link";

const stats = [
  {
    label: "Total Revenue",
    value: "₦2,450,000",
    icon: TrendingUp,
    color: "text-green-500",
    bg: "bg-green-50",
  },
  {
    label: "Total Orders",
    value: "156",
    icon: ShoppingBag,
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    label: "Pending Orders",
    value: "23",
    icon: Clock,
    color: "text-yellow-500",
    bg: "bg-yellow-50",
  },
  {
    label: "Awaiting Verification",
    value: "12",
    icon: FileCheck,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    label: "Delivered",
    value: "98",
    icon: CheckCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    label: "Customers",
    value: "1,247",
    icon: Users,
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
];

const recentOrders = [
  { id: "DV-000156", customer: "Amara Johnson", amount: "₦45,000", status: "Delivered", date: "Jun 20", statusColor: "text-emerald-600 bg-emerald-50" },
  { id: "DV-000155", customer: "Chioma Eze", amount: "₦32,500", status: "Shipped", date: "Jun 19", statusColor: "text-blue-600 bg-blue-50" },
  { id: "DV-000154", customer: "Fatima Bello", amount: "₦78,000", status: "Preparing", date: "Jun 19", statusColor: "text-yellow-600 bg-yellow-50" },
  { id: "DV-000153", customer: "Grace Okafor", amount: "₦15,000", status: "Awaiting Verification", date: "Jun 18", statusColor: "text-orange-600 bg-orange-50" },
  { id: "DV-000152", customer: "Blessing Adeyemi", amount: "₦95,000", status: "Pending Payment", date: "Jun 18", statusColor: "text-gray-600 bg-gray-100" },
];

const recentActivity = [
  { icon: CheckCheck, color: "bg-emerald-100 text-emerald-600", text: "Payment verified for DV-000151", time: "2 min ago" },
  { icon: Upload, color: "bg-blue-100 text-blue-600", text: "Receipt uploaded — DV-000153", time: "15 min ago" },
  { icon: Package, color: "bg-orange-100 text-orange-600", text: "New order DV-000156 placed", time: "1 hr ago" },
  { icon: Truck, color: "bg-purple-100 text-purple-600", text: "Driver assigned to DV-000149", time: "2 hrs ago" },
  { icon: CheckCircle, color: "bg-emerald-100 text-emerald-600", text: "Order DV-000148 delivered", time: "3 hrs ago" },
  { icon: AlertTriangle, color: "bg-red-100 text-red-500", text: "Low stock: Baggy Jeans (Size M)", time: "5 hrs ago" },
];

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <AdminTopbar title="Dashboard" />

      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {stats.map((stat) => (
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
          ))}
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
                  {recentOrders.map((order) => (
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
                  ))}
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
