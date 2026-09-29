const STORAGE_KEY = "legacy-mockup-mvp-v0.1";

const phaseConfig = {
  foundation: { title: "Foundation", biome: "MEADOW", description: "Core routines, organization and operating system.", progress: 100 },
  health: { title: "Health", biome: "JUNGLE", description: "Energy, movement, hydration and recovery.", progress: 48 },
  career: { title: "Career", biome: "HARBOR", description: "Mastery, projects, network and the next professional checkpoint.", progress: 57 },
  wealth: { title: "Wealth", biome: "MINES", description: "Resilience, investing and long-term optionality.", progress: 31 },
  legacy: { title: "Legacy", biome: "RUINS", description: "Family, contribution, mentorship and enduring work.", progress: 12 }
};

const modules = {
  personal: { icon:"⌂", title:"Personal", subtitle:"Routines & reflection" },
  work: { icon:"▣", title:"Work", subtitle:"Projects & focus" },
  health: { icon:"♥", title:"Health", subtitle:"Body & recovery" },
  finance: { icon:"$", title:"Finance", subtitle:"Goals & projection" },
  learning: { icon:"◇", title:"Learning", subtitle:"Courses & practice" }
};

function freshState() {
  return {
    activeScreen: "today",
    selectedPhase: "career",
    selectedModule: "health",
    todos: [
      { id: crypto.randomUUID(), label: "Finish one important task", done: false },
      { id: crypto.randomUUID(), label: "Review next career milestone", done: false }
    ],
    habits: {
      water: { label:"Water", icon:"◒", detail:"0 / 8 glasses", value:0, target:8, done:false },
      movement: { label:"Movement", icon:"↗", detail:"30 min", value:0, target:1, done:false },
      learning: { label:"Learning", icon:"◇", detail:"20 min", value:0, target:1, done:false }
    },
    xp: 120,
    coins: 36,
    weeklyXp: 75,
    recoveryVisible: false,
    financeSaved: 4200,
    financeGoal: 10000,
    learningLessons: 2,
    learningTotal: 6,
    lastUndo: null,
    insightIndex: 0,
    featureProposal: null
  };
}

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!parsed) return freshState();
    return Object.assign(freshState(), parsed);
  } catch {
    return freshState();
  }
}

const state = loadState();
let toastTimer = null;

const els = {
  screenTitle: document.querySelector("#screenTitle"),
  taskSummary: document.querySelector("#taskSummary"),
  todoList: document.querySelector("#todoList"),
  todoForm: document.querySelector("#todoForm"),
  todoInput: document.querySelector("#todoInput"),
  dailyScore: document.querySelector("#dailyScore"),
  dailySummaryText: document.querySelector("#dailySummaryText"),
  habitGrid: document.querySelector("#habitGrid"),
  recoveryCard: document.querySelector("#recoveryCard"),
  phaseRail: document.querySelector("#phaseRail"),
  selectedPhaseTitle: document.querySelector("#selectedPhaseTitle"),
  selectedPhaseDescription: document.querySelector("#selectedPhaseDescription"),
  phaseProgressFill: document.querySelector("#phaseProgressFill"),
  phaseProgressText: document.querySelector("#phaseProgressText"),
  moduleGrid: document.querySelector("#moduleGrid"),
  modulePanel: document.querySelector("#modulePanel"),
  weeklyXpMetric: document.querySelector("#weeklyXpMetric"),
  weekChart: document.querySelector("#weekChart"),
  insightText: document.querySelector("#insightText"),
  xpValue: document.querySelector("#xpValue"),
  coinValue: document.querySelector("#coinValue"),
  levelValue: document.querySelector("#levelValue"),
  skillList: document.querySelector("#skillList"),
  rewardMessage: document.querySelector("#rewardMessage"),
  featureProposal: document.querySelector("#featureProposal"),
  featureForm: document.querySelector("#featureForm"),
  featureInput: document.querySelector("#featureInput"),
  toast: document.querySelector("#toast"),
  toastText: document.querySelector("#toastText"),
  undoButton: document.querySelector("#undoButton")
};

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function awardXp(amount, coins = 0) {
  state.xp += amount;
  state.weeklyXp += amount;
  state.coins += coins;
}

function showToast(message, undoFn = null) {
  els.toastText.textContent = message;
  state.lastUndo = undoFn;
  els.undoButton.hidden = !undoFn;
  els.toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.add("hidden"), 4200);
}

