import React from 'react';
import ReactDOM from 'react-dom/client';
import UserForm from './components/UserForm';

const App = () => {
    return (
        <React.StrictMode>
            <UserForm />
        </React.StrictMode>
    );
};

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);