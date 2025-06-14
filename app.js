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
    data:cfg,
    options:{
      responsive:true,
      plugins:{
        legend:{position:'bottom'},
        tooltip:{enabled:true},
        datalabels:{
          anchor:'end',align:'top',
          color:'#000',font:{weight:'bold'},
          formatter:v=>v
        }
      }
    },
    plugins:[ChartDataLabels]
  });
}

/***** HOOK EVENTS *****/
dashSel.addEventListener('change',()=>loadData());
dateSel.addEventListener('change',e=>updateDashboard(e.target.value));
refreshBtn.addEventListener('click',loadData);

/***** INIT *****/
loadData();
