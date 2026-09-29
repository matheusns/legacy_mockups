const APP_KEY = "legacy-mvp-v0.3";
const OLD_APP_KEYS = ["legacy-mvp-v0.2", "legacy-mockup-mvp-v0.1"];
const TODAY = new Date().toISOString().slice(0, 10);

const DOMAINS = [
  { key:"personal", label:"Personal", icon:"⌂", subtitle:"Life admin", skill:"Focus" },
  { key:"work", label:"Work", icon:"▣", subtitle:"Projects", skill:"Work" },
  { key:"health", label:"Health", icon:"♥", subtitle:"Habits", skill:"Health" },
  { key:"finance", label:"Finance", icon:"◇", subtitle:"Projection", skill:"Finance" },
  { key:"learning", label:"Learning", icon:"▤", subtitle:"Courses", skill:"Learning" },
  { key:"relationships", label:"Relationships", icon:"◎", subtitle:"People", skill:"Relationships" }
];
const DOMAIN_BY_KEY = Object.fromEntries(DOMAINS.map(d => [d.key, d]));
const DOMAIN_KEY_BY_LABEL = Object.fromEntries(DOMAINS.map(d => [d.label.toLowerCase(), d.key]));

function futureDate(days){
  const d=new Date();
  d.setDate(d.getDate()+days);
  return d.toISOString().slice(0,10);
}

function initialState(){
  return {
    version:"0.3",
    activeView:"today",
    selectedModule:"health",
    selectedLesson:null,
    lowGame:false,
    water:3,
    xp:640,
    coins:120,
    recoveryResolved:false,
    recoveryHistory:[],
    actions:[
      {id:"a1",title:"Review quarterly goals",type:"task",domain:"Personal",xp:15,done:false,dueDate:null,skippedDate:null,source:"seed"},
      {id:"a2",title:"Finish architecture notes",type:"task",domain:"Work",xp:20,done:false,dueDate:null,skippedDate:null,source:"seed"},
      {id:"a3",title:"Mobility + recovery",type:"habit",domain:"Health",xp:10,done:true,dueDate:null,skippedDate:null,source:"seed"},
      {id:"a4",title:"Read 20 minutes",type:"habit",domain:"Learning",xp:10,done:false,dueDate:null,skippedDate:null,source:"seed"}
    ],
    goals:{
      personal:[
        {id:"g-personal-1",title:"Keep weekly life review",progress:72},
        {id:"g-personal-2",title:"Simplify personal administration",progress:45}
      ],
      work:[
        {id:"g-work-1",title:"Ship current technical milestone",progress:84},
        {id:"g-work-2",title:"Strengthen professional portfolio",progress:58}
      ],
      health:[
        {id:"g-health-1",title:"Build sustainable movement routine",progress:68},
        {id:"g-health-2",title:"Improve recovery consistency",progress:54}
      ],
      relationships:[
        {id:"g-relationships-1",title:"Protect quality family time",progress:64}
      ]
    },
    skills:{Health:320,Focus:430,Learning:280,Finance:210,Relationships:160,Work:520},
    rewards:[
      {id:"reward-movie",name:"Watch a movie",cost:80},
      {id:"reward-dinner",name:"Special dinner",cost:150},
      {id:"reward-book",name:"Buy a book",cost:100}
    ],
    rewardHistory:[],
    course:{
      id:"course-robotics-vision",
      title:"Robotics Vision Refresh",
      source:"Seeded prototype fixture",
      importedFrom:null,
      lessons:[
        {id:"lesson-visual-geometry",title:"Visual geometry",done:false},
        {id:"lesson-sensor-fusion",title:"Sensor fusion",done:true},
        {id:"lesson-robust-estimation",title:"Robust estimation",done:false}
      ]
    },
    finance:{
      target:50000,
      current:31500,
      monthly:2500,
      currency:"USD",
      asOf:"2026-09-29",
      source:"Manual prototype fixture"
    },
    workspace:{mode:"Private",family:["You"]},
    proposals:[]
  };
}

function safeParse(raw){try{return raw?JSON.parse(raw):null}catch{return null}}
function migrateState(){
  const current=safeParse(localStorage.getItem(APP_KEY));
  if(current) return normalizeState(current);

  let state=initialState();
  for(const key of OLD_APP_KEYS){
    const old=safeParse(localStorage.getItem(key));
    if(!old) continue;
    state.activeView=old.activeView||old.activeScreen||state.activeView;
    state.selectedModule=old.selectedModule||state.selectedModule;
    state.lowGame=Boolean(old.lowGame);
    if(Number.isFinite(old.water)) state.water=old.water;
    if(Number.isFinite(old.xp)) state.xp=old.xp;
    if(Number.isFinite(old.coins)) state.coins=old.coins;
    if(typeof old.recovered==="boolean") state.recoveryResolved=old.recovered;
    if(Array.isArray(old.actions)){
      state.actions=old.actions.map((a,i)=>({
        id:a.id||"migrated-"+i,
        title:a.title||a.label||"Untitled action",
        type:a.type||"task",
        domain:normalizeDomainLabel(a.domain||"Personal"),
        xp:Number.isFinite(a.xp)?a.xp:10,
        done:Boolean(a.done),
        dueDate:a.dueDate||null,
        skippedDate:a.skippedDate||null,
        source:a.source||"migrated"
      }));
    }
    if(old.skills&&typeof old.skills==="object") state.skills={...state.skills,...old.skills};
    if(old.finance&&typeof old.finance==="object") state.finance={...state.finance,...old.finance};
    if(old.course&&typeof old.course==="object"){
      state.course={...state.course,...old.course};
      if(Array.isArray(old.course.lessons)){
        state.course.lessons=old.course.lessons.map((l,i)=>typeof l==="string"
          ? {id:"lesson-migrated-"+i,title:l,done:false}
          : {id:l.id||"lesson-migrated-"+i,title:l.title||"Lesson "+(i+1),done:Boolean(l.done)});
      }
    }
    if(old.workspace&&typeof old.workspace==="object") state.workspace={...state.workspace,...old.workspace};
    if(Array.isArray(old.proposals)) state.proposals=old.proposals;
    break;
  }
  state=normalizeState(state);
  localStorage.setItem(APP_KEY,JSON.stringify(state));
  return state;
}

