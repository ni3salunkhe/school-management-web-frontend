// CombinedDropdownInput.js
import { useState, useRef, useEffect } from 'react';

export default function CombinedDropdownInput({
  label,
  id,
  value, // This is the prop from the parent's formData
  onChange,
  required = false,
  options = [],
  error,
  validationClass // Added this prop from your parent component's usage
}) {
  // Internal state for the input field's current text
  const [inputValue, setInputValue] = useState(value || ''); // Initialize with prop
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // EFFECT 1: Sync internal inputValue with the external 'value' prop
  // This is crucial for updates coming from the parent (e.g., when populating form for "Update")
  useEffect(() => {
    setInputValue(value || ''); // Update internal state when the prop changes
  }, [value]); // Re-run this effect whenever the 'value' prop changes

  // EFFECT 2: Filter options based on internal inputValue
  useEffect(() => {
    if (isOpen) { // Only filter if the dropdown is open, or always filter if you prefer
      const filtered = options.filter(option =>
        option.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions([]); // Clear filtered options when dropdown is closed
    }
  }, [inputValue, options, isOpen]); // Also depend on isOpen

  // EFFECT 3: Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) { // Also check inputRef
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // No dependencies needed here

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);    // Update internal state
    onChange(id, newValue);     // Propagate change to parent
    if (!isOpen) {
        setIsOpen(true); // Open dropdown if user starts typing
    }
  };

  const handleOptionClick = (option) => {
    setInputValue(option);    // Update internal state with selected option
    onChange(id, option);     // Propagate selected option to parent
    setIsOpen(false);
    // inputRef.current?.focus(); // Optional: refocus input after selection
  };

  const handleInputFocus = () => {
    // Pre-filter options based on current value when input is focused, even if empty
    const filtered = options.filter(option =>
        option.toLowerCase().includes((value || '').toLowerCase()) // Use prop 'value' for initial filter on focus
      );
    setFilteredOptions(filtered);
    setIsOpen(true);
  };


  return (
    <div className="col-md-3 mb-2" ref={dropdownRef}>
      <label htmlFor={id} className="form-label fw-semibold small">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <div className="position-relative">
        <input
          ref={inputRef}
          type="text"
          id={id}
          value={inputValue} // Controlled by internal state
          onChange={handleInputChange}
          onFocus={handleInputFocus} // Open and filter on focus
          // onBlur={() => setTimeout(() => setIsOpen(false), 150)} // Optional: close on blur with delay
          required={required}
          className={`form-control form-control-sm ${validationClass || ''} ${error ? 'is-invalid' : ''}`}
          placeholder={`-- ${label} --`}
          autoComplete="off" // Often good for custom dropdowns
        />
        {/* Error display should use 'is-invalid' on the input and Bootstrap's default mechanism */}
        {/* The div below is fine if you want more control or if 'is-invalid' on input isn't enough */}
        {error && (
          <div id={`${id}-error`} className="invalid-feedback d-block"> {/* Unique ID for error */}
            {error}
          </div>
        )}
        {isOpen && (
          <div
            className="position-absolute w-100 bg-white border rounded shadow-sm mt-1"
            style={{ zIndex: 10, maxHeight: '200px', overflowY: 'auto' }} // Increased zIndex and maxHeight
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={option + index} // Use option text for key, ensure unique
                  onClick={() => handleOptionClick(option)}
                  className="px-3 py-2 dropdown-item-hover" // Use a class for hover
                  style={{ cursor: 'pointer' }}
                  role="option"
                  aria-selected={inputValue === option}
                >
                  {option}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-muted">
                {/* Show all options if input is empty and was just focused */}
                {inputValue === '' && options.length > 0 ? 'Type to filter or select...' : 'No matches found.'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}