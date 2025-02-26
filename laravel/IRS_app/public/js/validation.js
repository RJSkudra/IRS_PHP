let validationMessages = {};
let touchedFields = {};

document.addEventListener('DOMContentLoaded', function() {
    fetch('/validation-messages')
        .then(response => response.json())
        .then(messages => {
            validationMessages = messages;
            document.getElementById('name').addEventListener('input', validateName);
            document.getElementById('surname').addEventListener('input', validateSurname);
            document.getElementById('age').addEventListener('input', validateAge);
            document.getElementById('phone').addEventListener('input', validatePhone);
            document.getElementById('address').addEventListener('input', validateAddress);
            document.querySelectorAll('input').forEach(input => {
                input.addEventListener('input', updateSubmitButtonState);
                input.addEventListener('focus', markFieldAsTouched);
            });
            updateSubmitButtonState();
        });
});

function markFieldAsTouched(event) {
    touchedFields[event.target.id] = true;
}

function validateName() {
    const name = document.getElementById('name').value;
    const nameError = document.getElementById('name-error');
    const namePattern = /^[a-zA-ZāĀēĒīĪōŌūŪčČšŠžŽņŅģĢķĶļĻŗŖ\- ]+$/u;
    if (name.trim() === '') {
        nameError.innerText = touchedFields['name'] ? validationMessages.custom.name.required : '';
    } else if (!namePattern.test(name)) {
        nameError.innerText = touchedFields['name'] ? validationMessages.custom.name.regex : '';
    } else if (name.length < 2 || name.length > 50) {
        nameError.innerText = touchedFields['name'] ? validationMessages.custom.name.length : '';
    } else {
        nameError.innerText = '';
    }
}

function validateSurname() {
    const surname = document.getElementById('surname').value;
    const surnameError = document.getElementById('surname-error');
    const surnamePattern = /^[a-zA-ZāĀēĒīĪōŌūŪčČšŠžŽņŅģĢķĶļĻŗŖ\- ]+$/u;
    if (surname.trim() === '') {
        surnameError.innerText = touchedFields['surname'] ? validationMessages.custom.surname.required : '';
    } else if (!surnamePattern.test(surname)) {
        surnameError.innerText = touchedFields['surname'] ? validationMessages.custom.surname.regex : '';
    } else if (surname.length < 2 || surname.length > 50) {
        surnameError.innerText = touchedFields['surname'] ? validationMessages.custom.surname.length : '';
    } else {
        surnameError.innerText = '';
    }
}

function validateAge() {
    const age = document.getElementById('age').value;
    const ageError = document.getElementById('age-error');
    if (age.trim() === '') {
        ageError.innerText = touchedFields['age'] ? validationMessages.custom.age.required : '';
    } else if (isNaN(age)) {
        ageError.innerText = touchedFields['age'] ? validationMessages.custom.age.integer : '';
    } else if (age < 0) {
        ageError.innerText = touchedFields['age'] ? validationMessages.custom.age.min : '';
    } else if (age > 200) {
        ageError.innerText = touchedFields['age'] ? validationMessages.custom.age.max : '';
    } else {
        ageError.innerText = '';
    }
}

function validatePhone() {
    const phone = document.getElementById('phone').value;
    const phoneError = document.getElementById('phone-error');
    const phonePattern = /^[0-9]{8}$/;
    if (phone.trim() === '') {
        phoneError.innerText = touchedFields['phone'] ? validationMessages.custom.phone.required : '';
    } else if (!phonePattern.test(phone)) {
        phoneError.innerText = touchedFields['phone'] ? validationMessages.custom.phone.regex : '';
    } else {
        phoneError.innerText = '';
    }
}

function validateAddress() {
    const address = document.getElementById('address').value;
    const addressError = document.getElementById('address-error');
    const addressPattern = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9\s,.,-āĀēĒīĪōŌūŪčČšŠžŽņŅģĢķĶļĻŗŖ]+$/u;
    if (address.trim() === '') {
        addressError.innerText = touchedFields['address'] ? validationMessages.custom.address.required : '';
    } else if (!addressPattern.test(address)) {
        addressError.innerText = touchedFields['address'] ? validationMessages.custom.address.regex : '';
    } else {
        addressError.innerText = '';
    }
}

function validateForm() {
    validateName();
    validateSurname();
    validateAge();
    validatePhone();
    validateAddress();
    return document.getElementById('name-error').innerText === '' &&
           document.getElementById('surname-error').innerText === '' &&
           document.getElementById('age-error').innerText === '' &&
           document.getElementById('phone-error').innerText === '' &&
           document.getElementById('address-error').innerText === '';
}

function updateSubmitButtonState() {
    const submitButton = document.querySelector('.submit-button');
    const allFieldsFilled = document.getElementById('name').value.trim() !== '' &&
                            document.getElementById('surname').value.trim() !== '' &&
                            document.getElementById('age').value.trim() !== '' &&
                            document.getElementById('phone').value.trim() !== '' &&
                            document.getElementById('address').value.trim() !== '';
    if (allFieldsFilled && validateForm()) {
        submitButton.disabled = false;
        submitButton.style.backgroundColor = '#007bff';
        submitButton.style.cursor = 'pointer';
    } else {
        submitButton.disabled = true;
        submitButton.style.backgroundColor = '#ccc';
        submitButton.style.cursor = 'not-allowed';
    }
}