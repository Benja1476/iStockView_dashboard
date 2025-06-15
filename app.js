function showTab(id) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

fetch('data_all_dashboards.json')
  .then(res => res.json())
  .then(data => {
    renderDashboard1(data);
    renderDashboard2(data);
    renderDashboard3(data);
  });

function renderDashboard1(data) {
  new Chart(document.getElementById('chart1_abc'), {
    type: 'bar',
    data: {
      labels: data.dashboard1.abc.labels,
      datasets: [{
        label: 'Inventory Value',
        data: data.dashboard1.abc.values,
        backgroundColor: ['#4caf50', '#ff9800', '#f44336']
      }]
    }
  });

  new Chart(document.getElementById('chart1_fsn'), {
    type: 'pie',
    data: {
      labels: data.dashboard1.fsn.labels,
      datasets: [{
        data: data.dashboard1.fsn.counts,
        backgroundColor: ['#03a9f4', '#8bc34a', '#ff5722']
      }]
    }
  });

  new Chart(document.getElementById('chart1_turnover'), {
    type: 'line',
    data: {
      labels: data.dashboard1.turnover.months,
      datasets: [{
        label: 'Turnover Ratio',
        data: data.dashboard1.turnover.values,
        borderColor: '#673ab7',
        fill: false
      }]
    }
  });

  new Chart(document.getElementById('chart1_doi'), {
    type: 'bar',
    data: {
      labels: data.dashboard1.doi.items,
      datasets: [{
        label: 'DOI',
        data: data.dashboard1.doi.values,
        backgroundColor: '#009688'
      }]
    }
  });

  new Chart(document.getElementById('chart1_risk'), {
    type: 'doughnut',
    data: {
      labels: data.dashboard1.risk.labels,
      datasets: [{
        label: 'Inventory at Risk',
        data: data.dashboard1.risk.values,
        backgroundColor: ['#e91e63', '#cddc39', '#2196f3']
      }]
    }
  });
}

function renderDashboard2(data) {
  new Chart(document.getElementById('chart2'), {
    type: 'bar',
    data: {
      labels: data.dashboard2.labels,
      datasets: [{
        label: 'Forecast Accuracy',
        data: data.dashboard2.accuracy,
        backgroundColor: '#607d8b'
      }]
    }
  });
}

function renderDashboard3(data) {
  new Chart(document.getElementById('chart3'), {
    type: 'pie',
    data: {
      labels: data.dashboard3.labels,
      datasets: [{
        label: 'Strategic Impact',
        data: data.dashboard3.values,
        backgroundColor: ['#795548', '#009688', '#03a9f4']
      }]
    }
  });
}
