// Helper functions for DOM rendering and interface updates.

function formatEventDate(dateText) {
    const date = new Date(dateText + "T00:00:00");

    if (Number.isNaN(date.getTime())) {
        return dateText;
    }

    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function countRegistrationsForEvent(eventId) {
    return getRegistrations().filter(function (registration) {
        return registration.eventId === eventId;
    }).length;
}

function addEventDetail(card, label, value) {
    const paragraph = document.createElement("p");
    const labelElement = document.createElement("strong");

    labelElement.textContent = label + ": ";
    paragraph.appendChild(labelElement);
    paragraph.appendChild(document.createTextNode(value));
    card.appendChild(paragraph);
}

function createEventCard(event) {
    const card = document.createElement("article");
    const heading = document.createElement("h3");
    const description = document.createElement("p");
    const detailLink = document.createElement("a");
    const registeredSeats = countRegistrationsForEvent(event.id);
    const availableSeats = Math.max(event.capacity - registeredSeats, 0);

    heading.textContent = event.title;
    card.appendChild(heading);

    addEventDetail(card, "Date", formatEventDate(event.date));
    addEventDetail(card, "Time", event.time);
    addEventDetail(card, "Department", event.department);
    addEventDetail(card, "Category", event.category);
    addEventDetail(card, "Location", event.location);

    description.textContent = event.description;
    card.appendChild(description);

    addEventDetail(card, "Seats", availableSeats + " available / " + event.capacity + " total");

    detailLink.href = "event.html?id=" + encodeURIComponent(event.id);
    detailLink.textContent = "Show event information";
    card.appendChild(detailLink);

    const currentUser = getCurrentUser();

    if (currentUser.role === "student") {
        const registerLink = document.createElement("a");
        registerLink.href = "event.html?id=" + encodeURIComponent(event.id) + "#registration-heading";
        registerLink.textContent = "Register";
        registerLink.className = "card-action";
        card.appendChild(registerLink);
    }

    if (currentUser.role === "organizer") {
        const editLink = document.createElement("a");
        editLink.href = "event-form.html?id=" + encodeURIComponent(event.id);
        editLink.textContent = "Edit event";
        editLink.className = "card-action";
        card.appendChild(editLink);
    }

    return card;
}

function getEventSearchText(event) {
    return [
        event.title,
        event.description,
        event.location,
        event.department,
        event.category
    ].join(" ").toLowerCase();
}

function eventMatchesFilters(event, filters) {
    const keywordMatches = filters.keyword === "" || getEventSearchText(event).includes(filters.keyword);
    const dateMatches = filters.date === "" || event.date === filters.date;
    const categoryMatches = filters.category === "" || event.category === filters.category;
    const departmentMatches = filters.department === "" || event.department === filters.department;

    return keywordMatches && dateMatches && categoryMatches && departmentMatches;
}

function getEventFiltersFromForm() {
    const filterForm = document.getElementById("event-filter-form");

    if (!filterForm) {
        return {
            keyword: "",
            date: "",
            category: "",
            department: ""
        };
    }

    return {
        keyword: filterForm.search.value.trim().toLowerCase(),
        date: filterForm["event-date"].value,
        category: filterForm.category.value,
        department: filterForm.department.value
    };
}

function clearRenderedEvents(eventSection) {
    eventSection.querySelectorAll("article, .empty-message").forEach(function (element) {
        element.remove();
    });
}

function showEmptyEventMessage(eventSection, message) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-message";
    emptyMessage.textContent = message;
    eventSection.appendChild(emptyMessage);
}

function renderHomeEventList(eventsToShow) {
    const eventSection = document.getElementById("featured-events");

    if (!eventSection) {
        return;
    }

    const events = eventsToShow || getEvents();

    clearRenderedEvents(eventSection);

    if (events.length === 0) {
        showEmptyEventMessage(eventSection, "No events match the selected filters.");
        return;
    }

    events.forEach(function (event) {
        eventSection.appendChild(createEventCard(event));
    });
}

function filterAndRenderHomeEvents() {
    const filters = getEventFiltersFromForm();
    const filteredEvents = getEvents().filter(function (event) {
        return eventMatchesFilters(event, filters);
    });

    renderHomeEventList(filteredEvents);
}

