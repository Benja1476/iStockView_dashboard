// app.js

// ตัวแปรเก็บข้อมูลจำลอง (จริงๆ โหลดจากไฟล์ JSON ได้)
const dashboards = {
  "2025-05": [
    {
      dashboardSubName: "Forecast Accuracy",
      chartType: "line",
      labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"],
      datasets: [
        {
          label: "Accuracy %",
          data: [85, 87, 90, 88, 92],
          borderColor: "rgba(75, 192, 192, 1)",
          fill: false,
        },
      ],
      tableHeaders: ["Date", "Status", "Change"],
      tableData: [
        ["2025-05-01", "ปรับ Safety Stock", "เสร็จสิ้น +5% Accuracy"],
        ["2025-05-15", "ปรับแผนจัดซื้อ", "ระหว่างดำเนินการ -10% Overstock"],
        ["2025-06-01", "วิเคราะห์ Risk", "รอดำเนินการ Pending"],
      ],
    },
  ],
  "2025-06": [
    {
      dashboardSubName: "Top Improvement Items",
      tableHeaders: ["Item", "Impact", "Priority"],
      tableData: [
        ["Item A", "+10% Accuracy", "High"],
        ["Item B", "-5% Overstock", "Medium"],
        ["Item C", "+3% Fill Rate", "Low"],
      ],
    },
    {
      dashboardSubName: "Risk vs Action Correlation",
      chartType: "scatter",
      datasets: [
        {
          label: "Items",
          data: [
            { x: 90, y: 5 },
            { x: 75, y: 10 },
            { x: 60, y: 15 },
            { x: 45, y: 20 },
          ],
          backgroundColor: "#007bff",
        },
      ],
    },
  ],
};

// ดึง element
const dashboardSelect = document.getElementById("dashboardSelect");
const dateSelect = document.getElementById("dateSelect");
const dashboardContainer = document.getElementById("dashboardContainer");

// โหลด dropdown วันที่
function loadDates() {
  Object.keys(dashboards).forEach((date) => {
    const option = document.createElement("option");
    option.value = date;
    option.textContent = date;
    dateSelect.appendChild(option);
  });
}

// โหลด dashboard ตามวันที่เลือก
function loadDashboard(date) {
  dashboardContainer.innerHTML = "";
  if (!date || !dashboards[date]) return;

  dashboards[date].forEach((dash, index) => {
    // สร้างกล่อง Dashboard ย่อย
    const dashBox = document.createElement("div");
    dashBox.className = "dashboard-sub";

    // ชื่อ dashboard ย่อย
    const title = document.createElement("h3");
    title.textContent = dash.dashboardSubName;
    dashBox.appendChild(title);

    // ถ้ามี chartType สร้าง canvas
    if (dash.chartType) {
      const canvas = document.createElement("canvas");
      canvas.id = `chart-${date}-${index}`;
      dashBox.appendChild(canvas);

      // สร้าง chart ด้วย Chart.js
      const ctx = canvas.getContext("2d");
      new Chart(ctx, {
        type: dash.chartType,
        data: {
          labels: dash.labels || [],
          datasets: dash.datasets,
        },
        options: {
          responsive: true,
          scales: {
            x: dash.chartType === "scatter" ? { type: "linear", position: "bottom" } : {},
          },
        },
      });
    }

    // ถ้ามี tableData สร้างตาราง
    if (dash.tableData) {
      const table = document.createElement("table");
      table.className = "data-table";

      // header
      const thead = document.createElement("thead");
      const trHead = document.createElement("tr");
      dash.tableHeaders.forEach((header) => {
        const th = document.createElement("th");
        th.textContent = header;
        trHead.appendChild(th);
      });
      thead.appendChild(trHead);
      table.appendChild(thead);

      // body
      const tbody = document.createElement("tbody");
      dash.tableData.forEach((row) => {
        const tr = document.createElement("tr");
        row.forEach((cell) => {
          const td = document.createElement("td");
          td.textContent = cell;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);

      dashBox.appendChild(table);
    }

    dashboardContainer.appendChild(dashBox);
  });
}

// Event change วันที่
dateSelect.addEventListener("change", (e) => {
  loadDashboard(e.target.value);
});

// เริ่มต้นโหลดวันที่
loadDates();

// โหลด Dashboard วันที่แรกอัตโนมัติ
if (dateSelect.options.length > 0) {
  dateSelect.selectedIndex = 0;
  loadDashboard(dateSelect.value);
}
