"use client";

import React, { useState, useEffect } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import Link from "next/link";
import { Plus, Search, Filter, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  stock: number;
  status: string;
  image: string;
}

const statusStyle: Record<string, string> = {
  "Active": "text-emerald-600 bg-emerald-50",
  "Out of Stock": "text-red-600 bg-red-50",
  "Low Stock": "text-yellow-600 bg-yellow-50",
  "Draft": "text-gray-500 bg-gray-100",
};

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id,name,category,price,stock,status,image")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const mapped: Product[] = (data || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: "₦" + Number(p.price).toLocaleString(),
          stock: p.stock,
          status: p.stock === 0 ? "Out of Stock" : p.stock <= 4 ? "Low Stock" : p.status,
          image: p.image,
        }));

        setProducts(mapped);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      setProducts(products.filter(p => p.id !== id));
      alert("Product deleted successfully");
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product");
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <AdminTopbar title="Products" />

      <main className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto flex-1 min-w-0">
            {/* Search */}
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8C8682]" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#C9956A] transition-colors"
              />
            </div>
            <button className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-sans font-medium text-[#8C8682] hover:border-[#C9956A] transition-colors">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>

          <Link
            href="/admin/products/new"
            className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 w-full sm:w-auto bg-[#1C1007] hover:bg-[#2E1E0F] text-white text-sm font-semibold font-sans rounded-xl transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add New Product</span>
            <span className="inline sm:hidden">Add Product</span>
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Products", value: products.length },
            { label: "Active", value: products.filter(p => p.status === "Active").length },
            { label: "Low Stock", value: products.filter(p => p.status === "Low Stock").length },
            { label: "Out of Stock", value: products.filter(p => p.status === "Out of Stock").length },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <p className="font-serif text-2xl font-bold text-[#1C1512]">{loading ? "..." : s.value}</p>
              <p className="font-sans text-xs text-[#8C8682] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-gray-100">
                  <th className="text-left px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider whitespace-nowrap">Product</th>
                  <th className="text-left px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider whitespace-nowrap">Category</th>
                  <th className="text-right px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider whitespace-nowrap">Price</th>
                  <th className="text-center px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider whitespace-nowrap">Stock</th>
                  <th className="text-center px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="text-center px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider whitespace-nowrap">Actions</th>
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
                    <p className="font-sans text-sm text-[#8C8682]">No products found.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
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
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold font-sans ${statusStyle[product.status] || "text-gray-500 bg-gray-100"}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/product/${product.id}`} target="_blank" className="p-1.5 text-[#8C8682] hover:text-[#C9956A] hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer">
                          <Eye className="h-4 w-4" />
                        </Link>                        <Link href={`/admin/products/new?id=${product.id}`} className="p-1.5 text-[#8C8682] hover:text-[#1C1512] hover:bg-[#FAF7F2] rounded-lg transition-colors">
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-1.5 text-[#8C8682] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
