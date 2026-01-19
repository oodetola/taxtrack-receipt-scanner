
import React, { useState, useEffect } from 'react';
import { Receipt, STANDARD_TAX_CATEGORIES, ReceiptItem } from '../types';
import { getImageFromDB, downloadToDevice } from '../services/storageService';

interface ReceiptDetailsProps {
  receipt: Receipt;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updatedFields: Partial<Receipt>) => void;
}

const ReceiptDetails: React.FC<ReceiptDetailsProps> = ({ receipt, onClose, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Receipt>(receipt);
  const [fullImageUrl, setFullImageUrl] = useState<string>('');
  const [isImgLoading, setIsImgLoading] = useState(true);

  // Load image from phone drive (IndexedDB) when modal opens
  useEffect(() => {
    const loadImg = async () => {
      setIsImgLoading(true);
      const img = await getImageFromDB(receipt.id);
      setFullImageUrl(img);
      setIsImgLoading(false);
    };
    loadImg();
  }, [receipt.id]);

  const handleSave = () => {
    onUpdate(receipt.id, editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm(receipt);
    setIsEditing(false);
  };

  const updateItem = (index: number, field: keyof ReceiptItem, value: any) => {
    const newItems = [...editForm.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setEditForm({ ...editForm, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = editForm.items.filter((_, i) => i !== index);
    setEditForm({ ...editForm, items: newItems });
  };

  const addItem = () => {
    setEditForm({
      ...editForm,
      items: [...editForm.items, { description: '', amount: 0 }]
    });
  };

  const handleManualDownload = () => {
     if (fullImageUrl) {
       const cleanMerchant = receipt.merchantName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
       const filename = `TaxTrack_${receipt.date}_${cleanMerchant}.jpg`;
       downloadToDevice(fullImageUrl, filename);
     }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-lg font-bold text-slate-900">Receipt Details</h2>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-bold transition-colors"
                >
                  EDIT
                </button>
                <button 
                  onClick={() => onDelete(receipt.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleCancel}
                  className="px-4 py-2 text-slate-500 hover:text-slate-700 text-xs font-bold"
                >
                  CANCEL
                </button>
                <button 
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold shadow-md transition-colors"
                >
                  SAVE
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-6">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Category</label>
                {isEditing ? (
                  <select 
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 font-bold px-3 py-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none border-none"
                  >
                    {STANDARD_TAX_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                ) : (
                  <span className="bg-blue-50 text-blue-700 font-bold px-3 py-1.5 rounded-lg text-[10px] inline-block uppercase tracking-wider">{receipt.category}</span>
                )}
                
                <div className="mt-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Merchant</label>
                  {isEditing ? (
                    <input 
                      type="text"
                      value={editForm.merchantName}
                      onChange={(e) => setEditForm({ ...editForm, merchantName: e.target.value })}
                      className="w-full text-xl font-bold bg-slate-50 border-none rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  ) : (
                    <h1 className="text-2xl font-bold text-slate-900">{receipt.merchantName}</h1>
                  )}
                </div>

                <div className="mt-4 flex gap-4">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Date</label>
                    {isEditing ? (
                      <input 
                        type="date"
                        value={editForm.date}
                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                        className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-slate-600 font-medium">{new Date(receipt.date).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div className="flex-1 text-right">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Currency</label>
                    {isEditing ? (
                      <input 
                        type="text"
                        value={editForm.currency}
                        onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })}
                        className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-sm text-right focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-slate-600 font-bold">{receipt.currency}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 text-center">Final Total</label>
                {isEditing ? (
                  <input 
                    type="number"
                    step="0.01"
                    value={editForm.totalAmount}
                    onChange={(e) => setEditForm({ ...editForm, totalAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-3xl font-bold text-blue-600 text-center focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                ) : (
                  <div className="text-3xl font-bold text-blue-600 text-center">
                    {receipt.currency}{receipt.totalAmount.toFixed(2)}
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Line Items</h3>
                  {isEditing && (
                    <button 
                      onClick={addItem}
                      className="text-[10px] text-blue-600 font-bold uppercase tracking-widest hover:underline"
                    >
                      + Add Item
                    </button>
                  )}
                </div>
                
                <div className="space-y-2">
                  {(isEditing ? editForm.items : receipt.items).map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      {isEditing ? (
                        <>
                          <input 
                            type="text"
                            value={item.description}
                            placeholder="Item description"
                            onChange={(e) => updateItem(idx, 'description', e.target.value)}
                            className="flex-1 bg-slate-50 border-none rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-400 outline-none"
                          />
                          <input 
                            type="number"
                            step="0.01"
                            value={item.amount}
                            onChange={(e) => updateItem(idx, 'amount', parseFloat(e.target.value) || 0)}
                            className="w-20 bg-slate-50 border-none rounded-lg px-3 py-2 text-xs font-bold focus:ring-1 focus:ring-blue-400 outline-none"
                          />
                          <button onClick={() => removeItem(idx)} className="text-red-300 p-2">×</button>
                        </>
                      ) : (
                        <div className="flex justify-between w-full text-xs py-2 border-b border-slate-50 last:border-0">
                          <span className="text-slate-600">{item.description}</span>
                          <span className="font-bold text-slate-900">{receipt.currency}{item.amount.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:w-72 space-y-4">
               <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digital Snapshot</h3>
               <div className="rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm relative aspect-[3/4] bg-slate-50">
                 {isImgLoading ? (
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                   </div>
                 ) : (
                   <img 
                     src={fullImageUrl} 
                     alt="Receipt" 
                     className="w-full h-full object-contain"
                   />
                 )}
               </div>
               
               <button 
                onClick={handleManualDownload}
                className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                 </svg>
                 Save Copy to Phone
               </button>
               <p className="text-[9px] text-slate-400 text-center font-medium">This photo is stored only on this device.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptDetails;