function normalizeDomainLabel(value){
  const text=String(value||"").trim();
  const key=DOMAIN_KEY_BY_LABEL[text.toLowerCase()];
  return key?DOMAIN_BY_KEY[key].label:"Personal";
}

function normalizeState(raw){
  const base=initialState();
  const state={...base,...raw};
  state.actions=Array.isArray(raw.actions)?raw.actions.map((a,i)=>({
    id:a.id||"action-"+i,
    title:String(a.title||a.label||"Untitled action"),
    type:a.type==="habit"?"habit":"task",
    domain:normalizeDomainLabel(a.domain),
    xp:Number.isFinite(a.xp)?a.xp:10,
    done:Boolean(a.done),
    dueDate:a.dueDate||null,
    skippedDate:a.skippedDate||null,
    source:a.source||"local"
  })):base.actions;
  state.goals={...base.goals,...(raw.goals||{})};
  state.skills={...base.skills,...(raw.skills||{})};
  state.finance={...base.finance,...(raw.finance||{})};
  state.workspace={...base.workspace,...(raw.workspace||{})};
  state.recoveryHistory=Array.isArray(raw.recoveryHistory)?raw.recoveryHistory:[];
  state.rewardHistory=Array.isArray(raw.rewardHistory)?raw.rewardHistory:[];
  state.proposals=Array.isArray(raw.proposals)?raw.proposals:[];
  state.course={...base.course,...(raw.course||{})};
  if(!Array.isArray(state.course.lessons)) state.course.lessons=base.course.lessons;
  state.course.lessons=state.course.lessons.map((l,i)=>typeof l==="string"?{id:"lesson-"+i,title:l,done:false}:{id:l.id||"lesson-"+i,title:l.title||"Lesson "+(i+1),done:Boolean(l.done)});
  if(!DOMAIN_BY_KEY[state.selectedModule]) state.selectedModule="health";
  if(!["today","map","life","insights","me"].includes(state.activeView)) state.activeView="today";
  return state;
}

let state=migrateState();
let sharedGoals=window.LegacySharedGoals.load();
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
let toastTimer=null;
let dialogReturnFocus=null;

function save(){
  localStorage.setItem(APP_KEY,JSON.stringify(state));
}
function reloadShared(){
  sharedGoals=window.LegacySharedGoals.load();
}
function saveShared(){
  sharedGoals=window.LegacySharedGoals.save(sharedGoals);
}
function escapeHtml(value){
  return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}
function formatMoney(value,currency=state.finance.currency){
  return new Intl.NumberFormat("en-US",{style:"currency",currency,maximumFractionDigits:2}).format(value);
}
function showDialog(dialog){
  dialogReturnFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
  dialog.showModal();
}
function restoreDialogFocus(){
  if(dialogReturnFocus&&document.contains(dialogReturnFocus)) dialogReturnFocus.focus();
  dialogReturnFocus=null;
}
function showToast(message){
  const toast=$("#toast");
  clearTimeout(toastTimer);
  toast.textContent=message||"";
  if(!message){toast.hidden=true;return}
  toast.hidden=false;
  toastTimer=setTimeout(()=>{toast.hidden=true;toast.textContent=""},2400);
}
function domainForLabel(label){
  return DOMAINS.find(d=>d.label===label)||DOMAIN_BY_KEY.personal;
}
function addSkillXp(domainLabel,amount){
  const skill=domainForLabel(domainLabel).skill;
  state.skills[skill]=Math.max(0,(state.skills[skill]||0)+amount);
}
function todayActions(){
  return state.actions.filter(a=>(!a.dueDate||a.dueDate<=TODAY)&&a.skippedDate!==TODAY);
}
function futureActions(){
  return state.actions.filter(a=>a.dueDate&&a.dueDate>TODAY);
}

function setView(view){
  if(!["today","map","life","insights","me"].includes(view)) return;
  state.activeView=view;
  $$(".view").forEach(v=>{
    const active=v.dataset.view===view;
    v.classList.toggle("active",active);
    v.setAttribute("aria-hidden",String(!active));
  });
  $$(".tab").forEach(tab=>{
    const active=tab.dataset.target===view;
    tab.classList.toggle("active",active);
    if(active) tab.setAttribute("aria-current","page");
    else tab.removeAttribute("aria-current");
  });
  $("#screenTitle").textContent={today:"Today",map:"Map",life:"Life",insights:"Insights",me:"Me"}[view];
  save();
  window.scrollTo({top:0,behavior:"auto"});
}

