
import React from 'react';

interface FilterControlsProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  categories: string[];
}

const FilterControls: React.FC<FilterControlsProps> = ({
  searchQuery, setSearchQuery,
  categoryFilter, setCategoryFilter,
  startDate, setStartDate,
  endDate, setEndDate,
  categories
}) => {
  return (
    <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search merchant..."
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Category Filter */}
        <div className="flex-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Category</label>
          <select
            className="w-full bg-slate-50 border-none rounded-xl text-sm py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none cursor-pointer"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Date Filters */}
        <div className="flex-[2] flex gap-2">
          <div className="flex-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">From</label>
            <input
              type="date"
              className="w-full bg-slate-50 border-none rounded-xl text-sm py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">To</label>
            <input
              type="date"
              className="w-full bg-slate-50 border-none rounded-xl text-sm py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {(searchQuery || categoryFilter || startDate || endDate) && (
        <button 
          onClick={() => {
            setSearchQuery('');
            setCategoryFilter('');
            setStartDate('');
            setEndDate('');
          }}
          className="text-xs text-blue-600 font-semibold hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
};

export default FilterControls;
