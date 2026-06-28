// Events and registrations are stored as JSON-strings so they can handle reloading of pages.

const EVENTS_STORAGE_KEY = "htwCampusEvents";
const REGISTRATIONS_STORAGE_KEY = "htwCampusRegistrations";

function makeId(prefix) {
    return prefix + "-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function getCurrentTime() {
    return new Date().toISOString();
}

function readListFromStorage(key) {
    const savedData = localStorage.getItem(key);

    if (!savedData) {
        return [];
    }

    try {
        const parsedData = JSON.parse(savedData);

        if (Array.isArray(parsedData)) {
            return parsedData;
        }
    } catch (error) {
        // Corrupted localStorage should not stop the app from loading.
    }

    localStorage.removeItem(key);
    return [];
}

function hasValidStoredList(key) {
    const savedData = localStorage.getItem(key);

    if (!savedData) {
        return false;
    }

    try {
        return Array.isArray(JSON.parse(savedData));
    } catch (error) {
        return false;
    }
}

function saveListToStorage(key, list) {
    localStorage.setItem(key, JSON.stringify(list));
}

function getSampleEvents() {
    if (typeof sampleEvents === "undefined") {
        return [];
    }

    return sampleEvents;
}

function getSampleRegistrations() {
    if (typeof sampleRegistrations === "undefined") {
        return [];
    }

    return sampleRegistrations;
}


const builtInSampleEventDates = {
    "event-001": "2026-06-28",
    "event-002": "2026-09-25",
    "event-003": "2026-10-02",
    "event-004": "2026-10-09",
    "event-005": "2026-10-23",
    "event-006": "2026-11-06"
};

function normalizeEventNames(events) {
    return events.map(function (event) {
        const normalizedEvent = Object.assign({}, event);

        if (normalizedEvent.department === "Design" || normalizedEvent.department === "Design and Culture") {
            normalizedEvent.department = "Cybersecurity";
        }

        if (normalizedEvent.title === "International Welcome Coffee" || normalizedEvent.title === "International Welcome Coffee for New HTW Students") {
            normalizedEvent.title = "International Welcome Coffee for new HTW students.";
        }

        if (normalizedEvent.description === "A relaxed meeting for international and local students to ask questions and get to know each other." ||
                normalizedEvent.description === "A relaxed meeting for international and new students to ask questions and get to know each other.") {
            normalizedEvent.description = "A relaxed meeting for international and new HTW students to ask questions and get to know each other.";
        }

        if (normalizedEvent.organizerUsername === "career-service") {
            normalizedEvent.organizerUsername = "career-center";
        }

        if (normalizedEvent.id === "event-001" || normalizedEvent.title === "Web Basics") {
            normalizedEvent.organizerUsername = "cs-department";
        }

        if (normalizedEvent.id === "event-003" || normalizedEvent.title === "Study Group Kickoff: Databases") {
            normalizedEvent.organizerUsername = "cs-department";
        }

        if (normalizedEvent.id === "event-004" || normalizedEvent.title === "Cybersecurity Lunch Talk") {
            normalizedEvent.organizerUsername = "cybersecurity-department";
        }

        if (normalizedEvent.id === "event-005" || normalizedEvent.title === "International Welcome Coffee for new HTW students.") {
            normalizedEvent.organizerUsername = "international-office";
        }

        if (normalizedEvent.id === "event-006" || normalizedEvent.title === "Engineering Project Planning Session") {
            normalizedEvent.organizerUsername = "engineering-department";
        }

        if (normalizedEvent.organizerUsername === "engineering-office") {
            normalizedEvent.organizerUsername = "engineering-department";
        }

        if (builtInSampleEventDates[normalizedEvent.id]) {
            normalizedEvent.date = builtInSampleEventDates[normalizedEvent.id];
        }

        return normalizedEvent;
    });
}


function initializeStorage() {
    if (!hasValidStoredList(EVENTS_STORAGE_KEY)) {
        saveEvents(getSampleEvents());
    }

    if (!hasValidStoredList(REGISTRATIONS_STORAGE_KEY)) {
        saveRegistrations(getSampleRegistrations());
    }

    saveEvents(normalizeEventNames(getEvents()));
}

function getEvents() {
    return readListFromStorage(EVENTS_STORAGE_KEY);
}

function saveEvents(events) {
    saveListToStorage(EVENTS_STORAGE_KEY, events);
}

function getEventById(eventId) {
    return getEvents().find(function (event) {
        return event.id === eventId;
    });
}

function createEvent(eventData) {
    const events = getEvents();
    const now = getCurrentTime();
    const newEvent = Object.assign({}, eventData, {
        id: makeId("event"),
        createdAt: now,
        updatedAt: now
    });

    events.push(newEvent);
    saveEvents(events);

    return newEvent;
}

