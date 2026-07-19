from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel


# =========================
# FastAPIアプリ本体
# =========================

app = FastAPI()


# =========================
# リクエストボディ定義
# =========================

class TodoCreate(BaseModel):
    task: str
    due_date: str | None = None
    category: str | None = None
    priority: str
    status: str


class TodoUpdate(BaseModel):
    task: str
    due_date: str | None = None
    category: str | None = None
    priority: str
    status: str


# =========================
# 仮データ
# =========================

todos = [
    {
        "id": 1,
        "task": "Pythonの環境構築を行う",
        "due_date": "2026-05-17",
        "category": "学習",
        "priority": "high",
        "status": "done"
    },
    {
        "id": 2,
        "task": "READMEを作成する",
        "due_date": "2026-05-18",
        "category": "ドキュメント",
        "priority": "medium",
        "status": "done"
    },
    {
        "id": 3,
        "task": "TODO一覧表示APIを作成する",
        "due_date": "2026-05-19",
        "category": "バックエンド",
        "priority": "medium",
        "status": "doing"
    }
]


# =========================
# ヘルスチェック
# =========================

@app.get("/health")
def health_check():
    return {"status": "ok"}


# =========================
# 表示処理
# =========================

@app.get("/todos")
def get_todos():
    return todos


# =========================
# 追加処理
# =========================

@app.post("/todos")
def create_todo(todo: TodoCreate):
    new_id = max((item["id"] for item in todos), default=0) + 1

    new_todo = {
        "id": new_id,
        "task": todo.task,
        "due_date": todo.due_date,
        "category": todo.category,
        "priority": todo.priority,
        "status": todo.status,
    }

    todos.append(new_todo)

    return new_todo


# =========================
# 更新処理
# =========================

@app.put("/todos/{todo_id}")
def update_todo(todo_id: int, todo: TodoUpdate):
    for index, current_todo in enumerate(todos):
        if current_todo["id"] == todo_id:
            updated_todo = {
                "id": todo_id,
                "task": todo.task,
                "due_date": todo.due_date,
                "category": todo.category,
                "priority": todo.priority,
                "status": todo.status,
            }

            todos[index] = updated_todo

            return updated_todo

    raise HTTPException(status_code=404, detail="Todo not found")


# =========================
# 削除処理
# =========================

@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int):
    for index, todo in enumerate(todos):
        if todo["id"] == todo_id:
            deleted_todo = todos.pop(index)
            return {
                "message": "todo deleted",
                "todo": deleted_todo
            }

    raise HTTPException(status_code=404, detail="Todo not found")


# =========================
# フロント画面表示設定
# =========================

app.mount("/", StaticFiles(directory="../front", html=True), name="front")