let data = {};

fetch('data_all_dashboards.json')
  .then((res) => res.json())
  .then((json) => {
    data = json;
    populateMonthOptions();
    renderCurrentDashboard();
  });

function populateMonthOptions() {
  const monthSelect = document.getElementById('monthSelect');
  const months = Object.keys(data["dashboard1"]);
  months.forEach(month => {
    const option = document.createElement('option');
    option.value = month;
    option.textContent = month;
    monthSelect.appendChild(option);
  });
  monthSelect.addEventListener('change', renderCurrentDashboard);
  document.getElementById('dashboardSelect').addEventListener('change', renderCurrentDashboard);
}

function renderCurrentDashboard() {
  const dashboard = document.getElementById('dashboardSelect').value;
  const month = document.getElementById('monthSelect').value;
  const chartData = data[dashboard]?.[month];

  if (!chartData) {
    alert("ไม่มีข้อมูลสำหรับเดือนนี้");
    return;
  }

  const ctx1 = document.getElementById('chart1').getContext('2d');
  const ctx2 = document.getElementById('chart2').getContext('2d');

  if (window.chart1) window.chart1.destroy();
  if (window.chart2) window.chart2.destroy();

  window.chart1 = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: chartData.abc.labels,
      datasets: [{
        label: 'ABC Category',
        data: chartData.abc.values,
        backgroundColor: ['#f39c12', '#27ae60', '#c0392b']
      }]
    }
  });

  window.chart2 = new Chart(ctx2, {
    type: 'pie',
    data: {
      labels: chartData.fsn.labels,
      datasets: [{
        label: 'FSN Category',
        data: chartData.fsn.values,
        backgroundColor: ['#2980b9', '#8e44ad', '#2ecc71']
      }]
    }
  });
}
