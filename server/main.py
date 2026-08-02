from contextlib import asynccontextmanager
from io import BytesIO

from fastapi import Depends, FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from openpyxl import Workbook
from pydantic import BaseModel
from sqlmodel import Field, Session, SQLModel, create_engine, select


# =========================
# データベース設定
# =========================

sqlite_file_name = "todo.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session


# =========================
# FastAPIアプリ本体
# =========================

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)


# =========================
# テーブル定義
# =========================

class Todo(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    task: str
    due_date: str | None = None
    category: str | None = None
    priority: str
    status: str


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
# ヘルスチェック
# =========================

@app.get("/health")
def health_check():
    return {"status": "ok"}


# =========================
# 表示処理
# =========================

@app.get("/todos")
def get_todos(session: Session = Depends(get_session)):
    todos = session.exec(select(Todo)).all()
    return todos


# =========================
# 追加処理
# =========================

@app.post("/todos")
def create_todo(todo: TodoCreate, session: Session = Depends(get_session)):
    new_todo = Todo(
        task=todo.task,
        due_date=todo.due_date,
        category=todo.category,
        priority=todo.priority,
        status=todo.status,
    )

    session.add(new_todo)
    session.commit()
    session.refresh(new_todo)

    return new_todo


# =========================
# 更新処理
# =========================

@app.put("/todos/{todo_id}")
def update_todo(
    todo_id: int,
    todo: TodoUpdate,
    session: Session = Depends(get_session),
):
    target_todo = session.get(Todo, todo_id)

    if target_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")

    target_todo.task = todo.task
    target_todo.due_date = todo.due_date
    target_todo.category = todo.category
    target_todo.priority = todo.priority
    target_todo.status = todo.status

    session.add(target_todo)
    session.commit()
    session.refresh(target_todo)

    return target_todo


# =========================
# 削除処理
# =========================

@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int, session: Session = Depends(get_session)):
    target_todo = session.get(Todo, todo_id)

    if target_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")

    session.delete(target_todo)
    session.commit()

    return {
        "message": "todo deleted",
        "todo": target_todo,
    }


# =========================
# Excel出力用 変換
# =========================

def convert_priority_label(priority: str):
    priority_labels = {
        "high": "高",
        "medium": "中",
        "low": "低",
    }

    return priority_labels.get(priority, priority)


def convert_status_label(status: str):
    status_labels = {
        "todo": "未着手",
        "doing": "進行中",
        "done": "完了",
    }

    return status_labels.get(status, status)


# =========================
# Excel出力処理
# =========================

@app.get("/todos/export/excel")
def export_todos_excel(session: Session = Depends(get_session)):
    todos = session.exec(select(Todo)).all()

    workbook = Workbook()
    worksheet = workbook.active
    worksheet.title = "TODO一覧"

    headers = ["ID", "タスク", "期限日", "カテゴリ", "優先度", "ステータス"]
    worksheet.append(headers)

    for todo in todos:
        worksheet.append([
            todo.id,
            todo.task,
            todo.due_date or "",
            todo.category or "",
            convert_priority_label(todo.priority),
            convert_status_label(todo.status),
        ])

    excel_file = BytesIO()
    workbook.save(excel_file)
    excel_file.seek(0)

    return StreamingResponse(
        excel_file,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": 'attachment; filename="todo_list.xlsx"'
        },
    )


# =========================
# フロント画面表示設定
# =========================

app.mount("/", StaticFiles(directory="../front", html=True), name="front")