
# 🕹️ Real-time Multiplayer Tic Tac Toe

A web-based real-time multiplayer Tic Tac Toe game built with **Flask**, **Flask-SocketIO**, and **Eventlet**. Play with friends using an invite code – no registration required!

---

## Deployed Services:
- Static - [Vercel Link](https://tic-tac-toe-mu-rouge.vercel.app/)
- Dynamic - [Render Link](https://tic-tac-toe-8wlk.onrender.com/)
---

## 🚀 Features

- 🔁 Real-time two-player game using WebSockets
- 🎮 Unique invite codes for private game rooms
- 🧠 Game state management with Python
- ⚡ Fast and lightweight with Flask + Socket.IO
- 🎨 Simple and clean frontend using HTML, CSS, and vanilla JS

---

## 🛠️ Tech Stack

- **Backend:** Flask, Flask-SocketIO, Eventlet
- **Frontend:** HTML, CSS, JavaScript (Socket.IO client)
- **Deployment:** Render

---

## 📁 Project Structure

```
.
├── app
│   ├── game_state.py
│   ├── __init__.py
│   ├── routes.py
│   └── sockets.py
├── poetry.lock
├── Procfile
├── pyproject.toml
├── README.md
├── requirements.txt
├── run.py
├── static
│   ├── app.js
│   ├── socket.io.min.js
│   └── styles.css
└── templates
    └── index.html
```

---

## 🧪 Local Development

### 1. Clone the repo

```bash
git clone https://github.com/your-username/tic-tac-toe.git
cd tic-tac-toe
```

### 2. Install dependencies

If using **Poetry**:

```bash
poetry install
poetry shell
```

Or with **pip**:

```bash
pip install -r requirements.txt
```

### 3. Run the app

```bash
python run.py
```

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.

---

## 📄 License

MIT License

---

## 👨‍💻 Author

Built by [Granth Agarwal](https://github.com/hey-granth) 🔥