function getRoleLabel(role) {
    if (role === "student") {
        return "Student";
    }

    if (role === "organizer") {
        return "Organizer/Admin";
    }

    return "Guest";
}

function populateUserSelect(role, selectedUsername) {
    const userSelect = document.getElementById("user-select");

    if (!userSelect) {
        return;
    }

    userSelect.innerHTML = "";

    getDemoUsersForRole(role).forEach(function (user) {
        const option = document.createElement("option");
        option.value = user.username;
        option.textContent = user.name;
        option.selected = user.username === selectedUsername;
        userSelect.appendChild(option);
    });
}

function updateRoleBasedNavigation() {
    const currentUser = getCurrentUser();
    const roleSelect = document.getElementById("role-select");
    const currentRoleMessage = document.getElementById("current-role-message");

    document.querySelectorAll("[data-nav-role]").forEach(function (link) {
        const allowedRole = link.getAttribute("data-nav-role");
        const listItem = link.closest("li");
        const isVisible = allowedRole === "all" || allowedRole === currentUser.role;

        if (listItem) {
            listItem.hidden = !isVisible;
        }
    });

    if (roleSelect) {
        roleSelect.value = currentUser.role;
    }

    populateUserSelect(currentUser.role, currentUser.username);

    if (currentRoleMessage) {
        currentRoleMessage.textContent = "Current role: " + getRoleLabel(currentUser.role) + " (" + currentUser.name + ")";
    }

    document.body.setAttribute("data-current-role", currentUser.role);
    updateRoleBasedSections();
}

function updateRoleBasedSections() {
    const currentUser = getCurrentUser();
    let firstBlockedRole = "";

    document.querySelectorAll("[data-page-role]").forEach(function (section) {
        const allowedRole = section.getAttribute("data-page-role");
        const isVisible = allowedRole === currentUser.role;
        section.hidden = !isVisible;

        if (!isVisible && firstBlockedRole === "") {
            firstBlockedRole = allowedRole;
        }
    });

    const oldMessage = document.getElementById("role-access-message");
    if (oldMessage) {
        oldMessage.remove();
    }

    if (firstBlockedRole !== "") {
        const message = document.createElement("p");
        message.id = "role-access-message";
        message.className = "empty-message";
        message.textContent = "This page is available for " + getRoleLabel(firstBlockedRole).toLowerCase() + " users in the demo.";
        document.querySelector("main").prepend(message);
    }
}

function getEventIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id") || "";
}

function appendDetailItem(list, label, value) {
    const item = document.createElement("li");
    const labelElement = document.createElement("strong");

    labelElement.textContent = label + ": ";
    item.appendChild(labelElement);
    item.appendChild(document.createTextNode(value));
    list.appendChild(item);
}

function showEventDetailMessage(container, message) {
    container.innerHTML = "";

    const heading = document.createElement("h2");
    const paragraph = document.createElement("p");
    const backLink = document.createElement("a");

    heading.id = "event-detail-heading";
    heading.textContent = "Event details";
    paragraph.className = "empty-message";
    paragraph.textContent = message;
    backLink.href = "index.html";
    backLink.textContent = "Back to events";

    container.appendChild(heading);
    container.appendChild(paragraph);
    container.appendChild(backLink);
}

function addErrorMessage(form, field) {
    const error = document.createElement("p");
    error.id = field.id + "-error";
    error.className = "error-message";
    error.setAttribute("aria-live", "polite");
    form.appendChild(error);
}

function addRegistrationField(form, labelText, field) {
    const label = document.createElement("label");

    label.setAttribute("for", field.id);
    label.textContent = labelText;
    field.setAttribute("aria-describedby", field.id + "-error");

    form.appendChild(label);
    form.appendChild(field);
    addErrorMessage(form, field);
}

function getRegistrationFormData(form, eventId) {
    const currentUser = getCurrentUser();

    return {
        eventId: eventId,
        studentUsername: currentUser.username,
        studentName: cleanText(form.studentName.value),
        studentEmail: cleanText(form.studentEmail.value),
        studyProgram: cleanText(form.studyProgram.value),
        semester: Number(form.semester.value),
        note: cleanText(form.note.value)
    };
}

