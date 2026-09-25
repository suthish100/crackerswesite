'use client';

import React, { useEffect, useState } from 'react';
import { Category } from '@/types';

interface CategoryWithCount extends Category {
  _count?: { products: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  // Category Edit / Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Spotify-Style Drag and Drop Reordering state
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [reorderList, setReorderList] = useState<CategoryWithCount[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (e) {
      console.error('Fetch categories error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // The request resolves asynchronously; this synchronizes the initial remote state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (c: CategoryWithCount) => {
    setEditingCategory(c);
    setName(c.name);
    setDescription(c.description || '');
    setIsActive(c.isActive);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const payload = { name, description: description || undefined, isActive };
    const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : '/api/admin/categories';
    const method = editingCategory ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchCategories();
      } else {
        alert(data.message || 'Save failed');
      }
    } catch (e) {
      console.error('Save category error:', e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchCategories();
      else alert(data.message);
    } catch (e) {
      console.error('Delete category error:', e);
    }
  };

  // --- Spotify-Style Reordering Methods ---
  const openReorderModal = () => {
    setReorderList([...categories]);
    setDraggedIndex(null);
    setDragOverIndex(null);
    setOrderSuccessMessage(null);
    setIsReorderModalOpen(true);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    // Left target
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...reorderList];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    setReorderList(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= reorderList.length) return;
    const updated = [...reorderList];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedItem);
    setReorderList(updated);
  };

  const saveNewOrder = async () => {
    setIsSavingOrder(true);
    setOrderSuccessMessage(null);
    try {
      const orderedIds = reorderList.map((c) => c.id);
      const res = await fetch('/api/admin/categories/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      });
      const data = await res.json();
      if (data.success) {
        // Update local state with the newly sorted list and adjusted sortOrders
        const updatedWithSortOrders = reorderList.map((cat, idx) => ({
          ...cat,
          sortOrder: idx,
        }));
        setCategories(updatedWithSortOrders);
        setOrderSuccessMessage('Category order saved! Quick Order and Explore Crackers updated instantly.');
        setTimeout(() => {
          setIsReorderModalOpen(false);
          setOrderSuccessMessage(null);
        }, 1200);
      } else {
        alert(data.message || 'Failed to save category order');
      }
    } catch (e) {
      console.error('Failed to save category order:', e);
      alert('Error updating category order');
    } finally {
      setIsSavingOrder(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-sm">Loading categories...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Categories Management</h1>
          <p className="text-slate-400 text-xs mt-1">
            Organize products into festival categories. Live storefront pages respect your custom ordering.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Spotify-style Reorder Button */}
          <button
            onClick={openReorderModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 font-bold text-xs shadow-md transition-all hover:border-amber-400"
            title="Click to drag and reorder categories just like in Spotify"
          >
            <span className="text-base leading-none">🔀</span>
            <span>Reorder Categories</span>
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
          >
            + Add New Category
          </button>
        </div>
      </div>

      {/* Main Categories Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {/* Mobile Swipe Hint */}
        <div className="md:hidden px-4 py-2 bg-slate-950/70 border-b border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <span>👉</span>
            <span>Scroll sideways to view all columns & actions</span>
          </span>
          <span className="text-[10px] font-mono text-amber-400/80 bg-slate-800/80 px-2 py-0.5 rounded-full">
            swipe ↔
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[720px]">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-4 w-16 text-center whitespace-nowrap"># Order</th>
                <th className="p-4 min-w-[170px] whitespace-nowrap">Name</th>
                <th className="p-4 min-w-[140px] whitespace-nowrap">Slug</th>
                <th className="p-4 min-w-[180px]">Description</th>
                <th className="p-4 min-w-[110px] whitespace-nowrap">Product Count</th>
                <th className="p-4 min-w-[90px] whitespace-nowrap">Status</th>
                <th className="p-4 min-w-[130px] text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {categories.map((c, idx) => (
                <tr key={c.id} className="hover:bg-slate-950/40 transition-colors">
                  <td className="p-4 text-center whitespace-nowrap">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700 font-mono font-bold text-amber-400 text-xs shadow-xs">
                      {c.sortOrder !== undefined ? c.sortOrder + 1 : idx + 1}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-white text-sm whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span>{c.name}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-slate-400 whitespace-nowrap">{c.slug}</td>
                  <td className="p-4 text-slate-400 max-w-xs truncate">{c.description || '-'}</td>
                  <td className="p-4 font-bold text-amber-400 whitespace-nowrap">{c._count?.products || 0} items</td>
                  <td className="p-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        c.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => openEditModal(c)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Spotify-Style Reorder Drag & Drop Modal --- */}
      {isReorderModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xl font-bold">
                  🔀
                </div>
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    Reorder Categories
                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Spotify Style
                    </span>
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Drag and drop rows to reorder. Quick Order and Explore Crackers will instantly match this sequence!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReorderModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Success Message Banner */}
            {orderSuccessMessage && (
              <div className="mx-5 mt-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <span>✅</span>
                <span>{orderSuccessMessage}</span>
              </div>
            )}

            {/* Draggable Category Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between px-2">
                <span>Hold & drag handle <strong className="text-white font-mono">⠿</strong> or use the arrows</span>
                <span>{reorderList.length} categories total</span>
              </div>

              {reorderList.map((cat, index) => {
                const isDragging = draggedIndex === index;
                const isOver = dragOverIndex === index;

                return (
                  <div
                    key={cat.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`group flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all select-none cursor-grab active:cursor-grabbing ${
                      isDragging
                        ? 'opacity-40 border-amber-500 bg-amber-500/10 scale-[0.98]'
                        : isOver
                        ? 'border-amber-400 bg-slate-800 shadow-lg scale-[1.01]'
                        : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-800/80'
                    }`}
                  >
                    {/* Left: Grab Handle, Rank Number, Category Details */}
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Spotify Drag Handle */}
                      <span className="text-slate-500 group-hover:text-amber-400 font-mono text-base px-1 transition-colors">
                        ⠿
                      </span>

                      {/* Rank Position */}
                      <span className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>

                      {/* Name & Product Count */}
                      <div className="min-w-0">
                        <div className="font-bold text-white text-xs sm:text-sm truncate">
                          {cat.name}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2">
                          <span>{cat.slug}</span>
                          <span>•</span>
                          <span className="text-amber-400 font-semibold">{cat._count?.products || 0} items</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Quick Up / Down Micro-Buttons */}
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveItem(index, index - 1)}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-800 flex items-center justify-center text-xs font-bold transition-colors"
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={index === reorderList.length - 1}
                        onClick={() => moveItem(index, index + 1)}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-800 flex items-center justify-center text-xs font-bold transition-colors"
                        title="Move Down"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setReorderList([...categories])}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Reset Order
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsReorderModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSavingOrder}
                  onClick={saveNewOrder}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  {isSavingOrder ? (
                    <>
                      <span className="animate-spin text-sm">⏳</span>
                      <span>Saving Order...</span>
                    </>
                  ) : (
                    <span>Save Category Order</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Add / Edit Category Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="catActiveCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700"
                />
                <label htmlFor="catActiveCheck" className="font-bold text-slate-300">
                  Active Category
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
