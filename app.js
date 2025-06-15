let rawData = null;

const selectDate = document.getElementById("selectDate");
const selectDashboard = document.getElementById("selectDashboard");
const dashboardContent = document.getElementById("dashboardContent");

let currentCharts = [];

async function loadData() {
  const response = await fetch("data_all_dashboards.json");
  rawData = await response.json();

  // เติม dropdown วันที่
  rawData.dates.forEach(date => {
    const option = document.createElement("option");
    option.value = date;
    option.textContent = date;
    selectDate.appendChild(option);
  });

  // ตั้งค่าเริ่มต้นวันที่เป็นตัวแรก
  selectDate.value = rawData.dates[0];

  updateDashboard();
}

function clearDashboard() {
  dashboardContent.innerHTML = "";
  // ทำลาย chart เก่า
  currentCharts.forEach(chart => chart.destroy());
  currentCharts = [];
}

function updateDashboard() {
  clearDashboard();
  const selectedDate = selectDate.value;
  const selectedDashboard = selectDashboard.value;

  if (!rawData || !rawData.dashboards[selectedDashboard]) return;

  const data = rawData.dashboards[selectedDashboard][selectedDate];

  if (!data) {
    dashboardContent.textContent = "ไม่มีข้อมูลสำหรับวันที่นี้";
    return;
  }

  if (selectedDashboard === "inventoryHealth") {
    createInventoryHealthDashboard(data);
  } else if (selectedDashboard === "planningAccuracy") {
    createPlanningAccuracyDashboard(data);
  } else if (selectedDashboard === "strategicAction") {
    createStrategicActionDashboard(data);
  }
}

function createInventoryHealthDashboard(data) {
  // ABC Pie Chart
  createPieChart("ABC Classification", data.abc);

  // FSN Pie Chart
  createPieChart("FSN Classification", data.fsn);

  // Turnover Line Chart
  createLineChart("Inventory Turnover (times)", data.turnover);

  // DOI Line Chart
  createLineChart("Days of Inventory (DOI)", data.doi);
}

function createPlanningAccuracyDashboard(data) {
  // Accuracy Line Chart
  createLineChart("Planning Accuracy (%)", data.accuracy);

  // Demand Risk Pie Chart
  createPieChart("Demand Risk", data.demandRisk);
}

function createStrategicActionDashboard(data) {
  // Executive Scorecard Pie Chart
  createPieChart("Executive Scorecard", data.scorecard);
}

function createPieChart(title, dataObj) {
  const container = document.createElement("div");
  container.className = "chart-container";
  const canvas = document.createElement("canvas");
  container.appendChild(canvas);
  dashboardContent.appendChild(container);

  const labels = Object.keys(dataObj);
  const values = Object.values(dataObj);

  const chart = new Chart(canvas.getContext("2d"), {
    type: "pie",
    data: {
      labels,
      datasets: [{
        label: title,
        data: values,
        backgroundColor: generateColors(labels.length),
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        },
        title: {
          display: true,
          text: title,
          font: { size: 18 }
        }
      }
    }
  });

  currentCharts.push(chart);
}

function createLineChart(title, dataArr) {
  const container = document.createElement("div");
  container.className = "chart-container";
  const canvas = document.createElement("canvas");
  container.appendChild(canvas);
  dashboardContent.appendChild(container);

  // สร้าง label แบบตัวเลข 1,2,3,... หรืออาจปรับเป็นเดือน
  const labels = dataArr.map((_, i) => `Point ${i+1}`);

  const chart = new Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: title,
        data: dataArr,
        fill: false,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.4)",
        tension: 0.3,
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
        title: {
          display: true,
          text: title,
          font: { size: 18 }
        }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  currentCharts.push(chart);
}

function generateColors(count) {
  const baseColors = [
    "#007bff", "#28a745", "#dc3545",
    "#ffc107", "#17a2b8", "#6f42c1",
    "#fd7e14", "#20c997"
  ];
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
}

// Event listeners
selectDate.addEventListener("change", updateDashboard);
selectDashboard.addEventListener("change", updateDashboard);

loadData();
