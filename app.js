/***** FILE PATHS *****/
const dataSets = {
  1: 'data_all_dashboards.json',
  2: 'data_all_dashboards.json',
  3: 'data_all_dashboards.json'
};

/***** DASHBOARD DEFINITIONS *****/
const dashboardDetails={
  1:[
    {id:'d1-1',title:'ABC Category',type:'doughnut'},
    {id:'d1-2',title:'FSN Category',type:'pie'},
    {id:'d1-3',title:'Turnover Rate',type:'line'},
    {id:'d1-4',title:'DOI Distribution',type:'bar'},
    {id:'d1-5',title:'Composite Risk Score',type:'bar'},
    {id:'d1-6',title:'Urgency Level',type:'doughnut'},
    {id:'d1-7',title:'Top 10 Inventory',type:'table'},
    {id:'d1-8',title:'Strategic Recommendations',type:'table'}
  ],
  2:[
    {id:'d2-1',title:'Forecast Accuracy',type:'line'},
    {id:'d2-2',title:'MAPE',type:'line'},
    {id:'d2-3',title:'Bias',type:'bar'},
    {id:'d2-4',title:'Fill Rate',type:'bar'},
    {id:'d2-5',title:'Demand Risk by Period',type:'bar'},
    {id:'d2-6',title:'Dynamic Date Slicer',type:'table'},
    {id:'d2-7',title:'Drill‑Down Time Hierarchy',type:'table'},
    {id:'d2-8',title:'Forecast vs Actual',type:'line'}
  ],
  3:[
    {id:'d3-1',title:'Inventory Value',type:'bar'},
    {id:'d3-2',title:'Overstock %',type:'doughnut'},
    {id:'d3-3',title:'DOI',type:'bar'},
    {id:'d3-4',title:'Accuracy ≥80%',type:'bar'},
    {id:'d3-5',title:'Before vs After',type:'line'},
    {id:'d3-6',title:'Action Log',type:'table'},
    {id:'d3-7',title:'KPI Summary',type:'bar'},
    {id:'d3-8',title:'Impact Analysis',type:'bar'},
    {id:'d3-9',title:'KPI Efficiency',type:'bar'},       // ★ เพิ่ม
    {id:'d3-10',title:'Action Summary Table',type:'table'}// ★ เพิ่ม
  ]
};

/***** DOM REFS *****/
const dashSel=document.getElementById('dashboardSelector');
const dateSel=document.getElementById('dateSelector');
const container=document.getElementById('dashboardContainer');
const refreshBtn=document.getElementById('refreshBtn');

/***** STATE *****/
let rawData=[],charts={};

/***** BUILD UI *****/
function createCards(id){
  container.innerHTML='';
  dashboardDetails[id].forEach(card=>{
    const el=document.createElement('div');
    el.className='dashboard-card';
    el.id=card.id;
    el.innerHTML=`<h2>${card.title}</h2>`+
      (card.type==='table'
        ?'<table><thead></thead><tbody></tbody></table>'
        :`<canvas id="chart_${card.id}"></canvas>`);
    container.appendChild(el);
  });
}

/***** LOAD JSON *****/
async function loadData(){
  try{
    const file=dataSets[dashSel.value];
    const res=await fetch(file);
    rawData=await res.json();
    // fill date selector
    const dates=[...new Set(rawData.map(d=>d.date))].sort();
    dateSel.innerHTML=dates.map(d=>`<option>${d}</option>`).join('');
    createCards(dashSel.value);
    updateDashboard(dates[0]);
  }catch(e){alert('โหลดข้อมูลผิดพลาด '+e.message);}
}

/***** UPDATE ALL CARDS *****/
function updateDashboard(date){
  const subset=rawData.filter(d=>d.date===date);
  dashboardDetails[dashSel.value].forEach(card=>{
    card.type==='table'
      ?updateTable(card.id,subset)
      :updateChart(card.id,card.type,subset);
  });
}

