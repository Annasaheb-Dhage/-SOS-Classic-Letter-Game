const SoundManager = {
    sounds: {
        click: { url: 'https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3', volume: 0.5 },
        score: { url: 'https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3', volume: 0.7 },
        win: { url: 'https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3', volume: 1.0 },
        draw: { url: 'https://assets.mixkit.co/sfx/preview/mixkit-neutral-game-notification-951.mp3', volume: 0.6 },
        move: { url: 'https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3', volume: 1.0 },
        error: { url: 'https://assets.mixkit.co/sfx/preview/mixkit-arcade-retro-notification-225.mp3', volume: 0.6 }
    },
    audioElements: {},
    enabled: true,

    init() {
        Object.keys(this.sounds).forEach(key => {
            this.audioElements[key] = new Audio(this.sounds[key].url);
            this.audioElements[key].volume = this.sounds[key].volume;
            this.audioElements[key].load();
        });
    },

    play(type) {
        if (!this.enabled || !gameState.settings.soundsEnabled) return;

        try {
            const sound = this.audioElements[type];
            if (!sound) return;

            const clone = sound.cloneNode();
            clone.volume = this.sounds[type].volume;
            clone.play().catch(e => console.log('Audio playback failed:', e));
        } catch (e) {
            console.log('Sound error:', e);
        }
    },

    toggle(enable) {
        this.enabled = enable;
        if (enable) this.play('click');
    },

    setVolume(type, volume) {
        if (this.sounds[type]) {
            this.sounds[type].volume = volume;
            if (this.audioElements[type]) {
                this.audioElements[type].volume = volume;
            }
        }
    }
};

SoundManager.init();

// Game State
const gameState = {
    boardSize: 3,
    difficulty: 'easy',
    gameMode: 'pvp',
    currentPlayer: 1,
    board: [],
    scores: [0, 0],
    gameActive: false,
    highScore: localStorage.getItem('sosHighScore') || 0,
    timer: 0,
    timerInterval: null,
    settings: {
        soundsEnabled: true,
        timerEnabled: true,
        hintsEnabled: false,
        selectedLetter: null
    }
};

// DOM Elements
const elements = {
    menuScreen: document.querySelector('.menu-screen'),
    gameScreen: document.querySelector('.game-screen'),
    resultScreen: document.querySelector('.result-screen'),
    boardSizeSelect: document.getElementById('board-size'),
    difficultySelect: document.getElementById('difficulty'),
    gameModeInputs: document.querySelectorAll('input[name="game-mode"]'),
    startButton: document.getElementById('start-game'),
    difficultyGroup: document.getElementById('difficulty-group'),
    gameBoard: document.getElementById('game-board'),
    player1Info: document.getElementById('player1-info'),
    player2Info: document.getElementById('player2-info'),
    player1Score: document.getElementById('player1-score'),
    player2Score: document.getElementById('player2-score'),
    winnerName: document.getElementById('winner-name'),
    finalScore1: document.getElementById('final-score1'),
    finalScore2: document.getElementById('final-score2'),
    highScoreDisplay: document.getElementById('high-score'),
    restartButton: document.getElementById('restart-game'),
    returnMenuButton: document.getElementById('return-menu'),
    settingsIcon: document.getElementById('settings-icon'),
    settingsPanel: document.getElementById('settings-panel'),
    closeSettings: document.getElementById('close-settings'),
    letterSelection: document.getElementById('letter-selection'),
    selectS: document.getElementById('select-s'),
    selectO: document.getElementById('select-o'),
    soundToggle: document.getElementById('sound-toggle'),
    timerToggle: document.getElementById('timer-toggle'),
    hintsToggle: document.getElementById('hints-toggle'),
    restartDuringGame: document.getElementById('restart-during-game'),
    timerDisplay: document.getElementById('timer'),
    timerContainer: document.getElementById('timer-container')
};

// Game Initialization
function initGame() {
    elements.startButton.addEventListener('click', startGame);
    elements.restartButton.addEventListener('click', restartGame);
    elements.returnMenuButton.addEventListener('click', returnToMenu);
    elements.restartDuringGame.addEventListener('click', restartGame);
    
    setupGameModeToggle();
    loadSettings();
    setupSettingsPanel();
    
    elements.selectS.addEventListener('click', () => selectLetter('S'));
    elements.selectO.addEventListener('click', () => selectLetter('O'));
    
    updateHighScoreDisplay();
    updateTimerDisplay();
    
    setTimeout(() => {
        document.querySelector('.intro-animation').style.display = 'none';
    }, 4000);
}