function toggleAction(id){
  const action=state.actions.find(a=>a.id===id);
  if(!action)return;
  const delta=action.done?-action.xp:action.xp;
  action.done=!action.done;
  state.xp=Math.max(0,state.xp+delta);
  addSkillXp(action.domain,delta);
  const coinDelta=Math.max(1,Math.round(action.xp/10));
  state.coins=Math.max(0,state.coins+(action.done?coinDelta:-coinDelta));
  save();
  renderAll();
  showToast(action.done
    ? `Completed · +${action.xp} global XP · +${action.xp} ${domainForLabel(action.domain).skill} skill XP`
    : `Completion undone · XP and skill award reversed`);
}

function renderToday(){
  const actions=todayActions();
  const list=$("#actionList");
  list.replaceChildren();
  actions.forEach(action=>{
    const li=document.createElement("li");
    li.className="action-item"+(action.done?" done":"");
    li.innerHTML=`<button class="check-button" type="button" aria-pressed="${action.done}" aria-label="${action.done?"Undo":"Complete"} ${escapeHtml(action.title)}"><span class="check-dot">${action.done?"✓":""}</span></button>
      <div class="action-copy"><strong>${escapeHtml(action.title)}</strong><small>${escapeHtml(action.domain)} · ${action.type} · ${action.source==="seed"?"seeded demo":"local"}</small></div>
      <span class="action-xp game-only">+${action.xp} XP</span>`;
    li.querySelector("button").addEventListener("click",()=>toggleAction(action.id));
    list.append(li);
  });
  if(!actions.length){
    const empty=document.createElement("li");
    empty.className="empty-state";
    empty.textContent="Nothing scheduled for Today. Add a task or review Upcoming.";
    list.append(empty);
  }
  const done=actions.filter(a=>a.done).length;
  $("#todaySummary").textContent=done+"/"+actions.length;
  const next=actions.find(a=>!a.done);
  $("#nextActionTitle").textContent=next?next.title:"Daily plan complete";
  $("#nextActionMeta").textContent=next
    ? (state.lowGame?`${next.domain} · next meaningful action`:`${next.domain} · +${next.xp} XP`)
    : "Review tomorrow or choose a Life module.";
  $("#completeNextButton").disabled=!next;

  $("#waterAmount").textContent=state.water*250;
  $("#waterGlasses").textContent=state.water;
  $("#waterProgress").style.width=Math.min(100,state.water/8*100)+"%";
  $("#continuityScore").textContent=(82+Math.min(5,done))+"%";
  const continuity=$("#continuityGrid");continuity.replaceChildren();
  [1,1,1,0,1,1,done>2?1:0].forEach(on=>{const el=document.createElement("span");el.className="continuity-day"+(on?" on":"");el.setAttribute("aria-label",on?"Completed day":"Missed day");continuity.append(el)});

  $("#recoveryCard").hidden=state.recoveryResolved;

  const upcoming=futureActions();
  $("#upcomingCard").hidden=!upcoming.length;
  $("#upcomingCount").textContent=upcoming.length;
  const upcomingList=$("#upcomingList");upcomingList.replaceChildren();
  upcoming.forEach(a=>{
    const row=document.createElement("div");row.className="upcoming-row";
    row.innerHTML=`<div><strong>${escapeHtml(a.title)}</strong><span>${escapeHtml(a.domain)}</span></div><span>${escapeHtml(a.dueDate)}</span>`;
    upcomingList.append(row);
  });
}

function renderMap(){
  reloadShared();
  const phases=window.LegacySharedGoals.phases;
  const strip=$("#phaseStrip");strip.replaceChildren();
  Object.entries(phases).forEach(([key,phase])=>{
    const progress=window.LegacySharedGoals.progress(sharedGoals,key);
    const button=document.createElement("button");
    button.type="button";
    button.className="phase-chip"+(key===sharedGoals.selectedPhase?" selected":"");
    button.setAttribute("aria-pressed",String(key===sharedGoals.selectedPhase));
    button.innerHTML=`<small>${phase.theme.toUpperCase()}</small><strong>${phase.title}</strong><span>${progress.done}/${progress.total} milestones</span>`;
    button.addEventListener("click",()=>{sharedGoals.selectedPhase=key;saveShared();renderMap()});
    strip.append(button);
  });
  const phase=phases[sharedGoals.selectedPhase];
  $("#selectedPhaseTitle").textContent=phase.title;
  $("#selectedPhaseDescription").textContent=phase.description;
  const list=$("#phaseMilestoneList");list.replaceChildren();
  phase.milestones.forEach(m=>{
    const done=Boolean(sharedGoals.completed[m.id]);
    const row=document.createElement("div");row.className="milestone-row"+(done?" done":"");
    row.innerHTML=`<button class="milestone-toggle" type="button" aria-pressed="${done}" aria-label="${done?"Undo":"Complete"} ${escapeHtml(m.label)}"><span>${done?"✓":""}</span></button><strong>${escapeHtml(m.label)}</strong>`;
    row.querySelector("button").addEventListener("click",()=>{
      sharedGoals.completed[m.id]=!sharedGoals.completed[m.id];
      saveShared();renderMap();showToast("Shared map state updated");
    });
    list.append(row);
  });
}

function populateDomainSelect(){
  const select=$("#quickAddDomain");
  const previous=select.value;
  select.replaceChildren();
  DOMAINS.forEach(domain=>{
    const option=document.createElement("option");
    option.value=domain.label;option.textContent=domain.label;select.append(option);
  });
  if(DOMAINS.some(d=>d.label===previous)) select.value=previous;
}

function openQuickAdd(domainLabel){
  populateDomainSelect();
  const normalized=normalizeDomainLabel(domainLabel||"Personal");
  $("#quickAddDomain").value=normalized;
  showDialog($("#quickAddDialog"));
}

