// --- DOM Elements ---
const quoteDisplayElement = document.getElementById('quote-display');
const quoteInputElement = document.getElementById('quote-input');
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');
const restartButton = document.getElementById('restart-button');
const pauseButton = document.getElementById('pause-button');
const endGameButton = document.getElementById('end-game-button');

const difficultySelectionElement = document.getElementById('difficulty-selection');
const gameAreaElement = document.getElementById('game-area');
const difficultyButtons = document.querySelectorAll('.difficulty-button');

// --- Modal Elements ---
const resultModal = document.getElementById('result-modal');
const closeModalButton = document.querySelector('.close-button');
const playAgainButton = document.getElementById('play-again-button');
const resultDifficultyElement = document.getElementById('result-difficulty');
const resultScoreElement = document.getElementById('result-score');
const resultWpmElement = document.getElementById('result-wpm');
const resultAccuracyElement = document.getElementById('result-accuracy');
const highscoreListElement = document.getElementById('highscore-list');

// --- Game State Variables ---
let allQuotes = [];
let filteredQuotes = [];
let difficulty = '';

let startTime;
let timerInterval;
let isPaused = false;
let timeRemaining = 60;
let currentQuoteString;

// --- Stats Variables ---
let cumulativeScore = 0; // Total correct characters from *completed* quotes
let totalTypedChars = 0; // Total characters typed in the game

// --- Initialization ---
async function initializeGame() {
    await loadAllQuotes();
    setupEventListeners();
    showDifficultySelection();
}

async function loadAllQuotes() {
    try {
        const response = await fetch('quotes.json');
        allQuotes = await response.json();
    } catch (error) {
        console.error('Error loading quotes:', error);
        alert('Failed to load quotes. Please check quotes.json.');
    }
}

function setupEventListeners() {
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            difficulty = button.dataset.difficulty;
            startGame(difficulty);
        });
    });

    restartButton.addEventListener('click', () => location.reload());
    pauseButton.addEventListener('click', togglePause);
    endGameButton.addEventListener('click', confirmEndGame);
    quoteInputElement.addEventListener('input', handleInput);

    // Modal listeners
    closeModalButton.addEventListener('click', () => resultModal.style.display = 'none');
    playAgainButton.addEventListener('click', () => location.reload());
    window.addEventListener('click', (event) => {
        if (event.target == resultModal) {
            resultModal.style.display = 'none';
        }
    });
}

function showDifficultySelection() {
    gameAreaElement.style.display = 'none';
    resultModal.style.display = 'none';
    difficultySelectionElement.style.display = 'block';
}

// --- Game Flow ---
function startGame(selectedDifficulty) {
    filteredQuotes = allQuotes.filter(quote => quote.difficulty === selectedDifficulty);
    if (filteredQuotes.length === 0) {
        alert(`No quotes found for difficulty: ${selectedDifficulty}`);
        return;
    }

    difficultySelectionElement.style.display = 'none';
    gameAreaElement.style.display = 'block';
    quoteInputElement.focus();

    resetGameState();
    renderNewQuote();
    startTimer();
}

function resetGameState() {
    cumulativeScore = 0;
    totalTypedChars = 0;
    currentQuoteString = null;
    scoreElement.innerText = 0;
    quoteInputElement.disabled = false;
    quoteInputElement.value = '';
    isPaused = false;
    timeRemaining = 60;
    timerElement.innerText = timeRemaining;
    pauseButton.innerText = '一時停止';
    clearInterval(timerInterval);
}

function renderNewQuote() {
    if (currentQuoteString) {
        totalTypedChars += currentQuoteString.length;
    }

    currentQuoteString = getRandomQuote();
    quoteInputElement.value = '';

    quoteDisplayElement.innerHTML = '';
    currentQuoteString.split('').forEach(character => {
        const characterSpan = document.createElement('span');
        characterSpan.innerText = character;
        quoteDisplayElement.appendChild(characterSpan);
    });

    const firstCharacter = quoteDisplayElement.querySelector('span');
    if (firstCharacter) {
        firstCharacter.classList.add('current');
    }
}

