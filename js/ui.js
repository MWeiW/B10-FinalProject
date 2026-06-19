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
    detailLink.textContent = "View details";
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

function renderStudentEventAction(container, event, availableSeats) {
    const section = document.createElement("section");
    const heading = document.createElement("h3");
    const intro = document.createElement("p");

    section.className = "event-action-panel";
    heading.id = "registration-heading";
    heading.textContent = "Student registration";
    section.setAttribute("aria-labelledby", "registration-heading");
    intro.textContent = "Seats are available for this event. Please check the event information before registering.";

    section.appendChild(heading);
    section.appendChild(intro);

    if (availableSeats > 0) {
        const form = document.createElement("form");
        const nameLabel = document.createElement("label");
        const nameInput = document.createElement("input");
        const emailLabel = document.createElement("label");
        const emailInput = document.createElement("input");
        const noteLabel = document.createElement("label");
        const noteInput = document.createElement("textarea");
        const button = document.createElement("button");

        nameLabel.setAttribute("for", "student-name");
        nameLabel.textContent = "Full name";
        nameInput.id = "student-name";
        nameInput.name = "student-name";
        nameInput.type = "text";

        emailLabel.setAttribute("for", "student-email");
        emailLabel.textContent = "HTW email address";
        emailInput.id = "student-email";
        emailInput.name = "student-email";
        emailInput.type = "email";

        noteLabel.setAttribute("for", "registration-note");
        noteLabel.textContent = "Notes for the organizer";
        noteInput.id = "registration-note";
        noteInput.name = "registration-note";
        noteInput.rows = 4;

        button.type = "button";
        button.textContent = "Registration form preview";

        form.appendChild(nameLabel);
        form.appendChild(nameInput);
        form.appendChild(emailLabel);
        form.appendChild(emailInput);
        form.appendChild(noteLabel);
        form.appendChild(noteInput);
        form.appendChild(button);
        section.appendChild(form);
    }

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
    toggleButton.textContent = "Show or hide event information";

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
