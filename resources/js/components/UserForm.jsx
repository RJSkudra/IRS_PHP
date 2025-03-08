import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FormValidation = () => {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        age: '',
        phone: '',
        address: ''
    });

    const [errors, setErrors] = useState({});
    const [entries, setEntries] = useState([]);
    const [lastId, setLastId] = useState(null);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        fetchEntries();
        const interval = setInterval(checkForNewEntries, 10000); // Check for new entries every 10 seconds
        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, []);

    const fetchEntries = async () => {
        try {
            const response = await axios.get('/api/entries');
            setEntries(response.data);
            if (response.data.length > 0) {
                setLastId(response.data[response.data.length - 1].id);
            }
        } catch (error) {
            console.error('Error fetching entries:', error);
        }
    };

    const checkForNewEntries = async () => {
        try {
            const response = await axios.get('/latest-entry-id');
            if (response.data.latestId !== lastId) {
                fetchEntries();
            }
        } catch (error) {
            console.error('Error checking for new entries:', error);
        }
    };

    const handleDeleteAll = async () => {
        try {
            await axios.post('/delete-all');
            setEntries([]);
        } catch (error) {
            console.error('Error deleting all entries:', error);
        }
    };

    const validationMessages = {
        name: {
            required: 'Name is required',
            regex: 'Name must contain only letters and spaces',
            length: 'Name must be between 2 and 50 characters'
        },
        surname: {
            required: 'Surname is required',
            regex: 'Surname must contain only letters and spaces',
            length: 'Surname must be between 2 and 50 characters'
        },
        age: {
            required: 'Age is required',
            integer: 'Age must be a number',
            min: 'Age must be at least 0',
            max: 'Age must be less than 200'
        },
        phone: {
            required: 'Phone number is required',
            regex: 'Phone number must be 8 digits'
        },
        address: {
            required: 'Address is required',
            regex: 'Address must contain letters and numbers'
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Validate the field as soon as its value changes
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
                fetchEntries(); // Fetch the updated entries after form submission
            } catch (error) {
                console.error('Error submitting form:', error);
            }
        }
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    return (
        <div className={darkMode ? 'dark' : ''}>
            <button onClick={toggleDarkMode} className="button toggle-button">
                {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </button>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Name:</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} />
                    {errors.name && <span className="error">{errors.name}</span>}
                </div>
                <div className="form-group">
                    <label>Surname:</label>
                    <input type="text" name="surname" value={formData.surname} onChange={handleChange} />
                    {errors.surname && <span className="error">{errors.surname}</span>}
                </div>
                <div className="form-group">
                    <label>Age:</label>
                    <input type="text" name="age" value={formData.age} onChange={handleChange} />
                    {errors.age && <span className="error">{errors.age}</span>}
                </div>
                <div className="form-group">
                    <label>Phone:</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                    {errors.phone && <span className="error">{errors.phone}</span>}
                </div>
                <div className="form-group">
                    <label>Address:</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} />
                    {errors.address && <span className="error">{errors.address}</span>}
                </div>
                <button type="submit" className="button submit-button">Submit</button>
            </form>

            {entries.length > 0 && (
                <>
                    <button onClick={handleDeleteAll} className="button delete-button">Delete All</button>
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Surname</th>
                                <th>Age</th>
                                <th>Phone</th>
                                <th>Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((entry) => (
                                <tr key={entry.id}>
                                    <td>{entry.name}</td>
                                    <td>{entry.surname}</td>
                                    <td>{entry.age}</td>
                                    <td>{entry.phone}</td>
                                    <td>{entry.address}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
};

export default FormValidation;