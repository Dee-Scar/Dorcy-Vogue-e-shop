"use client";

import React, { useState } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import Link from "next/link";
import { Plus, Search, Filter, Edit, Trash2, Eye } from "lucide-react";

const mockProducts = [
  { id: "DVP-001", name: "Baggy Jeans", category: "Bottoms", price: "₦45,000", stock: 12, status: "Active", image: "/about-photo.jpg" },
  { id: "DVP-002", name: "Oversized Blazer", category: "Tops", price: "₦78,000", stock: 5, status: "Active", image: "/about-photo.jpg" },
  { id: "DVP-003", name: "Linen Co-ord Set", category: "Sets", price: "₦95,000", stock: 0, status: "Out of Stock", image: "/about-photo.jpg" },
  { id: "DVP-004", name: "Midi Slip Dress", category: "Dresses", price: "₦55,000", stock: 8, status: "Active", image: "/about-photo.jpg" },
  { id: "DVP-005", name: "Wide-Leg Trousers", category: "Bottoms", price: "₦38,000", stock: 3, status: "Low Stock", image: "/about-photo.jpg" },
  { id: "DVP-006", name: "Crop Corset Top", category: "Tops", price: "₦28,000", stock: 15, status: "Active", image: "/about-photo.jpg" },
];

const statusStyle: Record<string, string> = {
  "Active": "text-emerald-600 bg-emerald-50",
  "Out of Stock": "text-red-600 bg-red-50",
  "Low Stock": "text-yellow-600 bg-yellow-50",
  "Draft": "text-gray-500 bg-gray-100",
};

export default function ProductsPage() {
  const [search, setSearch] = useState("");

  const filtered = mockProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <AdminTopbar title="Products" />

      <main className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8C8682]" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#C9956A] transition-colors"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-sans font-medium text-[#8C8682] hover:border-[#C9956A] transition-colors">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>

          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1C1007] hover:bg-[#2E1E0F] text-white text-sm font-semibold font-sans rounded-xl transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add New Product
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Products", value: mockProducts.length },
            { label: "Active", value: mockProducts.filter(p => p.status === "Active").length },
            { label: "Low Stock", value: mockProducts.filter(p => p.status === "Low Stock").length },
            { label: "Out of Stock", value: mockProducts.filter(p => p.status === "Out of Stock").length },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <p className="font-serif text-2xl font-bold text-[#1C1512]">{s.value}</p>
              <p className="font-sans text-xs text-[#8C8682] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-gray-100">
                <th className="text-left px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">Product</th>
                <th className="text-left px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">Category</th>
                <th className="text-right px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">Price</th>
                <th className="text-center px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">Stock</th>
                <th className="text-center px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">Status</th>
                <th className="text-center px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-[#FAF7F2]/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] border border-gray-100 overflow-hidden flex-shrink-0">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover object-top" />
                      </div>
                      <div>
                        <p className="font-sans text-sm font-semibold text-[#1C1512]">{product.name}</p>
                        <p className="font-sans text-xs text-[#8C8682]">{product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-sans text-sm text-[#1C1512]">{product.category}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-sans text-sm font-semibold text-[#1C1512]">{product.price}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-sans text-sm font-semibold ${product.stock === 0 ? "text-red-500" : product.stock <= 4 ? "text-yellow-500" : "text-[#1C1512]"}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold font-sans ${statusStyle[product.status]}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1.5 text-[#8C8682] hover:text-[#C9956A] hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer">
                        <Eye className="h-4 w-4" />
                      </button>
                      <Link href="/admin/products/new" className="p-1.5 text-[#8C8682] hover:text-[#1C1512] hover:bg-[#FAF7F2] rounded-lg transition-colors">
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button className="p-1.5 text-[#8C8682] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="font-sans text-sm text-[#8C8682]">No products found.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
