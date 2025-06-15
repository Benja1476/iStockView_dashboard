let rawData = null;
let currentDashboard = "StrategicInventoryHealthRisk";
let currentDate = null;
let chartInstances = [];

const dashboardSelect = document.getElementById("dashboardSelect");
const dateSelect = document.getElementById("dateSelect");
const dashboardContainer = document.getElementById("dashboardContainer");
const refreshBtn = document.getElementById("refreshBtn");

// โหลดข้อมูล JSON
async function loadData() {
  try {
    const resp = await fetch("data_all_dashboards.json");
    rawData = await resp.json();
  } catch (error) {
    alert("โหลดข้อมูลล้มเหลว: " + error);
  }
}

// สร้างตัวเลือกวันที่จากข้อมูล
function populateDates() {
  dateSelect.innerHTML = "";
  if (!rawData || !rawData.dates || rawData.dates.length === 0) return;

  rawData.dates.forEach((date) => {
    const option = document.createElement("option");
    option.value = date;
    option.textContent = date;
    dateSelect.appendChild(option);
  });
  currentDate = rawData.dates[0];
  dateSelect.value = currentDate;
}

// เคลียร์กราฟเดิม
function clearCharts() {
  chartInstances.forEach(chart => chart.destroy());
  chartInstances = [];
  dashboardContainer.innerHTML = "";
}

// สร้างกราฟตามข้อมูล dashboard และวันที่ที่เลือก
function createCharts() {
  clearCharts();

  if (!rawData || !rawData[currentDashboard] || !rawData[currentDashboard][currentDate]) {
    dashboardContainer.innerHTML = `<p>ไม่มีข้อมูลสำหรับวันที่เลือก</p>`;
    return;
  }

  const dataSet = rawData[currentDashboard][currentDate];

  dataSet.forEach((chartData, idx) => {
    const card = document.createElement("div");
    card.classList.add("card");

    const title = document.createElement("h3");
    title.textContent = chartData.title;
    card.appendChild(title);

    const canvas = document.createElement("canvas");
    canvas.id = `chart-${idx}`;
    card.appendChild(canvas);

    dashboardContainer.appendChild(card);

    const ctx = canvas.getContext("2d");

    const config = {
      type: chartData.type,
      data: {
        labels: chartData.labels,
        datasets: [{
          label: chartData.title,
          data: chartData.data,
          backgroundColor: generateColors(chartData.data.length),
          borderColor: chartData.type === "line" ? "#003366" : undefined,
          borderWidth: chartData.type === "line" ? 2 : 0,
          fill: chartData.type === "line" ? false : true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: "bottom" },
          title: { display: false }
        },
        scales: chartData.type === "pie" || chartData.type === "doughnut" ? {} : {
          y: { beginAtZero: true }
        }
      }
    };

    const chart = new Chart(ctx, config);
    chartInstances.push(chart);
  });
}

function generateColors(count) {
  const baseColors = [
    "#003f5c", "#58508d", "#bc5090", "#ff6361", "#ffa600",
    "#008080", "#4b0082", "#d2691e", "#20b2aa", "#708090"
  ];
  let colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
}

// event listener
dashboardSelect.addEventListener("change", () => {
  currentDashboard = dashboardSelect.value;
  createCharts();
});

dateSelect.addEventListener("change", () => {
  currentDate = dateSelect.value;
  createCharts();
});

refreshBtn.addEventListener("click", () => {
  createCharts();
});

// เริ่มทำงาน
async function init() {
  await loadData();
  populateDates();
  createCharts();
}

init();