function moduleGoals(key){
  return Array.isArray(state.goals[key])?state.goals[key]:[];
}
function averageGoalProgress(key){
  const goals=moduleGoals(key);
  if(!goals.length)return null;
  return Math.round(goals.reduce((sum,g)=>sum+Number(g.progress||0),0)/goals.length);
}
function renderGoalModule(key){
  const goals=moduleGoals(key);
  const domain=DOMAIN_BY_KEY[key];
  const avg=averageGoalProgress(key);
  let extra="";
  if(key==="health"){
    extra=`<div class="module-metric-grid"><div class="metric-tile"><strong>${state.water*250} ml</strong><span>Water today · local log</span></div><div class="metric-tile"><strong>${state.skills.Health} XP</strong><span>Health skill · local demo</span></div></div>`;
  }
  return `${extra}
    <div class="module-metric-grid"><div class="metric-tile"><strong>${goals.length}</strong><span>Inspectable goals</span></div><div class="metric-tile"><strong>${avg===null?"—":avg+"%"}</strong><span>Average goal progress</span></div></div>
    <div class="goal-list">${goals.map(g=>`<button class="goal-row" type="button" data-goal-id="${g.id}"><span><strong>${escapeHtml(g.title)}</strong><small>Tap to view/edit</small></span><span class="progress-inline">${g.progress}%</span></button>`).join("")}</div>
    <button class="module-action" type="button" data-add-domain="${domain.label}">Add ${domain.label} action</button>`;
}

function financeProjection(){
  const f=state.finance;
  const remaining=Math.max(0,f.target-f.current);
  if(f.monthly<=0)return {remaining,months:null,projectedDate:null};
  const months=Math.ceil(remaining/f.monthly);
  const date=new Date(f.asOf+"T00:00:00");
  date.setMonth(date.getMonth()+months);
  return {remaining,months,projectedDate:date.toISOString().slice(0,10)};
}
function renderFinance(){
  const f=state.finance;const projection=financeProjection();const pct=Math.min(100,Math.round(f.current/f.target*100));
  return `<div class="data-note"><strong>SIMULATED FINANCE.</strong> All figures below are manual prototype data; no bank is connected.</div>
    <div class="module-metric-grid"><div class="metric-tile"><strong>${pct}%</strong><span>Goal funded</span></div><div class="metric-tile"><strong>${formatMoney(f.current)}</strong><span>Current amount</span></div></div>
    <div class="finance-context">
      <div class="context-row"><span>Target</span><strong>${formatMoney(f.target)} ${f.currency}</strong></div>
      <div class="context-row"><span>As of</span><strong>${f.asOf}</strong></div>
      <div class="context-row"><span>Monthly contribution</span><strong>${formatMoney(f.monthly)}</strong></div>
      <div class="context-row"><span>Remaining</span><strong>${formatMoney(projection.remaining)}</strong></div>
      <div class="context-row"><span>Projection</span><strong>${projection.months===null?"No projection":projection.months+" months · "+projection.projectedDate}</strong></div>
      <div class="context-row"><span>Formula</span><strong>ceil((target − current) / monthly)</strong></div>
      <div class="context-row"><span>Source / provenance</span><strong>${escapeHtml(f.source)}</strong></div>
    </div>
    <button id="adjustFinance" class="module-action" type="button">Adjust monthly assumption</button>`;
}

function learningProgress(){
  const lessons=state.course.lessons;const done=lessons.filter(l=>l.done).length;
  return {done,total:lessons.length,percent:lessons.length?Math.round(done/lessons.length*100):0};
}
function renderLearning(){
  const selected=state.course.lessons.find(l=>l.id===state.selectedLesson);
  const progress=learningProgress();
  if(selected){
    return `<div class="data-note"><strong>COURSE CONTEXT.</strong> ${escapeHtml(state.course.title)} · ${escapeHtml(state.course.source)}</div>
      <div class="lesson-detail"><p class="eyebrow">LESSON DETAIL</p><h3>${escapeHtml(selected.title)}</h3><p class="subtle">Prototype lesson content. This demonstrates navigation and completion state only.</p>
        <div class="lesson-detail-actions"><button id="lessonBack" type="button">← Course</button><button id="lessonToggle" type="button">${selected.done?"Mark incomplete":"Complete lesson"}</button></div>
      </div>`;
  }
  return `<div class="data-note"><strong>SIMULATED LEARNING DATA.</strong> Link import below generates a mock draft; no external page is fetched.</div>
    <div class="module-metric-grid"><div class="metric-tile"><strong>${progress.percent}%</strong><span>${escapeHtml(state.course.title)}</span></div><div class="metric-tile"><strong>${progress.done}/${progress.total}</strong><span>Completed lessons</span></div></div>
    <div class="lesson-list">${state.course.lessons.map(l=>`<button class="lesson-row" type="button" data-lesson-id="${l.id}"><span><strong>${escapeHtml(l.title)}</strong><small>${l.done?"Completed":"Open lesson"}</small></span><span class="progress-inline">${l.done?"✓":"›"}</span></button>`).join("")}</div>
    <button id="importCourse" class="module-action" type="button">Import course link · simulated</button>`;
}

