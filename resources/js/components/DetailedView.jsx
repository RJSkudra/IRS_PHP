import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DetailedView = ({ onClose, entries }) => {
    const [editableEntryId, setEditableEntryId] = useState(null);

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

    const handleDelete = async (id) => {
        try {
            await axios.post(`/api/delete-entry/${id}`);
            setEntries(entries.filter(entry => entry.id !== id));
            alert('Entry deleted successfully');
        } catch (error) {
            console.error('Error deleting entry:', error);
            alert('Error deleting entry');
        }
    };

    const handleEdit = (id) => {
        setEditableEntryId(id);
    };

    return (
        <div className="detailed-view-overlay">
            <div className="detailed-view">
                <div className="detailed-view-header">
                    <button className="close-button" onClick={onClose}>×</button>
                    <h2>Edit Entries</h2>
                </div>
                <div className="detailed-view-content">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Surname</th>
                                <th>Age</th>
                                <th>Phone</th>
                                <th>Address</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map(entry => (
                                <tr key={entry.id}>
                                    <td>{entry.id}</td>
                                    <td>
                                        <input 
                                            type="text" 
                                            value={entry.name} 
                                            onChange={(e) => handleInputChange(entry.id, 'name', e.target.value)} 
                                            disabled={editableEntryId !== entry.id}
                                        />
                                    </td>
                                    <td>
                                        <input 
                                            type="text" 
                                            value={entry.surname} 
                                            onChange={(e) => handleInputChange(entry.id, 'surname', e.target.value)} 
                                            disabled={editableEntryId !== entry.id}
                                        />
                                    </td>
                                    <td>
                                        <input 
                                            type="number" 
                                            value={entry.age} 
                                            onChange={(e) => handleInputChange(entry.id, 'age', e.target.value)} 
                                            disabled={editableEntryId !== entry.id}
                                        />
                                    </td>
                                    <td>
                                        <input 
                                            type="text" 
                                            value={entry.phone} 
                                            onChange={(e) => handleInputChange(entry.id, 'phone', e.target.value)} 
                                            disabled={editableEntryId !== entry.id}
                                        />
                                    </td>
                                    <td>
                                        <input 
                                            type="text" 
                                            value={entry.address} 
                                            onChange={(e) => handleInputChange(entry.id, 'address', e.target.value)} 
                                            disabled={editableEntryId !== entry.id}
                                        />
                                    </td>
                                    <td>
                                        <button 
                                            className="edit-button" 
                                            onClick={() => handleEdit(entry.id)}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            className="delete-button" 
                                            onClick={() => handleDelete(entry.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="button-container">
                        <button onClick={handleSave} className="button submit-button">Save Changes</button>
                        <button onClick={onClose} className="button">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailedView;