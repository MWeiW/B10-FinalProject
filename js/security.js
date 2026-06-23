// Helper functions for safe text handling and input cleanup.

function cleanText(value) {
    return String(value || "").trim().replace(/\s+/g, " ");
}