function updateEvent(eventId, updatedData) {
    const events = getEvents();
    const eventIndex = events.findIndex(function (event) {
        return event.id === eventId;
    });

    if (eventIndex === -1) {
        return null;
    }

    events[eventIndex] = Object.assign({}, events[eventIndex], updatedData, {
        id: eventId,
        updatedAt: getCurrentTime()
    });

    saveEvents(events);

    return events[eventIndex];
}

function deleteEvent(eventId) {
    const events = getEvents();
    const remainingEvents = events.filter(function (event) {
        return event.id !== eventId;
    });

    if (remainingEvents.length === events.length) {
        return false;
    }

    saveEvents(remainingEvents);

    // Remove registrations for this event too, so there are no sign-ups without an event.
    const remainingRegistrations = getRegistrations().filter(function (registration) {
        return registration.eventId !== eventId;
    });
    saveRegistrations(remainingRegistrations);

    return true;
}

function getRegistrations() {
    return readListFromStorage(REGISTRATIONS_STORAGE_KEY);
}

function saveRegistrations(registrations) {
    saveListToStorage(REGISTRATIONS_STORAGE_KEY, registrations);
}

function createRegistration(registrationData) {
    const registrations = getRegistrations();
    const now = getCurrentTime();
    const newRegistration = Object.assign({}, registrationData, {
        id: makeId("registration"),
        createdAt: now,
        updatedAt: now
    });

    registrations.push(newRegistration);
    saveRegistrations(registrations);

    return newRegistration;
}

function updateRegistration(registrationId, updatedData) {
    const registrations = getRegistrations();
    const registrationIndex = registrations.findIndex(function (registration) {
        return registration.id === registrationId;
    });

    if (registrationIndex === -1) {
        return null;
    }

    registrations[registrationIndex] = Object.assign({}, registrations[registrationIndex], updatedData, {
        id: registrationId,
        updatedAt: getCurrentTime()
    });

    saveRegistrations(registrations);

    return registrations[registrationIndex];
}

function deleteRegistration(registrationId) {
    const registrations = getRegistrations();
    const remainingRegistrations = registrations.filter(function (registration) {
        return registration.id !== registrationId;
    });

    if (remainingRegistrations.length === registrations.length) {
        return false;
    }

    saveRegistrations(remainingRegistrations);

    return true;
}

function getRegistrationsForEvent(eventId) {
    return getRegistrations().filter(function (registration) {
        return registration.eventId === eventId;
    });
}

function getRegistrationsForStudent(studentUsername) {
    return getRegistrations().filter(function (registration) {
        return registration.studentUsername === studentUsername;
    });
}

function getRegistrationForStudentAndEvent(studentUsername, eventId) {
    return getRegistrations().find(function (registration) {
        return registration.studentUsername === studentUsername && registration.eventId === eventId;
    });
}

function getAvailableSeats(eventId) {
    const event = getEventById(eventId);

    if (!event) {
        return 0;
    }

    const takenSeats = getRegistrationsForEvent(eventId).length;
    const availableSeats = Number(event.capacity) - takenSeats;

    return Math.max(availableSeats, 0);
}

initializeStorage();

const CURRENT_ROLE_STORAGE_KEY = "htwCampusCurrentRole";
const CURRENT_USERNAME_STORAGE_KEY = "htwCampusCurrentUsername";

function getDemoUsersForRole(role) {
    if (role === "student") {
        return typeof demoStudentUsers === "undefined" ? [] : demoStudentUsers;
    }

    if (role === "organizer") {
        return typeof demoOrganizerUsers === "undefined" ? [] : demoOrganizerUsers;
    }

    return [{ username: "guest", name: "Guest" }];
}

function getCurrentUser() {
    const savedRole = localStorage.getItem(CURRENT_ROLE_STORAGE_KEY) || "guest";
    const role = ["guest", "student", "organizer"].includes(savedRole) ? savedRole : "guest";
    const users = getDemoUsersForRole(role);
    const savedUsername = localStorage.getItem(CURRENT_USERNAME_STORAGE_KEY);
    const userExists = users.some(function (user) {
        return user.username === savedUsername;
    });
    const username = userExists ? savedUsername : users[0].username;
    const user = users.find(function (demoUser) {
        return demoUser.username === username;
    });

    return {
        role: role,
        username: username,
        name: user ? user.name : "Guest",
        email: user && user.email ? user.email : "",
        studyProgram: user && user.studyProgram ? user.studyProgram : "",
        semester: user && user.semester ? user.semester : ""
    };
}

function setCurrentUser(role, username) {
    const safeRole = ["guest", "student", "organizer"].includes(role) ? role : "guest";
    const users = getDemoUsersForRole(safeRole);
    const userExists = users.some(function (user) {
        return user.username === username;
    });
    const safeUsername = userExists ? username : users[0].username;

    localStorage.setItem(CURRENT_ROLE_STORAGE_KEY, safeRole);
    localStorage.setItem(CURRENT_USERNAME_STORAGE_KEY, safeUsername);

    return getCurrentUser();
}
