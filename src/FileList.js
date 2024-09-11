import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FileList = ({ onSelectFile }) => {
    const [files, setFiles] = useState([]);
    console.log("files: ", files)

    useEffect(() => {
        // Načtení seznamu dokumentů
        const fetchFiles = async () => {
            try {
                const response = await axios.get('http://localhost:8080/files');
                setFiles(response.data);
            } catch (error) {
                console.error('Error fetching files:', error);
            }
        };
        fetchFiles();
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h2>Seznam dokumentů</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid black', padding: '10px' }}>Název</th>
                        <th style={{ border: '1px solid black', padding: '10px' }}>Poznámka</th>
                        <th style={{ border: '1px solid black', padding: '10px' }}>Datum uložení</th>
                    </tr>
                </thead>
                <tbody>
                    {files.map((file) => (
                        <tr key={file.id} onClick={() => onSelectFile(file.id)} style={{ cursor: 'pointer' }}>
                            <td style={{ border: '1px solid black', padding: '10px' }}>{file.FileName}</td>
                            <td style={{ border: '1px solid black', padding: '10px' }}>{file.Note}</td>
                            <td style={{ border: '1px solid black', padding: '10px' }}>{new Date(file.CreatedAt).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FileList;
