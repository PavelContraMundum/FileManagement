import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { FaEye, FaPlus, FaFilter, FaSort, FaSortUp, FaSortDown, FaSearch, FaTrash, FaDownload } from 'react-icons/fa';
import './DocumentManagement.css';
import ComboboxWithSearch from './ComboboxWithSearch';



const ColumnFilter = ({ column, onFilterChange, onSortChange, currentSort }) => {
    const [showFilter, setShowFilter] = useState(false);
    const [filterType, setFilterType] = useState('contains');
    const [filterValue, setFilterValue] = useState('');

    const filterTypes = [
        { value: 'is', label: 'Is' },
        { value: 'isNot', label: 'Is not' },
        { value: 'contains', label: 'Contains' },
        { value: 'doesNotContain', label: 'Does not contain' },
        { value: 'startsWith', label: 'Starts with' },
        { value: 'endsWith', label: 'Ends with' },
        { value: 'isEmpty', label: 'Is empty' },
        { value: 'isNotEmpty', label: 'Is not empty' },
    ];

    const handleFilterChange = () => {
        onFilterChange(column, { type: filterType, value: filterValue });
        setShowFilter(false);
    };

    const handleSortChange = () => {
        const nextSort = currentSort === 'asc' ? 'desc' : currentSort === 'desc' ? null : 'asc';
        onSortChange(column, nextSort);
    };

    return (
        <div className="column-filter">
            <div className="filter-icons">
                <FaFilter onClick={() => setShowFilter(!showFilter)} className="filter-icon" />
                {currentSort === 'asc' && <FaSortUp onClick={handleSortChange} className="sort-icon" />}
                {currentSort === 'desc' && <FaSortDown onClick={handleSortChange} className="sort-icon" />}
                {!currentSort && <FaSort onClick={handleSortChange} className="sort-icon" />}
            </div>
            {showFilter && (
                <div className="filter-dropdown">
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
                        {filterTypes.map((type) => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                    {!['isEmpty', 'isNotEmpty'].includes(filterType) && (
                        <input
                            type="text"
                            value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)}
                            placeholder="Filter value"
                            className="filter-input"
                        />
                    )}
                    <button onClick={handleFilterChange} className="filter-button">Apply</button>
                </div>
            )}
        </div>
    );
};



