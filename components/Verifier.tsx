import React, { useState } from 'react';
import { Receipt, ReceiptStatus } from '../types';
import { Check, X, AlertTriangle, ZoomIn, ZoomOut, Maximize2, RotateCw } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
// import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface VerifierProps {
  receipt: Receipt;
  onSave: (updated: Receipt) => void;
  onReject: (id: string) => void;
  onCancel: () => void;
}

const InputGroup = ({ label, children, warning }: { label: string, children: React.ReactNode, warning?: boolean }) => (
  <div className={`space-y-1.5 p-3 rounded-xl border transition-all ${warning ? 'bg-orange-50/50 border-orange-200' : 'bg-transparent border-transparent hover:bg-slate-50'}`}>
    <div className="flex justify-between">
      <label className={`text-xs font-bold uppercase tracking-wider ${warning ? 'text-orange-700' : 'text-slate-500'}`}>{label}</label>
      {warning && <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-md font-semibold flex items-center gap-1"><AlertTriangle size={10} /> Check</span>}
    </div>
    {children}
  </div>
);

export const Verifier: React.FC<VerifierProps> = ({ receipt: initialReceipt, onSave, onReject, onCancel }) => {
  const [receipt, setReceipt] = useState<Receipt>(initialReceipt);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [activeTab, setActiveTab] = useState<'image' | 'data'>('data');
  const [numPages, setNumPages] = useState<number | null>(null);

  const handleChange = (field: keyof Receipt, value: any) => {
    setReceipt({ ...receipt, [field]: value });
  };

  const isLowConfidence = (field: string) => receipt.confidence < 80;

  const renderDocument = () => {
    const isPdf = receipt.fileType === 'application/pdf';

    if (isPdf) {
      return (
        <Document 
          file={receipt.imageUrl} 
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          className="flex justify-center"
        >
          {/* We'll just show the first page of the PDF */}
          <Page pageNumber={1} renderTextLayer={false} />
        </Document>
      );
    } else {
      // Fallback to the original image tag for JPG, PNG, etc.
      return (
        <img 
          src={receipt.imageUrl} 
          alt="Receipt" 
          className="max-w-full rounded-sm"
        />
      );
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-[calc(100vh-80px)] overflow-hidden bg-[#F8F9FC]">
      {/* Mobile Tabs */}
      <div className="md:hidden flex bg-white border-b border-slate-200 sticky top-0 z-20">
        <button 
          className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'image' ? 'text-orange-600 border-orange-600' : 'text-slate-400 border-transparent'}`}
          onClick={() => setActiveTab('image')}
        >
          Receipt Image
        </button>
        <button 
          className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'data' ? 'text-orange-600 border-orange-600' : 'text-slate-400 border-transparent'}`}
          onClick={() => setActiveTab('data')}
        >
          Verify Data
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Image */}
        <div className={`flex-1 bg-slate-900 relative overflow-hidden flex flex-col transition-all ${activeTab === 'data' ? 'hidden md:flex' : 'flex'}`}>
           {/* Toolbar */}
           <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-slate-800/90 p-1.5 rounded-xl backdrop-blur-md shadow-2xl border border-white/10">
             <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><ZoomOut size={18}/></button>
             <span className="px-2 flex items-center text-xs font-medium text-slate-400 min-w-[3rem] justify-center">{Math.round(zoom * 100)}%</span>
             <button onClick={() => setZoom(z => Math.min(z + 0.2, 3))} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><ZoomIn size={18}/></button>
             <div className="w-[1px] bg-white/10 mx-1"></div>
             <button onClick={() => setRotation(r => r + 90)} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><RotateCw size={18}/></button>
           </div>
           
           <div className="flex-1 overflow-auto flex items-center justify-center p-8 cursor-grab active:cursor-grabbing bg-slate-900/50">
             <div className="relative shadow-2xl shadow-black/50 transition-transform duration-300 ease-out" 
                  style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}>
                  {renderDocument()}
               {/* Simulated Overlay Box for Price */}
               {isLowConfidence('total') && (
                 <div className="absolute bottom-10 right-10 w-24 h-8 border-2 border-orange-500 bg-orange-500/20 rounded animate-pulse" />
               )}
             </div>
           </div>
        </div>

        {/* Right Panel: Data Form */}
        <div className={`w-full md:w-[480px] bg-white border-l border-slate-200 flex flex-col shadow-xl z-10 ${activeTab === 'image' ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold text-lg text-slate-900 flex items-center gap-3">
              Review Details
              {receipt.confidence < 80 && (
                <span className="text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 border border-orange-200">
                  <AlertTriangle size={12} /> Low Confidence
                </span>
              )}
            </h2>
            <p className="text-slate-500 text-sm mt-1">Check highlighted fields against the image.</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            
            <InputGroup label="Vendor Name" warning={isLowConfidence('vendor')}>
              <input 
                type="text" 
                value={receipt.vendorName} 
                onChange={(e) => handleChange('vendorName', e.target.value)}
                className="w-full text-lg font-semibold text-slate-900 bg-transparent border-0 border-b border-slate-200 focus:border-orange-500 focus:ring-0 px-0 py-1 transition-colors placeholder:text-slate-300"
                placeholder="Enter vendor name"
              />
            </InputGroup>

            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Total Amount" warning={isLowConfidence('total')}>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-medium text-slate-400">$</span>
                  <input 
                    type="number" 
                    value={receipt.totalAmount} 
                    onChange={(e) => handleChange('totalAmount', parseFloat(e.target.value))}
                    className="w-full text-2xl font-bold text-slate-900 bg-transparent border-0 border-b border-slate-200 focus:border-orange-500 focus:ring-0 px-0 py-1"
                  />
                </div>
              </InputGroup>
              <InputGroup label="Tax Amount">
                 <div className="flex items-center gap-1">
                  <span className="text-base font-medium text-slate-400">$</span>
                  <input 
                    type="number" 
                    value={receipt.taxAmount} 
                    onChange={(e) => handleChange('taxAmount', parseFloat(e.target.value))}
                    className="w-full text-lg font-medium text-slate-700 bg-transparent border-0 border-b border-slate-200 focus:border-orange-500 focus:ring-0 px-0 py-1"
                  />
                </div>
              </InputGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <InputGroup label="Date">
                <input 
                  type="date" 
                  value={receipt.date} 
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="w-full text-base font-medium text-slate-700 bg-transparent border-0 border-b border-slate-200 focus:border-orange-500 focus:ring-0 px-0 py-1"
                />
              </InputGroup>
              <InputGroup label="Category">
                <select 
                  value={receipt.category} 
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full text-base font-medium text-slate-700 bg-transparent border-0 border-b border-slate-200 focus:border-orange-500 focus:ring-0 px-0 py-1 cursor-pointer"
                >
                  <option>Food Cost</option>
                  <option>Packaging</option>
                  <option>Utilities</option>
                  <option>Maintenance</option>
                  <option>Labor</option>
                </select>
              </InputGroup>
            </div>

            {/* Line Items Table */}
            <div className="pt-6">
              <div className="flex justify-between items-center mb-3">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Detected Items</label>
                 <button className="text-xs text-orange-600 font-bold hover:text-orange-700">+ Add Item</button>
              </div>
              <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 text-slate-500 font-semibold text-xs uppercase">
                    <tr>
                      <th className="px-3 py-2 text-center w-12">Qty</th>
                      <th className="px-3 py-2 text-left">Item</th>
                      <th className="px-3 py-2 text-right w-20">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                  {receipt.items?.map((item, idx) => (
                    <tr key={idx} className="bg-white">
                      <td className="p-0"><input value={item.qty} className="w-full text-center py-2 bg-transparent focus:bg-orange-50 outline-none font-medium text-slate-700" onChange={() => {}} /></td>
                      <td className="p-0 border-l border-r border-slate-100"><input value={item.name} className="w-full px-3 py-2 bg-transparent focus:bg-orange-50 outline-none text-slate-700" onChange={() => {}} /></td>
                      <td className="p-0"><input value={item.price} className="w-full text-right px-3 py-2 bg-transparent focus:bg-orange-50 outline-none font-medium text-slate-700" onChange={() => {}} /></td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-200 bg-white flex justify-between items-center gap-4 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)] z-20">
             <button 
               onClick={onCancel}
               className="text-slate-500 hover:text-slate-800 text-sm font-semibold px-4 py-2"
             >
               Cancel
             </button>
             <div className="flex gap-3">
               <button 
                 onClick={() => onReject(receipt.id)}
                 className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-semibold flex items-center gap-2 transition-colors border border-transparent hover:border-red-200"
               >
                 <X size={18} strokeWidth={2.5} /> Reject
               </button>
               <button 
                 onClick={() => onSave({...receipt, status: ReceiptStatus.APPROVED})}
                 className="px-8 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/20 font-semibold flex items-center gap-2 transition-transform hover:-translate-y-0.5 active:translate-y-0"
               >
                 <Check size={18} strokeWidth={3} /> Approve
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};