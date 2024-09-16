import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { FaEye, FaPlus } from 'react-icons/fa';
import './DocumentManagement.css';
import ComboboxWithSearch from './ComboboxWithSearch';


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

    // const filteredDocuments = documents.filter(doc =>
    //     Object.values(doc).some(value =>
    //         value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    //     )
    // );

    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => {
            const binderName = getBinderName(doc.IDBinder);
            return (
                doc.DocumentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.Note.toLowerCase().includes(searchTerm.toLowerCase()) ||
                new Date(doc.CreatedAt).toLocaleDateString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                binderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (doc.Page && doc.Page.toString().toLowerCase().includes(searchTerm.toLowerCase()))
            );
        });
    }, [documents, binders, searchTerm]);

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



    return (
        <div className="document-management">
            <div style={{ display: "flex", flexDirection: "row" }}>
                <button onClick={handleAddRow} className="add-row-button">
                    <FaPlus /> Add Row
                </button>
                <div className="search-container" style={{ marginLeft: "800px" }}>
                    <input
                        type="text"
                        placeholder="Vyhledat ve všech sloupcích..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

            </div>
            <table className="notion-table">
                <thead>
                    <tr>
                        <th>Název</th>
                        <th>Poznámka</th>
                        <th>Datum vytvoření</th>
                        <th>Šanon</th>
                        <th>Stránka</th>
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
                                    {/* <td width={80}>
                                        <input
                                            type="text"
                                            placeholder="Search binders..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <select
                                            value={newRow.IDBinder}
                                            onChange={(e) => handleNewRowChange('IDBinder', e.target.value)}
                                        >
                                            <option value="">Select binder</option>
                                            {filteredBinders.map(binder => (
                                                <option key={binder.ID} value={binder.ID}>{binder.Name}</option>
                                            ))}
                                        </select>
                                    </td> */}
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
                            {filteredDocuments.map((doc) => (
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
                                    <td width={80}>
                                        <input
                                            value={doc.Page || ''}
                                            onChange={(e) => handleInputChange(doc.ID, 'Page', e.target.value)}
                                            onBlur={(e) => handleCellUpdate(doc.ID, 'Page', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <button onClick={() => toggleSidePanel(doc)}>View</button>
                                    </td>
                                </tr>
                            ))}
                        </>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default DocumentManagement;