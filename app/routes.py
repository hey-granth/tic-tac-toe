from .game_state import save_game, load_game, delete_game
from flask import Blueprint, jsonify, request, render_template, current_app
import random, string

bp = Blueprint('main', __name__)

def generate_code(length=6):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))


@bp.route("/")
def index():
    print("Template folder:", current_app.template_folder)
    return render_template("index.html")

@bp.route('/create_game', methods=['POST'])
def create_game():
    game_code = generate_code()
    save_game(game_code, {'players': [], 'state': 'waiting'})
    return jsonify({'game_code': game_code}), 201

@bp.route('/join_game/<game_code>', methods=['POST'])
def join_game(game_code):
    game = load_game(game_code)
    if not game:
        return jsonify({'error': 'Game not found'}), 404

    if len(game['players']) >= 2:
        return jsonify({'error': 'Game is full'}), 403



    player_id = generate_code(8)
    game['players'].append(player_id)
    save_game(game_code, game)
    return jsonify({'player_id': player_id}), 200


@bp.route('/leave_game/<game_code>', methods=['POST'])
def leave_game(game_code):
    game = load_game(game_code)
    if not game:
        return jsonify({'error': 'Game not found'}), 404

    player_id = request.json.get('player_id')
    if player_id not in game['players']:
        return jsonify({'error': 'Player not found in game'}), 404

    game['players'].remove(player_id)

    if not game['players']:
        delete_game(game_code)
    else:
        save_game(game_code, game)

    return jsonify({'message': 'Player left the game'}), 200
