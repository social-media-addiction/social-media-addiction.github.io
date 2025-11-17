import React, { useState, useRef, useEffect } from 'react';

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

  const displayLabel = selectedValues.length > 0
    ? `${label}: ${selectedValues.length} selected`
    : label;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="flex justify-between items-center w-full bg-gray-700 text-white p-2 rounded cursor-pointer hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        onClick={handleToggle}
      >
        <span>{displayLabel}</span>
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
          <div className="p-2">
            {options.map((option) => (
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
          </div>
          <div className="border-t border-gray-700 p-2">
            <button
              onClick={() => {
                onClear();
                setIsOpen(false); // Close dropdown after clearing
              }}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-1 px-2 rounded text-sm"
            >
              Clear Filter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
