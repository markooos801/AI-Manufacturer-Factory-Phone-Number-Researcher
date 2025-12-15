import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { SearchParams } from '../types';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [params, setParams] = useState<SearchParams>({
    product: '',
    country: '',
    industry: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (params.product && params.country) {
      onSearch(params);
    }
  };

  const industries = [
    "Textiles & Apparel",
    "Consumer Electronics",
    "Industrial Machinery",
    "Automotive Parts",
    "Construction Materials",
    "Food & Beverage",
    "Chemicals",
    "Furniture",
    "Packaging",
    "Medical Devices",
    "Other"
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
      <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Search className="w-5 h-5 text-indigo-600" />
        New Research Task
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
          <input
            type="text"
            placeholder="e.g. Ceramic Tiles, T-Shirts"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            value={params.product}
            onChange={(e) => setParams({ ...params, product: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">Target Country</label>
          <input
            type="text"
            placeholder="e.g. Spain, Vietnam, China"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            value={params.country}
            onChange={(e) => setParams({ ...params, country: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>

        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">Industry Sector</label>
          <select
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors bg-white"
            value={params.industry}
            onChange={(e) => setParams({ ...params, industry: e.target.value })}
            disabled={isLoading}
          >
            <option value="">Select Industry...</option>
            {industries.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-1">
          <button
            type="submit"
            disabled={isLoading || !params.product || !params.country}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Researching...
              </>
            ) : (
              'Start Research'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};