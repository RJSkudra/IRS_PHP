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

// Use environment variables for the Socket.io connection
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
const socket = io(SOCKET_URL);

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
            const response = await axios.get('/api/entries');
            setEntries(response.data);
            setTotalEntries(response.data.length);
            if (response.data.length > 0) {
                setLastId(response.data[response.data.length - 1].id);
            }
        } catch (error) {
            console.error('Error fetching entries:', error);
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
                // Use environment variables for the API URL
                const API_URL = import.meta.env.VITE_APP_URL || 'http://localhost:8000';
                const response = await axios.post(`${API_URL}/store`, formData);
                
                console.log('Form submitted successfully', response.data);
                addMessageToQueue({ text: validationMessages.success.created, type: 'success' });
                
                // Reset form after successful submission
                setFormData({
                    name: '',
                    surname: '',
                    age: '',
                    phone: '',
                    address: ''
                });
                setTouched({});
                
                fetchEntries();
            } catch (error) {
                console.error('Error submitting form:', error);
                if (error.response && error.response.data && error.response.data.message) {
                    addMessageToQueue({ text: error.response.data.message, type: 'error' });
                } else {
                    addMessageToQueue({ text: 'Error submitting form', type: 'error' });
                }
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