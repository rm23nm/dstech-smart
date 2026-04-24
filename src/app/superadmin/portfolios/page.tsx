"use client"
import React, { useState } from 'react'

const initialPortfolios = [
  { id: '1', title: 'Smart Sensor Agriculture', link: 'https://smartagro.id' },
  { id: '2', title: 'Data Center Upgrade', link: '-' },
  { id: '3', title: 'ERP Manufacture X', link: 'Internal App' }
]

export default function PortfolioAdminPage() {
  const [portfolios] = useState(initialPortfolios)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Daftar Portofolio</h2>
        <button className="bg-dstech-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
          + Ajukan Proyek Baru
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-100 overflow-hidden">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Judul Proyek</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Tautan Publik</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase">Gambar Pratinjau</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Tindakan</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-zinc-200">
            {portfolios.map((p) => (
               <tr key={p.id} className="hover:bg-zinc-50 transition">
                  <td className="px-6 py-4 font-medium text-zinc-900">{p.title}</td>
                  <td className="px-6 py-4 text-zinc-500">{p.link}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-semibold">Tersedia</span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button className="text-dstech-blue hover:underline mr-4">Edit</button>
                    <button className="text-red-600 hover:underline">Hapus</button>
                  </td>
               </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 p-6 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-200">
         <h3 className="font-bold flex items-center gap-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Catatan Singkat</h3>
         <p className="mt-1 text-sm font-medium">Data Portofolio ini akan ditarik secara dinamis ke halaman beranda (Landing Page). Setiap penambahan/modifikasi di tab ini akan langsung muncul di *slider* Portofolio klien atau pengunjung.</p>
      </div>
    </div>
  )
}
