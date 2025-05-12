// Game state
const gameState = {
    board: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    currentPlayer: -1, // -1 for X, 1 for O
    gameMode: null, // 'single' or 'multi'
    playerGoesFirst: true,
    gameOver: false,
    playerSymbol: -1, // -1 for X (default), 1 for O
    computerSymbol: 1 // 1 for O (default), -1 for X
};

// DOM Elements
const cells = document.querySelectorAll('.cell');
const currentPlayerDisplay = document.getElementById('current-player');
const resetButton = document.getElementById('reset-btn');
const gameModeModal = document.getElementById('game-mode-modal');
const playerOrderModal = document.getElementById('player-order-modal');
const winnerModal = document.getElementById('winner-modal');
const winnerMessage = document.getElementById('winner-message');
const countdown = document.getElementById('countdown');

// Initialize the game
function initGame() {
    // Show game mode selection modal
    gameModeModal.style.display = 'flex';
    
    // Event listeners for game mode selection
    document.getElementById('single-player-btn').addEventListener('click', () => {
        gameState.gameMode = 'single';
        gameModeModal.style.display = 'none';
        playerOrderModal.style.display = 'flex';
    });
    
    document.getElementById('multi-player-btn').addEventListener('click', () => {
        gameState.gameMode = 'multi';
        gameModeModal.style.display = 'none';
        startGame();
    });
    
    // Event listeners for player order (single player mode)
    document.getElementById('play-first-btn').addEventListener('click', () => {
        gameState.playerGoesFirst = true;
        gameState.playerSymbol = -1; // X
        gameState.computerSymbol = 1; // O
        playerOrderModal.style.display = 'none';
        startGame();
    });
    
    document.getElementById('play-second-btn').addEventListener('click', () => {
        gameState.playerGoesFirst = false;
        gameState.playerSymbol = 1; // O
        gameState.computerSymbol = -1; // X
        playerOrderModal.style.display = 'none';
        startGame();
        // If player chose to go second, computer makes first move
        setTimeout(computerMove, 500);
    });
    
    // Reset button event listener
    resetButton.addEventListener('click', resetGame);
    
    // Add click event listeners to all cells
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
}

// Start the game
function startGame() {
    resetBoard();
    updateDisplay();
}

// Handle cell click
function handleCellClick(event) {
    if (gameState.gameOver) return;
    
    // In single player mode, only allow moves when it's the player's turn
    if (gameState.gameMode === 'single' && gameState.currentPlayer !== gameState.playerSymbol) {
        return;
    }
    
    const cell = event.target;
    const index = parseInt(cell.getAttribute('data-index'));
    
    // Check if cell is already taken
    if (gameState.board[index] !== 0) return;
    
    // Update the board
    makeMove(index);
    
    // Check for win or draw
    const result = analyzeBoard();
    if (result !== 0 || isBoardFull()) {
        endGame(result);
        return;
    }
    
    // If single player mode and it's computer's turn
    if (gameState.gameMode === 'single' && gameState.currentPlayer === gameState.computerSymbol) {
        setTimeout(computerMove, 500);
    }
}

// Make a move
function makeMove(index) {
    gameState.board[index] = gameState.currentPlayer;
    updateDisplay();
    gameState.currentPlayer *= -1; // Switch player
}

// Computer's move using minimax algorithm
function computerMove() {
    if (gameState.gameOver) return;
    
    const bestMove = findBestMove();
    makeMove(bestMove);
    
    // Check for win or draw after computer's move
    const result = analyzeBoard();
    if (result !== 0 || isBoardFull()) {
        endGame(result);
    }
}

// Find best move using minimax algorithm
function findBestMove() {
    let bestVal = -Infinity;
    let bestMove = -1;
    
    // Try all possible moves
    for (let i = 0; i < 9; i++) {
        if (gameState.board[i] === 0) {
            // Make the move
            gameState.board[i] = gameState.computerSymbol;
            
            // Compute evaluation function for this move
            const moveVal = minimax(gameState.board, 0, false);
            
            // Undo the move
            gameState.board[i] = 0;
            
            // If the value of the current move is more than the best value,
            // then update best value and best move
            if (moveVal > bestVal) {
                bestVal = moveVal;
                bestMove = i;
            }
        }
    }
    
    return bestMove;
}

