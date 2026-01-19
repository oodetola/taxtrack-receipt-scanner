
import React, { useState, useEffect } from 'react';

const steps = [
  "Analyzing image details...",
  "Consulting AI model...",
  "Identifying merchant and dates...",
  "Extracting line items...",
  "Saving to local database...",
  "Archiving to phone storage..."
];

const ProcessingLoader: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        const increment = prev > 80 ? 0.3 : 2.5;
        return prev + increment;
      });
    }, 100);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm overflow-hidden relative">
      {/* Scope CSS to component safely */}
      <style>
        {`
          @keyframes scan-line {
            0%, 100% { top: 0%; }
            50% { top: 98%; }
          }
        `}
      </style>
      
      <div className="absolute inset-0 bg-blue-50/30 animate-pulse pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-8 w-24 h-32 bg-slate-50 border-2 border-slate-200 rounded-lg overflow-hidden shadow-inner">
          <div className="absolute inset-x-0 top-0 h-1/2 bg-slate-100 flex flex-col p-2 space-y-1">
             <div className="h-2 w-3/4 bg-slate-200 rounded"></div>
             <div className="h-2 w-1/2 bg-slate-200 rounded"></div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1/2 p-2 flex flex-col justify-end space-y-1">
             <div className="h-4 w-1/2 bg-blue-100 rounded ml-auto"></div>
          </div>
          {/* Unsafe dangerouslySetInnerHTML removed in favor of standard style animation */}
          <div 
            className="absolute inset-x-0 h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]" 
            style={{ animation: 'scan-line 2s ease-in-out infinite' }}
          ></div>
        </div>

        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <h3 className="text-lg font-bold text-slate-900">AI Extraction Active</h3>
          </div>
          <p className="text-slate-500 text-xs font-medium h-5">{steps[currentStep]}</p>
        </div>

        <div className="w-full max-w-xs bg-slate-100 h-2 rounded-full overflow-hidden mb-8">
          <div 
            className="h-full bg-blue-600 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(37,99,235,0.3)]"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest font-bold">Secure Local Storage & Cloud AI</p>
      </div>
    </div>
  );
};

export default ProcessingLoader;
