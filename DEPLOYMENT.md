# Deployment guide

## Local development

1. Copy .env.example to .env.
2. Install dependencies with `pip install -r requirements.txt`.
3. Start the app with `uvicorn app.main:app --host 0.0.0.0 --port 8000`.

## Docker

Build the image:

```bash
docker build -t system-prompts-platform .
```

Run the container:

```bash
docker run -p 8000:8000 --env-file .env system-prompts-platform
```

## Production notes

- Use a real managed database for production workloads.
- Add authentication and admin access for secure operations.
- Configure a reverse proxy and HTTPS for public deployment.
