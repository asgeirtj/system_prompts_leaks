from fastapi import FastAPI
from fastapi.responses import HTMLResponse


def build_landing_page() -> str:
    return """
    <!doctype html>
    <html lang=\"en\">
      <head>
        <meta charset=\"utf-8\" />
        <title>AI Productivity Platform</title>
        <meta name=\"description\" content=\"Turn prompts, agents, and workflows into a monetizable AI product.\" />
        <style>
          body { font-family: Inter, Arial, sans-serif; margin: 0; background: #07111f; color: #f5f7fa; }
          .hero { max-width: 1000px; margin: 0 auto; padding: 4rem 1.5rem; }
          .card { background: #111d31; border: 1px solid #23324d; border-radius: 14px; padding: 1.3rem; margin-top: 1rem; }
          .btn { display: inline-block; background: #4f8cff; color: white; padding: 0.8rem 1rem; border-radius: 999px; text-decoration: none; margin-top: 0.8rem; }
          ul { line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class=\"hero\">
          <h1>Turn AI prompts into a real product</h1>
          <p>Launch a professional assistant experience, monetize with premium access, and grow via affiliate and sponsored prompt packs.</p>
          <a class=\"btn\" href=\"/prompts\">Explore the platform</a>
          <div class=\"card\">
            <h2>Why this can become profitable</h2>
            <ul>
              <li>Freemium assistant experience for users</li>
              <li>Premium prompt packs and workflows</li>
              <li>Affiliate revenue from AI tools and services</li>
              <li>Scalable SaaS foundation from day one</li>
            </ul>
          </div>
          <div class=\"card\">
            <h2>Launch strategy</h2>
            <p>Start with a free experience, collect users, then introduce premium features once you have traction.</p>
          </div>
        </div>
      </body>
    </html>
    """
