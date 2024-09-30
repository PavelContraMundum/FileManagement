import React, { useState, useEffect, useRef } from 'react';
import './ComboboxWithSearch.css';

function ComboboxWithSearchUniversal({ options, 
    selectedOption, 
    onOptionChange, 
    placeholder = 'Select an option',
    searchPlaceholder = 'Search options...',
    noOptionsText = 'No options found',
    getOptionLabel = (option) => option.Name,
    getOptionValue = (option) => option.ID
  }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOptionLabel, setSelectedOptionLabel] = useState('');
    const [dropdownStyle, setDropdownStyle] = useState({});
    const containerRef = useRef(null);
    const dropdownRef = useRef(null);
  
    useEffect(() => {
      const selected = options.find(option => getOptionValue(option) === selectedOption);
      setSelectedOptionLabel(selected ? getOptionLabel(selected) : placeholder);
    }, [selectedOption, options, getOptionLabel, getOptionValue, placeholder]);
  
    useEffect(() => {
      if (isOpen && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const dropdownHeight = dropdownRef.current ? dropdownRef.current.offsetHeight : 300; // Assume max height of 300px
  
        if (spaceBelow >= dropdownHeight || spaceBelow > spaceAbove) {
          setDropdownStyle({
            top: rect.bottom + window.pageYOffset + 'px',
            left: rect.left + 'px',
            width: rect.width + 'px'
          });
        } else {
          setDropdownStyle({
            bottom: (window.innerHeight - rect.top + window.pageYOffset) + 'px',
            left: rect.left + 'px',
            width: rect.width + 'px'
          });
        }
      }
    }, [isOpen]);
  
    useEffect(() => {
      function handleClickOutside(event) {
        if (containerRef.current && !containerRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);
  
    const filteredOptions = options.filter(option =>
      getOptionLabel(option).toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    const handleOptionClick = (optionValue) => {
      onOptionChange(optionValue);
      setIsOpen(false);
    };
  
    const toggleDropdown = () => {
      setIsOpen(!isOpen);
    };
  
    return (
      <div className="combobox-container" ref={containerRef}>
        <div className="combobox-header" onClick={toggleDropdown}>
          {selectedOptionLabel}
          <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
        </div>
        {isOpen && (
          <div
            className="combobox-dropdown"
            style={dropdownStyle}
            ref={dropdownRef}
          >
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="combobox-search"
            />
            <ul className="combobox-options">
              {filteredOptions.length > 0 ? (
                filteredOptions.map(option => (
                  <li
                    key={getOptionValue(option)}
                    onClick={() => handleOptionClick(getOptionValue(option))}
                    className="combobox-option"
                  >
                    {getOptionLabel(option)}
                  </li>
                ))
              ) : (
                <li className="combobox-no-options">{noOptionsText}</li>
              )}
            </ul>
          </div>
        )}
      </div>
    );
  }

export default ComboboxWithSearchUniversal;