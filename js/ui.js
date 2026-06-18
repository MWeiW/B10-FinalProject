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

function renderHomeEventList() {
    const eventSection = document.getElementById("featured-events");

    if (!eventSection) {
        return;
    }

    const events = getEvents();

    eventSection.querySelectorAll("article").forEach(function (article) {
        article.remove();
    });

    if (events.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "No events are available right now.";
        eventSection.appendChild(emptyMessage);
        return;
    }

    events.forEach(function (event) {
        eventSection.appendChild(createEventCard(event));
    });
}
