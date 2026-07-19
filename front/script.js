const API_BASE_URL = "http://127.0.0.1:8000";

let currentTodos = [];
let editingTodoId = null;


// =========================
// 表示処理
// =========================

async function fetchTodos() {
  const response = await fetch(`${API_BASE_URL}/todos`);

  if (!response.ok) {
    alert("一覧取得に失敗しました");
    return;
  }

  currentTodos = await response.json();

  const todoList = document.getElementById("todo-list");
  todoList.innerHTML = "";

  currentTodos.forEach((todo) => {
    const row = document.createElement("tr");

    row.appendChild(createTableCell(todo.task));
    row.appendChild(createTableCell(todo.due_date || "未設定"));
    row.appendChild(createTableCell(todo.category || "未設定"));
    row.appendChild(createTableCell(getPriorityLabel(todo.priority)));
    row.appendChild(createTableCell(getStatusLabel(todo.status)));
    row.appendChild(createActionCell(todo.id));

    todoList.appendChild(row);
  });
}

function createTableCell(text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  return cell;
}

function createActionCell(todoId) {
  const cell = document.createElement("td");
  const buttonGroup = document.createElement("div");

  buttonGroup.classList.add("action-buttons");

  const updateButton = document.createElement("button");
  updateButton.type = "button";
  updateButton.textContent = "更新";
  updateButton.classList.add("table-button", "update-button");
  updateButton.addEventListener("click", () => openEditModal(todoId));

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.textContent = "削除";
  deleteButton.classList.add("table-button", "delete-button");
  deleteButton.addEventListener("click", () => deleteTodo(todoId));

  buttonGroup.appendChild(updateButton);
  buttonGroup.appendChild(deleteButton);
  cell.appendChild(buttonGroup);

  return cell;
}

function getPriorityLabel(priority) {
  const priorityLabels = {
    high: "高",
    medium: "中",
    low: "低",
  };

  return priorityLabels[priority] || priority;
}

function getStatusLabel(status) {
  const statusLabels = {
    todo: "未着手",
    doing: "進行中",
    done: "完了",
  };

  return statusLabels[status] || status;
}


// =========================
// 追加・更新 共通フォーム
// =========================

const todoModal = document.getElementById("todo-modal");
const todoForm = document.getElementById("todo-form");
const modalTitle = document.getElementById("modal-title");
const submitTodoButton = document.getElementById("submit-todo-button");
const openAddModalButton = document.getElementById("open-add-modal-button");
const closeModalButton = document.getElementById("close-modal-button");

function openAddModal() {
  editingTodoId = null;

  todoForm.reset();
  document.getElementById("priority").value = "medium";
  document.getElementById("status").value = "todo";

  modalTitle.textContent = "タスク追加";
  submitTodoButton.textContent = "追加する";

  todoModal.showModal();
}

function openEditModal(todoId) {
  const targetTodo = currentTodos.find((todo) => todo.id === todoId);

  if (!targetTodo) {
    alert("更新対象が見つかりません");
    return;
  }

  editingTodoId = todoId;

  document.getElementById("task").value = targetTodo.task;
  document.getElementById("due-date").value = targetTodo.due_date || "";
  document.getElementById("category").value = targetTodo.category || "";
  document.getElementById("priority").value = targetTodo.priority;
  document.getElementById("status").value = targetTodo.status;

  modalTitle.textContent = "タスク更新";
  submitTodoButton.textContent = "更新する";

  todoModal.showModal();
}

function closeModal() {
  todoModal.close();
  todoForm.reset();
  editingTodoId = null;
}

function getFormValues() {
  const dueDate = document.getElementById("due-date").value;
  const category = document.getElementById("category").value.trim();

  return {
    task: document.getElementById("task").value.trim(),
    due_date: dueDate || null,
    category: category || null,
    priority: document.getElementById("priority").value,
    status: document.getElementById("status").value,
  };
}

async function submitTodo(event) {
  event.preventDefault();

  if (editingTodoId === null) {
    await addTodo();
  } else {
    await updateTodo();
  }
}


// =========================
// 追加処理
// =========================

async function addTodo() {
  const newTodo = getFormValues();

  const response = await fetch(`${API_BASE_URL}/todos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newTodo),
  });

  if (!response.ok) {
    alert("追加に失敗しました");
    return;
  }

  closeModal();
  await fetchTodos();
}


// =========================
// 更新処理
// =========================

async function updateTodo() {
  const updatedTodo = getFormValues();

  const response = await fetch(`${API_BASE_URL}/todos/${editingTodoId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedTodo),
  });

  if (!response.ok) {
    alert("更新に失敗しました");
    return;
  }

  closeModal();
  await fetchTodos();
}


// =========================
// 削除処理
// =========================

async function deleteTodo(todoId) {
  const isConfirmed = confirm("このタスクを削除しますか？");

  if (!isConfirmed) {
    return;
  }

  const response = await fetch(`${API_BASE_URL}/todos/${todoId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    alert("削除に失敗しました");
    return;
  }

  await fetchTodos();
}


// =========================
// イベント設定
// =========================

openAddModalButton.addEventListener("click", openAddModal);
closeModalButton.addEventListener("click", closeModal);
todoForm.addEventListener("submit", submitTodo);


// =========================
// 初期表示
// =========================

fetchTodos();