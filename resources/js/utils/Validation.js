import validationMessages from '../../lang/lv/validationMessages';

/**
 * Validates form field input based on field type and returns appropriate error message
 * @param {string} field - Field name
 * @param {string} value - Field value
 * @returns {string} Error message or empty string if validation passes
 */
export const validateField = (field, value) => {
    let error = '';
    switch (field) {
        case 'name':
        case 'surname':
            if (!value.trim()) {
                error = validationMessages[field].required;
            } else if (!/^[a-zA-ZāĀēĒīĪōŌūŪčČšŠžŽņŅģĢķĶļĻŗŖ\- ]+$/u.test(value)) {
                error = validationMessages[field].regex;
            } else if (value.length < 2 || value.length > 50) {
                error = validationMessages[field].length;
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

/**
 * Checks if all form fields are valid (no validation errors)
 * @param {Object} formData - Object containing form field values
 * @returns {boolean} True if all fields are valid
 */
export const validateForm = (formData) => {
    return Object.keys(formData).every(field => !validateField(field, formData[field]));
};

/**
 * Checks if all required fields are filled
 * @param {Object} formData - Object containing form field values
 * @returns {boolean} True if all required fields are filled
 */
export const areAllFieldsFilled = (formData) => {
    return Object.entries(formData).every(([_, value]) => value.trim() !== '');
};

export default {
    validateField,
    validateForm,
    areAllFieldsFilled
};