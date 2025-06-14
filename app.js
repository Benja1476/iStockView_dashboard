const dashboardGrid = document.getElementById('dashboardGrid');
let dashboardData = null;
let charts = [];

async function loadData() {
  try {
    const response = await fetch('data_all_dashboards.json');
    dashboardData = await response.json();
    renderDashboards();
  } catch (error) {
    dashboardGrid.innerHTML = `<p style="color:#f55;">Error loading data: ${error.message}</p>`;
  }
}

function clearCharts() {
  charts.forEach(c => c.destroy());
  charts = [];
  dashboardGrid.innerHTML = '';
}

function renderDashboards() {
  if (!dashboardData) return;
  clearCharts();

  // กำหนดลำดับและชื่อ Dashboard (กำหนดเองตามต้องการ)
  const dashOrder = [
    {id: "1", title: "Strategic Inventory Health & Risk"},
    {id: "2", title: "Planning Accuracy & Demand Risk"},
    {id: "3", title: "Strategic Action & Impact"},
    {id: "4", title: "Operational Metrics"},
    {id: "5", title: "Supplier Performance"},
    {id: "6", title: "Category Spend Analysis"},
    {id: "7", title: "Customer Orders"},
    {id: "8", title: "Employee Performance"},
    {id: "9", title: "Label Value Trends"}
  ];

  dashOrder.forEach(({id, title}) => {
    const data = dashboardData[id] || [];
    const card = document.createElement('section');
    card.classList.add('dashboard-card');

    const h3 = document.createElement('h3');
    h3.textContent = title;
    card.appendChild(h3);

    // canvas for chart
    const canvas = document.createElement('canvas');
    canvas.id = `chart${id}`;
    card.appendChild(canvas);

    // table wrapper + table
    const tableWrapper = document.createElement('div');
    tableWrapper.classList.add('table-wrapper');
    const table = document.createElement('table');
    table.id = `table${id}`;

    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    table.appendChild(thead);
    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    card.appendChild(tableWrapper);

    dashboardGrid.appendChild(card);

    renderSingleDashboard(id, data, canvas, thead, tbody);
  });
}

function renderSingleDashboard(id, data, canvas, thead, tbody) {
  if (!data.length) return;

  // สร้างหัวตารางจาก object keys (ไม่เอา 'date' เพราะมันแสดงในกราฟ)
  const keys = Object.keys(data[0]).filter(k => k !== 'date');

  // สร้างหัวตาราง
  const trHead = document.createElement('tr');
  keys.forEach(k => {
    const th = document.createElement('th');
    th.textContent = k.charAt(0).toUpperCase() + k.slice(1);
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);

  // เติมข้อมูลแถว
  data.forEach(row => {
    const tr = document.createElement('tr');
    keys.forEach(k => {
      const td = document.createElement('td');
      td.textContent = row[k];
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  // สร้างกราฟ Chart.js ตาม Dashboard id
  const ctx = canvas.getContext('2d');
  let chartConfig = {};

  if (id === '1') {
    chartConfig = {
      type: 'bar',
      data: {
        labels: data.map(d => d.item || d.date),
        datasets: [{
          label: 'Quantity',
          data: data.map(d => d.qty || 0),
          backgroundColor: 'rgba(76, 175, 80, 0.7)',
          borderColor: 'rgba(76, 175, 80, 1)',
          borderWidth: 1
        }]
      },
      options: defaultOptions()
    };
  } else if (id === '2') {
    chartConfig = {
      type: 'line',
      data: {
        labels: data.map(d => d.date),
        datasets: [
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
        ]
      },
      options: defaultOptions()
    };
  } else if (id === '3') {
    // Pie chart by action impact sum
    const impactMap = {};
    data.forEach(d => {
      if (d.action) impactMap[d.action] = (impactMap[d.action] || 0) + (d.impact || 0);
    });
    chartConfig = {
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
          borderColor: '#121421',
          borderWidth: 2
        }]
      },
      options: defaultOptions(true)
    };
  } else {
    // Bar chart default แสดงคอลัมน์ตัวแรก (ไม่ใช่ date)
    const firstKey = Object.keys(data[0]).find(k => k !== 'date');
    chartConfig = {
      type: 'bar',
      data: {
        labels: data.map(d => d.date),
        datasets: [{
          label: firstKey.charAt(0).toUpperCase() + firstKey.slice(1),
          data: data.map(d => d[firstKey] || 0),
          backgroundColor: 'rgba(76, 175, 80, 0.7)',
          borderColor: 'rgba(76, 175, 80, 1)',
          borderWidth: 1
        }]
      },
      options: defaultOptions()
    };
  }

  const chart = new Chart(ctx, chartConfig);
  charts.push(chart);
}

function defaultOptions(isPie = false) {
  return {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: '#a3d5a2' },
        onClick: (e, legendItem, legend) => {
          const index = legendItem.datasetIndex;
          const chart = legend.chart;
          const meta = chart.getDatasetMeta(index);
          meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : null;
          chart.update();
        }
      },
      tooltip: { enabled: true }
    },
    scales: isPie ? {} : {
      x: { ticks: { color: '#a3d5a2' } },
      y: { ticks: { color: '#a3d5a2' }, beginAtZero: true }
    }
  };
}

loadData();
