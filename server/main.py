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

class LogCreate(BaseModel):
    category: str
    content: str
    status: str
    importance: int
    logged_date: str


# =========================
# 仮データ
# =========================

logs = [
    {
        "id": 1,
        "category": "study",
        "content": "Pythonのインストール、仮想環境作成、FastAPI起動まで行った",
        "status": "done",
        "importance": 3,
        "logged_date": "2026-05-17"
    },
    {
        "id": 2,
        "category": "document",
        "content": "Something LogアプリのREADMEを作成した",
        "status": "done",
        "importance": 2,
        "logged_date": "2026-05-17"
    },
    {
        "id": 3,
        "category": "backend",
        "content": "GET /logs でログ一覧を返すAPIを作成した",
        "status": "doing",
        "importance": 3,
        "logged_date": "2026-05-18"
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

@app.get("/logs")
def get_logs():
    return logs


# =========================
# 追加処理
# =========================

@app.post("/logs")
def create_log(log: LogCreate):
    new_id = max((item["id"] for item in logs), default=0) + 1

    new_log = {
        "id": new_id,
        "category": log.category,
        "content": log.content,
        "status": log.status,
        "importance": log.importance,
        "logged_date": log.logged_date,
    }

    logs.append(new_log)

    return new_log


# =========================
# 削除処理
# =========================

@app.delete("/logs/{log_id}")
def delete_log(log_id: int):
    for index, log in enumerate(logs):
        if log["id"] == log_id:
            deleted_log = logs.pop(index)
            return {
                "message": "log deleted",
                "log": deleted_log
            }

    raise HTTPException(status_code=404, detail="Log not found")


# =========================
# フロント画面表示設定
# =========================

app.mount("/", StaticFiles(directory="../front", html=True), name="front")