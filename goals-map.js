const STORAGE_KEY = "legacy-mockup-goals-map-v1";

const phaseConfig = {
  foundation: {
    title: "Foundation",
    subtitle: "Build the systems that make every other phase sustainable.",
    description: "Your base layer: routines, organization, learning cadence, and personal operating system.",
    milestones: ["Define life system", "Build core routines", "Create review cadence"]
  },
  health: {
    title: "Health",
    subtitle: "Strengthen energy, fitness, recovery, and daily consistency.",
    description: "A health phase focused on sustainable habits rather than isolated targets.",
    milestones: ["Daily movement baseline", "Hydration consistency", "Recovery routine"]
  },
  career: {
    title: "Career",
    subtitle: "Build mastery and meaningful professional impact.",
    description: "Turn professional goals into a visible sequence of milestones, projects, and capability upgrades.",
    milestones: ["Clarify next role", "Ship portfolio proof", "Expand strategic network", "Reach next career checkpoint"]
  },
  wealth: {
    title: "Wealth",
    subtitle: "Grow resilience, optionality, and long-term financial capacity.",
    description: "Connect savings, investing, major purchases, and financial independence to concrete milestones.",
    milestones: ["Emergency buffer", "Automate investing", "Reach next capital target"]
  },
  legacy: {
    title: "Legacy",
    subtitle: "Convert achievement into contribution and long-term meaning.",
    description: "The long-horizon phase: family, mentorship, knowledge, contribution, and things that outlive individual projects.",
    milestones: ["Define contribution", "Build something enduring", "Pass knowledge forward"]
  }
};

function defaultState() {
  return {
    selectedPhase: "career",
    completed: {
      foundation: [true, true, true],
      health: [true, false, false],
      career: [true, true, false, false],
      wealth: [false, false, false],
      legacy: [false, false, false]
    }
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(raw);
    if (!parsed || !phaseConfig[parsed.selectedPhase] || typeof parsed.completed !== "object") {
      return defaultState();
    }

    const clean = defaultState();
    clean.selectedPhase = parsed.selectedPhase;

    for (const [phase, config] of Object.entries(phaseConfig)) {
      const incoming = Array.isArray(parsed.completed[phase]) ? parsed.completed[phase] : [];
      clean.completed[phase] = config.milestones.map((_, index) => Boolean(incoming[index]));
    }

    return clean;
  } catch {
    return defaultState();
  }
}

const state = loadState();

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

function saveState() {
  const snapshot = JSON.stringify(state);
  localStorage.setItem(STORAGE_KEY, snapshot);
  sessionStorage.setItem(STORAGE_KEY, snapshot);
}

function selectPhase(phase) {
  if (!phaseConfig[phase]) return;
  state.selectedPhase = phase;
  render();
}

function toggleMilestone(phase, index) {
  if (!phaseConfig[phase] || !Number.isInteger(index)) return;
  state.selectedPhase = phase;
  state.completed[phase][index] = !state.completed[phase][index];
  render();
}

function getPhaseProgress(phase) {
  const values = state.completed[phase];
  const done = values.filter(Boolean).length;

  return {
    done,
    total: values.length,
    percent: values.length ? Math.round((done / values.length) * 100) : 0
  };
}

function renderMap() {
  for (const island of document.querySelectorAll(".island")) {
    const phase = island.dataset.phase;
    island.classList.toggle("selected", phase === state.selectedPhase);

    const values = state.completed[phase];
    const firstOpen = values.findIndex((value) => !value);

    island.querySelectorAll(".milestone").forEach((button) => {
      const index = Number(button.dataset.index);
      const done = Boolean(values[index]);

      button.classList.toggle("done", done);
      button.classList.toggle("next", !done && index === firstOpen);
      button.setAttribute("aria-pressed", String(done));
    });
  }
}

function renderCard() {
  const phase = state.selectedPhase;
  const config = phaseConfig[phase];
  const progress = getPhaseProgress(phase);

  phaseTitle.textContent = config.title;
  phaseSubtitle.textContent = config.subtitle;
  phaseCompleted.textContent = progress.done;
  phaseTotal.textContent = progress.total;
  phaseProgress.style.width = `${progress.percent}%`;
  phaseCard.dataset.phase = phase;
}

function renderDialog() {
  const phase = state.selectedPhase;
  const config = phaseConfig[phase];

  dialogTitle.textContent = config.title;
  dialogDescription.textContent = config.description;
  dialogMilestones.replaceChildren();

  config.milestones.forEach((label, index) => {
    const button = document.createElement("button");
    const completed = state.completed[phase][index];

    button.type = "button";
    button.className = "dialog-milestone";
    button.classList.toggle("done", completed);
    button.dataset.phase = phase;
    button.dataset.index = index;
    button.innerHTML = `<span aria-hidden="true">${completed ? "✓" : ""}</span><strong>${label}</strong>`;
    button.setAttribute("aria-pressed", String(completed));
    button.addEventListener("click", () => {
      toggleMilestone(phase, index);
      renderDialog();
    });

    dialogMilestones.append(button);
  });
}

function renderDebugBridge() {
  const milestoneBoxes = [...document.querySelectorAll(".milestone")].map((node) => node.getBoundingClientRect());

  window.__LEGACY_MOCKUP_DEBUG__ = {
    page: "goals-map-v2",
    selectedPhase: state.selectedPhase,
    phaseCount: Object.keys(phaseConfig).length,
    milestones: Object.fromEntries(
      Object.keys(phaseConfig).map((phase) => [phase, getPhaseProgress(phase)])
    ),
    checks: {
      allPhasesRendered: document.querySelectorAll(".island").length === Object.keys(phaseConfig).length,
      allPhaseSelectorsHaveLabels: [...document.querySelectorAll("[data-select-phase]")].every((node) => node.getAttribute("aria-label")),
      touchTargetsAtLeast44: milestoneBoxes.every((box) => box.width >= 44 && box.height >= 44),
      dialogSupported: typeof phaseDialog.showModal === "function",
      persistenceAvailable: typeof localStorage !== "undefined"
    }
  };
}

function render() {
  renderMap();
  renderCard();
  saveState();
  requestAnimationFrame(renderDebugBridge);
}

document.querySelectorAll("[data-select-phase]").forEach((button) => {
  button.addEventListener("click", () => selectPhase(button.dataset.selectPhase));
});

document.querySelectorAll(".milestone").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleMilestone(button.dataset.phase, Number(button.dataset.index));
  });
});

openPhaseButton.addEventListener("click", () => {
  renderDialog();
  phaseDialog.showModal();
});

dialogDoneButton.addEventListener("click", () => phaseDialog.close());

window.addEventListener("pagehide", saveState);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") saveState();
});

resetMapButton.addEventListener("click", () => {
  const confirmed = window.confirm("Reset Goals Map prototype progress?");
  if (!confirmed) return;

  const fresh = defaultState();
  state.selectedPhase = fresh.selectedPhase;
  state.completed = fresh.completed;
  render();
});

render();