function renderLife(){
  const grid=$("#moduleGrid");grid.replaceChildren();
  DOMAINS.forEach(domain=>{
    const button=document.createElement("button");
    button.type="button";button.className="module-card"+(state.selectedModule===domain.key?" selected":"");
    button.setAttribute("aria-pressed",String(state.selectedModule===domain.key));
    button.innerHTML=`<span class="module-icon" aria-hidden="true">${domain.icon}</span><strong>${domain.label}</strong><small>${domain.subtitle}</small>`;
    button.addEventListener("click",()=>{state.selectedModule=domain.key;state.selectedLesson=null;save();renderLife()});
    grid.append(button);
  });
  const domain=DOMAIN_BY_KEY[state.selectedModule];
  $("#moduleEyebrow").textContent=domain.label.toUpperCase();
  $("#moduleTitle").textContent=domain.label;
  $("#moduleDescription").textContent={
    personal:"Personal goals, routines, errands and home systems.",
    work:"Professional objectives, deliverables and next actions.",
    health:"Hydration, movement, recovery and health-linked prototype signals.",
    finance:"Goal-linked financial assumptions with visible calculation context.",
    learning:"Courses, lessons and review-gated simulated imports.",
    relationships:"Private relationship goals, meaningful follow-ups and shared plans."
  }[state.selectedModule];

  const root=$("#moduleContent");
  if(["personal","work","health","relationships"].includes(state.selectedModule)) root.innerHTML=renderGoalModule(state.selectedModule);
  else if(state.selectedModule==="finance") root.innerHTML=renderFinance();
  else root.innerHTML=renderLearning();

  root.querySelectorAll("[data-goal-id]").forEach(button=>button.addEventListener("click",()=>openGoalEditor(state.selectedModule,button.dataset.goalId)));
  root.querySelector("[data-add-domain]")?.addEventListener("click",e=>openQuickAdd(e.currentTarget.dataset.addDomain));
  $("#adjustFinance")?.addEventListener("click",openFinanceDialog);
  $("#importCourse")?.addEventListener("click",openCourseDialog);
  root.querySelectorAll("[data-lesson-id]").forEach(button=>button.addEventListener("click",()=>{state.selectedLesson=button.dataset.lessonId;save();renderLife()}));
  $("#lessonBack")?.addEventListener("click",()=>{state.selectedLesson=null;save();renderLife()});
  $("#lessonToggle")?.addEventListener("click",()=>{
    const lesson=state.course.lessons.find(l=>l.id===state.selectedLesson);if(!lesson)return;
    const delta=lesson.done?-10:10;lesson.done=!lesson.done;state.xp=Math.max(0,state.xp+delta);state.skills.Learning=Math.max(0,state.skills.Learning+delta);save();renderAll();showToast(lesson.done?"Lesson complete · +10 XP and Learning skill XP":"Lesson reopened · award reversed");
  });
}

function openGoalEditor(domainKey,goalId){
  const goal=moduleGoals(domainKey).find(g=>g.id===goalId);if(!goal)return;
  openInfo("Goal detail",`<p class="subtle">This is an editable browser-local prototype goal.</p>
    <form id="goalEditForm" class="form-stack">
      <label for="goalTitleInput">Title</label><input id="goalTitleInput" maxlength="100" value="${escapeHtml(goal.title)}" required>
      <label for="goalProgressInput">Progress (%)</label><input id="goalProgressInput" type="number" min="0" max="100" step="1" value="${goal.progress}" required>
      <button class="cta-button full" type="submit">Save goal</button>
    </form>`);
  $("#goalEditForm").addEventListener("submit",e=>{
    e.preventDefault();
    goal.title=$("#goalTitleInput").value.trim()||goal.title;
    goal.progress=Math.max(0,Math.min(100,Number($("#goalProgressInput").value)||0));
    save();$("#appDialog").close();renderAll();showToast("Goal updated");
  });
}

function domainProgress(domainKey){
  if(domainKey==="finance") return Math.min(100,Math.round(state.finance.current/state.finance.target*100));
  if(domainKey==="learning") return learningProgress().percent;
  return averageGoalProgress(domainKey);
}
function renderInsights(){
  const due=todayActions();const completed=due.filter(a=>a.done).length;
  const pct=due.length?Math.round(completed/due.length*100):0;
  $("#weeklyCompletion").textContent=pct;$("#ringLabel").textContent=pct+"%";$("#completionRing").style.setProperty("--ring",pct+"%");
  const root=$("#domainBars");root.replaceChildren();
  DOMAINS.forEach(domain=>{
    const value=domainProgress(domain.key);
    const row=document.createElement("div");row.className="domain-bar-row";
    row.innerHTML=`<strong>${domain.label}</strong><div class="bar-track"><span style="width:${value===null?0:value}%"></span></div><em>${value===null?"No data":value+"%"}</em>`;
    root.append(row);
  });
}

