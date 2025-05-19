import json
from redis import Redis
from os import getenv

REDIS_URL = getenv("REDIS_URL", "redis://localhost:6379/")
r = Redis.from_url(REDIS_URL, decode_responses=True, ssl=REDIS_URL.startswith("rediss://") )

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