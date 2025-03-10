import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import '../../sass/app.scss'; // Ensure the SCSS file is imported
import FormComponent from './FormComponent';
import TableComponent from './TableComponent';
import DetailedView from './DetailedView';
import validationMessages from '../../lang/lv/validationMessages';
import MessageQueue from './MessageQueue';
import { validateField, validateForm, areAllFieldsFilled } from '../utils/Validation';

// Get the socket URL from environment variables
const SOCKET_URL = import.meta.env.VITE_SOCKET_SERVER_URL || 'http://localhost:8000';
const SOCKET_PATH = import.meta.env.VITE_SOCKET_PATH || '/socket.io';

console.log('Connecting to Socket.IO server:', SOCKET_URL, 'with path:', SOCKET_PATH);

// Configure socket with explicit path and better error handling
const socket = io(SOCKET_URL, {
    path: SOCKET_PATH,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
    transports: ['websocket', 'polling'],
    withCredentials: true
});

// Add extensive logging for debugging
socket.io.on("error", (error) => {
    console.error("Socket.IO connection error:", error);
});

socket.io.on("reconnect_attempt", (attempt) => {
    console.log(`Socket.IO reconnection attempt #${attempt}`);
});

socket.io.on("reconnect_error", (error) => {
    console.error("Socket.IO reconnection error:", error);
});

socket.io.on("reconnect_failed", () => {
    console.error("Socket.IO reconnection failed");
});

socket.on('connect', () => {
    console.log('Connected to WebSocket server with ID:', socket.id);
    console.log('Transport type:', socket.io.engine.transport.name);
    
    // Send a handshake to test the connection
    socket.emit('handshake', { client: 'web', time: new Date().toISOString() });
});

socket.on('disconnect', (reason) => {
    console.log('Disconnected from WebSocket server:', reason);
});

const UserForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        age: '',
        phone: '',
        address: ''
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [entries, setEntries] = useState([]);
    const [lastId, setLastId] = useState(null);
    const [darkMode, setDarkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        return savedMode === 'true';
    });
    const [isFormValid, setIsFormValid] = useState(false);
    const [messageQueue, setMessageQueue] = useState([]);
    const [showDetailedView, setShowDetailedView] = useState(false);
    const [totalEntries, setTotalEntries] = useState(0);
    const [isEditing, setIsEditing] = useState(false); // New state variable

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to WebSocket server');
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });

        socket.on('entriesUpdated', (updatedEntries) => {
            setEntries(updatedEntries);
            setTotalEntries(updatedEntries.length);
            if (updatedEntries.length > 0) {
                setLastId(updatedEntries[updatedEntries.length - 1].id);
            } else {
                setLastId(null);
            }
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('entriesUpdated');
        };
    }, []);

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
            return () => {
                document.body.classList.remove('dark-mode');
            };
        }, [darkMode]);
    
        useEffect(() => {
            localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    useEffect(() => {
        checkFormValidity();
    }, [formData, errors]);

    useEffect(() => {
        fetchEntries();
    }, []);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };
            // Removed duplicate fetchEntries function
    const fetchEntries = async () => {
        try {
            // Use the window.location.origin for API endpoints
            const baseUrl = window.location.origin;
            console.log('Fetching entries from:', `${baseUrl}/api/entries`);
            
            const response = await axios.get(`${baseUrl}/api/entries`);
            console.log('Entries response:', response.data);
            
            setEntries(response.data);
            setTotalEntries(response.data.length);
            if (response.data.length > 0) {
                setLastId(response.data[response.data.length - 1].id);
            }
        } catch (error) {
            console.error('Error fetching entries:', error);
            // Add better error reporting
            if (error.response) {
                console.error('Response error:', error.response.status, error.response.data);
            } else if (error.request) {
                console.error('No response received:', error.request);
            } else {
                console.error('Error setting up request:', error.message);
            }
        }
    };

    const handleDeleteAll = async () => {
        try {
            await axios.post('/delete-all');
            setEntries([]);
            setTotalEntries(0);
            addMessageToQueue({ text: validationMessages.success.all_deleted, type: 'success' });
        } catch (error) {
            console.error('Error deleting all entries:', error);
            addMessageToQueue({ text: 'Error deleting all entries', type: 'error' });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        setTouched({
            ...touched,
            [name]: true
        });

        const error = validateField(name, value);
        setErrors({
            ...errors,
            [name]: error
        });
        
        checkFormValidity();
    };

    const checkFormValidity = () => {
        // Replace isFormValid(formData) with validateForm(formData) to avoid the naming conflict
        const isValid = areAllFieldsFilled(formData) && validateForm(formData);
        setIsFormValid(isValid);
    };

    // Update handleSubmit function
    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        Object.keys(formData).forEach((key) => {
            const error = validateField(key, formData[key]);
            if (error) {
                newErrors[key] = error;
            }
        });
        setErrors(newErrors);
        
        if (Object.keys(newErrors).length === 0) {
            try {
                // Use window.location.origin for consistent URLs
                const baseUrl = window.location.origin;
                
                // Add loading indicator
                addMessageToQueue({ text: 'Submitting form...', type: 'info' });
                
                // Log the request being made
                console.log('Submitting form to:', `${baseUrl}/store`);
                
                const response = await axios.post(`${baseUrl}/store`, formData, {
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    withCredentials: true
                });
                
                console.log('Form submission response:', response);
                // Rest of success handling...
                
            } catch (error) {
                console.error('Error submitting form:', error);
                // Better error reporting...
            }
        }
    };

    const addMessageToQueue = (message) => {
        const messageWithId = {
            ...message,
            id: Date.now() // Add a unique timestamp-based ID
        };
        setMessageQueue(prevQueue => [...prevQueue, messageWithId]);
        
        // Auto-remove messages after they've been displayed
        setTimeout(() => {
            setMessageQueue(prevQueue => prevQueue.filter(msg => msg.id !== messageWithId.id));
        }, 5000); // Remove after 5 seconds
    };

    // The removeMessage function can stay but will be less needed with auto-removal
    const removeMessage = (index) => {
        setMessageQueue(prevQueue => prevQueue.filter((_, i) => i !== index));
    };

    return (
        <div className={`user-form ${darkMode ? 'dark-mode' : ''}`}>
            {showDetailedView && (
                <DetailedView onClose={() => setShowDetailedView(false)} entries={entries} setIsEditing={setIsEditing} />
            )}
            <MessageQueue messages={messageQueue} removeMessage={removeMessage} />
            <button onClick={toggleDarkMode} className="button toggle-button" style={{ zIndex: 1005 }}>
                <i className={darkMode ? 'fas fa-sun' : 'fas fa-moon'}></i>
            </button>
            <FormComponent
                formData={formData}
                errors={errors}
                touched={touched}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                isFormValid={isFormValid}
                handleDeleteAll={handleDeleteAll}
            />
            {entries.length > 0 && (
                <TableComponent
                    entries={[...entries].sort((a, b) => b.id - a.id).slice(0, 5)}
                    totalEntries={totalEntries}
                    handleDeleteAll={handleDeleteAll}
                    handleEditAll={() => setShowDetailedView(true)}
                />
            )}
            <div className="footer">
                IRS™ © ® 2025
            </div>
        </div>
    );
};

export default UserForm;