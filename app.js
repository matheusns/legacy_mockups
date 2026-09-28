const STORAGE_KEY = "legacy-mockup-todo-water-v1";
const GLASS_ML = 250;
const WATER_GOAL_GLASSES = 8;

const state = loadState();

const todoForm = document.querySelector("#todoForm");
const todoInput = document.querySelector("#todoInput");
const todoList = document.querySelector("#todoList");
const todoEmpty = document.querySelector("#todoEmpty");
const taskSummary = document.querySelector("#taskSummary");
const template = document.querySelector("#todoItemTemplate");

const waterAmount = document.querySelector("#waterAmount");
const waterGlasses = document.querySelector("#waterGlasses");
const waterGoalGlasses = document.querySelector("#waterGoalGlasses");
const progressFill = document.querySelector("#progressFill");
const glassGrid = document.querySelector("#glassGrid");
const addWaterButton = document.querySelector("#addWaterButton");
const removeWaterButton = document.querySelector("#removeWaterButton");
const waterResetButton = document.querySelector("#waterResetButton");
const resetAllButton = document.querySelector("#resetAllButton");

function defaultState() {
  return {
    todos: [
      { id: crypto.randomUUID(), label: "Review today's priorities", completed: false },
      { id: crypto.randomUUID(), label: "Finish one important task", completed: false }
    ],
    waterGlasses: 0
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();

    const parsed = JSON.parse(raw);
    return {
      todos: Array.isArray(parsed.todos) ? parsed.todos : [],
      waterGlasses: Number.isInteger(parsed.waterGlasses) ? Math.max(0, parsed.waterGlasses) : 0
    };
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function render() {
  renderTodos();
  renderWater();
  saveState();
}

function renderTodos() {
  todoList.replaceChildren();

  for (const todo of state.todos) {
    const fragment = template.content.cloneNode(true);
    const item = fragment.querySelector(".todo-item");
    const checkbox = fragment.querySelector(".todo-checkbox");
    const label = fragment.querySelector(".todo-label");
    const deleteButton = fragment.querySelector(".delete-button");

    checkbox.checked = todo.completed;
    label.textContent = todo.label;
    item.classList.toggle("completed", todo.completed);

    checkbox.addEventListener("change", () => {
      todo.completed = checkbox.checked;
      render();
    });

    deleteButton.addEventListener("click", () => {
      state.todos = state.todos.filter((candidate) => candidate.id !== todo.id);
      render();
    });

    todoList.append(fragment);
  }

  const completed = state.todos.filter((todo) => todo.completed).length;
  taskSummary.textContent = `${completed} / ${state.todos.length}`;
  todoEmpty.hidden = state.todos.length > 0;
}

function renderWater() {
  const glasses = state.waterGlasses;
  const amount = glasses * GLASS_ML;
  const progress = Math.min(100, (glasses / WATER_GOAL_GLASSES) * 100);

  waterAmount.textContent = amount;
  waterGlasses.textContent = glasses;
  waterGoalGlasses.textContent = WATER_GOAL_GLASSES;
  progressFill.style.width = `${progress}%`;

  glassGrid.replaceChildren();
  for (let i = 0; i < WATER_GOAL_GLASSES; i += 1) {
    const glass = document.createElement("div");
    glass.className = "glass";
    glass.classList.toggle("filled", i < glasses);
    glass.setAttribute("aria-hidden", "true");
    glassGrid.append(glass);
  }

  removeWaterButton.disabled = glasses === 0;
  waterResetButton.disabled = glasses === 0;
}

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const label = todoInput.value.trim();

  if (!label) return;

  state.todos.unshift({
    id: crypto.randomUUID(),
    label,
    completed: false
  });

  todoInput.value = "";
  render();
  todoInput.focus();
});

addWaterButton.addEventListener("click", () => {
  state.waterGlasses += 1;
  render();
});

removeWaterButton.addEventListener("click", () => {
  state.waterGlasses = Math.max(0, state.waterGlasses - 1);
  render();
});

waterResetButton.addEventListener("click", () => {
  state.waterGlasses = 0;
  render();
});

resetAllButton.addEventListener("click", () => {
  const confirmed = window.confirm("Reset all mockup tasks and water data?");
  if (!confirmed) return;

  const fresh = defaultState();
  state.todos = fresh.todos;
  state.waterGlasses = fresh.waterGlasses;
  render();
});

render();
