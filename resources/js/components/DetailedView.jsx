import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useTable, useSortBy, useResizeColumns } from 'react-table';
import 'react-resizable/css/styles.css';

const DetailedView = ({ onClose, entries }) => {
    const [editableEntryId, setEditableEntryId] = useState(null);
    const [sortedEntries, setSortedEntries] = useState(entries);
    const [originalEntries, setOriginalEntries] = useState(entries);
    const [editingEntry, setEditingEntry] = useState(null);

    useEffect(() => {
        setSortedEntries(entries);
        setOriginalEntries(entries);
    }, [entries]);

    const handleInputChange = (id, field, value) => {
        setSortedEntries(sortedEntries.map(entry => 
            entry.id === id ? { ...entry, [field]: value } : entry
        ));
    };

    const handleSave = async () => {
        try {
            const response = await axios.post('/api/update-entries', { entries: sortedEntries });
            if (response.status === 200) {
                alert('Entries updated successfully');
                setOriginalEntries(sortedEntries); // Update originalEntries only if save is successful
            } else {
                console.error('Unexpected response:', response);
                alert('Unexpected response from the server');
            }
        } catch (error) {
            if (error.response) {
                console.error('Error response:', error.response);
                alert(`Error updating entries: ${error.response.status} ${error.response.statusText}`);
            } else if (error.request) {
                console.error('Error request:', error.request);
                alert('Error updating entries: No response from server');
            } else {
                console.error('Error message:', error.message);
                alert(`Error updating entries: ${error.message}`);
            }
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
        setEditingEntry(sortedEntries.find(entry => entry.id === id));
    };

    const handleApply = () => {
        setEditableEntryId(null);
        handleSave();
    };

    const handleCancel = () => {
        setSortedEntries(sortedEntries.map(entry => 
            entry.id === editableEntryId ? editingEntry : entry
        ));
        setEditableEntryId(null);
    };

    const columns = useMemo(() => [
        {
            Header: 'ID',
            accessor: 'id',
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

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data }, useSortBy, useResizeColumns);

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
        </div>
    );
};

export default DetailedView;