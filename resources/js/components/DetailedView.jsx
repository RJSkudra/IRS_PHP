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
    const [focusedField, setFocusedField] = useState(null);

    useEffect(() => {
        if (!isEditing) {
            setSortedEntries(entries);
            setOriginalEntries(entries);
        }
    }, [entries, isEditing]);

    // Modify this useEffect to prevent loops
    useEffect(() => {
        // Only attempt to focus if we have a focusedField and are in edit mode
        if (focusedField && editableEntryId) {
            const { id, field } = focusedField;
            setTimeout(() => {
                if (inputRefs.current[id]?.[field]) {
                    inputRefs.current[id][field].focus();
                    
                    // Preserve cursor position by moving it to the end
                    const length = inputRefs.current[id][field].value.length;
                    inputRefs.current[id][field].setSelectionRange(length, length);
                }
            }, 0); // Use setTimeout to ensure DOM is updated
        }
    }, [focusedField, editableEntryId]); // Remove editValues and errors from dependencies

    // Update handleInputChange
    const handleInputChange = useCallback((id, field, value) => {
        // Track which field has focus
        setFocusedField({ id, field });
        
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
    }, []);

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
                
                // Update sortedEntries with the new data
                setSortedEntries(updatedEntries);
                
                // Also update the original entries
                setOriginalEntries(updatedEntries);
                
                // Optionally re-apply the current sort
                if (sortBy.length) {
                    const columnId = sortBy[0].id;
                    const desc = sortBy[0].desc;
                    
                    const resortedData = [...updatedEntries].sort((a, b) => {
                        // Same sorting logic as in the useEffect
                        const aValue = a[columnId] == null ? '' : a[columnId];
                        const bValue = b[columnId] == null ? '' : b[columnId];
                        
                        if (typeof aValue === 'string' && typeof bValue === 'string') {
                            return desc ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
                        }
                        
                        if (aValue > bValue) return desc ? -1 : 1;
                        if (aValue < bValue) return desc ? 1 : -1;
                        return 0;
                    });
                    
                    setSortedEntries(resortedData);
                }
                
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

    // Define cellRenderer with useCallback
    const cellRenderer = useCallback(({ value, row, fieldName }) => {
        const displayValue = editableEntryId === row.original.id && editValues[row.original.id]?.[fieldName] !== undefined
            ? editValues[row.original.id][fieldName]
            : value;
            
        const fieldError = editableEntryId === row.original.id && errors[fieldName] ? errors[fieldName] : null;
        
        // Use pattern attribute for age to only allow numbers, but keep type="text" for consistent behavior
        const inputProps = fieldName === 'age' 
            ? {
                type: "text", 
                pattern: "[0-9]*",
                inputMode: "numeric"
              } 
            : { 
                type: "text" 
              };
            
        return (
            <div>
                <input 
                    {...inputProps}
                    value={displayValue} 
                    onChange={(e) => handleInputChange(row.original.id, fieldName, e.target.value)}
                    onFocus={() => setFocusedField({ id: row.original.id, field: fieldName })}
                    disabled={editableEntryId !== row.original.id}
                    ref={el => {
                        if (el) {
                            if (!inputRefs.current[row.original.id]) {
                                inputRefs.current[row.original.id] = {};
                            }
                            inputRefs.current[row.original.id][fieldName] = el;
                        }
                    }}
                />
                {fieldError && <span className="error">{fieldError}</span>}
            </div>
        );
    }, [editableEntryId, editValues, errors, handleInputChange]);

    // Update your columns definition to use the new cell renderer for each field
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
            Cell: ({ value, row }) => cellRenderer({ value, row, fieldName: 'name' })
        },
        {
            Header: 'Surname',
            accessor: 'surname',
            Cell: ({ value, row }) => cellRenderer({ value, row, fieldName: 'surname' })
        },
        {
            Header: 'Age',
            accessor: 'age',
            Cell: ({ value, row }) => cellRenderer({ value, row, fieldName: 'age' })
        },
        {
            Header: 'Phone',
            accessor: 'phone',
            Cell: ({ value, row }) => cellRenderer({ value, row, fieldName: 'phone' })
        },
        {
            Header: 'Address',
            accessor: 'address',
            Cell: ({ value, row }) => cellRenderer({ value, row, fieldName: 'address' })
        },
        {
            Header: 'Actions',
            Cell: ({ row }) => (
                <div className="action-buttons">
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
                </div>
            ),
        },
    ], [editableEntryId, cellRenderer]); // Remove sortedEntries, errors, editValues

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
        state: { sortBy }
    } = useTable(
        { 
            columns, 
            data, 
            defaultColumn,
            initialState: { sortBy: [] },
            // Add this explicit sorting configuration
            manualSortBy: true, // Tell react-table that we'll handle sorting manually
            disableSortRemove: true, // Prevent removing sort when clicking a sorted column
            autoResetSortBy: false // Prevent auto-resetting sort when data changes
        },
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

    // 2. Replace the useEffect for sorting with this improved version
    useEffect(() => {
        console.log("Sort state changed:", sortBy); // Add for debugging
        
        // Sort the data based on the current sort state
        const applySorting = () => {
            if (!sortBy || !sortBy.length) {
                // If no sort is specified, just use the original data
                return [...entries];
            }

            // Get the column ID and sort direction
            const { id: columnId, desc } = sortBy[0];

            // Create a new sorted copy
            return [...entries].sort((rowA, rowB) => {
                // Extract values for the column being sorted
                let a = rowA[columnId];
                let b = rowB[columnId];
                
                // Convert null/undefined to empty strings for comparison
                a = a == null ? '' : a;
                b = b == null ? '' : b;

                // Handle age column as numeric
                if (columnId === 'age') {
                    const numA = Number(a) || 0;
                    const numB = Number(b) || 0;
                    return desc ? numB - numA : numA - numB;
                }
                
                // Handle string comparison for other columns
                if (typeof a === 'string' && typeof b === 'string') {
                    return desc ? b.localeCompare(a) : a.localeCompare(b);
                }
                
                // Fallback comparison for other types
                if (a < b) return desc ? 1 : -1;
                if (a > b) return desc ? -1 : 1;
                return 0;
            });
        };

        const sortedData = applySorting();
        setSortedEntries(sortedData);
    }, [sortBy, entries]);

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
                                            // Add getSortByToggleProps to make headers clickable for sorting
                                            const { key, ...rest } = column.getHeaderProps(column.getSortByToggleProps());
                                            return (
                                                <th 
                                                    key={key} 
                                                    {...rest}
                                                    className={`sortable-header ${column.isSorted ? 'sorted' : ''}`}
                                                    title="Click to sort"
                                                >
                                                    <div className="header-content">
                                                        <span>{column.render('Header')}</span>
                                                        <span className="sort-indicator">
                                                            {column.isSorted
                                                                ? column.isSortedDesc
                                                                    ? ' ▼'
                                                                    : ' ▲'
                                                                : ' '}
                                                        </span>
                                                    </div>
                                                    <div {...column.getResizerProps()} className="resizer" />
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
                    <div className="footer">
                        IRS™ © ® 2025
                    </div>
                </div>
            </div>
            <MessageQueue messages={messageQueue} removeMessage={removeMessage} />
        </div>
    );
};

export default DetailedView;