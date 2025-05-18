"use strict";

const gameBoard = document.querySelector("#gameboard");   // looks for an id of gameboard in the HTML file
const infoDisplay = document.querySelector("#info"); // looks for an id of info in the HTML file
const startCells = [
    "", "", "",
    "", "", "",
    "", "", "",
];
let go = "circle";

infoDisplay.textContent = "Circle Goes First";

function createBoard() {
    startCells.forEach((cell, index) => {
        const cellElement = document.createElement("div");  // creates a div element
        cellElement.classList.add("square");    // adds a class of square to the cellElement
        cellElement.id = index;
        cellElement.addEventListener('click', addGo);
        // const circleElement = document.createElement("div");
        // cellElement.classList.add("cross");
    //   cellElement.innerHTML = index;  // inner HTML is the index of the cell
        // innerHTML is the property that sets or gets the HTML content of an element
        // This line of code puts a number (stored in the variable index) inside an HTML element (like a box or container and here, square) that's referenced by cellElement.
        // cellElement.append(circleElement);  // appends the circleElement to the cellElement
        gameBoard.append(cellElement);  // appends the cellElement to the gameBoard
    })
}

function addGo(e) {
    console.log("clicked", e.target);
    const goDisplay = document.createElement("div");
    goDisplay.classList.add(go);
    // this line of code creates a new div element and assigns it the class name stored in the variable go (which is either "circle" or "cross").
    e.target.append(goDisplay);  // appends the goDisplay to the target element that was clicked
    go = go === "circle" ? "cross" : "circle";  // this line of code switches the value of go between "circle" and "cross" (used ternary operator)
    console.log(go);
    infoDisplay.textContent = "It's " + go + "'s turn";
    e.target.removeEventListener("click", addGo);  // this line of code removes the event listener so that the same cell can't be clicked again
    checkScore();
}

function checkScore() {
    const allSquares = document.querySelectorAll(".square");  // selects all elements with the class square
    const winningCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // horizontal
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // vertical
        [0, 4, 8], [2, 4, 6] // diagonal
    ];
    
    winningCombos.forEach(array => {
        const circleWins = array.every(cell => allSquares[cell].firstChild?.classList.contains("circle")); // checks if every cell in the array has a child element with the class circle
        // a child element is simply something that is inside another element. For example, if you have a <div> with a <p> inside it, the <p> is a child of the <div>.
        // when i append() the circle element to the cell, it becomes a child of that cell.
        
        if (circleWins) {
            infoDisplay.textContent = "Circle Wins!";
            allSquares.forEach(square => square.replaceWith(square.cloneNode(true))); // this line of code replaces each square with a clone of itself
        }
    });

    winningCombos.forEach(array => {
        const crossWins = array.every(cell => allSquares[cell].firstChild?.classList.contains("cross")); // checks if every cell in the array has a child element with the class cross
        if (crossWins) {
            infoDisplay.textContent = "Cross Wins!";
            allSquares.forEach(square => square.replaceWith(square.cloneNode(true)));
        }
    });
}

createBoard();