let dashboardData = null;
const dashboardSelect = document.getElementById('dashboardSelect');
const dateSelect = document.getElementById('dateSelect');
const dashboardContainer = document.getElementById('dashboardContainer');
const dashboardTitle = document.getElementById('dashboardTitle');
const tableHead = document.getElementById('tableHead');
const tableBody = document.getElementById('tableBody');
const chartCanvas = document.getElementById('chartCanvas').getContext('2d');

let currentChart = null;

async function loadData() {
  try {
    const res = await fetch('data_all_dashboards.json');
    dashboardData = await res.json();
    populateDates();
    renderDashboard();
  } catch (err) {
    dashboardContainer.innerHTML = `<p style="color:#f55;">Error loading data: ${err}</p>`;
  }
}

function populateDates() {
  dateSelect.innerHTML = '';
  if (!dashboardData) return;
  const selectedDashboard = dashboardSelect.value;
  const datesSet = new Set(dashboardData[selectedDashboard].map(d => d.date));
  const dates = Array.from(datesSet).sort();

  for (const d of dates) {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    dateSelect.appendChild(opt);
  }
}

function clearTable() {
  tableHead.innerHTML = '';
  tableBody.innerHTML = '';
}

function createTableHeaders(columns) {
  const tr = document.createElement('tr');
  for (const col of columns) {
    const th = document.createElement('th');
    th.textContent = col;
    tr.appendChild(th);
  }
  tableHead.appendChild(tr);
}

function createTableRows(data, columns) {
  data.forEach(row => {
    const tr = document.createElement('tr');
    for (const col of columns) {
      const td = document.createElement('td');
      td.textContent = row[col.toLowerCase()] ?? ''; // map lowercase keys
      tr.appendChild(td);
    }
    tableBody.appendChild(tr);
  });
}

function renderDashboard() {
  if (!dashboardData) return;

  const dashId = dashboardSelect.value;
  const selectedDate = dateSelect.value;
  const data = dashboardData[dashId].filter(d => d.date === selectedDate);

  // Clear old chart
  if (currentChart) {
    currentChart.destroy();
    currentChart = null;
  }

  clearTable();

  if (dashId === '1') {
    dashboardTitle.textContent = 'Strategic Inventory Health & Risk';

    createTableHeaders(['Item', 'Qty', 'Recommendation']);
    createTableRows(data, ['Item', 'Qty', 'Recommendation']);

    currentChart = new Chart(chartCanvas, {
      type: 'bar',
      data: {
        labels: data.map(r => r.item),
        datasets: [{
          label: 'Quantity',
          data: data.map(r => r.qty),
          backgroundColor: 'rgba(76, 175, 80, 0.7)',
          borderColor: 'rgba(76, 175, 80, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false,
        },
        scales: {
          y: { beginAtZero: true, ticks: { color: '#a8d5a2' } },
          x: { ticks: { color: '#a8d5a2' } }
        },
        plugins: {
          legend: { labels: { color: '#a8d5a2' } },
          tooltip: { enabled: true }
        }
      }
    });

  } else if (dashId === '2') {
    dashboardTitle.textContent = 'Planning Accuracy & Demand Risk';

    createTableHeaders(['Accuracy', 'MAPE', 'Bias']);
    createTableRows(data, ['Accuracy', 'MAPE', 'Bias']);

    currentChart = new Chart(chartCanvas, {
      type: 'line',
      data: {
        labels: data.map((_, i) => `Entry ${i + 1}`),
        datasets: [
          {
            label: 'Accuracy (%)',
            data: data.map(r => r.accuracy),
            borderColor: 'rgba(76, 175, 80, 1)',
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            fill: false,
            tension: 0.3
          },
          {
            label: 'MAPE',
            data: data.map(r => r.mape),
            borderColor: 'rgba(255, 193, 7, 1)',
            backgroundColor: 'rgba(255, 193, 7, 0.2)',
            fill: false,
            tension: 0.3
          },
          {
            label: 'Bias',
            data: data.map(r => r.bias),
            borderColor: 'rgba(244, 67, 54, 1)',
            backgroundColor: 'rgba(244, 67, 54, 0.2)',
            fill: false,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false,
        },
        scales: {
          y: { beginAtZero: true, ticks: { color: '#a8d5a2' } },
          x: { ticks: { color: '#a8d5a2' } }
        },
        plugins: {
          legend: {
            display: true,
            labels: { color: '#a8d5a2' },
            onClick: (e, legendItem, legend) => {
              const index = legendItem.datasetIndex;
              const ci = legend.chart;
              const meta = ci.getDatasetMeta(index);
              meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
              ci.update();
            }
          },
          tooltip: { enabled: true }
        }
      }
    });

  } else if (dashId === '3') {
    dashboardTitle.textContent = 'Strategic Action & Impact';

    createTableHeaders(['Value', 'Impact', 'Action']);
    createTableRows(data, ['Value', 'Impact', 'Action']);

    // Pie chart data aggregation by Action
    const impactMap = {};
    data.forEach(r => {
      impactMap[r.action] = (impactMap[r.action] || 0) + r.impact;
    });

    currentChart = new Chart(chartCanvas, {
      type: 'pie',
      data: {
        labels: Object.keys(impactMap),
        datasets: [{
          label: 'Impact',
          data: Object.values(impactMap),
          backgroundColor: [
            'rgba(76, 175, 80, 0.7)',
            'rgba(255, 193, 7, 0.7)',
            'rgba(244, 67, 54, 0.7)',
            'rgba(33, 150, 243, 0.7)',
            'rgba(156, 39, 176, 0.7)'
          ],
          borderColor: '#1e1e2f',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#a8d5a2' },
            onClick: (e, legendItem, legend) => {
              const index = legendItem.index;
              const ci = legend.chart;
              const meta = ci.getDatasetMeta(0);
              meta.data[index].hidden = !meta.data[index].hidden;
              ci.update();
            }
          },
          tooltip: { enabled: true }
        }
      }
    });
  }
}

// Event listeners เปลี่ยนตัวเลือกให้แสดงข้อมูลทันที (interactive)
dashboardSelect.addEventListener('change', () => {
  populateDates();
  renderDashboard();
});
dateSelect.addEventListener('change', () => renderDashboard());

loadData();
