const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const themeIcon = document.querySelector(".theme-icon");
const themeLabel = document.querySelector(".theme-label");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const taskForm = document.querySelector("#task-form");
const taskTitle = document.querySelector("#task-title");
const taskDay = document.querySelector("#task-day");
const taskList = document.querySelector("#task-list");
const taskTemplate = document.querySelector("#task-template");
const filterButtons = document.querySelectorAll(".filter-button");

const storageKeys = {
  theme: "student-week-theme",
  tasks: "student-week-tasks",
};

let currentFilter = "all";
let tasks = loadTasks();

function applyTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem(storageKeys.theme, theme);

  const isDark = theme === "dark";
  themeIcon.textContent = isDark ? "☼" : "☾";
  themeLabel.textContent = isDark ? "Gaišais" : "Tumšais";
}

function getInitialTheme() {
  const storedTheme = localStorage.getItem(storageKeys.theme);

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function loadTasks() {
  const storedTasks = localStorage.getItem(storageKeys.tasks);

  if (!storedTasks) {
    return [
      { id: crypto.randomUUID(), title: "Pārskatīt e-studiju termiņus", day: "Pirmdiena", done: true },
      { id: crypto.randomUUID(), title: "Sagatavot jautājumus praktiskajam darbam", day: "Otrdiena", done: false },
      { id: crypto.randomUUID(), title: "Sakārtot piektdienas kopsavilkumu", day: "Piektdiena", done: false },
    ];
  }

  try {
    const parsedTasks = JSON.parse(storedTasks);
    return Array.isArray(parsedTasks) ? parsedTasks : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(storageKeys.tasks, JSON.stringify(tasks));
}

function getVisibleTasks() {
  if (currentFilter === "active") {
    return tasks.filter((task) => !task.done);
  }

  if (currentFilter === "done") {
    return tasks.filter((task) => task.done);
  }

  return tasks;
}

function renderTasks() {
  taskList.innerHTML = "";

  getVisibleTasks().forEach((task) => {
    const item = taskTemplate.content.firstElementChild.cloneNode(true);
    const checkbox = item.querySelector("input");
    const title = item.querySelector("strong");
    const day = item.querySelector(".task-content span");

    item.dataset.id = task.id;
    item.classList.toggle("is-done", task.done);
    checkbox.checked = task.done;
    title.textContent = task.title;
    day.textContent = task.day;

    taskList.append(item);
  });
}

function addTask(title, day) {
  tasks = [
    {
      id: crypto.randomUUID(),
      title,
      day,
      done: false,
    },
    ...tasks,
  ];
  saveTasks();
  renderTasks();
}

function updateTask(id, updates) {
  tasks = tasks.map((task) => (task.id === id ? { ...task, ...updates } : task));
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

themeToggle.addEventListener("click", () => {
  applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
});

menuToggle.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

siteNav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    siteNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = taskTitle.value.trim();

  if (!title) {
    return;
  }

  addTask(title, taskDay.value);
  taskForm.reset();
  taskTitle.focus();
});

taskList.addEventListener("click", (event) => {
  const taskItem = event.target.closest(".task-item");

  if (!taskItem) {
    return;
  }

  const task = tasks.find((item) => item.id === taskItem.dataset.id);

  if (!task) {
    return;
  }

  if (event.target.matches("input[type='checkbox']")) {
    updateTask(task.id, { done: event.target.checked });
  }

  if (event.target.matches("[data-action='edit']")) {
    const nextTitle = window.prompt("Ievadi laboto uzdevumu:", task.title);

    if (nextTitle && nextTitle.trim()) {
      updateTask(task.id, { title: nextTitle.trim() });
    }
  }

  if (event.target.matches("[data-action='delete']")) {
    deleteTask(task.id);
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach((filterButton) => {
      filterButton.classList.toggle("is-active", filterButton === button);
    });

    renderTasks();
  });
});

applyTheme(getInitialTheme());
renderTasks();
