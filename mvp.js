const STORAGE_KEY="legacy-mvp-v0.2";

const initialState={
  activeView:"today",
  selectedPhase:"career",
  selectedModule:"health",
  lowGame:false,
  water:3,
  xp:640,
  coins:120,
  recovered:false,
  actions:[
    {id:"a1",title:"Review quarterly goals",type:"task",domain:"Personal",xp:15,done:false},
    {id:"a2",title:"Finish architecture notes",type:"task",domain:"Work",xp:20,done:false},
    {id:"a3",title:"Mobility + recovery",type:"habit",domain:"Health",xp:10,done:true},
    {id:"a4",title:"Read 20 minutes",type:"habit",domain:"Learning",xp:10,done:false}
  ],
  phases:{
    foundation:{title:"Foundation",theme:"Meadow",description:"Systems, routines and the operating base.",milestones:[["Life system",true],["Core routines",true],["Review cadence",true]]},
    health:{title:"Health",theme:"Jungle",description:"Energy, fitness, recovery and sustainable habits.",milestones:[["Movement baseline",true],["Hydration consistency",false],["Recovery routine",false]]},
    career:{title:"Career",theme:"Harbor",description:"Mastery, professional leverage and meaningful impact.",milestones:[["Role direction",true],["Portfolio proof",true],["Strategic network",false],["Career checkpoint",false]]},
    wealth:{title:"Wealth",theme:"Mines",description:"Resilience, optionality and long-term capital.",milestones:[["Emergency buffer",true],["Automate investing",false],["Capital target",false]]},
    legacy:{title:"Legacy",theme:"Ruins",description:"Contribution, family, mentorship and durable work.",milestones:[["Define contribution",false],["Build enduring artifact",false],["Pass knowledge forward",false]]}
  },
  skills:{Health:320,Focus:430,Learning:280,Finance:210,Relationships:160,Work:520},
  rewards:[
    {name:"Watch a movie",cost:80},
    {name:"Special dinner",cost:150},
    {name:"Buy a book",cost:100}
  ],
  course:{title:"Robotics Vision Refresh",progress:40,lessons:["Visual geometry","Sensor fusion","Robust estimation"]},
  finance:{target:50000,current:31500,monthly:2500},
  workspace:{mode:"Private",family:["You"]},
  proposals:[]
};

function cloneInitial(){return JSON.parse(JSON.stringify(initialState))}
function load(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    if(!raw)return cloneInitial();
    return Object.assign(cloneInitial(),JSON.parse(raw));
  }catch{return cloneInitial()}
}
const state=load();
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const toast=$("#toast");
let toastTimer;

function showToast(message){
  toast.textContent=message;toast.hidden=false;clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toast.hidden=true,2200);
}

const titles={today:"Today",map:"Map",life:"Life",insights:"Insights",me:"Me"};
function setView(view){
  if(!titles[view])return;
  state.activeView=view;
  $$(".view").forEach(v=>v.classList.toggle("active",v.dataset.view===view));
  $$(".tab").forEach(t=>t.classList.toggle("active",t.dataset.target===view));
  $("#screenTitle").textContent=titles[view];
  save();
  window.scrollTo({top:0,behavior:"auto"});
}

function renderToday(){
  const list=$("#actionList");list.replaceChildren();
  state.actions.forEach(action=>{
    const li=document.createElement("li");li.className="action-item"+(action.done?" done":"");
    li.innerHTML='<button class="check-button" type="button" aria-label="'+(action.done?"Undo ":"Complete ")+escapeHtml(action.title)+'"><span class="check-dot">'+(action.done?"✓":"")+'</span></button><div class="action-copy"><strong>'+escapeHtml(action.title)+'</strong><small>'+escapeHtml(action.domain)+' · '+action.type+'</small></div><span class="action-xp">+'+action.xp+' XP</span>';
    li.querySelector("button").addEventListener("click",()=>toggleAction(action.id));
    list.append(li);
  });
  const done=state.actions.filter(a=>a.done).length;
  $("#todaySummary").textContent=done+"/"+state.actions.length;
  const next=state.actions.find(a=>!a.done);
  $("#nextActionTitle").textContent=next?next.title:"Daily plan complete";
  $("#nextActionMeta").textContent=next?next.domain+" · +"+next.xp+" XP":"Nice work. Review tomorrow.";
  $("#completeNextButton").disabled=!next;
  $("#completeNextButton").textContent=next?"Complete":"Done";
  $("#waterAmount").textContent=state.water*250;
  $("#waterGlasses").textContent=state.water;
  $("#waterProgress").style.width=Math.min(100,state.water/8*100)+"%";
  $("#continuityScore").textContent=(82+Math.min(5,done))+"%";
  const grid=$("#continuityGrid");grid.replaceChildren();
  [1,1,1,0,1,1,done>2?1:0].forEach(on=>{const d=document.createElement("span");d.className="continuity-day"+(on?" on":"");grid.append(d)});
  $("#recoveryCard").hidden=state.recovered;
}