function getRandomQuote() {
    const quote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
    return quote.text;
}

function handleInput() {
    if (isPaused) return;

    const arrayQuote = quoteDisplayElement.querySelectorAll('span');
    const arrayValue = quoteInputElement.value.split('');

    arrayQuote.forEach(span => span.classList.remove('current'));

    let allCorrectSoFar = true;
    for (let i = 0; i < arrayQuote.length; i++) {
        const characterSpan = arrayQuote[i];
        const character = arrayValue[i];

        if (character == null) {
            characterSpan.classList.remove('correct', 'incorrect');
            allCorrectSoFar = false;
        } else if (character === characterSpan.innerText) {
            characterSpan.classList.add('correct');
            characterSpan.classList.remove('incorrect');
        } else {
            characterSpan.classList.add('incorrect');
            characterSpan.classList.remove('correct');
            allCorrectSoFar = false;
        }
    }

    if (arrayValue.length < arrayQuote.length) {
        arrayQuote[arrayValue.length].classList.add('current');
    }

    if (allCorrectSoFar && arrayValue.length === currentQuoteString.length) {
        cumulativeScore += currentQuoteString.length;
        scoreElement.innerText = cumulativeScore;
        renderNewQuote();
    }
}

function startTimer() {
    startTime = new Date();
    timerInterval = setInterval(() => {
        const elapsedTime = Math.floor((new Date() - startTime) / 1000);
        const currentRemaining = timeRemaining - elapsedTime;
        timerElement.innerText = currentRemaining;

        if (currentRemaining <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}

function togglePause() {
    if (isPaused) {
        isPaused = false;
        quoteInputElement.disabled = false;
        pauseButton.innerText = '一時停止';
        startTime = new Date() - ((60 - timeRemaining) * 1000);
        startTimer();
    } else {
        isPaused = true;
        clearInterval(timerInterval);
        quoteInputElement.disabled = true;
        pauseButton.innerText = '再開';
        timeRemaining = parseInt(timerElement.innerText);
    }
}

function confirmEndGame() {
    if (confirm('本当にゲームを終了しますか？')) {
        endGame();
    }
}

function endGame() {
    clearInterval(timerInterval);
    quoteInputElement.disabled = true;
    isPaused = false;

    totalTypedChars += quoteInputElement.value.length;

    const wpm = Math.round((cumulativeScore / 5) / 1);
    const accuracy = totalTypedChars > 0 ? Math.round((cumulativeScore / totalTypedChars) * 100) : 0;

    saveScore(difficulty, cumulativeScore, wpm, accuracy);
    showResultModal(cumulativeScore, wpm, accuracy);
}

// --- Results and Highscores ---
function showResultModal(score, wpm, accuracy) {
    resultDifficultyElement.innerText = difficulty;
    resultScoreElement.innerText = score;
    resultWpmElement.innerText = wpm;
    resultAccuracyElement.innerText = `${accuracy}%`;

    displayHighScores();

    resultModal.style.display = 'block';
}

function saveScore(difficulty, score, wpm, accuracy) {
    const highScores = getHighScores(difficulty);
    const newScore = { score, wpm, accuracy, date: new Date().toLocaleDateString() };

    highScores.push(newScore);
    highScores.sort((a, b) => b.score - a.score);
    highScores.splice(5);

    localStorage.setItem(`highScores_${difficulty}`, JSON.stringify(highScores));
}

function getHighScores(difficulty) {
    const scoresJSON = localStorage.getItem(`highScores_${difficulty}`);
    return scoresJSON ? JSON.parse(scoresJSON) : [];
}

function displayHighScores() {
    const highScores = getHighScores(difficulty);
    highscoreListElement.innerHTML = '';

    if (highScores.length === 0) {
        highscoreListElement.innerHTML = '<li>まだハイスコアはありません。</li>';
        return;
    }

    highScores.forEach(score => {
        const li = document.createElement('li');
        li.innerText = `スコア: ${score.score} - WPM: ${score.wpm} - 正答率: ${score.accuracy}% (${score.date})`;
        highscoreListElement.appendChild(li);
    });
}

// --- Start the application ---
initializeGame();
