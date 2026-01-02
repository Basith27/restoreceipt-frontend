import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Stats, Receipt, ReceiptStatus } from '../types';
import { Activity, ArrowUpRight, Clock, CheckCircle2, DollarSign, Receipt as ReceiptIcon, MoreHorizontal } from 'lucide-react';

interface DashboardProps {
  stats: Stats;
  recentActivity: Receipt[];
  onUploadClick: () => void;
  onReviewClick: (receipt: Receipt) => void;
}

const data = [
  { name: 'Mon', amount: 400 },
  { name: 'Tue', amount: 300 },
  { name: 'Wed', amount: 550 },
  { name: 'Thu', amount: 450 },
  { name: 'Fri', amount: 800 },
  { name: 'Sat', amount: 1200 },
  { name: 'Sun', amount: 900 },
];

export const Dashboard: React.FC<DashboardProps> = ({ stats, recentActivity, onUploadClick, onReviewClick }) => {
  return (
    <div className="p-6 md:p-10 h-full overflow-y-auto pb-32 md:pb-10 space-y-8">
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {/* Pending Card */}
        <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 hover:border-orange-200 transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-100 transition-colors">
              <Clock size={20} />
            </div>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">+2 today</span>
          </div>
          <div className="space-y-1">
            <p className="text-slate-500 text-sm font-medium">Pending Review</p>
            <h3 className="text-3xl font-bold text-slate-900">{stats.pendingCount}</h3>
          </div>
        </div>

        {/* Approved Card */}
        <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 hover:border-emerald-200 transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-100 transition-colors">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-slate-500 text-sm font-medium">Approved</p>
            <h3 className="text-3xl font-bold text-slate-900">{stats.approvedCount}</h3>
          </div>
        </div>

        {/* Spend Card */}
        <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 hover:border-blue-200 transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition-colors">
              <DollarSign size={20} />
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">MTD</span>
          </div>
          <div className="space-y-1">
            <p className="text-slate-500 text-sm font-medium">Total Spend</p>
            <h3 className="text-3xl font-bold text-slate-900">${stats.monthSpend.toLocaleString()}</h3>
          </div>
        </div>

        {/* Upload Action Card (Replaces generic stat) */}
        <div 
          onClick={onUploadClick}
          className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-2xl shadow-lg shadow-slate-900/20 text-white cursor-pointer hover:scale-[1.02] transition-transform relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <ArrowUpRight size={80} />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="p-2.5 bg-white/10 w-fit rounded-xl backdrop-blur-md border border-white/10">
              <ArrowUpRight size={20} />
            </div>
            <div>
              <p className="text-slate-300 text-sm font-medium mb-1">Quick Action</p>
              <h3 className="text-xl font-bold">Upload Receipt</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Left: Analytics */}
        <div className="lg:col-span-8 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
             <div>
               <h2 className="text-xl font-bold text-slate-900">Weekly Spend Analysis</h2>
               <p className="text-sm text-slate-500 mt-1">Comparison with previous week</p>
             </div>
             <div className="flex gap-2">
                <button className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors">Weekly</button>
                <button className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-600 transition-colors">Monthly</button>
             </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  cursor={{ fill: '#F8F9FC', radius: 4 }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    padding: '12px 16px',
                    fontFamily: 'Inter'
                  }}
                  itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                  formatter={(value: number) => [`$${value}`, 'Spend']}
                />
                <Bar dataKey="amount" radius={[6, 6, 6, 6]}>
                   {data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 5 ? '#ea580c' : '#e2e8f0'} 
                        className="transition-all duration-300 hover:opacity-80"
                      />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Activity Feed */}
        <div className="lg:col-span-4 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
             <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
             <button className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
               <MoreHorizontal size={20} />
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {recentActivity.map((receipt) => (
              <div 
                key={receipt.id} 
                className={`group flex items-center justify-between p-4 rounded-2xl transition-all border 
                  ${receipt.status === ReceiptStatus.NEEDS_REVIEW 
                    ? 'bg-orange-50/50 border-orange-100 hover:border-orange-200 hover:shadow-md cursor-pointer' 
                    : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-100'}`}
                onClick={() => receipt.status === ReceiptStatus.NEEDS_REVIEW ? onReviewClick(receipt) : null}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-colors
                    ${receipt.status === ReceiptStatus.NEEDS_REVIEW ? 'bg-white border-orange-100 text-orange-600 shadow-sm' : 
                      receipt.status === ReceiptStatus.APPROVED ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                      'bg-slate-100 border-slate-200 text-slate-500'}`}>
                    {receipt.status === ReceiptStatus.NEEDS_REVIEW ? <Activity size={20} /> : <ReceiptIcon size={20} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 truncate max-w-[120px] group-hover:text-orange-600 transition-colors">
                      {receipt.vendorName}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">{receipt.date}</p>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-sm font-bold text-slate-900">${receipt.totalAmount.toFixed(2)}</p>
                   {receipt.status === ReceiptStatus.NEEDS_REVIEW && (
                     <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-white px-2 py-0.5 rounded-full shadow-sm border border-orange-100 mt-1">
                       Verify <ArrowUpRight size={10} />
                     </span>
                   )}
                </div>
              </div>
            ))}
            
            {/* Empty State / See More Placeholder */}
            {recentActivity.length < 5 && (
               <div className="p-8 text-center">
                 <p className="text-sm text-slate-400">That's all for now.</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
