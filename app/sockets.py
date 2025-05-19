from flask_socketio import emit, join_room, leave_room
from flask import request
from .game_state import save_game, load_game, delete_game

def register_socketio_events(socketio):
    @socketio.on('join_game')
    def handle_join_game(data):
        game_code = data.get('game_code')
        sid = request.sid   # Get the session ID of the client
        game = load_game(game_code)
        if not game:
            game = {'players': [sid]}
            save_game(game_code, game)
            join_room(game_code)
            emit('joined_game', {'message': f'New game {game_code} created. Player {sid} joined.'}, room=game_code)
            return

        if len(game['players']) >= 2:
            emit('error', {'message': 'Game is full'})
            return

        join_room(game_code)
        if sid not in game['players']:
            game['players'].append(sid)
            save_game(game_code, game)
        emit('joined_game', {'message': f'Player {sid} joined game {game_code}'}, room=game_code)

    @socketio.on('leave_game')
    def handle_leave_game(data):
        game_code = data.get('game_code')
        game = load_game(game_code)
        sid = request.sid
        if not game:
            emit('error', {'message': 'Game not found'})
            return

        leave_room(game_code)
        if sid in game['players']:
            game['players'].remove(sid)
            if not game['players']:
                delete_game(game_code)
            emit('left_game', {'message': f'Player {sid} left game {game_code}'}, room=game_code)
        else:
            emit('error', {'message': 'Player not found in game'})

    @socketio.on('move')
    def handle_move(data):
        game_code = data.get("game_code")
        emit("move", data, room=game_code, include_self=False)
