"use client";

import React, { useState } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import MobileMenuButton from "@/components/admin/MobileMenuButton";
import { Plus, Edit2, Trash2, GripVertical, Star } from "lucide-react";

interface Category {
  name: string;
  productsCount: number;
  featured: boolean;
  status: "Active" | "Draft";
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([
    { name: "Jeans", productsCount: 24, featured: true, status: "Active" },
    { name: "Dresses", productsCount: 18, featured: true, status: "Active" },
    { name: "Two Piece Sets", productsCount: 12, featured: false, status: "Active" },
    { name: "Bags", productsCount: 31, featured: true, status: "Active" },
    { name: "Tops", productsCount: 15, featured: false, status: "Active" },
    { name: "Slides", productsCount: 22, featured: true, status: "Active" },
    { name: "T-Shirts", productsCount: 19, featured: false, status: "Draft" },
    { name: "Hoodies", productsCount: 0, featured: false, status: "Draft" },
    { name: "Jackets", productsCount: 0, featured: false, status: "Draft" },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatStatus, setNewCatStatus] = useState<"Active" | "Draft">("Active");
  const [newCatFeatured, setNewCatFeatured] = useState(false);

  const toggleFeatured = (index: number) => {
    setCategories((prev) =>
      prev.map((cat, idx) => (idx === index ? { ...cat, featured: !cat.featured } : cat))
    );
  };

  const deleteCategory = (index: number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      setCategories((prev) => prev.filter((_, idx) => idx !== index));
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setCategories((prev) => [
      ...prev,
      {
        name: newCatName.trim(),
        productsCount: 0,
        featured: newCatFeatured,
        status: newCatStatus,
      },
    ]);

    setNewCatName("");
    setNewCatStatus("Active");
    setNewCatFeatured(false);
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 relative">
      {/* Header */}
      <header className="h-14 sm:h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 flex-shrink-0">
        <div className="flex items-center gap-3">
          <MobileMenuButton />
          <h1 className="font-sans text-lg sm:text-xl font-semibold text-[#1C1512]">Categories</h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2 bg-[#C9956A] hover:bg-[#A87A52] text-white text-sm font-semibold font-sans rounded-xl transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-gray-100">
                <th className="text-left px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">Category Name</th>
                <th className="text-center px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">Products</th>
                <th className="text-center px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">Featured</th>
                <th className="text-center px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">Status</th>
                <th className="text-center px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((category, index) => (
                <tr key={index} className="hover:bg-[#FAF7F2]/40 transition-colors">
                  {/* Category Name */}
                  <td className="px-6 py-4 font-sans text-sm font-semibold text-[#1C1512]">
                    {category.name}
                  </td>
                  {/* Products count */}
                  <td className="px-6 py-4 text-center font-sans text-sm text-[#8C8682]">
                    {category.productsCount} items
                  </td>
                  {/* Featured */}
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleFeatured(index)}
                      className="inline-flex items-center justify-center p-1.5 rounded-lg text-gray-300 hover:text-yellow-500 hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                    >
                      {category.featured ? (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      ) : (
                        <span className="text-gray-300 font-semibold">—</span>
                      )}
                    </button>
                  </td>
                  {/* Status */}
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold font-sans ${
                        category.status === "Active"
                          ? "text-emerald-600 bg-emerald-50"
                          : "text-gray-500 bg-gray-100"
                      }`}
                    >
                      {category.status}
                    </span>
                  </td>
                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button className="p-1.5 text-[#8C8682] hover:text-[#1C1512] hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 text-[#8C8682] hover:text-[#1C1512] hover:bg-[#FAF7F2] rounded-lg cursor-grab transition-colors">
                        <GripVertical className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteCategory(index)}
                        className="p-1.5 text-[#8C8682] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#120E0D]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-[#1C1512]">Add Category</h2>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4">
              {/* Category Name */}
              <div className="space-y-1.5">
                <label className="block font-sans text-xs font-semibold text-[#1C1512] uppercase tracking-wider">
                  Category Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Slides"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-gray-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#C9956A] transition-colors"
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="block font-sans text-xs font-semibold text-[#1C1512] uppercase tracking-wider">
                  Status
                </label>
                <select
                  value={newCatStatus}
                  onChange={(e) => setNewCatStatus(e.target.value as "Active" | "Draft")}
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-gray-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#C9956A] transition-colors cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              {/* Featured toggle */}
              <div className="flex items-center gap-3 py-1">
                <input
                  type="checkbox"
                  id="featured-checkbox"
                  checked={newCatFeatured}
                  onChange={(e) => setNewCatFeatured(e.target.checked)}
                  className="w-4 h-4 text-[#C9956A] border-gray-300 rounded focus:ring-[#C9956A] cursor-pointer"
                />
                <label htmlFor="featured-checkbox" className="font-sans text-sm font-semibold text-[#1C1512] cursor-pointer select-none">
                  Mark as Featured Category
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 text-[#1C1512] text-sm font-semibold font-sans rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C9956A] hover:bg-[#A87A52] text-white text-sm font-semibold font-sans rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
