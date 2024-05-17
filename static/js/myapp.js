// Event listener for updating description box size
$('#time-task-list').on('input', '.description-input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});
// Function to load video list
function loadVideoList() {
    $.get("/video_links", function(data) {
        $('#video-list').empty();
        data.forEach(function(video) {
            $('#video-list').append('<li>' + video.title + ' - ' + video.link + ' <button class="delete-video-link" data-id="' + video.id + '">Delete</button></li>');
        });
    });
}

// Function to load study plan list
function loadStudyPlanList() {
    $.get("/study_plans", function(data) {
        $('#study-plan-list').empty();
        data.forEach(function(plan) {
            var checked = localStorage.getItem('studyPlan-' + plan.id) === 'true' ? 'checked' : '';
            var description = plan.description ? plan.description : '';
            $('#study-plan-list').append('<li>' + plan.title + ' - <input type="text" class="description-input" data-id="' + plan.id + '" value="' + description + '" placeholder="Description"> - <input type="checkbox" class="study-plan-checkbox" data-id="' + plan.id + '" ' + checked + '> - ' + plan.due_date + ' <button class="delete-study-plan" data-id="' + plan.id + '">Delete</button></li>');
        });
    });
}

// Function to load time task list
function loadTimeTaskList() {
    $.get("/time_management", function(data) {
        $('#time-task-list').empty();
        data.forEach(function(task) {
            var checked = localStorage.getItem('timeTask-' + task.id) === 'true' ? 'checked' : '';
            var description = localStorage.getItem('timeTaskDescription-' + task.id) || '';
            $('#time-task-list').append('<li><input type="checkbox" class="time-task-checkbox" data-id="' + task.id + '" ' + checked + '> ' + task.task + ' - <textarea class="description-input" data-id="' + task.id + '" placeholder="Description">' + description + '</textarea> - ' + task.start_time + ' - ' + task.end_time + ' <button class="delete-time-task" data-id="' + task.id + '">Delete</button></li>');
        });

        // Add event listener for updating description box size
        $('#time-task-list').find('textarea').each(function() {
            this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
        }).on('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    });
}


// Function to load weekly reports
function loadReports() {
    fetch('/weekly_reports')
        .then(response => response.json())
        .then(reports => {
            const reportsDiv = document.getElementById('reports');
            reportsDiv.innerHTML = '';
            reports.forEach(report => {
                const reportElement = document.createElement('div');
                reportElement.innerHTML = `
                <h3>${report.week_start} - ${report.week_end}</h3>
                <p>${report.content}</p>
                <button class="delete-weekly-report" data-id="${report.id}">Delete</button>
            `;
                reportsDiv.appendChild(reportElement);
            });
        })
        .catch(error => {
            console.error(error);
            alert('An error occurred, could not load weekly reports.');
        });
}

// Event listener for updating checkbox state
$('#time-task-list').on('click', '.time-task-checkbox', function() {
    var id = $(this).data('id');
    var checked = $(this).prop('checked');
    localStorage.setItem('timeTask-' + id, checked);
});

// Event listener for updating description
$('#time-task-list').on('change', '.description-input', function() {
    var id = $(this).data('id');
    var description = $(this).val();
    console.log('Description:', description); // Log the description value
    localStorage.setItem('timeTaskDescription-' + id, description);

    $.ajax({
        url: '/time_management/' + id,
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({
            description: description
        }),
        success: function(response) {
            console.log(response);
        },
        error: function(xhr, status, error) {
            console.error(error);
        }
    });
});



// Document ready function
$(document).ready(function() {
    // Load video list on page load
    loadVideoList();

    // Load study plan list on page load
    loadStudyPlanList();

    // Load time task list on page load
    loadTimeTaskList();

    // Load weekly reports on page load
    loadWeeklyReports();



    // Event listener for updating completion status
    $('#study-plan-list').on('click', '.study-plan-checkbox', function() {
        var id = $(this).data('id');
        var completed = $(this).prop('checked');
        $.ajax({
            url: '/study_plans/' + id,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ completed: completed }),
            success: function(response) {
                console.log(response);
            },
            error: function(xhr, status, error) {
                console.error(error);
            }
        });
    });

    // Event listener for adding video link
    $('#add-video-form').submit(function(event) {
        event.preventDefault();
        var title = $('#video-title').val();
        var link = $('#video-link').val();
        $.ajax({
            type: "POST",
            url: "/video_links",
            contentType: "application/json",
            data: JSON.stringify({
                title: title,
                link: link
            }),
            success: function(response) {
                console.log(response);
                // Reload the video list
                loadVideoList();
            },
            error: function(xhr, status, error) {
                console.error(error);
            }
        });
    });

    // Event listener for adding study plan
    $('#add-study-plan-form').submit(function(event) {
        event.preventDefault();
        var title = $('#study-plan-title').val();
        var description = $('#study-plan-description').val();
        var dueDate = $('#study-plan-due-date').val();
        $.ajax({
            type: "POST",
            url: "/study_plans",
            contentType: "application/json",
            data: JSON.stringify({
                title: title,
                description: description,
                due_date: dueDate
            }),
            success: function(response) {
                console.log(response);
                // Reload the study plan list
                loadStudyPlanList();
            },
            error: function(xhr, status, error) {
                console.error(error);
            }
        });
    });

    // Event listener for adding time task
    $('#add-time-task-form').submit(function(event) {
        event.preventDefault();
        var task = $('#time-task').val();
        var startTime = $('#time-start').val(); // Updated ID to match HTML
        var endTime = $('#time-end').val(); // Updated ID to match HTML
        $.ajax({
            type: "POST",
            url: "/time_management",
            contentType: "application/json",
            data: JSON.stringify({
                task: task,
                start_time: startTime,
                end_time: endTime
            }),
            success: function(response) {
                console.log(response);
                // Reload the time task list
                loadTimeTaskList();
            },
            error: function(xhr, status, error) {
                console.error(error);
            }
        });
    });

    // Event listener for form submission
    $('#add-report-form').submit(function(event) {
        event.preventDefault();
        var data = {
            week_start: $('#week_start').val(),
            week_end: $('#week_end').val(),
            content: $('#content').val()
        };
        $.ajax({
            type: "POST",
            url: "/weekly_reports",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function(response) {
                alert(response.message);
                loadWeeklyReports(); // Reload the weekly reports
            },
            error: function(xhr, status, error) {
                console.error(error);
            }
        });
    });

    // Event listener for deleting a time management task
    $('#time-task-list').on('click', '.delete-time-task', function() {
        var id = $(this).data('id');
        $.ajax({
            url: '/time_management/' + id,
            type: 'DELETE',
            success: function(response) {
                alert(response.message);
                loadTimeTaskList(); // Reload the time task list
            },
            error: function(error) {
                console.log(error);
                alert('An error occurred, time task could not be deleted.');
            }
        });
    });

    // Event listener for deleting a video link
    $('#video-list').on('click', '.delete-video-link', function() {
        var id = $(this).data('id');
        $.ajax({
            url: '/video_links/' + id,
            type: 'DELETE',
            success: function(response) {
                alert(response.message);
                loadVideoList(); // Reload the video list
            },
            error: function(error) {
                console.log(error);
                alert('An error occurred, video link could not be deleted.');
            }
        });
    });
    // Event listener for deleting a study plan
    $('#study-plan-list').on('click', '.delete-study-plan', function() {
        var id = $(this).data('id');
        $.ajax({
            url: '/study_plans/' + id,
            type: 'DELETE',
            success: function(response) {
                alert(response.message);
                loadStudyPlanList(); // Reload the study plan list
            },
            error: function(error) {
                console.log(error);
                alert('An error occurred, study plan could not be deleted.');
            }
        });
    });


    // Event listener for deleting a weekly report
    $(document).on('click', '.delete-weekly-report', function() {
        var id = $(this).data('id');
        $.ajax({
            url: '/weekly_reports/' + id,
            type: 'DELETE',
            success: function(response) {
                alert(response.message);
                loadReports(); // Reload the reports after deletion
            },
            error: function(error) {
                console.log(error);
                alert('An error occurred, weekly report could not be deleted.');
            }
        });
    });



    let reportsDiv; // Declare reportsDiv globally


    document.addEventListener('DOMContentLoaded', () => {
        const reportForm = document.getElementById('add-report-form');
        reportsDiv = document.getElementById('reports');

        reportForm.addEventListener('submit', event => {
            event.preventDefault();
            const formData = new FormData(reportForm);
            const data = {
                week_start: formData.get('week_start'),
                week_end: formData.get('week_end'),
                content: formData.get('content')
            };
            fetch('/weekly_reports', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                .then(response => response.json())
                .then(result => {
                    alert(result.message);
                    loadReports(); // Reload the reports after adding a new report
                })
                .catch(error => {
                    console.error(error);
                    alert('An error occurred, weekly report could not be added.');
                });
        });

        // Initial load of data
        loadReports();
    });



    // Initial load of data
    loadVideoList();
    loadStudyPlanList();
    loadTimeTaskList();
    loadReports();
});