/**
 * script.js — Dynamic To-Do List Logic
 * Project  : TaskFlow
 * Author   : [Your Name]
 * Date     : April 25, 2026
 *
 * Features:
 *  Task 4 — Add tasks dynamically, prevent empty entries
 *  Task 5 — Edit and delete tasks inline
 *  Task 6 — Checkbox completion toggle, strikethrough,
 *            live counters (total / pending / completed),
 *            filter tabs, and "Clear Completed" button
 */

"use strict";

/* ====================================================
   1. STATE
   Each task object: { id, text, completed, createdAt }
   ==================================================== */
let tasks       = [];     // Master task array
let nextId      = 1;      // Auto-incrementing task ID
let activeFilter = "all"; // "all" | "pending" | "completed"

/* ====================================================
   2. DOM REFERENCES
   ==================================================== */
const taskInput         = document.getElementById("task-input");
const addBtn            = document.getElementById("add-btn");
const errorMsg          = document.getElementById("error-msg");
const taskList          = document.getElementById("task-list");
const emptyState        = document.getElementById("empty-state");
const totalCount        = document.getElementById("total-count");
const pendingCount      = document.getElementById("pending-count");
const doneCount         = document.getElementById("done-count");
const filterBtns        = document.querySelectorAll(".filter-btn");
const clearCompletedBtn = document.getElementById("clear-completed-btn");

/* ====================================================
   3. ADD TASK
   Validates input, creates a task object, re-renders.
   ==================================================== */
function addTask() {
  const rawText = taskInput.value.trim();

  // Validation: prevent empty tasks
  if (!rawText) {
    showError("Please enter a task before adding.");
    taskInput.focus();
    return;
  }

  clearError();

  // Build task object
  const newTask = {
    id:        nextId++,
    text:      rawText,
    completed: false,
    createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  };

  tasks.push(newTask);

  // Clear input and re-render
  taskInput.value = "";
  renderTasks();
  taskInput.focus();
}

/* ====================================================
   4. DELETE TASK
   Removes the task with the given id from the array.
   ==================================================== */
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  renderTasks();
}

/* ====================================================
   5. TOGGLE COMPLETE  (Bonus Task 6)
   Flips the completed flag on the task.
   ==================================================== */
function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (task) task.completed = !task.completed;
  renderTasks();
}

/* ====================================================
   6. START EDITING
   Replaces task text with an inline input field.
   ==================================================== */
function startEdit(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  // Find the list item by data-id attribute
  const li = taskList.querySelector(`[data-id="${id}"]`);
  if (!li) return;

  const textWrapper = li.querySelector(".task-text-wrapper");
  const actionsDiv  = li.querySelector(".task-actions");

  // Build inline edit input
  const editInput = document.createElement("input");
  editInput.type      = "text";
  editInput.className = "task-edit-input";
  editInput.value     = task.text;
  editInput.maxLength = 200;
  editInput.setAttribute("aria-label", "Edit task text");

  // Save button
  const saveBtn = document.createElement("button");
  saveBtn.className   = "btn btn-save";
  saveBtn.textContent = "Save";
  saveBtn.setAttribute("aria-label", "Save task");

  // Cancel button
  const cancelBtn = document.createElement("button");
  cancelBtn.className   = "btn btn-cancel";
  cancelBtn.textContent = "Cancel";
  cancelBtn.setAttribute("aria-label", "Cancel editing");

  // Swap content in the text wrapper
  textWrapper.innerHTML = "";
  textWrapper.appendChild(editInput);

  // Swap action buttons
  actionsDiv.innerHTML = "";
  actionsDiv.appendChild(saveBtn);
  actionsDiv.appendChild(cancelBtn);

  editInput.focus();
  editInput.select();

  /* Save handler — validates and commits the edit */
  function commitEdit() {
    const newText = editInput.value.trim();
    if (!newText) {
      editInput.style.borderColor = "var(--clr-error)";
      editInput.focus();
      return;
    }
    task.text = newText;
    renderTasks();
  }

  saveBtn.addEventListener("click", commitEdit);
  cancelBtn.addEventListener("click", renderTasks);   // discard: just re-render from state

  // Allow pressing Enter to save, Escape to cancel
  editInput.addEventListener("keydown", e => {
    if (e.key === "Enter")  { e.preventDefault(); commitEdit(); }
    if (e.key === "Escape") { renderTasks(); }
  });
}

/* ====================================================
   7. CLEAR COMPLETED  (Bonus Task 6)
   Removes all completed tasks at once.
   ==================================================== */
function clearCompleted() {
  tasks = tasks.filter(t => !t.completed);
  renderTasks();
}

/* ====================================================
   8. RENDER TASKS
   Master render function. Filters tasks per activeFilter,
   builds the DOM, and updates counters.
   ==================================================== */