// Minimax algorithm
function minimax(board, depth, isMaximizing) {
    // Check if game is over
    const result = analyzeBoard();
    
    // Return value based on who won
    if (result !== 0) {
        if (result === gameState.computerSymbol) {
            return 10 - depth;
        } else if (result === gameState.playerSymbol) {
            return depth - 10;
        }
    }
    
    // If it's a draw
    if (isBoardFull()) {
        return 0;
    }
    
    if (isMaximizing) {
        let bestVal = -Infinity;
        
        // Try all possible moves
        for (let i = 0; i < 9; i++) {
            if (board[i] === 0) {
                // Make the move (computer's turn)
                board[i] = gameState.computerSymbol;
                
                // Recur and find maximum of all possible moves
                bestVal = Math.max(bestVal, minimax(board, depth + 1, !isMaximizing));
                
                // Undo the move
                board[i] = 0;
            }
        }
        
        return bestVal;
    } else {
        let bestVal = Infinity;
        
        // Try all possible moves
        for (let i = 0; i < 9; i++) {
            if (board[i] === 0) {
                // Make the move (player's turn)
                board[i] = gameState.playerSymbol;
                
                // Recur and find minimum of all possible moves
                bestVal = Math.min(bestVal, minimax(board, depth + 1, !isMaximizing));
                
                // Undo the move
                board[i] = 0;
            }
        }
        
        return bestVal;
    }
}

// Analyze the board to check for a winner
function analyzeBoard() {
    const winCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    
    for (const combo of winCombos) {
        const [a, b, c] = combo;
        if (gameState.board[a] !== 0 && 
            gameState.board[a] === gameState.board[b] && 
            gameState.board[b] === gameState.board[c]) {
            return gameState.board[a];
        }
    }
    
    return 0; // No winner yet
}

// Check if the board is full
function isBoardFull() {
    return !gameState.board.includes(0);
}

// End the game and show result
function endGame(result) {
    gameState.gameOver = true;
    
    // Show the winner or draw message
    if (result === 0) {
        winnerMessage.textContent = "It's a Draw!";
        winnerMessage.className = '';
    } else if (result === gameState.playerSymbol) {
        winnerMessage.textContent = "You Win!";
        winnerMessage.className = gameState.playerSymbol === -1 ? 'x-win' : 'o-win';
    } else {
        winnerMessage.textContent = "Computer Wins!";
        winnerMessage.className = gameState.computerSymbol === -1 ? 'x-win' : 'o-win';
    }
    
    // Show the winner modal
    winnerModal.style.display = 'flex';
    
    // Reset game after 5 seconds
    let secondsLeft = 5;
    countdown.textContent = secondsLeft;
    
    const countdownInterval = setInterval(() => {
        secondsLeft--;
        countdown.textContent = secondsLeft;
        
        if (secondsLeft <= 0) {
            clearInterval(countdownInterval);
            winnerModal.style.display = 'none';
            resetGame();
        }
    }, 1000);
}

// Reset the game
function resetGame() {
    gameState.gameOver = false;
    resetBoard();
    
    if (gameState.gameMode === 'single' && !gameState.playerGoesFirst) {
        setTimeout(computerMove, 500);
    }
}

// Reset the board
function resetBoard() {
    gameState.board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    gameState.currentPlayer = -1; // X always starts
    updateDisplay();
}

// Update the display based on the current game state
function updateDisplay() {
    // Update cells
    cells.forEach((cell, index) => {
        cell.setAttribute('data-value', gameState.board[index]);
        
        if (gameState.board[index] === -1) {
            cell.textContent = 'X';
            cell.className = 'cell x';
        } else if (gameState.board[index] === 1) {
            cell.textContent = 'O';
            cell.className = 'cell o';
        } else {
            cell.textContent = '';
            cell.className = 'cell';
        }
    });
    
    // Update current player display
    if (gameState.currentPlayer === -1) {
        currentPlayerDisplay.textContent = 'X';
        currentPlayerDisplay.className = 'current-player-x';
    } else {
        currentPlayerDisplay.textContent = 'O';
        currentPlayerDisplay.className = 'current-player-o';
    }
}

// Start the game when the page loads
window.addEventListener('DOMContentLoaded', initGame);