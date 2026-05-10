import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

/**
 * CustomSelect Component
 * A modern, accessible dropdown replacement for native HTML select boxes.
 * 
 * @param {string} label - Optional label for the select field
 * @param {Array} options - Array of objects with { value, label }
 * @param {string} value - Current selected value
 * @param {function} onChange - Callback function when value changes
 * @param {string} placeholder - Placeholder text when no value is selected
 * @param {React.Component} icon - Optional Lucide icon component for the left side
 * @param {boolean} required - Whether the field is required
 * @param {string} className - Optional extra classes for the wrapper
 */
const CustomSelect = ({ 
  label, 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select an option", 
  icon: Icon,
  required = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Find the label for the currently selected value
  const selectedOption = options.find(opt => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`w-full ${className}`} ref={dropdownRef}>
      {label && (
        <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-slate-200">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Main Select Trigger */}
        <button
          type="button"
          onClick={handleToggle}
          className={`w-full relative flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 py-4 ${Icon ? 'pl-12' : 'pl-4'} pr-10 text-left text-sm font-semibold transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b] dark:border-[#1f3a40] dark:bg-[#071416] dark:text-white dark:focus:bg-[#071416] dark:focus:ring-[#46daea] shadow-sm ${
            isOpen 
              ? 'ring-2 ring-[#008e9b] border-transparent dark:ring-[#46daea]' 
              : ''
          }`}
        >
          {Icon && (
            <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#008e9b] dark:text-[#46daea]" />
          )}
          
          <span className={`block truncate ${!selectedOption ? 'text-gray-400 dark:text-slate-500' : ''}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          
          <ChevronDown 
            size={18} 
            className={`absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-transform duration-300 ${
              isOpen ? 'rotate-180 text-[#008e9b] dark:text-[#46daea]' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-[100] mt-2 w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.15)] dark:border-[#1f3a40] dark:bg-[#0f2428] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-[#1f3a40]">
              {options.length === 0 ? (
                <div className="px-4 py-4 text-center text-sm text-gray-500 dark:text-slate-400 italic">
                  No options available
                </div>
              ) : (
                options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full px-4 py-3.5 text-left text-sm font-semibold transition-colors hover:bg-[#e8fbfd] dark:hover:bg-[#46daea]/10 ${
                      value === option.value 
                        ? 'bg-[#e8fbfd] text-[#008e9b] dark:bg-[#46daea]/15 dark:text-[#46daea]' 
                        : 'text-gray-700 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">{option.label}</span>
                      {value === option.value && (
                        <Check size={16} className="shrink-0" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomSelect;
