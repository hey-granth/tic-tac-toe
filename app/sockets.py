from flask_socketio import emit, join_room, leave_room
from .game_state import save_game, load_game, delete_game

def register_socketio_events(socketio):
    @socketio.on('join_game')
    def handle_join_game(data):
        game_code = data.get('game_code')
        player_id = data.get('player_id')
        if not player_id:
            emit('error', {'message': 'Missing player ID'})
            return

        game = load_game(game_code)
        if not game:
            game = {'players': [player_id]}
            save_game(game_code, game)
            join_room(game_code)
            emit('joined_game', {'message': f'New game {game_code} created. Player {player_id} joined.'}, room=game_code)
            return

        if player_id in game['players']:
            # Already joined, rejoining session
            join_room(game_code)
            emit('joined_game', {'message': f'Player {player_id} rejoined game {game_code}'}, room=game_code)
            return

        if len(game['players']) >= 2:
            emit('error', {'message': 'Game is full'})
            return

        join_room(game_code)
        game['players'].append(player_id)
        save_game(game_code, game)
        emit('joined_game', {'message': f'Player {player_id} joined game {game_code}'}, room=game_code)


    @socketio.on('leave_game')
    def handle_leave_game(data):
        game_code = data.get('game_code')
        player_id = data.get('player_id')

        if not game_code or not player_id:
            emit('error', {'message': 'Missing game_code or player_id'})
            return

        game = load_game(game_code)
        if not game:
            emit('error', {'message': 'Game not found'})
            return

        leave_room(game_code)

        if player_id in game['players']:
            game['players'].remove(player_id)
            if not game['players']:
                delete_game(game_code)
            else:
                save_game(game_code, game)
            emit('left_game', {'message': f'Player {player_id} left game {game_code}'}, room=game_code)
        else:
            emit('error', {'message': 'Player not found in game'})

    @socketio.on('move')
    def handle_move(data):
        game_code = data.get("code")  # updated to match frontend's `code`
        if not game_code:
            emit('error', {'message': 'Missing game code for move'})
            return
        emit("move", data, room=game_code, include_self=False)
