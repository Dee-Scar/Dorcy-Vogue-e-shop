"use client";

import React, { useState, useEffect } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import MobileMenuButton from "@/components/admin/MobileMenuButton";
import { Plus, Edit2, Trash2, GripVertical, Star, Loader2, X, ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Category {
  name: string;
  image: string;
  productsCount: number;
  featured: boolean;
  status: "Active" | "Draft";
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatImage, setNewCatImage] = useState("");
  const [newCatStatus, setNewCatStatus] = useState<"Active" | "Draft">("Active");
  const [newCatFeatured, setNewCatFeatured] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [uploadingAdd, setUploadingAdd] = useState(false);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editOriginalName, setEditOriginalName] = useState("");
  const [editCatName, setEditCatName] = useState("");
  const [editCatImage, setEditCatImage] = useState("");
  const [editCatStatus, setEditCatStatus] = useState<"Active" | "Draft">("Active");
  const [editCatFeatured, setEditCatFeatured] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingEdit, setUploadingEdit] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) throw error;

        const mapped: Category[] = (data || []).map((c: any) => ({
          name: c.name,
          image: c.image || "",
          productsCount: c.products_count || 0,
          featured: c.featured,
          status: c.status as "Active" | "Draft",
        }));

        setCategories(mapped);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  // Upload image to Supabase storage via signed URL
  const uploadImage = async (
    file: File,
    setUploading: (v: boolean) => void,
    setImage: (url: string) => void
  ) => {
    if (!file.type.startsWith("image/")) { alert("Please select an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { alert("Image must be under 5MB."); return; }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const signRes = await fetch("/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucket: "product-images", ext }),
      });
      const sign = await signRes.json();
      if (!signRes.ok) throw new Error(sign.error || "Could not start upload");

      const { error } = await supabase.storage
        .from("product-images")
        .uploadToSignedUrl(sign.path, sign.token, file, { contentType: file.type });
      if (error) throw new Error(error.message);

      setImage(sign.publicUrl);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const toggleFeatured = async (index: number) => {
    const cat = categories[index];
    const newFeatured = !cat.featured;
    try {
      const { error } = await supabase.from("categories").update({ featured: newFeatured }).eq("name", cat.name);
      if (error) throw error;
      setCategories((prev) => prev.map((c, idx) => (idx === index ? { ...c, featured: newFeatured } : c)));
    } catch (err) {
      console.error("Error updating category:", err);
      alert("Failed to update category.");
    }
  };

  const deleteCategory = async (index: number) => {
    const cat = categories[index];
    if (confirm(`Delete the category "${cat.name}"?`)) {
      try {
        const { error } = await supabase.from("categories").delete().eq("name", cat.name);
        if (error) throw error;
        setCategories((prev) => prev.filter((_, idx) => idx !== index));
      } catch (err) {
        console.error("Error deleting category:", err);
        alert("Failed to delete category.");
      }
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsAdding(true);
    try {
      const newCat = {
        name: newCatName.trim(),
        image: newCatImage.trim(),
        products_count: 0,
        featured: newCatFeatured,
        status: newCatStatus,
      };
      const { error } = await supabase.from("categories").insert(newCat);
      if (error) {
        if (error.code === "23505") { alert("A category with this name already exists."); }
        else throw error;
        return;
      }
      setCategories((prev) => [...prev, { name: newCat.name, image: newCat.image, productsCount: 0, featured: newCat.featured, status: newCat.status as "Active" | "Draft" }]);
      setNewCatName(""); setNewCatImage(""); setNewCatStatus("Active"); setNewCatFeatured(false);
      setShowAddModal(false);
      fetch("/api/revalidate", { method: "POST" }).catch(() => {});
    } catch (err) {
      console.error("Error adding category:", err);
      alert("Failed to add category.");
    } finally {
      setIsAdding(false);
    }
  };

  const openEditModal = (index: number) => {
    const cat = categories[index];
    setEditOriginalName(cat.name);
    setEditCatName(cat.name);
    setEditCatImage(cat.image || "");
    setEditCatStatus(cat.status);
    setEditCatFeatured(cat.featured);
    setShowEditModal(true);
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCatName.trim()) return;
    setIsEditing(true);
    try {
      const updatedFields = { name: editCatName.trim(), image: editCatImage.trim(), status: editCatStatus, featured: editCatFeatured };
      const { error } = await supabase.from("categories").update(updatedFields).eq("name", editOriginalName);
      if (error) {
        if (error.code === "23505") { alert("A category with this name already exists."); }
        else throw error;
        return;
      }
      setCategories((prev) => prev.map((c) => c.name === editOriginalName ? { ...c, ...updatedFields } : c));
      setShowEditModal(false);
      fetch("/api/revalidate", { method: "POST" }).catch(() => {});
    } catch (err) {
      console.error("Error editing category:", err);
      alert("Failed to update category.");
    } finally {
      setIsEditing(false);
    }
  };

  // Reusable image upload field
  const ImageField = ({
    value,
    onChange,
    uploading,
    onUpload,
  }: {
    value: string;
    onChange: (v: string) => void;
    uploading: boolean;
    onUpload: (f: File) => void;
  }) => (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Paste image URL or upload..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-[#FAF7F2] border border-gray-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#C9956A] transition-colors"
        />
        <label className={`flex items-center justify-center gap-1.5 px-4 bg-white border border-gray-200 hover:border-gray-300 text-xs font-semibold font-sans rounded-xl select-none ${uploading ? "opacity-60 cursor-wait" : "cursor-pointer"}`}>
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
          {uploading ? "Uploading" : "Upload"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }}
          />
        </label>
      </div>
      {value && (
        <div className="relative w-full h-28 rounded-xl overflow-hidden border border-gray-200 bg-[#FAF7F2]">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center cursor-pointer"
          >
            <X className="h-3.5 w-3.5 text-white" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 relative">
      {/* Header */}
      <header className="py-3 sm:h-16 bg-white border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-8 flex-shrink-0 gap-3 sm:gap-0">
        <div className="flex items-center gap-3">
          <MobileMenuButton />
          <h1 className="font-sans text-lg sm:text-xl font-semibold text-[#1C1512]">Categories</h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2 w-full sm:w-auto bg-[#C9956A] hover:bg-[#A87A52] text-white text-sm font-semibold font-sans rounded-xl transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Category</span>
          <span className="inline sm:hidden">Add</span>
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-gray-100">
                  <th className="text-left px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">Category</th>
                  <th className="text-center px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">Image</th>
                  <th className="text-center px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">Products</th>
                  <th className="text-center px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">Featured</th>
                  <th className="text-center px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">Status</th>
                  <th className="text-center px-6 py-3.5 font-sans text-xs font-semibold text-[#8C8682] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={6} className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[#C9956A]" /></td></tr>
                ) : categories.length === 0 ? (
                  <tr><td colSpan={6} className="py-16 text-center"><p className="font-sans text-sm text-[#8C8682]">No categories found.</p></td></tr>
                ) : categories.map((category, index) => (
                  <tr key={category.name} className="hover:bg-[#FAF7F2]/40 transition-colors">
                    <td className="px-6 py-4 font-sans text-sm font-semibold text-[#1C1512]">{category.name}</td>
                    <td className="px-6 py-4 text-center">
                      {category.image ? (
                        <img src={category.image} alt={category.name} className="w-12 h-10 object-cover rounded-lg mx-auto border border-gray-100" />
                      ) : (
                        <span className="text-xs text-[#8C8682] font-sans">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-sans text-sm text-[#8C8682]">{category.productsCount} items</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => toggleFeatured(index)} className="inline-flex items-center justify-center p-1.5 rounded-lg transition-colors cursor-pointer">
                        {category.featured ? <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> : <span className="text-gray-300 font-semibold">—</span>}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold font-sans ${category.status === "Active" ? "text-emerald-600 bg-emerald-50" : "text-gray-500 bg-gray-100"}`}>
                        {category.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => openEditModal(index)} className="p-1.5 text-[#8C8682] hover:text-[#1C1512] hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-[#8C8682] hover:text-[#1C1512] hover:bg-[#FAF7F2] rounded-lg cursor-grab transition-colors">
                          <GripVertical className="h-4 w-4" />
                        </button>
                        <button onClick={() => deleteCategory(index)} className="p-1.5 text-[#8C8682] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                          <Trash2 className="h-4 w-4" />
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

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#120E0D]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-[#1C1512]">Add Category</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-[#8C8682] hover:text-[#1C1512] rounded-lg cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddCategory} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="block font-sans text-xs font-semibold text-[#1C1512] uppercase tracking-wider">Category Name</label>
                <input type="text" placeholder="e.g. Baggy Jeans" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} required className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-gray-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#C9956A] transition-colors" />
              </div>
              {/* Image */}
              <div className="space-y-1.5">
                <label className="block font-sans text-xs font-semibold text-[#1C1512] uppercase tracking-wider">Category Image</label>
                <ImageField
                  value={newCatImage}
                  onChange={setNewCatImage}
                  uploading={uploadingAdd}
                  onUpload={(f) => uploadImage(f, setUploadingAdd, setNewCatImage)}
                />
              </div>
              {/* Status */}
              <div className="space-y-1.5">
                <label className="block font-sans text-xs font-semibold text-[#1C1512] uppercase tracking-wider">Status</label>
                <select value={newCatStatus} onChange={(e) => setNewCatStatus(e.target.value as "Active" | "Draft")} className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-gray-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#C9956A] transition-colors cursor-pointer">
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
              {/* Featured */}
              <div className="flex items-center gap-3 py-1">
                <input type="checkbox" id="featured-add" checked={newCatFeatured} onChange={(e) => setNewCatFeatured(e.target.checked)} className="w-4 h-4 text-[#C9956A] border-gray-300 rounded focus:ring-[#C9956A] cursor-pointer" />
                <label htmlFor="featured-add" className="font-sans text-sm font-semibold text-[#1C1512] cursor-pointer select-none">Mark as Featured Category</label>
              </div>
              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowAddModal(false)} disabled={isAdding} className="px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 text-[#1C1512] text-sm font-semibold font-sans rounded-xl transition-colors cursor-pointer disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isAdding || uploadingAdd} className="px-5 py-2 bg-[#C9956A] hover:bg-[#A87A52] text-white text-sm font-semibold font-sans rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2">
                  {isAdding && <Loader2 className="w-4 h-4 animate-spin" />}
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-[#120E0D]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-[#1C1512]">Edit Category</h2>
              <button onClick={() => setShowEditModal(false)} className="p-1 text-[#8C8682] hover:text-[#1C1512] rounded-lg cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleEditCategory} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="block font-sans text-xs font-semibold text-[#1C1512] uppercase tracking-wider">Category Name</label>
                <input type="text" placeholder="e.g. Baggy Jeans" value={editCatName} onChange={(e) => setEditCatName(e.target.value)} required className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-gray-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#C9956A] transition-colors" />
              </div>
              {/* Image */}
              <div className="space-y-1.5">
                <label className="block font-sans text-xs font-semibold text-[#1C1512] uppercase tracking-wider">Category Image</label>
                <ImageField
                  value={editCatImage}
                  onChange={setEditCatImage}
                  uploading={uploadingEdit}
                  onUpload={(f) => uploadImage(f, setUploadingEdit, setEditCatImage)}
                />
              </div>
              {/* Status */}
              <div className="space-y-1.5">
                <label className="block font-sans text-xs font-semibold text-[#1C1512] uppercase tracking-wider">Status</label>
                <select value={editCatStatus} onChange={(e) => setEditCatStatus(e.target.value as "Active" | "Draft")} className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-gray-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#C9956A] transition-colors cursor-pointer">
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
              {/* Featured */}
              <div className="flex items-center gap-3 py-1">
                <input type="checkbox" id="featured-edit" checked={editCatFeatured} onChange={(e) => setEditCatFeatured(e.target.checked)} className="w-4 h-4 text-[#C9956A] border-gray-300 rounded focus:ring-[#C9956A] cursor-pointer" />
                <label htmlFor="featured-edit" className="font-sans text-sm font-semibold text-[#1C1512] cursor-pointer select-none">Mark as Featured Category</label>
              </div>
              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowEditModal(false)} disabled={isEditing} className="px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 text-[#1C1512] text-sm font-semibold font-sans rounded-xl transition-colors cursor-pointer disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isEditing || uploadingEdit} className="px-5 py-2 bg-[#C9956A] hover:bg-[#A87A52] text-white text-sm font-semibold font-sans rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2">
                  {isEditing && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
