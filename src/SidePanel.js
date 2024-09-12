// SidePanel.js
import React from 'react';

function SidePanel({ file, onClose }) {
    if (!file) return null;

    return (
        <div className="side-panel">
            <div className="side-panel-header">
                <h3>{file.FileName}</h3>
                <button onClick={onClose}>Close</button>
            </div>
            <iframe
                src={`http://localhost:8080/file/${file.id}`}
                width="100%"
                height="600px"
                title="Document Preview"
            />
        </div>
    );
}

export default SidePanel;
