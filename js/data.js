// Starter data for the HTW Campus Event and Workshop Hub.
// The objects here are also mirrored in data/events.json for AJAX-style loading later.

const departments = [
    "Computer Science",
    "Business",
    "Cybersecurity",
    "Engineering",
    "Career Service",
    "International Office"
];

const categories = [
    "Workshop",
    "Lecture",
    "Career",
    "Social",
    "Information Session",
    "Academic Support"
];

const sampleEvents = [
    {
        id: "event-001",
        title: "Web Basics",
        department: "Computer Science",
        category: "Workshop",
        date: "2026-06-18",
        time: "14:00",
        location: "Building C, Room 301",
        capacity: 24,
        description: "A practical workshop about writing HTML that is easier to use with keyboards and screen readers.",
        organizerUsername: "cs-organizer",
        createdAt: "2026-05-30T10:15:00Z",
        updatedAt: "2026-05-30T10:15:00Z"
    },
    {
        id: "event-002",
        title: "Campus Career Evening",
        department: "Career Service",
        category: "Career",
        date: "2026-06-23",
        time: "17:30",
        location: "Main Hall, Treskowallee Campus",
        capacity: 80,
        description: "Students meet alumni and local companies for short talks, questions, and networking.",
        organizerUsername: "career-service",
        createdAt: "2026-06-01T09:00:00Z",
        updatedAt: "2026-06-03T12:30:00Z"
    },
    {
        id: "event-003",
        title: "Study Group Kickoff: Databases",
        department: "Computer Science",
        category: "Academic Support",
        date: "2026-06-30",
        time: "16:00",
        location: "Library Study Room 2",
        capacity: 18,
        description: "An open study session for students preparing for database and software architecture exams.",
        organizerUsername: "cs-organizer",
        createdAt: "2026-06-04T14:20:00Z",
        updatedAt: "2026-06-04T14:20:00Z"
    },
    {
        id: "event-004",
        title: "Cybersecurity Lunch Talk",
        department: "Cybersecurity",
        category: "Lecture",
        date: "2026-07-02",
        time: "12:15",
        location: "Building G, Room 110",
        capacity: 45,
        description: "A short guest lecture about everyday security habits for students and project teams.",
        organizerUsername: "security-lab",
        createdAt: "2026-06-06T08:45:00Z",
        updatedAt: "2026-06-06T08:45:00Z"
    },
    {
        id: "event-005",
        title: "International Welcome Coffee",
        department: "International Office",
        category: "Social",
        date: "2026-07-08",
        time: "10:00",
        location: "Student Service Center",
        capacity: 35,
        description: "A relaxed meeting for international and local students to ask questions and get to know each other.",
        organizerUsername: "international-office",
        createdAt: "2026-06-08T11:10:00Z",
        updatedAt: "2026-06-08T11:10:00Z"
    },
    {
        id: "event-006",
        title: "Engineering Project Planning Session",
        department: "Engineering",
        category: "Information Session",
        date: "2026-07-14",
        time: "15:00",
        location: "Building A, Room 204",
        capacity: 30,
        description: "An introduction to planning small semester projects, splitting tasks, and documenting team decisions.",
        organizerUsername: "engineering-office",
        createdAt: "2026-06-10T13:25:00Z",
        updatedAt: "2026-06-10T13:25:00Z"
    }
];

const sampleRegistrations = [
    {
        id: "registration-001",
        eventId: "event-001",
        studentUsername: "student-lina",
        studentName: "Lina Becker",
        studentEmail: "lina.becker@student.htw-berlin.de",
        studyProgram: "International Media and Computing",
        semester: 2,
        note: "I use keyboard navigation often and want to learn better HTML patterns.",
        createdAt: "2026-06-05T15:40:00Z",
        updatedAt: "2026-06-05T15:40:00Z"
    },
    {
        id: "registration-002",
        eventId: "event-002",
        studentUsername: "student-omar",
        studentName: "Omar Khalil",
        studentEmail: "omar.khalil@student.htw-berlin.de",
        studyProgram: "Business Administration",
        semester: 4,
        note: "Interested in internships for the winter semester.",
        createdAt: "2026-06-07T09:15:00Z",
        updatedAt: "2026-06-07T09:15:00Z"
    }
];
