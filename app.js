let charts = {};
let rawData = [];
const dashboardContainer = document.getElementById('dashboardContainer');
const dashboardSelector = document.getElementById('dashboardSelector');
const refreshBtn = document.getElementById('refreshBtn');

const DASHBOARDS = {
  1: {
    name: "Strategic Inventory Health & Risk",
    jsonFile: "data_dashboard1.json",
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
    jsonFile: "data_dashboard2.json",
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
    jsonFile: "data_dashboard3.json",
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

  // โหลดข้อมูล JSON
  const res = await fetch(dashInfo.jsonFile);
  rawData = await res.json();

  // แสดงข้อมูลในแต่ละ Dashboard ย่อย
  dashInfo.subDashboards.forEach(subDash => {
    if (subDash.type === 'table') {
      renderTable(subDash.id);
    } else {
      renderChart(subDash.id, subDash.type);
    }
  });
}

function renderTable(id) {
  const card = document.getElementById(id);
  const table = card.querySelector('table');
  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');
  thead.innerHTML = '';
  tbody.innerHTML = '';

  if (id === 'topInventory') {
    // ตัวอย่างสมมติ แสดง item กับ qty
    thead.innerHTML = `<tr><th>Item</th><th>Qty</th></tr>`;
    rawData.topInventory.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.item}</td><td>${r.qty}</td>`;
      tbody.appendChild(tr);
    });
  } else if (id === 'actionLog') {
    thead.innerHTML = `<tr><th>Date</th><th>Action</th><th>Impact</th></tr>`;
    rawData.actionLog.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.date}</td><td>${r.action}</td><td>${r.impact}</td>`;
      tbody.appendChild(tr);
    });
  }
}

function renderChart(id, type) {
  if (charts['chart-' + id]) {
    charts['chart-' + id].destroy();
  }

  let config = null;
  switch (id) {
    case 'abcCategory':
      config = {
        type,
        data: {
          labels: rawData.abcCategory.labels,
          datasets: [{
            data: rawData.abcCategory.data,
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
          labels: rawData.doiDistribution.labels,
          datasets: [{
            label: 'Items',
            data: rawData.doiDistribution.data,
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
          labels: rawData.turnoverRate.labels,
          datasets: [{
            label: 'Turnover %',
            data: rawData.turnoverRate.data,
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
          labels: rawData.fsnCategory.labels,
          datasets: [{
            data: rawData.fsnCategory.data,
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
          labels: rawData.forecastAccuracy.labels,
          datasets: [{
            label: 'Forecast Accuracy',
            data: rawData.forecastAccuracy.data,
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
          labels: rawData.mapeTrend.labels,
          datasets: [{
            label: 'MAPE',
            data: rawData.mapeTrend.data,
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
          labels: rawData.biasIndex.labels,
          datasets: [{
            label: 'Bias',
            data: rawData.biasIndex.data,
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
          labels: rawData.fillRate.labels,
          datasets: [{
            data: rawData.fillRate.data,
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
          labels: rawData.demandRisk.labels,
          datasets: [{
            data: rawData.demandRisk.data,
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
          labels: rawData.inventoryValue.labels,
          datasets: [{
            label: 'Inventory Value',
            data: rawData.inventoryValue.data,
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
          labels: rawData.overstockPercent.labels,
          datasets: [{
            label: 'Overstock %',
            data: rawData.overstockPercent.data,
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
          labels: rawData.doiScore.labels,
          datasets: [{
            label: 'DOI Score',
            data: rawData.doiScore.data,
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
          labels: rawData.accuracyKPI.labels,
          datasets: [{
            data: rawData.accuracyKPI.data,
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
