/* PWA Dose/Box Calculator — FR */
const qs = (s, el=document)=>el.querySelector(s);
const qsa = (s, el=document)=>Array.from(el.querySelectorAll(s));

qsa('.tab').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    qsa('.tab').forEach(b=>b.classList.remove('active'));
    qsa('.pane').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    qs('#'+btn.dataset.tab).classList.add('active');
  });
});

const modeRadios = qsa('input[name="mode"]');
const phaseContainer = qs('#phaseContainer');
modeRadios.forEach(r=>r.addEventListener('change', ()=>{
  const isMulti = qs('input[name="mode"]:checked').value === 'multi';
  phaseContainer.classList.toggle('hidden', !isMulti);
}));


function updateSyrupUI(){
  const spoonSel = qs('#sir_spoon');
  const spoon = +spoonSel.value || 0;
  const doseLabel = qs('#sir_dose_label');
  const stepper = qs('#sir_stepper');
  const minusBtn = qs('#sir_minus');
  const plusBtn = qs('#sir_plus');
  const mgPerMlWrap = qs('#sir_mg_per_ml').closest('label');
  const doseInput = qs('#sir_dose_mg');
  if(spoon > 0){
    // Spoon mode: hide mg/mL, relabel dose as "Nombre de cuillères par prise"
    mgPerMlWrap.classList.add('hidden-inline');
    doseLabel.innerHTML = "Nombre de cuillères par prise";
    if((+doseInput.value||0)===0){ doseInput.value = 1; }
    doseInput.step = 0.5;
    doseInput.min = 0;
    doseInput.placeholder = "ex: 1";
  }else{
    // mg mode: show mg/mL, relabel dose as mg
    mgPerMlWrap.classList.remove('hidden-inline');
    doseLabel.innerHTML = "Dose par prise (mg)";
    if((+doseInput.value||0)===0){ doseInput.value = 200; }
    doseInput.step = 0.1;
    doseInput.min = 0;
    if(stepper) stepper.classList.add('hidden-inline');
    doseInput.placeholder = "ex: 200";
  }
}

function toggleSyrupMode(){
  const spoonSel = qs('#sir_spoon');
  // If currently mg (0), switch to cuillère (default 5 mL = cuillère à dessert); else switch to mg
  if((+spoonSel.value||0)===0){
    spoonSel.value = "5"; // default to cuillère à dessert
  }else{
    spoonSel.value = "0";
  }
  updateSyrupUI();
}
const phasesEl = qs('#phases');
const addPhaseBtn = qs('#addPhase');
const clearPhasesBtn = qs('#clearPhases');

function addPhase(pref={days:3, units:1, freq:2, note:''}){
  const wrap = document.createElement('div');
  wrap.className = 'phase';
  wrap.innerHTML = `
    <div class="grid">
      <label>Durée du palier (jours)
        <input type="number" class="ph_days" min="0" step="1" value="${pref.days}">
      </label>
      <label>Unités par prise (cp / sachet / gouttes ou n° cuillères si 'sirop + cuillères')
        <input type="number" class="ph_units" min="0" step="0.25" value="${pref.units}">
      </label>
      <label>Fréquence / jour (prises)
        <input type="number" class="ph_freq" min="0" step="0.5" value="${pref.freq}">
      </label>
      <label>Note (optionnel)
        <input type="text" class="ph_note" placeholder="Ex: J1-J3" value="${pref.note||''}">
      </label>
      <div style="display:flex;align-items:end;gap:8px">
        <button class="btn secondary ph_dup">Dupliquer</button>
        <button class="btn danger ph_del">Supprimer</button>
      </div>
    </div>
  `;
  phasesEl.appendChild(wrap);
  wrap.querySelector('.ph_del').addEventListener('click', ()=>wrap.remove());
  wrap.querySelector('.ph_dup').addEventListener('click', ()=>{
    const d = {
      days: +wrap.querySelector('.ph_days').value || 0,
      units: +wrap.querySelector('.ph_units').value || 0,
      freq: +wrap.querySelector('.ph_freq').value || 0,
      note: wrap.querySelector('.ph_note').value || ''
    };
    addPhase(d);
  });
}

addPhaseBtn.addEventListener('click', ()=>addPhase());
clearPhasesBtn.addEventListener('click', ()=>{ phasesEl.innerHTML=''; });
// --- Syrup UI toggle ---
const spoonSelect = qs('#sir_spoon');
const spoonToggleBtn = qs('#sir_toggle');
if(spoonSelect){ spoonSelect.addEventListener('change', updateSyrupUI); }
if(spoonToggleBtn){ spoonToggleBtn.addEventListener('click', toggleSyrupMode); }
document.addEventListener('DOMContentLoaded', updateSyrupUI);


