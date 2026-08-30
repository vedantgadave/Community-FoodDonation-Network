import React from 'react';
import { DonationFilter, FoodType } from '../../types';
import { Search, Filter, MapPin, Hash, RotateCcw } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface DonationFilterBarProps {
  filters: DonationFilter;
  onChange: (filters: DonationFilter) => void;
  onReset: () => void;
}

export const DonationFilterBar: React.FC<DonationFilterBarProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value });
  };

  const handleFoodTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, foodType: e.target.value as FoodType | 'ALL' });
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, location: e.target.value });
  };

  const handleMinQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    onChange({ ...filters, minQuantity: val });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-sm">
          <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Filter Available Donations
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Reset Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <Input
          placeholder="Search food or event..."
          value={filters.search}
          onChange={handleSearchChange}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        />

        {/* Food Type */}
        <Select
          value={filters.foodType}
          onChange={handleFoodTypeChange}
          options={[
            { value: 'ALL', label: 'All Food Types' },
            { value: 'VEGETARIAN', label: 'Vegetarian Only' },
            { value: 'NON_VEGETARIAN', label: 'Non-Vegetarian Only' },
          ]}
        />

        {/* Location Filter */}
        <Input
          placeholder="Filter by city/location..."
          value={filters.location}
          onChange={handleLocationChange}
          leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
        />

        {/* Min Quantity */}
        <Input
          type="number"
          placeholder="Min Quantity (meals)"
          value={filters.minQuantity || ''}
          onChange={handleMinQuantityChange}
          leftIcon={<Hash className="w-4 h-4 text-slate-400" />}
        />
      </div>
    </div>
  );
};
