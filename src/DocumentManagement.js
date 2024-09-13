import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEye, FaPlus } from 'react-icons/fa';
import './DocumentManagement.css';

function DocumentManagement({ toggleSidePanel }) {
    const [documents, setDocuments] = useState([]);
    const [binders, setBinders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewRow, setShowNewRow] = useState(false);
    const [newRow, setNewRow] = useState({
        Id: 'new',
        DocumentName: '',
        Note: '',
        CreatedAt: new Date().toISOString(),
        IDBinder: '',
        Page: ''
    });

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const response = await axios.get('http://localhost:8080/files', {
                    headers: { Authorization: localStorage.getItem('token') },
                });
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

        fetchDocuments();
        fetchBinders();
    }, []);

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


    const handleCellChange = async (id, field, value) => {
        try {
            await axios.put(`http://localhost:8080/files/${id}`, { [field]: value }, {
                headers: { Authorization: localStorage.getItem('token') },
            });
            setDocuments(prev => prev.map(doc =>
                doc.Id === id ? { ...doc, [field]: value } : doc
            ));
        } catch (error) {
            console.error("Error updating document:", error);
        }
    };

    return (
        <div className="document-management">
            <button onClick={handleAddRow} className="add-row-button">
                <FaPlus /> Add Row
            </button>
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
                                        <select
                                            value={newRow.IDBinder}
                                            onChange={(e) => handleNewRowChange('IDBinder', e.target.value)}
                                        >
                                            <option value="">Select binder</option>
                                            {binders.map(binder => (
                                                <option key={binder.id} value={binder.ID}>{binder.Name}</option>
                                            ))}
                                        </select>
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
                            {documents.map((doc) => (
                                <tr key={doc.Id}>
                                    <td width={300}>
                                        <input
                                            value={doc.DocumentName}
                                            onChange={(e) => handleCellChange(doc.Id, 'DocumentName', e.target.value)}
                                        />
                                        <FaEye
                                            onClick={() => toggleSidePanel(doc)}
                                            style={{ marginLeft: 10, cursor: 'pointer' }}
                                        />
                                    </td>
                                    <td width={300}>
                                        <input
                                            value={doc.Note}
                                            onChange={(e) => handleCellChange(doc.Id, 'Note', e.target.value)}
                                        />
                                    </td>
                                    <td>{new Date(doc.CreatedAt).toLocaleDateString()}</td>
                                    <td width={80}>
                                        <select
                                            value={doc.IDBinder}
                                            onChange={(e) => handleCellChange(doc.Id, 'IDBinder', e.target.value)}
                                        >
                                            {binders.map(binder => (
                                                <option key={binder.id} value={binder.ID}>{binder.Name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            value={doc.Page}
                                            onChange={(e) => handleCellChange(doc.Id, 'Page', e.target.value)}
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