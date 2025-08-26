import React, { useState } from 'react';
import { Filter, Search, X, ChevronDown } from 'lucide-react';

export interface FilterOptions {
  search: string;
  category: string;
  status: string;
  trend: string;
  stockLevel: string;
  holidayImpact: string;
}

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  categories: string[];
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  categories,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      category: '',
      status: '',
      trend: '',
      stockLevel: '',
      holidayImpact: '',
    });
  };

  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== ''
  ).length;

  return (
    <div className="bg-gray-900 text-white rounded-2xl shadow-xl border border-gray-700 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl mr-3">
            <Filter className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">Filters & Search</h3>
          {activeFiltersCount > 0 && (
            <span className="ml-3 bg-blue-800 text-blue-200 text-xs font-bold px-2 py-1 rounded-full">
              {activeFiltersCount} active
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-400 hover:text-red-300 font-medium flex items-center"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-sm text-gray-400 hover:text-white"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform mr-1 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
            {isExpanded ? 'Less' : 'More'} Filters
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          placeholder="Search products by name or category..."
          className="w-full pl-10 pr-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
        />
      </div>

      {/* Quick Filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="bg-gray-800 text-white border border-gray-700 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="bg-gray-800 text-white border border-gray-700 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Status</option>
          <option value="good">Good Stock</option>
          <option value="low">Low Stock</option>
          <option value="critical">Critical Stock</option>
        </select>

        <select
          value={filters.trend}
          onChange={(e) => handleFilterChange('trend', e.target.value)}
          className="bg-gray-800 text-white border border-gray-700 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Trends</option>
          <option value="increasing">Increasing</option>
          <option value="stable">Stable</option>
          <option value="decreasing">Decreasing</option>
        </select>

        <select
          value={filters.stockLevel}
          onChange={(e) => handleFilterChange('stockLevel', e.target.value)}
          className="bg-gray-800 text-white border border-gray-700 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Stock Level</option>
          <option value="high">High (&gt;75%)</option>
          <option value="medium">Medium (25-75%)</option>
          <option value="low">Low (&lt;25%)</option>
        </select>

        <select
          value={filters.holidayImpact}
          onChange={(e) => handleFilterChange('holidayImpact', e.target.value)}
          className="bg-gray-800 text-white border border-gray-700 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Holiday Impact</option>
          <option value="high">High (&gt;75%)</option>
          <option value="medium">Medium (25-75%)</option>
          <option value="low">Low (&lt;25%)</option>
        </select>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:shadow-md transition-all duration-200"
        >
          Advanced
        </button>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="border-t border-gray-700 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Last Restocked
              </label>
              <select className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Any time</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Predicted Out Date
              </label>
              <select className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Any time</option>
                <option value="3days">Next 3 days</option>
                <option value="week">Next week</option>
                <option value="month">Next month</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
