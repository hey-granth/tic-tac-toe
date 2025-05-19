from .game_state import games
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
    games[game_code] = {'players': [], 'state': 'waiting'}
    return jsonify({'game_code': game_code}), 201

@bp.route('/join_game/<game_code>', methods=['POST'])
def join_game(game_code):
    if game_code not in games:
        return jsonify({'error': 'Game not found'}), 404

    player_id = generate_code(8)
    games[game_code]['players'].append(player_id)
    return jsonify({'player_id': player_id}), 200


@bp.route('/leave_game/<game_code>', methods=['POST'])
def leave_game(game_code):
    if game_code not in games:
        return jsonify({'error': 'Game not found'}), 404

    player_id = request.json.get('player_id')
    if player_id not in games[game_code]['players']:
        return jsonify({'error': 'Player not found in game'}), 404

    games[game_code]['players'].remove(player_id)
    return jsonify({'message': 'Player left the game'}), 200