const rememberChk = qs('#remember');
const STORAGE_KEY = 'pwa-dosebox-v2'; // bumped to force SW update

function readInputs(){
  const mode = qs('input[name="mode"]:checked').value;
  const phases = Array.from(document.querySelectorAll('.phase')).map(ph=> ({
    days: +ph.querySelector('.ph_days').value || 0,
    units: +ph.querySelector('.ph_units').value || 0,
    freq: +ph.querySelector('.ph_freq').value || 0,
    note: ph.querySelector('.ph_note').value || ''
  }));
  const data = {
    mode, phases,
    cmp: { units:+qs('#cmp_units').value||0, freq:+qs('#cmp_freq').value||0, days:+qs('#cmp_days').value||0, perBox:+qs('#cmp_per_box').value||1 },
    sir: { spoon: +(qs('#sir_spoon').value||0), mgPerMl: +(qs('#sir_mg_per_ml').value||0), doseMg: +(qs('#sir_dose_mg').value||0), freq: +(qs('#sir_freq').value||0), days: +(qs('#sir_days').value||0), bottleMl: +(qs('#sir_bottle_ml').value||1) },
    sac: { units:+qs('#sac_units').value||0, freq:+qs('#sac_freq').value||0, days:+qs('#sac_days').value||0, perBox:+qs('#sac_per_box').value||1 },
    gtt: { units:+qs('#gtt_units').value||0, freq:+qs('#gtt_freq').value||0, days:+qs('#gtt_days').value||0, perMl:+qs('#gtt_per_ml').value||20, bottleMl:+qs('#gtt_bottle_ml').value||1 },
    col: { dropsPerEye:+qs('#col_drops_per_eye').value||0, eyes:+qs('#col_eyes').value||1, freq:+qs('#col_freq').value||0, days:+qs('#col_days').value||0, perMl:+qs('#col_per_ml').value||20, bottleMl:+qs('#col_bottle_ml').value||1, maxDays:+qs('#col_max_days').value||0 }
  };
  return data;
}

function saveIfChecked(){
  if(!rememberChk.checked) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(readInputs()));
}

function loadSaved(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return;
    const d = JSON.parse(raw);
    document.querySelectorAll('input[name="mode"]').forEach(r=>r.checked = (r.value===d.mode));
    document.querySelector('#phaseContainer').classList.toggle('hidden', d.mode!=='multi');
    document.querySelector('#phases').innerHTML='';
    (d.phases||[]).forEach(p=>addPhase(p));
    if(d.cmp){ qs('#cmp_units').value=d.cmp.units; qs('#cmp_freq').value=d.cmp.freq; qs('#cmp_days').value=d.cmp.days; qs('#cmp_per_box').value=d.cmp.perBox; }
    if(d.sir){ qs('#sir_spoon').value=d.sir.spoon; qs('#sir_mg_per_ml').value=d.sir.mgPerMl; qs('#sir_dose_mg').value=d.sir.doseMg; qs('#sir_freq').value=d.sir.freq; qs('#sir_days').value=d.sir.days; qs('#sir_bottle_ml').value=d.sir.bottleMl; }
    if(d.sac){ qs('#sac_units').value=d.sac.units; qs('#sac_freq').value=d.sac.freq; qs('#sac_days').value=d.sac.days; qs('#sac_per_box').value=d.sac.perBox; }
    if(d.gtt){ qs('#gtt_units').value=d.gtt.units; qs('#gtt_freq').value=d.gtt.freq; qs('#gtt_days').value=d.gtt.days; qs('#gtt_per_ml').value=d.gtt.perMl; qs('#gtt_bottle_ml').value=d.gtt.bottleMl; }
    if(d.col){ qs('#col_drops_per_eye').value=d.col.dropsPerEye; qs('#col_eyes').value=d.col.eyes; qs('#col_freq').value=d.col.freq; qs('#col_days').value=d.col.days; qs('#col_per_ml').value=d.col.perMl; qs('#col_bottle_ml').value=d.col.bottleMl; qs('#col_max_days').value=d.col.maxDays||''; }
  }catch(e){}
}
loadSaved();

function sumPhasesUnits(){
  const phases = Array.from(document.querySelectorAll('.phase'));
  if(!phases.length) return 0;
  return phases.reduce((t, ph)=>{
    const days = +ph.querySelector('.ph_days').value || 0;
    const units = +ph.querySelector('.ph_units').value || 0;
    const freq = +ph.querySelector('.ph_freq').value || 0;
    return t + days * freq * units;
  }, 0);
}
const ceilDiv = (a,b)=> Math.ceil(a/Math.max(b,1));
const formatBox = (n)=> `${n} ${n>1?'boîtes':'boîte'}`;
const formatBottle = (n)=> `${n} ${n>1?'flacons':'flacon'}`;
const activeTabId = ()=> document.querySelector('.tab.active').dataset.tab;
function renderResult(summaryHtml, detailHtml){
  document.querySelector('#summary').innerHTML = summaryHtml;
  document.querySelector('#detail').innerHTML = detailHtml;
}

