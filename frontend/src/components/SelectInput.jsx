import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const SelectInput = ({ icon: Icon, options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  const selectedOption = options.find((option) => option.value === value) || {
    label: placeholder,
    value: "",
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOptionClick = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative mb-6" ref={selectRef}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        {Icon && <Icon className="size-5 text-green-500" />}
      </div>

      <div
        className="w-full pl-10 pr-10 py-2 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400 transition duration-200 cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption.label}</span>
        <ChevronDown
          className={`size-5 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
          {options.map((option) => (
            <div
              key={option.value}
              className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer"
              onClick={() => handleOptionClick(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}

      {/* Hidden native select for accessibility and form submission */}
      <select
        className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={-1} // Prevent tabbing to this hidden select
        aria-hidden="true"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectInput;