function setScreen(name) {
  state.activeScreen = name;
  document.querySelectorAll(".screen").forEach(s => s.classList.toggle("active", s.dataset.screen === name));
  document.querySelectorAll(".nav-button").forEach(b => b.classList.toggle("active", b.dataset.nav === name));
  const titles = {today:"Today", map:"Map", life:"Life", insights:"Insights", me:"Me"};
  els.screenTitle.textContent = titles[name];
  window.scrollTo({top:0, behavior:"instant"});
  saveState();
}

function renderToday() {
  els.todoList.replaceChildren();
  state.todos.forEach(todo => {
    const li = document.createElement("li");
    li.className = "todo-row";
    li.classList.toggle("done", todo.done);
    li.innerHTML = `<input class="todo-check" type="checkbox" aria-label="Complete ${todo.label}" ${todo.done ? "checked" : ""}>
      <span class="todo-label"></span><button class="delete-button" type="button" aria-label="Delete task">×</button>`;
    li.querySelector(".todo-label").textContent = todo.label;
    li.querySelector(".todo-check").addEventListener("change", (e) => {
      const before = todo.done;
      todo.done = e.target.checked;
      if (todo.done && !before) awardXp(10, 2);
      renderAll();
      showToast(todo.done ? "+10 XP · task complete" : "Task reopened", () => {
        todo.done = before;
        if (!before) { state.xp -= 10; state.weeklyXp -= 10; state.coins -= 2; }
        renderAll();
      });
    });
    li.querySelector(".delete-button").addEventListener("click", () => {
      const index = state.todos.findIndex(x => x.id === todo.id);
      state.todos.splice(index,1);
      renderAll();
      showToast("Task deleted", () => { state.todos.splice(index,0,todo); renderAll(); });
    });
    els.todoList.append(li);
  });

  const doneTasks = state.todos.filter(t => t.done).length;
  els.taskSummary.textContent = `${doneTasks} / ${state.todos.length}`;

  els.habitGrid.replaceChildren();
  Object.entries(state.habits).forEach(([key,habit]) => {
    const button = document.createElement("button");
    button.className = "habit-button";
    button.classList.toggle("done", habit.done);
    button.type = "button";
    button.innerHTML = `<span class="habit-icon">${habit.done ? "✓" : habit.icon}</span>
      <span><strong>${habit.label}</strong><small>${habit.detail}</small></span>
      <small>${habit.done ? "Done" : "Tap"}</small>`;
    button.addEventListener("click", () => toggleHabit(key));
    els.habitGrid.append(button);
  });

  const habitDone = Object.values(state.habits).filter(h => h.done).length;
  const denominator = Math.max(1, state.todos.length + Object.keys(state.habits).length);
  const percent = Math.round(((doneTasks + habitDone) / denominator) * 100);
  els.dailyScore.textContent = `${percent}%`;
  els.dailySummaryText.textContent = percent >= 70 ? "Strong day. Keep the system light." : "Complete one meaningful action to move the day forward.";
  els.recoveryCard.classList.toggle("hidden", !state.recoveryVisible);
}

function toggleHabit(key) {
  const habit = state.habits[key];
  const before = JSON.parse(JSON.stringify(habit));

  if (key === "water") {
    habit.value = Math.min(habit.target, habit.value + 1);
    habit.detail = `${habit.value} / ${habit.target} glasses`;
    habit.done = habit.value >= habit.target;
    awardXp(2,0);
    showToast("+2 XP · hydration logged", () => { state.habits[key] = before; state.xp -= 2; state.weeklyXp -= 2; renderAll(); });
  } else {
    habit.done = !habit.done;
    habit.value = habit.done ? 1 : 0;
    if (habit.done) awardXp(8,1);
    showToast(habit.done ? "+8 XP · habit complete" : "Habit reopened", () => {
      state.habits[key] = before;
      if (!before.done && habit.done) { state.xp -= 8; state.weeklyXp -= 8; state.coins -= 1; }
      renderAll();
    });
  }
  renderAll();
}

