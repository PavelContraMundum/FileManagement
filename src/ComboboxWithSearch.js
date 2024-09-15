import React, { useState, useEffect, useRef } from 'react';
import './ComboboxWithSearch.css';

function ComboboxWithSearch({ binders, selectedBinder, onBinderChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBinderName, setSelectedBinderName] = useState('');
    const [dropdownStyle, setDropdownStyle] = useState({});
    const containerRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const selected = binders.find(binder => binder.ID === selectedBinder);
        setSelectedBinderName(selected ? selected.Name : 'Vyberte šanon');
    }, [selectedBinder, binders]);

    useEffect(() => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const dropdownHeight = dropdownRef.current ? dropdownRef.current.offsetHeight : 300; // Předpokládejme maximální výšku 300px

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

    const filteredBinders = binders.filter(binder =>
        binder.Name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleBinderClick = (binderId) => {
        onBinderChange(binderId);
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="combobox-container" ref={containerRef}>
            <div className="combobox-header" onClick={toggleDropdown}>
                {selectedBinderName}
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
                        placeholder="Hledat šanony..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="combobox-search"
                    />
                    <ul className="combobox-options">
                        {filteredBinders.length > 0 ? (
                            filteredBinders.map(binder => (
                                <li
                                    key={binder.ID}
                                    onClick={() => handleBinderClick(binder.ID)}
                                    className="combobox-option"
                                >
                                    {binder.Name}
                                </li>
                            ))
                        ) : (
                            <li className="combobox-no-options">Žádné šanony nenalezeny</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default ComboboxWithSearch;