const quoteDisplayElement = document.getElementById('quote-display');
const quoteInputElement = document.getElementById('quote-input');
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');
const restartButton = document.getElementById('restart-button');
const pauseButton = document.getElementById('pause-button');
const endGameButton = document.getElementById('end-game-button');

let quotes = []; // Now an empty array, will be populated from quotes.json

let startTime;
let timerInterval;
let cumulativeScore = 0;
let isPaused = false;
let timeRemaining = 60;
let currentQuoteString;

async function loadQuotes() {
    try {
        const response = await fetch('quotes.json');
        quotes = await response.json();
        console.log('Quotes loaded:', quotes.length);
    } catch (error) {
        console.error('Error loading quotes:', error);
        alert('Failed to load quotes. Please check quotes.json.');
    }
}

function getRandomQuote() {
    return quotes[Math.floor(Math.random() * quotes.length)];
}

async function renderNewQuote() {
    const quote = getRandomQuote();
    currentQuoteString = quote;
    quoteDisplayElement.innerHTML = '';
    quote.split('').forEach(character => {
        const characterSpan = document.createElement('span');
        characterSpan.innerText = character;
        quoteDisplayElement.appendChild(characterSpan);
    });
    quoteInputElement.value = '';
}

quoteInputElement.addEventListener('input', () => {
    if (isPaused) return;

    const arrayQuote = quoteDisplayElement.querySelectorAll('span');
    const arrayValue = quoteInputElement.value.split('');

    let currentQuotePerfectlyCorrect = true;

    for (let i = 0; i < arrayQuote.length; i++) {
        const characterSpan = arrayQuote[i];
        const character = arrayValue[i];

        if (character == null) {
            characterSpan.classList.remove('correct');
            characterSpan.classList.remove('incorrect');
            currentQuotePerfectlyCorrect = false;
        } else if (character === characterSpan.innerText) {
            characterSpan.classList.add('correct');
            characterSpan.classList.remove('incorrect');
        } else {
            characterSpan.classList.remove('correct');
            characterSpan.classList.add('incorrect');
            currentQuotePerfectlyCorrect = false;
        }
    }

    if (quoteInputElement.value.length >= currentQuoteString.length) {
        const typedPart = quoteInputElement.value.substring(0, currentQuoteString.length);
        if (typedPart === currentQuoteString) {
            cumulativeScore += currentQuoteString.length;
            scoreElement.innerText = cumulativeScore;
        }
        renderNewQuote();
    }
});

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
        startTime = new Date() - (60 - timeRemaining) * 1000;
        startTimer();
    } else {
        isPaused = true;
        clearInterval(timerInterval);
        quoteInputElement.disabled = true;
        pauseButton.innerText = '再開';
        timeRemaining = parseInt(timerElement.innerText);
    }
}

async function startGame() { // Made async
    cumulativeScore = 0;
    scoreElement.innerText = cumulativeScore;
    quoteInputElement.disabled = false;
    quoteInputElement.value = '';
    isPaused = false;
    timeRemaining = 60;
    timerElement.innerText = timeRemaining;
    pauseButton.innerText = '一時停止';

    await loadQuotes(); // Load quotes before rendering
    renderNewQuote();

    clearInterval(timerInterval);
    startTimer();
}

function endGame() {
    quoteInputElement.disabled = true;
    clearInterval(timerInterval);
    isPaused = false;
    alert(`ゲーム終了！あなたのスコアは ${cumulativeScore} です。`);
}

function confirmEndGame() {
    if (confirm('本当にゲームを終了しますか？')) {
        endGame();
    }
}

restartButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', togglePause);
endGameButton.addEventListener('click', confirmEndGame);

startGame();
