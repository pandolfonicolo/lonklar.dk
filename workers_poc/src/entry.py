"""Isolated Python Workers proof; Oracle's api.main remains the production app."""
from workers import asgi
from app import app

Default = asgi.entrypoint(app)
