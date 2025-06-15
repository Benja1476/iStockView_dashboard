// app.js
let dashboardData = {};
let currentDashboard = 'dashboard1';

function switchDashboard(id) {
  document.querySelectorAll('.dashboard').forEach(d => d.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  currentDashboard = id;
  renderCharts();
}

function onDateChange() {
  renderCharts();
}

function populateDateSelector(data) {
  const dateSet = new Set(data.map(d => d['Date Load']));
  const selector = document.getElementById('dateLoad');
  selector.innerHTML = '';
  [...dateSet].sort().reverse().forEach(date => {
    const option = document.createElement('option');
    option.value = date;
    option.textContent = date;
    selector.appendChild(option);
  });
}

function fetchData() {
  fetch('data_all_dashboards.json')
    .then(res => res.json())
    .then(data => {
      dashboardData = data;
      populateDateSelector(data);
      renderCharts();
    });
}

function renderCharts() {
  const selectedDate = document.getElementById('dateLoad').value;
  const filteredData = dashboardData.filter(d => d['Date Load'] === selectedDate);
  
  if (currentDashboard === 'dashboard1') {
    renderABCChart(filteredData);
    renderFSNChart(filteredData);
    renderDOIChart(filteredData);
  } else if (currentDashboard === 'dashboard2') {
    renderAccuracyChart(filteredData);
    renderForecastChart(filteredData);
  } else if (currentDashboard === 'dashboard3') {
    renderUrgencyChart(filteredData);
    renderOpportunityChart(filteredData);
  }
}

function renderABCChart(data) {
  const ctx = document.getElementById('abcChart').getContext('2d');
  const counts = { A: 0, B: 0, C: 0 };
  data.forEach(d => counts[d['ABC Category']]++);
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['A', 'B', 'C'],
      datasets: [{
        data: [counts.A, counts.B, counts.C],
        backgroundColor: ['#4caf50', '#ff9800', '#f44336']
      }]
    }
  });
}

function renderFSNChart(data) {
  const ctx = document.getElementById('fsnChart').getContext('2d');
  const counts = { F: 0, S: 0, N: 0 };
  data.forEach(d => counts[d['FSN Category']]++);
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['F', 'S', 'N'],
      datasets: [{
        data: [counts.F, counts.S, counts.N],
        backgroundColor: ['#2196f3', '#ffeb3b', '#9e9e9e']
      }]
    }
  });
}

function renderDOIChart(data) {
  const ctx = document.getElementById('doiChart').getContext('2d');
  const items = data.map(d => d['Item number']);
  const values = data.map(d => d['DOI']);
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: items,
      datasets: [{
        label: 'DOI',
        data: values,
        backgroundColor: '#3f51b5'
      }]
    },
    options: { scales: { x: { display: false } } }
  });
}

function renderAccuracyChart(data) {
  const ctx = document.getElementById('accuracyChart').getContext('2d');
  const items = data.map(d => d['Item number']);
  const values = data.map(d => d['Forecast Accuracy']);
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: items,
      datasets: [{
        label: 'Forecast Accuracy',
        data: values,
        backgroundColor: '#009688'
      }]
    },
    options: { scales: { x: { display: false } } }
  });
}

function renderForecastChart(data) {
  const ctx = document.getElementById('forecastChart').getContext('2d');
  const items = data.map(d => d['Item number']);
  const forecast = data.map(d => d['ForecastQty']);
  const actual = data.map(d => d['ActualQty']);
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: items,
      datasets: [
        {
          label: 'Forecast Qty',
          data: forecast,
          borderColor: '#ff9800'
        },
        {
          label: 'Actual Qty',
          data: actual,
          borderColor: '#4caf50'
        }
      ]
    },
    options: { scales: { x: { display: false } } }
  });
}

function renderUrgencyChart(data) {
  const ctx = document.getElementById('urgencyChart').getContext('2d');
  const urgencyGroups = {};
  data.forEach(d => {
    const flag = d['Urgency Flag'];
    urgencyGroups[flag] = (urgencyGroups[flag] || 0) + 1;
  });
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(urgencyGroups),
      datasets: [{
        label: 'Items',
        data: Object.values(urgencyGroups),
        backgroundColor: '#e91e63'
      }]
    }
  });
}

function renderOpportunityChart(data) {
  const ctx = document.getElementById('opportunityChart').getContext('2d');
  const opportunities = data.filter(d => d['OpportunityCostFlag'] !== null);
  const items = opportunities.map(d => d['Item number']);
  const values = opportunities.map(d => d['InventoryValue']);
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: items,
      datasets: [{
        label: 'Inventory Value at Risk',
        data: values,
        backgroundColor: '#f44336'
      }]
    },
    options: { scales: { x: { display: false } } }
  });
}

fetchData();
