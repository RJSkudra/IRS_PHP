import React from 'react';

const TableComponent = ({ entries, totalEntries, handleDeleteAll, handleEditAll }) => {
    return (
        <>
            <div className="table-header">
                <h2>Ieraksti</h2>
                <div className="button-group">
                    <button onClick={handleDeleteAll} className="button delete-button">Dzēst visus ierakstus</button>
                    <button onClick={handleEditAll} className="button edit-button">Edit All Entries</button>
                </div>
            </div>
            <table className="users-table">
                <thead>
                    <tr>
                        <th>ID</th>
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
                            <td>{entry.id}</td>
                            <td>{entry.name}</td>
                            <td>{entry.surname}</td>
                            <td>{entry.age}</td>
                            <td>{entry.phone}</td>
                            <td>{entry.address}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p>Ieraksti kopā: {totalEntries}</p>
        </>
    );
};

export default TableComponent;