"""Non-user, isolate-local diagnostics; never a cache or correctness dependency."""
import uuid

_instance = None
_calls = 0


def stamp():
    global _instance, _calls
    # Initialize at request time: top-level values are copied into every snapshot.
    if _instance is None:
        _instance = str(uuid.uuid4())
    _calls += 1
    return _instance, _calls
