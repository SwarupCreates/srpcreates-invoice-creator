import { useState, useRef, useEffect } from 'react';
import { StudioIcon } from '../pages/shared';
import './CustomDropdown.css';

export interface CustomDropdownOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomDropdownOption[];
  placeholder?: string;
  className?: string;
}

export function CustomDropdown({ value, onChange, options, placeholder = "Select an option", className = '' }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`custom-dropdown ${className} ${isOpen ? 'open' : ''}`} ref={containerRef}>
      <button 
        type="button" 
        className="dropdown-trigger" 
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={!selectedOption ? "placeholder" : ""}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <StudioIcon name="expand_more" className={`dropdown-icon ${isOpen ? 'rotated' : ''}`} />
      </button>

      {isOpen && (
        <div className="dropdown-menu-container">
          <ul className="dropdown-menu" role="listbox">
            {options.map((option) => (
              <li 
                key={option.value}
                role="option"
                aria-selected={value === option.value}
                className={`dropdown-item ${option.disabled ? 'disabled' : ''} ${value === option.value ? 'selected' : ''}`}
                onClick={() => {
                  if (!option.disabled) {
                    onChange(option.value);
                    setIsOpen(false);
                  }
                }}
              >
                {option.label}
                {value === option.value && <StudioIcon name="check" className="check-icon" />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
