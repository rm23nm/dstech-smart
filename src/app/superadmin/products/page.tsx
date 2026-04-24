"use client"
import React, { useState } from 'react'

const initialProducts = [
  { id: '1', name: 'Smart IoT Gateway', type: 'ONETIME', price: 1500000, commission: 15, tag: 'Hardware' },
  { id: '2', name: 'Software Bisnis ERP', type: 'RECURRING', price: 350000, commission: 10, tag: 'Berlangganan' },
]

export default function ProductsAdminPage() {
  const [products] = useState(initialProducts)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Produk & Pengaturan Referral</h2>
        <button className="bg-dstech-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
          + Tambah Produk
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-100 overflow-hidden mb-6">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Nama Produk</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Harga</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase">Tipe Komisi</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase">Nilai Komisi (%)</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-zinc-200">
            {products.map((p) => (
               <tr key={p.id} className="hover:bg-zinc-50 transition">
                  <td className="px-6 py-4 font-medium text-zinc-900">{p.name}</td>
                  <td className="px-6 py-4 text-zinc-500">Rp {p.price.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${p.type === 'ONETIME' ? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800'}`}>
                      {p.type === 'ONETIME' ? 'SEKALI (Onetime)' : 'TAHUNAN (Recurring)'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-dstech-red">{p.commission}%</td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button className="text-dstech-blue hover:underline">Edit</button>
                  </td>
               </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
        <h3 className="text-blue-900 font-bold mb-2">Penjelasan Sistem Referral</h3>
        <ul className="list-disc pl-5 text-blue-800 space-y-1 text-sm font-medium">
          <li><strong>SEKALI (ONETIME):</strong> Afiliasi dibayar tunai `X%` x Harga, hanya saat transaksi pertama sukses.</li>
          <li><strong>TAHUNAN (RECURRING):</strong> Afiliasi akan diberikan tagihan setiap tahun perpanjangan sistem (Subscription) oleh Client. Selama client berlangganan, afiliasi mendapatkan `X%` komisi tahunan berkelanjutan!</li>
        </ul>
      </div>
    </div>
  )
}