function renderTasks() {
  // Determine which tasks to show based on active filter
  let visible;
  if (activeFilter === "pending") {
    visible = tasks.filter(t => !t.completed);
  } else if (activeFilter === "completed") {
    visible = tasks.filter(t => t.completed);
  } else {
    visible = [...tasks];
  }

  // Clear current list
  taskList.innerHTML = "";

  // Toggle empty state
  if (visible.length === 0) {
    emptyState.classList.add("visible");
  } else {
    emptyState.classList.remove("visible");
  }

  // Build a list item for each visible task
  visible.forEach(task => {
    const li = buildTaskElement(task);
    taskList.appendChild(li);
  });

  // Update counters
  updateCounters();
}

/* ====================================================
   9. BUILD TASK ELEMENT
   Creates and returns an <li> DOM node for one task.
   ==================================================== */
function buildTaskElement(task) {
  const li = document.createElement("li");
  li.className = `task-item${task.completed ? " completed" : ""}`;
  li.dataset.id = task.id;
  li.setAttribute("role", "listitem");

  /* --- Checkbox (Bonus Task 6) --- */
  const checkbox = document.createElement("input");
  checkbox.type      = "checkbox";
  checkbox.className = "task-checkbox";
  checkbox.checked   = task.completed;
  checkbox.setAttribute("aria-label", `Mark "${task.text}" as ${task.completed ? "incomplete" : "complete"}`);
  checkbox.addEventListener("change", () => toggleComplete(task.id));

  /* --- Text wrapper --- */
  const textWrapper = document.createElement("div");
  textWrapper.className = "task-text-wrapper";

  const taskTextEl = document.createElement("span");
  taskTextEl.className   = "task-text";
  taskTextEl.textContent = task.text;

  const timestamp = document.createElement("span");
  timestamp.className   = "task-timestamp";
  timestamp.textContent = `Added at ${task.createdAt}`;

  textWrapper.appendChild(taskTextEl);
  textWrapper.appendChild(timestamp);

  /* --- Action buttons --- */
  const actionsDiv = document.createElement("div");
  actionsDiv.className = "task-actions";

  // Edit button (Task 5)
  const editBtn = document.createElement("button");
  editBtn.className   = "btn btn-edit";
  editBtn.textContent = "Edit";
  editBtn.setAttribute("aria-label", `Edit task: ${task.text}`);
  editBtn.addEventListener("click", () => startEdit(task.id));

  // Delete button (Task 5)
  const deleteBtn = document.createElement("button");
  deleteBtn.className   = "btn btn-delete";
  deleteBtn.textContent = "Delete";
  deleteBtn.setAttribute("aria-label", `Delete task: ${task.text}`);
  deleteBtn.addEventListener("click", () => deleteTask(task.id));

  actionsDiv.appendChild(editBtn);
  actionsDiv.appendChild(deleteBtn);

  /* --- Assemble --- */
  li.appendChild(checkbox);
  li.appendChild(textWrapper);
  li.appendChild(actionsDiv);

  return li;
}

/* ====================================================
  10. UPDATE COUNTERS  (Bonus Task 6)
   Updates the three stat numbers in the header.
   ==================================================== */
function updateCounters() {
  const total   = tasks.length;
  const done    = tasks.filter(t => t.completed).length;
  const pending = total - done;

  totalCount.textContent   = total;
  pendingCount.textContent = pending;
  doneCount.textContent    = done;
}

/* ====================================================
  11. ERROR HELPERS
   ==================================================== */
function showError(msg) {
  errorMsg.textContent = msg;
}

function clearError() {
  errorMsg.textContent = "";
}

/* ====================================================
  12. EVENT LISTENERS
   ==================================================== */

// Add Task button
addBtn.addEventListener("click", addTask);

// Allow pressing Enter in the input field to add task
taskInput.addEventListener("keydown", e => {
  if (e.key === "Enter") addTask();
});

// Clear error as user starts typing again
taskInput.addEventListener("input", () => {
  if (taskInput.value.trim()) clearError();
});

// Filter buttons
filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    // Update active filter
    activeFilter = btn.dataset.filter;

    // Update active class
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    renderTasks();
  });
});

// Clear Completed button
clearCompletedBtn.addEventListener("click", clearCompleted);

/* ====================================================
  13. INITIAL RENDER
   Seeds a couple of example tasks so the page isn't blank
   on first open, then renders.
   ==================================================== */
function seedExampleTasks() {
  const examples = [
    "Read Chapter 3 of the textbook",
    "Complete Experiment 4 assignment"
  ];
  examples.forEach(text => {
    tasks.push({
      id:        nextId++,
      text,
      completed: false,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    });
  });
}

seedExampleTasks();
renderTasks();
