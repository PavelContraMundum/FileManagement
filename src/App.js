import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import FileList from './FileList';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [note, setNote] = useState("");
  const [uploadedFileId, setUploadedFileId] = useState(null);

  const onDrop = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: 'application/pdf' });

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("note", note);

    try {
      const response = await axios.post("http://localhost:8080/upload", formData);
      setUploadedFileId(response.data.file_id);
      setFile(null);
      setNote("");
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleViewFile = () => {
    if (uploadedFileId) {
      window.open(`http://localhost:8080/file/${uploadedFileId}`, "_blank");
    }
  };

  return (
    <div>
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h2>Upload a PDF file</h2>
        <div
          {...getRootProps({ className: 'dropzone' })}
          style={{
            width: 580,
            border: '2px dashed #cccccc',
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            marginBottom: '10px',

          }}
        >
          <input {...getInputProps()} />
          {file ? <p>{file.name}</p> : <p>Drag and drop a file here, or click to select one</p>}
        </div>
        <textarea
          placeholder="Add a note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
        />
        <button onClick={handleUpload} style={{ marginRight: '10px' }}>Upload</button>
        <button onClick={handleViewFile} disabled={!uploadedFileId}>View Uploaded File</button>
      </div>
      <div style={{ width: '1400px' }}>
        <FileList />
      </div>
    </div>
  );
};

export default FileUpload;
