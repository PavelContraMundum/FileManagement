import React, { useState } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import './Login.css';

function Login({ setToken }) {
    console.log('Login component loaded'); // Přidej tuto zprávu pro kontrolu


    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [redirectToMainPage, setRedirectToMainPage] = useState(false);

    const api = axios.create({
        baseURL: 'http://localhost:8080',
        withCredentials: true,
    });

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/login', {
                username,
                password,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            setToken(response.data.token);
            localStorage.setItem('token', response.data.token);
            setRedirectToMainPage(true);
        } catch (err) {
            console.error('Error during login:', err.response ? err.response.data : err.message);
            setError('Invalid credentials');
        }
    };

    // Pokud je přihlášení úspěšné, přesměruje uživatele na main-page
    if (redirectToMainPage) {
        console.log("Navigating to /main-page");
        return <Navigate to="/main-page" />;
    }

    return (
        <div className="login-container">
            <form onSubmit={handleLogin}>
                <h2>Login</h2>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
                <button type="submit">Login</button>
                {error && <p>{error}</p>}
            </form>
        </div>
    );
}

export default Login;
