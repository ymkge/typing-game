// --- DOM Elements ---
const quoteDisplayElement = document.getElementById('quote-display');
const quoteInputElement = document.getElementById('quote-input');
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');
const restartButton = document.getElementById('restart-button');
const pauseButton = document.getElementById('pause-button');
const endGameButton = document.getElementById('end-game-button');
const quoteSummaryElement = document.getElementById('quote-summary');

const difficultySelectionElement = document.getElementById('difficulty-selection');
const categorySelectionElement = document.getElementById('category-selection');
const gameAreaElement = document.getElementById('game-area');
const difficultyButtons = document.querySelectorAll('.difficulty-button');
const categoryButtons = document.querySelectorAll('.category-button');

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
let category = '';

let startTime;
let timerInterval;
let isPaused = false;
let timeRemaining = 60;
let currentQuote;

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
            showCategorySelection();
        });
    });

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            category = button.dataset.category;
            startGame();
        });
    });

    restartButton.addEventListener('click', () => location.reload());
    pauseButton.addEventListener('click', togglePause);
    endGameButton.addEventListener('click', confirmEndGame);
    quoteInputElement.addEventListener('input', handleInput);

    // Modal listeners
    closeModalButton.addEventListener('click', () => resultModal.style.display = 'none');
    playAgainButton.addEventListener('click', () => {
        resultModal.style.display = 'none';
        showDifficultySelection();
    });
    window.addEventListener('click', (event) => {
        if (event.target == resultModal) {
            resultModal.style.display = 'none';
        }
    });
}

function showDifficultySelection() {
    gameAreaElement.style.display = 'none';
    resultModal.style.display = 'none';
    categorySelectionElement.style.display = 'none';
    difficultySelectionElement.style.display = 'block';
}

function showCategorySelection() {
    difficultySelectionElement.style.display = 'none';

    // Get available categories for the selected difficulty
    const availableCategories = [...new Set(
        allQuotes
            .filter(quote => quote.difficulty === difficulty)
            .map(quote => quote.category)
    )];

    // Show/hide category buttons based on availability
    categoryButtons.forEach(button => {
        const category = button.dataset.category;
        if (category === 'All' || availableCategories.includes(category)) {
            button.style.display = 'inline-block';
        } else {
            button.style.display = 'none';
        }
    });

    categorySelectionElement.style.display = 'block';
}

// --- Game Flow ---
function startGame() {
    let quotesByDifficulty = allQuotes.filter(quote => quote.difficulty === difficulty);
    
    if (category === 'All') {
        filteredQuotes = quotesByDifficulty;
    } else {
        filteredQuotes = quotesByDifficulty.filter(quote => quote.category === category);
    }

    if (filteredQuotes.length === 0) {
        alert(`No quotes found for difficulty: ${difficulty} and category: ${category}`);
        showDifficultySelection();
        return;
    }

    categorySelectionElement.style.display = 'none';
    gameAreaElement.style.display = 'block';
    quoteInputElement.focus();

    resetGameState();
    renderNewQuote();
    startTimer();
}

function resetGameState() {
    cumulativeScore = 0;
    totalTypedChars = 0;
    currentQuote = null;
    scoreElement.innerText = 0;
    quoteInputElement.disabled = false;
    quoteInputElement.value = '';
    isPaused = false;
    timeRemaining = 60;
    timerElement.innerText = timeRemaining;
    timerElement.classList.remove('timer-warning', 'timer-danger'); // Reset timer color
    pauseButton.innerText = '一時停止';
    quoteSummaryElement.innerText = '';
    clearInterval(timerInterval);
}

function renderNewQuote() {
    if (currentQuote) {
        totalTypedChars += currentQuote.text.length;
    }

    currentQuote = getRandomQuote();
    quoteInputElement.value = '';
    quoteSummaryElement.innerText = currentQuote.japanese || '（日本語訳はありません）';

    quoteDisplayElement.innerHTML = '';
    currentQuote.text.split('').forEach(character => {
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
    if (filteredQuotes.length <= 1) {
        return filteredQuotes[0];
    }

    let nextQuote;
    do {
        nextQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
    } while (nextQuote === currentQuote);

    return nextQuote;
}

function handleInput() {
    if (isPaused || !currentQuote) return;

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

    if (allCorrectSoFar && arrayValue.length === currentQuote.text.length) {
        cumulativeScore += currentQuote.text.length;
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

        // Update timer color based on remaining time
        if (currentRemaining <= 10) {
            timerElement.classList.add('timer-danger');
            timerElement.classList.remove('timer-warning');
        } else if (currentRemaining <= 30) {
            timerElement.classList.add('timer-warning');
            timerElement.classList.remove('timer-danger');
        } else {
            timerElement.classList.remove('timer-warning', 'timer-danger');
        }

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
    resultDifficultyElement.innerText = `${difficulty} / ${category}`;
    resultScoreElement.innerText = score;
    resultWpmElement.innerText = wpm;
    resultAccuracyElement.innerText = `${accuracy}%`;

    displayHighScores();

    resultModal.style.display = 'block';
}

function saveScore(difficulty, score, wpm, accuracy) {
    const highScores = getHighScores(difficulty, category);
    const newScore = { score, wpm, accuracy, date: new Date().toLocaleDateString() };

    highScores.push(newScore);
    highScores.sort((a, b) => b.score - a.score);
    highScores.splice(5);

    localStorage.setItem(`highScores_${difficulty}_${category}`, JSON.stringify(highScores));
}

function getHighScores(difficulty, category) {
    const scoresJSON = localStorage.getItem(`highScores_${difficulty}_${category}`);
    return scoresJSON ? JSON.parse(scoresJSON) : [];
}

function displayHighScores() {
    const highScores = getHighScores(difficulty, category);
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