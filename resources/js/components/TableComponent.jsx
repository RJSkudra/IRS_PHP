import React from 'react';

const TableComponent = ({ entries, handleDeleteAll }) => {
    return (
        <>
            <div className="table-header">
                <h2>Ieraksti</h2>
                <button onClick={handleDeleteAll} className="button delete-button">Dzēst visus ierakstus</button>
            </div>
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
    );
};

export default TableComponent;