import React, { useState, useEffect } from 'react';

interface RangeSliderProps {
  label: string;
  min: number; // Dataset min age
  max: number; // Dataset max age
  initialMin: number; // Current selected low age
  initialMax: number; // Current selected high age
  onChange: (min: number, max: number) => void;
}

const RangeSlider: React.FC<RangeSliderProps> = ({ label, min, max, initialMin, initialMax, onChange }) => {
  const [low, setLow] = useState<number>(initialMin);
  const [high, setHigh] = useState<number>(initialMax);
  const [isDraggingLow, setIsDraggingLow] = useState(false);
  const [isDraggingHigh, setIsDraggingHigh] = useState(false);
  const [activeThumb, setActiveThumb] = useState<'low' | 'high' | null>(null);

  // Sync internal state with external props on filter reset/change
  useEffect(() => {
    setLow(initialMin);
    setHigh(initialMax);
  }, [initialMin, initialMax]);
  
  // Calculate percentage positions for track fill
  const range = max - min;
  const lowPercent = range > 0 ? ((low - min) / range) * 100 : 0;
  const highPercent = range > 0 ? ((high - min) / range) * 100 : 100;

  // Handles movement of the 'Low' slider (must not exceed 'High')
  const handleLowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    const newLow = Math.min(v, high); // low cannot exceed high
    setLow(newLow);
    onChange(newLow, high);
  };

  // Handles movement of the 'High' slider (must not go below 'Low')
  const handleHighChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    const newHigh = Math.max(v, low); // high cannot go below low
    setHigh(newHigh);
    onChange(low, newHigh);
  };

  const handleLowMouseDown = () => {
    setIsDraggingLow(true);
    setActiveThumb('low');
  };

  const handleLowMouseUp = () => {
    setIsDraggingLow(false);
    setActiveThumb(null);
  };

  const handleHighMouseDown = () => {
    setIsDraggingHigh(true);
    setActiveThumb('high');
  };

  const handleHighMouseUp = () => {
    setIsDraggingHigh(false);
    setActiveThumb(null);
  };
  
  // Custom CSS for double range slider to hide default tracks and style the thumb
  const sliderStyles = `
    /* Base input reset */
    .range-input {
      -webkit-appearance: none;
      pointer-events: none;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      background: transparent;
      margin: 0; /* Remove default margin */
    }

    /* Keep the thumb visible and style it */
    .range-input::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #69b3a2;
      cursor: pointer;
      pointer-events: all;
      border: 3px solid #1f2937;
      box-shadow: 0 0 4px rgba(0,0,0,0.5);
      transition: all 0.2s ease-in-out;
    }

    .range-input:hover::-webkit-slider-thumb {
      transform: scale(1.15);
      box-shadow: 0 0 8px rgba(105, 179, 162, 0.6);
    }

    .range-input:active::-webkit-slider-thumb {
      transform: scale(1.25);
      box-shadow: 0 0 12px rgba(105, 179, 162, 0.8);
    }

    /* Firefox/Edge thumb styles (for completeness) */
    .range-input::-moz-range-thumb, .range-input::-ms-thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #69b3a2;
      cursor: pointer;
      pointer-events: all;
      border: 3px solid #1f2937; 
      transition: all 0.2s ease-in-out;
    }

    .range-input:hover::-moz-range-thumb,
    .range-input:hover::-ms-thumb {
      transform: scale(1.15);
    }

    .range-input:active::-moz-range-thumb,
    .range-input:active::-ms-thumb {
      transform: scale(1.25);
    }
    
    /* Hide default track for all browsers */
    .range-input::-webkit-slider-runnable-track,
    .range-input::-moz-range-track,
    .range-input::-ms-track {
      background: transparent;
      border: none;
      height: 1px; /* minimal height */
      color: transparent;
    }
  `;

  return (
    <div className="w-full">
      <style>{sliderStyles}</style>
      
      <label className="text-sm text-gray-300 block mb-4">{label}</label>
      
      {/* Slider Track Area */}
      <div className="relative h-4 mt-2 mb-8">
        {/* Visual Background Track */}
        <div className="absolute w-full h-1 bg-gray-700 rounded-full top-1/2 -translate-y-1/2"></div>
        
        {/* Highlighted Fill Track */}
        <div 
          className="absolute h-1 rounded-full top-1/2 -translate-y-1/2 bg-[#69b3a2]"
          style={{
            left: `${lowPercent}%`,
            width: `${highPercent - lowPercent}%`,
          }}
        ></div>

        {/* Low Handle Tooltip - only show when dragging */}
        {isDraggingLow && (
          <div
            className="absolute -top-10 transform -translate-x-1/2 transition-all duration-150 opacity-100 scale-110 pointer-events-none"
            style={{ left: `${lowPercent}%` }}
          >
            <div className="bg-[#69b3a2] text-white text-xs font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">
              {low}
            </div>
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#69b3a2] mx-auto"></div>
          </div>
        )}

        {/* High Handle Tooltip - only show when dragging */}
        {isDraggingHigh && (
          <div
            className="absolute -top-10 transform -translate-x-1/2 transition-all duration-150 opacity-100 scale-110 pointer-events-none"
            style={{ left: `${highPercent}%` }}
          >
            <div className="bg-[#69b3a2] text-white text-xs font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">
              {high}
            </div>
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#69b3a2] mx-auto"></div>
          </div>
        )}

        {/* Low Handle Input - dynamic z-index based on position and interaction */}
        <input
          type="range"
          min={min}
          max={max}
          value={low}
          step={1}
          onChange={handleLowChange}
          onMouseDown={handleLowMouseDown}
          onMouseUp={handleLowMouseUp}
          onTouchStart={handleLowMouseDown}
          onTouchEnd={handleLowMouseUp}
          className="range-input"
          style={{ 
            zIndex: activeThumb === 'low' ? 30 : (low === high && high === max ? 25 : 20)
          }}
        />

        {/* High Handle Input - dynamic z-index based on position and interaction */}
        <input
          type="range"
          min={min}
          max={max}
          value={high}
          step={1}
          onChange={handleHighChange}
          onMouseDown={handleHighMouseDown}
          onMouseUp={handleHighMouseUp}
          onTouchStart={handleHighMouseDown}
          onTouchEnd={handleHighMouseUp}
          className="range-input"
          style={{ 
            zIndex: activeThumb === 'high' ? 30 : (low === high && low === min ? 25 : 20)
          }}
        />
      </div>
      
      {/* Custom Value Display (Min/Max/Chosen Low/Chosen High) */}
      <div className="text-xs mt-4 flex justify-between font-mono">
        <div className="flex-1 text-left text-gray-400">
            <span className="font-bold">Min:</span> {min}
        </div>
        <div className="flex-1 text-center text-sky-300 font-bold">
            {low} - {high}
        </div>
        <div className="flex-1 text-right text-gray-400">
            <span className="font-bold">Max:</span> {max}
        </div>
      </div>
    </div>
  );
};


export default RangeSlider;