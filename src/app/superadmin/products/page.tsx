"use client"

import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Loader2, X, Check, AlertCircle } from 'lucide-react'
import { ProductItem } from '@/app/admin/products/page'

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<ProductItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<ProductItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    category: 'Security',
    price: '',
    stock: '10',
    commission: '10',
    commissionType: 'ONETIME',
    desc: ''
  })

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/products')
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setProducts(json.data)
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleOpenAdd = () => {
    setEditItem(null)
    setFormData({
      name: '',
      category: 'Security',
      price: '',
      stock: '10',
      commission: '10',
      commissionType: 'ONETIME',
      desc: ''
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (p: ProductItem) => {
    setEditItem(p)
    setFormData({
      name: p.name,
      category: p.category,
      price: String(p.price),
      stock: String(p.stock),
      commission: String(p.commissionRate || parseInt(String(p.commission).replace(/[^0-9]/g, ''), 10) || 10),
      commissionType: p.commissionType || 'ONETIME',
      desc: p.desc || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string | number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        setProducts(products.filter((p) => String(p.id) !== String(id)))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const payload = {
      ...(editItem ? { id: editItem.id } : {}),
      name: formData.name.trim(),
      category: formData.category,
      price: parseFloat(formData.price) || 0,
      stock: parseInt(formData.stock, 10) || 0,
      commission: `${formData.commission}%`,
      commissionRate: parseInt(formData.commission, 10) || 10,
      commissionType: formData.commissionType,
      desc: formData.desc.trim()
    }

    try {
      const res = await fetch('/api/products', {
        method: editItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const json = await res.json()
      if (json.success && json.data) {
        if (editItem) {
          setProducts(products.map((p) => (String(p.id) === String(editItem.id) ? json.data : p)))
        } else {
          setProducts([json.data, ...products])
        }
        setIsModalOpen(false)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Produk & Pengaturan Referral</h2>
          <p className="text-slate-500 text-xs mt-1">Inventaris produk terpusat PT. DSTech Smart Perkasa</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-dstech-blue text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition flex items-center gap-2 shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" /> Tambah Produk
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-zinc-500 uppercase">Nama Produk</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-zinc-500 uppercase">Harga</th>
                <th className="px-6 py-3.5 text-center text-xs font-bold text-zinc-500 uppercase">Tipe Komisi</th>
                <th className="px-6 py-3.5 text-center text-xs font-bold text-zinc-500 uppercase">Nilai Komisi (%)</th>
                <th className="px-6 py-3.5 text-right text-xs font-bold text-zinc-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-zinc-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-dstech-blue" />
                    <span>Memuat data...</span>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Belum ada produk.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50 transition">
                    <td className="px-6 py-4 font-bold text-zinc-900">{p.name}</td>
                    <td className="px-6 py-4 text-zinc-700 font-medium">Rp {Number(p.price || 0).toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${p.commissionType === 'RECURRING' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'}`}>
                        {p.commissionType === 'RECURRING' ? 'TAHUNAN (Recurring)' : 'SEKALI (Onetime)'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-dstech-red">{p.commission || `${p.commissionRate || 10}%`}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-dstech-blue transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editItem ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Produk</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:border-dstech-blue"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Harga (Rp)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:border-dstech-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Stok (Unit)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:border-dstech-blue"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nilai Komisi (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.commission}
                    onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:border-dstech-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tipe Komisi</label>
                  <select
                    value={formData.commissionType}
                    onChange={(e) => setFormData({ ...formData, commissionType: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:border-dstech-blue bg-white"
                  >
                    <option value="ONETIME">SEKALI (Onetime)</option>
                    <option value="RECURRING">TAHUNAN (Recurring)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-zinc-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-dstech-blue text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
