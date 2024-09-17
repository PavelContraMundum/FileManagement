import React from 'react';
import './MainPage.css';
import documentsPic from './images/documents.png'

function MainPage() {
    return (
        <div className="main-page">
            <div className='main-header'>
            <h1 >Welcome to MainPage</h1>
            </div>
            

            <div className='main-pic'>
                <img src={documentsPic} alt="My image" />
            </div>
        </div>
    );
}

export default MainPage;