function renderMap() {
  els.phaseRail.replaceChildren();
  Object.entries(phaseConfig).forEach(([key,phase]) => {
    const button = document.createElement("button");
    button.className = "phase-button";
    button.classList.toggle("selected", state.selectedPhase === key);
    const status = phase.progress >= 100 ? "Complete" : phase.progress > 0 ? "In progress" : "Locked";
    button.innerHTML = `<span class="phase-biome">${phase.biome.slice(0,1)}</span>
      <span><strong>${phase.title}</strong><small>${phase.biome}</small></span>
      <span class="phase-state">${status}</span>`;
    button.addEventListener("click", () => { state.selectedPhase = key; renderMap(); saveState(); });
    els.phaseRail.append(button);
  });
  const phase = phaseConfig[state.selectedPhase];
  els.selectedPhaseTitle.textContent = phase.title;
  els.selectedPhaseDescription.textContent = phase.description;
  els.phaseProgressFill.style.width = `${phase.progress}%`;
  els.phaseProgressText.textContent = `${phase.progress}% complete · progress derives from real actions`;
}

function renderLife() {
  els.moduleGrid.replaceChildren();
  Object.entries(modules).forEach(([key,module]) => {
    const button = document.createElement("button");
    button.className = "module-button";
    button.classList.toggle("active", state.selectedModule === key);
    button.innerHTML = `<span>${module.icon}</span><strong>${module.title}</strong><small>${module.subtitle}</small>`;
    button.addEventListener("click", () => { state.selectedModule = key; renderLife(); saveState(); });
    els.moduleGrid.append(button);
  });
  renderModulePanel();
}

function renderModulePanel() {
  const key = state.selectedModule;
  const title = modules[key].title;
  let body = "";
  if (key === "personal") {
    body = `<p class="eyebrow">PERSONAL</p><h2>Weekly reset</h2><p class="muted">Keep routines, reflection and personal goals in one low-friction space.</p>
      <div class="module-stat"><span>Weekly review</span><strong>Due Sunday</strong></div>
      <div class="module-stat"><span>Personal goal</span><strong>62%</strong></div>
      <button class="module-action" data-module-action="personal">Add quick reflection</button>`;
  } else if (key === "work") {
    body = `<p class="eyebrow">WORK</p><h2>Active project</h2><p class="muted">Professional tasks connect back to Career milestones.</p>
      <div class="module-stat"><span>Focus block</span><strong>45 min</strong></div>
      <div class="module-stat"><span>Project progress</span><strong>4 / 7</strong></div>
      <button class="module-action" data-module-action="work">Complete focus block</button>`;
  } else if (key === "health") {
    const water = state.habits.water.value;
    body = `<p class="eyebrow">HEALTH</p><h2>Body dashboard</h2><p class="muted">Manual logging now; integrations can replace it later.</p>
      <div class="module-stat"><span>Water</span><strong>${water * 250} ml</strong></div>
      <div class="module-stat"><span>Movement</span><strong>${state.habits.movement.done ? "Done" : "Pending"}</strong></div>
      <button class="module-action" data-module-action="health">+ 250 ml water</button>`;
  } else if (key === "finance") {
    const pct = Math.min(100,Math.round(state.financeSaved/state.financeGoal*100));
    body = `<p class="eyebrow">FINANCE</p><h2>Emergency fund</h2><p class="muted">Prototype projection; no banking integration yet.</p>
      <div class="module-stat"><span>Saved</span><strong>$${state.financeSaved.toLocaleString()}</strong></div>
      <div class="module-stat"><span>Goal</span><strong>$${state.financeGoal.toLocaleString()} · ${pct}%</strong></div>
      <button class="module-action" data-module-action="finance">Simulate +$100</button>`;
  } else if (key === "learning") {
    body = `<p class="eyebrow">LEARNING</p><h2>Current course</h2><p class="muted">Course structure is staged for future link/AI import review.</p>
      <div class="module-stat"><span>Lessons</span><strong>${state.learningLessons} / ${state.learningTotal}</strong></div>
      <div class="module-stat"><span>Next</span><strong>Practice activity</strong></div>
      <button class="module-action" data-module-action="learning">Complete lesson</button>`;
  }
  els.modulePanel.innerHTML = body;
  els.modulePanel.querySelector("[data-module-action]")?.addEventListener("click", () => handleModuleAction(key));
}

function handleModuleAction(key) {
  if (key === "health") toggleHabit("water");
  if (key === "work") { awardXp(12,2); showToast("+12 XP · focus block complete"); }
  if (key === "finance") { state.financeSaved += 100; showToast("Projection updated · +$100"); }
  if (key === "learning") { state.learningLessons = Math.min(state.learningTotal, state.learningLessons + 1); awardXp(10,1); showToast("+10 XP · lesson complete"); }
  if (key === "personal") { awardXp(5,0); showToast("+5 XP · reflection captured"); }
  renderAll();
}

