from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles

app = FastAPI()

logs = [
    {
        "id": 1,
        "title": "Python環境構築を行った",
        "category": "study",
        "content": "Pythonのインストール、仮想環境作成、FastAPI起動まで行った",
        "status": "done",
        "importance": 3,
        "logged_date": "2026-05-17"
    },
    {
        "id": 2,
        "title": "READMEを作成した",
        "category": "document",
        "content": "Something LogアプリのREADMEを作成した",
        "status": "done",
        "importance": 2,
        "logged_date": "2026-05-17"
    },
    {
        "id": 3,
        "title": "一覧表示APIを作成する",
        "category": "backend",
        "content": "GET /logs でログ一覧を返すAPIを作成する",
        "status": "doing",
        "importance": 3,
        "logged_date": "2026-05-18"
    }
]


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/logs")
def get_logs():
    return logs


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


app.mount("/", StaticFiles(directory="../front", html=True), name="front")