'use client';

import React, { useEffect, useState } from 'react';
import { Package, Product } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Array<{ productId: number; defaultQty: number }>>([]);
  const selectedTotal = selectedItems.reduce((sum, item) => sum + (products.find((p) => p.id === item.productId)?.price || 0) * item.defaultQty, 0);

  const fetchData = async () => {
    try {
      const [resPkg, resProd] = await Promise.all([
        fetch('/api/admin/packages'),
        fetch('/api/admin/products'),
      ]);
      const dataPkg = await resPkg.json();
      const dataProd = await resProd.json();

      if (dataPkg.success) setPackages(dataPkg.packages);
      if (dataProd.success) setProducts(dataProd.products);
    } catch (e) {
      console.error('Fetch packages error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // The request resolves asynchronously; this synchronizes the initial remote state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingPackage(null);
    setName('');
    setDescription('');
    setBasePrice('');
    setIsActive(true);
    setSelectedItems([]);
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: Package) => {
    setEditingPackage(pkg);
    setName(pkg.name);
    setDescription(pkg.description || '');
    setBasePrice(String(pkg.basePrice));
    setIsActive(pkg.isActive);
    setSelectedItems(pkg.items?.map(i => ({ productId: i.productId, defaultQty: i.defaultQty })) || []);
    setIsModalOpen(true);
  };

  const handleAddItemRow = (productId: number) => {
    if (!productId || selectedItems.some(i => i.productId === productId)) return;
    setSelectedItems([...selectedItems, { productId, defaultQty: 1 }]);
  };

  const handleUpdateItemQty = (productId: number, qty: number) => {
    setSelectedItems(prev =>
      prev.map(i => i.productId === productId ? { ...i, defaultQty: Math.max(1, qty) } : i)
    );
  };

  const handleRemoveItemRow = (productId: number) => {
    setSelectedItems(prev => prev.filter(i => i.productId !== productId));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !basePrice || selectedItems.length === 0) {
      alert('Name, base price, and at least 1 item are required.');
      return;
    }

    const payload = {
      name,
      description: description || undefined,
      basePrice: Number(basePrice),
      isActive,
      items: selectedItems,
    };

    const url = editingPackage ? `/api/admin/packages/${editingPackage.id}` : '/api/admin/packages';
    const method = editingPackage ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchData();
      } else {
        alert(data.message || 'Save failed');
      }
    } catch (e) {
      console.error('Save package error:', e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this package?')) return;
    try {
      const res = await fetch(`/api/admin/packages/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchData();
    } catch (e) {
      console.error('Delete package error:', e);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-sm">Loading packages...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Ready-Made Packages Builder</h1>
          <p className="text-slate-400 text-xs mt-1">Configure preset Diwali combo packages with default items and prices.</p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
        >
          + Create New Package
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold">
            <tr>
              <th className="p-4">Package Name</th>
              <th className="p-4">Base Price</th>
              <th className="p-4">Default Items</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {packages.map((pkg) => (
              <tr key={pkg.id} className="hover:bg-slate-950/40">
                <td className="p-4 font-bold text-white text-sm">{pkg.name}</td>
                <td className="p-4 font-bold text-amber-400 text-sm">{formatPrice(pkg.basePrice)}</td>
                <td className="p-4 text-slate-400">
                  {pkg.items?.length || 0} product types ({pkg.items?.reduce((s, i) => s + i.defaultQty, 0)} total pcs)
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${pkg.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                    {pkg.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => openEditModal(pkg)} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 font-semibold">Edit</button>
                  <button onClick={() => handleDelete(pkg.id)} className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 font-semibold">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white">{editingPackage ? 'Edit Package' : 'Create Package'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs overflow-y-auto flex-1 pr-1">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Package Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Base Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <input
                    type="checkbox"
                    id="pkgActiveCheck"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 mr-2"
                  />
                  <label htmlFor="pkgActiveCheck" className="font-bold text-slate-300">Active Package</label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              {/* Package Default Items Picker */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <h4 className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">Configure Default Package Items</h4>
                
                <div className="flex gap-2">
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleAddItemRow(Number(e.target.value));
                      e.target.value = '';
                    }}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="">Select a product to add to package...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({formatPrice(p.price)})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  {Object.entries(selectedItems.reduce<Record<string, typeof selectedItems>>((groups, item) => { const category = products.find((p) => p.id === item.productId)?.category?.name || 'Uncategorized'; (groups[category] ||= []).push(item); return groups; }, {})).sort(([a], [b]) => a.localeCompare(b)).flatMap(([category, categoryItems]) => [
                    <div key={`category-${category}`} className="pt-2 text-[11px] font-black uppercase tracking-wider text-amber-400">{category}</div>,
                    ...categoryItems.map(item => {
                    const prod = products.find(p => p.id === item.productId);
                    if (!prod) return null;
                    return (
                      <div key={item.productId} className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="font-semibold text-white">{prod.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400">Default Qty:</span>
                          <input
                            type="number"
                            min="1"
                            value={item.defaultQty}
                            onChange={(e) => handleUpdateItemQty(item.productId, Number(e.target.value))}
                            className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-bold text-amber-300"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(item.productId)}
                            className="text-rose-400 font-bold hover:text-rose-300"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })
                  ])}
                </div>
                <div className="flex justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm font-black text-amber-300">
                  <span>Calculated product total</span><span>{formatPrice(selectedTotal)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold">Save Package</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
