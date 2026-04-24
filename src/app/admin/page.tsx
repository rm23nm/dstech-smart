import React from "react";
import { TrendingUp, Package, Users, DollarSign, ArrowUpRight } from "lucide-react";

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

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         {/* Recent Products */}
         <div className="lg:col-span-2 p-10 rounded-[48px] bg-white border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-2xl font-black text-slate-900">Recent Inventory</h3>
               <button className="text-xs font-black text-dstech-blue uppercase tracking-widest hover:text-dstech-red transition-colors">See All Products</button>
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
            <button className="w-full mt-12 py-5 rounded-3xl bg-white text-dstech-blue font-black text-xs uppercase tracking-widest hover:bg-dstech-red hover:text-white transition-all">Review Requests</button>
         </div>
      </div>
    </div>
  );
}