function DocumentManagement({ toggleSidePanel }) {
    const [documents, setDocuments] = useState([]);
    const [binders, setBinders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewRow, setShowNewRow] = useState(false);
    const [hoveredRowId, setHoveredRowId] = useState(null);
    const [newRow, setNewRow] = useState({
        Id: 'new',
        DocumentName: '',
        Note: '',
        CreatedAt: new Date().toISOString(),
        IDBinder: '',
        Page: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [editingRowId, setEditingRowId] = useState(null);  // Stav pro úpravu řádku
    const [filters, setFilters] = useState({});
    const [activeFilters, setActiveFilters] = useState({});
    const [sorting, setSorting] = useState({ column: null, direction: null });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(30);

    useEffect(() => {
        fetchDocuments();
        fetchBinders();
    }, []);

    const fetchDocuments = async () => {
        try {
            const response = await axios.get('http://localhost:8080/files', {
                headers: { Authorization: localStorage.getItem('token') },
            });
            console.log('Fetched documents:', response.data);
            setDocuments(response.data);
        } catch (error) {
            console.error("Error fetching documents:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBinders = async () => {
        try {
            const response = await axios.get('http://localhost:8080/binders', {
                headers: { Authorization: localStorage.getItem('token') },
            });
            setBinders(response.data);
        } catch (error) {
            console.error("Error fetching binders:", error);
        }
    };


    const handleAddRow = () => {
        setShowNewRow(true);
    };

    const handleNewRowChange = (field, value) => {
        setNewRow(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveNewRow = async () => {
        if (newRow.DocumentName) {
            try {
                const response = await axios.post('http://localhost:8080/files', {
                    DocumentName: newRow.DocumentName,
                    Note: newRow.Note,
                    IDBinder: newRow.IDBinder || null,  // Odesíláme null, pokud není vybrán žádný šanon
                    Page: parseInt(newRow.Page) || null  // Odesíláme null, pokud není zadána stránka
                }, {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                        'Content-Type': 'application/json'
                    },
                });
                setDocuments(prev => [response.data, ...prev]);
                setShowNewRow(false);
                setNewRow({
                    DocumentName: '',
                    Note: '',
                    IDBinder: '',
                    Page: ''
                });
            } catch (error) {
                console.error("Error saving new document:", error.response?.data || error.message);
            }
        }
    };


    const handleInputChange = (id, field, value) => {
        setDocuments(prev => prev.map(doc =>
            doc.ID === id ? { ...doc, [field]: value } : doc
        ));
    };

    const handleCellUpdate = async (id, field, value) => {
        try {
            const updatedDoc = documents.find(doc => doc.ID === id);
            if (!updatedDoc) {
                console.error(`Document not found with ID: ${id}`);
                return;
            }

            let updatedValue = value;
            if (field === 'Page') {
                updatedValue = value === '' ? null : parseInt(value, 10);
                if (isNaN(updatedValue)) {
                    console.error('Invalid page number');
                    return;
                }
            }


            const updatedDocData = { ...updatedDoc, [field]: updatedValue };

            console.log(`Updating document:`, updatedDocData);

            await axios.put(`http://localhost:8080/updateFile/${id}`, updatedDocData, {
                headers: {
                    Authorization: localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
            });

            console.log('Document updated successfully');
        } catch (error) {
            console.error("Error updating document:", error.response?.data || error.message);
            // Revert the change in the frontend if the update fails
            fetchDocuments();
        }


        console.log(`Update ${field} in document ${id}: ${value}`);
        setEditingRowId(null);  // Konec úprav, zrušíme režim úprav
    };


    const handleBinderChange = async (docId, binderId) => {
        try {
            const updatedDoc = documents.find(doc => doc.ID === docId);
            if (!updatedDoc) {
                console.error(`Document not found with ID: ${docId}`);
                return;
            }

            const updatedDocData = { ...updatedDoc, IDBinder: binderId };

            await axios.put(`http://localhost:8080/updateFile/${docId}`, updatedDocData, {
                headers: {
                    Authorization: localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
            });

            setDocuments(prev => prev.map(doc =>
                doc.ID === docId ? updatedDocData : doc
            ));

            console.log('Binder updated successfully');
        } catch (error) {
            console.error("Error updating binder:", error.response?.data || error.message);
            // Optionally, you can revert the change in the frontend if the update fails
            // fetchDocuments();
        }
    };

    const getBinderName = (binderId) => {
        const binder = binders.find(b => b.ID === binderId);
        return binder ? binder.Name : '';
    };

    const applyFilter = (doc, column, filter) => {
        let value;
        if (column === 'IDBinder') {
            value = getBinderName(doc[column]);
        } else {
            value = doc[column];
        }

        if (value === null || value === undefined) {
            value = '';
        } else {
            value = value.toString();
        }
        switch (filter.type) {
            case 'is':
                return value === filter.value;
            case 'isNot':
                return value !== filter.value;
            case 'contains':
                return value.toLowerCase().includes(filter.value.toLowerCase());
            case 'doesNotContain':
                return !value.toLowerCase().includes(filter.value.toLowerCase());
            case 'startsWith':
                return value.toLowerCase().startsWith(filter.value.toLowerCase());
            case 'endsWith':
                return value.toLowerCase().endsWith(filter.value.toLowerCase());
            case 'isEmpty':
                return !value || value.trim() === '';
            case 'isNotEmpty':
                return value && value.trim() !== '';
            default:
                return true;
        }
    };

    const filteredAndSortedDocuments = useMemo(() => {
        let result = documents.filter(doc => {
            // Apply column filters
            for (const [column, filter] of Object.entries(activeFilters)) {
                if (!applyFilter(doc, column, filter)) {
                    return false;
                }
            }

            // Apply global search
            if (searchTerm) {
                const binderName = getBinderName(doc.IDBinder);
                return (
                    doc.DocumentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    doc.Note.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    new Date(doc.CreatedAt).toLocaleDateString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                    binderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (doc.Page && doc.Page.toString().toLowerCase().includes(searchTerm.toLowerCase()))
                );
            }

            return true;
        });
        //Apply sorting
        if (sorting.column) {
            result.sort((a, b) => {
                let aValue = a[sorting.column];
                let bValue = b[sorting.column];

                // Special handling for IDBinder column
                if (sorting.column === 'IDBinder') {
                    aValue = getBinderName(aValue);
                    bValue = getBinderName(bValue);
                }

                if (aValue < bValue) return sorting.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sorting.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [documents, binders, searchTerm, activeFilters, sorting]);


    const paginatedDocuments = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        return filteredAndSortedDocuments.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredAndSortedDocuments, currentPage, rowsPerPage]);

    const totalPages = Math.ceil(filteredAndSortedDocuments.length / rowsPerPage);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(Number(event.target.value));
        setCurrentPage(1);  // Reset to first page when changing rows per page
    };


    const highlightText = (text, highlight) => {
        if (!highlight.trim() || !text) {
            return text;
        }
        const parts = text.toString().split(new RegExp(`(${highlight})`, 'gi'));
        return (
            <span>
                {parts.map((part, index) =>
                    part.toLowerCase() === highlight.toLowerCase()
                        ? <mark key={index} style={{ backgroundColor: 'yellow', padding: 0 }}>{part}</mark>
                        : part
                )}
            </span>
        );
    };


    const handleFilterChange = (column, filterConfig) => {
        setFilters(prev => ({ ...prev, [column]: filterConfig }));
    };

    const handleSortChange = (column, direction) => {
        setSorting({ column, direction });
    };

    const applyFilters = () => {
        setActiveFilters(filters);
    };

    const resetFilters = () => {
        setFilters({});
        setActiveFilters({});
    };

    const handleDeleteDocument = async (id) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            try {
                const response = await axios.delete(`http://localhost:8080/files/${id}`, {
                    headers: { Authorization: localStorage.getItem('token') },
                });
                if (response.status === 200) {
                    setDocuments(prevDocs => prevDocs.filter(doc => doc.ID !== id));
                    alert('Document deleted successfully');
                }
            } catch (error) {
                console.error("Error deleting document:", error);
                if (error.response && error.response.status === 404) {
                    alert('Document not found. It may have been already deleted.');
                } else {
                    alert('Error deleting document. Please try again.');
                }
            }
        }
    };

    const handleDownloadPDF = async (id, fileName) => {
        try {
            const response = await axios.get(`http://localhost:8080/files/${id}/download`, {
                headers: { Authorization: localStorage.getItem('token') },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${fileName || 'document'}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error downloading PDF:", error);
            if (error.response && error.response.status === 404) {
                alert('PDF not found. The file may have been deleted or not uploaded yet.');
            } else {
                alert('Error downloading PDF. Please try again.');
            }
        }
    };


    return (
        <div className="document-management">
            <div className="toolbar">
                <button onClick={handleAddRow} className="add-row-button">
                    <FaPlus /> Add Row
                </button>
                <div className="search-container">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search in all columns..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="filter-buttons">
                    <button onClick={applyFilters} className="apply-filters-button">Apply Filters</button>
                    <button onClick={resetFilters} className="reset-filters-button">Reset Filters</button>
                </div>
            </div>
            <table className="notion-table">
                <thead>
                    <tr>
                        <th>
                            Název
                            <ColumnFilter
                                column="DocumentName"
                                onFilterChange={handleFilterChange}
                                onSortChange={handleSortChange}
                                currentSort={sorting.column === 'DocumentName' ? sorting.direction : null}
                            />
                        </th>
                        <th>
                            Poznámka
                            <ColumnFilter
                                column="Note"
                                onFilterChange={handleFilterChange}
                                onSortChange={handleSortChange}
                                currentSort={sorting.column === 'Note' ? sorting.direction : null}
                            />
                        </th>
                        <th>
                            Datum vytvoření
                            <ColumnFilter
                                column="CreatedAt"
                                onFilterChange={handleFilterChange}
                                onSortChange={handleSortChange}
                                currentSort={sorting.column === 'CreatedAt' ? sorting.direction : null}
                            />
                        </th>
                        <th>
                            Šanon
                            <ColumnFilter
                                column="IDBinder"
                                onFilterChange={handleFilterChange}
                                onSortChange={handleSortChange}
                                currentSort={sorting.column === 'IDBinder' ? sorting.direction : null}
                            />
                        </th>
                        <th>
                            Strana
                            <ColumnFilter
                                column="Page"
                                onFilterChange={handleFilterChange}
                                onSortChange={handleSortChange}
                                currentSort={sorting.column === 'Page' ? sorting.direction : null}
                            />
                        </th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="6">Loading...</td>
                        </tr>
                    ) : (
                        <>
                            {showNewRow && (
                                <tr>
                                    <td width={300}>
                                        <input
                                            value={newRow.DocumentName}
                                            onChange={(e) => handleNewRowChange('DocumentName', e.target.value)}
                                            placeholder="Enter name"
                                        />
                                    </td>
                                    <td width={300}>
                                        <input
                                            value={newRow.Note}
                                            onChange={(e) => handleNewRowChange('Note', e.target.value)}
                                            placeholder="Enter note"
                                        />
                                    </td>
                                    <td>{new Date(newRow.CreatedAt).toLocaleDateString()}</td>
                                    <td width={80}>
                                        {/* Použití comboboxu s vyhledáváním pro nový řádek */}
                                        <ComboboxWithSearch
                                            binders={binders}
                                            selectedBinder={newRow.IDBinder}
                                            onBinderChange={(binderId) => handleNewRowChange('IDBinder', binderId)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            value={newRow.Page}
                                            onChange={(e) => handleNewRowChange('Page', e.target.value)}
                                            placeholder="Enter page"
                                        />
                                    </td>
                                    <td>
                                        <button onClick={handleSaveNewRow}>Save</button>
                                    </td>
                                </tr>
                            )}
                            {paginatedDocuments.map((doc) => (
                                <tr key={doc.ID}
                                    onMouseEnter={() => setHoveredRowId(doc.ID)}
                                    onMouseLeave={() => setHoveredRowId(null)}
                                >
                                    <td width={300} className="document-name-cell">
                                        <input
                                            value={doc.DocumentName || ''}
                                            onChange={(e) => handleInputChange(doc.ID, 'DocumentName', e.target.value)}
                                            onBlur={(e) => handleCellUpdate(doc.ID, 'DocumentName', e.target.value)}
                                        />
                                        {doc.ID && doc.ID !== 'new' && hoveredRowId === doc.ID && (
                                            <FaEye
                                                className="eye-icon"
                                                onClick={() => toggleSidePanel(doc)}
                                            />
                                        )}
                                    </td>
                                    <td width={300}>

                                        <input
                                            value={doc.Note || ''}
                                            onChange={(e) => handleInputChange(doc.ID, 'Note', e.target.value)}
                                            onBlur={(e) => handleCellUpdate(doc.ID, 'Note', e.target.value)}
                                        />

                                    </td>
                                    <td>{new Date(doc.CreatedAt).toLocaleDateString()}</td>
                                    <td width={120}>
                                        <ComboboxWithSearch
                                            binders={binders}
                                            selectedBinder={doc.IDBinder}
                                            onBinderChange={(binderId) => handleBinderChange(doc.ID, binderId)}
                                            highlightText={(text) => highlightText(text, searchTerm)}
                                        />

                                    </td>
                                    <td width={100}>
                                        <input
                                            value={doc.Page || ''}
                                            onChange={(e) => handleInputChange(doc.ID, 'Page', e.target.value)}
                                            onBlur={(e) => handleCellUpdate(doc.ID, 'Page', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <FaTrash
                                            className="action-icon delete-icon"
                                            onClick={() => handleDeleteDocument(doc.ID)}
                                            title="Delete document"
                                        />
                                        <FaDownload
                                            className="action-icon download-icon"
                                            onClick={() => handleDownloadPDF(doc.ID, doc.DocumentName)}
                                            title="Download PDF"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </>
                    )}
                </tbody>
            </table>
            <div className="pagination">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
                <select value={rowsPerPage} onChange={handleRowsPerPageChange}>
                    {[10, 20, 30, 40, 50, 60].map(value => (
                        <option key={value} value={value}>{value} rows</option>
                    ))}
                </select>
            </div>
        </div>
    );
}

export default DocumentManagement;