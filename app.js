let currentDashboard = 1;

async function loadData() {
  const response = await fetch("data_all_dashboards.json");
  return await response.json();
}

function switchDashboard(dashboardNumber) {
  currentDashboard = dashboardNumber;
  renderDashboard();
}

async function renderDashboard() {
  const data = await loadData();
  const container = document.getElementById("dashboard-container");
  container.innerHTML = "";

  if (currentDashboard === 1) {
    const canvas = document.createElement("canvas");
    canvas.id = "chart1";
    container.appendChild(canvas);

    new Chart(canvas, {
      type: "bar",
      data: {
        labels: data.dashboard1.labels,
        datasets: [{
          label: "Inventory Value",
          data: data.dashboard1.values,
          backgroundColor: "#007acc"
        }]
      },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: "Inventory Value by Item Group" } }
      }
    });

  } else if (currentDashboard === 2) {
    const canvas = document.createElement("canvas");
    canvas.id = "chart2";
    container.appendChild(canvas);

    new Chart(canvas, {
      type: "line",
      data: {
        labels: data.dashboard2.dates,
        datasets: [{
          label: "Forecast Accuracy",
          data: data.dashboard2.accuracy,
          borderColor: "green",
          fill: false
        }]
      },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: "Forecast Accuracy Over Time" } }
      }
    });

  } else if (currentDashboard === 3) {
    const canvas = document.createElement("canvas");
    canvas.id = "chart3";
    container.appendChild(canvas);

    new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: data.dashboard3.categories,
        datasets: [{
          label: "Recommendations",
          data: data.dashboard3.counts,
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"]
        }]
      },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: "Strategic Recommendations" } }
      }
    });
  }
}

renderDashboard();

