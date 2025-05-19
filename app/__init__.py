import os
from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS

# redis message queue config
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/')

socketio = SocketIO(cors_allowed_origins="*", message_queue=REDIS_URL, async_mode='eventlet')

def create_app():
    base_dir = os.path.abspath(os.path.dirname(__file__))  # path to app/
    template_dir = os.path.join(base_dir, '..', 'templates')  # go up one level and into templates/
    static_dir = os.path.join(base_dir, '..', 'static')     # similarly for static files

    app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)
    CORS(app)
    socketio.init_app(app)

    from .routes import bp as routes_bp
    from .sockets import register_socketio_events

    app.register_blueprint(routes_bp)
    register_socketio_events(socketio)

    return app