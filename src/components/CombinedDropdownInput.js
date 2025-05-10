// CombinedDropdownInput.js
import { useState, useRef, useEffect } from 'react';

export default function CombinedDropdownInput({ label, id, value, onChange, required = false, options = [], error ,className}) {
  const [inputValue, setInputValue] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    
    const filtered = options.filter(option =>  
      {if (typeof option === 'string') {
            return option.toLowerCase().includes(inputValue.toLowerCase());
        }
      return
      }
    );
    setFilteredOptions(filtered);
  }, [inputValue, options]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    onChange(id, e.target.value);
    setIsOpen(true);
  };

  const handleOptionClick = (option) => {
    setInputValue(option);
    onChange(id, option);
    setIsOpen(false);
    inputRef.current.focus();
  };

  return (
    <div className={className}  ref={dropdownRef}>
      <label htmlFor={id} className="form-label fw-semibold small">{label} {required && '*'}</label>
      <div className="position-relative">
        <input
          ref={inputRef}
          type="text"
          id={id}
          value={inputValue}
          onChange={handleInputChange}
          onClick={() => setIsOpen(true)}
          required={required}
          className="form-control form-control-sm"
          placeholder={label}
        />
        {error && (
        <div id={`${id}`} className="invalid-feedback d-block"> {/* Ensure d-block if needed */}
          {error}
        </div>
      )}
        {isOpen && (
          <div className="position-absolute w-100 bg-white border rounded shadow-sm mt-1 z-3" style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={index}
                  onClick={() => handleOptionClick(option)}
                  className="px-3 py-2 hover-bg-light cursor-pointer"
                  style={{ cursor: 'pointer' }}
                >
                  {option}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-muted">No matches found. You can use your custom input.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
