import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && containerRef.current.contains(event.target as Node)) {
        return;
      }
      const target = event.target as HTMLElement;
      if (target.closest('.dropdown-menu-container')) {
        return;
      }
      setIsOpen(false);
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Close on scroll as a simple reliable way to prevent floating menus when scrolling the page
      const handleScroll = (e: Event) => {
        if (!(e.target as HTMLElement).closest?.('.dropdown-menu')) {
          setIsOpen(false);
        }
      };
      window.addEventListener('scroll', handleScroll, true);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isOpen]);

  useLayoutEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        left: rect.left,
        top: rect.bottom + 8,
        width: rect.width
      });
    }
  }, [isOpen]);

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

      {isOpen && createPortal(
        <div 
          className="dropdown-menu-container" 
          style={{ 
            position: 'fixed', 
            top: coords.top, 
            left: coords.left, 
            width: coords.width,
            margin: 0
          }}
        >
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
        </div>,
        document.body
      )}
    </div>
  );
}
