"""Isolated Python Workers proof; Oracle's api.main remains the production app."""
from workers import asgi
from app import app

async def on_fetch(request, env, ctx):
    # The class entrypoint constructs a Python instance for each request through
    # initPyInstance/doPyCall(promising=True). Under overlapping requests that
    # path raises Pyodide's nested-promising-task SystemError before ASGI runs.
    # The supported global handler calls the same ASGI adapter directly.
    # A legacy handler receives raw JS bindings. Use the public SDK accessor so
    # D1 parameters/results retain the same conversion as WorkerEntrypoint.env.
    from workers import env as bindings
    return await asgi.fetch(app, request, bindings, ctx)
