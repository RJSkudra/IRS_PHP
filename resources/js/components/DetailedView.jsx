import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DetailedView = () => {
    const [entries, setEntries] = useState([]);

    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        try {
            const response = await axios.get('/api/entries');
            setEntries(response.data);
        } catch (error) {
            console.error('Error fetching entries:', error);
        }
    };

    const handleInputChange = (id, field, value) => {
        setEntries(entries.map(entry => 
            entry.id === id ? { ...entry, [field]: value } : entry
        ));
    };

    const handleSave = async () => {
        try {
            await axios.post('/api/update-entries', { entries });
            alert('Entries updated successfully');
        } catch (error) {
            console.error('Error updating entries:', error);
            alert('Error updating entries');
        }
    };

    return (
        <div className="detailed-view">
            <h2>Edit Entries</h2>
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
                    {entries.map(entry => (
                        <tr key={entry.id}>
                            <td>
                                <input 
                                    type="text" 
                                    value={entry.name} 
                                    onChange={(e) => handleInputChange(entry.id, 'name', e.target.value)} 
                                />
                            </td>
                            <td>
                                <input 
                                    type="text" 
                                    value={entry.surname} 
                                    onChange={(e) => handleInputChange(entry.id, 'surname', e.target.value)} 
                                />
                            </td>
                            <td>
                                <input 
                                    type="number" 
                                    value={entry.age} 
                                    onChange={(e) => handleInputChange(entry.id, 'age', e.target.value)} 
                                />
                            </td>
                            <td>
                                <input 
                                    type="text" 
                                    value={entry.phone} 
                                    onChange={(e) => handleInputChange(entry.id, 'phone', e.target.value)} 
                                />
                            </td>
                            <td>
                                <input 
                                    type="text" 
                                    value={entry.address} 
                                    onChange={(e) => handleInputChange(entry.id, 'address', e.target.value)} 
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={handleSave} className="button submit-button">Save Changes</button>
        </div>
    );
};

export default DetailedView;