/*
  Author: Theodor Farag
  Username: theodorfarag
  Contact: theodor_farag@student.uml.edu
  Date: 2025-10-11
*/

$(document).ready(function () {
  const thead = document.getElementById("thead");
  const tbody = document.getElementById("tbody");
  const minCol = $("#minColumn");
  const maxCol = $("#maxColumn");
  const minRow = $("#minRow");
  const maxRow = $("#maxRow");

 function makeSlider(sliderId, displayId, hiddenId, initial) {
    $("#" + sliderId).slider({
      min: -50,
      max: 50,
      value: initial,
      slide: function (_e, ui) {
        $("#" + displayId).val(ui.value);
        $("#" + hiddenId).val(ui.value).trigger("change");
      },
      change: function (_e, ui) {
        $("#" + displayId).val(ui.value);
        $("#" + hiddenId).val(ui.value).trigger("change");
      },
    });
    const val = $("#" + sliderId).slider("value");
    $("#" + displayId).val(val);
    $("#" + hiddenId).val(val);
  }

  makeSlider("minColumnSlider", "minColumnDisplay", "minColumn", 0);
  makeSlider("maxColumnSlider", "maxColumnDisplay", "maxColumn", 0);
  makeSlider("minRowSlider", "minRowDisplay", "minRow", 0);
  makeSlider("maxRowSlider", "maxRowDisplay", "maxRow", 0);
  // Renders the multiplication table into the DOM.
  // Parameters are numbers (min/max for columns and rows).
  function renderTable(minCol, minRow, maxCol, maxRow) {
    // Clear any existing table content before building a fresh one
    tbody.innerHTML = "";
    thead.innerHTML = "";

    // Top-left empty corner cell (intersection of header row and header column)
    const th = document.createElement("th");
    th.innerText = "";
    thead.appendChild(th);

    // Header row: create a <th> for each column label
    for (let i = minCol; i <= maxCol; i++) {
      const th = document.createElement("th");
      th.textContent = String(i);
      thead.appendChild(th);
    }

    // Body rows: for each row value, create a row and populate cells
    for (let i = minRow; i <= maxRow; i++) {
      const tr = document.createElement("tr");
      const th = document.createElement("th");
      // Row header (first cell of the row)
      th.innerText = String(i);
      tr.appendChild(th);

      // Fill the row with product cells
      for (let j = minCol; j <= maxCol; j++) {
        const td = document.createElement("td");
        td.textContent = String(j * i);
        tr.appendChild(td);
      }

      // Append the completed row to the table body
      tbody.appendChild(tr);
    }
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
  // Jquery validate function that validates the forms input
  $("#tableForm").validate({
     // we need to validate hidden inputs because sliders write to hidden fields
    ignore: [],
    // validate as the user moves the sliders / interacts
    onkeyup: function (element) {
      $(element).valid();
    },
    onfocusout: function (element) {
      $(element).valid();
    },
    rules: {
      minColumn: { required: true,
        number: true,
        min: -50,
        max: 50,
        lteField: "#maxColumn"
      },
      maxColumn: {
        required: true,
        number: true,
        min: -50,
        max: 50,
        gteField: "#minColumn",
      },
      minRow: { required: true,
        number: true,
        min: -50,
        max: 50,
        lteField: "#maxRow"
      },
      maxRow: {
        required: true,
        number: true,
        min: -50,
        max: 50,
        gteField: "#minRow",
      },
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
        gteField:
          "Maximum column must be greater than or equal to Minimum column.",
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
     // Place the error message right after the input (Bootstrap-friendly)
     error.addClass("invalid-feedback");
      if (element.next(".invalid-feedback").length === 0) {
        element.after(error);
      }
      // Place error after visible display when the input is hidden (slider -> hidden input)
      error.addClass("invalid-feedback");
      if (element.is(":hidden")) {
        const display = $("#" + element.attr("id") + "Display");
        if (display.length) {
          if (display.next(".invalid-feedback").length === 0) display.after(error);
          return;
        }
      }
      if (element.next(".invalid-feedback").length === 0) {
        element.after(error);
      }
    },
    highlight: function (element) {
      $(element).addClass("is-invalid").removeClass("is-valid");
      // highlight visible display for hidden fields (so slider shows invalid state)
      const $el = $(element).is(":hidden") ? $("#" + $(element).attr("id") + "Display") : $(element);
      $el.addClass("is-invalid").removeClass("is-valid");
    },
    unhighlight: function (element) {
      $(element).removeClass("is-invalid").addClass("is-valid");
      // remove any inline alert error message if present
      $("#errorMsg").addClass("d-none").text("");
      const $el = $(element).is(":hidden") ? $("#" + $(element).attr("id") + "Display") : $(element);
      $el.removeClass("is-invalid").addClass("is-valid");
      // remove any inline alert error message if present
      $("#errorMsg").addClass("d-none").text("");
    },
    submitHandler: function (formElement) {
      // Values are valid — render table
      const a = Number(minCol.val().trim());
      const b = Number(maxCol.val().trim());
      const c = Number(minRow.val().trim());
      const d = Number(maxRow.val().trim());
      renderTable(a, c, b, d);
    },
  });
});
