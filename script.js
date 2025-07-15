let dashboard, worksheets, selectedWorksheet, chart;

tableau.extensions.initializeAsync().then(() => {
  dashboard = tableau.extensions.dashboardContent.dashboard;
  worksheets = dashboard.worksheets;

  // Populate worksheet dropdown
  let wsSelect = document.getElementById("worksheet-select");
  worksheets.forEach(ws => {
    let option = document.createElement("option");
    option.value = ws.name;
    option.text = ws.name;
    wsSelect.appendChild(option);
  });

  wsSelect.addEventListener("change", onWorksheetChange);
  onWorksheetChange(); // Initialize first worksheet
}).catch(err => {
  document.getElementById("msg").innerText = "Tableau extension error: " + err.message;
});

function onWorksheetChange() {
  let wsName = document.getElementById("worksheet-select").value;
  selectedWorksheet = worksheets.find(ws => ws.name === wsName);
  selectedWorksheet.getSummaryDataAsync().then(sumData => {
    let columns = sumData.columns.map(col => col.fieldName);

    // Populate label and value field dropdowns
    let labelSelect = document.getElementById("label-select");
    let valueSelect = document.getElementById("value-select");
    labelSelect.innerHTML = "";
    valueSelect.innerHTML = "";

    columns.forEach(col => {
      let opt1 = document.createElement("option");
      opt1.value = col; opt1.text = col;
      labelSelect.appendChild(opt1);
      let opt2 = document.createElement("option");
      opt2.value = col; opt2.text = col;
      valueSelect.appendChild(opt2);
    });

    // Default to first and second columns
    labelSelect.selectedIndex = 0;
    valueSelect.selectedIndex = 1;

    labelSelect.addEventListener("change", drawChart);
    valueSelect.addEventListener("change", drawChart);

    drawChart();
  }).catch(err => {
    document.getElementById("msg").innerText = "Error loading worksheet data: " + err.message;
  });
}

function drawChart() {
  selectedWorksheet.getSummaryDataAsync().then(sumData => {
    let labelField = document.getElementById("label-select").value;
    let valueField = document.getElementById("value-select").value;

    let labelIdx = sumData.columns.findIndex(col => col.fieldName === labelField);
    let valueIdx = sumData.columns.findIndex(col => col.fieldName === valueField);

    let labels = [];
    let values = [];

    sumData.data.forEach(row => {
      labels.push(row[labelIdx].formattedValue);
      values.push(Number(row[valueIdx].value));
    });

    // Remove old chart if exists
    if (chart) chart.destroy();

    let ctx = document.getElementById("pie-chart").getContext("2d");
    chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: values
        }]
      }
    });
  }).catch(err => {
    document.getElementById("msg").innerText = "Error drawing chart: " + err.message;
  });
}
