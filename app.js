const dashboardFiles = {
  health_risk: 'data/health_risk.json',
  planning_accuracy: 'data/planning_accuracy.json',
  strategic_action: 'data/strategic_action.json'
};

let rawData = [];
let charts = {};
const dashboardContainer = document.getElementById('dashboardContainer');
const dashboardSelect = document.getElementById('dashboardSelect');
const dateSelect = document.getElementById('dateSelect');
const refreshBtn = document.getElementById('refreshBtn');

async function loadData() {
  const dashboardKey = dashboardSelect.value;
  const url = dashboardFiles[dashboardKey];

  try {
    const res = await fetch(url);
    rawData = await res.json();

    // ดึงวันที่ไม่ซ้ำ
    const dates = [...new Set(rawData.map(d => d.date))].sort();

    // เติม selector วันที่
    dateSelect.innerHTML = '';
    dates.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      dateSelect.appendChild(opt);
    });

    // เลือกวันที่แรกถ้ายังไม่เลือก
    if (!dateSelect.value && dates.length > 0) {
      dateSelect.value = dates[0];
    }

    updateDashboard();

  } catch (err) {
    console.error('โหลดข้อมูลล้มเหลว:', err);
    dashboardContainer.innerHTML = `<p style="color:red;">โหลดข้อมูลล้มเหลว: ${err.message}</p>`;
  }
}

function updateDashboard() {
  const selectedDate = dateSelect.value;

  // กรองข้อมูลตามวันที่
  const dataByDate = rawData.filter(d => d.date === selectedDate);

  // เคลียร์ของเดิม
  dashboardContainer.innerHTML = '';
  charts = {}; // reset charts

  // ดึง list dashboard ย่อยจากข้อมูล (สมมติแต่ละ record มี dashboardName)
  // โดยกลุ่ม dashboard ย่อยที่กำหนดชื่อ (hardcoded) 8 ตัว ต่อแต่ละ Dashboard ใหญ่
  // ในตัวอย่างนี้สมมติว่า rawData มีฟิลด์ dashboardSubName, title, และ data สำหรับแต่ละ dashboard ย่อย

  // group by dashboardSubName
  const grouped = dataByDate.reduce((acc, cur) => {
    if (!acc[cur.dashboardSubName]) acc[cur.dashboardSubName] = [];
    acc[cur.dashboardSubName].push(cur);
    return acc;
  }, {});

  // สร้าง dashboard ย่อย ตามกลุ่ม
  for (const subName in grouped) {
    const groupData = grouped[subName];

    const card = document.createElement('div');
    card.className = 'card';

    const title = document.createElement('h3');
    title.textContent = subName;
    card.appendChild(title);

    // สมมติข้อมูลในแต่ละกลุ่มเป็น array ที่มี fields ต่างๆ
    // เช่น มี type chart หรือ table

    // แสดงเป็นกราฟถ้ามี field chartType
    if (groupData[0].chartType) {
      const canvas = document.createElement('canvas');
      canvas.id = `chart_${subName.replace(/\s/g, '_')}`;
      card.appendChild(canvas);

      const chartData = {
        labels: groupData[0].labels,
        datasets: groupData[0].datasets
      };

      const type = groupData[0].chartType;

      charts[canvas.id] = new Chart(canvas, {
        type: type,
        data: chartData,
        options: {
          responsive: true,
          plugins: {
            legend: { display: true, position: 'bottom' },
            tooltip: { enabled: true }
          }
        }
      });

    } else {
      // แสดงเป็นตาราง (สมมติ field tableHeaders, tableData)
      if (groupData[0].tableHeaders && groupData[0].tableData) {
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');

        // สร้าง header
        const trHead = document.createElement('tr');
        groupData[0].tableHeaders.forEach(h => {
          const th = document.createElement('th');
          th.textContent = h;
          trHead.appendChild(th);
        });
        thead.appendChild(trHead);

        // สร้าง body
        groupData[0].tableData.forEach(row => {
          const tr = document.createElement('tr');
          row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
          });
          tbody.appendChild(tr);
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        card.appendChild(table);
      }
    }

    dashboardContainer.appendChild(card);
  }
}

dashboardSelect.addEventListener('change', loadData);
dateSelect.addEventListener('change', updateDashboard);
refreshBtn.addEventListener('click', loadData);

// โหลดครั้งแรก
loadData();
