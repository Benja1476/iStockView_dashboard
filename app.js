// โหลดข้อมูล JSON
async function loadData() {
    const response = await fetch('data_all_dashboards.json');
    const data = await response.json();
    return data;
}

// สร้างกราฟจากข้อมูล dashboard1
function renderDashboard1(data) {
    const ctx = document.getElementById('chart1').getContext('2d');
    if(window.chart1) window.chart1.destroy();

    window.chart1 = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.dashboard1.labels,
            datasets: [{
                label: 'Total Quantity',
                data: data.dashboard1.totalQty,
                backgroundColor: 'rgba(75, 192, 192, 0.6)'
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: true } }
        }
    });
}

// สร้างกราฟจากข้อมูล dashboard2
function renderDashboard2(data) {
    const ctx = document.getElementById('chart2').getContext('2d');
    if(window.chart2) window.chart2.destroy();

    window.chart2 = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.dashboard2.labels,
            datasets: [{
                label: 'Forecast Accuracy',
                data: data.dashboard2.accuracy,
                borderColor: 'rgba(54, 162, 235, 0.8)',
                fill: false,
                tension: 0.3
            }]
        },
        options: { responsive: true }
    });
}

// สร้างกราฟจากข้อมูล dashboard3
function renderDashboard3(data) {
    const ctx = document.getElementById('chart3').getContext('2d');
    if(window.chart3) window.chart3.destroy();

    window.chart3 = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.dashboard3.labels,
            datasets: [{
                label: 'Strategic Actions',
                data: data.dashboard3.values,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(54, 162, 235, 0.6)'
                ]
            }]
        },
        options: { responsive: true }
    });
}

// สลับแท็บ
function setupTabs(data) {
    const buttons = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.tab-content');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');

            // แสดงกราฟตามแท็บ
            if (btn.dataset.tab === 'dashboard1') renderDashboard1(data);
            else if (btn.dataset.tab === 'dashboard2') renderDashboard2(data);
            else if (btn.dataset.tab === 'dashboard3') renderDashboard3(data);
        });
    });

    // โหลดกราฟหน้าแรกอัตโนมัติ
    renderDashboard1(data);
}

// เริ่มต้นโหลดข้อมูลและตั้งค่าหน้า
loadData().then(data => {
    setupTabs(data);
}).catch(err => {
    console.error('Error loading data:', err);
});
