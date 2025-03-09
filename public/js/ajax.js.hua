// iesūta ievadītos datus
function submitForm() {
    $.ajax({
        url: $("#userForm").attr('action'),
        type: "POST",
        data: $("#userForm").serialize(),
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        success: function(response) {
            $("#userForm")[0].reset();
            
            $(".error-message").empty();
            
            // Pēc veiksmīgas datu iesniegšanas padara iesniegšanas pogu neatkīvu
            const submitButton = $(".submit-button");
            submitButton.prop("disabled", true);
            submitButton.css({
                "background-color": "#ccc",
                "cursor": "not-allowed"
            });
            
            const messageDiv = $("<div>").addClass("message success").text(response.success);
            $(".form-container").prepend(messageDiv);
            
            setTimeout(function() {
                messageDiv.fadeOut(500, function() {
                    $(this).remove();
                });
            }, 3000);
            
            refreshTable();
        },
        error: function(response) {
            console.error("Error submitting form:", response);
        }
    });
}
// funkcija, kas dzēš ierakstu pēc id priekš dzēšanas pogas
// izmanto POST, lai sūtītu laravel pieprasījumu dzēst konkrētu ID
// delete route ir definēts web.php failā
function deleteEntry(id) {
    $.ajax({
        url: `/delete/${id}`,
        type: "POST",
        data: {
            "_token": $('meta[name="csrf-token"]').attr('content'),
            "_method": "DELETE" 
        },
        success: function(response) {

            const messageDiv = $("<div>").addClass("message success").text(response.success);
            $(".form-container").prepend(messageDiv);
            

            setTimeout(function() {
                messageDiv.fadeOut(500, function() {
                    $(this).remove();
                });
            }, 3000);
            
            refreshTable();
        },
        error: function(response) {
            console.error("Error deleting entry:", response);
            
            const messageDiv = $("<div>").addClass("message error").text("Error deleting entry");
            $(".form-container").prepend(messageDiv);
            
            setTimeout(function() {
                messageDiv.fadeOut(500, function() {
                    $(this).remove();
                });
            }, 3000);
            refreshTable();
        }
    });
}
// dzēš visus ierakstus ar vienu pogu
// izmanto POST, lai sūtītu laravel pieprasījumu dzēst visus ierakstus
// delete route ir definēts web.php failā
function deleteAllEntries() {
    $.ajax({
        url: $("#deleteAllForm").attr('action'),
        type: "POST",
        data: $("#deleteAllForm").serialize(),
        success: function(response) {
            if (response.success) {
                const messageDiv = $("<div>").addClass("message success").text(response.success);
                $(".form-container").prepend(messageDiv);
                setTimeout(function() {
                    messageDiv.fadeOut(500, function() {
                        $(this).remove();
                    });
                }, 3000);
                refreshTable();
            }
        },
        error: function(response) {
            console.error("Error deleting all entries:", response);
        }
    });
}

let lastId = null;
// automātiski atjauno tabulu, ja kāds cits ir pievienojis jaunu ierakstu
function updateView() {
    console.log("Checking for new entries");
    $.get("/latest-entry-id", function(response) {
        if (response.latestId !== lastId) {
            console.log("Entry found! Refreshing table");
            lastId = response.latestId;
            refreshTable();
        }
    });
}

// Atjauno tabulu ik pēc 10 sekundēm
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
            // Ievieto table.blade.php lapas HTML
            $("#usersTableBody").html(response);
            toggleTableVisibility();
        },
        error: function(response) {
            console.error("Error refreshing table:", response);
        }
    });
}
// parbauda vai tabula ir tukša, ja ir, tad paslēpj to
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


$(document).on('click', '.delete-button', function(e) {
    e.preventDefault();
    const form = $(this).closest('form');
    const url = form.attr('action');
    const id = url.split('/').pop();

    deleteEntry(id);
});
// paslēpj tabulu, ja tā ir tukša un atvērs to, ja tajā ir ieraksti
$(document).ready(function() {
    toggleTableVisibility();
    refreshTable()
});