// Game Functions
function selectLetter(letter) {
    SoundManager.play('click');
    gameState.settings.selectedLetter = letter;
    elements.selectS.classList.toggle('active', letter === 'S');
    elements.selectO.classList.toggle('active', letter === 'O');
    
    const activeBtn = letter === 'S' ? elements.selectS : elements.selectO;
    activeBtn.classList.add('pulse');
    setTimeout(() => {
        activeBtn.classList.remove('pulse');
    }, 300);
}

function setupSettingsPanel() {
    elements.settingsIcon.addEventListener('click', () => {
        SoundManager.play('click');
        elements.settingsPanel.classList.toggle('open');
    });
    
    elements.closeSettings.addEventListener('click', () => {
        SoundManager.play('click');
        elements.settingsPanel.classList.remove('open');
    });
    
    elements.soundToggle.addEventListener('change', () => {
        gameState.settings.soundsEnabled = elements.soundToggle.checked;
        saveSettings();
        SoundManager.toggle(gameState.settings.soundsEnabled);
    });
    
    elements.timerToggle.addEventListener('change', () => {
        gameState.settings.timerEnabled = elements.timerToggle.checked;
        saveSettings();
        updateTimerDisplay();
        SoundManager.play('click');
    });
    
    elements.hintsToggle.addEventListener('change', () => {
        gameState.settings.hintsEnabled = elements.hintsToggle.checked;
        saveSettings();
        SoundManager.play('click');
    });
}

function loadSettings() {
    const savedSettings = JSON.parse(localStorage.getItem('sosSettings')) || {};
    
    gameState.settings = {
        soundsEnabled: savedSettings.soundsEnabled !== undefined ? savedSettings.soundsEnabled : true,
        timerEnabled: savedSettings.timerEnabled !== undefined ? savedSettings.timerEnabled : true,
        hintsEnabled: savedSettings.hintsEnabled !== undefined ? savedSettings.hintsEnabled : false,
        selectedLetter: null
    };
    
    elements.soundToggle.checked = gameState.settings.soundsEnabled;
    elements.timerToggle.checked = gameState.settings.timerEnabled;
    elements.hintsToggle.checked = gameState.settings.hintsEnabled;
}

function saveSettings() {
    localStorage.setItem('sosSettings', JSON.stringify(gameState.settings));
    
    const saveConfirmation = document.createElement('div');
    saveConfirmation.className = 'save-confirmation';
    saveConfirmation.textContent = 'Settings Saved!';
    elements.settingsPanel.appendChild(saveConfirmation);
    
    setTimeout(() => {
        saveConfirmation.classList.add('show');
        setTimeout(() => {
            saveConfirmation.classList.remove('show');
            setTimeout(() => {
                elements.settingsPanel.removeChild(saveConfirmation);
            }, 300);
        }, 1500);
    }, 10);
}

function setupGameModeToggle() {
    elements.gameModeInputs.forEach(input => {
        input.addEventListener('change', function() {
            SoundManager.play('click');
            gameState.gameMode = this.value;
            
            if (this.value === 'pvc') {
                elements.difficultyGroup.classList.add('visible');
            } else {
                elements.difficultyGroup.classList.remove('visible');
            }
        });
    });
    
    if (document.querySelector('input[name="game-mode"]:checked').value === 'pvp') {
        elements.difficultyGroup.classList.remove('visible');
    }
}

function startGame() {
    SoundManager.play('click');
    stopTimer();
    
    gameState.boardSize = parseInt(elements.boardSizeSelect.value);
    gameState.difficulty = elements.difficultySelect.value;
    gameState.gameMode = document.querySelector('input[name="game-mode"]:checked').value;
    gameState.currentPlayer = 1;
    gameState.scores = [0, 0];
    gameState.gameActive = true;
    gameState.board = Array(gameState.boardSize * gameState.boardSize).fill('');
    gameState.settings.selectedLetter = null;
    gameState.timer = 0;
    
    updatePlayerInfo();
    updateScores();
    elements.letterSelection.style.display = 'flex';
    generateBoard();
    
    elements.menuScreen.style.display = 'none';
    elements.gameScreen.style.display = 'flex';
    elements.resultScreen.style.display = 'none';
    
    startTimer();
    
    if (gameState.gameMode === 'pvc' && gameState.currentPlayer === 2) {
        setTimeout(computerMove, 800);
    }
}