function renderMe(){
  const level=Math.max(1,Math.floor(state.xp/100));
  $("#levelValue").textContent=level;$("#xpValue").textContent=state.xp;$("#xpProgress").style.width=Math.min(100,(state.xp%800)/8)+"%";$("#coinValue").textContent=state.coins;
  const skills=$("#skillGrid");skills.replaceChildren();
  Object.entries(state.skills).forEach(([name,xp])=>{
    const card=document.createElement("div");card.className="skill-card";
    card.innerHTML=`<strong>${escapeHtml(name)}</strong><span>${xp} XP · mapped local state</span><div class="mini-progress"><span style="width:${Math.min(100,xp/6)}%"></span></div>`;
    skills.append(card);
  });
  const rewards=$("#rewardList");rewards.replaceChildren();
  state.rewards.forEach(reward=>{
    const row=document.createElement("div");row.className="reward-row";
    row.innerHTML=`<div><strong>${escapeHtml(reward.name)}</strong><div class="subtle">${reward.cost} coins · local demo reward</div></div><button type="button" ${state.coins<reward.cost?"disabled":""}>Redeem</button>`;
    row.querySelector("button").addEventListener("click",()=>{
      if(state.coins<reward.cost)return;
      state.coins-=reward.cost;state.rewardHistory.push({rewardId:reward.id,at:new Date().toISOString(),cost:reward.cost});
      save();renderMe();showToast("Demo reward redeemed and recorded locally");
    });
    rewards.append(row);
  });
  $("#lowGameStatus").textContent=state.lowGame?"On":"Off";
  $("#lowGameToggle").setAttribute("aria-pressed",String(state.lowGame));
  document.body.classList.toggle("low-game",state.lowGame);
  $("#lowGameNotice").hidden=!state.lowGame;
}

function renderAll(){
  renderToday();renderMap();renderLife();renderInsights();renderMe();setView(state.activeView);renderDebug();
}
function renderDebug(){
  requestAnimationFrame(()=>{
    const currentTabs=$$(".tab[aria-current='page']");
    const inactiveVisible=$$(".view:not(.active)").filter(v=>getComputedStyle(v).display!=="none");
    window.__LEGACY_MVP_DEBUG__={
      version:"0.3-audit-repair",
      activeView:state.activeView,
      selectedPhase:sharedGoals.selectedPhase,
      selectedModule:state.selectedModule,
      counts:{actions:state.actions.length,domains:DOMAINS.length,proposals:state.proposals.length},
      checks:{
        exactlyFiveTopLevelTabs:$$(".tab").length===5,
        exactlyOneCurrentNav:currentTabs.length===1,
        inactiveViewsHidden:inactiveVisible.length===0,
        canonicalDomains:DOMAINS.map(d=>d.label),
        persistence:typeof localStorage!=="undefined",
        sharedMapKey:window.LegacySharedGoals.KEY,
        privateFirstWorkspace:state.workspace.mode==="Private",
        reducedGameActive:state.lowGame
      }
    };
  });
}

function openInfo(title,body,eyebrow="MVP FLOW"){
  $("#appDialogEyebrow").textContent=eyebrow;
  $("#appDialogTitle").textContent=title;
  $("#dialogBody").innerHTML=body;
  showDialog($("#appDialog"));
}

function openRecovery(){
  openInfo("Recovery plan",`<p class="subtle">History is preserved. Choose what happens to unresolved actions.</p>
    <div class="choice-list">
      <button id="recoveryResume" class="choice-button" type="button"><strong>Resume</strong><span>Keep unresolved actions on Today.</span></button>
      <button id="recoveryReschedule" class="choice-button" type="button"><strong>Reschedule</strong><span>Select actions and a target date.</span></button>
      <button id="recoverySkip" class="choice-button" type="button"><strong>Skip intentionally</strong><span>Hide unresolved actions for today without deleting history.</span></button>
    </div>`);
  $("#recoveryResume").addEventListener("click",()=>{
    state.recoveryResolved=true;state.recoveryHistory.push({type:"resume",at:new Date().toISOString()});save();$("#appDialog").close();renderAll();showToast("Recovery resumed · history preserved");
  });
  $("#recoveryReschedule").addEventListener("click",openReschedule);
  $("#recoverySkip").addEventListener("click",()=>{
    const affected=todayActions().filter(a=>!a.done);
    affected.forEach(a=>a.skippedDate=TODAY);
    state.recoveryResolved=true;state.recoveryHistory.push({type:"skip",actionIds:affected.map(a=>a.id),at:new Date().toISOString()});
    save();$("#appDialog").close();renderAll();showToast(`${affected.length} action(s) skipped for today · history preserved`);
  });
}

function openReschedule(){
  const candidates=todayActions().filter(a=>!a.done);
  $("#appDialogEyebrow").textContent="RECOVERY · RESCHEDULE";
  $("#appDialogTitle").textContent="Move selected actions";
  $("#dialogBody").innerHTML=`<form id="rescheduleForm" class="form-stack">
    <p class="subtle">Choose the actions and the date they should appear next.</p>
    <div class="check-list">${candidates.map(a=>`<label class="check-row"><input type="checkbox" name="action" value="${a.id}" checked><span>${escapeHtml(a.title)}</span></label>`).join("")}</div>
    <label for="rescheduleDate">Target date</label>
    <input id="rescheduleDate" type="date" min="${futureDate(1)}" value="${futureDate(1)}" required>
    <button class="cta-button full" type="submit">Reschedule selected</button>
    <button id="rescheduleCancel" class="secondary-wide" type="button">Cancel</button>
  </form>`;
  $("#rescheduleCancel").addEventListener("click",()=>$("#appDialog").close());
  $("#rescheduleForm").addEventListener("submit",e=>{
    e.preventDefault();
    const ids=[...e.currentTarget.querySelectorAll("input[name=action]:checked")].map(x=>x.value);
    const date=$("#rescheduleDate").value;
    if(!ids.length){showToast("Select at least one action");return}
    if(!date||date<=TODAY){showToast("Choose a future date");return}
    ids.forEach(id=>{const action=state.actions.find(a=>a.id===id);if(action){action.dueDate=date;action.skippedDate=null}});
    state.recoveryResolved=true;
    state.recoveryHistory.push({type:"reschedule",actionIds:ids,targetDate:date,at:new Date().toISOString()});
    save();$("#appDialog").close();renderAll();showToast(`${ids.length} action(s) moved to ${date}`);
  });
}

