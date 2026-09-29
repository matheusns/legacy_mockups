const phaseCard = document.querySelector("#phaseCard");
const phaseTitle = document.querySelector("#phaseTitle");
const phaseSubtitle = document.querySelector("#phaseSubtitle");
const phaseCompleted = document.querySelector("#phaseCompleted");
const phaseTotal = document.querySelector("#phaseTotal");
const phaseProgress = document.querySelector("#phaseProgress");
const openPhaseButton = document.querySelector("#openPhaseButton");
const resetMapButton = document.querySelector("#resetMapButton");
const phaseDialog = document.querySelector("#phaseDialog");
const dialogTitle = document.querySelector("#dialogTitle");
const dialogDescription = document.querySelector("#dialogDescription");
const dialogMilestones = document.querySelector("#dialogMilestones");
const dialogDoneButton = document.querySelector("#dialogDoneButton");

const phases = window.LegacySharedGoals.phases;
let state = window.LegacySharedGoals.load();

function save() {
  state = window.LegacySharedGoals.save(state);
}

function selectPhase(phase) {
  if (!phases[phase]) return;
  state.selectedPhase = phase;
  save();
  render();
}

function toggleMilestone(phase, index) {
  const config = phases[phase];
  if (!config || !Number.isInteger(index) || !config.milestones[index]) return;
  state.selectedPhase = phase;
  const id = config.milestones[index].id;
  state.completed[id] = !state.completed[id];
  save();
  render();
}

function getProgress(phase) {
  return window.LegacySharedGoals.progress(state, phase);
}

function renderMap() {
  document.querySelectorAll(".island").forEach((island) => {
    const phase = island.dataset.phase;
    island.classList.toggle("selected", phase === state.selectedPhase);
    const config = phases[phase];
    if (!config) return;

    const select = island.querySelector("[data-select-phase]");
    if (select) {
      select.setAttribute("aria-pressed", String(phase === state.selectedPhase));
      select.setAttribute("aria-label", `Select ${config.title} phase`);
    }

    const firstOpen = config.milestones.findIndex(m => !state.completed[m.id]);
    island.querySelectorAll(".milestone").forEach((button) => {
      const index = Number(button.dataset.index);
      const milestone = config.milestones[index];
      if (!milestone) return;
      const done = Boolean(state.completed[milestone.id]);
      button.classList.toggle("done", done);
      button.classList.toggle("next", !done && index === firstOpen);
      button.setAttribute("aria-pressed", String(done));
      button.setAttribute("aria-label", `${done ? "Undo" : "Complete"} ${milestone.label}`);
    });
  });
}

function renderCard() {
  const phase = state.selectedPhase;
  const config = phases[phase];
  const progress = getProgress(phase);
  phaseTitle.textContent = config.title;
  phaseSubtitle.textContent = config.subtitle;
  phaseCompleted.textContent = progress.done;
  phaseTotal.textContent = progress.total;
  phaseProgress.style.width = `${progress.percent}%`;
  phaseCard.dataset.phase = phase;
}

function renderDialog() {
  const phase = state.selectedPhase;
  const config = phases[phase];
  dialogTitle.textContent = config.title;
  dialogDescription.textContent = config.description;
  dialogMilestones.replaceChildren();

  config.milestones.forEach((milestone, index) => {
    const button = document.createElement("button");
    const done = Boolean(state.completed[milestone.id]);
    button.type = "button";
    button.className = "dialog-milestone";
    button.classList.toggle("done", done);
    button.dataset.phase = phase;
    button.dataset.index = index;
    button.innerHTML = `<span aria-hidden="true">${done ? "✓" : ""}</span><strong>${milestone.label}</strong>`;
    button.setAttribute("aria-pressed", String(done));
    button.addEventListener("click", () => {
      toggleMilestone(phase, index);
      renderDialog();
    });
    dialogMilestones.append(button);
  });
}

function renderDebugBridge() {
  const boxes = [...document.querySelectorAll(".milestone")].map(node => node.getBoundingClientRect());
  window.__LEGACY_MOCKUP_DEBUG__ = {
    page: "goals-map-v3-shared",
    sharedKey: window.LegacySharedGoals.KEY,
    selectedPhase: state.selectedPhase,
    phaseCount: Object.keys(phases).length,
    milestones: Object.fromEntries(Object.keys(phases).map(phase => [phase, getProgress(phase)])),
    checks: {
      allPhasesRendered: document.querySelectorAll(".island").length === Object.keys(phases).length,
      allSelectorsNamed: [...document.querySelectorAll("[data-select-phase]")].every(node => node.getAttribute("aria-label")),
      milestoneTouchTargetsAtLeast44: boxes.every(box => box.width >= 44 && box.height >= 44),
      dialogNamed: phaseDialog.getAttribute("aria-labelledby") === "dialogTitle",
      persistenceAvailable: typeof localStorage !== "undefined"
    }
  };
}

function render() {
  renderMap();
  renderCard();
  requestAnimationFrame(renderDebugBridge);
}

document.querySelectorAll("[data-select-phase]").forEach(button => {
  button.addEventListener("click", () => selectPhase(button.dataset.selectPhase));
});

document.querySelectorAll(".milestone").forEach(button => {
  button.addEventListener("click", event => {
    event.stopPropagation();
    toggleMilestone(button.dataset.phase, Number(button.dataset.index));
  });
});

openPhaseButton.addEventListener("click", () => {
  renderDialog();
  phaseDialog.showModal();
});
dialogDoneButton.addEventListener("click", () => phaseDialog.close());

resetMapButton.addEventListener("click", () => {
  if (!window.confirm("Reset shared Goals Map prototype progress? This also resets the Map view in the main MVP.")) return;
  state = window.LegacySharedGoals.defaults();
  save();
  render();
});

window.addEventListener("storage", event => {
  if (event.key !== window.LegacySharedGoals.KEY) return;
  state = window.LegacySharedGoals.load();
  render();
});

window.addEventListener("pageshow", () => {
  state = window.LegacySharedGoals.load();
  render();
});

render();