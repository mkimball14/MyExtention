let dashboard, worksheets, selectedWorksheet, chart;
let lastLabelField = '', lastValueField = '';

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
  document.getElementById("label-select").addEventListener("change", updateChart);
  document.getElementById("value-select").addEventListener("change", updateChart);
  document.getElementById("chart-type").addEventListener("change", updateChart);
  document.getElementById("user-title").addEventListener("input", updateTitle);

  onWorksheetChange(); // Initialize first worksheet
}).catch(err => {
  document.getElementById("msg").innerText = "Tableau extension error: " + err.message;
});

function onWorksheetChange() {
  let wsName = document.getElementById("worksheet-select").value;
  selectedWorksheet = worksheets.find(ws => ws.name === wsName);
  selectedWorksheet.getSummaryDataAsync().then(sumData => {
    let columns = sumData.columns.map(col => col.fieldName);
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

    // Try to keep last-used fields if available
    if (lastLabelField && columns.includes(lastLabelField))
      labelSelect.value = lastLabelField;
    if (lastValueField && columns.includes(lastValueField))
      valueSelect.value = lastValueField;

    updateChart();
  }).catch(err => {
    document.getElementById("msg").innerText = "Error loading worksheet data: " + err.message;
  });
}

function updateChart() {
  if (!selectedWorksheet) return;
  let labelField = document.getElementById("label-select").value;
  let valueField = document.getElementById("value-select").value;
  lastLabelField = labelField; lastValueField = valueField;

  let chartType = document.getElementById("chart-type").value;

  selectedWorksheet.getSummaryDataAsync().then(sumData => {
    let labelIdx = sumData.columns.findIndex(col => col.fieldName === labelField);
    let valueIdx = sumData.columns.findIndex(col => col.fieldName === valueField);

    let labels = [], values = [];
    sumData.data.forEach(row => {
      labels.push(row[labelIdx].formattedValue);
      values.push(Number(row[valueIdx].value));
    });

    // Remove old chart if exists
    if (chart) chart.destroy();

    let ctx = document.getElementById("pie-chart").getContext("2d");
    let bgColors = [
      "#4472c4","#ed7d31","#a5a5a5","#ffc000","#5b9bd5","#70ad47",
      "#264478","#9e480e","#636365","#987300","#255e91","#43682b"
    ];
    while (bgColors.length < labels.length) {
      bgColors = bgColors.concat(bgColors); // Repeat colors if needed
    }

    let chartOptions = {
      responsive: true,
      plugins: {
        legend: { display: true, position: 'bottom' },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.label || '';
              let val = context.parsed;
              let sum = values.reduce((a, b) => a + b, 0);
              let pct = sum ? ((val / sum) * 100).toFixed(1) : 0;
              return `${label}: ${val} (${pct}%)`;
            }
          }
        }
      }
    };

    if (chartType === "bar") {
      chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [{
            label: valueField,
            data: values,
            backgroundColor: bgColors.slice(0, labels.length)
          }]
        },
        options: chartOptions
      });
    } else {
      chart = new Chart(ctx, {
        type: chartType,
        data: {
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: bgColors.slice(0, labels.length)
          }]
        },
        options: chartOptions
      });
    }
    updateTitle();
    document.getElementById("msg").innerText = "";
    document.getElementById("subtitle").innerText = `Showing ${chartType.charAt(0).toUpperCase()+chartType.slice(1)} of "${valueField}" by "${labelField}"`;
  }).catch(err => {
    document.getElementById("msg").innerText = "Error drawing chart: " + err.message;
  });
}

function updateTitle() {
  document.getElementById("main-title").innerText = document.getElementById("user-title").value;
}
