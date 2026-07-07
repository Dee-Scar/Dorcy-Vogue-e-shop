"use client";

import React, { useState, useEffect } from "react";
import MobileMenuButton from "@/components/admin/MobileMenuButton";
import { Search, Download, Eye, Mail, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Customer {
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpent: string;
  lastOrder: string;
}

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("email, full_name, phone, total_amount, created_at")
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Group by email
        const groups: Record<string, {
          name: string;
          phone: string;
          orders: number;
          totalSpent: number;
          lastOrder: Date;
        }> = {};

        (data || []).forEach((order: any) => {
          const email = order.email;
          if (!email) return;

          if (!groups[email]) {
            groups[email] = {
              name: order.full_name || email,
              phone: order.phone || "—",
              orders: 0,
              totalSpent: 0,
              lastOrder: new Date(order.created_at),
            };
          }

          groups[email].orders += 1;
          groups[email].totalSpent += Number(order.total_amount || 0);
          
          const orderDate = new Date(order.created_at);
          if (orderDate > groups[email].lastOrder) {
            groups[email].lastOrder = orderDate;
            groups[email].name = order.customer_name || groups[email].name;
            groups[email].phone = order.phone || groups[email].phone;
          }
        });

        const mapped: Customer[] = Object.keys(groups).map((email) => ({
          email,
          name: groups[email].name,
          phone: groups[email].phone,
          orders: groups[email].orders,
          totalSpent: "₦" + groups[email].totalSpent.toLocaleString(),
          lastOrder: groups[email].lastOrder.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        }));

        setCustomers(mapped);
      } catch (err) {
        console.error("Error fetching customers:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const handleExport = () => {
    alert("Exporting customer database...");
  };

  const handleEmailCustomer = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Top Header */}
      <header className="py-3 sm:h-16 bg-white border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-8 flex-shrink-0 gap-3 sm:gap-0">
        <div className="flex items-center gap-3">
          <MobileMenuButton />
          <h1 className="font-sans text-lg sm:text-xl font-semibold text-[#1C1512]">Customers</h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-sans bg-[#C9956A]/10 text-[#C9956A]">
            {loading ? "..." : `${customers.length} total`}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8C8682]" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#C9956A] transition-colors w-full sm:w-56"
            />
          </div>
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-sans font-medium text-[#1C1512] hover:border-gray-300 transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-gray-100">
                <th className="text-left px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">Customer</th>
                <th className="text-left px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">Phone</th>
                <th className="text-center px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">Orders</th>
                <th className="text-right px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">Total Spent</th>
                <th className="text-right px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">Last Order</th>
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
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <p className="font-sans text-sm text-[#8C8682]">No customers found.</p>
                  </td>
                </tr>
              ) : filtered.map((customer, idx) => (
                <tr key={idx} className="hover:bg-[#FAF7F2]/40 transition-colors">
                  {/* Name & Email */}
                  <td className="px-6 py-4">
                    <p className="font-sans text-sm font-semibold text-[#1C1512]">{customer.name}</p>
                    <p className="font-sans text-xs text-[#8C8682] mt-0.5">{customer.email}</p>
                  </td>
                  {/* Phone */}
                  <td className="px-6 py-4 font-sans text-sm text-[#1C1512]">
                    {customer.phone}
                  </td>
                  {/* Orders count */}
                  <td className="px-6 py-4 text-center font-sans text-sm font-semibold text-[#1C1512]">
                    {customer.orders}
                  </td>
                  {/* Total spent */}
                  <td className="px-6 py-4 text-right font-sans text-sm font-semibold text-[#1C1512]">
                    {customer.totalSpent}
                  </td>
                  {/* Last order date */}
                  <td className="px-6 py-4 text-right font-sans text-sm text-[#8C8682]">
                    {customer.lastOrder}
                  </td>
                  {/* Actions */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => alert(`Customer profile view for ${customer.name} coming soon!`)}
                        className="p-1.5 text-[#8C8682] hover:text-[#C9956A] hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer"
                        title="View profile"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEmailCustomer(customer.email)}
                        className="p-1.5 text-[#8C8682] hover:text-[#C9956A] hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer"
                        title="Email customer"
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </main>
    </div>
  );
}
