"use client"

import React, { useState } from "react";
import { Plus, Search, MoreVertical, Edit2, Trash2, Package } from "lucide-react";

const INITIAL_PRODUCTS = [
  { id: 1, name: "Smart Doorlock X-100", category: "Smart Home", price: 1850000, stock: 24, commission: "15%" },
  { id: 2, name: "CCTV Hikvision 4CH HD", category: "Security", price: 3500000, stock: 12, commission: "10%" },
  { id: 3, name: "Fingerprint ZKTeco", category: "Security", price: 1200000, stock: 45, commission: "10%" },
  { id: 4, name: "Running Text LED Red", category: "Visual", price: 2500000, stock: 5, commission: "15%" },
  { id: 5, name: "Barier Gate System", category: "Parking", price: 8500000, stock: 3, commission: "10%" },
];

export default function ProductAdmin() {
  const [products] = useState(INITIAL_PRODUCTS);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
           <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Product Inventory</h2>
           <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Manage your storefront items and commissions</p>
        </div>
        <button className="h-16 px-10 rounded-[28px] bg-dstech-red text-white font-black text-sm flex items-center gap-3 hover:scale-105 transition-transform shadow-xl shadow-red-500/30">
           <Plus className="w-5 h-5" /> Add New Product
        </button>
      </div>

      {/* Filters & Search */}
      <div className="p-8 rounded-[40px] bg-white border border-slate-100 flex flex-col md:flex-row gap-6 items-center">
         <div className="flex-1 relative w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by product name or category..." 
              className="w-full h-16 pl-16 pr-6 rounded-[24px] bg-slate-50 border-none focus:ring-4 focus:ring-dstech-blue/10 font-bold placeholder:text-slate-300 transition-all"
            />
         </div>
         <select className="h-16 px-8 rounded-[24px] bg-slate-50 border-none font-black text-slate-500 text-xs uppercase tracking-widest">
            <option>All Categories</option>
            <option>Security</option>
            <option>Smart Home</option>
            <option>Software</option>
         </select>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[56px] border border-slate-100 overflow-hidden shadow-sm">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-slate-50">
                  <th className="p-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Info</th>
                  <th className="p-10 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Price</th>
                  <th className="p-10 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Stock</th>
                  <th className="p-10 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Commission</th>
                  <th className="p-10 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {products.map((p) => (
                 <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-10">
                       <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-300">
                             <Package className="w-8 h-8" />
                          </div>
                          <div>
                             <p className="font-black text-slate-900 text-lg leading-none mb-1 group-hover:text-dstech-blue transition-colors">{p.name}</p>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.category}</p>
                          </div>
                       </div>
                    </td>
                    <td className="p-10 text-center font-black text-slate-900">
                       Rp {p.price.toLocaleString('id-ID')}
                    </td>
                    <td className="p-10 text-center">
                       <span className="px-5 py-2 rounded-full bg-blue-50 text-dstech-blue font-black text-xs">
                          {p.stock} Units
                       </span>
                    </td>
                    <td className="p-10 text-center">
                       <span className="px-5 py-2 rounded-full bg-red-50 text-dstech-red font-black text-xs">
                          {p.commission} Partner Fee
                       </span>
                    </td>
                    <td className="p-10 text-right">
                       <div className="flex items-center justify-end gap-3">
                          <button className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-dstech-blue hover:text-white transition-all"><Edit2 className="w-5 h-5" /></button>
                          <button className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-5 h-5" /></button>
                       </div>
                    </td>
                 </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
}
