"use strict";

document.addEventListener("DOMContentLoaded", async function () {
    const gameBoard = document.querySelector("#gameboard");
    const infoDisplay = document.querySelector("#info");
    const socket = io();

    // Persistent player ID
    let playerId = localStorage.getItem("player_id");
    if (!playerId) {
        playerId = crypto.randomUUID();
        localStorage.setItem("player_id", playerId);
    }

    const startCells = ["", "", "", "", "", "", "", "", ""];
    let go = "circle";
    let gameActive = false;
    let gameCode = "";
    let isPlayerTurn = true;

    infoDisplay.textContent = "Circle Goes First";

    function setBoardEnabled(enabled) {
        const allSquares = document.querySelectorAll(".square");
        allSquares.forEach(square => {
            if (enabled && !square.hasChildNodes()) {
                square.addEventListener('click', addGo);
            } else {
                square.removeEventListener('click', addGo);
            }
        });
    }

    function createBoard() {
        gameBoard.innerHTML = "";
        startCells.forEach((_, index) => {
            const cellElement = document.createElement("div");
            cellElement.classList.add("square");
            cellElement.id = index;
            cellElement.addEventListener("click", addGo);
            gameBoard.append(cellElement);
        });
        setBoardEnabled(false);
    }

    function checkScore() {
        const allSquares = document.querySelectorAll(".square");
        const winningCombos = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        winningCombos.forEach(array => {
            const circleWins = array.every(cell => allSquares[cell].firstChild?.classList.contains("circle"));
            const crossWins = array.every(cell => allSquares[cell].firstChild?.classList.contains("cross"));

            if (circleWins) {
                infoDisplay.textContent = "Circle Wins!";
                gameActive = false;
                setBoardEnabled(false);
            }

            if (crossWins) {
                infoDisplay.textContent = "Cross Wins!";
                gameActive = false;
                setBoardEnabled(false);
            }
        });
    }

    document.querySelector("#reload-btn").addEventListener("click", () => {
        window.location.reload();
    });

    document.getElementById("create-btn").addEventListener("click", async () => {
        const res = await fetch("/create_game", { method: "POST" });
        const data = await res.json();
        gameCode = data.game_code;
        alert("Share this code with a friend: " + gameCode);
        socket.emit("join_game", { game_code: gameCode, player_id: playerId });
        createBoard();
        infoDisplay.textContent = "Waiting for opponent to join...";
    });

    document.getElementById("join-btn").addEventListener("click", () => {
        gameCode = document.getElementById("invite-code").value;
        if (!gameCode) return alert("Please enter a code to join.");
        socket.emit("join_game", { game_code: gameCode, player_id: playerId });
        createBoard();
        infoDisplay.textContent = "Joining game...";
    });

    document.getElementById("leave-btn").addEventListener("click", () => {
        if (!gameCode) {
            infoDisplay.textContent = "No game to leave.";
            return;
        }
        socket.emit("leave_game", { game_code: gameCode, player_id: playerId });
        gameActive = false;
        setBoardEnabled(false);
        infoDisplay.textContent = "You left the game.";
        gameCode = "";
    });

    socket.on("joined", (data) => {
        const players = data.players || [];
        go = players[0] === playerId ? "circle" : "cross";
        isPlayerTurn = go === "circle";
        gameActive = true;

        setBoardEnabled(isPlayerTurn);
        infoDisplay.textContent = isPlayerTurn
            ? "You go first (Circle)"
            : "Opponent goes first (Circle)";
    });

    socket.on("move", (data) => {
        const cell = document.getElementById(data.index);
        if (!cell.hasChildNodes()) {
            const piece = document.createElement("div");
            piece.classList.add(data.player);
            cell.appendChild(piece);
            cell.removeEventListener("click", addGo);
        }
        go = go === "circle" ? "cross" : "circle";
        document.getElementById("info").textContent = "It's " + go + "'s turn";
        isPlayerTurn = true;
        setBoardEnabled(isPlayerTurn && gameActive);
    });

    socket.on("left_game", (data) => {
        infoDisplay.textContent = data.message || "Opponent left the game.";
        gameActive = false;
        setBoardEnabled(false);
        gameCode = "";
    });

    socket.on("error", (data) => {
        infoDisplay.textContent = data.message || "An error occurred.";
    });

    function addGo(e) {
        if (!isPlayerTurn || !gameActive) return;

        const cell = e.target;
        const piece = document.createElement("div");
        piece.classList.add(go);
        cell.appendChild(piece);
        cell.removeEventListener("click", addGo);

        socket.emit("move", { code: gameCode, index: cell.id, player: go });
        go = go === "circle" ? "cross" : "circle";
        document.getElementById("info").textContent = "It's " + go + "'s turn";
        isPlayerTurn = false;
        setBoardEnabled(false);
        checkScore();
    }

    createBoard();
});
