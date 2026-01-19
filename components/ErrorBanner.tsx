
import React from 'react';
import { AppError } from '../types';

interface ErrorBannerProps {
  error: AppError;
  onRetry: () => void;
  onClear: () => void;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ error, onRetry, onClear }) => {
  const getIcon = () => {
    switch (error.type) {
      case 'IMAGE_QUALITY':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'NETWORK':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.345 6.447C6.345 1.448 17.656 1.448 22.656 6.447" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white border-2 border-red-100 rounded-3xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-top duration-300">
      <div className="flex flex-col sm:flex-row">
        <div className="bg-red-50 p-6 flex flex-col items-center justify-center sm:w-24 text-red-500">
          {getIcon()}
        </div>
        <div className="p-6 flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-slate-900">{error.message}</h3>
            <button onClick={onClear} className="text-slate-400 hover:text-slate-600 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <p className="text-sm text-slate-500 mb-4">Try the following to fix this:</p>
          <ul className="space-y-2 mb-6">
            {error.suggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 flex-shrink-0"></span>
                {suggestion}
              </li>
            ))}
          </ul>
          
          <div className="flex gap-3">
            <button 
              onClick={onRetry}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={onClear}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-sm transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorBanner;
