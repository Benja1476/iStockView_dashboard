const dashboardSelect = document.getElementById("dashboardSelect");
const dateSelect = document.getElementById("dateSelect");
const chartsContainer = document.getElementById("chartsContainer");

let dataJSON = null;
let chartInstances = [];

// โหลดข้อมูล JSON
async function loadData() {
  try {
    const response = await fetch("data_all_dashboards.json");
    dataJSON = await response.json();
    populateDateSelect();
    updateDashboard();
  } catch (error) {
    console.error("โหลดข้อมูลล้มเหลว:", error);
    chartsContainer.innerHTML = "<p>ไม่สามารถโหลดข้อมูลได้</p>";
  }
}

// เติม selector วันที่ จากข้อมูล
function populateDateSelect() {
  if (!dataJSON || !dataJSON.dates) return;

  dateSelect.innerHTML = "";
  dataJSON.dates.forEach(date => {
    const option = document.createElement("option");
    option.value = date;
    option.textContent = date;
    dateSelect.appendChild(option);
  });
}

// ล้างกราฟเดิม
function clearCharts() {
  chartInstances.forEach(chart => chart.destroy());
  chartInstances = [];
  chartsContainer.innerHTML = "";
}

// สร้างกราฟใหม่ตามข้อมูล
function createCharts(dashboardKey, date) {
  clearCharts();

  if (!dataJSON[dashboardKey] || !dataJSON[dashboardKey][date]) {
    chartsContainer.innerHTML = "<p>ไม่มีข้อมูลสำหรับ Dashboard หรือ วันที่นี้</p>";
    return;
  }

  const chartsData = dataJSON[dashboardKey][date];

  chartsData.forEach(chartData => {
    const card = document.createElement("div");
    card.className = "chart-card";

    const title = document.createElement("h3");
    title.textContent = chartData.title;
    card.appendChild(title);

    const canvas = document.createElement("canvas");
    card.appendChild(canvas);
    chartsContainer.appendChild(card);

    const ctx = canvas.getContext("2d");

    // สร้าง chart ด้วย Chart.js
    const chart = new Chart(ctx, {
      type: chartData.type,
      data: {
        labels: chartData.labels,
        datasets: [{
          label: chartData.title,
          data: chartData.data,
          backgroundColor: generateColors(chartData.data.length, chartData.type),
          borderColor: chartData.type === "line" ? "rgba(0,0,0,0.1)" : undefined,
          borderWidth: chartData.type === "line" ? 2 : 1,
          fill: chartData.type === "line" ? false : true,
          tension: chartData.type === "line" ? 0.3 : 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: "bottom" },
          title: { display: false }
        },
        scales: chartData.type === "pie" || chartData.type === "doughnut" ? {} : {
          y: {
            beginAtZero: true,
          }
        }
      }
    });

    chartInstances.push(chart);
  });
}

// สร้างสีสุ่มสำหรับกราฟ Pie, Bar
function generateColors(count, chartType) {
  const baseColors = [
    "#4e79a7", "#f28e2b", "#e15759", "#76b7b2",
    "#59a14f", "#edc949", "#af7aa1", "#ff9da7",
    "#9c755f", "#bab0ab"
  ];
  let colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  // สำหรับ line chart ใช้สีเดียวสวย ๆ
  if (chartType === "line") return "#4e79a7";
  return colors;
}

// อัพเดตกราฟเมื่อเปลี่ยน Dashboard หรือ Date
function updateDashboard() {
  const selectedDashboard = dashboardSelect.value;
  const selectedDate = dateSelect.value;
  createCharts(selectedDashboard, selectedDate);
}

// ตั้งให้รีเฟรชทุก 5 นาที (300000 ms)
setInterval(() => {
  updateDashboard();
}, 300000);

// event listener
dashboardSelect.addEventListener("change", () => {
  populateDateSelect(); // กรณีข้อมูลวันที่เปลี่ยนตาม dashboard (ในนี้ใช้ static แต่เผื่อไว้)
  updateDashboard();
});

dateSelect.addEventListener("change", updateDashboard);

window.addEventListener("load", loadData);