/***** TABLE LOGIC *****/
function updateTable(id,data){
  const card=document.getElementById(id);
  const thead=card.querySelector('thead'),tbody=card.querySelector('tbody');
  let headers=[],rows=[];
  switch(id){
    case'd1-7':headers=['Item','Qty'];rows=data.slice(0,10).map(r=>[r.item,r.stock_qty]);break;
    case'd1-8':headers=['Item','Action'];rows=data.map(r=>[r.item,r.recommendation]);break;
    case'd2-6':headers=['Date','Notes'];rows=data.map(r=>[r.date,r.notes]);break;
    case'd2-7':headers=['Year','Month'];rows=data.map(r=>[r.date.slice(0,4),r.date.slice(5,7)]);break;
    case'd3-6':headers=['Action','Status','Impact'];
               rows=(data[0]?.action_log||[]).map(a=>[a.action,a.status,a.impact]);break;
    case'd3-10':headers=['KPI','Owner','Deadline'];
                rows=data.map(r=>[r.kpi||'-',r.owner||'-',r.deadline||'-']);break;
    default:headers=['Info'];rows=[['ไม่มีข้อมูล']];
  }
  thead.innerHTML=`<tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr>`;
  tbody.innerHTML=rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('');
}

/***** CHART LOGIC (ใช้ mock data demo) *****/
function updateChart(id,type,data){
  const ctx=document.getElementById('chart_'+id).getContext('2d');
  const cfg={};                       // สร้างข้อมูลจำลองอย่างย่อ
  if(id==='d1-1'){ cfg.labels=['A','B','C'];cfg.datasets=[{data:[60,25,15],backgroundColor:['#28a745','#ffc107','#dc3545']}];}
  else if(id==='d1-2'){ cfg.labels=['Fast','Slow','NM'];cfg.datasets=[{data:[40,35,25],backgroundColor:['#20c997','#fd7e14','#6c757d']}];}
  else if(id==='d3-9'){ cfg.labels=['Production','Logistics','Planning'];cfg.datasets=[{label:'Efficiency %',data:[88,75,92],backgroundColor:['#198754','#ffc107','#0d6efd']}];}
  else{ cfg.labels=['Demo1','Demo2'];cfg.datasets=[{data:[50,50],backgroundColor:['#0d6efd','#dc3545']}]; }

  if(charts[id]){ charts[id].data=cfg; charts[id].update(); return; }

  charts[id]=new Chart(ctx,{
    type:type,
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  LabelList,
} from "recharts";
import data from "./data_all_dashboards.json";

export default function App() {
  const [dashboard1, setDashboard1] = useState([]);
  const [dashboard2, setDashboard2] = useState([]);
  const [dashboard3, setDashboard3] = useState([]);

  useEffect(() => {
    setDashboard1(data["1"]);
    setDashboard2(data["2"]);
    setDashboard3(data["3"]);
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 xl:grid-cols-3">
      {/* Dashboard 1 */}
      <Card className="bg-white shadow-lg rounded-2xl p-4">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-blue-700">
            🛡️ Strategic Inventory Health & Risk
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dashboard1}>
              <XAxis dataKey="item" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="qty" fill="#8884d8">
                <LabelList dataKey="recommendation" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Dashboard 2 */}
      <Card className="bg-white shadow-lg rounded-2xl p-4">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-green-700">
            📈 Planning Accuracy & Demand Risk
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dashboard2}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="accuracy" stroke="#82ca9d" />
              <Line type="monotone" dataKey="mape" stroke="#8884d8" />
              <Line type="monotone" dataKey="bias" stroke="#ffc658" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Dashboard 3 */}
      <Card className="bg-white shadow-lg rounded-2xl p-4">
import Chart from 'https://cdn.jsdelivr.net/npm/chart.js';

const dashboardSelect = document.getElementById('dashboardSelect');
const dateSelect = document.getElementById('dateSelect');
const refreshButton = document.getElementById('refreshButton');
const dashboardContainer = document.getElementById('dashboard');

let rawData = {};

// Load JSON Data
async function loadData() {
  const response = await fetch('data_all_dashboards.json');
  rawData = await response.json();
  updateDateOptions(); // Fill in date dropdown
  renderDashboard();   // Initial render
}

// Fill date dropdown from current dashboard data
function updateDateOptions() {
  const selectedDashboard = dashboardSelect.value;
  const data = rawData[selectedDashboard] || [];

  // Get unique dates
  const dates = [...new Set(data.map(d => d.date))];
  dateSelect.innerHTML = dates
    .map(date => `<option value="${date}">${date}</option>`)
    .join('');
}

// Render dashboard view
function renderDashboard() {
  const selectedDashboard = dashboardSelect.value;
  const selectedDate = dateSelect.value;
  const data = (rawData[selectedDashboard] || []).filter(d => d.date === selectedDate);

  dashboardContainer.innerHTML = ''; // Clear previous

  if (selectedDashboard === '1') renderDashboard1(data);
  else if (selectedDashboard === '2') renderDashboard2(data);
  else if (selectedDashboard === '3') renderDashboard3(data);
}

// === Dashboard 1: Inventory Health ===
function renderDashboard1(data) {
  if (!data.length) return;

  const table = `
    <table>
      <thead><tr><th>Item</th><th>Qty</th><th>Recommendation</th></tr></thead>
      <tbody>
        ${data.map(d => `
          <tr>
            <td>${d.item}</td>
            <td>${d.qty}</td>
            <td>${d.recommendation}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  dashboardContainer.innerHTML = table;
}

// === Dashboard 2: Forecast Accuracy ===
function renderDashboard2(data) {
  if (!data.length) return;

  const cards = `
    <div class="card-grid">
      <div class="card">📈 Accuracy: <strong>${data[0].accuracy}%</strong></div>
      <div class="card">📉 MAPE: <strong>${data[0].mape}%</strong></div>
      <div class="card">⚖️ Bias: <strong>${data[0].bias}</strong></div>
    </div>
    <canvas id="chart2" style="margin-top:1rem; max-height:300px;"></canvas>
  `;
  dashboardContainer.innerHTML = cards;

  const ctx = document.getElementById('chart2').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Accuracy', 'MAPE', 'Bias'],
      datasets: [{
        label: 'Planning Metrics',
        data: [data[0].accuracy, data[0].mape, data[0].bias],
        backgroundColor: ['#4ade80', '#60a5fa', '#facc15']
      }]
    }
  });
}

