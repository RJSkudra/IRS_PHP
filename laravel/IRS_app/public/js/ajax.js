function submitForm() {
    $.ajax({
        url: $("#userForm").attr('action'),
        type: "POST",
        data: $("#userForm").serialize(),
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        success: function(response) {
            // Clear form inputs
            $("#userForm")[0].reset();
            
            // Reset validation states
            $(".error-message").empty();
            
            // Disable submit button and reset its style
            const submitButton = $(".submit-button");
            submitButton.prop("disabled", true);
            submitButton.css({
                "background-color": "#ccc",
                "cursor": "not-allowed"
            });
            
            // Show success message
            const messageDiv = $("<div>").addClass("message success").text(response.success);
            $(".form-container").prepend(messageDiv);
            
            // Auto-remove message after 3 seconds
            setTimeout(function() {
                messageDiv.fadeOut(500, function() {
                    $(this).remove();
                });
            }, 3000);
            
            // Refresh table with latest data
            refreshTable();
        },
        error: function(response) {
            console.error("Error submitting form:", response);
        }
    });
}

function deleteEntry(id) {
    $.ajax({
        url: `/delete/${id}`,
        type: "POST",
        data: {
            "_token": $('meta[name="csrf-token"]').attr('content'),
            "_method": "DELETE" // Laravel uses this to simulate DELETE method
        },
        success: function(response) {
            // Show success message
            const messageDiv = $("<div>").addClass("message success").text(response.success);
            $(".form-container").prepend(messageDiv);
            
            // Auto-remove message after 3 seconds
            setTimeout(function() {
                messageDiv.fadeOut(500, function() {
                    $(this).remove();
                });
            }, 3000);
            
            // Refresh table
            refreshTable();
        },
        error: function(response) {
            console.error("Error deleting entry:", response);
            
            // Show error message
            const messageDiv = $("<div>").addClass("message error").text("Error deleting entry");
            $(".form-container").prepend(messageDiv);
            
            // Auto-remove message after 3 seconds
            setTimeout(function() {
                messageDiv.fadeOut(500, function() {
                    $(this).remove();
                });
            }, 3000);
            
            // Still refresh the table in case the deletion actually succeeded
            refreshTable();
        }
    });
}

function deleteAllEntries() {
    $.ajax({
        url: $("#deleteAllForm").attr('action'),
        type: "POST",
        data: $("#deleteAllForm").serialize(),
        success: function(response) {
            if (response.success) {
                // Show success message
                const messageDiv = $("<div>").addClass("message success").text(response.success);
                $(".form-container").prepend(messageDiv);
                
                // Auto-remove message after 3 seconds
                setTimeout(function() {
                    messageDiv.fadeOut(500, function() {
                        $(this).remove();
                    });
                }, 3000);
                
                // Refresh table
                refreshTable();
            }
        },
        error: function(response) {
            console.error("Error deleting all entries:", response);
        }
    });
}

let lastId = null;

function updateView() {
    console.log("Checking for new entries");
    $.get("/latest-entry-id", function(response) {
        if (response.latestId !== lastId) {
            // New entry in DB, refresh the table
            console.log("Entry found! Refreshing table");
            lastId = response.latestId;
            refreshTable();
        }
    });
}

// Poll the server every 10 seconds
setInterval(updateView, 10000);

function refreshTable() {
    $.ajax({
        url: window.location.href,
        type: "GET",
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        success: function(response) {
            console.log("Table refresh response:", response.substring(0, 200) + "...");
            $("#usersTableBody").html(response);
            toggleTableVisibility();
        },
        error: function(response) {
            console.error("Error refreshing table:", response);
        }
    });
}

function toggleTableVisibility() {
    const tableBody = document.querySelector('#usersTableBody');
    const rows = tableBody ? tableBody.querySelectorAll('tr') : [];
    const table = document.querySelector('.users-table');
    const heading = document.querySelector('h2');
    const deleteAllBtnContainer = document.querySelector('.delete-all-button')?.closest('.button-group');

    console.log(`Table visibility check: ${rows.length} rows found`);

    if (rows.length === 0) {
        if (table) table.style.display = 'none';
        if (heading) heading.style.display = 'none';
        if (deleteAllBtnContainer) deleteAllBtnContainer.style.display = 'none';
    } else {
        if (table) table.style.display = 'table';
        if (heading) heading.style.display = 'block';
        if (deleteAllBtnContainer) deleteAllBtnContainer.style.display = 'flex';
    }
}

// Event delegation for delete buttons
$(document).on('click', '.delete-button', function(e) {
    e.preventDefault();
    const form = $(this).closest('form');
    const url = form.attr('action');
    const id = url.split('/').pop();

    deleteEntry(id);
});

$(document).ready(function() {
    // Initial check for table visibility
    toggleTableVisibility();
    refreshTable()
});