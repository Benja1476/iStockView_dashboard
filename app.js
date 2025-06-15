let abcPieChart, turnoverLineChart, riskHeatmapChart;

async function loadData() {
  const res = await fetch('data_all_dashboards.json');
  const data = await res.json();
  return data;
}

function formatNumber(num) {
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function createKPI(data) {
  document.getElementById('kpiCapital').textContent = formatNumber(data.investedCapital) + " ฿";
  document.getElementById('kpiTurnover').textContent = formatNumber(data.turnoverRate) + " ครั้ง/ปี";
  document.getElementById('kpiDOI').textContent = formatNumber(data.doi) + " วัน";
}

function createABCPieChart(data) {
  const ctx = document.getElementById('abcPieChart').getContext('2d');
  if (abcPieChart) abcPieChart.destroy();

  abcPieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(data),
      datasets: [{
        data: Object.values(data),
        backgroundColor: ['#27ae60', '#f39c12', '#e74c3c']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { enabled: true }
      }
    }
  });
}

function createTurnoverLineChart(data) {
  const ctx = document.getElementById('turnoverLineChart').getContext('2d');
  if (turnoverLineChart) turnoverLineChart.destroy();

  turnoverLineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.'],
      datasets: [{
        label: 'Turnover Rate',
        data: data,
        borderColor: '#2980b9',
        backgroundColor: 'rgba(41, 128, 185, 0.2)',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });
}

function createRiskHeatmapChart(data) {
  // ใช้ Bar chart แทน heatmap แบบง่าย
  const ctx = document.getElementById('riskHeatmapChart').getContext('2d');
  if (riskHeatmapChart) riskHeatmapChart.destroy();

  riskHeatmapChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.product),
      datasets: [{
        label: 'Risk Score',
        data: data.map(d => d.risk),
        backgroundColor: data.map(d => d.risk > 75 ? '#e74c3c' : '#f39c12')
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, max: 100 }
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
      }
    }
  });
}

async function updateDashboard() {
  const dateRange = document.getElementById('dateRange').value;
  const category = document.getElementById('categorySelect').value;

  const data = await loadData();

  // กรองข้อมูล
  let selectedData = data[dateRange];
  if (!selectedData) return;

  let categoryData = category === 'all' ? {
    investedCapital: 0,
    turnoverRate: 0,
    doi: 0,
    abcDistribution: { A: 0, B: 0, C: 0 },
    turnoverTrend: [],
    riskHeatmap: []
  } : selectedData.categories[category];

  // หากเลือก all ให้รวมข้อมูลทุก category
  if (category === 'all') {
    let totalCapital = 0, totalTurnover = 0, totalDOI = 0, count = 0;
    let abcSum = { A: 0, B: 0, C: 0 };
    let turnoverTrendSum = [0,0,0,0];
    let riskHeatmapAll = [];

    for (const catKey in selectedData.categories) {
      const cat = selectedData.categories[catKey];
      totalCapital += cat.investedCapital;
      totalTurnover += cat.turnoverRate;
      totalDOI += cat.doi;
      count++;

      abcSum.A += cat.abcDistribution.A;
      abcSum.B += cat.abcDistribution.B;
      abcSum.C += cat.abcDistribution.C;

      for (let i=0; i<4; i++) turnoverTrendSum[i] += cat.turnoverTrend[i];

      riskHeatmapAll = riskHeatmapAll.concat(cat.riskHeatmap);
    }

    categoryData = {
      investedCapital: totalCapital,
      turnoverRate: (totalTurnover / count).toFixed(2),
      doi: (totalDOI / count).toFixed(2),
      abcDistribution: abcSum,
      turnoverTrend: turnoverTrendSum.map(x => x / count),
      riskHeatmap: riskHeatmapAll
    };
  }

  // แสดง KPI
  createKPI(categoryData);

  // สร้างกราฟ
  createABCPieChart(categoryData.abcDistribution);
  createTurnoverLineChart(categoryData.turnoverTrend);
  createRiskHeatmapChart(categoryData.riskHeatmap);
}

document.getElementById('dateRange').addEventListener('change', updateDashboard);
document.getElementById('categorySelect').addEventListener('change', updateDashboard);

// โหลดข้อมูลตอนเริ่ม
updateDashboard();