function showRegistrationMessage(section, message, isError) {
    const messageElement = section.querySelector(".registration-message");

    if (!messageElement) {
        return;
    }

    messageElement.textContent = message;
    messageElement.classList.toggle("form-message-error", Boolean(isError));
}

function renderStudentEventAction(container, event, availableSeats) {
    const currentUser = getCurrentUser();
    const existingRegistration = getRegistrationForStudentAndEvent(currentUser.username, event.id);
    const section = document.createElement("section");
    const heading = document.createElement("h3");
    const intro = document.createElement("p");
    const message = document.createElement("p");

    section.className = "event-action-panel";
    heading.id = "registration-heading";
    heading.textContent = "Student registration";
    section.setAttribute("aria-labelledby", "registration-heading");
    message.className = "form-message registration-message";
    message.setAttribute("aria-live", "polite");

    section.appendChild(heading);

    if (existingRegistration) {
        intro.textContent = "You are already registered for this event.";
        section.appendChild(intro);
        container.appendChild(section);
        return;
    }

    if (availableSeats <= 0) {
        intro.textContent = "This event is fully booked.";
        section.appendChild(intro);
        container.appendChild(section);
        return;
    }

    intro.textContent = "Fill in your student details to reserve one seat.";
    section.appendChild(intro);

    const form = document.createElement("form");
    const nameInput = document.createElement("input");
    const emailInput = document.createElement("input");
    const programInput = document.createElement("input");
    const semesterInput = document.createElement("input");
    const noteInput = document.createElement("textarea");
    const button = document.createElement("button");

    form.id = "student-registration-form";
    form.noValidate = true;

    nameInput.id = "student-name";
    nameInput.name = "studentName";
    nameInput.type = "text";
    nameInput.maxLength = registrationFieldLimits.studentName;
    nameInput.value = currentUser.name;

    emailInput.id = "student-email";
    emailInput.name = "studentEmail";
    emailInput.type = "email";
    emailInput.maxLength = registrationFieldLimits.studentEmail;
    emailInput.value = currentUser.email;

    programInput.id = "study-program";
    programInput.name = "studyProgram";
    programInput.type = "text";
    programInput.maxLength = registrationFieldLimits.studyProgram;
    programInput.value = currentUser.studyProgram;

    semesterInput.id = "semester";
    semesterInput.name = "semester";
    semesterInput.type = "number";
    semesterInput.min = "1";
    semesterInput.max = "20";
    semesterInput.step = "1";
    semesterInput.value = currentUser.semester;

    noteInput.id = "registration-note";
    noteInput.name = "note";
    noteInput.rows = 4;
    noteInput.maxLength = registrationFieldLimits.note;

    button.type = "submit";
    button.textContent = "Register for event";

    addRegistrationField(form, "Student name", nameInput);
    addRegistrationField(form, "Student email", emailInput);
    addRegistrationField(form, "Study program", programInput);
    addRegistrationField(form, "Semester", semesterInput);
    addRegistrationField(form, "Optional note or accessibility needs", noteInput);
    form.appendChild(message);
    form.appendChild(button);

    form.addEventListener("submit", function (submitEvent) {
        submitEvent.preventDefault();

        if (getCurrentUser().role !== "student") {
            showRegistrationMessage(section, "Only students can register for events.", true);
            return;
        }

        if (!validateRegistrationForm(form)) {
            showRegistrationMessage(section, "Please fix the highlighted fields.", true);
            return;
        }

        if (getRegistrationForStudentAndEvent(getCurrentUser().username, event.id)) {
            showRegistrationMessage(section, "You are already registered for this event.", true);
            return;
        }

        if (getAvailableSeats(event.id) <= 0) {
            showRegistrationMessage(section, "This event is fully booked.", true);
            renderEventDetailPage();
            return;
        }

        createRegistration(getRegistrationFormData(form, event.id));
        showRegistrationMessage(section, "Registration saved.", false);
        renderEventDetailPage();
    });

    section.appendChild(form);
    container.appendChild(section);
}

