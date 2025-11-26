/*
  Author: Theodor Farag
  Username: theodorfarag
  Contact: theodor_farag@student.uml.edu
  Date: 2025-10-11
*/
let tabCount = 0;      // For unique tab IDs
let tabNumber = 1;     // For display numbering
let tableData = []

$(document).ready(function () {

  function renderCheckboxList() {
    const list = $("#table-checkbox-list");
    list.empty();
    tableData.forEach(table => {
      list.append(`
        <div class="form-check form-check-inline">
          <input class="form-check-input table-checkbox" type="checkbox" id="cb-${table.id}" data-id="${table.id}">
          <label class="form-check-label" for="cb-${table.id}">${table.label}</label>
        </div>
      `);
    });
  }

function tryCreateTableTab() {
  if (!$("#tableForm").valid()) return;

  const minCol = Number($("#minColumn").val().trim());
  const maxCol = Number($("#maxColumn").val().trim());
  const minRow = Number($("#minRow").val().trim());
  const maxRow = Number($("#maxRow").val().trim());

  // Prevent duplicate tabs for the same range
  const label = `(${minCol}x${maxCol}) to (${minRow}x${maxRow})`;
  let exists = false;
  $("#tabs-list li a").each(function () {
    if ($(this).text() === label) exists = true;
  });
  if (exists) return;

  tabCount++;
  const tabId = "tab-" + tabCount;
    tableData.push({ id: tabId, label, minCol, maxCol, minRow, maxRow });


  // Create the table HTML
  $("#tabs").append(renderTable(minCol, maxCol, minRow, maxRow, tabId));

  // Add new tab header and panel
  $("#tabs-list").append(
    `<li><a href="#${tabId}">${label}</a> <span class="ui-icon ui-icon-close" role="presentation"></span></li>`
  );

  $("#tabs").removeClass("hidden");
  $("#tabs").tabs("refresh");
  $("#tabs").tabs("option", "active", $("#tabs-list li").length - 1);

  renderCheckboxList()
}

// In your makeSlider function, call tryCreateTableTab directly:
function makeSlider(sliderId, displayId) {
  $("#" + sliderId).slider({
    min: -50,
    max: 50,
    slide: function (_e, ui) {
      $("#" + displayId).val(ui.value);
      tryCreateTableTab();
    },
    change: function (_e, ui) {
      $("#" + displayId).val(ui.value);
      tryCreateTableTab();
    },
  });
  const val = $("#" + sliderId).slider("value");
  // $("#" + displayId).val(val);
  $("#" + displayId).on("change keyup", function () {
    const inputVal = parseInt($(this).val(), 10);
    if (!isNaN(inputVal) && inputVal >= -50 && inputVal <= 50) {
      $("#" + sliderId).slider("value", inputVal);
    }
    tryCreateTableTab();
  });
}

  makeSlider("minColumnSlider", "minColumn");
  makeSlider("maxColumnSlider", "maxColumn");
  makeSlider("minRowSlider", "minRow");
  makeSlider("maxRowSlider", "maxRow");

  $("#tabs").tabs();
  // Renders the multiplication table into the DOM.
  // Parameters are numbers (min/max for columns and rows).


  function renderTable(minCol, maxCol, minRow, maxRow, tabId) {


    const table = $(`<div id="${tabId}" class="table-responsive p-0 w-100 primaryColor">
                      <table class="table table-striped text-center m-0 w-100">
                        <thead>
                            <tr id="thead"></tr>
                        </thead>
                        <tbody id="tbody"></tbody>
                      </table>
                    </div>`)

    const tbody = table.find('#tbody');
    const thead = table.find('#thead');


    // Top-left empty corner cell (intersection of header row and header column)
    const th = $("<th>").text("");
    thead.append(th);

    // Header row: create a <th> for each column label
    for (let i = minCol; i <= maxCol; i++) {
      thead.append($("<th>").text(String(i)));
    }

    // Body rows: for each row value, create a row and populate cells
    for (let i = minRow; i <= maxRow; i++) {
      const tr = $("<tr>");
      const th = $("<th>").text(String(i));
      // Row header (first cell of the row)
      tr.append(th);

      // Fill the row with product cells
      for (let j = minCol; j <= maxCol; j++) {
        const td = $("<td>").text(String(j * i));
        tr.append(td);
      }

      // Append the completed row to the table body
      tbody.append(tr);
    }
   
    return table
  }

  // Validate form inputs and show an inline error message if invalid.
  // Use jQuery Validation plugin to validate inputs and handle submit.
  // Add custom method to check that max >= min for pairs of fields
  $.validator.addMethod(
    "gteField",
    function (value, element, param) {
      // If either value is empty or not a number, let other validators handle it
      if (value === undefined || value === null || value === "") return false;
      const current = Number(value);
      const other = Number($(param).val());
      if (isNaN(current) || isNaN(other)) return false;
      return current >= other;
    },
    "This value must be greater than or equal to the related minimum value."
  );
  $.validator.addMethod(
    "lteField",
    function (value, element, param) {
      if (value === undefined || value === null || value === "") return false;
      const current = Number(value);
      const other = Number($(param).val());
      if (isNaN(current) || isNaN(other)) return false;
      return current <= other;
    },
    "This value must be less than or equal to the related maximum value."
  );

  $("#tableForm").validate({
    ignore: [],
    onkeyup: function (element) {
      $(element).valid();
    },
    onfocusout: function (element) {
      $(element).valid();
    },
    rules: {
      minColumn: { required: true, number: true, min: -50, max: 50, lteField: "#maxColumn" },
      maxColumn: { required: true, number: true, min: -50, max: 50, gteField: "#minColumn" },
      minRow: { required: true, number: true, min: -50, max: 50, lteField: "#maxRow" },
      maxRow: { required: true, number: true, min: -50, max: 50, gteField: "#minRow" },
    },
    messages: {
      minColumn: {
         required: "Please enter a minimum column value.",
         number: "Please enter a valid number.",
         min: "Minimum allowed is -50.",
         max: "Maximum allowed is 50.",
         lteField: "Minimum column must be less than or equal to Maximum column."
       },
      maxColumn: {
         required: "Please enter a maximum column value.",
         number: "Please enter a valid number.",
         min: "Minimum allowed is -50.",
         max: "Maximum allowed is 50.",
         gteField: "Maximum column must be greater than or equal to Minimum column.",
       },
      minRow: {
         required: "Please enter a minimum row value.",
         number: "Please enter a valid number.",
         min: "Minimum allowed is -50.",
         max: "Maximum allowed is 50.",
         lteField: "Minimum row must be less than or equal to Maximum row."
       },
      maxRow: {
         required: "Please enter a maximum row value.",
         number: "Please enter a valid number.",
         min: "Minimum allowed is -50.",
         max: "Maximum allowed is 50.",
         gteField: "Maximum row must be greater than or equal to Minimum row.",
       },
    },
    errorClass: "is-invalid",
    validClass: "is-valid",
    errorPlacement: function (error, element) {
      error.addClass("invalid-feedback");
      if (element.next(".invalid-feedback").length === 0) {
        element.after(error);
      }
    },
    highlight: function (element) {
      $(element).addClass("is-invalid").removeClass("is-valid");
    },
    unhighlight: function (element) {
      $(element).removeClass("is-invalid").addClass("is-valid");
    },
  });
  $("#tabs-list").on("click", "span.ui-icon-close", function () {
    const li = $(this).closest("li");
    const panelId = li.find("a").attr("href");
    li.remove();
    $(panelId).remove();
    $("#tabs").tabs("refresh");

    // Renumber tab labels
    $("#tabs-list li").each(function (idx) {
      const a = $(this).find("a");
      // Extract the rest of the label after the first space

    });
    tabNumber = $("#tabs-list li").length + 1;

    // Hide tabs if none remain
    if ($("#tabs-list li").length === 0) {
      $("#tabs").addClass("hidden");
    }
  });

  function removeTableById(ID) {
    tableData = tableData.filter((table) => {
      return table.id !== ID;
    })

    $("#tabs-list li").has(`a[href="#${ID}"]`).remove();
    $(`#${ID}`).remove();
     $("#tabs").tabs("refresh");
    renderCheckboxList();
    // If no tables left, hide everything
    if (tableData.length === 0) {
      $("#tabs").addClass("hidden");
      $("#table-checkbox-list").empty();
    }
  };

  $("#delete-selected").on("click", function () {
    $(".table-checkbox:checked").each(function () {
      const Id = $(this).data("id");
      removeTableById(Id);
    });
  });

  $("#delete-all").on("click", function () {
    tableData = [];
    $("#tabs-list").empty();
    $("#tabs").find(".table-responsive").remove();
    $("#tabs").tabs("refresh");
    $("#tabs").addClass("hidden");
    $("#table-checkbox-list").empty();
  })
});
