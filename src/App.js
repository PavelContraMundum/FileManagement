import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import SideBar from './SideBar';
import MainPage from './MainPage';
import DocumentManagement from './DocumentManagement';
import DocumentPreviewPanel from './DocumentPreviewPanel';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Simulace přihlášení pro testování
  const [sidePanelVisible, setSidePanelVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [panelWidth, setPanelWidth] = useState(400); // Inicializace šířky panelu


  const handleLogin = (token) => {
    setIsLoggedIn(true);
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('token');
  };

  const toggleSidePanel = (file) => {
    setSelectedFile(file);
    setSidePanelVisible(!sidePanelVisible);
  };

  const handleResize = (newWidth) => {
    setPanelWidth(newWidth);
  };

 

  return (
    <div className="app-container">
      {isLoggedIn && <SideBar />}
      <div className="main-content">
        <Routes>
          <Route path="/main-page" element={<MainPage />} />
          <Route path="/document-management" element={<DocumentManagement toggleSidePanel={toggleSidePanel} />} />
        </Routes>

        {sidePanelVisible && (
          <DocumentPreviewPanel
            file={selectedFile}
            onClose={() => setSidePanelVisible(false)}
            panelWidth={panelWidth}
            onResize={handleResize}
          />
        )}
      </div>
    </div>
  );
}

export default App;
