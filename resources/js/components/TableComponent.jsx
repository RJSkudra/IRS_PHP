import React from 'react';
import tableComponentMessages from '../../lang/lv/tableComponentMessages';

const TableComponent = ({ entries, totalEntries, handleDeleteAll, handleEditAll }) => {
    return (
        <>
            <div className="table-header">
                <h2>{tableComponentMessages.title}</h2>
                <div className="button-group">
                    <button onClick={handleDeleteAll} className="button delete-button">
                        {tableComponentMessages.buttons.deleteAll}
                    </button>
                    <button onClick={handleEditAll} className="button edit-button">
                        {tableComponentMessages.buttons.editAll}
                    </button>
                </div>
            </div>
            <table className="users-table">
                <thead>
                    <tr>
                        <th>{tableComponentMessages.headers.id}</th>
                        <th>{tableComponentMessages.headers.name}</th>
                        <th>{tableComponentMessages.headers.surname}</th>
                        <th>{tableComponentMessages.headers.age}</th>
                        <th>{tableComponentMessages.headers.phone}</th>
                        <th>{tableComponentMessages.headers.address}</th>
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
            <p>{tableComponentMessages.totalEntries.replace('{0}', totalEntries)}</p>
        </>
    );
};

export default TableComponent;