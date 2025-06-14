let rawData = [];
let charts = {};
let currentDashboard = "1";
let currentDate = "";

const dashboardConfig = {
  "1": {
    title: "Strategic Inventory Health & Risk",
    dashboards: [
      "ABC Category", "FSN Category", "Turnover Rate", "DOI Distribution",
      "Composite Risk Score", "Urgency Level", "Inventory Aging", "Top 10 Inventory"
    ]
  },
  "2": {
    title: "Planning Accuracy & Demand Risk",
    dashboards: [
      "Forecast Accuracy", "MAPE", "Bias", "Fill Rate",
      "Demand Risk Level", "Date Drill-Down", "KPI Trends", "Planning Overview"
    ]
  },
  "3": {
    title: "Strategic Action & Impact",
    dashboards: [
      "Inventory Value", "Overstock %", "DOI", "Accuracy ≥80%",
      "Before vs After", "Action Log", "Impact Score", "Executive Summary"
    ]
  }
};

async function loadData() {
  try {
    const res = await fetch('data.json');
    rawData = await res.json();

    const dates = [...new Set(rawData.map(d => d.date))].sort();
    const dateSelect = document.getElementById('dateSelect');
    dateSelect.innerHTML = "";
    dates.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      dateSelect.appendChild(opt);
    });

    if (!dateSelect.value && dates.length) dateSelect.value = dates[0];
    currentDate = dateSelect.value;

    updateDashboardContainer();
  } catch (e) {
    console.error("Error loading data:", e);
  }
}

function updateDashboardContainer() {
  const container = document.getElementById('dashboardContainer');
  container.innerHTML = "";

  const dashNames = dashboardConfig[currentDashboard].dashboards;

  dashNames.forEach(name => {
    const card = document.createElement('div');
    card.className = "card";

    const title = document.createElement('h3');
    title.textContent = name;
    card.appendChild(title);

    // ถ้าเป็นตาราง เช่น Top 10 Inventory หรือ Action Log
    if (name === "Top 10 Inventory" || name === "Action Log" || name === "Executive Summary" || name === "Planning Overview" || name === "Date Drill-Down") {
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tbody = document.createElement('tbody');
      table.appendChild(thead);
      table.appendChild(tbody);
      card.appendChild(table);

      // สร้าง header ตามชื่อ Dashboard ย่อย
      if (name === "Top 10 Inventory") {
        thead.innerHTML = "<tr><th>Item</th><th>Qty</th></tr>";
      } else if (name === "Action Log") {
        thead.innerHTML = "<tr><th>Action</th><th>Status</th><th>Date</th></tr>";
      } else if (name === "Executive Summary") {
        thead.innerHTML = "<tr><th>KPI</th><th>Value</th></tr>";
      } else if (name === "Planning Overview") {
        thead.innerHTML = "<tr><th>Plan</th><th>Details</th></tr>";
      } else if (name === "Date Drill-Down") {
        thead.innerHTML = "<tr><th>Date</th><th>Detail</th></tr>";
      }
    } else {
      // canvas สำหรับกราฟ
      const canvas = document.createElement('canvas');
      canvas.id = "chart_" + name.replace(/\s+/g, '');
      card.appendChild(canvas);
    }

    container.appendChild(card);
  });

  updateAllVisuals();
}

function updateAllVisuals() {
  const filteredData = rawData.filter(d => d.date === currentDate);

  dashboardConfig[currentDashboard].dashboards.forEach(name => {
    if (name === "Top 10 Inventory") {
      updateTopInventory(filteredData);
    } else if (name === "Action Log") {
      updateActionLog(filteredData);
    } else if (name === "Executive Summary") {
      updateExecutiveSummary(filteredData);
    } else if (name === "Planning Overview") {
      updatePlanningOverview(filteredData);
    } else if (name === "Date Drill-Down") {
      updateDateDrillDown(filteredData);
    } else {
      updateChart(name, filteredData);
    }
  });
}

