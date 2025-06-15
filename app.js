let allData = null;
let filteredData = null;

const ctx1a = document.getElementById('chart1a').getContext('2d');
const ctx1b = document.getElementById('chart1b').getContext('2d');
const ctx1c = document.getElementById('chart1c').getContext('2d');

let chart1a, chart1b, chart1c;

document.addEventListener('DOMContentLoaded', async () => {
  // โหลดข้อมูล JSON
  const response = await fetch('data_all_dashboards.json');
  allData = await response.json();

  // ตั้งค่าวันที่เริ่มต้น - สิ้นสุด เป็นค่าใน data
  setDateInputs();

  // สร้าง event listener ปุ่ม filter
  document.getElementById('filterBtn').addEventListener('click', () => {
    applyFilterAndRender();
  });

  // สลับ tab dashboard
  document.querySelectorAll('.dashboard-tabs button').forEach(btn => {
    btn.addEventListener('click', e => {
      document.querySelectorAll('.dashboard-tabs button').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');

      document.querySelectorAll('.dashboard').forEach(sec => sec.classList.remove('active'));
      const dashNum = e.target.getAttribute('data-dash');
      document.getElementById('dashboard' + dashNum).classList.add('active');

      applyFilterAndRender();
    });
  });

  applyFilterAndRender();
});

function setDateInputs() {
  // หา min max วันที่ใน data (dashboard1 ตัวอย่าง)
  const dates = allData.dashboard1.map(d => new Date(d.date));
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));

  const startInput = document.getElementById('startDate');
  const endInput = document.getElementById('endDate');

  startInput.valueAsDate = minDate;
  endInput.valueAsDate = maxDate;
  startInput.min = formatDate(minDate);
  endInput.max = formatDate(maxDate);
}

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

function applyFilterAndRender() {
  const startDate = new Date(document.getElementById('startDate').value);
  const endDate = new Date(document.getElementById('endDate').value);

  // กรองข้อมูลตามวันที่
  filteredData = {
    dashboard1: allData.dashboard1.filter(d => {
      const dt = new Date(d.date);
      return dt >= startDate && dt <= endDate;
    }),
    dashboard2: allData.dashboard2.filter(d => {
      const dt = new Date(d.date);
      return dt >= startDate && dt <= endDate;
    }),
    dashboard3: allData.dashboard3.filter(d => {
      const dt = new Date(d.date);
      return dt >= startDate && dt <= endDate;
    }),
  };

  renderDashboard1();
  renderDashboard2();
  renderDashboard3();
}

function renderDashboard1() {
  // ตัวอย่างกราฟ1a: DOI by Category Bar Chart
  const categories = [...new Set(filteredData.dashboard1.map(d => d.category))];
  const avgDoiByCat = categories.map(cat => {
    const filtered = filteredData.dashboard1.filter(d => d.category === cat);
    const avg = filtered.reduce((sum, item) => sum + item.doi, 0) / filtered.length || 0;
    return avg.toFixed(2);
  });

  if (chart1a) chart1a.destroy();
  chart1a = new Chart(ctx1a, {
    type: 'bar',
    data: {
      labels: categories,
      datasets: [{
        label: 'Average DOI',
        data: avgDoiByCat,
        backgroundColor: '#007bff',
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  // สร้างกราฟอื่น ๆ ใน dashboard1 ที่เหลือตามที่คุณต้องการ (turnover, risk level, etc)

  // เติมตาราง
  const tbody = document.querySelector('#table1 tbody');
  tbody.innerHTML = '';
  filteredData.dashboard1.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${row.sku}</td><td>${row.category}</td><td>${row.doi}</td><td>${row.turnover}</td><td>${row.risk}</td>`;
    tbody.appendChild(tr);
  });
}

function renderDashboard2() {
  // ตัวอย่างกราฟ
  const ctx2a = document.getElementById('chart2a').getContext('2d');
  const ctx2b = document.getElementById('chart2b').getContext('2d');

  // Forecast Accuracy (line chart by SKU)
  const skus = [...new Set(filteredData.dashboard2.map(d => d.sku))];
  const datasets = skus.map(sku => {
    const points = filteredData.dashboard2.filter(d => d.sku === sku).map(d => ({x: d.date, y: d.forecastAccuracy}));
    return {
      label: sku,
      data: points,
      borderColor: getRandomColor(),
      fill: false,
      tension: 0.2,
    };
  });

  if (window.chart2a) window.chart2a.destroy();
  window.chart2a = new Chart(ctx2a, {
    type: 'line',
    data: { datasets },
    options: {
      parsing: { xAxisKey: 'x', yAxisKey: 'y' },
      scales: {
        x: { type: 'time', time: { unit: 'day' } },
        y: { min: 0, max: 1 }
      }
    }
  });

  // Demand Risk Pie Chart
  const riskCounts = filteredData.dashboard2.reduce((acc, cur) => {
    acc[cur.demandRisk] = (acc[cur.demandRisk] || 0) + 1;
    return acc;
  }, {});

  if (window.chart2b) window.chart2b.destroy();
  window.chart2b = new Chart(ctx2b, {
    type: 'pie',
    data: {
      labels: Object.keys(riskCounts),
      datasets: [{
        data: Object.values(riskCounts),
        backgroundColor: ['#dc3545', '#ffc107', '#28a745'],
      }]
    }
  });

  // ตาราง dashboard2
  const tbody2 = document.querySelector('#table2 tbody');
  tbody2.innerHTML = '';
  filteredData.dashboard2.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${row.sku}</td><td>${(row.forecastAccuracy*100).toFixed(1)}%</td><td>${row.demandRisk}</td>`;
    tbody2.appendChild(tr);
  });
}

function renderDashboard3() {
  // กราฟ Impact Score Bar Chart
  const ctx3a = document.getElementById('chart3a').getContext('2d');
  const actions = filteredData.dashboard3.map(d => d.action);
  const impactScores = filteredData.dashboard3.map(d => d.impactScore);

  if (window.chart3a) window.chart3a.destroy();
  window.chart3a = new Chart(ctx3a, {
    type: 'bar',
    data: {
      labels: actions,
      datasets: [{
        label: 'Impact Score',
        data: impactScores,
        backgroundColor: '#28a745',
      }]
    }
  });

  // ตาราง dashboard3
  const tbody3 = document.querySelector('#table3 tbody');
  tbody3.innerHTML = '';
  filteredData.dashboard3.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${row.action}</td><td>${row.impactScore}</td><td>${row.status}</td>`;
    tbody3.appendChild(tr);
  });
}

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for(let i=0; i<6; i++){
    color += letters[Math.floor(Math.random()*16)];
  }
  return color;
}
