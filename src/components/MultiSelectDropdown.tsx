import React, { useState, useRef, useEffect, useMemo } from 'react';

interface MultiSelectDropdownProps {
  label: string;
  options: (string | number | boolean)[];
  selectedValues: (string | number | boolean)[];
  onChange: (selected: (string | number | boolean)[]) => void;
  onClear: () => void;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  onClear,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchTerm) {
      return options; // Show all if no search term
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return options.filter((option) =>
      String(option).toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [options, searchTerm]); // Recalculate only when options or search term changes

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleOptionClick = (value: string | number | boolean) => {
    const newSelected = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange(newSelected);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="flex justify-between items-center w-full bg-gray-700/50 text-white p-2 rounded cursor-pointer hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        onClick={handleToggle}
      >
        <div className="flex items-center space-x-2 truncate">
          <span className="truncate">{label}</span>
          {selectedValues.length > 0 && (
            <span className="inline-flex items-end justify-end px-2 py-0.5 rounded-full bg-[#69b3a2]/70 text-white text-xs font-medium">
              {selectedValues.length}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

     {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-gray-800 rounded-md shadow-lg max-h-60 overflow-y-auto">
           <div className="border-t border-gray-700 p-2">
            <button
              onClick={() => {
                onClear();
                setIsOpen(false); 
                setSearchTerm(''); // Also clear search term on clear
              }}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-1 px-2 rounded text-sm"
            >
              Clear Filter
            </button>
          </div>
          <div className="border-t border-gray-700"></div>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            className="w-full p-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="p-2">
            {filteredOptions.map((option) => ( 
              <label
                key={String(option)}
                className="flex items-center p-2 rounded hover:bg-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-purple-600 transition duration-150 ease-in-out"
                  checked={selectedValues.includes(option)}
                  onChange={() => handleOptionClick(option)}
                />
                <span className="ml-2 text-gray-300">{String(option)}</span>
              </label>
            ))}
            {filteredOptions.length === 0 && (
                <p className="p-2 text-sm text-gray-400">No results found for "{searchTerm}"</p>
            )}
          </div>
         
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