function calc(){
  const tab = activeTabId();
  const d = readInputs();
  saveIfChecked();

  if(tab==='tab-comprime'){
    const totalUnits = d.mode==='multi' ? sumPhasesUnits() : d.cmp.units * d.cmp.freq * d.cmp.days;
    const boxes = ceilDiv(totalUnits, d.cmp.perBox);
    renderResult(`<p><strong>Comprimés :</strong> ${formatBox(boxes)}</p>`, `<p>Total comprimés : <strong>${totalUnits}</strong><br>Par boîte : <strong>${d.cmp.perBox}</strong></p>`);
  }

  if(tab==='tab-sirop'){
    let totalMl = 0;
    const phasesArr = Array.from(document.querySelectorAll('.phase'));
    const hasPhases = phasesArr.length>0 && phasesArr.some(ph=> ((+ph.querySelector('.ph_days').value||0)>0 && (+ph.querySelector('.ph_freq').value||0)>0));
    const spoonMl = +d.sir.spoon || 0; // 0=mg mode, >0 = mL per spoon
    const doseVal = +d.sir.doseMg || 0; // in mg (mg-mode) OR in spoons (spoon-mode)
    if(spoonMl > 0){
      if(d.mode==='multi' && !hasPhases){
        const spoons = doseVal>0 ? doseVal : 1;
        totalMl = d.sir.days * d.sir.freq * spoons * spoonMl;
      } else
      if(d.mode==='multi' && hasPhases){
        const phases = phasesArr;
        phases.forEach(ph=>{
          const days = +ph.querySelector('.ph_days').value || 0;
          const freq = +ph.querySelector('.ph_freq').value || 0;
          const spoons = +ph.querySelector('.ph_units').value || (doseVal>0 ? doseVal : 1);
          totalMl += days * freq * spoons * spoonMl;
        });
      } else {
      if(d.mode==='multi' && !hasPhases){
        const mgPerMl = Math.max(d.sir.mgPerMl, 1);
        totalMl = d.sir.days * d.sir.freq * (doseVal / mgPerMl);
      } else
        const spoons = doseVal>0 ? doseVal : 1;
        totalMl = d.sir.days * d.sir.freq * spoons * spoonMl;
      }
    } else {
      if(d.mode==='multi' && !hasPhases){
        const mgPerMl = Math.max(d.sir.mgPerMl, 1);
        totalMl = d.sir.days * d.sir.freq * (doseVal / mgPerMl);
      } else
      const mgPerMl = Math.max(d.sir.mgPerMl, 1);
      if(d.mode==='multi' && hasPhases){
        const phases = phasesArr;
        phases.forEach(ph=>{
          const days = +ph.querySelector('.ph_days').value || 0;
          const freq = +ph.querySelector('.ph_freq').value || 0;
          const unitsMg = +ph.querySelector('.ph_units').value || doseVal;
          totalMl += days * freq * (unitsMg / mgPerMl);
        });
      } else {
      if(d.mode==='multi' && !hasPhases){
        const mgPerMl = Math.max(d.sir.mgPerMl, 1);
        totalMl = d.sir.days * d.sir.freq * (doseVal / mgPerMl);
      } else
        totalMl = d.sir.days * d.sir.freq * (doseVal / mgPerMl);
      }
    }
    const bottles = Math.ceil(totalMl / Math.max(d.sir.bottleMl,1));
    renderResult(
      `<p><strong>Sirop :</strong> ${formatBottle(bottles)} ${modeBadge}</p>`,
      `<p>Volume total : <strong>${totalMl.toFixed(1)} mL</strong><br>Flacon : <strong>${d.sir.bottleMl} mL</strong>${spoonMl>0?`<br>Mode cuillère : <strong>${spoonMl} mL/cuillère</strong> &nbsp; • &nbsp; Cuillères/prise : <strong>${doseVal||1}</strong>`:''}</p>`
    );
  }
if(tab==='tab-sachet'){
    const totalUnits = d.mode==='multi' ? sumPhasesUnits() : d.sac.units * d.sac.freq * d.sac.days;
    const boxes = ceilDiv(totalUnits, d.sac.perBox);
    renderResult(`<p><strong>Sachets :</strong> ${formatBox(boxes)}</p>`, `<p>Total sachets : <strong>${totalUnits}</strong><br>Par boîte : <strong>${d.sac.perBox}</strong></p>`);
  }

  if(tab==='tab-gouttes'){
    let totalDrops = 0;
    if(d.mode==='multi'){
      const phases = Array.from(document.querySelectorAll('.phase'));
      phases.forEach(ph=>{
        const days = +ph.querySelector('.ph_days').value || 0;
        const freq = +ph.querySelector('.ph_freq').value || 0;
        const units = +ph.querySelector('.ph_units').value || 0; // drops per intake override
        const u = units>0 ? units : d.gtt.units;
        totalDrops += days * freq * u;
      });
    }else{
      totalDrops = d.gtt.days * d.gtt.freq * d.gtt.units;
    }
    const mlNeeded = totalDrops / Math.max(d.gtt.perMl,1);
    const bottles = ceilDiv(mlNeeded, d.gtt.bottleMl);
    renderResult(`<p><strong>Gouttes buvables :</strong> ${formatBottle(bottles)}</p>`, `<p>Total gouttes : <strong>${totalDrops}</strong><br>Volume estimé : <strong>${mlNeeded.toFixed(1)} mL</strong><br>Flacon : <strong>${d.gtt.bottleMl} mL</strong></p>`);
  }

  if(tab==='tab-collyre'){
    const perInstillation = d.col.dropsPerEye * Math.max(d.col.eyes,1);
    let totalDrops = 0;
    if(d.mode==='multi'){
      const phases = Array.from(document.querySelectorAll('.phase'));
      phases.forEach(ph=>{
        const days = +ph.querySelector('.ph_days').value || 0;
        const freq = +ph.querySelector('.ph_freq').value || 0;
        const units = +ph.querySelector('.ph_units').value || 0; // override drops per instillation (both eyes)
        const u = units>0 ? units : perInstillation;
        totalDrops += days * freq * u;
      });
    }else{
      totalDrops = d.col.days * d.col.freq * perInstillation;
    }
    const mlNeeded = totalDrops / Math.max(d.col.perMl,1);
    let bottlesByVolume = ceilDiv(mlNeeded, d.col.bottleMl);
    let bottlesByShelf = 0;
    if(d.col.maxDays>0){
      const totalDays = d.mode==='multi'
        ? Array.from(document.querySelectorAll('.phase')).reduce((acc, ph)=> acc + (+ph.querySelector('.ph_days').value||0), 0)
        : d.col.days;
      bottlesByShelf = Math.ceil(totalDays / Math.max(d.col.maxDays,1));
    }
    const bottles = Math.max(bottlesByVolume, bottlesByShelf||0);
    renderResult(`<p><strong>Collyres :</strong> ${formatBottle(bottles)}</p>`, `<p>Total gouttes : <strong>${totalDrops}</strong><br>Volume estimé : <strong>${mlNeeded.toFixed(1)} mL</strong><br>Flacon : <strong>${d.col.bottleMl} mL</strong>${d.col.maxDays?`<br>Limite d'utilisation d'un flacon : <strong>${d.col.maxDays} j</strong>`:''}</p>`);
  }
}


