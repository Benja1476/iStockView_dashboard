let charts = {};
let rawData = {};
const dashboardContainer = document.getElementById('dashboardContainer');
const dashboardSelector = document.getElementById('dashboardSelector');
const refreshBtn = document.getElementById('refreshBtn');

const DASHBOARDS = {
  1: {
    name: "Strategic Inventory Health & Risk",
    key: "dashboard1",
    subDashboards: [
      { id: "topInventory", title: "Top 10 Inventory", type: "table" },
      { id: "abcCategory", title: "ABC Category", type: "doughnut" },
      { id: "doiDistribution", title: "DOI Distribution", type: "bar" },
      { id: "turnoverRate", title: "Turnover Rate", type: "line" },
      { id: "fsnCategory", title: "FSN Category", type: "pie" },
      { id: "extraChart1", title: "Extra Chart 1", type: "line" },
      { id: "extraChart2", title: "Extra Chart 2", type: "bar" },
      { id: "extraChart3", title: "Extra Chart 3", type: "doughnut" },
      { id: "extraChart4", title: "Extra Chart 4", type: "pie" },
    ],
  },
  2: {
    name: "Planning Accuracy & Demand Risk",
    key: "dashboard2",
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
    key: "dashboard3",
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

  if (!rawData || Object.keys(rawData).length === 0) {
    // โหลด JSON แค่ครั้งแรก
    const res = await fetch('data_all_dashboards.json');
    rawData = await res.json();
  }

  const dashInfo = DASHBOARDS[dashboardId];
  dashboardContainer.style.gridTemplateColumns = 'repeat(3, 1fr)'; // 3 คอลัมน์

  // สร้าง card ทั้งหมด
  dashInfo.subDashboards.forEach(subDash => {
    dashboardContainer.appendChild(createCard(subDash));
  });

  // ดึงข้อมูลย่อยของ Dashboard ปัจจุบัน
  const dashData = rawData[dashInfo.key];

  dashInfo.subDashboards.forEach(subDash => {
    if (subDash.type === 'table') {
      renderTable(subDash.id, dashData);
    } else {
      renderChart(subDash.id, subDash.type, dashData);
    }
  });
}

function renderTable(id, dashData) {
  const card = document.getElementById(id);
  const table = card.querySelector('table');
  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');
  thead.innerHTML = '';
  tbody.innerHTML = '';

  if (id === 'topInventory') {
    thead.innerHTML = `<tr><th>Item</th><th>Qty</th></tr>`;
    dashData.topInventory.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.item}</td><td>${r.qty}</td>`;
      tbody.appendChild(tr);
    });
  } else if (id === 'actionLog') {
    thead.innerHTML = `<tr><th>Date</th><th>Action</th><th>Impact</th></tr>`;
    dashData.actionLog.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.date}</td><td>${r.action}</td><td>${r.impact}</td>`;
      tbody.appendChild(tr);
    });
  }
}

function renderChart(id, type, dashData) {
  if (charts['chart-' + id]) {
    charts['chart-' + id].destroy();
  }

  let config = null;
  const dataObj = dashData[id];

  if (!dataObj) {
    console.warn('No data for chart id:', id);
    return;
  }

  switch (id) {
    case 'abcCategory':
    case 'accuracyKPI':
    case 'extraChart3':
      config = {
        type,
        data: {
          labels: dataObj.labels,
          datasets: [{
            data: dataObj.data,
            backgroundColor: ['#28a745', '#ffc107', '#dc3545']
          }]
        },
        options: chartOptions()
      };
      break;
    case 'doiDistribution':
    case 'overstockPercent':
    case 'biasIndex':
    case 'extraChart2':
      config = {
        type,
        data: {
          labels: dataObj.labels,
          datasets: [{
            label: id,
            data: dataObj.data,
            backgroundColor: '#dc3545'
          }]
        },
        options: chartOptions()
      };
      break;
    case 'turnoverRate':
    case 'forecastAccuracy':
    case 'inventoryValue':
    case 'extraChart1':
      config = {
        type,
        data: {
          labels: dataObj.labels,
          datasets: [{
            label: id,
            data: dataObj.data,
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
          labels: dataObj.labels,
          datasets: [{
            data: dataObj.data,
            backgroundColor: ['#20c997', '#fd7e14', '#6c757d']
          }]
        },
        options: chartOptions()
      };
      break;
    case 'mapeTrend':
      config = {
        type,
        data: {
          labels: dataObj.labels,
          datasets: [{
            label: id,
            data: dataObj.data,
            backgroundColor: '#ffc107'
          }]
        },
        options: chartOptions()
      };
      break;
    case 'fillRate':
      config = {
        type,
        data: {
          labels: dataObj.labels,
          datasets: [{
            data: dataObj.data,
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
          labels: dataObj.labels,
          datasets: [{
            data: dataObj.data,
            backgroundColor: ['#dc3545', '#ffc107', '#28a745']
          }]
        },
        options: chartOptions()
      };
      break;
    case 'doiScore':
      config = {
        type,
        data: {
          labels: dataObj.labels,
          datasets: [{
            label: id,
            data: dataObj.data,
            backgroundColor: '#17a2b8'
          }]
        },
        options: chartOptions()
      };
      break;
    case 'extraChart4':
      config = {
        type,
        data: {
          labels: dataObj.labels,
          datasets: [{
            data: dataObj.data,
            backgroundColor: ['#6f42c1', '#fd7e14', '#dc3545']
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
