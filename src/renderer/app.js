const TASK_STORAGE_KEY = "quietlist.tasks";
const THEME_STORAGE_KEY = "quietlist.theme";

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskCategory = document.querySelector("#task-category");
const taskDate = document.querySelector("#task-date");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const filters = document.querySelector("#filters");
const heroCount = document.querySelector("#hero-count");
const totalCount = document.querySelector("#total-count");
const completedCount = document.querySelector("#completed-count");
const focusScore = document.querySelector("#focus-score");
const todayNote = document.querySelector("#today-note");
const themeToggle = document.querySelector("#theme-toggle");

const defaultTasks = [
  createTask("Plan today in three small steps", "Personal", "", false, Date.now() - 3),
  createTask("Finish one important task", "Work", tomorrowString(), false, Date.now() - 2),
  createTask("Reset the desk before logging off", "Home", "", true, Date.now() - 1)
];

let currentFilter = "all";
let currentTheme = loadTheme();
let tasks = loadTasks();

applyTheme(currentTheme);
renderTasks();

function createTask(title, category, dueDate, completed = false, createdAt = Date.now()) {
  return {
    id: crypto.randomUUID(),
    title,
    category,
    dueDate,
    completed,
    createdAt
  };
}

function tomorrowString() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}

function normalizeTask(task) {
  return {
    id: task.id || crypto.randomUUID(),
    title: String(task.title || "").trim(),
    category: task.category || "Personal",
    dueDate: task.dueDate || "",
    completed: Boolean(task.completed),
    createdAt: task.createdAt || Date.now()
  };
}

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(TASK_STORAGE_KEY));

    if (Array.isArray(saved) && saved.length > 0) {
      return saved.map(normalizeTask).filter((task) => task.title);
    }
  } catch (error) {
    console.warn("Could not read tasks from storage.", error);
  }

  return defaultTasks;
}

function saveTasks() {
  localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
}

function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  return savedTheme === "dark" ? "dark" : "light";
}

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  themeToggle.textContent = theme === "dark" ? "Light mode" : "Dark mode";
}

function saveTheme(theme) {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
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

function formatDate(value) {
  if (!value) {
    return "No due date";
  }

  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric"
  }).format(date);
}

function dueSoonCount() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return tasks.filter((task) => {
    if (task.completed || !task.dueDate) {
      return false;
    }

    const due = new Date(`${task.dueDate}T00:00:00`);
    const diffDays = Math.round((due - today) / 86400000);
    return diffDays <= 2;
  }).length;
}

function formatMessage(remaining, urgent) {
  if (remaining === 0) {
    return "All clear for today.";
  }

  if (urgent > 0) {
    return urgent === 1
      ? "One upcoming deadline. Keep the pace steady."
      : `${urgent} tasks are due soon. A little progress will help.`;
  }

  if (remaining === 1) {
    return "One task left. Nice and simple.";
  }

  return "A clean list makes the day feel lighter.";
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function categoryClass(category) {
  return `category-${category.toLowerCase()}`;
}

function createTaskItem(task) {
  const item = document.createElement("li");
  item.className = `task-item${task.completed ? " completed" : ""}`;
  item.dataset.id = task.id;

  const dueLabel = task.dueDate ? `Due ${formatDate(task.dueDate)}` : "No due date";

  item.innerHTML = `
    <div class="task-main">
      <input type="checkbox" ${task.completed ? "checked" : ""} aria-label="Mark task complete">
      <div class="task-content">
        <p class="task-title">${escapeHtml(task.title)}</p>
        <div class="task-meta">
          <span class="meta-chip ${categoryClass(task.category)}">${escapeHtml(task.category)}</span>
          <span class="meta-chip">${escapeHtml(dueLabel)}</span>
          <span class="meta-chip">${task.completed ? "Finished" : "Open"}</span>
        </div>
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
  const urgent = dueSoonCount();

  heroCount.textContent = `${remaining} task${remaining === 1 ? "" : "s"} left`;
  totalCount.textContent = String(total);
  completedCount.textContent = String(completed);
  focusScore.textContent = String(urgent);
  todayNote.textContent = formatMessage(remaining, urgent);
  emptyState.hidden = visibleTasks.length !== 0;

  filters.querySelectorAll(".filter").forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === currentFilter);
  });
}

function addTask(title, category, dueDate) {
  tasks.unshift(createTask(title, category, dueDate));
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

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = taskInput.value.trim();

  if (!title) {
    taskInput.focus();
    return;
  }

  addTask(title, taskCategory.value, taskDate.value);
  taskForm.reset();
  taskCategory.value = "Personal";
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

themeToggle.addEventListener("click", () => {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  applyTheme(currentTheme);
  saveTheme(currentTheme);
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
