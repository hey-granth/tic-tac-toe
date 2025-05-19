from flask_socketio import emit, join_room, leave_room
from flask import request
from .game_state import games

def register_socketio_events(socketio):
    @socketio.on('join_game')
    def handle_join_game(data):
        game_code = data.get('game_code')
        sid = request.sid   # Get the session ID of the client
        if game_code not in games:
            emit('error', {'message': 'Game not found'})
            return
        if len(games[game_code]['players']) >= 2:
            emit('error', {'message': 'Game is full'})
            return

        join_room(game_code)
        if sid not in games[game_code]['players']:
            games[game_code]['players'].append(sid)
        emit('joined_game', {'message': f'Player {sid} joined game {game_code}'}, room=game_code)

    @socketio.on('leave_game')
    def handle_leave_game(data):
        game_code = data.get('game_code')
        sid = request.sid
        if game_code not in games:
            emit('error', {'message': 'Game not found'})
            return

        leave_room(game_code)
        if sid in games[game_code]['players']:
            games[game_code]['players'].remove(sid)
            emit('left_game', {'message': f'Player {sid} left game {game_code}'}, room=game_code)
        else:
            emit('error', {'message': 'Player not found in game'})

    @socketio.on('move')
    def handle_move(data):
        game_code = data.get("game_code")
        emit("move", data, room=game_code, include_self=False)

