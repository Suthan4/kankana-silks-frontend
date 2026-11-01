"use client";

import { useState } from "react";

interface PriceRangeSliderProps {
  value: [number, number];
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: [number, number]) => void;
}

const formatPrice = (value: number) => `₹${value.toLocaleString("en-IN")}`;

export default function PriceRangeSlider({
  value,
  min = 0,
  max = 100000,
  step = 500,
  onChange,
}: PriceRangeSliderProps) {
  const [minValue, maxValue] = value;

  const minPercent = ((minValue - min) / (max - min)) * 100;
  const maxPercent = ((maxValue - min) / (max - min)) * 100;

  const handleMinChange = (next: number) => {
    onChange([Math.min(next, maxValue - step), maxValue]);
  };

  const handleMaxChange = (next: number) => {
    onChange([minValue, Math.max(next, minValue + step)]);
  };

  return (
    <div className="w-full space-y-5">
      {/* Selected values */}
      <div className="grid grid-cols-2 gap-3">
        <div className="border border-gray-200 rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wider text-gray-400">
            Minimum
          </p>
          <p className="text-sm font-semibold mt-1">{formatPrice(minValue)}</p>
        </div>

        <div className="border border-gray-200 rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wider text-gray-400">
            Maximum
          </p>
          <p className="text-sm font-semibold mt-1">{formatPrice(maxValue)}</p>
        </div>
      </div>

      {/* Dual slider */}
      <div className="relative h-10 flex items-center">
        <div className="absolute w-full h-1.5 bg-gray-200 rounded-full" />

        <div
          className="absolute h-1.5 bg-[#653536] rounded-full"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minValue}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          aria-label="Minimum price"
          className={`range-thumb ${minValue >= maxValue - step ? "thumb-front" : ""}`}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxValue}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          aria-label="Maximum price"
          className={`range-thumb ${minValue >= maxValue - step ? "" : "thumb-front"}`}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span>{formatPrice(min)}</span>
        <span>{formatPrice(max)}</span>
      </div>
    </div>
  );
}
