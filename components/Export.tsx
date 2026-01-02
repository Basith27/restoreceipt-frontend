import React, { useState, useMemo, useEffect } from 'react'; // <-- Step 1: Add useEffect
import { exportReceipts, ExportFormat } from '../services/apiService';
import { Receipt, ReceiptStatus } from '../types';
import { Download, FileText, Code, FileJson, AlertCircle } from 'lucide-react';

// In a real app, this `receipts` data would be passed in as a prop from App.tsx
const MOCK_RECEIPTS_DB: Receipt[] = [
    { id: '1', vendorName: 'Sysco Food Services', totalAmount: 1245.50, date: '2025-10-24', category: 'Food Cost', status: ReceiptStatus.APPROVED, imageUrl: '', confidence: 98, uploadedBy: '', taxAmount: 124.50 },
    { id: '2', vendorName: 'City Utilities', totalAmount: 340.00, date: '2025-10-25', category: 'Utilities', status: ReceiptStatus.NEEDS_REVIEW, imageUrl: '', confidence: 65, uploadedBy: '', taxAmount: 0 },
    { id: '3', vendorName: 'Office Supplies Inc.', totalAmount: 150.75, date: '2025-10-26', category: 'Maintenance', status: ReceiptStatus.APPROVED, imageUrl: '', confidence: 99, uploadedBy: '', taxAmount: 15.00 }
];

export const Export: React.FC = () => {
  const approvedReceipts = useMemo(() => MOCK_RECEIPTS_DB.filter(r => r.status === ReceiptStatus.APPROVED), [MOCK_RECEIPTS_DB]);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showConfig, setShowConfig] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [filename, setFilename] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // --- THIS IS THE FIX ---
  // Step 2: This useEffect hook will run whenever the `format` or `showConfig` state changes.
  useEffect(() => {
    // Only generate a filename if the config panel is visible
    if (showConfig) {
      const fileExt = format === 'xml' ? '.xml' : format === 'json' ? '.json' : '.csv';
      const baseName = `export_${new Date().toISOString().split('T')[0]}`;
      setFilename(`${baseName}${fileExt}`);
    }
  }, [format, showConfig]); // Dependency array: re-run this effect when these values change

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(approvedReceipts.map(r => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };
  
  const handleSelectRow = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  // The handleProceed function is now much simpler.
  const handleProceed = () => {
    setShowConfig(true);
  };

  const handleExport = async () => {
    if (!filename) {
      alert("Please enter a filename.");
      return;
    }
    setIsExporting(true);
    try {
      await exportReceipts(format, Array.from(selectedIds), filename);
    } catch (error) {
      alert("Could not download export. Please check the console.");
    } finally {
      setIsExporting(false);
    }
  };

  const isAllSelected = approvedReceipts.length > 0 && selectedIds.size === approvedReceipts.length;

  return (
    <div className="p-6 md:p-10 h-full flex flex-col">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-8">Accounting Export</h1>
      
      {/* Step 1: Selection Table */}
      <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col transition-all duration-300 ${showConfig ? 'max-h-0 opacity-0 invisible' : 'max-h-full opacity-100 visible'}`}>
          <div className="p-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-800">1. Select Approved Receipts to Export</h2>
              <p className="text-sm text-slate-500">Only receipts marked as "Approved" are shown here.</p>
          </div>
          <div className="overflow-y-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 border-b border-slate-200 sticky top-0">
                    <tr>
                        <th className="p-4 w-12 text-center"><input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} className="rounded border-slate-300 text-orange-600 focus:ring-orange-500" /></th>
                        <th className="p-4 font-semibold text-slate-500 uppercase text-xs">Date</th>
                        <th className="p-4 font-semibold text-slate-500 uppercase text-xs">Vendor</th>
                        <th className="p-4 font-semibold text-slate-500 uppercase text-xs text-right">Amount</th>
                    </tr>
                </thead>
              <tbody>
                {approvedReceipts.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 text-center"><input type="checkbox" checked={selectedIds.has(r.id)} onChange={() => handleSelectRow(r.id)} className="rounded border-slate-300 text-orange-600 focus:ring-orange-500" /></td>
                    <td className="p-4 text-slate-500 font-medium">{r.date}</td>
                    <td className="p-4 font-semibold text-slate-900">{r.vendorName}</td>
                    <td className="p-4 text-right font-bold text-slate-900">${r.totalAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-200 mt-auto">
              <button onClick={handleProceed} disabled={selectedIds.size === 0} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-semibold shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none">
                  Export ({selectedIds.size}) Selected
              </button>
          </div>
      </div>

      {/* Step 2 & 3: Configuration & Download */}
      <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-8 transition-all duration-300 ${showConfig ? 'opacity-100 visible' : 'opacity-0 invisible hidden'}`}>
        <h2 className="font-semibold text-slate-800 mb-2">2. Configure Your Export</h2>
        <div className="space-y-4 my-6">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Export Format</label>
            <select value={format} onChange={e => setFormat(e.target.value as ExportFormat)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-orange-500 focus:border-orange-500">
              <option value="csv">CSV (for Excel, QuickBooks)</option>
              <option value="json">JSON (for developers)</option>
              <option value="xml">XML (for Tally)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Filename</label>
            <input type="text" value={filename} onChange={e => setFilename(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" />
          </div>
        </div>
        <div className="flex gap-4 items-center border-t border-slate-200 pt-6">
          <button onClick={() => setShowConfig(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">
            &larr; Back to Selection
          </button>
          <button onClick={handleExport} disabled={isExporting} className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all hover:-translate-y-0.5 disabled:bg-slate-400 disabled:cursor-not-allowed">
              {isExporting ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : <Download size={18}/>}
              Download File
          </button>
        </div>
      </div>
    </div>
  );
};