function renderOrganizerEventAction(container, event) {
    const currentUser = getCurrentUser();

    if (currentUser.role !== "organizer" || event.organizerUsername !== currentUser.username) {
        return;
    }

    const section = document.createElement("section");
    const heading = document.createElement("h3");
    const intro = document.createElement("p");
    const editLink = document.createElement("a");
    const deleteButton = document.createElement("button");

    section.className = "event-action-panel";
    heading.textContent = "Organizer actions";
    intro.textContent = "You are viewing an event created by your organizer account.";
    editLink.href = "event-form.html?id=" + encodeURIComponent(event.id);
    editLink.textContent = "Edit event";
    deleteButton.type = "button";
    deleteButton.className = "danger-button";
    deleteButton.textContent = "Delete event";
    deleteButton.addEventListener("click", function () {
        if (window.confirm("Delete this event?")) {
            deleteEvent(event.id);
            window.location.href = "organizer.html";
        }
    });

    section.appendChild(heading);
    section.appendChild(intro);
    section.appendChild(editLink);
    section.appendChild(deleteButton);
    container.appendChild(section);
}

function renderEventDetailPage() {
    const container = document.getElementById("event-detail");

    if (!container) {
        return;
    }

    const eventId = getEventIdFromUrl();

    if (eventId === "") {
        showEventDetailMessage(container, "No event was selected.");
        return;
    }

    const event = getEventById(eventId);

    if (!event) {
        showEventDetailMessage(container, "The selected event could not be found.");
        return;
    }

    const currentUser = getCurrentUser();
    const availableSeats = getAvailableSeats(event.id);
    const takenSeats = countRegistrationsForEvent(event.id);
    const heading = document.createElement("h2");
    const organizer = document.createElement("p");
    const toggleButton = document.createElement("button");
    const detailsSection = document.createElement("section");
    const detailsHeading = document.createElement("h3");
    const detailsList = document.createElement("ul");
    const description = document.createElement("p");
    const actionsHeading = document.createElement("h3");
    const actionsText = document.createElement("p");

    container.innerHTML = "";
    heading.id = "event-detail-heading";
    heading.textContent = event.title;
    organizer.textContent = "Organized by: " + event.department;
    toggleButton.type = "button";
    toggleButton.id = "detail-toggle";
    toggleButton.textContent = "Show event information";

    detailsSection.id = "event-full-information";
    detailsHeading.textContent = "Event information";
    appendDetailItem(detailsList, "Date", formatEventDate(event.date));
    appendDetailItem(detailsList, "Time", event.time);
    appendDetailItem(detailsList, "Location", event.location);
    appendDetailItem(detailsList, "Category", event.category);
    appendDetailItem(detailsList, "Department", event.department);
    appendDetailItem(detailsList, "Available seats", availableSeats + " available / " + event.capacity + " total");
    appendDetailItem(detailsList, "Current registrations", String(takenSeats));
    description.textContent = event.description;

    detailsSection.appendChild(detailsHeading);
    detailsSection.appendChild(detailsList);
    detailsSection.appendChild(description);

    container.appendChild(heading);
    container.appendChild(organizer);
    container.appendChild(toggleButton);
    container.appendChild(detailsSection);

    actionsHeading.textContent = "Actions";
    container.appendChild(actionsHeading);

    if (currentUser.role === "guest") {
        actionsText.textContent = "Guests can view event information. Switch to a student role to see registration options.";
        container.appendChild(actionsText);
    } else if (currentUser.role === "student") {
        if (availableSeats > 0) {
            renderStudentEventAction(container, event, availableSeats);
        } else {
            actionsText.textContent = "This event is fully booked.";
            container.appendChild(actionsText);
        }
    } else {
        actionsText.textContent = "Organizer actions are shown only for events created by the selected organizer account.";
        container.appendChild(actionsText);
        renderOrganizerEventAction(container, event);
    }

    if (window.jQuery) {
        $(detailsSection).hide().fadeIn(250);
        $(toggleButton).on("click", function () {
            $(detailsSection).slideToggle(200);
        });
    }
}

function userCanManageEvent(event) {
    const currentUser = getCurrentUser();
    return currentUser.role === "organizer" && event && event.organizerUsername === currentUser.username;
}

