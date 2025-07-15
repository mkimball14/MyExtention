tableau.extensions.initializeAsync().then(() => {
    const dashboard = tableau.extensions.dashboardContent.dashboard;
  
    const worksheets = dashboard.worksheets;
    const targetSheet = worksheets[0]; // Change if you want a specific worksheet
  
    targetSheet.getSummaryDataAsync().then((dataTable) => {
      const dataDiv = document.getElementById("data-output");
      dataTable.data.forEach((row) => {
        const values = row.map(cell => cell.formattedValue).join(" | ");
        dataDiv.innerHTML += `<p>${values}</p>`;
      });
    });
  });
  