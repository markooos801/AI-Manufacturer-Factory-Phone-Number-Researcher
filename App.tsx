import React, { useState, useCallback } from 'react';
import { SearchParams, SearchState, CompanyRecord } from './types';
import { searchManufacturers } from './services/geminiService';
import { SearchForm } from './components/SearchForm';
import { ResultsTable } from './components/ResultsTable';
import { StatsDashboard } from './components/StatsDashboard';
import { Download, Bot, AlertCircle, Layers } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<SearchState>({
    isLoading: false,
    step: 'idle',
    records: [],
    error: null,
  });

  const handleSearch = useCallback(async (params: SearchParams) => {
    setState({ isLoading: true, step: 'generating_queries', records: [], error: null });
    
    try {
      const results = await searchManufacturers(params, (step) => {
        setState(prev => ({ ...prev, step }));
      });
      setState({ isLoading: false, step: 'complete', records: results, error: null });
    } catch (err: any) {
      setState({ 
        isLoading: false, 
        step: 'error', 
        records: [], 
        error: err.message || 'An unexpected error occurred during research.' 
      });
    }
  }, []);

  const handleExport = (format: 'csv' | 'json') => {
    if (state.records.length === 0) return;

    let content = '';
    let mimeType = '';
    let extension = '';

    if (format === 'json') {
      content = JSON.stringify(state.records, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    } else {
      // CSV Export logic
      const headers = ['Company', 'Type', 'Country', 'City', 'Phone', 'Email', 'Website', 'Score', 'Notes'];
      const rows = state.records.map(r => [
        `"${r.company_name}"`,
        r.manufacturer_type,
        r.country,
        r.city,
        r.phone_numbers[0]?.number || '',
        r.emails[0]?.email || '',
        r.website,
        r.verification_score,
        `"${r.notes.replace(/"/g, '""')}"`
      ]);
      content = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      mimeType = 'text/csv';
      extension = 'csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factory_find_results.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const StepIndicator = ({ currentStep }: { currentStep: string }) => {
    // Map internal steps to display labels
    const steps = [
      { id: 'generating_queries', label: 'Initializing' },
      { id: 'batch_1', label: 'Batch 1: Major Factories' },
      { id: 'batch_2', label: 'Batch 2: Local & SMEs' },
      { id: 'batch_3', label: 'Batch 3: Trade Fairs & Niche' },
      { id: 'finalizing', label: 'Processing Data' },
    ];
    
    if (currentStep === 'idle' || currentStep === 'complete' || currentStep === 'error') return null;

    const currentIndex = steps.findIndex(s => s.id === currentStep);
    
    // Fallback if step isn't in the list (e.g. intermediate state)
    const activeIndex = currentIndex === -1 ? 0 : currentIndex;

    return (
      <div className="max-w-3xl mx-auto mb-8 bg-white border border-indigo-100 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4 text-indigo-800">
           <Layers className="w-5 h-5 animate-pulse" />
           <span className="font-semibold">Deep Search in Progress...</span>
           <span className="text-xs text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full">Exhaustive Mode</span>
        </div>
        <div className="relative">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-100">
            <div 
              style={{ width: `${((activeIndex + 1) / steps.length) * 100}%` }} 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 transition-all duration-500 ease-out"
            ></div>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
             {steps.map((s, idx) => (
               <div key={s.id} className={`${idx === activeIndex ? 'text-indigo-700 font-bold' : ''} ${idx > activeIndex ? 'opacity-50' : ''}`}>
                 {s.label}
               </div>
             ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-indigo-500">
              FactoryFind AI
            </h1>
          </div>
          <div className="text-sm text-slate-500 hidden md:block">
            Global Manufacturer Discovery & Verification
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Find Verified Factories.
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-600">
            Deep search across global directories, trade fairs, and local registries.
          </p>
        </div>

        <SearchForm onSearch={handleSearch} isLoading={state.isLoading} />

        <StepIndicator currentStep={state.step} />

        {state.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-8">
            <AlertCircle className="w-5 h-5" />
            {state.error}
          </div>
        )}

        {!state.isLoading && state.records.length > 0 && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Research Results</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleExport('csv')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Download className="w-4 h-4" /> CSV
                </button>
                <button 
                  onClick={() => handleExport('json')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Download className="w-4 h-4" /> JSON
                </button>
              </div>
            </div>

            <StatsDashboard data={state.records} />
            <ResultsTable data={state.records} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;