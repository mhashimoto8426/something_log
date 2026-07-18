const API_BASE_URL = "http://127.0.0.1:8000";

let currentLogs = [];
let editingLogId = null;


// =========================
// 表示処理
// =========================

async function fetchLogs() {
  const response = await fetch(`${API_BASE_URL}/logs`);

  if (!response.ok) {
    alert("一覧取得に失敗しました");
    return;
  }

  currentLogs = await response.json();

  const logList = document.getElementById("log-list");
  logList.innerHTML = "";

  currentLogs.forEach((log) => {
    const row = document.createElement("tr");

    row.appendChild(createTableCell(log.id));
    row.appendChild(createTableCell(log.logged_date));
    row.appendChild(createTableCell(log.category));
    row.appendChild(createTableCell(log.content));
    row.appendChild(createTableCell(log.status));
    row.appendChild(createTableCell(log.importance));

    const actionCell = document.createElement("td");
    actionCell.classList.add("action-buttons");

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "更新";
    editButton.addEventListener("click", () => openEditModal(log.id));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "削除";
    deleteButton.addEventListener("click", () => deleteLog(log.id));

    actionCell.appendChild(editButton);
    actionCell.appendChild(deleteButton);

    row.appendChild(actionCell);
    logList.appendChild(row);
  });
}

function createTableCell(text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  return cell;
}


// =========================
// 追加・更新 共通フォーム
// =========================

const logModal = document.getElementById("log-modal");
const logForm = document.getElementById("log-form");
const modalTitle = document.getElementById("modal-title");
const submitLogButton = document.getElementById("submit-log-button");
const openAddModalButton = document.getElementById("open-add-modal-button");
const closeModalButton = document.getElementById("close-modal-button");

function openAddModal() {
  editingLogId = null;

  logForm.reset();
  document.getElementById("importance").value = 3;

  modalTitle.textContent = "ログ追加";
  submitLogButton.textContent = "追加する";

  logModal.showModal();
}

function openEditModal(logId) {
  const targetLog = currentLogs.find((log) => log.id === logId);

  if (!targetLog) {
    alert("更新対象が見つかりません");
    return;
  }

  editingLogId = logId;

  document.getElementById("logged-date").value = targetLog.logged_date;
  document.getElementById("category").value = targetLog.category;
  document.getElementById("content").value = targetLog.content;
  document.getElementById("status").value = targetLog.status;
  document.getElementById("importance").value = targetLog.importance;

  modalTitle.textContent = "ログ更新";
  submitLogButton.textContent = "更新する";

  logModal.showModal();
}

function closeModal() {
  logModal.close();
  logForm.reset();
  editingLogId = null;
}

function getFormValues() {
  return {
    logged_date: document.getElementById("logged-date").value,
    category: document.getElementById("category").value,
    content: document.getElementById("content").value,
    status: document.getElementById("status").value,
    importance: Number(document.getElementById("importance").value),
  };
}

async function submitLog(event) {
  event.preventDefault();

  if (editingLogId === null) {
    await addLog();
  } else {
    await updateLog();
  }
}


// =========================
// 追加処理
// =========================

async function addLog() {
  const newLog = getFormValues();

  const response = await fetch(`${API_BASE_URL}/logs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newLog),
  });

  if (!response.ok) {
    alert("追加に失敗しました");
    return;
  }

  closeModal();
  await fetchLogs();
}


// =========================
// 更新処理
// =========================

async function updateLog() {
  const updatedLog = getFormValues();

  const response = await fetch(`${API_BASE_URL}/logs/${editingLogId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedLog),
  });

  if (!response.ok) {
    alert("更新に失敗しました");
    return;
  }

  closeModal();
  await fetchLogs();
}


// =========================
// 削除処理
// =========================

async function deleteLog(logId) {
  const isConfirmed = confirm("このログを削除しますか？");

  if (!isConfirmed) {
    return;
  }

  const response = await fetch(`${API_BASE_URL}/logs/${logId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    alert("削除に失敗しました");
    return;
  }

  await fetchLogs();
}


// =========================
// イベント設定
// =========================

openAddModalButton.addEventListener("click", openAddModal);
closeModalButton.addEventListener("click", closeModal);
logForm.addEventListener("submit", submitLog);


// =========================
// 初期表示
// =========================

fetchLogs();