from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

from app.database import create_lead, create_prompt, init_database, list_leads, list_prompts
from app.agent import build_agent_reply
from app.landing import build_landing_page

app = FastAPI(title="System Prompts Platform", version="1.0.0")
conn = init_database()


class PromptInput(BaseModel):
    title: str
    category: str
    content: str
    provider: str


class ChatInput(BaseModel):
    message: str


class LeadInput(BaseModel):
    email: str
    source: str = "landing"


@app.get("/", response_class=HTMLResponse)
def index() -> str:
    return build_landing_page()


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "database": "ready"}


@app.get("/prompts")
def get_prompts() -> list[dict]:
    rows = list_prompts(conn)
    return [
        {"id": row[0], "title": row[1], "category": row[2], "content": row[3], "provider": row[4]}
        for row in rows
    ]


@app.post("/prompts", status_code=201)
def create_prompt_endpoint(payload: PromptInput) -> dict:
    prompt_id = create_prompt(conn, payload.title, payload.category, payload.content, payload.provider)
    return {"id": prompt_id, "status": "created"}


@app.post("/chat")
def chat(payload: ChatInput) -> dict:
    return {"reply": build_agent_reply(payload.message)}


@app.post("/leads", status_code=201)
def create_lead_endpoint(payload: LeadInput) -> dict:
    try:
        lead_id = create_lead(conn, payload.email, payload.source)
    except Exception:
        return {"id": None, "status": "already_registered"}
    return {"id": lead_id, "status": "registered"}


@app.get("/leads")
def get_leads() -> list[dict]:
    rows = list_leads(conn)
    return [{"id": row[0], "email": row[1], "source": row[2]} for row in rows]
