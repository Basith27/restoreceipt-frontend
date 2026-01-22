import React, { useState, useRef } from 'react';
import { Upload, CheckCircle2, AlertCircle, Loader2, XCircle, File } from 'lucide-react';
import { uploadAndAnalyze } from '../services/receiptService';
import { Receipt, ReceiptStatus } from '../types';

// Define a new type for tracking the state of each uploaded file in batch mode
type UploadStatus = 'pending' | 'processing' | 'success' | 'error';
interface UploadedFile {
  id: number;
  file: File;
  status: UploadStatus;
  errorMessage?: string;
}

interface CaptureProps {
  onCaptureComplete: (data: Partial<Receipt>, image: string, fileType: string) => void;
  onBatchComplete: (receipts: Receipt[]) => void;
}

export const Capture: React.FC<CaptureProps> = ({ onCaptureComplete, onBatchComplete }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  
  // Use separate state variables for single vs. batch processing
  const [isProcessingSingle, setIsProcessingSingle] = useState(false);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- BATCH MODE LOGIC ---

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles: UploadedFile[] = Array.from(files).map((file, index) => ({
      id: Date.now() + index,
      file,
      status: 'pending',
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleProcessBatch = async () => {
    setIsProcessingBatch(true);
    const newReceipts: Receipt[] = [];

    const processFile = async (uploadedFile: UploadedFile) => {
      // Set status to 'processing' for this specific file in the UI list
      setUploadedFiles(prev => prev.map(f => f.id === uploadedFile.id ? { ...f, status: 'processing' } : f));

      try {
        const imageUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(uploadedFile.file);
        });

        const extractedData = await uploadAndAnalyze(uploadedFile.file);
        console.log(extractedData)
        
        // Create the new receipt object
        const newReceipt: Receipt = {
          id: `batch-${uploadedFile.id}`,
          vendorName: extractedData.vendorName || 'Unknown Vendor',
          totalAmount: extractedData.totalAmount || 0,
          date: extractedData.date || new Date().toISOString().split('T')[0],
          category: extractedData.category || 'Uncategorized',
          taxAmount: extractedData.taxAmount || 0,
          status: extractedData.status || ReceiptStatus.NEEDS_REVIEW, 
          imageUrl,
          confidence: extractedData.confidence || 50,
          items: extractedData.items || [],
          currency: extractedData.currency || '$',
          uploadedBy: 'You'
        };
        newReceipts.push(newReceipt);

        // Set status to 'success' for this file
        setUploadedFiles(prev => prev.map(f => f.id === uploadedFile.id ? { ...f, status: 'success' } : f));
      } catch (err: any) {
        // Set status to 'error' for this file and store the message
        setUploadedFiles(prev => prev.map(f => f.id === uploadedFile.id ? { ...f, status: 'error', errorMessage: err.message } : f));
      }
    };

    // Use Promise.all to run all API calls in parallel for speed
    await Promise.all(uploadedFiles.map(processFile));
    
    // Once all are done, call the parent handler and reset the state
    onBatchComplete(newReceipts);
    setIsProcessingBatch(false);
    setUploadedFiles([]);
  };

  const renderStatusIcon = (status: UploadStatus) => {
    switch (status) {
      case 'processing': return <Loader2 className="animate-spin text-orange-500" size={20} />;
      case 'success': return <CheckCircle2 className="text-emerald-500" size={20} />;
      case 'error': return <XCircle className="text-red-500" size={20} />;
      default: return <File className="text-slate-400" size={20} />;
    }
  };


  // --- SINGLE MODE LOGIC ---

  const handleSingleFile = async (file: File) => {
    if (!file) return;
    setIsProcessingSingle(true);
    
    try {
        const imageUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
        });
        const extractedData = await uploadAndAnalyze(file);
        
        // onCaptureComplete will navigate away, so we don't need to set processing to false in the success case
        onCaptureComplete(extractedData, imageUrl, file.type);
    } catch (err) {
        console.error("Failed to parse", err);
        alert("Failed to process image. Please try again.");
        // If there's an error, we must turn off the spinner to return to the upload screen
        setIsProcessingSingle(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (batchMode) {
      handleFiles(e.dataTransfer.files);
    } else {
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleSingleFile(e.dataTransfer.files[0]);
      }
    }
  };

  // --- RENDER LOGIC ---

  return (
    <div className="h-full flex flex-col p-6 md:p-10 bg-[#F8F9FC]">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Add Receipt</h1>
            <p className="text-slate-500 mt-2">Upload a photo or PDF to automatically extract details.</p>
          </div>
          <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm inline-flex">
             <button onClick={() => { setBatchMode(false); setUploadedFiles([]); }} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${!batchMode ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>Single</button>
             <button onClick={() => { setBatchMode(true); setUploadedFiles([]); }} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${batchMode ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>Batch Mode</button>
          </div>
        </div>

        {/* This is the top-level conditional render for the single mode spinner */}
        {isProcessingSingle ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-xl p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-30 translate-x-1/2 translate-y-1/2"></div>
            <div className="relative z-10 text-center">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-orange-100 rounded-full animate-ping opacity-75"></div>
                <div className="relative bg-white p-6 rounded-full shadow-lg border border-orange-50">
                  <Loader2 className="animate-spin text-orange-600 w-16 h-16" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="mt-8 text-2xl font-bold text-slate-900">Analyzing Receipt...</h3>
              <p className="text-slate-500 mt-3 text-lg max-w-md mx-auto">Our AI is identifying the vendor, date, and line items.</p>
            </div>
          </div>
        ) : (
          <>
            {!batchMode && (
                <div 
                    className={`flex-1 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden bg-white ${isDragOver ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-orange-300'}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={(e) => e.target.files?.[0] && handleSingleFile(e.target.files[0])} />
                    <div className="text-center">
                        <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900">Drag & Drop Receipt</h3>
                        <p className="text-slate-500">or click to browse</p>
                    </div>
                </div>
            )}
            
            {batchMode && (
              <div className="flex-1 flex flex-col gap-6">
                <div 
                  className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer bg-white ${isDragOver ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-orange-300'}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" multiple onChange={(e) => handleFiles(e.target.files)} />
                  <Upload className="w-10 h-10 text-slate-400" />
                  <p className="font-semibold mt-2 text-slate-700">Drag & drop files here, or click to select multiple</p>
                </div>
                
                {uploadedFiles.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-semibold text-slate-800">Upload Queue ({uploadedFiles.length})</h3>
                      <button 
                        onClick={handleProcessBatch} 
                        disabled={isProcessingBatch}
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold text-sm disabled:bg-slate-400"
                      >
                        {isProcessingBatch ? "Processing..." : `Process All`}
                      </button>
                    </div>
                    <div className="overflow-y-auto">
                      <table className="w-full text-sm">
                        <tbody>
                          {uploadedFiles.map(uf => (
                            <tr key={uf.id} className="border-b border-slate-100">
                              <td className="p-4 w-12 text-center">{renderStatusIcon(uf.status)}</td>
                              <td className="p-4 font-medium text-slate-800">
                                {uf.file.name}
                                {uf.status === 'error' && <p className="text-xs text-red-500">{uf.errorMessage}</p>}
                              </td>
                              <td className="p-4 text-slate-500 text-xs">{(uf.file.size / 1024).toFixed(1)} KB</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};