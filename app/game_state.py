import json
from redis import Redis, connection
from os import getenv

REDIS_URL = getenv("REDIS_URL", "redis://localhost:6379/")

# Upstash workaround: Use SSL=True but apply it via `ConnectionPool` options
connection_kwargs = {
    "decode_responses": True
}

if REDIS_URL.startswith("rediss://"):
    connection_kwargs["connection_class"] = connection.SSLConnection

r = Redis.from_url(REDIS_URL, **connection_kwargs)
def save_game(code, data, expiry=3600):
    r.set(code, json.dumps(data), ex=expiry)

def load_game(code):
    game = r.get(code)
    if game:
        try:
            return json.loads(game)
        except json.decoder.JSONDecodeError:
            print(f'[!] Corrupted game data for {code}')
    return None

def delete_game(code):
    r.delete(code)