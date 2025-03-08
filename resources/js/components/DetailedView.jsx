import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useTable, useSortBy, useResizeColumns, useFlexLayout } from 'react-table';
import 'react-resizable/css/styles.css';
import MessageQueue from './MessageQueue';

const DetailedView = ({ onClose, entries, setIsEditing }) => {
    const [editableEntryId, setEditableEntryId] = useState(null);
    const [sortedEntries, setSortedEntries] = useState(entries);
    const [originalEntries, setOriginalEntries] = useState(entries);
    const [editingEntry, setEditingEntry] = useState(null);
    const [messageQueue, setMessageQueue] = useState([]);
    const [isEditing, setIsEditingLocal] = useState(false); // New state variable

    useEffect(() => {
        if (!isEditing) {
            setSortedEntries(entries);
            setOriginalEntries(entries);
        }
    }, [entries, isEditing]);

    const handleInputChange = (id, field, value) => {
        setSortedEntries(sortedEntries.map(entry => 
            entry.id === id ? { ...entry, [field]: value } : entry
        ));
    };

    const handleSave = async () => {
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
            const response = await axios.get('/api/entries'); // Fetch updated entries
            setSortedEntries(response.data); // Update state with new entries
            addMessageToQueue({ text: 'Entry deleted successfully', type: 'success' });
        } catch (error) {
            console.error('Error deleting entry:', error);
            addMessageToQueue({ text: 'Error deleting entry', type: 'error' });
        }
    };

    const handleEdit = (id) => {
        setEditableEntryId(id);
        setEditingEntry(sortedEntries.find(entry => entry.id === id));
        setIsEditing(true); // Set editing state to true
        setIsEditingLocal(true); // Set local editing state to true
    };

    const handleApply = () => {
        setEditableEntryId(null);
        handleSave();
        setIsEditing(false); // Set editing state to false
        setIsEditingLocal(false); // Set local editing state to false
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
                <input 
                    type="text" 
                    value={value} 
                    onChange={(e) => handleInputChange(row.original.id, 'id', e.target.value)} 
                    disabled={editableEntryId !== row.original.id}
                />
            ),
        },
        {
            Header: 'Name',
            accessor: 'name',
            Cell: ({ value, row }) => (
                <input 
                    type="text" 
                    value={value} 
                    onChange={(e) => handleInputChange(row.original.id, 'name', e.target.value)} 
                    disabled={editableEntryId !== row.original.id}
                />
            ),
        },
        {
            Header: 'Surname',
            accessor: 'surname',
            Cell: ({ value, row }) => (
                <input 
                    type="text" 
                    value={value} 
                    onChange={(e) => handleInputChange(row.original.id, 'surname', e.target.value)} 
                    disabled={editableEntryId !== row.original.id}
                />
            ),
        },
        {
            Header: 'Age',
            accessor: 'age',
            Cell: ({ value, row }) => (
                <input 
                    type="number" 
                    value={value} 
                    onChange={(e) => handleInputChange(row.original.id, 'age', e.target.value)} 
                    disabled={editableEntryId !== row.original.id}
                />
            ),
        },
        {
            Header: 'Phone',
            accessor: 'phone',
            Cell: ({ value, row }) => (
                <input 
                    type="text" 
                    value={value} 
                    onChange={(e) => handleInputChange(row.original.id, 'phone', e.target.value)} 
                    disabled={editableEntryId !== row.original.id}
                />
            ),
        },
        {
            Header: 'Address',
            accessor: 'address',
            Cell: ({ value, row }) => (
                <input 
                    type="text" 
                    value={value} 
                    onChange={(e) => handleInputChange(row.original.id, 'address', e.target.value)} 
                    disabled={editableEntryId !== row.original.id}
                />
            ),
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
    ], [editableEntryId, sortedEntries]);

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
                            {headerGroups.map(headerGroup => (
                                <tr {...headerGroup.getHeaderGroupProps()}>
                                    {headerGroup.headers.map(column => (
                                        <th {...column.getHeaderProps()}>
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
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody {...getTableBodyProps()}>
                            {rows.map(row => {
                                prepareRow(row);
                                return (
                                    <tr {...row.getRowProps()}>
                                        {row.cells.map(cell => (
                                            <td {...cell.getCellProps()}>
                                                {cell.render('Cell')}
                                            </td>
                                        ))}
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