function toggleAction(id){
  const a=state.actions.find(x=>x.id===id);if(!a)return;
  a.done=!a.done;
  state.xp=Math.max(0,state.xp+(a.done?a.xp:-a.xp));
  showToast(a.done?"Completed · +"+a.xp+" XP · tap again to undo":"Completion undone");
  save();renderAll();
}

function renderMap(){
  const strip=$("#phaseStrip");strip.replaceChildren();
  Object.entries(state.phases).forEach(([key,p])=>{
    const done=p.milestones.filter(m=>m[1]).length;
    const b=document.createElement("button");
    b.type="button";b.className="phase-chip"+(key===state.selectedPhase?" selected":"");
    b.innerHTML="<small>"+p.theme.toUpperCase()+"</small><strong>"+p.title+"</strong><span>"+done+"/"+p.milestones.length+" milestones</span>";
    b.addEventListener("click",()=>{state.selectedPhase=key;save();renderMap()});
    strip.append(b);
  });
  const p=state.phases[state.selectedPhase];
  $("#selectedPhaseTitle").textContent=p.title;
  $("#selectedPhaseDescription").textContent=p.description;
  const list=$("#phaseMilestoneList");list.replaceChildren();
  p.milestones.forEach((m,i)=>{
    const row=document.createElement("div");row.className="milestone-row"+(m[1]?" done":"");
    row.innerHTML='<button class="milestone-toggle" type="button" aria-label="'+(m[1]?"Undo ":"Complete ")+escapeHtml(m[0])+'"><span>'+(m[1]?"✓":"")+'</span></button><strong>'+escapeHtml(m[0])+'</strong>';
    row.querySelector("button").addEventListener("click",()=>{
      m[1]=!m[1];state.xp=Math.max(0,state.xp+(m[1]?25:-25));save();renderAll();showToast(m[1]?"Milestone advanced · +25 XP":"Milestone reverted");
    });
    list.append(row);
  });
}

const modules={
  personal:{icon:"⌂",title:"Personal",subtitle:"Life admin",description:"Personal goals, routines, errands and home systems."},
  work:{icon:"▣",title:"Work",subtitle:"Projects",description:"Professional objectives, deliverables and next actions."},
  health:{icon:"♥",title:"Health",subtitle:"Habits",description:"Hydration, movement, recovery and health-linked signals."},
  finance:{icon:"◇",title:"Finance",subtitle:"Projection",description:"Goal-linked financial assumptions and trajectory."},
  learning:{icon:"▤",title:"Learning",subtitle:"Courses",description:"Courses, modules, lessons and activities."},
  relationships:{icon:"◎",title:"Relationships",subtitle:"People",description:"Private relationship goals, meaningful follow-ups and shared plans."}
};

