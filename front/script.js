const API_BASE_URL = "http://127.0.0.1:8000";

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
      <td>${log.title}</td>
      <td>${log.status}</td>
      <td>${log.importance}</td>
      <td>
        <button type="button" onclick="deleteLog(${log.id})">削除</button>
      </td>
    `;

    logList.appendChild(row);
  });
}

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

fetchLogs();