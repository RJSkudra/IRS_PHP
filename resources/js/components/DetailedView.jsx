import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import { useTable, useSortBy, useResizeColumns, useFlexLayout } from 'react-table';
import 'react-resizable/css/styles.css';
import MessageQueue from './MessageQueue';
import validationMessages from '../../lang/lv/validationMessages';

const DetailedView = ({ onClose, entries, setIsEditing }) => {
    const [editableEntryId, setEditableEntryId] = useState(null);
    const [sortedEntries, setSortedEntries] = useState(entries);
    const [originalEntries, setOriginalEntries] = useState(entries);
    const [editingEntry, setEditingEntry] = useState(null);
    const [messageQueue, setMessageQueue] = useState([]);
    const [isEditing, setIsEditingLocal] = useState(false); // New state variable
    const [errors, setErrors] = useState({});
    const inputRefs = useRef({}); // Create a ref object to store input references
    const [editValues, setEditValues] = useState({});

    useEffect(() => {
        if (!isEditing) {
            setSortedEntries(entries);
            setOriginalEntries(entries);
        }
    }, [entries, isEditing]);

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

    const handleInputChange = (id, field, value) => {
        // Update only the local edit values
        setEditValues(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value
            }
        }));
        
        // Validate and set errors
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
                setOriginalEntries(sortedEntries); // Update originalEntries only if save is successful
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
            // No need to manually update the state here as the Socket.io
            // will broadcast the updated entries to all connected clients
            addMessageToQueue({ text: 'Entry deleted successfully', type: 'success' });
        } catch (error) {
            console.error('Error deleting entry:', error);
            addMessageToQueue({ text: 'Error deleting entry', type: 'error' });
        }
    };

    const handleEdit = (id) => {
        const entry = sortedEntries.find(entry => entry.id === id);
        setEditableEntryId(id);
        setEditingEntry(entry);
        setEditValues(entry); // Store the current values for editing
        setIsEditing(true);
        setIsEditingLocal(true);
    };

    const handleApply = () => {
        // Apply the local edit values to the sortedEntries
        const newEntries = sortedEntries.map(entry =>
            entry.id === editableEntryId ? {...entry, ...editValues} : entry
        );
        setSortedEntries(newEntries);
        setEditableEntryId(null);
        handleSave();
        setIsEditing(false);
        setIsEditingLocal(false);
    };

    const handleCancel = () => {
        setSortedEntries(sortedEntries.map(entry =>
            entry.id === editableEntryId ? editingEntry : entry
        ));
        setEditableEntryId(null);
        setIsEditing(false); // Set editing state to false
        setIsEditingLocal(false); // Set local editing state to false
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
                        disabled={true} // Make the ID field non-editable
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
                const displayValue = editableEntryId === row.original.id && editValues[row.original.id]
                    ? editValues[row.original.id].name
                    : value;
                    
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
                        {editableEntryId === row.original.id && errors.name && <span className="error">{errors.name}</span>}
                    </div>
                );
            }
        },
        {
            Header: 'Surname',
            accessor: 'surname',
            Cell: ({ value, row }) => {
                const displayValue = editableEntryId === row.original.id && editValues[row.original.id]
                    ? editValues[row.original.id].surname
                    : value;
                    
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
                        {editableEntryId === row.original.id && errors.surname && <span className="error">{errors.surname}</span>}
                    </div>
                );
            }
        },
        {
            Header: 'Age',
            accessor: 'age',
            Cell: ({ value, row }) => {
                const displayValue = editableEntryId === row.original.id && editValues[row.original.id]
                    ? editValues[row.original.id].age
                    : value;
                    
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
                        {editableEntryId === row.original.id && errors.age && <span className="error">{errors.age}</span>}
                    </div>
                );
            }
        },
        {
            Header: 'Phone',
            accessor: 'phone',
            Cell: ({ value, row }) => {
                const displayValue = editableEntryId === row.original.id && editValues[row.original.id]
                    ? editValues[row.original.id].phone
                    : value;
                    
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
                        {editableEntryId === row.original.id && errors.phone && <span className="error">{errors.phone}</span>}
                    </div>
                );
            }
        },
        {
            Header: 'Address',
            accessor: 'address',
            Cell: ({ value, row }) => {
                const displayValue = editableEntryId === row.original.id && editValues[row.original.id]
                    ? editValues[row.original.id].address
                    : value;
                    
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
                        {editableEntryId === row.original.id && errors.address && <span className="error">{errors.address}</span>}
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