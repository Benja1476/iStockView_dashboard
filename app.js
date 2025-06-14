const dashboardGrid = document.getElementById('dashboardGrid');
let dashboardData = null;
let charts = [];

async function loadData() {
  try {
    const res = await fetch('data_all_dashboards.json');
    dashboardData = await res.json();
    renderAllDashboards();
  } catch (err) {
    dashboardGrid.innerHTML = `<p style="color:#f55;">Error loading data: ${err}</p>`;
  }
}

function clearCharts() {
  charts.forEach(c => c.destroy());
  charts = [];
}

function renderAllDashboards() {
  if (!dashboardData) return;
  clearCharts();
  dashboardGrid.innerHTML = '';

  // สมมติ dashboardData เป็น object เช่น "1", "2", ... "9"
  const keys = Object.keys(dashboardData).slice(0, 9); // 9 dashboard ย่อย

  keys.forEach((dashId, i) => {
    const container = document.createElement('section');
    container.classList.add('dashboard-tile');

    // ชื่อ dashboard
    const title = document.createElement('h3');
    title.textContent = `Dashboard ${dashId}`;
    container.appendChild(title);

    // canvas for chart
    const canvas = document.createElement('canvas');
    canvas.id = `chart${dashId}`;
    container.appendChild(canvas);

    // table container
    const tableContainer = document.createElement('div');
    tableContainer.classList.add('table-container');
    const table = document.createElement('table');
    table.id = `table${dashId}`;

    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    table.appendChild(thead);
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    container.appendChild(tableContainer);

    dashboardGrid.appendChild(container);

    renderSingleDashboard(dashId, dashboardData[dashId], canvas, thead, tbody);
  });
}

function renderSingleDashboard(dashId, data, canvas, thead, tbody) {
  if (!data || data.length === 0) return;

  // สร้างหัวตารางจากคีย์ข้อมูลของ object ตัวแรก
  const cols = Object.keys(data[0]).filter(k => k !== 'date');

  const trHead = document.createElement('tr');
  cols.forEach(c => {
    const th = document.createElement('th');
    th.textContent = c.charAt(0).toUpperCase() + c.slice(1);
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);

  // เพิ่มแถวข้อมูล
  data.forEach(row => {
    const tr = document.createElement('tr');
    cols.forEach(c => {
      const td = document.createElement('td');
      td.textContent = row[c];
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  // สร้างกราฟแบบง่าย โดยดู dashboardId
  let chartType = 'bar';
  let labels = data.map(d => d.date);
  let datasets = [];

  if (dashId === '1') {
    // ใช้ qty กับ item แสดง bar chart
    chartType = 'bar';
    labels = data.map(d => d.item || d.date);
    datasets = [{
      label: 'Quantity',
      data: data.map(d => d.qty || 0),
      backgroundColor: 'rgba(76, 175, 80, 0.7)',
      borderColor: 'rgba(76, 175, 80, 1)',
      borderWidth: 1
    }];
  } else if (dashId === '2') {
    chartType = 'line';
    datasets = [
      {
        label: 'Accuracy',
        data: data.map(d => d.accuracy || 0),
        borderColor: 'rgba(76, 175, 80, 1)',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        fill: false,
        tension: 0.3
      },
      {
        label: 'MAPE',
        data: data.map(d => d.mape || 0),
        borderColor: 'rgba(255, 193, 7, 1)',
        backgroundColor: 'rgba(255, 193, 7, 0.2)',
        fill: false,
        tension: 0.3
      },
      {
        label: 'Bias',
        data: data.map(d => d.bias || 0),
        borderColor: 'rgba(244, 67, 54, 1)',
        backgroundColor: 'rgba(244, 67, 54, 0.2)',
        fill: false,
        tension: 0.3
      }
    ];
  } else if (dashId === '3') {
    chartType = 'pie';
    // รวม impact ตาม action
    let impactMap = {};
    data.forEach(d => {
      if (d.action) impactMap[d.action] = (impactMap[d.action] || 0) + (d.impact || 0);
    });
    labels = Object.keys(impactMap);
    datasets = [{
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
    }];
  } else {
    // ถ้า dashId อื่นๆ ใช้ bar chart คอลัมน์ตัวแรกที่ไม่ใช่ date
    chartType = 'bar';
    const firstKey = Object.keys(data[0]).find(k => k !== 'date');
    labels = data.map(d => d.date);
    datasets = [{
      label: firstKey.charAt(0).toUpperCase() + firstKey.slice(1),
      data: data.map(d => d[firstKey] || 0),
      backgroundColor: 'rgba(76, 175, 80, 0.7)',
      borderColor: 'rgba(76, 175, 80, 1)',
      borderWidth: 1
    }];
  }

  // สร้าง Chart.js
  const ctx = canvas.getContext('2d');
  const chart = new Chart(ctx, {
    type: chartType,
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        legend: {
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
      },
      scales: chartType !== 'pie' ? {
        x: { ticks: { color: '#a8d5a2' } },
        y: { ticks: { color: '#a8d5a2' }, beginAtZero: true }
      } : {}
    }
  });

  charts.push(chart);
}

loadData();
