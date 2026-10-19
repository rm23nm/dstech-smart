import React from "react";
import {
  TrendingUp,
  Package,
  Users,
  DollarSign,
  ArrowUpRight,
  Scale,
  Receipt,
  ShoppingCart,
  Wallet,
  Building2,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="space-y-12">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: "Total Revenue", val: "Rp 128.5M", icon: <DollarSign className="w-6 h-6" />, color: "bg-green-500", text: "text-green-500" },
          { label: "Products Active", val: "24 Items", icon: <Package className="w-6 h-6" />, color: "bg-dstech-blue", text: "text-dstech-blue" },
          { label: "Active Partners", val: "86 Agents", icon: <Users className="w-6 h-6" />, color: "bg-dstech-red", text: "text-dstech-red" },
          { label: "Growth", val: "+14.5%", icon: <TrendingUp className="w-6 h-6" />, color: "bg-orange-500", text: "text-orange-500" }
        ].map((stat, i) => (
          <div key={i} className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
             <div className="flex items-center justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl ${stat.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                   {stat.icon}
                </div>
                <div className={`p-2 rounded-lg ${stat.text} bg-slate-50`}>
                   <ArrowUpRight className="w-4 h-4" />
                </div>
             </div>
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
             <h3 className="text-3xl font-black text-slate-900">{stat.val}</h3>
          </div>
        ))}
      </div>

      {/* Finance & ERP Quick Command Center */}
      <div className="p-8 sm:p-10 rounded-[48px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pb-8 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-black uppercase tracking-wider mb-3">
              <Scale className="w-3.5 h-3.5 text-cyan-400" />
              <span>ERP & Manajemen Keuangan Terintegrasi</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Sistem Penjualan, Pembelian & Laporan Keuangan
            </h3>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl font-medium">
              Pantau faktur invoice resmi, PO supplier, retur barang, laba rugi, kas bank Mandiri & BCA, serta valuasi multi-gudang langsung dari satu dashboard eksekutif.
            </p>
          </div>
          <a
            href="/admin/finance"
            className="inline-flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 active:scale-95 shrink-0"
          >
            <span>Buka Dashboard Keuangan</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Financial ERP Modules Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-8 relative z-10">
          {[
            {
              title: "Faktur Penjualan",
              desc: "Invoice & Piutang",
              href: "/admin/finance",
              icon: Receipt,
              color: "text-emerald-400",
              bg: "bg-emerald-500/10 border-emerald-500/20",
            },
            {
              title: "Pembelian (PO)",
              desc: "Supplier & Hutang",
              href: "/admin/finance",
              icon: ShoppingCart,
              color: "text-blue-400",
              bg: "bg-blue-500/10 border-blue-500/20",
            },
            {
              title: "Retur Barang",
              desc: "Pelanggan & Vendor",
              href: "/admin/finance",
              icon: RotateCcw,
              color: "text-amber-400",
              bg: "bg-amber-500/10 border-amber-500/20",
            },
            {
              title: "Laba Rugi (P&L)",
              desc: "Omset & Laba Bersih",
              href: "/admin/finance",
              icon: Scale,
              color: "text-purple-400",
              bg: "bg-purple-500/10 border-purple-500/20",
            },
            {
              title: "Buku Arus Kas",
              desc: "Mandiri, BCA, Tunai",
              href: "/admin/finance",
              icon: Wallet,
              color: "text-cyan-400",
              bg: "bg-cyan-500/10 border-cyan-500/20",
            },
            {
              title: "Gudang & Cabang",
              desc: "Valuasi Stok Logistik",
              href: "/admin/finance",
              icon: Building2,
              color: "text-rose-400",
              bg: "bg-rose-500/10 border-rose-500/20",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <a
                key={idx}
                href={item.href}
                className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between group"
              >
                <div className={`w-10 h-10 rounded-xl ${item.bg} border flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         {/* Recent Products */}
         <div className="lg:col-span-2 p-10 rounded-[48px] bg-white border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-2xl font-black text-slate-900">Recent Inventory</h3>
               <a href="/admin/products" className="text-xs font-black text-dstech-blue uppercase tracking-widest hover:text-dstech-red transition-colors">See All Products</a>
            </div>
            <div className="space-y-6">
               {[
                 { name: "CCTV Hikvision 4CH", price: "Rp 3.5M", stock: 12, cat: "Security" },
                 { name: "Smart Doorlock X-100", price: "Rp 1.8M", stock: 24, cat: "Smart Home" },
                 { name: "Fingerprint ZKTeco", price: "Rp 1.2M", stock: 8, cat: "Attendance" }
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-lg transition-all">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 font-black text-[10px]">IMG</div>
                       <div>
                          <p className="font-black text-slate-900 leading-none mb-1">{item.name}</p>
                          <p className="text-[10px] font-black text-dstech-blue uppercase tracking-[0.2em]">{item.cat}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="font-black text-slate-900 leading-none mb-1">{item.price}</p>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Stock: {item.stock}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Latest Partners */}
         <div className="p-10 rounded-[48px] bg-dstech-blue text-white shadow-2xl shadow-blue-500/30">
            <h3 className="text-2xl font-black mb-10">Newest Partners</h3>
            <div className="space-y-8">
               {[
                 { name: "Ahmad Rizky", role: "Gold Agent", loc: "Serang" },
                 { name: "Siti Sarah", role: "Platinum", loc: "Cilegon" },
                 { name: "Budi Santoso", role: "Agent", loc: "Merak" }
               ].map((p, i) => (
                 <div key={i} className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-black">
                       {p.name[0]}
                    </div>
                    <div>
                       <p className="font-black leading-none mb-1">{p.name}</p>
                       <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">{p.role} • {p.loc}</p>
                    </div>
                 </div>
               ))}
            </div>
            <a href="/admin/partners" className="block text-center w-full mt-12 py-5 rounded-3xl bg-white text-dstech-blue font-black text-xs uppercase tracking-widest hover:bg-dstech-red hover:text-white transition-all">Review Requests</a>
         </div>
      </div>

      {/* Quick Action Banner: Materi Promosi & E-Katalog */}
      <div className="p-8 sm:p-10 rounded-[40px] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border border-slate-700/60 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase tracking-wider">
            <span>Pusat Materi Resmi</span>
          </div>
          <h3 className="text-2xl font-black tracking-tight">Materi Promosi & Unduh Katalog</h3>
          <p className="text-slate-400 text-sm max-w-2xl font-medium">
            Tambah dan kelola file e-katalog produk CCTV & Smart Home, brosur penawaran tender, flyer promosi, dan social media kit yang dapat diunduh langsung oleh seluruh mitra affiliate dan tim lapangan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-center md:justify-end">
          <a
            href="/admin/promotions"
            className="px-6 py-4 rounded-2xl bg-dstech-red hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-600/30 active:scale-95 text-center w-full sm:w-auto"
          >
            + Kelola & Tambah Materi
          </a>
          <a
            href="/affiliate"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/10 transition-all text-center w-full sm:w-auto"
          >
            Pratinjau Halaman Mitra &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
