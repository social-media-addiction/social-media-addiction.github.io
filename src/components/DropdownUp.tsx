import React, { useState, useRef, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

interface DropdownUpProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

const DropdownUp: React.FC<DropdownUpProps> = ({ value, onChange, options, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-teal-400 hover:bg-gray-600 transition-colors flex items-center gap-2 min-w-[120px] justify-between"
      >
        <span>{selectedOption?.label || value}</span>
        <ChevronUp 
          size={12} 
          className={`transition-transform ${isOpen ? 'rotate-0' : 'rotate-180'}`}
        />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-1 bg-gray-700 border border-gray-600 rounded shadow-lg max-h-60 overflow-y-auto z-50 min-w-full">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-600 transition-colors ${
                option.value === value ? 'bg-gray-600 text-teal-400' : 'text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownUp;