function updateTopInventory(data) {
  const tbody = document.querySelector('.card h3:contains("Top 10 Inventory")')?.nextElementSibling?.querySelector('tbody');
  // ป้องกัน error กรณีไม่เจอ
  if (!tbody) {
    // ใช้วิธี querySelectorAll แล้ว match title แทน
    let cards = document.querySelectorAll('.card');
    for (let card of cards) {
      if (card.querySelector('h3')?.textContent === "Top 10 Inventory") {
        tbody = card.querySelector('tbody');
        break;
      }
    }
  }
  // กรณียังไม่เจอ return
  if (!tbody) return;

  // สมมติ data มี item และ qty
  tbody.innerHTML = "";
  const top10 = data.slice(0, 10);
  top10.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${row.item || '-'}</td><td>${row.qty || 0}</td>`;
    tbody.appendChild(tr);
  });
}

function updateActionLog(data) {
  const tbody = getTbodyByTitle("Action Log");
  if (!tbody) return;
  tbody.innerHTML = "";
  data.slice(0, 5).forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.action || '-'}</td><td>${r.status || '-'}</td><td>${r.date || '-'}</td>`;
    tbody.appendChild(tr);
  });
}

function updateExecutiveSummary(data) {
  const tbody = getTbodyByTitle("Executive Summary");
  if (!tbody) return;
  tbody.innerHTML = "";
  // สมมติ KPI สรุป
  const kpis = [
    { kpi: "Inventory Value", value: "1,200,000" },
    { kpi: "Overstock %", value: "15%" },
    { kpi: "DOI", value: "45" },
    { kpi: "Accuracy ≥80%", value: "82%" }
  ];
  kpis.forEach(k => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${k.kpi}</td><td>${k.value}</td>`;
    tbody.appendChild(tr);
  });
}

function updatePlanningOverview(data) {
  const tbody = getTbodyByTitle("Planning Overview");
  if (!tbody) return;
  tbody.innerHTML = "";
  const plans = [
    { plan: "Plan A", details: "รายละเอียดแผน A" },
    { plan: "Plan B", details: "รายละเอียดแผน B" },
    { plan: "Plan C", details: "รายละเอียดแผน C" }
  ];
  plans.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${p.plan}</td><td>${p.details}</td>`;
    tbody.appendChild(tr);
  });
}

