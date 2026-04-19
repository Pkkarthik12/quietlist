const STORAGE_KEY = "do-do-ist.tasks";

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const filters = document.querySelector("#filters");
const heroCount = document.querySelector("#hero-count");
const totalCount = document.querySelector("#total-count");
const completedCount = document.querySelector("#completed-count");
const focusScore = document.querySelector("#focus-score");
const todayNote = document.querySelector("#today-note");
const quoteText = document.querySelector("#quote-text");

const quotes = {
  empty: [
    "Start small. Clarity grows from one action.",
    "A gentle beginning is still a beginning.",
    "Make the first task easy, then keep going."
  ],
  active: [
    "Small steps still move you forward.",
    "Progress feels lighter when the next step is clear.",
    "You do not need a perfect day, only a real one.",
    "One finished task can change the mood of the day."
  ],
  almostDone: [
    "You are closer than you think.",
    "One more step and the day opens up.",
    "Keep going. The list is getting quieter."
  ],
  complete: [
    "Done is a peaceful feeling.",
    "You made space for tomorrow.",
    "A finished list is a kind gift to yourself."
  ]
};

const defaultTasks = [
  { id: crypto.randomUUID(), title: "Plan today in three small steps", completed: false, createdAt: Date.now() - 3 },
  { id: crypto.randomUUID(), title: "Finish one important task", completed: false, createdAt: Date.now() - 2 },
  { id: crypto.randomUUID(), title: "Reset the desk before logging off", completed: true, createdAt: Date.now() - 1 }
];

let currentFilter = "all";
let tasks = loadTasks();

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (Array.isArray(saved) && saved.length > 0) {
      return saved;
    }
  } catch (error) {
    console.warn("Could not read tasks from storage.", error);
  }

  return defaultTasks;
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function getFilteredTasks() {
  if (currentFilter === "active") {
    return tasks.filter((task) => !task.completed);
  }

  if (currentFilter === "completed") {
    return tasks.filter((task) => task.completed);
  }

  return tasks;
}

function formatMeta(task) {
  return task.completed ? "Finished" : "Open";
}

function pickQuote(remaining, total) {
  let group = quotes.active;

  if (total === 0) {
    group = quotes.empty;
  } else if (remaining === 0) {
    group = quotes.complete;
  } else if (remaining === 1) {
    group = quotes.almostDone;
  }

  const index = Math.min(group.length - 1, total % group.length);
  return group[index];
}

function createTaskItem(task) {
  const item = document.createElement("li");
  item.className = `task-item${task.completed ? " completed" : ""}`;
  item.dataset.id = task.id;

  item.innerHTML = `
    <div class="task-main">
      <input type="checkbox" ${task.completed ? "checked" : ""} aria-label="Mark task complete">
      <div>
        <p class="task-title">${escapeHtml(task.title)}</p>
        <div class="task-meta">${formatMeta(task)}</div>
      </div>
    </div>
    <div class="task-actions">
      <button type="button" class="ghost-button" data-action="toggle">${task.completed ? "Reopen" : "Done"}</button>
      <button type="button" class="danger-button" data-action="delete">Delete</button>
    </div>
  `;

  return item;
}

function renderTasks() {
  const visibleTasks = getFilteredTasks();
  taskList.innerHTML = "";

  visibleTasks.forEach((task) => {
    taskList.append(createTaskItem(task));
  });

  const remaining = tasks.filter((task) => !task.completed).length;
  const completed = tasks.filter((task) => task.completed).length;
  const total = tasks.length;
  const message =
    remaining === 0
      ? "All clear for today."
      : remaining === 1
        ? "One task left. Nice and simple."
        : "A clean list makes the day feel lighter.";
  const quote = pickQuote(remaining, total);

  heroCount.textContent = `${remaining} task${remaining === 1 ? "" : "s"} left`;
  totalCount.textContent = String(total);
  completedCount.textContent = String(completed);
  focusScore.textContent = String(remaining);
  todayNote.textContent = message;
  quoteText.textContent = quote;
  emptyState.hidden = visibleTasks.length !== 0;

  filters.querySelectorAll(".filter").forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === currentFilter);
  });
}

function addTask(title) {
  tasks.unshift({
    id: crypto.randomUUID(),
    title,
    completed: false,
    createdAt: Date.now()
  });

  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map((task) => (
    task.id === id ? { ...task, completed: !task.completed } : task
  ));

  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = taskInput.value.trim();

  if (!title) {
    taskInput.focus();
    return;
  }

  addTask(title);
  taskForm.reset();
  taskInput.focus();
});

filters.addEventListener("click", (event) => {
  const target = event.target;

  if (!(target instanceof HTMLButtonElement) || !target.dataset.filter) {
    return;
  }

  currentFilter = target.dataset.filter;
  renderTasks();
});

taskList.addEventListener("click", (event) => {
  const target = event.target;

  if (!(target instanceof HTMLElement)) {
    return;
  }

  const taskItem = target.closest(".task-item");

  if (!taskItem) {
    return;
  }

  const { id } = taskItem.dataset;

  if (!id) {
    return;
  }

  if (target instanceof HTMLInputElement && target.type === "checkbox") {
    toggleTask(id);
    return;
  }

  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  if (target.dataset.action === "toggle") {
    toggleTask(id);
  }

  if (target.dataset.action === "delete") {
    deleteTask(id);
  }
});

renderTasks();
