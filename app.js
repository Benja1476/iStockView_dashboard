let dataSets = {
  1: 'data1.json', // Strategic Inventory Health & Risk
  2: 'data2.json', // Planning Accuracy & Demand Risk
  3: 'data3.json'  // Strategic Action & Impact
};

let charts = {};
let rawData = [];

const dashboardContainer = document.getElementById('dashboardContainer');
const dashboardSelector = document.getElementById('dashboardSelector');
const dateSelector = document.getElementById('dateSelector');
const refreshBtn = document.getElementById('refreshBtn');

// กำหนด Dashboard ย่อย 8 ตัว สำหรับแต่ละ Dashboard ใหญ่
const dashboardDetails = {
  1: [ // Strategic Inventory Health & Risk
    {id:'d1-1', title:'ABC Category', type:'doughnut'},
    {id:'d1-2', title:'FSN Category', type:'pie'},
    {id:'d1-3', title:'Turnover Rate', type:'line'},
    {id:'d1-4', title:'DOI Distribution', type:'bar'},
    {id:'d1-5', title:'Composite Risk Score', type:'bar'},
    {id:'d1-6', title:'Urgency Level', type:'doughnut'},
    {id:'d1-7', title:'Top 10 Inventory', type:'table'},
    {id:'d1-8', title:'Strategic Recommendations', type:'table'}
  ],
  2: [ // Planning Accuracy & Demand Risk
    {id:'d2-1', title:'Forecast Accuracy', type:'line'},
    {id:'d2-2', title:'MAPE', type:'line'},
    {id:'d2-3', title:'Bias', type:'bar'},
    {id:'d2-4', title:'Fill Rate', type:'bar'},
    {id:'d2-5', title:'Demand Risk by Period', type:'bar'},
    {id:'d2-6', title:'Dynamic Date Slicer', type:'table'},
    {id:'d2-7', title:'Drill-Down Time Hierarchy', type:'table'},
    {id:'d2-8', title:'Forecast vs Actual', type:'line'}
  ],
  3: [ // Strategic Action & Impact
    {id:'d3-1', title:'Inventory Value', type:'bar'},
    {id:'d3-2', title:'Overstock %', type:'doughnut'},
    {id:'d3-3', title:'DOI', type:'bar'},
    {id:'d3-4', title:'Accuracy ≥80%', type:'bar'},
    {id:'d3-5', title:'Before vs After', type:'line'},
    {id:'d3-6', title:'Action Log', type:'table'},
    {id:'d3-7', title:'KPI Summary', type:'bar'},
    {id:'d3-8', title:'Impact Analysis', type:'bar'}
  ]
};

function createDashboardCards(dashboardId) {
  dashboardContainer.innerHTML = ''; // เคลียร์ก่อน
  const cards = dashboardDetails[dashboardId];
  cards.forEach(card => {
    const cardEl = document.createElement('div');
    cardEl.className = 'dashboard-card';
    cardEl.id = card.id;
    let content = `<h2>${card.title}</h2>`;
    if(card.type === 'table') {
      content += `<table><thead></thead><tbody></tbody></table>`;
    } else {
      content += `<canvas id="chart_${card.id}"></canvas>`;
    }
    cardEl.innerHTML = content;
    dashboardContainer.appendChild(cardEl);
  });
}

