import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

const DetailedView = ({ onClose, entries }) => {
    const [editableEntryId, setEditableEntryId] = useState(null);
    const [sortedEntries, setSortedEntries] = useState(entries);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });

    useEffect(() => {
        setSortedEntries(entries);
    }, [entries]);

    const handleInputChange = (id, field, value) => {
        setSortedEntries(sortedEntries.map(entry => 
            entry.id === id ? { ...entry, [field]: value } : entry
        ));
    };

    const handleSave = async () => {
        try {
            await axios.post('/api/update-entries', { entries: sortedEntries });
            alert('Entries updated successfully');
        } catch (error) {
            console.error('Error updating entries:', error);
            alert('Error updating entries');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.post(`/api/delete-entry/${id}`);
            setSortedEntries(sortedEntries.filter(entry => entry.id !== id));
            alert('Entry deleted successfully');
        } catch (error) {
            console.error('Error deleting entry:', error);
            alert('Error deleting entry');
        }
    };

    const handleEdit = (id) => {
        setEditableEntryId(id);
    };

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
        setSortedEntries([...sortedEntries].sort((a, b) => {
            if (a[key] < b[key]) {
                return direction === 'ascending' ? -1 : 1;
            }
            if (a[key] > b[key]) {
                return direction === 'ascending' ? 1 : -1;
            }
            return 0;
        }));
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
                                <th onClick={() => handleSort('id')}>ID</th>
                                <th onClick={() => handleSort('name')}>Name</th>
                                <th onClick={() => handleSort('surname')}>Surname</th>
                                <th onClick={() => handleSort('age')}>Age</th>
                                <th onClick={() => handleSort('phone')}>Phone</th>
                                <th onClick={() => handleSort('address')}>Address</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedEntries.map(entry => (
                                <tr key={entry.id}>
                                    <td>{entry.id}</td>
                                    <td>
                                        <ResizableBox width={100} height={30} axis="x">
                                            <input 
                                                type="text" 
                                                value={entry.name} 
                                                onChange={(e) => handleInputChange(entry.id, 'name', e.target.value)} 
                                                disabled={editableEntryId !== entry.id}
                                            />
                                        </ResizableBox>
                                    </td>
                                    <td>
                                        <ResizableBox width={100} height={30} axis="x">
                                            <input 
                                                type="text" 
                                                value={entry.surname} 
                                                onChange={(e) => handleInputChange(entry.id, 'surname', e.target.value)} 
                                                disabled={editableEntryId !== entry.id}
                                            />
                                        </ResizableBox>
                                    </td>
                                    <td>
                                        <ResizableBox width={100} height={30} axis="x">
                                            <input 
                                                type="number" 
                                                value={entry.age} 
                                                onChange={(e) => handleInputChange(entry.id, 'age', e.target.value)} 
                                                disabled={editableEntryId !== entry.id}
                                            />
                                        </ResizableBox>
                                    </td>
                                    <td>
                                        <ResizableBox width={100} height={30} axis="x">
                                            <input 
                                                type="text" 
                                                value={entry.phone} 
                                                onChange={(e) => handleInputChange(entry.id, 'phone', e.target.value)} 
                                                disabled={editableEntryId !== entry.id}
                                            />
                                        </ResizableBox>
                                    </td>
                                    <td>
                                        <ResizableBox width={100} height={30} axis="x">
                                            <input 
                                                type="text" 
                                                value={entry.address} 
                                                onChange={(e) => handleInputChange(entry.id, 'address', e.target.value)} 
                                                disabled={editableEntryId !== entry.id}
                                            />
                                        </ResizableBox>
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