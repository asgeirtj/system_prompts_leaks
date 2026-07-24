import os
import sqlite3
from pathlib import Path
from typing import List, Tuple


def init_database(db_path: str | None = None) -> sqlite3.Connection:
    if db_path is None:
        db_path = os.getenv("DB_PATH") or str(Path(__file__).resolve().parents[1] / "platform.db")
    conn = sqlite3.connect(db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS prompts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            content TEXT NOT NULL,
            provider TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            source TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    conn.commit()
    seed_default_prompts(conn)
    return conn


def seed_default_prompts(conn: sqlite3.Connection) -> None:
    existing = conn.execute("SELECT COUNT(*) AS count FROM prompts").fetchone()["count"]
    if existing > 0:
        return
    defaults = [
        ("Claude Code", "Anthropic", "System prompt for Claude Code agent", "Anthropic"),
        ("ChatGPT Agent", "OpenAI", "System prompt for ChatGPT agent workflows", "OpenAI"),
        ("Gemini Workspace", "Google", "System prompt for Gemini Workspace", "Google"),
    ]
    conn.executemany(
        "INSERT INTO prompts (title, category, content, provider) VALUES (?, ?, ?, ?)",
        defaults,
    )
    conn.commit()


def create_prompt(conn: sqlite3.Connection, title: str, category: str, content: str, provider: str) -> int:
    cursor = conn.execute(
        "INSERT INTO prompts (title, category, content, provider) VALUES (?, ?, ?, ?)",
        (title, category, content, provider),
    )
    conn.commit()
    return int(cursor.lastrowid)


def list_prompts(conn: sqlite3.Connection) -> List[Tuple[int, str, str, str, str]]:
    rows = conn.execute(
        "SELECT id, title, category, content, provider FROM prompts ORDER BY id ASC"
    ).fetchall()
    return [(row["id"], row["title"], row["category"], row["content"], row["provider"]) for row in rows]


def create_lead(conn: sqlite3.Connection, email: str, source: str) -> int:
    cursor = conn.execute(
        "INSERT INTO leads (email, source) VALUES (?, ?)",
        (email, source),
    )
    conn.commit()
    return int(cursor.lastrowid)


def list_leads(conn: sqlite3.Connection) -> List[Tuple[int, str, str]]:
    rows = conn.execute("SELECT id, email, source FROM leads ORDER BY id ASC").fetchall()
    return [(row["id"], row["email"], row["source"]) for row in rows]
