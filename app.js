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
let charts = {};
let rawData = {};
const dashboardContainer = document.getElementById('dashboardContainer');
const dashboardSelector = document.getElementById('dashboardSelector');
const refreshBtn = document.getElementById('refreshBtn');

const DASHBOARDS = {
  1: {
    name: "Strategic Inventory Health & Risk",
    subDashboards: [
      { id: "topInventory", title: "Top 10 Inventory", type: "table" },
      { id: "abcCategory", title: "ABC Category", type: "doughnut" },
      { id: "doiDistribution", title: "DOI Distribution", type: "bar" },
      { id: "turnoverRate", title: "Turnover Rate", type: "line" },
      { id: "fsnCategory", title: "FSN Category", type: "pie" },
    ],
  },
  2: {
    name: "Planning Accuracy & Demand Risk",
    subDashboards: [
      { id: "forecastAccuracy", title: "Forecast Accuracy", type: "line" },
      { id: "mapeTrend", title: "MAPE Trend", type: "bar" },
      { id: "biasIndex", title: "Bias Index", type: "bar" },
      { id: "fillRate", title: "Fill Rate", type: "doughnut" },
      { id: "demandRisk", title: "Demand Risk Level", type: "pie" },
    ],
  },
  3: {
    name: "Strategic Action & Impact (Executive Scorecard)",
    subDashboards: [
      { id: "inventoryValue", title: "Inventory Value", type: "line" },
      { id: "overstockPercent", title: "Overstock %", type: "bar" },
      { id: "doiScore", title: "DOI Score", type: "bar" },
      { id: "accuracyKPI", title: "Accuracy KPI ≥80%", type: "doughnut" },
      { id: "actionLog", title: "Action Log", type: "table" },
    ],
  },
};

function createCard(subDash) {
  const card = document.createElement('div');
  card.className = 'card';
  card.id = subDash.id;

  const title = document.createElement('h3');
  title.textContent = subDash.title;
  card.appendChild(title);

  if (subDash.type === 'table') {
    const table = document.createElement('table');
    table.innerHTML = `<thead></thead><tbody></tbody>`;
    card.appendChild(table);
  } else {
    const canvas = document.createElement('canvas');
    canvas.id = 'chart-' + subDash.id;
    card.appendChild(canvas);
  }
  return card;
}

function clearDashboard() {
  dashboardContainer.innerHTML = '';
  Object.values(charts).forEach(chart => chart.destroy());
  charts = {};
}

async function loadDashboard(dashboardId) {
  clearDashboard();
  const dashInfo = DASHBOARDS[dashboardId];

  // สร้าง card ทั้งหมด
  dashInfo.subDashboards.forEach(subDash => {
    dashboardContainer.appendChild(createCard(subDash));
  });

  // โหลดข้อมูล JSON ทั้งหมด
  const res = await fetch('data_all_dashboards.json');
  rawData = await res.json();

  // แสดงข้อมูลของ dashboard ที่เลือก
  const data = rawData[dashboardId];

  dashInfo.subDashboards.forEach(subDash => {
    if (subDash.type === 'table') {
      renderTable(subDash.id, data);
    } else {
      renderChart(subDash.id, subDash.type, data);
    }
  });
}

function renderTable(id, data) {
  const card = document.getElementById(id);
  const table = card.querySelector('table');
  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');
  thead.innerHTML = '';
  tbody.innerHTML = '';

  if (id === 'topInventory' && data.topInventory) {
    thead.innerHTML = `<tr><th>Item</th><th>Qty</th></tr>`;
    data.topInventory.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.item}</td><td>${r.qty}</td>`;
      tbody.appendChild(tr);
    });
  } else if (id === 'actionLog' && data.actionLog) {
    thead.innerHTML = `<tr><th>Date</th><th>Action</th><th>Impact</th></tr>`;
    data.actionLog.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.date}</td><td>${r.action}</td><td>${r.impact}</td>`;
      tbody.appendChild(tr);
    });
  }
}

