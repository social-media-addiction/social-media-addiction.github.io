import React, { useMemo, useCallback } from "react";
import * as d3 from 'd3';
import { StudentRecord, FilterCriteria } from "../data/data";
import RangeSlider from "./RangeSlider";

import MultiSelectDropdown from "../components/MultiSelectDropdown";

type OptionValue = string | number | boolean;

interface MultiSelectCheckboxesProps {
  label: string;
  options: OptionValue[];
  selectedValues: OptionValue[];
  onChange: (selected: OptionValue[]) => void;
}

/**
 * Minimal checkbox list component used for Gender / Academic_Level.
 */
const MultiSelectCheckboxes: React.FC<MultiSelectCheckboxesProps> = ({ label, options, selectedValues, onChange }) => {
  const toggle = (opt: OptionValue) => {
    if (selectedValues.includes(opt)) {
      onChange(selectedValues.filter(v => v !== opt));
    } else {
      onChange([...selectedValues, opt]);
    }
  };

  return (
    <fieldset className="w-full">
      <legend className="text-md text-gray-300 mb-2">{label}</legend>
      <div className="flex flex-col gap-1">
        {options.map((opt) => {
          const key = String(opt);
          const checked = selectedValues.includes(opt);
          return (
            <label key={key} className="inline-flex items-center gap-2 text-md text-gray-200 hover:text-[#69b3a2] cursor-pointer">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(opt)}
                className="checkbox checkbox-sm rounded-sm bg-white/10 text-teal-300"
              />
              <span className="truncate max-w-[160px]">{key}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
};

interface FilterSidebarProps {
  originalData: StudentRecord[];
  data: StudentRecord[];
  activeFilters: FilterCriteria;
  setActiveFilters: React.Dispatch<React.SetStateAction<FilterCriteria>>;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ originalData, data, activeFilters, setActiveFilters }) => {
  const filterableProperties: (keyof StudentRecord)[] = [
    'Gender',
    'Academic_Level',
    'Age', // Added Age
    'Most_Used_Platform',
    'Relationship_Status',
    'Country',
  ];

  // Calculate unique values and age bounds
  const uniqueFilterValues = useMemo(() => {
    const values: { [key: string]: Set<string | number | boolean> } = {};
    filterableProperties.forEach(prop => {
      values[prop as string] = new Set(originalData.map(d => d[prop]));
    });
    return values;
  }, [originalData]);

  const ageBounds = useMemo(() => {
    const ages = originalData.map(d => d.Age);
    if (ages.length === 0) return { min: 16, max: 30, rangeMin: 16, rangeMax: 30 };
    const min = d3.min(ages) || 16;
    const max = d3.max(ages) || 30;
    
    // Check if Age is already actively filtered
    const currentAgeFilter = activeFilters['Age'] as number[] | undefined;
    const rangeMin = currentAgeFilter ? currentAgeFilter[0] : min;
    const rangeMax = currentAgeFilter ? currentAgeFilter[1] : max;

    return { min, max, rangeMin, rangeMax };
  }, [originalData, activeFilters]);

  // General handler for multi-select/checkboxes
  const handleFilterChange = useCallback((property: keyof StudentRecord, selectedValues: (string | number | boolean)[]) => {
    setActiveFilters(prevFilters => {
      const newFilters = { ...prevFilters };
      if (selectedValues.length > 0) {
        newFilters[property] = selectedValues;
      } else {
        delete newFilters[property];
      }
      return newFilters;
    });
  }, [setActiveFilters]);

  // Specific handler for Age range slider
  const handleAgeRangeChange = useCallback((minAge: number, maxAge: number) => {
    setActiveFilters(prevFilters => {
      const newFilters = { ...prevFilters };
      // Check if the range is the same as the full available range (equivalent to 'no filter')
      if (minAge === ageBounds.min && maxAge === ageBounds.max) {
        delete newFilters['Age'];
      } else {
        newFilters['Age'] = [minAge, maxAge];
      }
      return newFilters;
    });
  }, [setActiveFilters, ageBounds.min, ageBounds.max]);


  const removeSingleFilterValue = (property: keyof StudentRecord, valueToRemove: string | number | boolean) => {
    setActiveFilters(prevFilters => {
      const currentValues = prevFilters[property] as (string | number | boolean)[] || [];
      const newValues = currentValues.filter(v => v !== valueToRemove);

      const newFilters = { ...prevFilters };
      if (newValues.length > 0) {
        newFilters[property] = newValues;
      } else {
        delete newFilters[property];
      }
      return newFilters;
    });
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700">
      <div className="bg-gray-900/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-xl">
        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
          <h3 className="text-lg font-bold text-sky-300">
            Filters
          </h3>
          {activeFilterCount > 0 && (
            <button
              onClick={() => setActiveFilters({})}
              className="text-sm bg-red-400 text-white px-2 py-1 rounded hover:bg-red-400/80 cursor-pointer transition"
            >
              Clear All 
              {/* ({activeFilterCount}) */}
            </button>
          )}
        </div>

        <div className="space-y-4">
          {filterableProperties.map(prop => {
            const selectedValues = Array.isArray(activeFilters[prop])
              ? (activeFilters[prop] as (string | number | boolean)[])
              : [];
            
            const label = prop.replace(/_/g, ' ');

            if (prop === 'Gender' || prop === 'Academic_Level') {
              // Use Checkboxes for these two
              return (
                <MultiSelectCheckboxes
                  key={prop}
                  label={label}
                  options={Array.from(uniqueFilterValues[prop as string] || [])}
                  selectedValues={selectedValues}
                  onChange={(selected) => handleFilterChange(prop, selected)}
                />
              );
            } else if (prop === 'Age') {
              // Use Range Slider for Age
              return (
                <RangeSlider
                  key={prop}
                  label={label}
                  min={ageBounds.min}
                  max={ageBounds.max}
                  initialMin={ageBounds.rangeMin}
                  initialMax={ageBounds.rangeMax}
                  onChange={handleAgeRangeChange}
                />
              );
            } else {
              // Use MultiSelectDropdown for all others
              return (
                <div key={prop} className="w-full group">
                  <MultiSelectDropdown                      
                    label={label}
                    options={Array.from(uniqueFilterValues[prop as string] || [])}
                    selectedValues={selectedValues}
                    onChange={(selected) => handleFilterChange(prop, selected)}
                    onClear={() => handleFilterChange(prop, [])}
                  />

                  {/* Compact Chip View */}
                  {selectedValues.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 pl-1">
                      {selectedValues.slice(0, 5).map((val) => (
                        <span
                          key={String(val)}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[12px] font-medium text-cyan-100 bg-cyan-900/40 border border-cyan-700/50 rounded-md"
                        >
                          {String(val).substring(0, 10)}{String(val).length > 10 ? '...' : ''}
                          <button
                            onClick={() => removeSingleFilterValue(prop, val)}
                            className="hover:text-white text-cyan-300 focus:outline-none ml-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {selectedValues.length > 5 && (
                        <span className="text-[10px] text-gray-400 px-1">+{selectedValues.length - 5} more</span>
                      )}
                    </div>
                  )}
                </div>
              );
            }
          })}
        </div>

        <div className="mt-6 pt-3 border-t border-white/10 text-center">
          <p className="text-xs text-gray-400">
            <span className="font-bold text-[#69b3a2]">{data.length}</span> records selected
          </p>
          <div className="w-full bg-gray-700/50 h-1 rounded-full mt-1 overflow-hidden">
            <div
              className="bg-[#69b3a2] h-full transition-all duration-500"
              style={{ width: `${(data.length / originalData.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </aside>
  );
}
export default FilterSidebar;