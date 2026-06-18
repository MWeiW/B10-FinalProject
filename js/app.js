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

document.addEventListener("DOMContentLoaded", function () {
    initializeStorage();
    renderHomeEventList();
    setupHomeEventFilters();
});