function renderChart(id, type, data) {
  if (charts['chart-' + id]) {
    charts['chart-' + id].destroy();
  }

  let config = null;

  switch (id) {
    case 'abcCategory':
      config = {
        type,
        data: {
          labels: data.abcCategory.labels,
          datasets: [{
            data: data.abcCategory.data,
            backgroundColor: ['#28a745', '#ffc107', '#dc3545']
          }]
        },
        options: chartOptions()
      };
      break;
    case 'doiDistribution':
      config = {
        type,
        data: {
          labels: data.doiDistribution.labels,
          datasets: [{
            label: 'Items',
            data: data.doiDistribution.data,
            backgroundColor: '#17a2b8'
          }]
        },
        options: chartOptions()
      };
      break;
    case 'turnoverRate':
      config = {
        type,
        data: {
          labels: data.turnoverRate.labels,
          datasets: [{
            label: 'Turnover %',
            data: data.turnoverRate.data,
            borderColor: '#007bff',
            fill: false
          }]
        },
        options: chartOptions()
      };
      break;
    case 'fsnCategory':
      config = {
        type,
        data: {
          labels: data.fsnCategory.labels,
          datasets: [{
            data: data.fsnCategory.data,
            backgroundColor: ['#20c997', '#fd7e14', '#6c757d']
          }]
        },
        options: chartOptions()
      };
      break;

    // Planning Accuracy & Demand Risk
    case 'forecastAccuracy':
      config = {
        type,
        data: {
          labels: data.forecastAccuracy.labels,
          datasets: [{
            label: 'Forecast Accuracy',
            data: data.forecastAccuracy.data,
            borderColor: '#28a745',
            fill: false
          }]
        },
        options: chartOptions()
      };
      break;
    case 'mapeTrend':
      config = {
        type,
        data: {
          labels: data.mapeTrend.labels,
          datasets: [{
            label: 'MAPE',
            data: data.mapeTrend.data,
            backgroundColor: '#ffc107'
          }]
        },
        options: chartOptions()
      };
      break;
    case 'biasIndex':
      config = {
        type,
        data: {
          labels: data.biasIndex.labels,
          datasets: [{
            label: 'Bias',
            data: data.biasIndex.data,
            backgroundColor: '#dc3545'
          }]
        },
        options: chartOptions()
      };
      break;
    case 'fillRate':
      config = {
        type,
        data: {
          labels: data.fillRate.labels,
          datasets: [{
            data: data.fillRate.data,
            backgroundColor: ['#20c997', '#fd7e14']
          }]
        },
        options: chartOptions()
      };
      break;
    case 'demandRisk':
      config = {
        type,
        data: {
          labels: data.demandRisk.labels,
          datasets: [{
            data: data.demandRisk.data,
            backgroundColor: ['#dc3545', '#ffc107', '#28a745']
          }]
        },
        options: chartOptions()
      };
      break;

    // Strategic Action & Impact
    case 'inventoryValue':
      config = {
        type,
        data: {
          labels: data.inventoryValue.labels,
          datasets: [{
            label: 'Inventory Value',
            data: data.inventoryValue.data,
            borderColor: '#007bff',
            fill: false
          }]
        },
        options: chartOptions()
      };
      break;
    case 'overstockPercent':
      config = {
        type,
        data: {
          labels: data.overstockPercent.labels,
          datasets: [{
            label: 'Overstock %',
            data: data.overstockPercent.data,
            backgroundColor: '#dc3545'
          }]
        },
        options: chartOptions()
      };
      break;
    case 'doiScore':
      config = {
        type,
        data: {
          labels: data.doiScore.labels,
          datasets: [{
            label: 'DOI Score',
            data: data.doiScore.data,
            backgroundColor: '#17a2b8'
          }]
        },
        options: chartOptions()
      };
      break;
    case 'accuracyKPI':
      config = {
        type,
        data: {
          labels: data.accuracyKPI.labels,
          datasets: [{
            data: data.accuracyKPI.data,
            backgroundColor: ['#28a745', '#ffc107']
          }]
        },
        options: chartOptions()
      };
      break;

    default:
      console.warn('No chart config for', id);
      return;
  }

  const ctx = document.getElementById('chart-' + id).getContext('2d');
  charts['chart-' + id] = new Chart(ctx, config);
}

function chartOptions() {
  return {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: { enabled: true }
    }
  };
}

dashboardSelector.addEventListener('change', () => {
  loadDashboard(dashboardSelector.value);
});

refreshBtn.addEventListener('click', () => {
  loadDashboard(dashboardSelector.value);
});

// โหลด Dashboard แรกตอนเริ่มต้น
loadDashboard(dashboardSelector.value);

