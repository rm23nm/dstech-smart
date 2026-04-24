"use client"
import React from 'react'
import { TrendingUp, Users, Wallet, AlertCircle, ArrowUpRight } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div>
            <h2 className="text-3xl font-black tracking-tight text-white mb-2">Ringkasan Ekosistem</h2>
            <p className="text-zinc-500 font-medium text-sm lg:text-base">Pantau performa agent dan pertumbuhan digital DSTech.</p>
         </div>
         <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-dstech-accent/10 border border-dstech-accent/20 text-dstech-accent text-xs font-black uppercase tracking-widest">
               Real-time Data
            </div>
         </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Afiliasi", val: "124", icon: <Users />, color: "accent", trend: "+12%" },
          { label: "Referral Aktif", val: "89", icon: <TrendingUp />, color: "blue", trend: "+5%" },
          { label: "Komisi Dibayar", val: "Rp 150M", icon: <Wallet />, color: "green", trend: "0%" },
          { label: "Permintaan Cair", val: "3", icon: <AlertCircle />, color: "red", trend: "Urgent" }
        ].map((stat) => (
          <div key={stat.label} className={`p-8 rounded-[32px] bg-white/[0.03] border border-white/5 relative overflow-hidden group hover:border-${stat.color === 'accent' ? 'dstech-accent' : stat.color}-500/30 transition-all`}>
            <div className={`p-3 rounded-xl bg-white/5 w-fit mb-6 text-zinc-400 group-hover:text-white transition-colors`}>
               {stat.icon}
            </div>
            <span className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 block">{stat.label}</span>
            <div className="flex items-baseline gap-3">
               <p className="text-4xl font-black text-white tracking-tighter">{stat.val}</p>
               <span className={`text-[10px] font-bold ${stat.color === 'red' ? 'text-red-500' : 'text-dstech-accent'} uppercase`}>{stat.trend}</span>
            </div>
            
            {/* Bottom Accent Line */}
            <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 ${
              stat.color === 'accent' ? 'bg-dstech-accent' : 
              stat.color === 'blue' ? 'bg-blue-500' : 
              stat.color === 'red' ? 'bg-red-500' : 'bg-green-500'
            }`}></div>
          </div>
        ))}
      </div>

      {/* Main Grid: Transactions & Top Agents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Recent Transactions Table */}
         <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-dstech-accent"></div>
                  Aktivitas Terbaru
               </h3>
               <button className="text-xs font-bold text-zinc-500 hover:text-white transition-colors">See all &rarr;</button>
            </div>
            <div className="rounded-[32px] bg-white/[0.02] border border-white/5 overflow-hidden backdrop-blur-sm">
               <table className="min-w-full divide-y divide-white/5">
                  <thead className="bg-white/5">
                     <tr>
                        <th className="px-8 py-5 text-left text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Afiliator</th>
                        <th className="px-8 py-5 text-left text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Klien</th>
                        <th className="px-8 py-5 text-left text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Status</th>
                        <th className="px-8 py-5 text-left text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Komisi</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {[
                        { name: "John Doe Affiliate", client: "PT. Maju Bersama", status: "SUCCESS", amount: "Rp 1.500k" },
                        { name: "Siti Aminah", client: "Bengkel Berkah", status: "PENDING", amount: "Rp 850k" },
                        { name: "Budi Santoso", client: "Hotel Pesona", status: "SUCCESS", amount: "Rp 3.200k" }
                     ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors group">
                           <td className="px-8 py-6 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-xs text-white">
                                    {item.name[0]}
                                 </div>
                                 <span className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">{item.name}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6 whitespace-nowrap text-sm text-zinc-500 font-medium">{item.client}</td>
                           <td className="px-8 py-6 whitespace-nowrap">
                              <span className={`px-3 py-1 text-[10px] font-black rounded-full ${
                                 item.status === 'SUCCESS' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                              }`}>
                                 {item.status}
                              </span>
                           </td>
                           <td className="px-8 py-6 whitespace-nowrap text-sm text-white font-black">{item.amount}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Top Agents Panel */}
         <div className="space-y-6">
            <h3 className="text-xl font-black tracking-tight">Ranking Agent</h3>
            <div className="p-8 rounded-[32px] bg-gradient-to-br from-indigo-950/40 to-black border border-white/5 space-y-8">
               {[
                  { name: "Syahrul Ramadhan", income: "Rp 12.4M", leads: 42 },
                  { name: "Anita Wijaya", income: "Rp 9.8M", leads: 38 },
                  { name: "Rendi Pratama", income: "Rp 8.1M", leads: 31 }
               ].map((agent, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer">
                     <div className="flex items-center gap-4">
                        <span className="text-zinc-700 font-black text-xl italic">0{i+1}</span>
                        <div>
                           <p className="text-sm font-black text-zinc-300 group-hover:text-dstech-accent transition-colors">{agent.name}</p>
                           <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{agent.leads} Leads Goal</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-sm font-black text-white">{agent.income}</p>
                        <ArrowUpRight className="w-3 h-3 text-green-500 ml-auto" />
                     </div>
                  </div>
               ))}
               <button className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-400 font-black text-xs uppercase tracking-widest transition-all">Papan Peringkat Lengkap</button>
            </div>
         </div>
      </div>
    </div>
  )
}