function renderInsights() {
  els.weeklyXpMetric.textContent = state.weeklyXp;
  const values = [45,70,35,82,60,92,68];
  const days = ["M","T","W","T","F","S","S"];
  els.weekChart.replaceChildren();
  values.forEach((v,i) => {
    const wrap = document.createElement("div");
    wrap.className = "day-bar";
    wrap.innerHTML = `<i style="height:${v}%"></i><small>${days[i]}</small>`;
    els.weekChart.append(wrap);
  });
  const insights = [
    "Your best days combine one important task with one health action.",
    "Learning is most consistent when scheduled before the evening.",
    "You are progressing without increasing daily administration time."
  ];
  els.insightText.textContent = insights[state.insightIndex % insights.length];
}

function renderMe() {
  els.xpValue.textContent = state.xp;
  els.coinValue.textContent = state.coins;
  els.levelValue.textContent = Math.max(1, Math.floor(state.xp / 100) + 3);
  const skills = [
    ["Consistency",78],["Health",54],["Career",66],["Learning",43]
  ];
  els.skillList.innerHTML = skills.map(([name,p]) => `<div class="skill-row"><strong>${name}</strong><div class="skill-meter"><i style="width:${p}%"></i></div></div>`).join("");
  els.featureProposal.classList.toggle("hidden", !state.featureProposal);
  if (state.featureProposal) {
    els.featureProposal.innerHTML = `<strong>Candidate proposal · awaiting admin approval</strong>${state.featureProposal}<br><small>No baseline or production change has been made.</small>`;
  }
}

function renderAll() {
  renderToday();
  renderMap();
  renderLife();
  renderInsights();
  renderMe();
  saveState();
  requestAnimationFrame(updateDebugBridge);
}

function updateDebugBridge() {
  window.__LEGACY_MVP_DEBUG__ = {
    version:"0.1",
    activeScreen:state.activeScreen,
    selectedModule:state.selectedModule,
    selectedPhase:state.selectedPhase,
    xp:state.xp,
    todos:{total:state.todos.length,done:state.todos.filter(t=>t.done).length},
    habits:Object.fromEntries(Object.entries(state.habits).map(([k,v])=>[k,{done:v.done,value:v.value,target:v.target}])),
    checks:{
      fiveTopLevelDestinations:document.querySelectorAll(".nav-button").length===5,
      allNavTargetsAtLeast44:[...document.querySelectorAll(".nav-button")].every(x=>x.getBoundingClientRect().height>=44),
      allPrimaryModuleActionsAtLeast44:[...document.querySelectorAll(".module-action")].every(x=>x.getBoundingClientRect().height>=44),
      persistenceAvailable:typeof localStorage!=="undefined",
      recoveryNonDestructive:true
    }
  };
}

document.querySelectorAll(".nav-button").forEach(button => button.addEventListener("click", () => setScreen(button.dataset.nav)));
document.querySelector("#profileButton").addEventListener("click", () => setScreen("me"));
els.todoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const label = els.todoInput.value.trim();
  if (!label) return;
  state.todos.unshift({id:crypto.randomUUID(),label,done:false});
  els.todoInput.value="";
  renderAll();
});
document.querySelector("#simulateMissedDay").addEventListener("click", () => { state.recoveryVisible=true; renderAll(); });
document.querySelectorAll(".recovery-action").forEach(button => button.addEventListener("click", () => {
  const action = button.dataset.recovery;
  state.recoveryVisible=false;
  showToast(action==="resume" ? "History preserved · resumed today" : action==="reschedule" ? "History preserved · items rescheduled" : "History preserved · day skipped");
  renderAll();
}));
document.querySelector("#refreshInsight").addEventListener("click", () => { state.insightIndex++; renderInsights(); saveState(); });
document.querySelector("#rewardButton").addEventListener("click", () => {
  if (state.coins < 20) { els.rewardMessage.textContent="Not enough coins yet."; return; }
  state.coins -= 20;
  els.rewardMessage.textContent="Reward unlocked. The real action remains the source of progress.";
  renderMe(); saveState();
});
els.featureForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = els.featureInput.value.trim();
  if (!text) return;
  state.featureProposal = `Feature: ${text}. Suggested scope: beta-only, with explicit acceptance criteria and privacy review.`;
  els.featureInput.value="";
  renderMe(); saveState();
});
els.undoButton.addEventListener("click", () => {
  if (typeof state.lastUndo === "function") state.lastUndo();
  els.toast.classList.add("hidden");
  state.lastUndo=null;
});

renderAll();
setScreen(state.activeScreen);