function openFinanceDialog(){
  openInfo("Finance assumptions",`<div class="data-note"><strong>SIMULATED FINANCE.</strong> Manual browser-local values only.</div>
    <form id="financeForm" class="form-stack">
      <label for="monthlyInput">Monthly contribution (${state.finance.currency})</label>
      <input id="monthlyInput" type="number" min="0" step="0.01" value="${state.finance.monthly}" required>
      <button class="cta-button full" type="submit">Update deterministic projection</button>
    </form>`,"FINANCE · MANUAL ASSUMPTION");
  $("#financeForm").addEventListener("submit",e=>{
    e.preventDefault();const value=Number($("#monthlyInput").value);
    if(!Number.isFinite(value)||value<0){showToast("Enter a non-negative contribution");return}
    state.finance.monthly=value;save();$("#appDialog").close();renderAll();showToast("Finance assumption updated");
  });
}

function openCourseDialog(){
  openInfo("Import course link",`<div class="data-note"><strong>SIMULATED EXTRACTION.</strong> This prototype does not fetch the URL. It generates a mock draft for review.</div>
    <form id="courseForm" class="form-stack">
      <label for="courseLink">Course source URL</label>
      <input id="courseLink" type="url" placeholder="https://example.com/course" required>
      <button class="cta-button full" type="submit">Generate simulated draft</button>
    </form>`,"LEARNING · REVIEW GATE");
  $("#courseForm").addEventListener("submit",e=>{
    e.preventDefault();const url=$("#courseLink").value;
    $("#appDialogEyebrow").textContent="SIMULATED AI EXTRACTION · REVIEW REQUIRED";
    $("#appDialogTitle").textContent="Draft course structure";
    $("#dialogBody").innerHTML=`<p class="subtle">Source: ${escapeHtml(url)}. Nothing is saved until you explicitly accept.</p>
      <div class="milestone-list"><div class="milestone-row"><strong>Foundations</strong></div><div class="milestone-row"><strong>Practice</strong></div><div class="milestone-row"><strong>Project</strong></div></div>
      <button id="acceptCourse" class="cta-button full" type="button">Accept simulated draft</button>
      <button id="cancelCourse" class="secondary-wide" type="button">Cancel</button>`;
    $("#cancelCourse").addEventListener("click",()=>$("#appDialog").close());
    $("#acceptCourse").addEventListener("click",()=>{
      state.course.importedFrom=url;
      state.course.source="Simulated import accepted from "+url;
      state.course.lessons=[
        {id:"lesson-import-foundations",title:"Foundations",done:false},
        {id:"lesson-import-practice",title:"Practice",done:false},
        {id:"lesson-import-project",title:"Project",done:false}
      ];
      state.selectedLesson=null;save();$("#appDialog").close();renderAll();showToast("Simulated course draft accepted and saved locally");
    });
  });
}

function openWorkspace(){
  openInfo("Workspace & family",`<div class="data-note"><strong>PRIVACY MOCKUP ONLY.</strong> This static prototype does not authenticate users or enforce server-side authorization.</div>
    <div class="finance-context"><div class="context-row"><span>Current workspace</span><strong>${escapeHtml(state.workspace.mode)}</strong></div><div class="context-row"><span>Members</span><strong>${state.workspace.family.map(escapeHtml).join(", ")}</strong></div><div class="context-row"><span>Sharing default</span><strong>Explicit opt-in</strong></div></div>
    <button class="secondary-wide" type="button" disabled>Invite family member · preview only</button>`,"WORKSPACE · PRIVATE BY DEFAULT");
}

function openFeatureGovernance(){
  const latest=state.proposals[state.proposals.length-1];
  const existing=latest?`<div class="data-note"><strong>Latest simulated proposal:</strong> ${escapeHtml(latest.text)} · Status: ${escapeHtml(latest.status)}</div>`:"";
  openInfo("Feature proposal",`${existing}<div class="data-note"><strong>SIMULATED AI.</strong> No model call or production change occurs. Approval is a browser-local mock state transition.</div>
    <form id="proposalForm" class="form-stack"><label for="proposalText">Feature request</label><textarea id="proposalText" required placeholder="I want…"></textarea><button class="cta-button full" type="submit">Generate simulated draft</button></form>`,"AI GOVERNANCE · HUMAN IN LOOP");
  $("#proposalForm").addEventListener("submit",e=>{
    e.preventDefault();const text=$("#proposalText").value.trim();if(!text)return;
    const proposal={id:"proposal-"+Date.now(),text,status:"Draft",createdAt:new Date().toISOString()};
    state.proposals.push(proposal);save();renderProposalReview(proposal.id);
  });
}
function renderProposalReview(id){
  const proposal=state.proposals.find(p=>p.id===id);if(!proposal)return;
  $("#appDialogEyebrow").textContent="SIMULATED AI DRAFT · ADMIN DECISION";
  $("#appDialogTitle").textContent="Candidate feature";
  $("#dialogBody").innerHTML=`<p>${escapeHtml(proposal.text)}</p>
    <div class="finance-context"><div class="context-row"><span>Status</span><strong id="proposalStatus">${escapeHtml(proposal.status)}</strong></div><div class="context-row"><span>Scope</span><strong>Mockup candidate</strong></div><div class="context-row"><span>Boundary</span><strong>No baseline/deploy action</strong></div></div>
    <div class="choice-list"><button id="proposalApprove" class="choice-button" type="button"><strong>Simulate admin approval to Beta</strong><span>Changes local status only.</span></button><button id="proposalReject" class="choice-button" type="button"><strong>Reject draft</strong><span>Changes local status only.</span></button></div>`;
  $("#proposalApprove").addEventListener("click",()=>{proposal.status="Beta approved (simulated)";proposal.decidedAt=new Date().toISOString();save();$("#proposalStatus").textContent=proposal.status;showToast("Proposal moved to simulated Beta-approved state")});
  $("#proposalReject").addEventListener("click",()=>{proposal.status="Rejected (simulated)";proposal.decidedAt=new Date().toISOString();save();$("#proposalStatus").textContent=proposal.status;showToast("Proposal rejected in local mock state")});
}

