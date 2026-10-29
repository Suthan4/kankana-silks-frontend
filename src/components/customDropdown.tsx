"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

const options = [
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Featured", value: "createdAt-desc" },
  { label: "Most Popular", value: "popularity-desc" },
];

export default function SortDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Sort by:</span>

      <div ref={ref} className="relative">
        {/* Button */}
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="min-w-[180px] px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white 
          flex items-center justify-between hover:border-gray-400 transition"
        >
          {selected?.label}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 transition ${
                  value === opt.value ? "bg-gray-100 font-medium" : ""
                }`}
              >
                {opt.label}
                {value === opt.value && (
                  <Check className="w-4 h-4 text-main-primary" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
