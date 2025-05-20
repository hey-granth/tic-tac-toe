import eventlet
eventlet.monkey_patch()
# This is a workaround for the issue with Flask-SocketIO and eventlet


from app import create_app, socketio
from eventlet import wsgi

app = create_app()

if __name__ == "__main__":
    # socketio.run(app, debug=True)
    # Use eventlet's WSGI server to run the app
    wsgi.server(eventlet.listen(('',10000)), app)