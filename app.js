/* PWA Dose/Box Calculator — FR */
const qs = (s, el=document)=>el.querySelector(s);
const qsa = (s, el=document)=>Array.from(el.querySelectorAll(s));

// --- Tabs ---
qsa('.tab').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    qsa('.tab').forEach(b=>b.classList.remove('active'));
    qsa('.pane').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    qs('#'+btn.dataset.tab).classList.add('active');
  });
});

// --- Mode switch ---
const modeRadios = qsa('input[name="mode"]');
const phaseContainer = qs('#phaseContainer');
modeRadios.forEach(r=>r.addEventListener('change', ()=>{
  const isMulti = qs('input[name="mode"]:checked').value === 'multi';
  phaseContainer.classList.toggle('hidden', !isMulti);
}));

// --- Phase builder (progressive/dégressive) ---
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
      <label>Unités par prise
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

// --- Storage helpers ---
const rememberChk = qs('#remember');
const STORAGE_KEY = 'pwa-dosebox-v1';

function readInputs(){
  // Base mode & phases
  const mode = qs('input[name="mode"]:checked').value;
  const phases = qsa('.phase').map(ph=> ({
    days: +qs('.ph_days', ph).value || 0,
    units: +qs('.ph_units', ph).value || 0,
    freq: +qs('.ph_freq', ph).value || 0,
    note: qs('.ph_note', ph).value || ''
  }));
  // Tabs values
  const data = {
    mode, phases,
    cmp: {
      units:+qs('#cmp_units').value||0,
      freq:+qs('#cmp_freq').value||0,
      days:+qs('#cmp_days').value||0,
      perBox:+qs('#cmp_per_box').value||1
    },
    sir: {
      mgPerMl:+qs('#sir_mg_per_ml').value||0,
      doseMg:+qs('#sir_dose_mg').value||0,
      freq:+qs('#sir_freq').value||0,
      days:+qs('#sir_days').value||0,
      bottleMl:+qs('#sir_bottle_ml').value||1
    },
    sac: {
      units:+qs('#sac_units').value||0,
      freq:+qs('#sac_freq').value||0,
      days:+qs('#sac_days').value||0,
      perBox:+qs('#sac_per_box').value||1
    },
    gtt: {
      units:+qs('#gtt_units').value||0,
      freq:+qs('#gtt_freq').value||0,
      days:+qs('#gtt_days').value||0,
      perMl:+qs('#gtt_per_ml').value||20,
      bottleMl:+qs('#gtt_bottle_ml').value||1
    },
    col: {
      dropsPerEye:+qs('#col_drops_per_eye').value||0,
      eyes:+qs('#col_eyes').value||1,
      freq:+qs('#col_freq').value||0,
      days:+qs('#col_days').value||0,
      perMl:+qs('#col_per_ml').value||20,
      bottleMl:+qs('#col_bottle_ml').value||1,
      maxDays:+qs('#col_max_days').value||0
    }
  };
  return data;
}

function saveIfChecked(){
  if(!rememberChk.checked) return;
  const data = readInputs();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadSaved(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return;
    const d = JSON.parse(raw);
    // mode
    qsa('input[name="mode"]').forEach(r=>r.checked = (r.value===d.mode));
    phaseContainer.classList.toggle('hidden', d.mode!=='multi');
    phasesEl.innerHTML='';
    (d.phases||[]).forEach(p=>addPhase(p));

    // tabs
    if(d.cmp){ qs('#cmp_units').value=d.cmp.units; qs('#cmp_freq').value=d.cmp.freq; qs('#cmp_days').value=d.cmp.days; qs('#cmp_per_box').value=d.cmp.perBox; }
    if(d.sir){ qs('#sir_mg_per_ml').value=d.sir.mgPerMl; qs('#sir_dose_mg').value=d.sir.doseMg; qs('#sir_freq').value=d.sir.freq; qs('#sir_days').value=d.sir.days; qs('#sir_bottle_ml').value=d.sir.bottleMl; }
    if(d.sac){ qs('#sac_units').value=d.sac.units; qs('#sac_freq').value=d.sac.freq; qs('#sac_days').value=d.sac.days; qs('#sac_per_box').value=d.sac.perBox; }
    if(d.gtt){ qs('#gtt_units').value=d.gtt.units; qs('#gtt_freq').value=d.gtt.freq; qs('#gtt_days').value=d.gtt.days; qs('#gtt_per_ml').value=d.gtt.perMl; qs('#gtt_bottle_ml').value=d.gtt.bottleMl; }
    if(d.col){ qs('#col_drops_per_eye').value=d.col.dropsPerEye; qs('#col_eyes').value=d.col.eyes; qs('#col_freq').value=d.col.freq; qs('#col_days').value=d.col.days; qs('#col_per_ml').value=d.col.perMl; qs('#col_bottle_ml').value=d.col.bottleMl; qs('#col_max_days').value=d.col.maxDays||''; }
  }catch(e){ console.warn('No saved state', e); }
}
loadSaved();

