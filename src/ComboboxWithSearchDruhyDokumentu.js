import React, { useState, useEffect, useRef } from 'react';
import './ComboboxWithSearch.css';

function ComboboxWithSearchDruhyDokumentu({ druhyDokumentu, selectedDruh, onDruhDokumentuChange, highlightText }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDruhDokumentu, setSelectedDruhDokumentu] = useState('');
    const [dropdownStyle, setDropdownStyle] = useState({});
    const containerRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const selected = druhyDokumentu.find(druhDokumentu => druhDokumentu.IDDruhDokumentu === selectedDruh);
        setSelectedDruhDokumentu(selected ? selected.DruhDokumentu : 'Vyberte');
    }, [selectedDruh, druhyDokumentu]);

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

    const filteredDruhyDokumentu = druhyDokumentu.filter(druhDokumentu =>
        druhDokumentu.DruhDokumentu.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDruhDokumentuClick = (IDDruhDokumentu) => {
        onDruhDokumentuChange(IDDruhDokumentu);
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="combobox-container" ref={containerRef}>
            <div className="combobox-header" onClick={toggleDropdown}>
                {highlightText(selectedDruhDokumentu)}
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
                        placeholder="Vyhledat..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="combobox-search"
                    />
                    <ul className="combobox-options">
                        {filteredDruhyDokumentu.length > 0 ? (
                            filteredDruhyDokumentu.map(druhDokumentu => (
                                <li
                                    key={druhDokumentu.IDDruhDokumentu}
                                    onClick={() => handleDruhDokumentuClick(druhDokumentu.IDDruhDokumentu)}
                                    className="combobox-option"
                                >
                                    {highlightText(druhDokumentu.DruhDokumentu)}
                                </li>
                            ))
                        ) : (
                            <li className="combobox-no-options">Žádné typy dokumentů nenalezeny</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default ComboboxWithSearchDruhyDokumentu;