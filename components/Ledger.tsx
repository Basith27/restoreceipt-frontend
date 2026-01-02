import React from 'react';
import { Receipt, ReceiptStatus } from '../types';
import { MoreVertical, Edit2, Trash2, CheckSquare, Download, Filter, Search, ArrowUpDown } from 'lucide-react';

interface LedgerProps {
  receipts: Receipt[];
  onReviewClick: (receipt: Receipt) => void;
}

export const Ledger: React.FC<LedgerProps> = ({ receipts, onReviewClick }) => {
  return (
    <div className="p-6 md:p-10 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Expense Ledger</h1>
           <p className="text-slate-500 text-sm mt-1">View and manage processed receipts</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search vendor or amount..." 
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 w-full md:w-64"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
              <Filter size={16} /> Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
              <Download size={16} /> Export
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="p-4 w-12 text-center"><input type="checkbox" className="rounded border-slate-300 text-orange-600 focus:ring-orange-500" /></th>
                <th className="p-4 font-semibold text-slate-500 uppercase text-xs tracking-wider cursor-pointer hover:text-slate-700">
                  <div className="flex items-center gap-1">Date <ArrowUpDown size={12}/></div>
                </th>
                <th className="p-4 font-semibold text-slate-500 uppercase text-xs tracking-wider">Vendor</th>
                <th className="p-4 font-semibold text-slate-500 uppercase text-xs tracking-wider">Category</th>
                <th className="p-4 font-semibold text-slate-500 uppercase text-xs tracking-wider text-right">Tax</th>
                <th className="p-4 font-semibold text-slate-500 uppercase text-xs tracking-wider text-right">Total</th>
                <th className="p-4 font-semibold text-slate-500 uppercase text-xs tracking-wider">Status</th>
                <th className="p-4 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {receipts.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors group" onClick={() => onReviewClick(r)} >
                  <td className="p-4 text-center"><input type="checkbox" className="rounded border-slate-300 text-orange-600 focus:ring-orange-500" /></td>
                  <td className="p-4 text-slate-500 font-medium whitespace-nowrap">{new Date(r.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                         {r.vendorName.substring(0,2)}
                       </div>
                       <span className="font-semibold text-slate-900">{r.vendorName}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600">
                      {r.category}
                    </span>
                  </td>
                  <td className="p-4 text-right text-slate-500 font-medium">${r.taxAmount?.toFixed(2) || '0.00'}</td>
                  <td className="p-4 text-right font-bold text-slate-900 text-base">${r.totalAmount.toFixed(2)}</td>
                  <td className="p-4">
                     <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold
                       ${r.status === ReceiptStatus.APPROVED ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 
                         r.status === ReceiptStatus.NEEDS_REVIEW ? 'bg-orange-50 text-orange-700 border border-orange-100' : 
                         'bg-red-50 text-red-700 border border-red-100'}`}>
                       <span className={`w-1.5 h-1.5 rounded-full ${
                         r.status === ReceiptStatus.APPROVED ? 'bg-emerald-500' : 
                         r.status === ReceiptStatus.NEEDS_REVIEW ? 'bg-orange-500' : 'bg-red-500'
                       }`}></span>
                       {r.status}
                     </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"><Edit2 size={16}/></button>
                      <button className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-4 pb-24">
        {receipts.map((r) => (
          <div key={r.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
             <div className="flex justify-between items-start">
               <div className="flex items-center gap-3.5">
                 <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
                    {r.vendorName.substring(0,2)}
                 </div>
                 <div>
                   <h3 className="font-bold text-slate-900">{r.vendorName}</h3>
                   <p className="text-xs text-slate-500 font-medium">{r.date}</p>
                 </div>
               </div>
               <div className="text-right">
                 <p className="text-lg font-bold text-slate-900">${r.totalAmount.toFixed(2)}</p>
               </div>
             </div>
             
             <div className="flex justify-between items-center pt-3 border-t border-slate-50">
               <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-lg font-semibold text-slate-600">{r.category}</span>
               <div className="flex gap-4">
                 <button className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                 <button className="text-slate-400 hover:text-blue-500 transition-colors"><Edit2 size={20}/></button>
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
