import React from 'react';

const FormComponent = ({ formData, errors, touched, handleChange, handleSubmit, isFormValid, handleDeleteAll }) => {
    return (
        <form onSubmit={handleSubmit} id="userForm" className="form-grid">
            <div className="form-group">
                <label>Vārds:</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} />
                {touched.name && errors.name && <span className="error">{errors.name}</span>}
            </div>
            <div className="form-group">
                <label>Uzvārds:</label>
                <input type="text" name="surname" value={formData.surname} onChange={handleChange} />
                {touched.surname && errors.surname && <span className="error">{errors.surname}</span>}
            </div>
            <div className="form-group">
                <label>Vecums:</label>
                <input type="text" name="age" value={formData.age} onChange={handleChange} />
                {touched.age && errors.age && <span className="error">{errors.age}</span>}
            </div>
            <div className="form-group">
                <label>Telefona nr.:</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                {touched.phone && errors.phone && <span className="error">{errors.phone}</span>}
            </div>
            <div className="form-group full-width">
                <label>Adrese:</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} />
                {touched.address && errors.address && <span className="error">{errors.address}</span>}
            </div>
            <div className="button-group full-width">
                <button type="submit" className="button submit-button" disabled={!isFormValid}>Iesniegt</button>
            </div>
        </form>
    );
};

export default FormComponent;