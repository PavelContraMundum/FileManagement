// DocumentManagement.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function DocumentManagement({ toggleSidePanel }) {
    const [documents, setDocuments] = useState([]);

    useEffect(() => {
        // Načti všechny dokumenty z backendu
        const fetchDocuments = async () => {
            const response = await axios.get('http://localhost:8080/files', {
                headers: { Authorization: localStorage.getItem('token') },
            });
            setDocuments(response.data);
        };
        fetchDocuments();
    }, []);

    return (
        <div className="document-management">
            <table>
                <thead>
                    <tr>
                        <th>Document Name</th>
                        <th>Note</th>
                        <th>Date Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {documents.map((doc) => (
                        <tr key={doc.Id}>
                            <td>{doc.FileName}</td>
                            <td>{doc.Note}</td>
                            <td>{new Date(doc.CreatedAt).toLocaleDateString()}</td>
                            <td>
                                <button onClick={() => toggleSidePanel(doc)}>View</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DocumentManagement;
