
import React, { useState, useEffect, useMemo } from 'react';
import { AppView, Receipt, AppError, ExtractionResult } from './types';
import { extractReceiptData } from './services/geminiService';
import { saveImageToDB, getImageFromDB, deleteImageFromDB, downloadToDevice } from './services/storageService';
import CameraCapture from './components/CameraCapture';
import StatsDashboard from './components/StatsDashboard';
import ReceiptDetails from './components/ReceiptDetails';
import FilterControls from './components/FilterControls';
import ProcessingLoader from './components/ProcessingLoader';
import ErrorBanner from './components/ErrorBanner';
import DuplicateWarningModal from './components/DuplicateWarningModal';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  const [appError, setAppError] = useState<AppError | null>(null);
  const [autoSaveToDevice, setAutoSaveToDevice] = useState(true);
  const [pendingReceipt, setPendingReceipt] = useState<{data: ExtractionResult, image: string} | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('tax_receipts_meta');
    if (saved) {
      try {
        setReceipts(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load metadata", e);
      }
    }
    const settings = localStorage.getItem('tax_settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setAutoSaveToDevice(parsed.autoSave ?? true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tax_receipts_meta', JSON.stringify(receipts));
    localStorage.setItem('tax_settings', JSON.stringify({ autoSave: autoSaveToDevice }));
  }, [receipts, autoSaveToDevice]);

  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    receipts.forEach(r => cats.add(r.category));
    return Array.from(cats).sort();
  }, [receipts]);

  const filteredReceipts = useMemo(() => {
    return receipts.filter(receipt => {
      const matchesSearch = receipt.merchantName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === '' || receipt.category === categoryFilter;
      const matchesStart = startDate === '' || receipt.date >= startDate;
      const matchesEnd = endDate === '' || receipt.date <= endDate;
      return matchesSearch && matchesCategory && matchesStart && matchesEnd;
    });
  }, [receipts, searchQuery, categoryFilter, startDate, endDate]);

  const finalizeReceipt = async (extracted: ExtractionResult, imageData: string) => {
    const id = crypto.randomUUID();
    
    // 2. Save image to local IndexedDB (Safe from browser 5MB limit)
    await saveImageToDB(id, imageData);
    
    // 3. Auto-save copy to Phone's File System (Downloads)
    if (autoSaveToDevice) {
      const cleanMerchant = extracted.merchantName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `TaxTrack_${extracted.date}_${cleanMerchant}_${extracted.totalAmount.toFixed(2)}.jpg`;
      downloadToDevice(imageData, filename);
    }
    
    const newReceipt: Receipt = {
      ...extracted,
      id,
      imageUrl: '', // Binary image stays in IndexedDB, not localStorage
      createdAt: Date.now(),
    };
    
    setReceipts(prev => [newReceipt, ...prev]);
    setSelectedReceiptId(newReceipt.id);
  };

  const handleCapture = async (imageData: string) => {
    setView(AppView.DASHBOARD); 
    setIsLoading(true);
    setAppError(null);
    
    try {
      // 1. Extract with High-Quality Gemini AI
      const extracted = await extractReceiptData(imageData);
      
      // Duplicate Check logic: Merchant (case insensitive), Date, and Amount
      const isDuplicate = receipts.some(r => 
        r.merchantName.toLowerCase() === extracted.merchantName.toLowerCase() &&
        r.date === extracted.date &&
        Math.abs(r.totalAmount - extracted.totalAmount) < 0.01
      );

      if (isDuplicate) {
        setPendingReceipt({ data: extracted, image: imageData });
        setIsLoading(false);
      } else {
        await finalizeReceipt(extracted, imageData);
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("Capture Error:", err);
      setAppError(err as AppError);
      setIsLoading(false);
    }
  };

  const confirmDuplicate = async () => {
    if (pendingReceipt) {
      setIsLoading(true);
      await finalizeReceipt(pendingReceipt.data, pendingReceipt.image);
      setPendingReceipt(null);
      setIsLoading(false);
    }
  };

  const discardDuplicate = () => {
    setPendingReceipt(null);
  };

  const deleteReceipt = async (id: string) => {
    await deleteImageFromDB(id);
    setReceipts(prev => prev.filter(r => r.id !== id));
    setSelectedReceiptId(null);
  };

  const updateReceipt = (id: string, updatedReceipt: Partial<Receipt>) => {
    setReceipts(prev => prev.map(r => r.id === id ? { ...r, ...updatedReceipt } : r));
  };

  const selectedReceiptMetadata = useMemo(() => 
    receipts.find(r => r.id === selectedReceiptId) || null
  , [receipts, selectedReceiptId]);

  return (
    <div className="min-h-screen pb-32 max-w-md mx-auto sm:max-w-4xl px-4 pt-8">
      <header className="flex items-center justify-between mb-8">
        <div className="cursor-pointer" onClick={() => setView(AppView.DASHBOARD)}>
          <div className="flex items-center gap-2">
             <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200">R</div>
             <h1 className="text-xl font-bold text-slate-900">Receipt Vault</h1>
          </div>
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">Personal Tax Archive</p>
        </div>
        
        <button 
          onClick={() => setAutoSaveToDevice(!autoSaveToDevice)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold transition-all shadow-sm ${
            autoSaveToDevice ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-500'
          }`}
        >
          {autoSaveToDevice ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          ) : (
             <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
          )}
          {autoSaveToDevice ? 'AUTO-EXPORT ON' : 'AUTO-EXPORT OFF'}
        </button>
      </header>

      <main className="space-y-8">
        {appError && (
          <ErrorBanner 
            error={appError} 
            onRetry={() => {
              setAppError(null);
              setView(AppView.CAPTURE);
            }} 
            onClear={() => setAppError(null)} 
          />
        )}

        {isLoading && <ProcessingLoader />}

        {view === AppView.DASHBOARD && !isLoading && (
          <>
            <StatsDashboard receipts={filteredReceipts} />
            
            <section className="mt-8 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Captured Receipts</h2>
                <button 
                  onClick={() => setView(AppView.HISTORY)}
                  className="text-blue-600 font-semibold text-xs bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100"
                >
                  History
                </button>
              </div>

              <FilterControls 
                searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
                startDate={startDate} setStartDate={setStartDate}
                endDate={endDate} setEndDate={setEndDate}
                categories={allCategories}
              />
              
              <div className="space-y-3">
                {filteredReceipts.slice(0, 10).map(receipt => (
                  <button 
                    key={receipt.id}
                    onClick={() => setSelectedReceiptId(receipt.id)}
                    className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 transition-all hover:shadow-lg group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-slate-50 group-hover:bg-blue-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-blue-400 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-900 text-sm leading-none mb-1">{receipt.merchantName}</p>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{new Date(receipt.date).toLocaleDateString()} • {receipt.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 text-sm">{receipt.currency}{receipt.totalAmount.toFixed(2)}</p>
                    </div>
                  </button>
                ))}
                
                {receipts.length > 0 && filteredReceipts.length === 0 && (
                  <div className="text-center py-12 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                    No receipts found for this filter.
                  </div>
                )}

                {receipts.length === 0 && !appError && (
                  <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                    <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                       </svg>
                    </div>
                    <h3 className="text-slate-900 font-bold">Safe & Private Extraction</h3>
                    <p className="text-slate-400 text-xs mt-2 px-8">Snap a photo. Gemini AI extracts the details, then we save a copy directly to your phone storage.</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {view === AppView.HISTORY && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <button onClick={() => setView(AppView.DASHBOARD)} className="p-2 bg-white rounded-full border border-slate-200 shadow-sm active:scale-95 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <h2 className="text-2xl font-bold">All Records</h2>
            </div>

            <FilterControls 
              searchQuery={searchQuery} setSearchQuery={setSearchQuery}
              categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
              startDate={startDate} setStartDate={setStartDate}
              endDate={endDate} setEndDate={setEndDate}
              categories={allCategories}
            />

            <div className="grid grid-cols-1 gap-3">
               {filteredReceipts.map(receipt => (
                  <button 
                    key={receipt.id}
                    onClick={() => setSelectedReceiptId(receipt.id)}
                    className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 transition-all hover:shadow-md group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-50 group-hover:bg-blue-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                          <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-900 text-sm">{receipt.merchantName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{new Date(receipt.date).toLocaleDateString()} • {receipt.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 text-sm">{receipt.currency}{receipt.totalAmount.toFixed(2)}</p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-xl border-t border-slate-100 flex justify-center z-30 pb-safe">
        <div className="flex items-center bg-slate-900 text-white rounded-full p-2 shadow-2xl gap-2">
          <button 
            onClick={() => setView(AppView.DASHBOARD)}
            className={`px-5 py-2.5 rounded-full transition-all flex items-center gap-2 ${view === AppView.DASHBOARD ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a2 2 0 002 2h2a2 2 0 002-2v-4a1 1 0 112 0v4a2 2 0 002-2h2a2 2 0 002-2v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="hidden md:inline font-bold text-xs uppercase tracking-widest">Dashboard</span>
          </button>

          <button 
            onClick={() => setView(AppView.CAPTURE)}
            className="w-14 h-14 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center shadow-[0_8px_25px_rgba(37,99,235,0.4)] transition-all active:scale-90 hover:scale-105"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          <button 
            onClick={() => setView(AppView.HISTORY)}
            className={`px-5 py-2.5 rounded-full transition-all flex items-center gap-2 ${view === AppView.HISTORY ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
            </svg>
            <span className="hidden md:inline font-bold text-xs uppercase tracking-widest">History</span>
          </button>
        </div>
      </nav>

      {view === AppView.CAPTURE && (
        <CameraCapture 
          onCapture={handleCapture}
          onCancel={() => setView(AppView.DASHBOARD)}
        />
      )}

      {selectedReceiptMetadata && (
        <ReceiptDetails 
          receipt={selectedReceiptMetadata}
          onClose={() => setSelectedReceiptId(null)}
          onDelete={deleteReceipt}
          onUpdate={updateReceipt}
        />
      )}

      {pendingReceipt && (
        <DuplicateWarningModal 
          receipt={pendingReceipt.data}
          onConfirm={confirmDuplicate}
          onCancel={discardDuplicate}
        />
      )}
    </div>
  );
};

export default App;