// --- Calcul core ---
function sumPhasesUnits(unitsPerIntakeKey='units'){
  // Returns total "intake units" across phases = sum(days * freq * units)
  const phases = qsa('.phase');
  if(!phases.length) return 0;
  let total = 0;
  phases.forEach(ph=>{
    const days = +qs('.ph_days', ph).value || 0;
    const units = +qs('.ph_units', ph).value || 0;
    const freq = +qs('.ph_freq', ph).value || 0;
    total += days * freq * units;
  });
  return total;
}

function ceilDiv(a, b){ return Math.ceil(a / b); }

function formatBox(n){ return `${n} ${n>1?'boîtes':'boîte'}`; }
function formatBottle(n){ return `${n} ${n>1?'flacons':'flacon'}`; }

function activeTabId(){
  return qs('.tab.active').dataset.tab;
}

function renderResult(summaryHtml, detailHtml){
  qs('#summary').innerHTML = summaryHtml;
  qs('#detail').innerHTML = detailHtml;
}

function calc(){
  const tab = activeTabId();
  const d = readInputs();
  saveIfChecked();

  if(tab==='tab-comprime'){
    let totalUnits = 0;
    if(d.mode==='multi'){
      totalUnits = sumPhasesUnits();
    }else{
      totalUnits = d.cmp.units * d.cmp.freq * d.cmp.days;
    }
    const boxes = ceilDiv(totalUnits, Math.max(d.cmp.perBox,1));
    renderResult(
      `<p><strong>Comprimés :</strong> ${formatBox(boxes)}</p>`,
      `<p>Total comprimés nécessaires : <strong>${totalUnits}</strong><br>Conditionnement : <strong>${d.cmp.perBox}</strong> / boîte</p>`
    );
  }

  if(tab==='tab-sirop'){
    let totalMl = 0;
    if(d.mode==='multi'){
      // For liquids defined by mg/mL and mg/intake, total mL = sum(days*freq*(doseMg/mgPerMl))
      const dosePerIntakeMl = (x)=> x / Math.max(d.sir.mgPerMl,1);
      const phases = qsa('.phase');
      phases.forEach(ph=>{
        const days = +qs('.ph_days', ph).value || 0;
        const freq = +qs('.ph_freq', ph).value || 0;
        const units = +qs('.ph_units', ph).value || 0; // meaning: "dose mg per intake" override per phase
        const doseMg = units>0 ? units : d.sir.doseMg;
        totalMl += days * freq * dosePerIntakeMl(doseMg);
      });
    }else{
      totalMl = d.sir.days * d.sir.freq * (d.sir.doseMg / Math.max(d.sir.mgPerMl,1));
    }
    const bottles = ceilDiv(totalMl, Math.max(d.sir.bottleMl,1));
    renderResult(
      `<p><strong>Sirop :</strong> ${formatBottle(bottles)}</p>`,
      `<p>Total volume nécessaire : <strong>${totalMl.toFixed(1)} mL</strong><br>Flacon : <strong>${d.sir.bottleMl} mL</strong></p>`
    );
  }

  if(tab==='tab-sachet'){
    let totalUnits = 0;
    if(d.mode==='multi'){
      totalUnits = sumPhasesUnits();
    }else{
      totalUnits = d.sac.units * d.sac.freq * d.sac.days;
    }
    const boxes = ceilDiv(totalUnits, Math.max(d.sac.perBox,1));
    renderResult(
      `<p><strong>Sachets :</strong> ${formatBox(boxes)}</p>`,
      `<p>Total sachets nécessaires : <strong>${totalUnits}</strong><br>Conditionnement : <strong>${d.sac.perBox}</strong> / boîte</p>`
    );
  }

  if(tab==='tab-gouttes'){
    let totalDrops = 0;
    if(d.mode==='multi'){
      const phases = qsa('.phase');
      phases.forEach(ph=>{
        const days = +qs('.ph_days', ph).value || 0;
        const freq = +qs('.ph_freq', ph).value || 0;
        const units = +qs('.ph_units', ph).value || 0; // drops per intake per phase
        const u = units>0 ? units : d.gtt.units;
        totalDrops += days * freq * u;
      });
    }else{
      totalDrops = d.gtt.days * d.gtt.freq * d.gtt.units;
    }
    const mlNeeded = totalDrops / Math.max(d.gtt.perMl,1);
    const bottles = ceilDiv(mlNeeded, Math.max(d.gtt.bottleMl,1));
    renderResult(
      `<p><strong>Gouttes buvables :</strong> ${formatBottle(bottles)}</p>`,
      `<p>Total gouttes : <strong>${totalDrops}</strong><br>Volume estimé : <strong>${mlNeeded.toFixed(1)} mL</strong><br>Flacon : <strong>${d.gtt.bottleMl} mL</strong></p>`
    );
  }

  if(tab==='tab-collyre'){
    let totalDrops = 0;
    const perInstillation = d.col.dropsPerEye * Math.max(d.col.eyes,1);
    if(d.mode==='multi'){
      const phases = qsa('.phase');
      phases.forEach(ph=>{
        const days = +qs('.ph_days', ph).value || 0;
        const freq = +qs('.ph_freq', ph).value || 0;
        const units = +qs('.ph_units', ph).value || 0; // override drops per instillation (both eyes) if provided
        const u = units>0 ? units : perInstillation;
        totalDrops += days * freq * u;
      });
    }else{
      totalDrops = d.col.days * d.col.freq * perInstillation;
    }
    const mlNeeded = totalDrops / Math.max(d.col.perMl,1);
    let bottlesByVolume = ceilDiv(mlNeeded, Math.max(d.col.bottleMl,1));
    // Constraint: max usable days per bottle (optional)
    let bottlesByShelf = 0;
    if(d.col.maxDays>0){
      // If treatment lasts N total days, each bottle usable for maxDays -> need at least ceil(totalDays / maxDays) bottles
      const totalDays = d.mode==='multi'
        ? qsa('.phase').reduce((acc, ph)=> acc + (+qs('.ph_days', ph).value||0), 0)
        : d.col.days;
      bottlesByShelf = Math.ceil(totalDays / Math.max(d.col.maxDays,1));
    }
    const bottles = Math.max(bottlesByVolume, bottlesByShelf||0);
    renderResult(
      `<p><strong>Collyres :</strong> ${formatBottle(bottles)}</p>`,
      `<p>Total gouttes : <strong>${totalDrops}</strong><br>Volume estimé : <strong>${mlNeeded.toFixed(1)} mL</strong><br>Flacon : <strong>${d.col.bottleMl} mL</strong>${d.col.maxDays?`<br>Limite d'utilisation d'un flacon : <strong>${d.col.maxDays} j</strong>`:''}</p>`
    );
  }
}

qs('#calcBtn').addEventListener('click', calc);
qs('#resetBtn').addEventListener('click', ()=>{ localStorage.removeItem(STORAGE_KEY); location.reload(); });

// --- PWA install flow ---
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e)=>{
  e.preventDefault();
  deferredPrompt = e;
  qs('#installBtn').hidden = false;
});
qs('#installBtn').addEventListener('click', async ()=>{
  if(!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  qs('#installBtn').hidden = true;
});

// --- Service worker ---
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('sw.js').catch(console.warn);
  });
}
