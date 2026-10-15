'use client';

import React, { useEffect, useState } from 'react';
import { Product, Category } from '@/types';
import { formatPrice } from '@/lib/utils';

interface BulkUploadResult {
  success: boolean;
  message?: string;
  summary?: {
    createdCount?: number;
    updatedCount?: number;
    errors?: string[];
    warnings?: string[];
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [sku, setSku] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [price, setPrice] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Bulk Upload Modal state
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState<BulkUploadResult | null>(null);

  const fetchProducts = async () => {
    try {
      const cached = sessionStorage.getItem('admin-products-cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.categories) setCategories(parsed.categories);
        setLoading(false);
      }
      const [resP, resC] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/categories'),
      ]);
      const dataP = await resP.json();
      const dataC = await resC.json();

      if (dataP.success) {
        setProducts(dataP.products);
        setSelectedProductIds((current) => current.filter((id) => dataP.products.some((product: Product) => product.id === id)));
      }
      if (dataC.success) setCategories(dataC.categories);
      if (dataP.success || dataC.success) {
        sessionStorage.setItem('admin-products-cache', JSON.stringify({
          products: dataP.success ? dataP.products : products,
          categories: dataC.success ? dataC.categories : categories,
        }));
      }
    } catch (e) {
      console.error('Fetch products error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // The request resolves asynchronously; this synchronizes the initial remote state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
    // Only the initial page load should fetch; later refreshes use explicit actions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setCategoryId(categories[0]?.id || '');
    setSku('');
    setOriginalPrice('');
    setPrice('');
    setStockQty('');
    setDescription('');
    setImageUrl('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategoryId(p.categoryId);
    setSku(p.sku || '');
    setOriginalPrice(p.originalPrice ? String(p.originalPrice) : '');
    setPrice(String(p.price));
    setStockQty(String(p.stockQty));
    setDescription(p.description || '');
    setImageUrl(p.imageUrl && p.imageUrl !== '/uploads/placeholder.png' ? p.imageUrl : '');
    setIsActive(p.isActive);
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setImageUrl(data.url);
      } else {
        alert(data.message || 'Image upload failed');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      alert('Network error while uploading image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !categoryId || !price) return;

    const payload = {
      categoryId: Number(categoryId),
      name,
      sku: sku || undefined,
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      price: Number(price),
      stockQty: Number(stockQty || 0),
      description: description || undefined,
      imageUrl: imageUrl || '/uploads/placeholder.png',
      isActive,
    };

    const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchProducts();
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (err) {
      console.error('Save product error:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
        if (data.action === 'archived') {
          alert(data.message);
        }
      }
      else alert(data.message);
    } catch (e) {
      console.error('Delete product error:', e);
    }
  };

  const toggleProductSelection = (id: number) => {
    setSelectedProductIds((current) =>
      current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedProductIds((current) => (current.length === products.length ? [] : products.map((product) => product.id)));
  };

  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;

    const confirmed = confirm(`Remove ${selectedProductIds.length} selected product${selectedProductIds.length === 1 ? '' : 's'}? Products used in existing orders will be archived instead.`);
    if (!confirmed) return;

    const results = await Promise.all(
      selectedProductIds.map(async (id) => {
        try {
          const response = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
          const data = await response.json();
          return { id, success: response.ok && data.success, action: data.action, message: data.message };
        } catch {
          return { id, success: false, action: undefined, message: 'Network error' };
        }
      })
    );

    const failedCount = results.filter((result) => !result.success).length;
    const archivedCount = results.filter((result) => result.success && result.action === 'archived').length;
    setSelectedProductIds([]);
    await fetchProducts();

    if (failedCount > 0 || archivedCount > 0) {
      alert(`${results.length - failedCount} removed, ${archivedCount} archived, ${failedCount} failed.`);
    }
  };

  const handleToggleActive = async (p: Product) => {
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !p.isActive }),
      });
      const data = await res.json();
      if (data.success) fetchProducts();
    } catch (e) {
      console.error('Toggle active error:', e);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkFile) return;

    setBulkUploading(true);
    setBulkResult(null);

    const formData = new FormData();
    formData.append('file', bulkFile);

    try {
      const res = await fetch('/api/admin/products/bulk-upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setBulkResult(data);
      if (data.success) {
        fetchProducts();
      }
    } catch (err) {
      console.error('Bulk upload error:', err);
      setBulkResult({ success: false, message: 'Upload failed' });
    } finally {
      setBulkUploading(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-sm">Loading catalog...</div>;
  }

  const productsByCategory = products.reduce<Record<string, Product[]>>((groups, product) => {
    const categoryName = product.category?.name || 'Uncategorized';
    (groups[categoryName] ||= []).push(product);
    return groups;
  }, {});

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Product Catalog Management</h1>
          <p className="text-slate-500 text-xs mt-1">Add, edit, bulk upload, or toggle product availability.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {selectedProductIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors"
            >
              Remove selected ({selectedProductIds.length})
            </button>
          )}
          <button
            onClick={() => {
              setBulkResult(null);
              setBulkFile(null);
              setIsBulkModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-300 shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <span>📁</span> Bulk Import CSV
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md shadow-slate-900/10 transition-all"
          >
            + Add New Product
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        {/* Mobile Swipe Hint */}
        <div className="md:hidden px-4 py-2 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <span>👉</span>
            <span>Scroll sideways to view all columns & actions</span>
          </span>
          <span className="text-[10px] font-mono text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full">
            swipe ↔
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[850px]">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-4 w-12">
                  <input
                    type="checkbox"
                    aria-label="Select all products"
                    checked={products.length > 0 && selectedProductIds.length === products.length}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 bg-white accent-slate-900"
                  />
                </th>
                <th className="p-4 w-16">Image</th>
                <th className="p-4">Name & SKU</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock Qty</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {Object.entries(productsByCategory).sort(([a], [b]) => a.localeCompare(b)).flatMap(([categoryName, categoryProducts]) => [
                <tr key={`category-${categoryName}`} className="bg-slate-100/70">
                  <td colSpan={8} className="px-4 py-3 text-sm font-black uppercase tracking-wide text-slate-900">{categoryName}<span className="ml-2 text-[10px] font-normal text-slate-500">{categoryProducts.length} products</span></td>
                </tr>,
                ...categoryProducts.map((p) => <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      aria-label={`Select ${p.name}`}
                      checked={selectedProductIds.includes(p.id)}
                      onChange={() => toggleProductSelection(p.id)}
                      className="h-4 w-4 rounded border-slate-300 bg-white accent-slate-900"
                    />
                  </td>
                  <td className="p-4">
                    {p.imageUrl && p.imageUrl !== '/uploads/placeholder.png' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-10 h-10 object-cover rounded-lg border border-slate-200 bg-slate-50 shadow-xs"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-lg">
                        🧨
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                    {p.sku && <div className="text-[10px] font-mono text-slate-400">SKU: {p.sku}</div>}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      {p.category?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    {p.originalPrice && p.originalPrice > p.price && (
                      <span className="mr-2 text-xs text-slate-400 line-through">{formatPrice(p.originalPrice)}</span>
                    )}
                    <span className="font-bold text-slate-900">{formatPrice(p.price)}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-emerald-600">
                      In stock
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleActive(p)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                        p.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {!p.category?.isActive ? 'Category disabled' : p.isActive ? 'Active ✓' : 'Disabled'}
                    </button>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(p)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>)
              ])}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-900">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-lg text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. SPK-001"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={stockQty}
                    onChange={(e) => setStockQty(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              {/* Cracker Image Upload & Preview */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <label className="block font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Cracker Product Image 📸
                </label>

                <div className="flex items-start gap-4">
                  {/* Thumbnail Preview */}
                  <div className="w-20 h-20 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt="Cracker Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">🧨</span>
                    )}
                  </div>

                  {/* Upload Actions & URL input */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors">
                        <span>{uploadingImage ? '⏳ Uploading...' : '📁 Upload Image File'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                      {imageUrl && (
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Or enter image URL (e.g. /uploads/... or https://...)"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900"
                    />
                    <p className="text-[10px] text-slate-500">
                      Upload from computer (JPG, PNG, WEBP) or paste an image link.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-300 bg-white accent-slate-900"
                />
                <label htmlFor="isActiveCheck" className="font-bold text-slate-700">Available for customer purchase</label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-md shadow-slate-900/10"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-900">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-lg text-slate-900">Bulk Import via CSV</h3>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <p className="text-xs text-slate-500">
              Upload a distributor price list CSV. Supported columns: <span className="text-slate-900 font-mono font-bold">Category, Product Name, Rate, Discount 80%, Packing</span>. Rate is shown crossed out and Rate minus Discount becomes the selling price. Stock defaults to 0 when it is not included.
            </p>

            <form onSubmit={handleBulkSubmit} className="space-y-4 text-xs">
              <div>
                <input
                  type="file"
                  accept=".csv"
                  required
                  onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
                  className="w-full text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
                />
              </div>

              {bulkResult && (
                <div className={`p-4 rounded-xl text-xs ${bulkResult.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'}`}>
                  {bulkResult.success ? (
                    <div>
                      <p className="font-bold mb-1">Import Finished Successfully!</p>
                      <p>Created: {bulkResult.summary?.createdCount} new products</p>
                      <p>Updated: {bulkResult.summary?.updatedCount} existing products</p>
                      {Boolean(bulkResult.summary?.errors && bulkResult.summary.errors.length > 0) && (
                        <p className="text-rose-700 mt-2 font-mono">Errors: {bulkResult.summary?.errors?.join(', ')}</p>
                      )}
                      {Boolean(bulkResult.summary?.warnings && bulkResult.summary.warnings.length > 0) && (
                        <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-amber-900">
                          <p className="font-bold">Some values were missing and defaults were applied:</p>
                          <p className="mt-1 font-mono">{bulkResult.summary?.warnings?.join(' ')}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p>{bulkResult.message || 'Import failed'}</p>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={bulkUploading || !bulkFile}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold disabled:opacity-50 shadow-md shadow-slate-900/10"
                >
                  {bulkUploading ? 'Uploading...' : 'Start Import'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
