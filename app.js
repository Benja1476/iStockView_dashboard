let data = {};
let chart1, chart2;

fetch('data_all_dashboards.json')
  .then(res => res.json())
  .then(json => {
    data = json;
    setupSelectors();
    renderCurrentDashboard();
  });

function setupSelectors() {
  const monthSelect = document.getElementById('monthSelect');
  const dashboardSelect = document.getElementById('dashboardSelect');

  const months = Object.keys(data.dashboard1);
  months.forEach(month => {
    const option = document.createElement('option');
    option.value = month;
    option.textContent = month;
    monthSelect.appendChild(option);
  });

  monthSelect.addEventListener('change', renderCurrentDashboard);
  dashboardSelect.addEventListener('change', renderCurrentDashboard);
}

function renderCurrentDashboard() {
  const month = document.getElementById('monthSelect').value;
  const dashboard = document.getElementById('dashboardSelect').value;

  const chartData = data[dashboard]?.[month];
  if (!chartData) return;

  const ctx1 = document.getElementById('chart1').getContext('2d');
  const ctx2 = document.getElementById('chart2').getContext('2d');

  if (chart1) chart1.destroy();
  if (chart2) chart2.destroy();

  chart1 = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: chartData.abc.labels,
      datasets: [{
        label: 'ABC',
        data: chartData.abc.values,
        backgroundColor: ['#f39c12', '#27ae60', '#c0392b']
      }]
    }
  });

  chart2 = new Chart(ctx2, {
    type: 'pie',
    data: {
      labels: chartData.fsn.labels,
      datasets: [{
        label: 'FSN',
        data: chartData.fsn.values,
        backgroundColor: ['#3498db', '#9b59b6', '#1abc9c']
      }]
    }
  });
}
