import React from 'react';
import { Link } from 'react-router-dom';
import './SideBar.css';

const SideBar = () => {
    return (
        <div className="sidebar">
            <h3>Menu</h3>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                <li>
                    <Link to="/main-page">Main Page</Link>
                </li>
                <li>
                    <Link to="/document-management">Správa dokumentů</Link>
                </li>
                <li>
                    <Link to="/invoices">Správa faktur</Link>
                </li>
                <li>
                    <Link to="/sheet-music">Správa notového materiálu</Link>
                </li>
                <li>
                    <Link to="/books">Správa knih</Link>
                </li>
                <li>
                    <Link to="/storage">Obsah skladovacích boxů</Link>
                </li>
            </ul>
        </div>
    );
};

export default SideBar;
