import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';

function Root() {
    return (
        <React.StrictMode>
            <AuthProvider>
                <GameProvider>
                    <App />
                </GameProvider>
            </AuthProvider>
        </React.StrictMode>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
