import React, { useState } from 'react';
import axios from 'axios';

function UserForm() {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        age: '',
        phone: '',
        address: ''
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('/store', formData)
            .then(response => {
                setFormData({
                    name: '',
                    surname: '',
                    age: '',
                    phone: '',
                    address: ''
                });
                setErrors({});
                alert(response.data.success);
            })
            .catch(error => {
                if (error.response && error.response.data.errors) {
                    setErrors(error.response.data.errors);
                }
            });
    };

    return (
        <div className="container mx-auto p-4">
            <div className="form-container bg-white p-6 rounded-lg shadow-md">
                <h1 className="form-title text-2xl font-bold mb-4">IRS datu ievade</h1>
                <form id="userForm" onSubmit={handleSubmit}>
                    <div className="form-grid grid grid-cols-1 gap-4">
                        <div className="form-group">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Vārds</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            {errors.name && <div className="error-message text-red-500 text-sm mt-1">{errors.name}</div>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="surname" className="block text-sm font-medium text-gray-700">Uzvārds</label>
                            <input type="text" id="surname" name="surname" value={formData.surname} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            {errors.surname && <div className="error-message text-red-500 text-sm mt-1">{errors.surname}</div>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="age" className="block text-sm font-medium text-gray-700">Vecums</label>
                            <input type="text" id="age" name="age" value={formData.age} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            {errors.age && <div className="error-message text-red-500 text-sm mt-1">{errors.age}</div>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefona nr.</label>
                            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            {errors.phone && <div className="error-message text-red-500 text-sm mt-1">{errors.phone}</div>}
                        </div>
                        <div className="form-group full-width">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Adrese</label>
                            <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            {errors.address && <div className="error-message text-red-500 text-sm mt-1">{errors.address}</div>}
                        </div>
                    </div>
                    <button type="submit" className="submit-button mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700">Submit</button>
                </form>
            </div>
        </div>
    );
}

export default UserForm;