function renderLife(){
  const grid=$("#moduleGrid");grid.replaceChildren();
  Object.entries(modules).forEach(([key,m])=>{
    const b=document.createElement("button");b.type="button";b.className="module-card"+(state.selectedModule===key?" selected":"");
    b.innerHTML='<span class="module-icon">'+m.icon+'</span><strong>'+m.title+'</strong><small>'+m.subtitle+'</small>';
    b.addEventListener("click",()=>{state.selectedModule=key;save();renderLife()});
    grid.append(b);
  });
  const m=modules[state.selectedModule];
  $("#moduleEyebrow").textContent=m.title.toUpperCase();
  $("#moduleTitle").textContent=m.title;
  $("#moduleDescription").textContent=m.description;
  const content=$("#moduleContent");content.replaceChildren();

  if(state.selectedModule==="health"){
    content.innerHTML='<div class="module-metric-grid"><div class="metric-tile"><strong>'+state.water*250+' ml</strong><span>Water today</span></div><div class="metric-tile"><strong>82%</strong><span>Continuity</span></div><div class="metric-tile"><strong>18:30</strong><span>Next workout</span></div><div class="metric-tile"><strong>'+state.skills.Health+' XP</strong><span>Health skill</span></div></div>';
  }else if(state.selectedModule==="finance"){
    const pct=Math.round(state.finance.current/state.finance.target*100);
    content.innerHTML='<div class="module-metric-grid"><div class="metric-tile"><strong>'+pct+'%</strong><span>Goal funded</span></div><div class="metric-tile"><strong>'+formatMoney(state.finance.current)+'</strong><span>Current</span></div><div class="metric-tile"><strong>'+formatMoney(state.finance.monthly)+'</strong><span>Monthly assumption</span></div><div class="metric-tile"><strong>'+Math.ceil((state.finance.target-state.finance.current)/Math.max(1,state.finance.monthly))+' mo</strong><span>Projected remaining</span></div></div><button id="adjustFinance" class="secondary-wide" type="button">Adjust monthly assumption</button>';
    $("#adjustFinance").addEventListener("click",openFinanceDialog);
  }else if(state.selectedModule==="learning"){
    content.innerHTML='<div class="module-metric-grid"><div class="metric-tile"><strong>'+state.course.progress+'%</strong><span>'+escapeHtml(state.course.title)+'</span></div><div class="metric-tile"><strong>'+state.course.lessons.length+'</strong><span>Lessons</span></div></div><div class="milestone-list">'+state.course.lessons.map((l,i)=>'<div class="milestone-row"><span>'+String(i+1).padStart(2,"0")+'</span><strong>'+escapeHtml(l)+'</strong></div>').join("")+'</div><button id="importCourse" class="secondary-wide" type="button">Import course links</button>';
    $("#importCourse").addEventListener("click",openCourseDialog);
  }else{
    const metrics={personal:[3,72],work:[4,84],relationships:[2,68]}[state.selectedModule]||[2,70];
    content.innerHTML='<div class="module-metric-grid"><div class="metric-tile"><strong>'+metrics[0]+'</strong><span>Active goals</span></div><div class="metric-tile"><strong>'+metrics[1]+'%</strong><span>This week</span></div></div><button class="secondary-wide" type="button" id="moduleAction">Add '+m.title+' action</button>';
    $("#moduleAction").addEventListener("click",()=>{$("#quickAddDomain").value=m.title;$("#quickAddDialog").showModal()});
  }
}

function renderInsights(){
  const completed=state.actions.filter(a=>a.done).length;
  const pct=Math.min(100,65+completed*7);
  $("#weeklyCompletion").textContent=pct;$("#ringLabel").textContent=pct+"%";$("#completionRing").style.setProperty("--ring",pct+"%");
  const data=[["Health",72],["Work",84],["Learning",61],["Finance",63],["Personal",70]];
  const root=$("#domainBars");root.replaceChildren();
  data.forEach(([name,val])=>{const r=document.createElement("div");r.className="domain-bar-row";r.innerHTML="<strong>"+name+"</strong><div class='bar-track'><span style='width:"+val+"%'></span></div><span>"+val+"%</span>";root.append(r)});
}

function renderMe(){
  const level=Math.max(1,Math.floor(state.xp/100));
  $("#levelValue").textContent=level;$("#xpValue").textContent=state.xp;$("#xpProgress").style.width=Math.min(100,(state.xp%800)/8)+"%";$("#coinValue").textContent=state.coins;
  const skills=$("#skillGrid");skills.replaceChildren();
  Object.entries(state.skills).forEach(([name,xp])=>{const c=document.createElement("div");c.className="skill-card";c.innerHTML="<strong>"+name+"</strong><span>"+xp+" XP</span><div class='mini-progress'><span style='width:"+Math.min(100,xp/6)+"%'></span></div>";skills.append(c)});
  const rewards=$("#rewardList");rewards.replaceChildren();
  state.rewards.forEach(r=>{const row=document.createElement("div");row.className="reward-row";row.innerHTML="<div><strong>"+escapeHtml(r.name)+"</strong><div class='subtle'>"+r.cost+" coins</div></div><button type='button' "+(state.coins<r.cost?"disabled":"")+">Redeem</button>";row.querySelector("button").addEventListener("click",()=>{if(state.coins<r.cost)return;state.coins-=r.cost;save();renderMe();showToast("Reward redeemed")});rewards.append(row)});
  $("#lowGameStatus").textContent=state.lowGame?"On":"Off";document.body.classList.toggle("low-game",state.lowGame);
}

