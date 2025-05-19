import eventlet
eventlet.monkey_patch()
# This is a workaround for the issue with Flask-SocketIO and eventlet


from app import create_app, socketio

app = create_app()

if __name__ == "__main__":
    socketio.run(app, debug=True)