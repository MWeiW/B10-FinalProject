// Main application startup code.

function setupHomeEventFilters() {
    const filterForm = document.getElementById("event-filter-form");

    if (!filterForm) {
        return;
    }

    if (window.jQuery) {
        $("#event-filter-form").on("submit", function (event) {
            event.preventDefault();
            filterAndRenderHomeEvents();
        });

        $("#search, #event-date, #category, #department").on("input change", function () {
            filterAndRenderHomeEvents();
        });

        $("#clear-filters").on("click", function () {
            $("#event-filter-form")[0].reset();
            filterAndRenderHomeEvents();
        });
    } else {
        filterForm.addEventListener("submit", function (event) {
            event.preventDefault();
            filterAndRenderHomeEvents();
        });

        filterForm.querySelectorAll("input, select").forEach(function (field) {
            field.addEventListener("input", filterAndRenderHomeEvents);
            field.addEventListener("change", filterAndRenderHomeEvents);
        });

        document.getElementById("clear-filters").addEventListener("click", function () {
            filterForm.reset();
            filterAndRenderHomeEvents();
        });
    }
}

function setupRoleSwitcher() {
    const roleForm = document.getElementById("role-switcher-form");
    const roleSelect = document.getElementById("role-select");
    const userSelect = document.getElementById("user-select");

    if (!roleForm || !roleSelect || !userSelect) {
        return;
    }

    roleSelect.addEventListener("change", function () {
        const users = getDemoUsersForRole(roleSelect.value);
        populateUserSelect(roleSelect.value, users[0].username);
    });

    roleForm.addEventListener("submit", function (event) {
        event.preventDefault();
        setCurrentUser(roleSelect.value, userSelect.value);
        updateRoleBasedNavigation();
        filterAndRenderHomeEvents();
        renderEventDetailPage();
        prepareEventFormPage();
        renderOrganizerDashboard();
        renderStudentRegistrationsPage();
    });
}

document.addEventListener("DOMContentLoaded", function () {
    initializeStorage();
    updateRoleBasedNavigation();
    setupRoleSwitcher();
    renderHomeEventList();
    renderEventDetailPage();
    setupHomeEventFilters();
    setupEventForm();
    setupOrganizerDashboard();
    renderStudentRegistrationsPage();
});

function setupEventForm() {
    const form = document.getElementById("event-form");
    const deleteButton = document.getElementById("delete-event-button");

    if (!form) {
        return;
    }

    prepareEventFormPage();

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const currentUser = getCurrentUser();
        const eventId = form["event-id"].value;
        const existingEvent = eventId ? getEventById(eventId) : null;

        if (currentUser.role !== "organizer") {
            showEventFormMessage("Only organizers can save events.", true);
            return;
        }

        if (existingEvent && !userCanManageEvent(existingEvent)) {
            showEventFormMessage("You can only manage your own events.", true);
            return;
        }

        if (form.organizerUsername.value.trim() !== currentUser.username) {
            showInlineError(form.organizerUsername, "Use your current organizer username.");
            showEventFormMessage("You can only manage your own events.", true);
            return;
        }

        if (!validateEventForm(form)) {
            showEventFormMessage("Please fix the highlighted fields.", true);
            return;
        }

        const eventData = getEventFormData(form);
        const savedEvent = existingEvent ? updateEvent(existingEvent.id, eventData) : createEvent(eventData);

        showEventFormMessage("Event saved.", false);
        window.history.replaceState({}, "", "event-form.html?id=" + encodeURIComponent(savedEvent.id));
        prepareEventFormPage();
    });

    form.addEventListener("reset", function () {
        setTimeout(function () {
            prepareEventFormPage();
        }, 0);
    });

    if (deleteButton) {
        deleteButton.addEventListener("click", function () {
            const eventId = form["event-id"].value;
            const eventToDelete = getEventById(eventId);

            if (!eventToDelete || !userCanManageEvent(eventToDelete)) {
                showEventFormMessage("You can only manage your own events.", true);
                return;
            }

            if (window.confirm("Delete this event?")) {
                deleteEvent(eventToDelete.id);
                window.location.href = "organizer.html";
            }
        });
    }
}

function setupOrganizerDashboard() {
    renderOrganizerDashboard();
}
