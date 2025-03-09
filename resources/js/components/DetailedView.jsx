import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import { useTable, useSortBy, useResizeColumns, useFlexLayout } from 'react-table';
import 'react-resizable/css/styles.css';
import MessageQueue from './MessageQueue';
import validationMessages from '../../lang/lv/validationMessages';
import { validateField } from '../utils/Validation'; // Import the validation utility

const DetailedView = ({ onClose, entries, setIsEditing }) => {
    const [editableEntryId, setEditableEntryId] = useState(null);
    const [sortedEntries, setSortedEntries] = useState(entries);
    const [originalEntries, setOriginalEntries] = useState(entries);
    const [editingEntry, setEditingEntry] = useState(null);
    const [messageQueue, setMessageQueue] = useState([]);
    const [isEditing, setIsEditingLocal] = useState(false);
    const [errors, setErrors] = useState({});
    const inputRefs = useRef({});
    const [editValues, setEditValues] = useState({});

    useEffect(() => {
        if (!isEditing) {
            setSortedEntries(entries);
            setOriginalEntries(entries);
        }
    }, [entries, isEditing]);

    const handleInputChange = (id, field, value) => {
        // Update the field in edit values while preserving other fields
        setEditValues(prev => ({
            ...prev,
            [id]: {
                ...(prev[id] || {}),
                [field]: value
            }
        }));
        
        // Validate and set errors for this specific field
        const error = validateField(field, value);
        setErrors(prevErrors => ({
            ...prevErrors,
            [field]: error
        }));
    };

    const handleSave = async () => {
        if (Object.values(errors).some(error => error)) {
            addMessageToQueue({ text: 'Please fix validation errors before saving.', type: 'error' });
            return;
        }

        try {
            const response = await axios.post('/api/update-entries', { entries: sortedEntries });
            if (response.status === 200) {
                setOriginalEntries(sortedEntries);
                addMessageToQueue({ text: 'Entries updated successfully', type: 'success' });
            } else {
                console.error('Unexpected response:', response);
                addMessageToQueue({ text: 'Unexpected response from the server', type: 'error' });
            }
        } catch (error) {
            if (error.response) {
                console.error('Error response:', error.response);
                addMessageToQueue({ text: `Error updating entries: ${error.response.status} ${error.response.statusText}`, type: 'error' });
            } else if (error.request) {
                console.error('Error request:', error.request);
                addMessageToQueue({ text: 'Error updating entries: No response from server', type: 'error' });
            } else {
                console.error('Error message:', error.message);
                addMessageToQueue({ text: `Error updating entries: ${error.message}`, type: 'error' });
            }
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/delete/${id}`);
            addMessageToQueue({ text: 'Entry deleted successfully', type: 'success' });
        } catch (error) {
            console.error('Error deleting entry:', error);
            addMessageToQueue({ text: 'Error deleting entry', type: 'error' });
        }
    };

    const handleEdit = (id) => {
        const entry = sortedEntries.find(entry => entry.id === id);
        setEditableEntryId(id);
        setEditingEntry({...entry});
        
        // Initialize editValues with the complete entry data
        setEditValues(prev => ({
            ...prev,
            [id]: {...entry}
        }));
        
        setIsEditing(true);
        setIsEditingLocal(true);
    };

    const handleApply = async () => {
        // Create entry with updated values
        const updatedEntry = {
            ...sortedEntries.find(entry => entry.id === editableEntryId),
            ...editValues[editableEntryId]
        };
        
        // Check for validation errors
        const fieldErrors = {};
        Object.entries(updatedEntry).forEach(([key, value]) => {
            // Skip validation for id field
            if (key !== 'id') {
                // Ensure value is a string before validation
                const stringValue = value === null || value === undefined ? '' : String(value);
                const error = validateField(key, stringValue);
                if (error) {
                    fieldErrors[key] = error;
                }
            }
        });

        // If there are errors, show them and don't proceed
        if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
            addMessageToQueue({ text: 'Please fix validation errors before saving.', type: 'error' });
            return;
        }
        
        try {
            const response = await axios.post('/api/update-entries', { 
                entries: [updatedEntry] // Only send the changed entry
            });
            
            if (response.status === 200) {
                // Update local state after successful save
                const updatedEntries = sortedEntries.map(entry => 
                    entry.id === editableEntryId ? updatedEntry : entry
                );
                setSortedEntries(updatedEntries);
                setOriginalEntries(updatedEntries);
                addMessageToQueue({ text: 'Entry updated successfully', type: 'success' });
                
                // Reset editing state
                setEditableEntryId(null);
                setEditValues(prev => {
                    const newValues = {...prev};
                    delete newValues[editableEntryId];
                    return newValues;
                });
                setIsEditing(false);
                setIsEditingLocal(false);
                setErrors({});
            } else {
                console.error('Unexpected response:', response);
                addMessageToQueue({ text: 'Unexpected response from the server', type: 'error' });
            }
        } catch (error) {
            console.error('Error updating entry:', error);
            addMessageToQueue({ 
                text: error.response?.data?.message || 'Error updating entry', 
                type: 'error' 
            });
        }
    };

    const handleCancel = () => {
        setSortedEntries(sortedEntries.map(entry =>
            entry.id === editableEntryId ? editingEntry : entry
        ));
        setEditableEntryId(null);
        setIsEditing(false);
        setIsEditingLocal(false);
    };

    const addMessageToQueue = (message) => {
        setMessageQueue(prevQueue => [...prevQueue, message]);
    };

    const removeMessage = (index) => {
        setMessageQueue(prevQueue => prevQueue.filter((_, i) => i !== index));
    };

    const columns = useMemo(() => [
        {
            Header: 'ID',
            accessor: 'id',
            Cell: ({ value, row }) => (
                <div>
                    <input 
                        type="text" 
                        value={value} 
                        disabled={true}
                        ref={el => {
                            if (!inputRefs.current[row.original.id]) {
                                inputRefs.current[row.original.id] = {};
                            }
                            inputRefs.current[row.original.id].id = el;
                        }}
                    />
                    {editableEntryId === row.original.id && errors.id && <span className="error">{errors.id}</span>}
                </div>
            ),
        },
        {
            Header: 'Name',
            accessor: 'name',
            Cell: ({ value, row }) => {
                const fieldName = 'name';
                const displayValue = editableEntryId === row.original.id && editValues[row.original.id]?.[fieldName] !== undefined
                    ? editValues[row.original.id][fieldName]
                    : value;
                    
                // Get field-specific error from editableEntryId
                const fieldError = editableEntryId === row.original.id && errors[fieldName] ? errors[fieldName] : null;
                    
                return (
                    <div>
                        <input 
                            type="text" 
                            value={displayValue} 
                            onChange={(e) => handleInputChange(row.original.id, 'name', e.target.value)} 
                            disabled={editableEntryId !== row.original.id}
                            ref={el => {
                                if (el) {
                                    if (!inputRefs.current[row.original.id]) {
                                        inputRefs.current[row.original.id] = {};
                                    }
                                    inputRefs.current[row.original.id].name = el;
                                }
                            }}
                        />
                        {fieldError && <span className="error">{fieldError}</span>}
                    </div>
                );
            }
        },
        {
            Header: 'Surname',
            accessor: 'surname',
            Cell: ({ value, row }) => {
                const fieldName = 'surname';
                const displayValue = editableEntryId === row.original.id && editValues[row.original.id]?.[fieldName] !== undefined
                    ? editValues[row.original.id][fieldName]
                    : value;
                    
                // Get field-specific error from editableEntryId
                const fieldError = editableEntryId === row.original.id && errors[fieldName] ? errors[fieldName] : null;
                    
                return (
                    <div>
                        <input 
                            type="text" 
                            value={displayValue} 
                            onChange={(e) => handleInputChange(row.original.id, 'surname', e.target.value)} 
                            disabled={editableEntryId !== row.original.id}
                            ref={el => {
                                if (!inputRefs.current[row.original.id]) {
                                    inputRefs.current[row.original.id] = {};
                                }
                                inputRefs.current[row.original.id].surname = el;
                            }}
                        />
                        {fieldError && <span className="error">{fieldError}</span>}
                    </div>
                );
            }
        },
        {
            Header: 'Age',
            accessor: 'age',
            Cell: ({ value, row }) => {
                const fieldName = 'age';
                const displayValue = editableEntryId === row.original.id && editValues[row.original.id]?.[fieldName] !== undefined
                    ? editValues[row.original.id][fieldName]
                    : value;
                    
                // Get field-specific error from editableEntryId
                const fieldError = editableEntryId === row.original.id && errors[fieldName] ? errors[fieldName] : null;
                    
                return (
                    <div>
                        <input 
                            type="number" 
                            value={displayValue} 
                            onChange={(e) => handleInputChange(row.original.id, 'age', e.target.value)} 
                            disabled={editableEntryId !== row.original.id}
                            ref={el => {
                                if (!inputRefs.current[row.original.id]) {
                                    inputRefs.current[row.original.id] = {};
                                }
                                inputRefs.current[row.original.id].age = el;
                            }}
                        />
                        {fieldError && <span className="error">{fieldError}</span>}
                    </div>
                );
            }
        },
        {
            Header: 'Phone',
            accessor: 'phone',
            Cell: ({ value, row }) => {
                const fieldName = 'phone';
                const displayValue = editableEntryId === row.original.id && editValues[row.original.id]?.[fieldName] !== undefined
                    ? editValues[row.original.id][fieldName]
                    : value;
                    
                // Get field-specific error from editableEntryId
                const fieldError = editableEntryId === row.original.id && errors[fieldName] ? errors[fieldName] : null;
                    
                return (
                    <div>
                        <input 
                            type="text" 
                            value={displayValue} 
                            onChange={(e) => handleInputChange(row.original.id, 'phone', e.target.value)} 
                            disabled={editableEntryId !== row.original.id}
                            ref={el => {
                                if (!inputRefs.current[row.original.id]) {
                                    inputRefs.current[row.original.id] = {};
                                }
                                inputRefs.current[row.original.id].phone = el;
                            }}
                        />
                        {fieldError && <span className="error">{fieldError}</span>}
                    </div>
                );
            }
        },
        {
            Header: 'Address',
            accessor: 'address',
            Cell: ({ value, row }) => {
                const fieldName = 'address';
                const displayValue = editableEntryId === row.original.id && editValues[row.original.id]?.[fieldName] !== undefined
                    ? editValues[row.original.id][fieldName]
                    : value;
                    
                // Get field-specific error from editableEntryId
                const fieldError = editableEntryId === row.original.id && errors[fieldName] ? errors[fieldName] : null;
                    
                return (
                    <div>
                        <input 
                            type="text" 
                            value={displayValue} 
                            onChange={(e) => handleInputChange(row.original.id, 'address', e.target.value)} 
                            disabled={editableEntryId !== row.original.id}
                            ref={el => {
                                if (!inputRefs.current[row.original.id]) {
                                    inputRefs.current[row.original.id] = {};
                                }
                                inputRefs.current[row.original.id].address = el;
                            }}
                        />
                        {fieldError && <span className="error">{fieldError}</span>}
                    </div>
                );
            }
        },
        {
            Header: 'Actions',
            Cell: ({ row }) => (
                <>
                    {editableEntryId === row.original.id ? (
                        <>
                            <button 
                                className="apply-button" 
                                onClick={handleApply}
                            >
                                Apply
                            </button>
                            <button 
                                className="cancel-button" 
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                className="edit-button" 
                                onClick={() => handleEdit(row.original.id)}
                            >
                                Edit
                            </button>
                            <button 
                                className="delete-button" 
                                onClick={() => handleDelete(row.original.id)}
                            >
                                Delete
                            </button>
                        </>
                    )}
                </>
            ),
        },
    ], [editableEntryId, sortedEntries, errors, editValues]);

    const data = useMemo(() => sortedEntries, [sortedEntries]);

    const defaultColumn = useMemo(() => ({
        minWidth: 30,
        width: 150,
        maxWidth: 400,
    }), []);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable(
        { columns, data, defaultColumn },
        useSortBy,
        useResizeColumns,
        useFlexLayout,
        hooks => {
            hooks.visibleColumns.push(columns => {
                return columns.map(column => {
                    const savedWidth = localStorage.getItem(`column-width-${column.id}`);
                    if (savedWidth) {
                        column.width = parseInt(savedWidth, 10);
                    }
                    return column;
                });
            });
        }
    );

    const saveColumnWidths = useCallback(() => {
        headerGroups.forEach(headerGroup => {
            headerGroup.headers.forEach(column => {
                if (column.width) {
                    localStorage.setItem(`column-width-${column.id}`, column.width);
                }
            });
        });
    }, [headerGroups]);

    useEffect(() => {
        window.addEventListener('beforeunload', saveColumnWidths);
        return () => {
            window.removeEventListener('beforeunload', saveColumnWidths);
        };
    }, [saveColumnWidths]);

    return (
        <div className="detailed-view-overlay">
            <div className="detailed-view">
                <div className="detailed-view-header">
                    <button className="close-button" onClick={onClose}>×</button>
                    <h2>Edit Entries</h2>
                </div>
                <div className="detailed-view-content">
                    <table {...getTableProps()} className="users-table">
                        <thead>
                            {headerGroups.map(headerGroup => {
                                const { key, ...restHeaderGroupProps } = headerGroup.getHeaderGroupProps();
                                return (
                                    <tr key={key} {...restHeaderGroupProps}>
                                        {headerGroup.headers.map(column => {
                                            const { key, ...rest } = column.getHeaderProps();
                                            return (
                                                <th key={key} {...rest}>
                                                    {column.render('Header')}
                                                    <div {...column.getResizerProps()} className="resizer" />
                                                    <span>
                                                        {column.isSorted
                                                            ? column.isSortedDesc
                                                                ? ' 🔽'
                                                                : ' 🔼'
                                                            : ''}
                                                    </span>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </thead>
                        <tbody {...getTableBodyProps()}>
                            {rows.map(row => {
                                prepareRow(row);
                                const { key, ...restRowProps } = row.getRowProps();
                                return (
                                    <tr key={key} {...restRowProps}>
                                        {row.cells.map(cell => {
                                            const { key: cellKey, ...restCellProps } = cell.getCellProps();
                                            return (
                                                <td key={cellKey} {...restCellProps}>
                                                    {cell.render('Cell')}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            <MessageQueue messages={messageQueue} removeMessage={removeMessage} />
        </div>
    );
};

export default DetailedView;