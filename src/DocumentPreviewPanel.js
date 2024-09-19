import React, { useState, useEffect, useCallback, useRef } from "react";
import "./DocumentPreviewPanel.css";
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const DocumentPreviewPanel = ({ file, onClose, initialPanelWidth, onResize }) => {
  const [panelWidth, setPanelWidth] = useState(initialPanelWidth);
  const [iframeSize, setIframeSize] = useState({ width: initialPanelWidth - 40, height: 600 });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const isResizingPanel = useRef(false);
  const isResizingIframe = useRef(false);
  const panelRef = useRef(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    const checkExistingFile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:8080/file/${file.ID}`);
        if (response.data && response.data.FileData) {
          setUploadedFile(response.data);
          file.FileData = response.data.FileData;
          file.FileName = response.data.FileName;
        }
      } catch (error) {
        console.error('Error fetching existing file:', error);
        setError('Nepodařilo se načíst dokument. Zkuste to prosím znovu.');
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingFile();
  }, [file.ID]);

  const onDrop = useCallback((acceptedFiles) => {
    const pdfFile = acceptedFiles[0];
    if (pdfFile && pdfFile.type === 'application/pdf') {
      const formData = new FormData();
      formData.append('file', pdfFile);

      axios.put(`http://localhost:8080/uploadFile/${file.ID}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
        .then(response => {
          console.log('File uploaded successfully:', response.data);
          return axios.get(`http://localhost:8080/file/${file.ID}`);
        })
        .then(fileResponse => {
          console.log("data z axiosu: ", fileResponse.data);
          file.FileData = fileResponse.data.FileData;
          file.FileName = fileResponse.data.FileName;
          setUploadedFile(fileResponse.data);
        })
        .catch(error => {
          console.error('Error uploading or fetching file:', error);
        });
    } else {
      alert('Please upload a PDF file');
    }
  }, [file]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'application/pdf'
  });

  const handlePanelMouseDown = useCallback((e) => {
    isResizingIframe.current = false;
    isResizingPanel.current = true;

    e.preventDefault();
  }, []);

  const handleIframeMouseDown = useCallback((e) => {
    isResizingPanel.current = false;

    isResizingIframe.current = true;
    e.preventDefault();
  }, []);

  const handleMouseUp = useCallback(() => {
    console.log('Mouse up: Ending resize');
    isResizingPanel.current = false;
    isResizingIframe.current = false;
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (isResizingPanel.current && panelRef.current) {
      const newWidth = Math.max(300, window.innerWidth - e.clientX);
      setPanelWidth(newWidth);
      onResize(newWidth);
    } else if (isResizingIframe.current && iframeRef.current) {
      const iframeRect = iframeRef.current.getBoundingClientRect();
      const newWidth = Math.max(200, Math.min(panelWidth - 40, e.clientX - iframeRect.left));
      const newHeight = Math.max(200, e.clientY - iframeRect.top);
      setIframeSize({ width: newWidth, height: newHeight });
    }
  }, [panelWidth, onResize]);

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isResizingPanel.current || isResizingIframe.current) {
        handleMouseMove(e);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isResizingPanel.current || isResizingIframe.current) {
        console.log('Global mouse up: Reset resizing flags');
        handleMouseUp();
      } else {
        console.log("No resizing is active")
      }
    };

    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={panelRef}
      className="document-preview-panel"
      style={{ width: panelWidth, position: 'fixed', right: 0, top: 0, bottom: 0, padding: '20px' }}
    >
      <div
        className="panel-resize-handle"
        onMouseDown={handlePanelMouseDown}
      ></div>
      <button onClick={onClose}>Close Panel</button>
      <h4>Název: {file.DocumentName}</h4>
      <h4>Poznámka: {file.Note}</h4>
      <h3>Náhled PDF</h3>
      {!uploadedFile && !file.FileData && (
        <div {...getRootProps()} className="upload-area">
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the PDF file here ...</p>
          ) : (
            <p>Drag 'n' drop a PDF file here, or click to select one</p>
          )}
        </div>
      )}
      {!isLoading && !error && (uploadedFile || file.FileData) && (
        <div
          ref={iframeRef}
          className="iframe-container"
          style={{ width: iframeSize.width, height: iframeSize.height }}
        >
          <iframe
            src={`data:application/pdf;base64,${file.FileData}`}
            title="PDF Preview"
          ></iframe>
          <div
            className="iframe-resize-handle"
            onMouseDown={handleIframeMouseDown}
          ></div>
        </div>
      )}
    </div>
  );
};

export default DocumentPreviewPanel;