function renderAll(){
  renderToday();renderMap();renderLife();renderInsights();renderMe();setView(state.activeView||"today");renderDebug();
}

function renderDebug(){
  requestAnimationFrame(()=>{
    window.__LEGACY_MVP_DEBUG__={
      version:"0.2",
      activeView:state.activeView,
      selectedPhase:state.selectedPhase,
      selectedModule:state.selectedModule,
      counts:{actions:state.actions.length,completed:state.actions.filter(a=>a.done).length,phases:Object.keys(state.phases).length,modules:Object.keys(modules).length},
      checks:{
        fiveTopLevelTabs:$$(".tab").length===5,
        touchTargets:$$("button").filter(b=>b.offsetParent!==null).every(b=>{const r=b.getBoundingClientRect();return r.width>=40&&r.height>=40}),
        persistence:typeof localStorage!=="undefined",
        mapRoute:!!document.querySelector('a[href="./goals-map"]'),
        lowGameMode:true,
        aiProposalRequiresHumanReview:true,
        privateFirstWorkspace:state.workspace.mode==="Private"
      }
    };
  });
}

function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function formatMoney(v){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(v)}

function openInfo(title,body){
  $("#dialogBody").innerHTML='<p class="eyebrow">MVP FLOW</p><h2>'+escapeHtml(title)+'</h2>'+body;
  $("#appDialog").showModal();
}
function openFinanceDialog(){
  openInfo("Finance assumptions",'<p class="subtle">Imported values and user assumptions stay visibly separated.</p><form id="financeForm" class="form-stack"><label>Monthly contribution<input id="monthlyInput" type="number" min="0" value="'+state.finance.monthly+'"></label><button class="cta-button full" type="submit">Update projection</button></form>');
  $("#financeForm").addEventListener("submit",e=>{e.preventDefault();state.finance.monthly=Math.max(0,Number($("#monthlyInput").value)||0);save();$("#appDialog").close();renderLife();showToast("Projection updated")});
}
function openCourseDialog(){
  openInfo("AI-assisted course import",'<p class="subtle">Paste source links. In the MVP this simulates extraction and requires review before saving.</p><form id="courseForm" class="form-stack"><label>Course link<input id="courseLink" type="url" placeholder="https://…" required></label><button class="cta-button full" type="submit">Generate draft structure</button></form>');
  $("#courseForm").addEventListener("submit",e=>{e.preventDefault();$("#dialogBody").innerHTML='<p class="eyebrow">REVIEW REQUIRED</p><h2>Draft course structure</h2><p class="subtle">Nothing becomes authoritative until you approve it.</p><div class="milestone-list"><div class="milestone-row"><strong>Module 1 · Foundations</strong></div><div class="milestone-row"><strong>Module 2 · Practice</strong></div><div class="milestone-row"><strong>Module 3 · Project</strong></div></div><button id="acceptCourse" class="cta-button full" type="button">Accept draft</button>';$("#acceptCourse").addEventListener("click",()=>{$("#appDialog").close();showToast("Course draft accepted")})});
}