async function loadData() {
  const dashboardId = dashboardSelector.value;
  const fileName = dataSets[dashboardId];
  try {
    const res = await fetch(fileName);
    rawData = await res.json();

    // ดึงวันที่ไม่ซ้ำ และเรียงลำดับ
    const dates = Array.from(new Set(rawData.map(d => d.date))).sort();

    dateSelector.innerHTML = '';
    dates.forEach(date => {
      const option = document.createElement('option');
      option.value = date;
      option.textContent = date;
      dateSelector.appendChild(option);
    });

    createDashboardCards(dashboardId);

    if (dates.length > 0) updateDashboard(dates[0]);
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

function updateDashboard(selectedDate) {
  const dashboardId = dashboardSelector.value;
  const filteredData = rawData.filter(d => d.date === selectedDate);
  const cards = dashboardDetails[dashboardId];

  cards.forEach(card => {
    if(card.type === 'table') {
      updateTable(card.id, filteredData);
    } else {
      updateChart(card.id, card.type, filteredData);
    }
  });
}

function updateTable(cardId, data) {
  const cardEl = document.getElementById(cardId);
  const tbody = cardEl.querySelector('tbody');
  const thead = cardEl.querySelector('thead');

  if(!data || data.length === 0) {
    thead.innerHTML = '';
    tbody.innerHTML = '<tr><td colspan="5">ไม่มีข้อมูล</td></tr>';
    return;
  }

  // ตัวอย่างกำหนดหัวตารางและข้อมูลตาม cardId
  let headers = [];
  let rows = [];

  switch(cardId) {
    case 'd1-7': // Top 10 Inventory
      headers = ['Item', 'Qty'];
      rows = data.slice(0,10).map(d => [d.item, d.qty]);
      break;

    case 'd1-8': // Strategic Recommendations
      headers = ['Item', 'Action'];
      rows = data.slice(0,8).map(d => [d.item, d.recommendation || '-']);
      break;

    case 'd2-6': // Dynamic Date Slicer
      headers = ['Date', 'Description'];
      rows = data.map(d => [d.date, d.description || '-']);
      break;

    case 'd2-7': // Drill-Down Time Hierarchy
      headers = ['Year', 'Month', 'Day'];
      rows = data.map(d => [d.year, d.month, d.day]);
      break;

    case 'd3-6': // Action Log
      headers = ['Date', 'Action', 'Status'];
      rows = data.map(d => [d.date, d.action, d.status]);
      break;

    default:
      thead.innerHTML = '';
      tbody.innerHTML = '<tr><td colspan="5">ตารางยังไม่รองรับข้อมูล</td></tr>';
      return;
  }

  thead.innerHTML = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
  tbody.innerHTML = rows.length > 0
    ? rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')
    : `<tr><td colspan="${headers.length}">ไม่มีข้อมูล</td></tr>`;
}

function updateChart(cardId, type, data) {
  const ctx = document.getElementById('chart_'+cardId)?.getContext('2d');
  if (!ctx) return;

  // ตัวอย่างข้อมูลสมมติ (สามารถแก้ให้ดึงข้อมูลจริงจาก filtered data ได้)
  let chartData = {};
  switch(cardId) {
    case 'd1-1': // ABC Category
      chartData = {
        labels: ['A', 'B', 'C'],
        datasets: [{
          data: [60, 25, 15],
          backgroundColor: ['#28a745', '#ffc107', '#dc3545']
        }]
      };
      break;

    case 'd1-2': // FSN Category
      chartData = {
        labels: ['Fast', 'Slow', 'Non-Moving'],
        datasets: [{
          data: [40, 35, 25],
          backgroundColor: ['#20c997', '#fd7e14', '#6c757d']
        }]
      };
      break;

    case 'd1-3': // Turnover Rate
      chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr'],
        datasets: [{
          label: 'Turnover %',
          data: [45, 50, 55, 60],
          borderColor: '#007bff',
          fill: false,
          tension: 0.3
        }]
      };
      break;

    case 'd1-4': // DOI Distribution
      chartData = {
        labels: ['1-30', '31-60', '61-90', '90+'],
        datasets: [{
          label: 'Items',
          data: [20, 15, 10, 5],
          backgroundColor: '#17a2b8'
        }]
      };
      break;

    case 'd1-5': // Composite Risk Score
      chartData = {
        labels: ['Low', 'Medium', 'High'],
        datasets: [{
          label: 'Risk Score',
          data: [30, 40, 30],
          backgroundColor: ['#198754', '#ffc107', '#dc3545']
        }]
      };
      break;

    case 'd1-6': // Urgency Level
      chartData = {
        labels: ['Urgent', 'Normal', 'Low'],
        datasets: [{
          data: [25, 50, 25],
          backgroundColor: ['#dc3545', '#0d6efd', '#6c757d']
        }]
      };
      break;

    case 'd2-1': // Forecast Accuracy
      chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr'],
        datasets: [{
          label: 'Accuracy %',
          data: [85, 88, 90, 87],
          borderColor: '#198754',
          fill: false,
          tension: 0.2
        }]
      };
      break;

    case 'd2-2': // MAPE
      chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr'],
        datasets: [{
          label: 'MAPE',
          data: [5, 4, 3.5, 4.2],
          borderColor: '#ffc107',
          fill: false,
          tension: 0.2
        }]
      };
      break;

    case 'd2-3': // Bias
      chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr'],
        datasets: [{
          label: 'Bias',
          data: [2, -1, 0, 1],
          backgroundColor: ['#28a745', '#dc3545', '#ffc107', '#198754']
        }]
      };
      break;

    case 'd2-4': // Fill Rate
      chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr'],
        datasets: [{
          label: 'Fill Rate %',
          data: [90, 92, 91, 93],
          backgroundColor: '#0d6efd'
        }]
      };
      break;

    case 'd2-5': // Demand Risk by Period
      chartData = {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [{
          label: 'Risk Score',
          data: [30, 35, 40, 25],
          backgroundColor: ['#dc3545', '#ffc107', '#198754', '#0d6efd']
        }]
      };
      break;

    case 'd2-8': // Forecast vs Actual
      chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr'],
        datasets: [
          {
            label: 'Forecast',
            data: [100, 110, 120, 130],
            borderColor: '#ffc107',
            fill: false,
            tension: 0.2
          },
          {
            label: 'Actual',
            data: [95, 115, 118, 140],
            borderColor: '#198754',
            fill: false,
            tension: 0.2
          }
        ]
      };
      break;

    case 'd3-1': // Inventory Value
      chartData = {
        labels: ['Category A', 'Category B', 'Category C'],
        datasets: [{
          label: 'Value',
          data: [150000, 90000, 50000],
          backgroundColor: ['#0d6efd', '#198754', '#ffc107']
        }]
      };
      break;

    case 'd3-2': // Overstock %
      chartData = {
        labels: ['Overstock', 'Normal Stock', 'Understock'],
        datasets: [{
          data: [30, 50, 20],
          backgroundColor: ['#dc3545', '#28a745', '#ffc107']
        }]
      };
      break;

    case 'd3-3': // DOI
      chartData = {
        labels: ['1-30 days', '31-60 days', '61-90 days', '90+ days'],
        datasets: [{
          label: 'Days',
          data: [40, 30, 20, 10],
          backgroundColor: '#0d6efd'
        }]
      };
      break;

    case 'd3-4': // Accuracy ≥80%
      chartData = {
        labels: ['≥80%', '<80%'],
        datasets: [{
          data: [75, 25],
          backgroundColor: ['#198754', '#dc3545']
        }]
      };
      break;

    case 'd3-5': // Before vs After
      chartData = {
        labels: ['Before', 'After'],
        datasets: [{
          label: 'KPI',
          data: [60, 80],
          backgroundColor: ['#dc3545', '#28a745']
        }]
      };
      break;

    case 'd3-7': // KPI Summary
      chartData = {
        labels: ['Inventory', 'Turnover', 'Forecast Accuracy'],
        datasets: [{
          label: 'Score',
          data: [80, 70, 90],
          backgroundColor: ['#0d6efd', '#ffc107', '#198754']
        }]
      };
      break;

    case 'd3-8': // Impact Analysis
      chartData = {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [{
          label: 'Impact',
          data: [15, 20, 10, 25],
          backgroundColor: '#6f42c1'
        }]
      };
      break;

    default:
      chartData = {
        labels: [],
        datasets: []
      };
  }

  if(charts[cardId]) {
    charts[cardId].data = chartData;
    charts[cardId].update();
  } else {
    charts[cardId] = new Chart(ctx, {
      type: type,
      data: chartData,
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: { enabled: true }
        }
      }
    });
  }
}

// Event listeners
dashboardSelector.addEventListener('change', () => {
  loadData();
});

dateSelector.addEventListener('change', () => {
  updateDashboard(dateSelector.value);
});

refreshBtn.addEventListener('click', () => {
  loadData();
});

// โหลดข้อมูลครั้งแรกเมื่อเปิดหน้าเว็บ
loadData();
