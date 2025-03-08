import React from 'react';

const FormComponent = ({ formData, errors, touched, handleChange, handleSubmit, isFormValid }) => {
    return (
        <form onSubmit={handleSubmit} id="userForm">
            <div className="form-group">
                <label>Name:</label>
                <div className="validation-icon">
                    {touched.name && (errors.name ? (
                        <span className="error">{errors.name} <span style={{ color: 'red' }}>✗</span></span>
                    ) : (
                        <span style={{ color: 'green' }}>✓</span>
                    ))}
                </div>
                <input type="text" name="name" value={formData.name} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Surname:</label>
                <div className="validation-icon">
                    {touched.surname && (errors.surname ? (
                        <span className="error">{errors.surname} <span style={{ color: 'red' }}>✗</span></span>
                    ) : (
                        <span style={{ color: 'green' }}>✓</span>
                    ))}
                </div>
                <input type="text" name="surname" value={formData.surname} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Age:</label>
                <div className="validation-icon">
                    {touched.age && (errors.age ? (
                        <span className="error">{errors.age} <span style={{ color: 'red' }}>✗</span></span>
                    ) : (
                        <span style={{ color: 'green' }}>✓</span>
                    ))}
                </div>
                <input type="text" name="age" value={formData.age} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Phone:</label>
                <div className="validation-icon">
                    {touched.phone && (errors.phone ? (
                        <span className="error">{errors.phone} <span style={{ color: 'red' }}>✗</span></span>
                    ) : (
                        <span style={{ color: 'green' }}>✓</span>
                    ))}
                </div>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Address:</label>
                <div className="validation-icon">
                    {touched.address && (errors.address ? (
                        <span className="error">{errors.address} <span style={{ color: 'red' }}>✗</span></span>
                    ) : (
                        <span style={{ color: 'green' }}>✓</span>
                    ))}
                </div>
                <input type="text" name="address" value={formData.address} onChange={handleChange} />
            </div>
            <button type="submit" className="button submit-button" disabled={!isFormValid}>Submit</button>
        </form>
    );
};

export default FormComponent;