$$(".tab").forEach(t=>t.addEventListener("click",()=>setView(t.dataset.target)));
$("#waterPlus").addEventListener("click",()=>{state.water=Math.min(12,state.water+1);state.xp+=2;save();renderAll();showToast("+250 ml · +2 XP")});
$("#waterMinus").addEventListener("click",()=>{state.water=Math.max(0,state.water-1);save();renderAll()});
$("#completeNextButton").addEventListener("click",()=>{const n=state.actions.find(a=>!a.done);if(n)toggleAction(n.id)});
$("#recoverButton").addEventListener("click",()=>{
  openInfo("Recovery plan",'<p class="subtle">Keep historical progress and choose how to handle missed actions.</p><div class="milestone-list"><button class="signal-card" type="button" id="resumeRecovery"><strong>Resume</strong><span>Carry important actions forward.</span></button><button class="signal-card" type="button" id="rescheduleRecovery"><strong>Reschedule</strong><span>Move actions to another day.</span></button><button class="signal-card" type="button" id="skipRecovery"><strong>Skip intentionally</strong><span>Preserve history without overdue debt.</span></button></div>');
  ["resumeRecovery","rescheduleRecovery","skipRecovery"].forEach(id=>$("#"+id)?.addEventListener("click",()=>{state.recovered=true;save();$("#appDialog").close();renderToday();showToast(id==="resumeRecovery"?"Recovery resumed":id==="rescheduleRecovery"?"Actions rescheduled":"Day skipped intentionally")}));
});
$("#addTaskInline").addEventListener("click",()=>$("#quickAddDialog").showModal());
$("#quickAddButton").addEventListener("click",()=>$("#quickAddDialog").showModal());
$("#quickAddForm").addEventListener("submit",e=>{
  e.preventDefault();const title=$("#quickAddTitle").value.trim();if(!title)return;
  state.actions.unshift({id:"a"+Date.now(),title,type:$("#quickAddType").value,domain:$("#quickAddDomain").value,xp:10,done:false});
  $("#quickAddTitle").value="";save();$("#quickAddDialog").close();renderAll();showToast("Added to Today");
});
$("[data-open-module='health']").addEventListener("click",()=>{state.selectedModule="health";setView("life");renderLife()});
$("#lowGameToggle").addEventListener("click",()=>{state.lowGame=!state.lowGame;save();renderMe();showToast(state.lowGame?"Low-game mode enabled":"Game theme restored")});
$("#workspaceButton").addEventListener("click",()=>openInfo("Workspace & family",'<p class="subtle">Default workspace is private. Sharing is explicit and scoped.</p><div class="milestone-list"><div class="milestone-row done"><strong>Personal workspace · Private</strong></div><div class="milestone-row"><strong>Family workspace · Not configured</strong></div></div><button class="secondary-wide" type="button">Invite family member</button>'));
$("#featureRequestButton").addEventListener("click",()=>openInfo("AI feature proposal",'<p class="subtle">Describe the feature. The AI creates a proposal; nothing enters the baseline without explicit admin approval.</p><form id="proposalForm" class="form-stack"><label>Request<input id="proposalText" required placeholder="I want…"></label><button class="cta-button full" type="submit">Generate proposal</button></form>'));

document.addEventListener("submit",e=>{
  if(e.target?.id!=="proposalForm")return;
  e.preventDefault();const text=$("#proposalText").value.trim();
  state.proposals.push({text,status:"Draft"});save();
  $("#dialogBody").innerHTML='<p class="eyebrow">AI DRAFT · HUMAN APPROVAL REQUIRED</p><h2>Candidate feature</h2><p>'+escapeHtml(text)+'</p><div class="milestone-list"><div class="milestone-row"><strong>Scope</strong>&nbsp; Mockup-only candidate</div><div class="milestone-row"><strong>Risk</strong>&nbsp; Must not modify baseline automatically</div><div class="milestone-row"><strong>Acceptance</strong>&nbsp; User confirms value before promotion</div></div><button id="keepProposal" class="cta-button full" type="button">Keep as draft</button>';
  $("#keepProposal").addEventListener("click",()=>{$("#appDialog").close();showToast("Draft saved for review")});
});

$("#searchButton").addEventListener("click",()=>{$("#searchDialog").showModal();$("#searchInput").focus();renderSearch("")});
$("#searchInput").addEventListener("input",e=>renderSearch(e.target.value));
function renderSearch(q){
  const hay=[
    ...state.actions.map(a=>({title:a.title,meta:a.domain+" · "+a.type,view:"today"})),
    ...Object.entries(state.phases).map(([k,p])=>({title:p.title,meta:"Goal phase · "+p.theme,view:"map",phase:k})),
    ...Object.entries(modules).map(([k,m])=>({title:m.title,meta:"Life module",view:"life",module:k})),
    ...state.course.lessons.map(l=>({title:l,meta:"Learning lesson",view:"life",module:"learning"}))
  ];
  const query=q.trim().toLowerCase();
  const results=hay.filter(x=>!query||x.title.toLowerCase().includes(query)||x.meta.toLowerCase().includes(query)).slice(0,8);
  const root=$("#searchResults");root.replaceChildren();
  results.forEach(r=>{
    const b=document.createElement("button");b.className="search-result";b.type="button";
    b.innerHTML="<strong>"+escapeHtml(r.title)+"</strong><small>"+escapeHtml(r.meta)+"</small>";
    b.addEventListener("click",()=>{if(r.phase)state.selectedPhase=r.phase;if(r.module)state.selectedModule=r.module;$("#searchDialog").close();state.activeView=r.view;renderAll()});
    root.append(b);
  });
}

$$(".signal-card").forEach(b=>b.addEventListener("click",()=>openInfo("Insight",'<p class="subtle">This signal is a prompt for review, not an automatic judgment. In later iterations it can deep-link into the underlying evidence.</p>')));

window.addEventListener("pagehide",save);
renderAll();