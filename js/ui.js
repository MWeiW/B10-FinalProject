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
