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
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #69b3a2;
      cursor: pointer;
      pointer-events: all;
      border: 3px solid #1f2937;
      box-shadow: 0 0 2px rgba(0,0,0,0.5);
      transition: background 0.15s ease-in-out;
    }

    /* Firefox/Edge thumb styles (for completeness) */
    .range-input::-moz-range-thumb, .range-input::-ms-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #69b3a2;
      cursor: pointer;
      pointer-events: all;
      border: 3px solid #1f2937; 
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
      <div className="relative h-4 mt-2">
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

        {/* Low Handle Input (z-index ensures it's clickable) */}
        <input
          type="range"
          min={min}
          max={max}
          value={low}
          step={1}
          onChange={handleLowChange}
          className="range-input z-20"
        />

        {/* High Handle Input */}
        <input
          type="range"
          min={min}
          max={max}
          value={high}
          step={1}
          onChange={handleHighChange}
          className="range-input z-20"
        />
      </div>
      
      {/* Custom Value Display (Min/Max/Chosen Low/Chosen High) */}
      <div className="text-xs mt-4 flex justify-between font-mono">
        <div className="flex-1 text-left text-gray-200">
            <span className="font-bold"></span> {min}
        </div>
        <div className="flex-1 relative">
          <div
            className="absolute top-0 transform -translate-x-1/2 text-sky-300"
            style={{ left: `${lowPercent}%` }}
          >
            {low}
          </div>
          <div
            className="absolute top-0 transform -translate-x-1/2 text-sky-300"
            style={{ left: `${highPercent}%` }}
          >
            {high}
          </div>
        </div>
        <div className="flex-1 text-right text-gray-200">
            <span className="font-bold"></span> {max}
        </div>
      </div>
    </div>
  );
};


export default RangeSlider;