function getEventFormData(form) {
    return {
        title: cleanText(form.title.value),
        department: form.department.value,
        category: form.category.value,
        date: form.date.value,
        time: form.time.value,
        location: cleanText(form.location.value),
        capacity: Number(form.capacity.value),
        description: cleanText(form.description.value),
        organizerUsername: cleanText(form.organizerUsername.value)
    };
}

function fillEventForm(form, event) {
    form["event-id"].value = event.id;
    form.title.value = event.title;
    form.department.value = event.department;
    form.category.value = event.category;
    form.date.value = event.date;
    form.time.value = event.time;
    form.location.value = event.location;
    form.capacity.value = event.capacity;
    form.description.value = event.description;
    form.organizerUsername.value = event.organizerUsername;
}

function prepareEventFormPage() {
    const form = document.getElementById("event-form");
    const heading = document.getElementById("event-form-heading");
    const message = document.getElementById("event-form-message");
    const deleteButton = document.getElementById("delete-event-button");

    if (!form || !heading || !message || !deleteButton) {
        return;
    }

    const currentUser = getCurrentUser();
    const eventId = getEventIdFromUrl();
    const event = eventId ? getEventById(eventId) : null;

    clearInlineErrors(form);
    message.textContent = "";
    deleteButton.hidden = true;

    if (currentUser.role !== "organizer") {
        return;
    }

    if (eventId && !event) {
        heading.textContent = "Edit event";
        message.textContent = "The selected event could not be found.";
        form.querySelectorAll("input, select, textarea, button").forEach(function (field) {
            if (field.id !== "delete-event-button") {
                field.disabled = true;
            }
        });
        return;
    }

    form.querySelectorAll("input, select, textarea, button").forEach(function (field) {
        field.disabled = false;
    });

    if (event) {
        heading.textContent = "Edit event";
        fillEventForm(form, event);

        if (userCanManageEvent(event)) {
            deleteButton.hidden = false;
        } else {
            message.textContent = "You can only manage your own events.";
            form.querySelectorAll("input, select, textarea, button").forEach(function (field) {
                field.disabled = true;
            });
        }
    } else {
        heading.textContent = "Create event";
        form.reset();
        form.organizerUsername.value = currentUser.username;
    }
}

function showEventFormMessage(message, isError) {
    const messageElement = document.getElementById("event-form-message");

    if (!messageElement) {
        return;
    }

    messageElement.textContent = message;
    messageElement.classList.toggle("form-message-error", Boolean(isError));
}

function renderOrganizerDashboard() {
    const eventList = document.getElementById("managed-events-list");
    const overview = document.getElementById("dashboard-overview");
    const studentsList = document.getElementById("registered-students-list");

    if (!eventList || !overview || !studentsList) {
        return;
    }

    const currentUser = getCurrentUser();

    if (currentUser.role !== "organizer") {
        return;
    }

    const ownedEvents = getEvents().filter(function (event) {
        return event.organizerUsername === currentUser.username;
    });
    const totalRegistrations = ownedEvents.reduce(function (total, event) {
        return total + countRegistrationsForEvent(event.id);
    }, 0);

    overview.innerHTML = "";
    eventList.innerHTML = "";
    studentsList.innerHTML = "";

    appendDetailItem(overview, "Your events", String(ownedEvents.length));
    appendDetailItem(overview, "Total registrations", String(totalRegistrations));

    if (ownedEvents.length === 0) {
        showEmptyEventMessage(eventList, "No events are assigned to this organizer account.");
        showEmptyEventMessage(studentsList, "No registered students to show.");
        return;
    }

    ownedEvents.forEach(function (event) {
        eventList.appendChild(createOrganizerEventCard(event));
        studentsList.appendChild(createRegisteredStudentsCard(event));
    });
}

