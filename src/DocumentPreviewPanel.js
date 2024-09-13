import React, { useState, useEffect, useCallback, useRef } from "react";
import "./DocumentPreviewPanel.css";

const DocumentPreviewPanel = ({ file, onClose, initialPanelWidth, onResize }) => {
  const [panelWidth, setPanelWidth] = useState(initialPanelWidth);
  const [iframeSize, setIframeSize] = useState({ width: initialPanelWidth - 40, height: 600 });
  const isResizingPanel = useRef(false);
  const isResizingIframe = useRef(false);
  const panelRef = useRef(null);
  const iframeRef = useRef(null);

  const handlePanelMouseDown = useCallback((e) => {
    isResizingPanel.current = true;
    e.preventDefault();
  }, []);

  const handleIframeMouseDown = useCallback((e) => {
    isResizingIframe.current = true;
    e.preventDefault();
  }, []);

  const handleMouseUp = useCallback(() => {
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
        handleMouseUp();
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
      <h3>PDF Preview</h3>
      <div className="upload-area">
        Prostor pro komponentu nahrávání dokumentu
      </div>
      {file ? (
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
      ) : (
        <p>No document selected</p>
      )}
    </div>
  );
};

export default DocumentPreviewPanel;