function renderSearch(query){
  reloadShared();
  const q=query.trim().toLowerCase();
  const results=[
    ...state.actions.map(a=>({title:a.title,meta:a.domain+" · "+a.type,view:"today"})),
    ...Object.entries(window.LegacySharedGoals.phases).map(([key,p])=>({title:p.title,meta:"Goal phase · "+p.theme,view:"map",phase:key})),
    ...DOMAINS.map(d=>({title:d.label,meta:"Life module",view:"life",module:d.key})),
    ...state.course.lessons.map(l=>({title:l.title,meta:"Learning lesson · "+state.course.title,view:"life",module:"learning",lesson:l.id})),
    ...Object.entries(state.goals).flatMap(([domainKey,goals])=>goals.map(g=>({title:g.title,meta:DOMAIN_BY_KEY[domainKey].label+" goal",view:"life",module:domainKey,goal:g.id})))
  ].filter(item=>!q||item.title.toLowerCase().includes(q)||item.meta.toLowerCase().includes(q)).slice(0,10);
  const root=$("#searchResults");root.replaceChildren();
  if(!results.length){root.innerHTML='<div class="empty-state">No matching prototype items.</div>';return}
  results.forEach(result=>{
    const button=document.createElement("button");button.className="search-result";button.type="button";
    button.innerHTML=`<strong>${escapeHtml(result.title)}</strong><small>${escapeHtml(result.meta)}</small>`;
    button.addEventListener("click",()=>{
      if(result.phase){sharedGoals.selectedPhase=result.phase;saveShared()}
      if(result.module){state.selectedModule=result.module}
      if(result.lesson){state.selectedLesson=result.lesson}
      else if(result.module==="learning") state.selectedLesson=null;
      save();$("#searchDialog").close();state.activeView=result.view;renderAll();
      if(result.goal) setTimeout(()=>openGoalEditor(result.module,result.goal),0);
    });
    root.append(button);
  });
}

$$(".tab").forEach(tab=>tab.addEventListener("click",()=>setView(tab.dataset.target)));
$("#completeNextButton").addEventListener("click",()=>{const next=todayActions().find(a=>!a.done);if(next)toggleAction(next.id)});
$("#waterPlus").addEventListener("click",()=>{state.water=Math.min(12,state.water+1);save();renderAll();showToast("+250 ml logged locally")});
$("#waterMinus").addEventListener("click",()=>{state.water=Math.max(0,state.water-1);save();renderAll();showToast("-250 ml")});
$("#recoverButton").addEventListener("click",openRecovery);
$("#addTaskInline").addEventListener("click",()=>openQuickAdd("Personal"));
$("#quickAddButton").addEventListener("click",()=>openQuickAdd("Personal"));
$("#quickAddForm").addEventListener("submit",e=>{
  e.preventDefault();const title=$("#quickAddTitle").value.trim();if(!title)return;
  state.actions.unshift({id:"action-"+Date.now(),title,type:$("#quickAddType").value,domain:normalizeDomainLabel($("#quickAddDomain").value),xp:10,done:false,dueDate:null,skippedDate:null,source:"user"});
  $("#quickAddTitle").value="";save();$("#quickAddDialog").close();renderAll();showToast("Action added to Today");
});
$("[data-open-module='health']").addEventListener("click",()=>{state.selectedModule="health";state.selectedLesson=null;state.activeView="life";renderAll()});
$("#lowGameToggle").addEventListener("click",()=>{state.lowGame=!state.lowGame;save();renderAll();showToast(state.lowGame?"Low-gamification mode enabled":"Game presentation restored")});
$("#workspaceButton").addEventListener("click",openWorkspace);
$("#featureRequestButton").addEventListener("click",openFeatureGovernance);
$("#searchButton").addEventListener("click",()=>{showDialog($("#searchDialog"));$("#searchInput").value="";renderSearch("");$("#searchInput").focus()});
$("#searchInput").addEventListener("input",e=>renderSearch(e.target.value));
$$(".signal-card").forEach(button=>button.addEventListener("click",()=>openInfo("Insight source",'<p class="subtle">This is a prototype review signal. Values are either derived from local editable state or explicitly marked illustrative; no external analytics service is connected.</p>',"INSIGHTS · SOURCE BOUNDARY")));

[$("#appDialog"),$("#quickAddDialog"),$("#searchDialog")].forEach(dialog=>dialog.addEventListener("close",restoreDialogFocus));

window.addEventListener("storage",event=>{
  if(event.key===window.LegacySharedGoals.KEY){reloadShared();renderMap()}
});
window.addEventListener("pageshow",()=>{reloadShared();renderMap()});
window.addEventListener("pagehide",save);

populateDomainSelect();
renderAll();