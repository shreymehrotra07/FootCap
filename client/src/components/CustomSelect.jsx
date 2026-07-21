import React, { useState, useEffect, useRef } from "react";
import { FiChevronDown, FiCheck } from "react-icons/fi";
import "./CustomSelect.css";

function CustomSelect({ options = [], value, onChange, placeholder = "Select..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`custom-select-container${isOpen ? " open" : ""}`} ref={containerRef}>
      <button
        type="button"
        className="custom-select-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <FiChevronDown className="custom-select-chevron" />
      </button>

      {isOpen && (
        <div className="custom-select-menu">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <div
                key={option.value}
                className={`custom-select-option${isSelected ? " selected" : ""}`}
                onClick={() => handleSelect(option.value)}
              >
                <span>{option.label}</span>
                {isSelected && <FiCheck className="custom-select-check" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CustomSelect;
