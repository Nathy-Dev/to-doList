// =======================
// DOM ELEMENTS
// =======================
const openModalBtn = document.getElementById("open-modal-btn");
const modal = document.getElementById("task-modal");
const closeModalBtn = document.querySelector(".close");
const addTaskBtn = document.getElementById("add-task-btn");
const taskInput = document.getElementById("task-input");
const taskTimeInput = document.getElementById("task-time");
const taskList = document.getElementById("task-list");

// =======================
// INITIALIZATION
// =======================
window.onload = () => {
  updateDate();
  loadTasks();
  setInterval(updateDate, 1000); // Update date every second
};

// =======================
// DATE DISPLAY FUNCTION
// =======================
function updateDate() {
  const dateDisplay = document.getElementById("date-display");
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  dateDisplay.textContent = now.toLocaleDateString("en-US", options);
}

// =======================
// MODAL CONTROLS
// =======================
openModalBtn.addEventListener("click", () => {
  modal.style.display = "block";
  taskInput.focus();
});

closeModalBtn.addEventListener("click", closeModal);

function closeModal() {
  modal.style.display = "none";
  taskInput.value = "";
  taskTimeInput.value = "";
}

// =======================
// TASK HANDLING
// =======================

// Submit Task from Modal
function submitTask() {
  const taskText = taskInput.value.trim();
  const taskTime = taskTimeInput.value;

  if (taskText === "") return;

  addTask(taskText, false, taskTime);
  closeModal();
}

// Add Task Element
function addTask(taskText, isCompleted = false, taskTime = "") {
  const li = document.createElement("li");

  // Checkbox
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("task-checkbox");
  checkbox.checked = isCompleted;

  // Task info container
  const taskInfo = document.createElement("div");
  taskInfo.classList.add("task-info");

  const span = document.createElement("span");
  span.textContent = taskText;

  const timeTag = document.createElement("small");
  timeTag.classList.add("task-time");
  timeTag.textContent = taskTime ? `Time: ${taskTime}` : "";

  taskInfo.appendChild(span);
  if (taskTime) taskInfo.appendChild(timeTag);

  // Completion state
  if (isCompleted) {
    li.classList.add("completed");
  }

  checkbox.addEventListener("change", () => {
    li.classList.toggle("completed", checkbox.checked);
    saveTasks();
  });

  li.appendChild(checkbox);
  li.appendChild(taskInfo);

  // Swipe or drag to delete
  enableSwipeToDelete(li);

  taskList.appendChild(li);
  saveTasks();
}

// Save Tasks to LocalStorage
function saveTasks() {
  const tasks = [];
  document.querySelectorAll("#task-list li").forEach(li => {
    const text = li.querySelector("span").textContent;
    const time = li.querySelector(".task-time")?.textContent.replace("Time: ", "") || "";
    const completed = li.querySelector("input").checked;
    tasks.push({ text, time, completed });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Load Tasks from LocalStorage
function loadTasks() {
  const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  storedTasks.forEach(task => {
    addTask(task.text, task.completed, task.time);
  });
}

// =======================
// SWIPE/DRAG DELETE LOGIC
// =======================
function enableSwipeToDelete(li) {
  let startX = 0, currentX = 0, threshold = 200;

  // Touch support
  li.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  });

  li.addEventListener("touchmove", (e) => {
    currentX = e.touches[0].clientX - startX;
    li.style.transform = `translateX(${currentX}px)`;
  });

  li.addEventListener("touchend", () => {
    if (currentX< -threshold) {
      li.classList.add("removing");
      setTimeout(() => {
        li.remove();
        saveTasks();
      }, 300);
    } else {
      li.style.transform = "translateX(0)";
    }
  });

  // Mouse support
  let isDragging = false;
  li.addEventListener("mousedown", e => {
    isDragging = true;
    startX = e.clientX;
  });

  li.addEventListener("mousemove", e => {
    if (!isDragging) return;
    currentX = e.clientX - startX;
    li.style.transform = `translateX(${currentX}px)`;
  });

  li.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      if (Math.abs(currentX) > threshold) {
        li.classList.add("removing");
        setTimeout(() => {
          li.remove();
          saveTasks();
        }, 300);
      } else {
        li.style.transform = "translateX(0)";
      }
    }
  });
}