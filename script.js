tableau.extensions.initializeAsync().then(function() {
  let worksheetNames = tableau.extensions.dashboardContent.dashboard.worksheets.map(ws => ws.name);
  document.getElementById("data-output").innerHTML = "Worksheets: <br>" + worksheetNames.join("<br>");
}, function(err) {
  document.getElementById("data-output").innerText = "Extension error: " + err.message;
});