function generateBoard() {
    elements.gameBoard.innerHTML = '';
    elements.gameBoard.style.gridTemplateColumns = `repeat(${gameState.boardSize}, 1fr)`;
    
    const animationClass = gameState.boardSize <= 4 ? 'pop-in' : 'fade-in';
    
    for (let i = 0; i < gameState.boardSize * gameState.boardSize; i++) {
        const cell = document.createElement('div');
        cell.className = `cell ${animationClass}`;
        cell.dataset.index = i;
        cell.style.animationDelay = `${(i % gameState.boardSize) * 0.1}s`;
        cell.textContent = gameState.board[i];
        
        if (gameState.board[i] === 'S') cell.classList.add('S');
        if (gameState.board[i] === 'O') cell.classList.add('O');
        
        cell.addEventListener('click', () => handleCellClick(i));
        elements.gameBoard.appendChild(cell);
    }
}

function handleCellClick(index) {
    if (!gameState.gameActive || gameState.board[index] !== '') {
        SoundManager.play('error');
        return;
    }
    
    SoundManager.play('move');
    
    let letter;
    if (gameState.gameMode === 'pvp') {
        if (!gameState.settings.selectedLetter) {
            showNotification('Please select S or O first!');
            SoundManager.play('error');
            return;
        }
        letter = gameState.settings.selectedLetter;
    } else {
        if (!gameState.settings.selectedLetter) {
            showNotification('Please select S or O first!');
            SoundManager.play('error');
            return;
        }
        letter = gameState.settings.selectedLetter;
    }
    
    makeMove(index, letter);
    
    if (gameState.gameMode === 'pvc' && gameState.gameActive && gameState.currentPlayer === 2) {
        setTimeout(computerMove, 800);
    }
}

function makeMove(index, letter) {
    gameState.board[index] = letter;
    const cell = elements.gameBoard.children[index];
    cell.textContent = letter;
    cell.classList.add(letter);
    
    const sequencesFound = checkForSOS(index, letter);
    
    if (sequencesFound > 0) {
        gameState.scores[gameState.currentPlayer - 1] += sequencesFound;
        updateScores();
        highlightSOS(index);
        SoundManager.play('score');
    } else {
        gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
        updatePlayerInfo();
    }
    
    checkGameEnd();
}