function createOrganizerEventCard(event) {
    const card = document.createElement("article");
    const heading = document.createElement("h3");
    const links = document.createElement("p");
    const detailLink = document.createElement("a");
    const editLink = document.createElement("a");
    const deleteButton = document.createElement("button");

    heading.textContent = event.title;
    card.appendChild(heading);
    addEventDetail(card, "Date", formatEventDate(event.date));
    addEventDetail(card, "Time", event.time);
    addEventDetail(card, "Location", event.location);
    addEventDetail(card, "Registrations", countRegistrationsForEvent(event.id) + " of " + event.capacity + " seats");

    detailLink.href = "event.html?id=" + encodeURIComponent(event.id);
    detailLink.textContent = "Show event information";
    editLink.href = "event-form.html?id=" + encodeURIComponent(event.id);
    editLink.textContent = "Edit event";
    editLink.className = "card-action";
    deleteButton.type = "button";
    deleteButton.className = "danger-button card-action";
    deleteButton.textContent = "Delete event";
    deleteButton.addEventListener("click", function () {
        if (!userCanManageEvent(event)) {
            renderOrganizerDashboard();
            return;
        }

        if (window.confirm("Delete this event and its registrations?")) {
            deleteEvent(event.id);
            renderOrganizerDashboard();
        }
    });

    links.appendChild(detailLink);
    links.appendChild(document.createTextNode(" "));
    links.appendChild(editLink);
    links.appendChild(deleteButton);
    card.appendChild(links);

    return card;
}

