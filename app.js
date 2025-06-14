let dataStore = {};
const dashSel = document.getElementById('dashboardSelect');
const dateSel = document.getElementById('dateSelect');
const rv = document.getElementById('refreshBtn');

const c1 = document.getElementById('content1');
const c2 = document.getElementById('content2');
const c3 = document.getElementById('content3');

fetch('data_all_dashboards.json')
  .then(r => r.json())
  .then(js => { dataStore = js; init(); });

function init(){
  updateDates();
  dashSel.addEventListener('change', () => {
    updateDates(); render();
  });
  rv.addEventListener('click', render);
  render();
}

function updateDates(){
  const arr = dataStore[dashSel.value] || [];
  const dates = [...new Set(arr.map(x=>x.date))];
  dateSel.innerHTML = dates.map(d=>`<option>${d}</option>`).join('');
}

function render(){
  [c1,c2,c3].forEach(el=>el.innerHTML='');
  const id = dashSel.value, date = dateSel.value;
  const arr = (dataStore[id] || []).filter(x=>x.date===date);

  if(id==='1') arr.forEach(o=>
    c1.innerHTML+=`
      <div class="card">
        <h3>${o.item}</h3>
        <p>Qty: ${o.qty}</p>
        <p>Rec: ${o.recommendation}</p>
      </div>`
  );
  if(id==='2') arr.forEach(o=> {
    c2.innerHTML+=`
      <div class="card"><h3>MP: ${o.mape}%</h3></div>
      <canvas id="ch2"></canvas>`;
    setTimeout(()=> {
      const ctx = document.getElementById('ch2').getContext('2d');
      new Chart(ctx,{
        type:'bar',
        data:{labels:['Accuracy','MAPE','Bias'],datasets:[{label:'val',data:[o.accuracy,o.mape,o.bias],backgroundColor:['#4caf50','#ff9800','#03a9f4']}]},
        options:{responsive:true}
      });
    },50);
  });
  if(id==='3') arr.forEach(o=>
    c3.innerHTML+=`
      <div class="card">
        <h3>${o.action}</h3><p>Value: $${o.value.toLocaleString()}</p><p>Impact: ${o.impact}%</p>
      </div>`
  );
}
