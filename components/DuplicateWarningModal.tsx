
import React from 'react';
import { ExtractionResult } from '../types';

interface DuplicateWarningModalProps {
  receipt: ExtractionResult;
  onConfirm: () => void;
  onCancel: () => void;
}

const DuplicateWarningModal: React.FC<DuplicateWarningModalProps> = ({ receipt, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-center text-lg font-bold text-slate-900">Possible Duplicate?</h3>
        <p className="text-center text-slate-500 text-sm mt-2 mb-6 leading-relaxed">
          A receipt from <strong>{receipt.merchantName}</strong> for <strong>{receipt.currency}{receipt.totalAmount.toFixed(2)}</strong> on <strong>{receipt.date}</strong> already exists in your vault.
        </p>
        <div className="flex flex-col gap-2">
          <button 
            onClick={onConfirm}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all"
          >
            Add Anyway
          </button>
          <button 
            onClick={onCancel}
            className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 active:scale-95 transition-all"
          >
            Discard Scan
          </button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateWarningModal;
