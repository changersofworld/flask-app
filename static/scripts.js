// Function to load weekly reports
function loadWeeklyReports() {
    $.get("/weekly_reports", function(data) {
        $('#reports').empty();
        data.forEach(function(report) {
            $('#reports').append('<div><strong>Week Start:</strong> ' + report.week_start + '</div>');
            $('#reports').append('<div><strong>Week End:</strong> ' + report.week_end + '</div>');
            $('#reports').append('<div><strong>Content:</strong> ' + report.content + '</div>');
            $('#reports').append('<hr>');
        });
    });
}

// Event listener for form submission
$('#add-report-form').submit(function(event) {
    event.preventDefault();
    var formData = {
        week_start: $('#week_start').val(),
        week_end: $('#week_end').val(),
        content: $('#content').val()
    };
    $.post("/weekly_reports", formData, function(response) {
        alert(response.message);
        loadWeeklyReports(); // Reload the weekly reports
    });
});

// Document ready function
$(document).ready(function() {
    // Load weekly reports on page load
    loadWeeklyReports();
});