function createRegisteredStudentsCard(event) {
    const card = document.createElement("article");
    const heading = document.createElement("h3");
    const tableWrapper = document.createElement("div");
    const table = document.createElement("table");
    const caption = document.createElement("caption");
    const tableHead = document.createElement("thead");
    const tableBody = document.createElement("tbody");
    const headerRow = document.createElement("tr");
    const registrations = getRegistrationsForEvent(event.id);
    const headings = ["Student name", "Email", "Study program", "Semester", "Note", "Action"];

    heading.textContent = event.title;
    card.appendChild(heading);

    if (registrations.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-message";
        emptyMessage.textContent = "No students registered yet.";
        card.appendChild(emptyMessage);
    } else {
        tableWrapper.className = "table-wrapper";
        caption.textContent = "Registered students for " + event.title;
        table.appendChild(caption);

        headings.forEach(function (headingText) {
            const headerCell = document.createElement("th");
            headerCell.scope = "col";
            headerCell.textContent = headingText;
            headerRow.appendChild(headerCell);
        });

        tableHead.appendChild(headerRow);
        table.appendChild(tableHead);

        registrations.forEach(function (registration) {
            const row = document.createElement("tr");
            const values = [
                registration.studentName,
                registration.studentEmail,
                registration.studyProgram,
                String(registration.semester),
                registration.note || "-"
            ];

            values.forEach(function (value) {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            const actionCell = document.createElement("td");
            const removeButton = document.createElement("button");

            removeButton.type = "button";
            removeButton.className = "danger-button";
            removeButton.textContent = "Remove";
            removeButton.addEventListener("click", function () {
                if (!userCanManageEvent(event)) {
                    renderOrganizerDashboard();
                    return;
                }

                if (window.confirm("Remove this student registration?")) {
                    deleteRegistration(registration.id);
                    renderOrganizerDashboard();
                }
            });

            actionCell.appendChild(removeButton);
            row.appendChild(actionCell);
            tableBody.appendChild(row);
        });

        table.appendChild(tableBody);
        tableWrapper.appendChild(table);
        card.appendChild(tableWrapper);
    }

    return card;
}

function createStudentRegistrationCard(registration) {
    const event = getEventById(registration.eventId);
    const card = document.createElement("article");
    const heading = document.createElement("h3");
    const eventLink = document.createElement("a");
    const editButton = document.createElement("button");
    const cancelButton = document.createElement("button");
    const form = document.createElement("form");
    const message = document.createElement("p");
    const suffix = registration.id;

    heading.textContent = event ? event.title : "Event no longer available";
    card.appendChild(heading);

    addEventDetail(card, "Date", event ? formatEventDate(event.date) : "Not available");
    addEventDetail(card, "Location", event ? event.location : "Not available");
    addEventDetail(card, "Student", registration.studentName);
    addEventDetail(card, "Email", registration.studentEmail);
    addEventDetail(card, "Study program", registration.studyProgram);
    addEventDetail(card, "Semester", String(registration.semester));

    if (registration.note) {
        addEventDetail(card, "Note", registration.note);
    }

    if (event) {
        eventLink.href = "event.html?id=" + encodeURIComponent(event.id);
        eventLink.textContent = "View event";
        card.appendChild(eventLink);
    }

    editButton.type = "button";
    editButton.textContent = "Edit registration";
    cancelButton.type = "button";
    cancelButton.className = "danger-button";
    cancelButton.textContent = "Cancel registration";

    form.hidden = true;
    form.noValidate = true;
    message.className = "form-message registration-message";
    message.setAttribute("aria-live", "polite");

    const nameInput = document.createElement("input");
    const emailInput = document.createElement("input");
    const programInput = document.createElement("input");
    const semesterInput = document.createElement("input");
    const noteInput = document.createElement("textarea");
    const saveButton = document.createElement("button");
    const closeButton = document.createElement("button");

    nameInput.id = "student-name-" + suffix;
    nameInput.name = "studentName";
    nameInput.type = "text";
    nameInput.maxLength = registrationFieldLimits.studentName;
    nameInput.value = registration.studentName;

    emailInput.id = "student-email-" + suffix;
    emailInput.name = "studentEmail";
    emailInput.type = "email";
    emailInput.maxLength = registrationFieldLimits.studentEmail;
    emailInput.value = registration.studentEmail;

    programInput.id = "study-program-" + suffix;
    programInput.name = "studyProgram";
    programInput.type = "text";
    programInput.maxLength = registrationFieldLimits.studyProgram;
    programInput.value = registration.studyProgram;

    semesterInput.id = "semester-" + suffix;
    semesterInput.name = "semester";
    semesterInput.type = "number";
    semesterInput.min = "1";
    semesterInput.max = "20";
    semesterInput.step = "1";
    semesterInput.value = registration.semester;

    noteInput.id = "registration-note-" + suffix;
    noteInput.name = "note";
    noteInput.rows = 4;
    noteInput.maxLength = registrationFieldLimits.note;
    noteInput.value = registration.note || "";

    saveButton.type = "submit";
    saveButton.textContent = "Save changes";
    closeButton.type = "button";
    closeButton.textContent = "Close edit form";

    addRegistrationField(form, "Student name", nameInput);
    addRegistrationField(form, "Student email", emailInput);
    addRegistrationField(form, "Study program", programInput);
    addRegistrationField(form, "Semester", semesterInput);
    addRegistrationField(form, "Optional note or accessibility needs", noteInput);
    form.appendChild(message);
    form.appendChild(saveButton);
    form.appendChild(closeButton);

    editButton.addEventListener("click", function () {
        form.hidden = !form.hidden;
    });

    closeButton.addEventListener("click", function () {
        form.hidden = true;
    });

    form.addEventListener("submit", function (submitEvent) {
        submitEvent.preventDefault();

        if (!validateRegistrationForm(form)) {
            message.textContent = "Please fix the highlighted fields.";
            message.classList.add("form-message-error");
            return;
        }

        updateRegistration(registration.id, {
            studentName: cleanText(form.studentName.value),
            studentEmail: cleanText(form.studentEmail.value),
            studyProgram: cleanText(form.studyProgram.value),
            semester: Number(form.semester.value),
            note: cleanText(form.note.value)
        });
        renderStudentRegistrationsPage();
    });

    cancelButton.addEventListener("click", function () {
        if (window.confirm("Cancel this registration?")) {
            deleteRegistration(registration.id);
            renderStudentRegistrationsPage();
        }
    });

    card.appendChild(editButton);
    card.appendChild(cancelButton);
    card.appendChild(form);

    return card;
}

function renderStudentRegistrationsPage() {
    const list = document.getElementById("student-registrations-list");

    if (!list) {
        return;
    }

    const currentUser = getCurrentUser();

    list.innerHTML = "";

    if (currentUser.role !== "student") {
        showEmptyEventMessage(list, "Log in as a student to manage your registrations.");
        return;
    }

    const registrations = getRegistrationsForStudent(currentUser.username);

    if (registrations.length === 0) {
        showEmptyEventMessage(list, "You have no registrations yet.");
        return;
    }

    registrations.forEach(function (registration) {
        list.appendChild(createStudentRegistrationCard(registration));
    });
}
