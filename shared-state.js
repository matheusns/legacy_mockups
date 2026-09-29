(() => {
  const KEY = "legacy-shared-goals-v1";
  const OLD_MAP_KEY = "legacy-mockup-goals-map-v1";
  const OLD_MVP_KEYS = ["legacy-mvp-v0.2", "legacy-mockup-mvp-v0.1"];

  const phases = {
    foundation: {
      id: "foundation",
      title: "Foundation",
      theme: "Meadow",
      subtitle: "Build the systems that make every other phase sustainable.",
      description: "Core routines, organization and the personal operating base.",
      milestones: [
        { id: "foundation-life-system", label: "Define life system" },
        { id: "foundation-core-routines", label: "Build core routines" },
        { id: "foundation-review-cadence", label: "Create review cadence" }
      ]
    },
    health: {
      id: "health",
      title: "Health",
      theme: "Jungle",
      subtitle: "Strengthen energy, fitness, recovery, and daily consistency.",
      description: "Energy, movement, hydration and sustainable recovery.",
      milestones: [
        { id: "health-movement-baseline", label: "Daily movement baseline" },
        { id: "health-hydration-consistency", label: "Hydration consistency" },
        { id: "health-recovery-routine", label: "Recovery routine" }
      ]
    },
    career: {
      id: "career",
      title: "Career",
      theme: "Harbor",
      subtitle: "Build mastery and meaningful professional impact.",
      description: "Mastery, projects, network and the next professional checkpoint.",
      milestones: [
        { id: "career-role-direction", label: "Clarify next role" },
        { id: "career-portfolio-proof", label: "Ship portfolio proof" },
        { id: "career-strategic-network", label: "Expand strategic network" },
        { id: "career-checkpoint", label: "Reach next career checkpoint" }
      ]
    },
    wealth: {
      id: "wealth",
      title: "Wealth",
      theme: "Mines",
      subtitle: "Grow resilience, optionality, and long-term financial capacity.",
      description: "Resilience, investing and long-term optionality.",
      milestones: [
        { id: "wealth-emergency-buffer", label: "Emergency buffer" },
        { id: "wealth-automate-investing", label: "Automate investing" },
        { id: "wealth-capital-target", label: "Reach next capital target" }
      ]
    },
    legacy: {
      id: "legacy",
      title: "Legacy",
      theme: "Ruins",
      subtitle: "Convert achievement into contribution and long-term meaning.",
      description: "Family, contribution, mentorship and durable work.",
      milestones: [
        { id: "legacy-contribution", label: "Define contribution" },
        { id: "legacy-enduring-artifact", label: "Build something enduring" },
        { id: "legacy-pass-knowledge", label: "Pass knowledge forward" }
      ]
    }
  };

  function defaults() {
    return {
      version: 1,
      selectedPhase: "career",
      completed: {
        "foundation-life-system": true,
        "foundation-core-routines": true,
        "foundation-review-cadence": true,
        "health-movement-baseline": true,
        "health-hydration-consistency": false,
        "health-recovery-routine": false,
        "career-role-direction": true,
        "career-portfolio-proof": true,
        "career-strategic-network": false,
        "career-checkpoint": false,
        "wealth-emergency-buffer": false,
        "wealth-automate-investing": false,
        "wealth-capital-target": false,
        "legacy-contribution": false,
        "legacy-enduring-artifact": false,
        "legacy-pass-knowledge": false
      },
      migration: { sources: [], completedAt: null }
    };
  }

  function safeParse(raw) {
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  }

  function setFromArray(target, phaseKey, values, sourceName) {
    if (!Array.isArray(values) || !phases[phaseKey]) return;
    phases[phaseKey].milestones.forEach((milestone, index) => {
      if (values[index] === true) target.completed[milestone.id] = true;
    });
    if (!target.migration.sources.includes(sourceName)) target.migration.sources.push(sourceName);
  }

  function migrate() {
    const existing = safeParse(localStorage.getItem(KEY));
    const state = defaults();

    if (existing && typeof existing === "object") {
      if (phases[existing.selectedPhase]) state.selectedPhase = existing.selectedPhase;
      if (existing.completed && typeof existing.completed === "object") {
        Object.keys(state.completed).forEach(id => {
          if (existing.completed[id] === true) state.completed[id] = true;
          if (existing.completed[id] === false && !state.completed[id]) state.completed[id] = false;
        });
      }
      state.migration.sources.push(KEY);
    }

    const mapOld = safeParse(localStorage.getItem(OLD_MAP_KEY));
    if (mapOld) {
      if (phases[mapOld.selectedPhase]) state.selectedPhase = mapOld.selectedPhase;
      if (mapOld.completed) {
        Object.keys(phases).forEach(phaseKey => setFromArray(state, phaseKey, mapOld.completed[phaseKey], OLD_MAP_KEY));
      }
    }

    for (const oldKey of OLD_MVP_KEYS) {
      const mvpOld = safeParse(localStorage.getItem(oldKey));
      if (!mvpOld) continue;
      if (phases[mvpOld.selectedPhase]) state.selectedPhase = mvpOld.selectedPhase;
      if (mvpOld.phases && typeof mvpOld.phases === "object") {
        Object.entries(mvpOld.phases).forEach(([phaseKey, value]) => {
          if (!phases[phaseKey]) return;
          const arr = Array.isArray(value?.milestones) ? value.milestones.map(item => Array.isArray(item) ? Boolean(item[1]) : Boolean(item?.done)) : [];
          setFromArray(state, phaseKey, arr, oldKey);
        });
      }
    }

    state.migration.completedAt = new Date().toISOString();
    localStorage.setItem(KEY, JSON.stringify(state));
    return state;
  }

  function load() {
    return migrate();
  }

  function save(state) {
    const clean = defaults();
    clean.selectedPhase = phases[state.selectedPhase] ? state.selectedPhase : "career";
    Object.keys(clean.completed).forEach(id => { clean.completed[id] = Boolean(state.completed?.[id]); });
    clean.migration = state.migration || { sources: [KEY], completedAt: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify(clean));
    return clean;
  }

  function progress(state, phaseKey) {
    const phase = phases[phaseKey];
    if (!phase) return { done: 0, total: 0, percent: 0 };
    const done = phase.milestones.filter(m => Boolean(state.completed[m.id])).length;
    return { done, total: phase.milestones.length, percent: Math.round(done / phase.milestones.length * 100) };
  }

  window.LegacySharedGoals = { KEY, phases, defaults, load, save, progress };
})();