function checkForSOS(index, letter) {
    const row = Math.floor(index / gameState.boardSize);
    const col = index % gameState.boardSize;
    let sequencesFound = 0;
    
    // Horizontal checks
    if (letter === 'S' && col >= 2) {
        if (gameState.board[index - 1] === 'O' && gameState.board[index - 2] === 'S') {
            sequencesFound++;
            gameState.board[index - 1] += '*';
            gameState.board[index - 2] += '*';
        }
    }
    if (letter === 'S' && col <= gameState.boardSize - 3) {
        if (gameState.board[index + 1] === 'O' && gameState.board[index + 2] === 'S') {
            sequencesFound++;
            gameState.board[index + 1] += '*';
            gameState.board[index + 2] += '*';
        }
    }
    if (letter === 'O' && col >= 1 && col <= gameState.boardSize - 2) {
        if (gameState.board[index - 1] === 'S' && gameState.board[index + 1] === 'S') {
            sequencesFound++;
            gameState.board[index - 1] += '*';
            gameState.board[index + 1] += '*';
        }
    }
    
    // Vertical checks
    if (letter === 'S' && row >= 2) {
        const up1 = index - gameState.boardSize;
        const up2 = index - 2 * gameState.boardSize;
        if (gameState.board[up1] === 'O' && gameState.board[up2] === 'S') {
            sequencesFound++;
            gameState.board[up1] += '*';
            gameState.board[up2] += '*';
        }
    }
    if (letter === 'S' && row <= gameState.boardSize - 3) {
        const down1 = index + gameState.boardSize;
        const down2 = index + 2 * gameState.boardSize;
        if (gameState.board[down1] === 'O' && gameState.board[down2] === 'S') {
            sequencesFound++;
            gameState.board[down1] += '*';
            gameState.board[down2] += '*';
        }
    }
    if (letter === 'O' && row >= 1 && row <= gameState.boardSize - 2) {
        const up = index - gameState.boardSize;
        const down = index + gameState.boardSize;
        if (gameState.board[up] === 'S' && gameState.board[down] === 'S') {
            sequencesFound++;
            gameState.board[up] += '*';
            gameState.board[down] += '*';
        }
    }
    
    // Diagonal checks (top-left to bottom-right)
    if (letter === 'S' && row >= 2 && col >= 2) {
        const upLeft1 = index - gameState.boardSize - 1;
        const upLeft2 = index - 2 * gameState.boardSize - 2;
        if (gameState.board[upLeft1] === 'O' && gameState.board[upLeft2] === 'S') {
            sequencesFound++;
            gameState.board[upLeft1] += '*';
            gameState.board[upLeft2] += '*';
        }
    }
    if (letter === 'S' && row <= gameState.boardSize - 3 && col <= gameState.boardSize - 3) {
        const downRight1 = index + gameState.boardSize + 1;
        const downRight2 = index + 2 * gameState.boardSize + 2;
        if (gameState.board[downRight1] === 'O' && gameState.board[downRight2] === 'S') {
            sequencesFound++;
            gameState.board[downRight1] += '*';
            gameState.board[downRight2] += '*';
        }
    }
    if (letter === 'O' && row >= 1 && row <= gameState.boardSize - 2 && 
        col >= 1 && col <= gameState.boardSize - 2) {
        const upLeft = index - gameState.boardSize - 1;
        const downRight = index + gameState.boardSize + 1;
        if (gameState.board[upLeft] === 'S' && gameState.board[downRight] === 'S') {
            sequencesFound++;
            gameState.board[upLeft] += '*';
            gameState.board[downRight] += '*';
        }
    }
    
    // Diagonal checks (top-right to bottom-left)
    if (letter === 'S' && row >= 2 && col <= gameState.boardSize - 3) {
        const upRight1 = index - gameState.boardSize + 1;
        const upRight2 = index - 2 * gameState.boardSize + 2;
        if (gameState.board[upRight1] === 'O' && gameState.board[upRight2] === 'S') {
            sequencesFound++;
            gameState.board[upRight1] += '*';
            gameState.board[upRight2] += '*';
        }
    }
    if (letter === 'S' && row <= gameState.boardSize - 3 && col >= 2) {
        const downLeft1 = index + gameState.boardSize - 1;
        const downLeft2 = index + 2 * gameState.boardSize - 2;
        if (gameState.board[downLeft1] === 'O' && gameState.board[downLeft2] === 'S') {
            sequencesFound++;
            gameState.board[downLeft1] += '*';
            gameState.board[downLeft2] += '*';
        }
    }
    if (letter === 'O' && row >= 1 && row <= gameState.boardSize - 2 && 
        col >= 1 && col <= gameState.boardSize - 2) {
        const upRight = index - gameState.boardSize + 1;
        const downLeft = index + gameState.boardSize - 1;
        if (gameState.board[upRight] === 'S' && gameState.board[downLeft] === 'S') {
            sequencesFound++;
            gameState.board[upRight] += '*';
            gameState.board[downLeft] += '*';
        }
    }
    
    return sequencesFound;
}

function highlightSOS(index) {
    for (let i = 0; i < gameState.board.length; i++) {
        if (gameState.board[i].includes('*')) {
            const cell = elements.gameBoard.children[i];
            cell.style.backgroundColor = '#ffeb3b';
            cell.style.transition = 'background-color 0.3s';
            gameState.board[i] = gameState.board[i].replace('*', '');
        }
    }
    setTimeout(() => {
        for (let i = 0; i < gameState.board.length; i++) {
            const cell = elements.gameBoard.children[i];
            cell.style.backgroundColor = '';
        }
    }, 1000);
}

function updatePlayerInfo() {
    elements.player1Info.classList.toggle('active', gameState.currentPlayer === 1);
    elements.player2Info.classList.toggle('active', gameState.currentPlayer === 2);
    if (gameState.gameMode === 'pvc') {
        elements.player2Info.querySelector('.player-name').textContent = 'Computer';
    } else {
        elements.player2Info.querySelector('.player-name').textContent = 'Player 2';
    }
}

function updateScores() {
    elements.player1Score.textContent = gameState.scores[0];
    elements.player2Score.textContent = gameState.scores[1];
}

function computerMove() {
    if (!gameState.gameActive) return;
    
    let moveIndex;
    const emptyCells = gameState.board.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
    
    if (emptyCells.length === 0) return;
    
    if (gameState.difficulty === 'easy') {
        moveIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    } 
    else if (gameState.difficulty === 'medium') {
        if (Math.random() < 0.5) {
            moveIndex = findBestMove();
            if (moveIndex === -1) {
                moveIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            }
        } else {
            moveIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }
    } 
    else {
        moveIndex = findBestMove();
        if (moveIndex === -1) {
            moveIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }
    }
    
    const letter = Math.random() < 0.7 ? 'S' : 'O';
    setTimeout(() => {
        makeMove(moveIndex, letter);
    }, 500);
}

