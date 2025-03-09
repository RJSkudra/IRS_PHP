import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import '../../sass/app.scss'; // Ensure the SCSS file is imported
import FormComponent from './FormComponent';
import TableComponent from './TableComponent';
import DetailedView from './DetailedView';
import validationMessages from '../../lang/lv/validationMessages';
import MessageQueue from './MessageQueue';

const socket = io('http://localhost:4000'); // Connect to the server

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
        socket.on('entriesUpdated', (updatedEntries) => {
            setEntries(updatedEntries);
            setTotalEntries(updatedEntries.length);
            if (updatedEntries.length > 0) {
                setLastId(updatedEntries[updatedEntries.length - 1].id);
            }
        });

        return () => {
            socket.off('entriesUpdated');
        };
    }, []);

    useEffect(() => {
        if (!isEditing) {
            fetchEntries();
        }
    }, [isEditing]);

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('darkMode', darkMode);
        return () => {
            document.body.classList.remove('dark-mode');
        };
    }, [darkMode]);

    useEffect(() => {
        checkFormValidity();
    }, [formData, errors]);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

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
    };

    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'name':
            case 'surname':
                if (!value.trim()) {
                    error = validationMessages[name].required;
                } else if (!/^[a-zA-ZāĀēĒīĪōŌūŪčČšŠžŽņŅģĢķĶļĻŗŖ\- ]+$/u.test(value)) {
                    error = validationMessages[name].regex;
                } else if (value.length < 2 || value.length > 50) {
                    error = validationMessages[name].length;
                }
                break;
            case 'age':
                if (!value.trim()) {
                    error = validationMessages.age.required;
                } else if (!/^(0|[1-9]\d*)$/.test(value)) {
                    error = validationMessages.age.integer;
                } else if (value < 0) {
                    error = validationMessages.age.min;
                } else if (value > 200) {
                    error = validationMessages.age.max;
                }
                break;
            case 'phone':
                if (!value.trim()) {
                    error = validationMessages.phone.required;
                } else if (!/^[0-9]{8}$/.test(value)) {
                    error = validationMessages.phone.regex;
                }
                break;
            case 'address':
                if (!value.trim()) {
                    error = validationMessages.address.required;
                } else if (!/^(?=.*[a-zA-ZāĀēĒīĪōŌūŪčČšŠžŽņŅģĢķĶļĻŗŖ])(?=.*[0-9])[a-zA-ZāĀēĒīĪōŌūŪčČšŠžŽņŅģĢķĶļĻŗŖ0-9\s,.-]+$/u.test(value)) {
                    error = validationMessages.address.regex;
                }
                break;
            default:
                break;
        }
        return error;
    };

    const checkFormValidity = () => {
        const isValid = Object.values(formData).every(value => value.trim() !== '') &&
                        Object.values(errors).every(error => error === '');
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
                const response = await axios.post('/store', formData);
                console.log('Form submitted successfully', response.data);
                addMessageToQueue({ text: validationMessages.success.created, type: 'success' });
                fetchEntries();
            } catch (error) {
                console.error('Error submitting form:', error);
                addMessageToQueue({ text: 'Error submitting form', type: 'error' });
            }
        }
    };

    const addMessageToQueue = (message) => {
        setMessageQueue(prevQueue => [...prevQueue, message]);
    };

    const removeMessage = (index) => {
        setMessageQueue(prevQueue => prevQueue.filter((_, i) => i !== index));
    };

    return (
        <div className={`user-form ${darkMode ? 'dark-mode' : ''}`}>
            {showDetailedView && (
                <DetailedView onClose={() => setShowDetailedView(false)} entries={entries} setIsEditing={setIsEditing} />
            )}
            <MessageQueue messages={messageQueue} removeMessage={removeMessage} />
            <button onClick={toggleDarkMode} className="button toggle-button" style={{ zIndex: 999 }}>
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
        </div>
    );
};

export default UserForm;