"use strict";

document.addEventListener("DOMContentLoaded", async function () {
    const gameBoard = document.querySelector("#gameboard");
    const infoDisplay = document.querySelector("#info");
    const socket = io();
    const startCells = [
        "", "", "",
        "", "", "",
        "", "", "",
    ];
    let go = "circle";
    let gameActive = false;

    infoDisplay.textContent = "Circle Goes First";

    function setBoardEnabled(enabled) {
        const allSquares = document.querySelectorAll(".square");
        allSquares.forEach(square => {
            if (enabled) {
                if (!square.hasChildNodes()) {
                    square.addEventListener('click', addGo);
                }
            } else {
                square.removeEventListener('click', addGo);
            }
        });
    }

    function createBoard() {
        gameBoard.innerHTML = "";
        startCells.forEach((cell, index) => {
            const cellElement = document.createElement("div");
            cellElement.classList.add("square");
            cellElement.id = index;
            cellElement.addEventListener('click', addGo);
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

            if (circleWins) {
                infoDisplay.textContent = "Circle Wins!";
                allSquares.forEach(square => square.replaceWith(square.cloneNode(true)));
            }
        });

        winningCombos.forEach(array => {
            const crossWins = array.every(cell => allSquares[cell].firstChild?.classList.contains("cross"));
            if (crossWins) {
                infoDisplay.textContent = "Cross Wins!";
                allSquares.forEach(square => square.replaceWith(square.cloneNode(true)));
            }
        });
    }

    document.querySelector("#reload-btn").addEventListener("click", () => {
        window.location.reload();
    });

    let gameCode = "";
    let isPlayerTurn = true;

    document.getElementById("create-btn").addEventListener("click", async () => {
        const res = await fetch("http://localhost:5000/create_game", {method: "POST"});
        const data = await res.json();
        gameCode = data.game_code;
        alert("Share this code with a friend: " + gameCode);
        socket.emit("join_game", {game_code: gameCode});
        createBoard();
        setBoardEnabled(false);
        infoDisplay.textContent = "Waiting for opponent to join...";
    });

    document.getElementById("join-btn").addEventListener("click", () => {
        gameCode = document.getElementById("invite-code").value;
        socket.emit("join_game", {game_code: gameCode});
        createBoard();
        setBoardEnabled(false);
        infoDisplay.textContent = "Joining game...";
    });

    document.getElementById("leave-btn").addEventListener("click", () => {
        if (!gameCode) {
            infoDisplay.textContent = "No game to leave.";
            return;
        }
        socket.emit("leave_game", {game_code: gameCode});
        gameActive = false;
        setBoardEnabled(false);
        infoDisplay.textContent = "You left the game.";
        gameCode = "";
    });

    socket.on("joined", (data) => {
        const myId = socket.id;
        isPlayerTurn = data.players[0] === myId;
        go = isPlayerTurn ? "circle" : "cross";
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
        infoDisplay.textContent = data.message || "You left the game.";
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

        socket.emit("move", {code: gameCode, index: cell.id, player: go});
        go = go === "circle" ? "cross" : "circle";
        document.getElementById("info").textContent = "It's " + go + "'s turn";
        isPlayerTurn = false;
        setBoardEnabled(false);
        checkScore();
    }

    createBoard();
});
