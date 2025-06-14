let dashboardsData = {};
let charts = {};
let currentBigDash = null;
let currentSubDash = null;
let currentDate = null;

async function loadAllData() {
  const files = ['data_dashboard1.json', 'data_dashboard2.json', 'data_dashboard3.json'];
  dashboardsData = {};

  for (let i = 0; i < files.length; i++) {
    const res = await fetch(files[i]);
    dashboardsData[`dashboard${i+1}`] = await res.json();
  }

  populateBigDashboardSelect();
}

function populateBigDashboardSelect() {
  const select = document.getElementById('bigDashboardSelect');
  select.innerHTML = `
    <option value="dashboard1">1️⃣ Strategic Inventory Health & Risk</option>
    <option value="dashboard2">2️⃣ Planning Accuracy & Demand Risk</option>
    <option value="dashboard3">3️⃣ Strategic Action & Impact (Executive Scorecard)</option>
  `;

  select.onchange = () => {
    currentBigDash = select.value;
    populateSubDashboardSelect();
  };

  select.value = 'dashboard1';
  currentBigDash = 'dashboard1';
  populateSubDashboardSelect();
}

function populateSubDashboardSelect() {
  const select = document.getElementById('subDashboardSelect');
  select.innerHTML = '';
  const subDashboards = dashboardsData[currentBigDash].subDashboards;

  subDashboards.forEach((sub, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = `${idx+1}. ${sub.name}`;
    select.appendChild(opt);
  });

  select.onchange = () => {
    currentSubDash = parseInt(select.value);
    populateDateSelect();
  };

  select.value = 0;
  currentSubDash = 0;
  populateDateSelect();
}

function populateDateSelect() {
  const select = document.getElementById('dateSelect');
  select.innerHTML = '';
  const dates = dashboardsData[currentBigDash].subDashboards[currentSubDash].dates;

  dates.forEach((d, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = d.date;
    select.appendChild(opt);
  });

  select.onchange = () => {
    currentDate = parseInt(select.value);
    renderDashboard();
  };

  select.value = 0;
  currentDate = 0;
  renderDashboard();
}

function renderDashboard() {
  const data = dashboardsData[currentBigDash].subDashboards[currentSubDash].dates[currentDate].data;

  // กราฟแท่งแสดง qty ของแต่ละ item
  const labels = data.map(d => d.item);
  const qtys = data.map(d => d.qty);

  const ctx = document.getElementById('mainChart').getContext('2d');

  if (charts.mainChart) {
    charts.mainChart.destroy();
  }

  charts.mainChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Quantity',
        data: qtys,
        backgroundColor: 'rgba(54, 162, 235, 0.7)'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true }
      }
    }
  });
}

document.getElementById('refreshBtn').addEventListener('click', () => {
  loadAllData();
});

loadAllData();
