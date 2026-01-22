import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Capture } from './components/Capture';
import { Verifier } from './components/Verifier';
import { Ledger } from './components/Ledger';
import { Export } from './components/Export';
import { AppView, Receipt, ReceiptStatus, Stats } from './types';

const MOCK_RECEIPTS: Receipt[] = [
  {
    id: '1',
    vendorName: 'Sysco Food Services',
    totalAmount: 1245.50,
    date: '2023-10-24',
    category: 'Food Cost',
    taxAmount: 124.50,
    status: ReceiptStatus.APPROVED,
    imageUrl: 'https://picsum.photos/400/600',
    confidence: 98,
    uploadedBy: 'John Doe'
  },
  {
    id: '2',
    vendorName: 'City Utilities',
    totalAmount: 340.00,
    date: '2023-10-25',
    category: 'Utilities',
    taxAmount: 0,
    status: ReceiptStatus.NEEDS_REVIEW,
    imageUrl: 'https://picsum.photos/400/601',
    confidence: 65,
    uploadedBy: 'Jane Smith'
  }
];

const MOCK_STATS: Stats = {
  pendingCount: 12,
  approvedCount: 145,
  monthSpend: 15430,
  projectedTax: 1543
};

function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [receipts, setReceipts] = useState<Receipt[]>(MOCK_RECEIPTS);
  const [activeReceipt, setActiveReceipt] = useState<Receipt | null>(null);

  const handleCaptureComplete = (data: Partial<Receipt>, image: string, fileType: string) => {
    const newReceipt: Receipt = {
      id: Date.now().toString(),
      vendorName: data.vendorName || 'Unknown Vendor',
      vendorAddress: data.vendorAddress || '',
      gstin: data.gstin || '',
      totalAmount: data.totalAmount || 0,
      date: data.date || new Date().toISOString().split('T')[0],
      imageUrl: image,
      uploadedBy: 'You',
      fileType: fileType,
      category: data.category || 'Uncategorized',
      status: data.status || ReceiptStatus.NEEDS_REVIEW,
      confidence: data.confidence || 50,
      taxAmount: data.taxAmount || 0,
      items: data.items || [],
      currency: data.currency || '₹',
      extractionSource: data.extractionSource
    }
    
    // setActiveReceipt(newReceipt);
    setReceipts(prev => [newReceipt, ...prev]);
    setCurrentView(AppView.LEDGER);
  };

  const handleBatchComplete = (newReceipts: Receipt[]) => {
    setReceipts(prev => [...newReceipts, ...prev]);
    setCurrentView(AppView.LEDGER);
  };

  const handleSaveReceipt = (updated: Receipt) => {
    // Check if it already exists to update or add new
    setReceipts(prev => {
      const exists = prev.find(r => r.id === updated.id);
      if (exists) {
        return prev.map(r => r.id === updated.id ? updated : r);
      }
      return [updated, ...prev];
    });
    setActiveReceipt(null);
    setCurrentView(AppView.LEDGER);
  };

  const handleReviewClick = (receipt: Receipt) => {
    setActiveReceipt(receipt);
    setCurrentView(AppView.VERIFIER);
  };

  const handleRejectReceipt = (id: string) => {
    setReceipts(prev => prev.filter(r => r.id !== id));
    setActiveReceipt(null);
    setCurrentView(AppView.LEDGER);
  };

  const handleCancelReview = () => {
    setActiveReceipt(null);
    setCurrentView(AppView.LEDGER);
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard 
          stats={MOCK_STATS} 
          recentActivity={receipts} 
          onUploadClick={() => setCurrentView(AppView.CAPTURE)}
          onReviewClick={handleReviewClick}
        />;
      case AppView.CAPTURE:
        return <Capture onCaptureComplete={handleCaptureComplete} onBatchComplete={handleBatchComplete} />;
      case AppView.VERIFIER:
        if (!activeReceipt) return <div>Error: No receipt selected</div>;
        return <Verifier 
          receipt={activeReceipt} 
          onSave={handleSaveReceipt}
          onReject={handleRejectReceipt}
          onCancel={handleCancelReview}
        />;
      case AppView.LEDGER:
        return <Ledger receipts={receipts} onReviewClick={handleReviewClick} />;
      case AppView.EXPORT:
        return <Export receipts={receipts} />;
      default:
        return <div>View not found</div>;
    }
  };

  console.log(receipts);

  return (
    <Layout currentView={currentView} setView={setCurrentView}>
      {renderContent()}
    </Layout>
  );
}

export default App;
