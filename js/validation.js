// Helper functions for form validation.

const eventFieldLimits = {
    title: 80,
    location: 80,
    description: 500,
    organizerUsername: 40
};

function clearInlineErrors(form) {
    form.querySelectorAll(".error-message").forEach(function (message) {
        message.textContent = "";
    });

    form.querySelectorAll("[aria-invalid]").forEach(function (field) {
        field.removeAttribute("aria-invalid");
    });
}

function showInlineError(field, message) {
    const errorElement = document.getElementById(field.id + "-error");

    field.setAttribute("aria-invalid", "true");

    if (errorElement) {
        errorElement.textContent = message;
    }
}

function isBlank(value) {
    return value.trim() === "";
}

function validateTextField(field, label, maxLength, errors) {
    const value = field.value.trim();

    if (isBlank(value)) {
        errors.push({ field: field, message: label + " is required." });
    } else if (value.length > maxLength) {
        errors.push({ field: field, message: label + " must be " + maxLength + " characters or less." });
    }
}

function validateEventForm(form) {
    const errors = [];
    const now = new Date();
    const selectedDateTime = new Date(form.date.value + "T" + form.time.value);
    const capacity = Number(form.capacity.value);

    clearInlineErrors(form);

    validateTextField(form.title, "Title", eventFieldLimits.title, errors);
    validateTextField(form.location, "Location", eventFieldLimits.location, errors);
    validateTextField(form.description, "Description", eventFieldLimits.description, errors);
    validateTextField(form.organizerUsername, "Organizer username", eventFieldLimits.organizerUsername, errors);

    if (isBlank(form.department.value)) {
        errors.push({ field: form.department, message: "Department is required." });
    }

    if (isBlank(form.category.value)) {
        errors.push({ field: form.category, message: "Category is required." });
    }

    if (isBlank(form.date.value)) {
        errors.push({ field: form.date, message: "Date is required." });
    }

    if (isBlank(form.time.value)) {
        errors.push({ field: form.time, message: "Time is required." });
    }

    if (!isBlank(form.date.value) && !isBlank(form.time.value)) {
        if (Number.isNaN(selectedDateTime.getTime())) {
            errors.push({ field: form.date, message: "Enter a valid date and time." });
        } else if (selectedDateTime < now) {
            errors.push({ field: form.date, message: "Choose a date and time that has not already passed." });
        }
    }

    if (isBlank(form.capacity.value)) {
        errors.push({ field: form.capacity, message: "Capacity is required." });
    } else if (!Number.isInteger(capacity) || capacity <= 0) {
        errors.push({ field: form.capacity, message: "Capacity must be a positive whole number." });
    } else if (capacity > 200) {
        errors.push({ field: form.capacity, message: "Capacity cannot be more than 200." });
    }

    errors.forEach(function (error) {
        showInlineError(error.field, error.message);
    });

    return errors.length === 0;
}