function adjustSpoonDose(dir){
  const spoon = +qs('#sir_spoon').value || 0;
  const input = qs('#sir_dose_mg');
  if(!input) return;
  if(spoon>0){
    const step = 0.5;
    let val = parseFloat(input.value||'0');
    if(Number.isNaN(val)) val = 0;
    val = Math.max(0, Math.round((val + (dir*step))*2)/2);
    input.value = val.toFixed(1).replace(/\.0$/, '');
  }else{
    // mg mode: use 50 mg coarse step
    let val = parseFloat(input.value||'0'); if(Number.isNaN(val)) val = 0;
    val = Math.max(0, val + (dir*50));
    input.value = String(val);
  }
}
document.querySelector('#calcBtn').addEventListener('click', calc);
document.querySelector('#resetBtn').addEventListener('click', ()=>{ localStorage.removeItem('pwa-dosebox-v2');
// Stepper buttons
const minusBtn = qs('#sir_minus');
const plusBtn = qs('#sir_plus');
if(minusBtn) minusBtn.addEventListener('click', ()=>adjustSpoonDose(-1));
if(plusBtn) plusBtn.addEventListener('click', ()=>adjustSpoonDose(1));
 location.reload(); });

let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e)=>{
  e.preventDefault();
  deferredPrompt = e;
  document.querySelector('#installBtn').hidden = false;
});
document.querySelector('#installBtn').addEventListener('click', async ()=>{
  if(!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  document.querySelector('#installBtn').hidden = true;
});

if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('sw.js').catch(console.warn);
  });
}
