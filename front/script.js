const API_BASE_URL = "http://127.0.0.1:8000";


// =========================
// 表示処理
// =========================

async function fetchLogs() {
  const response = await fetch(`${API_BASE_URL}/logs`);
  const logs = await response.json();

  const logList = document.getElementById("log-list");
  logList.innerHTML = "";

  logs.forEach((log) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${log.id}</td>
      <td>${log.logged_date}</td>
      <td>${log.category}</td>
      <td>${log.content}</td>
      <td>${log.status}</td>
      <td>${log.importance}</td>
      <td>
        <button type="button" onclick="deleteLog(${log.id})">削除</button>
      </td>
    `;

    logList.appendChild(row);
  });
}


// =========================
// 追加処理
// =========================

const addModal = document.getElementById("add-modal");
const openAddModalButton = document.getElementById("open-add-modal-button");
const closeAddModalButton = document.getElementById("close-add-modal-button");
const addLogForm = document.getElementById("add-log-form");

function openAddModal() {
  addModal.showModal();
}

function closeAddModal() {
  addModal.close();
  addLogForm.reset();
}

async function addLog(event) {
  event.preventDefault();

  const newLog = {
    logged_date: document.getElementById("logged-date").value,
    category: document.getElementById("category").value,
    content: document.getElementById("content").value,
    status: document.getElementById("status").value,
    importance: Number(document.getElementById("importance").value),
  };

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

  closeAddModal();
  await fetchLogs();
}

openAddModalButton.addEventListener("click", openAddModal);
closeAddModalButton.addEventListener("click", closeAddModal);
addLogForm.addEventListener("submit", addLog);


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
// 初期表示
// =========================

fetchLogs();