let charts = {};
const dashboardContainer = document.getElementById('dashboardContainer');
const dashboardSelector = document.getElementById('dashboardSelector');
const dateSelector = document.getElementById('dateSelector');
const refreshBtn = document.getElementById('refreshBtn');

const DASHBOARDS = {
  1: {
    name: "Strategic Inventory Health & Risk",
    subDashboards: [
      { id: "abcCategory", title: "ABC Category", type: "doughnut" },
      { id: "doiDistribution", title: "DOI Distribution", type: "bar" },
      { id: "turnoverRate", title: "Turnover Rate", type: "line" },
      { id: "fsnCategory", title: "FSN Category", type: "pie" },
      { id: "topInventory", title: "Top 10 Inventory", type: "table" },
      { id: "extraChart1", title: "Extra Chart 1", type: "bar" },
      { id: "extraChart2", title: "Extra Chart 2", type: "bar" },
      { id: "extraChart3", title: "Extra Chart 3", type: "bar" },
      { id: "extraChart4", title: "Extra Chart 4", type: "bar" }
    ]
  },
  2: {
    name: "Planning Accuracy & Demand Risk",
    subDashboards: [
      { id: "forecastAccuracy", title: "Forecast Accuracy", type: "line" },
      { id: "mapeTrend", title: "MAPE Trend", type: "bar" },
      { id: "biasIndex", title: "Bias Index", type: "bar" },
      { id: "fillRate", title: "Fill Rate", type: "doughnut" },
      { id: "demandRisk", title: "Demand Risk Level", type: "pie" },
      { id: "extraChart1", title: "Extra Chart 1", type: "bar" },
      { id: "extraChart2", title: "Extra Chart 2", type: "bar" },
      { id: "extraChart3", title: "Extra Chart 3", type: "bar" },
      { id: "extraChart4", title: "Extra Chart 4", type: "bar" }
    ]
  },
  3: {
    name: "Strategic Action & Impact (Executive Scorecard)",
    subDashboards: [
      { id: "inventoryValue", title: "Inventory Value", type: "line" },
      { id: "overstockPercent", title: "Overstock %", type: "bar" },
      { id: "doiScore", title: "DOI Score", type: "bar" },
      { id: "accuracyKPI", title: "Accuracy KPI ≥80%", type: "doughnut" },
      { id: "actionLog", title: "Action Log", type: "table" },
      { id: "extraChart1", title: "Extra Chart 1", type: "bar" },
      { id: "extraChart2", title: "Extra Chart 2", type: "bar" },
      { id: "extraChart3", title: "Extra Chart 3", type: "bar" },
      { id: "extraChart4", title: "Extra Chart 4", type: "bar" }
    ]
  }
};

async function loadDashboard() {
  const dashId = dashboardSelector.value;
  const selectedDate = dateSelector.value;

  clearDashboard();

  const dashInfo = DASHBOARDS[dashId];
  dashInfo.subDashboards.forEach(subDash => {
    dashboardContainer.appendChild(createCard(subDash));
  });

  // โหลดข้อมูล json ทั้งหมด
  const res = await fetch('data_all_dashboards.json');
  const allData = await res.json();

  // กรองข้อมูลตามวันที่และ Dashboard
  const rawData = allData[selectedDate]?.[dashId];
  if (!rawData) {
    dashboardContainer.innerHTML = '<p>No data available for this date and dashboard.</p>';
    return;
  }

  // แสดงข้อมูลแต่ละ subDashboard
  dashInfo.subDashboards.forEach(subDash => {
    if (subDash.type === 'table') {
      renderTable(subDash.id, rawData);
    } else {
      renderChart(subDash.id, subDash.type, rawData);
    }
  });
}

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

  // ตรวจสอบข้อมูลก่อน
  if (!data[id]) {
    console.warn(`No data for chart ${id}`);
    return;
  }

  const chartData = data[id];

  const config = {
    type,
    data: {
      labels: chartData.labels,
      datasets: [{
        label: chartData.label || id,
        data: chartData.data,
        backgroundColor: generateColors(chartData.data.length, id),
        borderColor: generateBorderColors(chartData.data.length, id),
        fill: type === 'line' ? false : true,
        borderWidth: 1,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { enabled: true }
      },
      scales: type === 'bar' || type === 'line' ? {
        y: { beginAtZero: true }
      } : {}
    }
  };

  const ctx = document.getElementById('chart-' + id).getContext('2d');
  charts['chart-' + id] = new Chart(ctx, config);
}

function generateColors(length, id) {
  // กำหนดสีพื้นฐานแตกต่างตาม id (เพิ่มเติมถ้าต้องการ)
  const baseColors = {
    "abcCategory": ['#28a745', '#ffc107', '#dc3545'],
    "fsnCategory": ['#20c997', '#fd7e14', '#6c757d'],
    "fillRate": ['#20c997', '#fd7e14'],
    "demandRisk": ['#dc3545', '#ffc107', '#28a745'],
    "accuracyKPI": ['#28a745', '#ffc107']
  };

  if (baseColors[id]) {
    return baseColors[id];
  }

  // สี fallback แบบสุ่มหรือวนซ้ำ
  const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1', '#e83e8c'];
  let result = [];
  for (let i = 0; i < length; i++) {
    result.push(colors[i % colors.length]);
  }
  return result;
}

function generateBorderColors(length, id) {
  // กำหนดขอบสีคล้ายกัน แต่สำหรับกราฟเส้น
  if (id === "turnoverRate" || id === "forecastAccuracy" || id === "inventoryValue") {
    return '#007bff';
  }
  return 'transparent';
}

dashboardSelector.addEventListener('change', loadDashboard);
dateSelector.addEventListener('change', loadDashboard);
refreshBtn.addEventListener('click', loadDashboard);

// โหลด dashboard เริ่มต้น
loadDashboard();