function findBestMove() {
    const emptyCells = gameState.board.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
    
    for (const index of emptyCells) {
        gameState.board[index] = 'S';
        let sequences = checkForSOS(index, 'S');
        gameState.board[index] = '';
        
        if (sequences > 0) return index;
        
        gameState.board[index] = 'O';
        sequences = checkForSOS(index, 'O');
        gameState.board[index] = '';
        
        if (sequences > 0) return index;
    }
    
    for (const index of emptyCells) {
        gameState.board[index] = 'S';
        for (const otherIndex of emptyCells.filter(i => i !== index)) {
            gameState.board[otherIndex] = 'O';
            const sequences = checkForSOS(otherIndex, 'O');
            gameState.board[otherIndex] = '';
            
            if (sequences > 0) {
                gameState.board[index] = '';
                return index; 
            }
        }
        gameState.board[index] = '';
        
        gameState.board[index] = 'O';
        for (const otherIndex of emptyCells.filter(i => i !== index)) {
            gameState.board[otherIndex] = 'S';
            const sequences = checkForSOS(otherIndex, 'S');
            gameState.board[otherIndex] = '';
            
            if (sequences > 0) {
                gameState.board[index] = '';
                return index; 
            }
        }
        gameState.board[index] = '';
    }
    
    const center = Math.floor(gameState.boardSize / 2) * gameState.boardSize + Math.floor(gameState.boardSize / 2);
    if (emptyCells.includes(center)) {
        return center;
    }
    
    const corners = [
        0,
        gameState.boardSize - 1,
        gameState.boardSize * (gameState.boardSize - 1),
        gameState.boardSize * gameState.boardSize - 1
    ];
    
    for (const corner of corners) {
        if (emptyCells.includes(corner)) {
            return corner;
        }
    }
    
    return -1;
}

function checkGameEnd() {
    const isBoardFull = gameState.board.every(cell => cell !== '');
    
    if (isBoardFull) {
        endGame();
    }
}

function endGame() {
    gameState.gameActive = false;
    stopTimer();
    
    let winner, resultClass;
    if (gameState.scores[0] > gameState.scores[1]) {
        winner = gameState.gameMode === 'pvc' ? 'Player Wins!' : 'Player 1 Wins!';
        resultClass = 'win';
        SoundManager.play('win');
    } else if (gameState.scores[1] > gameState.scores[0]) {
        winner = gameState.gameMode === 'pvc' ? 'Computer Wins!' : 'Player 2 Wins!';
        resultClass = 'lose';
        SoundManager.play('win');
    } else {
        winner = "It's a Draw!";
        resultClass = 'draw';
        SoundManager.play('draw');
    }
    
    const maxScore = Math.max(...gameState.scores);
    if (maxScore > gameState.highScore) {
        gameState.highScore = maxScore;
        localStorage.setItem('sosHighScore', gameState.highScore);
        updateHighScoreDisplay();
    }
    
    showResultScreen(winner, resultClass);
}

function showResultScreen(winner, resultClass) {
    elements.winnerName.textContent = winner;
    elements.winnerName.className = 'winner-name ' + resultClass;
    elements.finalScore1.textContent = gameState.scores[0];
    elements.finalScore2.textContent = gameState.scores[1];
    
    elements.gameScreen.style.display = 'none';
    elements.resultScreen.style.display = 'block';
}

function updateHighScoreDisplay() {
    elements.highScoreDisplay.textContent = `High Score: ${gameState.highScore}`;
}

function restartGame() {
    SoundManager.play('click');
    startGame();
}

function returnToMenu() {
    SoundManager.play('click');
    stopTimer();
    elements.menuScreen.style.display = 'block';
    elements.gameScreen.style.display = 'none';
    elements.resultScreen.style.display = 'none';
}

function startTimer() {
    if (!gameState.settings.timerEnabled) return;
    
    gameState.timer = 0;
    updateTimerDisplay();
    
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    gameState.timerInterval = setInterval(() => {
        gameState.timer++;
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

function updateTimerDisplay() {
    if (!gameState.settings.timerEnabled) {
        elements.timerContainer.style.display = 'none';
        return;
    }
    
    elements.timerContainer.style.display = 'block';
    const minutes = Math.floor(gameState.timer / 60);
    const seconds = gameState.timer % 60;
    elements.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function showNotification(message) {
    SoundManager.play('error');
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }, 10);
}

window.addEventListener('DOMContentLoaded', initGame);