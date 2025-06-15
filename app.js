// ตัวอย่าง data_all_dashboards.json (ย่อมา)
const data_all_dashboards = {
  "dashboard1": {
    "chart1": [
      {"date": "2025-06-01", "labels": ["A","B","C"], "data": [10,20,30]},
      {"date": "2025-06-02", "labels": ["A","B","C"], "data": [15,25,35]},
      {"date": "2025-06-03", "labels": ["A","B","C"], "data": [12,22,32]}
    ],
    "chart2": [
      {"date": "2025-06-01", "labels": ["X","Y","Z"], "data": [5,10,15]},
      {"date": "2025-06-02", "labels": ["X","Y","Z"], "data": [7,11,17]},
      {"date": "2025-06-03", "labels": ["X","Y","Z"], "data": [6,9,14]}
    ],
    // เพิ่ม chart3 - chart9 แบบเดียวกัน (ย่อไว้)
    "chart3": [...],
    "chart4": [...],
    "chart5": [...],
    "chart6": [...],
    "chart7": [...],
    "chart8": [...],
    "chart9": [...]
  },
  "dashboard2": {
    // เหมือน dashboard1 แต่อาจมีข้อมูลต่างกัน
    "chart1": [...],
    "chart2": [...],
    "chart3": [...],
    "chart4": [...],
    "chart5": [...],
    "chart6": [...],
    "chart7": [...],
    "chart8": [...],
    "chart9": [...]
  },
  "dashboard3": {
    // เหมือนกัน
    "chart1": [...],
    "chart2": [...],
    "chart3": [...],
    "chart4": [...],
    "chart5": [...],
    "chart6": [...],
    "chart7": [...],
    "chart8": [...],
    "chart9": [...]
  }
};

const chartTitles = {
  dashboard1: [
    "Inventory ABC Category",
    "FSN Analysis",
    "DOI Distribution",
    "Turnover Rate",
    "Top Inventory Items",
    "Stock Aging",
    "Capital Tied Up",
    "Risk Assessment",
    "Stock Movement"
  ],
  dashboard2: [
    "Forecast Accuracy",
    "MAPE Trend",
    "Bias Index",
    "Fill Rate",
    "Demand Risk",
    "Plan vs Actual",
    "Error Distribution",
    "Lead Time Analysis",
    "Forecast Bias"
  ],
  dashboard3: [
    "Inventory Value",
    "Overstock Percentage",
    "DOI Score",
    "Accuracy KPI",
    "Action Log",
    "Impact Score",
    "Executive Summary",
    "Risk Index",
    "Strategic Initiatives"
  ]
};

let chartInstances = [];

function filterDataByDate(dataArr, startDate, endDate) {
  if (!startDate || !endDate) return dataArr;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return dataArr.filter(d => {
    const dt = new Date(d.date);
    return dt >= start && dt <= end;
  });
}

function clearCharts() {
  chartInstances.forEach(chart => chart.destroy());
  chartInstances = [];
}

function renderCharts(dashboardKey, startDate, endDate) {
  clearCharts();
  const container = document.getElementById('dashboardContainer');
  container.innerHTML = '';

  const dashboardData = data_all_dashboards[dashboardKey];
  if (!dashboardData) {
    container.innerHTML = `<p>ไม่พบข้อมูลสำหรับ Dashboard นี้</p>`;
    return;
  }

  for(let i = 1; i <= 9; i++) {
    const chartId = 'chart' + i;
    const chartDataRaw = dashboardData[chartId];
    if(!chartDataRaw) continue;

    const filteredData = filterDataByDate(chartDataRaw, startDate, endDate);
    if(filteredData.length === 0) continue;

    // รวมข้อมูลจาก filteredData เช่นรวมค่า data arrays เพื่อทำกราฟ
    // สำหรับตัวอย่างนี้เอาค่า data แถวสุดท้ายมาแสดง
    const latest = filteredData[filteredData.length - 1];

    // สร้าง div สำหรับกราฟ
    const card = document.createElement('div');
    card.className = 'chart-card';
    card.innerHTML = `<h3>${chartTitles[dashboardKey][i-1]}</h3><canvas id="${dashboardKey}_${chartId}"></canvas>`;
    container.appendChild(card);

    // สร้าง chart
    const ctx = document.getElementById(`${dashboardKey}_${chartId}`).getContext('2d');
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: latest.labels,
        datasets: [{
          label: `${latest.date}`,
          data: latest.data,
          backgroundColor: 'rgba(54, 162, 235, 0.7)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        }
      }
    });
    chartInstances.push(chart);
  }
}

document.getElementById('btnLoad').addEventListener('click', () => {
  const dashboardKey = document.getElementById('selectDashboard').value;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  renderCharts(dashboardKey, startDate, endDate);
});

// โหลดครั้งแรก
window.onload = () => {
  const today = new Date().toISOString().slice(0,10);
  document.getElementById('startDate').value = '2025-06-01';
  document.getElementById('endDate').value = today;
  renderCharts('dashboard1', '2025-06-01', today);
}
