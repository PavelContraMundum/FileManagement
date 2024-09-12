import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login';
import SideBar from './SideBar';
import MainPage from './MainPage';
import DocumentManagement from './DocumentManagement';
import SidePanel from './SidePanel';
import './App.css'; // Odkaz na CSS styly


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token')); // Kontrola přihlášení
  const [sidePanelVisible, setSidePanelVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

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

  return (
    <div className="app-container">
      <Router>
        {isLoggedIn ? (
          <>
            <SideBar />
            <div className="main-content">
              <Routes>
                <Route path="/main-page" element={<MainPage />} />
                <Route path="/document-management" element={<DocumentManagement toggleSidePanel={toggleSidePanel} />} />
                <Route path="*" element={<Navigate to="/main-page" />} /> {/* Přesměrování na main-page */}
              </Routes>

              {sidePanelVisible && (
                <SidePanel file={selectedFile} onClose={() => setSidePanelVisible(false)} />
              )}
            </div>
          </>
        ) : (
          <Routes>
            <Route path="/login" element={<Login setToken={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" />} /> {/* Přesměrování na login */}
          </Routes>
        )}
      </Router>
    </div>
  );
}

export default App;