function updateDateDrillDown(data) {
  const tbody = getTbodyByTitle("Date Drill-Down");
  if (!tbody) return;
  tbody.innerHTML = "";
  // สมมติรายละเอียด drill down ตามวัน
  data.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.date}</td><td>รายละเอียดสำหรับ ${r.item || '-'}</td>`;
    tbody.appendChild(tr);
  });
}

function getTbodyByTitle(title) {
  const cards = document.querySelectorAll('.card');
  for (let card of cards) {
    if (card.querySelector('h3')?.textContent === title) {
      return card.querySelector('tbody');
    }
  }
  return null;
}

function updateChart(name, data) {
  const id = "chart_" + name.replace(/\s+/g, '');
  const ctx = document.getElementById(id);
  if (!ctx) return;

  // สร้าง data และ config แบบง่ายสมมติ

  let labels = [];
  let dataset = [];
  let bgColors = [];
  let borderColor = '#007bff';
  let type = 'bar';
  let label = name;

  switch (name) {
    case "ABC Category":
      labels = ['A', 'B', 'C'];
      dataset = [60, 25, 15];
      bgColors = ['#28a745', '#ffc107', '#dc3545'];
      type = 'doughnut';
      break;

    case "FSN Category":
      labels = ['Fast', 'Slow', 'Non-Moving'];
      dataset = [40, 30, 30];
      bgColors = ['#20c997', '#fd7e14', '#6c757d'];
      type = 'pie';
      break;

    case "Turnover Rate":
      labels = ['Jan', 'Feb', 'Mar'];
      dataset = [45, 50, 60];
      type = 'line';
      borderColor = '#007bff';
      break;

    case "DOI Distribution":
      labels = ['1-30', '31-60', '61-90', '90+'];
      dataset = [20, 15, 10, 5];
      bgColors = '#17a2b8';
      type = 'bar';
      break;

    case "Composite Risk Score":
      labels = ['Low', 'Medium', 'High'];
      dataset = [50, 30, 20];
      bgColors = ['#198754', '#ffc107', '#dc3545'];
      type = 'bar';
      break;

    case "Urgency Level":
      labels = ['Normal', 'Elevated', 'Urgent'];
      dataset = [70, 20, 10];
      bgColors = ['#0d6efd', '#fd7e14', '#dc3545'];
      type = 'bar';
      break;

    case "Inventory Aging":
      labels = ['0-90 วัน', '91-180 วัน', '181-360 วัน', '360+ วัน'];
      dataset = [15, 10, 8, 3];
      bgColors = '#6f42c1';
      type = 'bar';
      break;

    case "Forecast Accuracy":
      labels = ['Jan', 'Feb', 'Mar'];
      dataset = [85, 82, 87];
      bgColors = '#198754';
      type = 'line';
      break;

    case "MAPE":
      labels = ['Jan', 'Feb', 'Mar'];
      dataset = [10, 12, 8];
      bgColors = '#dc3545';
      type = 'line';
      break;

    case "Bias":
      labels = ['Jan', 'Feb', 'Mar'];
      dataset = [2, -1, 0];
      bgColors = '#ffc107';
      type = 'line';
      break;

    case "Fill Rate":
      labels = ['Jan', 'Feb', 'Mar'];
      dataset = [92, 90, 95];
      bgColors = '#0d6efd';
      type = 'line';
      break;

    case "Demand Risk Level":
      labels = ['Low', 'Medium', 'High'];
      dataset = [45, 35, 20];
      bgColors = ['#198754', '#ffc107', '#dc3545'];
      type = 'bar';
      break;

    case "KPI Trends":
      labels = ['Jan', 'Feb', 'Mar'];
      dataset = [80, 83, 85];
      bgColors = '#0d6efd';
      type = 'line';
      break;

    case "Inventory Value":
      labels = ['Q1', 'Q2', 'Q3', 'Q4'];
      dataset = [300, 320, 310, 330];
      bgColors = '#007bff';
      type = 'bar';
      break;

    case "Overstock %":
      labels = ['Q1', 'Q2', 'Q3', 'Q4'];
      dataset = [15, 18, 16, 20];
      bgColors = '#dc3545';
      type = 'bar';
      break;

    case "Before vs After":
      labels = ['Before', 'After'];
      dataset = [70, 85];
      bgColors = ['#dc3545', '#28a745'];
      type = 'bar';
      break;

    case "Impact Score":
      labels = ['Q1', 'Q2', 'Q3', 'Q4'];
      dataset = [60, 70, 75, 80];
      bgColors = '#0d6efd';
      type = 'line';
      break;

    default:
      // กรณีไม่มีข้อมูล
      labels = ['No Data'];
      dataset = [0];
      bgColors = '#6c757d';
      type = 'bar';
  }

  if (charts[id]) {
    charts[id].data.labels = labels;
    charts[id].data.datasets[0].data = dataset;
    charts[id].data.datasets[0].backgroundColor = bgColors;
    charts[id].update();
  } else {
    charts[id] = new Chart(ctx, {
      type: type,
      data: {
        labels: labels,
        datasets: [{
          label: label,
          data: dataset,
          backgroundColor: bgColors,
          borderColor: borderColor,
          fill: type === 'line'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: 'bottom' },
          tooltip: { enabled: true }
        },
        scales: (type === 'bar' || type === 'line') ? {
          y: { beginAtZero: true }
        } : {}
      }
    });
  }
}

document.getElementById('dashboardSelect').addEventListener('change', e => {
  currentDashboard = e.target.value;
  updateDashboardContainer();
});

document.getElementById('dateSelect').addEventListener('change', e => {
  currentDate = e.target.value;
  updateAllVisuals();
});

document.getElementById('refreshBtn').addEventListener('click', () => {
  loadData();
});

// โหลดข้อมูลเริ่มต้น
loadData();