// === Dashboard 3: Strategic Action ===
function renderDashboard3(data) {
  if (!data.length) return;

  const cards = `
    <div class="card-grid">
      <div class="card">💰 Value: <strong>${data[0].value.toLocaleString()}</strong></div>
      <div class="card">📊 Impact: <strong>${data[0].impact}%</strong></div>
      <div class="card">🎯 Action: <strong>${data[0].action}</strong></div>
    </div>
    <canvas id="chart3" style="margin-top:1rem; max-height:300px;"></canvas>
  `;
  dashboardContainer.innerHTML = cards;
const dashboardSelect = document.getElementById('dashboardSelect');
const dateSelect = document.getElementById('dateSelect');
const refreshButton = document.getElementById('refreshButton');
const container = document.getElementById('dashboardContainer');
let allData = {};

fetch('data_all_dashboards.json')
  .then(res => res.json())
  .then(data => {
    allData = data;
    populateDateOptions(dashboardSelect.value);
  });

dashboardSelect.addEventListener('change', () => {
  populateDateOptions(dashboardSelect.value);
});

refreshButton.addEventListener('click', () => {
  const dashboardId = dashboardSelect.value;
  const selectedDate = dateSelect.value;
  const dashboardData = allData[dashboardId].filter(item => item.date === selectedDate);
  renderDashboard(dashboardId, dashboardData);
});

function populateDateOptions(dashboardId) {
  dateSelect.innerHTML = '';
  const dates = [...new Set(allData[dashboardId].map(item => item.date))];
  dates.forEach(date => {
    const option = document.createElement('option');
    option.value = date;
    option.textContent = date;
    dateSelect.appendChild(option);
  });
}

function renderDashboard(id, data) {
  container.innerHTML = '';
  if (id === "1") {
    const table = document.createElement('table');
    table.innerHTML = `
      <tr><th>Item</th><th>Qty</th><th>Recommendation</th></tr>
      ${data.map(d => `<tr><td>${d.item}</td><td>${d.qty}</td><td>${d.recommendation}</td></tr>`).join('')}
    `;
    container.appendChild(table);
  } else if (id === "2") {
    const table = document.createElement('table');
    table.innerHTML = `
      <tr><th>Accuracy (%)</th><th>MAPE</th><th>Bias</th></tr>
      ${data.map(d => `<tr><td>${d.accuracy}</td><td>${d.mape}</td><td>${d.bias}</td></tr>`).join('')}
    `;
    container.appendChild(table);
  } else if (id === "3") {
    const table = document.createElement('table');
    table.innerHTML = `
      <tr><th>Value</th><th>Impact (%)</th><th>Action</th></tr>
      ${data.map(d => `<tr><td>${d.value}</td><td>${d.impact}</td><td>${d.action}</td></tr>`).join('')}
    `;
    container.appendChild(table);
  }
}

