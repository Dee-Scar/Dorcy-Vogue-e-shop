"use client";

import React, { useState } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import MobileMenuButton from "@/components/admin/MobileMenuButton";
import { Search, Download, Eye, Mail } from "lucide-react";

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
  const [customers, setCustomers] = useState<Customer[]>([
    { name: "Amara Johnson", email: "amara@email.com", phone: "08034521678", orders: 8, totalSpent: "₦245,000", lastOrder: "Jun 20, 2026" },
    { name: "Chioma Eze", email: "chioma@email.com", phone: "08091234567", orders: 5, totalSpent: "₦162,500", lastOrder: "Jun 19, 2026" },
    { name: "Fatima Bello", email: "fatima@email.com", phone: "08056789012", orders: 12, totalSpent: "₦478,000", lastOrder: "Jun 19, 2026" },
    { name: "Grace Okafor", email: "grace@email.com", phone: "08012345678", orders: 3, totalSpent: "₦57,000", lastOrder: "Jun 18, 2026" },
    { name: "Blessing Adeyemi", email: "blessing@email.com", phone: "08078901234", orders: 6, totalSpent: "₦195,000", lastOrder: "Jun 18, 2026" },
    { name: "Ngozi Okoli", email: "ngozi@email.com", phone: "08045678901", orders: 2, totalSpent: "₦38,500", lastOrder: "Jun 17, 2026" },
    { name: "Aisha Mohammed", email: "aisha@email.com", phone: "08023456789", orders: 15, totalSpent: "₦620,000", lastOrder: "Jun 16, 2026" },
    { name: "Kemi Ogundimu", email: "kemi@email.com", phone: "08067890123", orders: 4, totalSpent: "₦88,000", lastOrder: "Jun 15, 2026" },
  ]);

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
      <header className="h-14 sm:h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 flex-shrink-0">
        <div className="flex items-center gap-3">
          <MobileMenuButton />
          <h1 className="font-sans text-lg sm:text-xl font-semibold text-[#1C1512]">Customers</h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-sans bg-[#C9956A]/10 text-[#C9956A]">
            1,247 total
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8C8682]" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#C9956A] transition-colors w-56"
            />
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-sans font-medium text-[#1C1512] hover:border-gray-300 transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
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
              {filtered.map((customer, idx) => (
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

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="font-sans text-sm text-[#8C8682]">No customers found.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
