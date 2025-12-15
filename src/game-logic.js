import {
    quoteDisplayElement,
    quoteInputElement,
    timerElement,
    scoreElement,
    restartButton,
    pauseButton,
    endGameButton,
    quoteSummaryElement,
    difficultySelectionElement,
    categorySelectionElement,
    gameAreaElement,
    difficultyButtons,
    categoryButtons,
    resultModal,
    closeModalButton,
    playAgainButton,
    resultDifficultyElement,
    resultScoreElement,
    resultWpmElement,
    resultAccuracyElement,
    highscoreListElement,
    countdownOverlay,
    countdownText,
    progressBar
} from './dom.js';
import { state } from './state.js';
import { saveScore, displayHighScores } from './highscore.js';

export function loadAllQuotes() {
    state.allQuotes = quotes;
}

export function showDifficultySelection() {
    gameAreaElement.style.display = 'none';
    resultModal.style.display = 'none';
    categorySelectionElement.style.display = 'none';
    difficultySelectionElement.style.display = 'block';
}

export function showCategorySelection() {
    difficultySelectionElement.style.display = 'none';

    // Get available categories for the selected difficulty
    const availableCategories = [...new Set(
        state.allQuotes
            .filter(quote => quote.difficulty === state.difficulty)
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
export async function startGame() {
    // 1. Prepare quotes
    let quotesByDifficulty = state.allQuotes.filter(quote => quote.difficulty === state.difficulty);
    
    if (state.category === 'All') {
        state.filteredQuotes = quotesByDifficulty;
    } else {
        state.filteredQuotes = quotesByDifficulty.filter(quote => quote.category === state.category);
    }

    if (state.filteredQuotes.length === 0) {
        alert(`No quotes found for difficulty: ${state.difficulty} and category: ${state.category}`);
        showDifficultySelection();
        return;
    }

    // 2. Prepare UI
    categorySelectionElement.style.display = 'none';
    gameAreaElement.style.display = 'block';
    resetGameState();
    renderNewQuote();
    quoteInputElement.disabled = true; // Disable input during countdown

    // 3. Countdown
    countdownOverlay.style.display = 'flex';
    let count = 3;
    countdownText.innerText = count;

    await new Promise(resolve => {
        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownText.innerText = count;
            } else if (count === 0) {
                countdownText.innerText = 'Go!';
            } else {
                clearInterval(countdownInterval);
                countdownOverlay.style.display = 'none';
                resolve();
            }
        }, 1000);
    });

    // 4. Start Game
    quoteInputElement.disabled = false;
    quoteInputElement.focus();
    startTimer();
}

export function resetGameState() {
    state.cumulativeScore = 0;
    state.totalTypedChars = 0;
    state.currentQuote = null;
    scoreElement.innerText = 0;
    quoteInputElement.disabled = false;
    quoteInputElement.value = '';
    state.isPaused = false;
    state.timeRemaining = 60;
    timerElement.innerText = state.timeRemaining;
    timerElement.classList.remove('timer-warning', 'timer-danger'); // Reset timer color
    pauseButton.innerText = '一時停止';
    quoteSummaryElement.innerText = '';
    clearInterval(state.timerInterval);
}

export function renderNewQuote() {
    if (state.currentQuote) {
        state.totalTypedChars += state.currentQuote.text.length;
    }

    state.currentQuote = getRandomQuote();
    quoteInputElement.value = '';
    quoteSummaryElement.innerText = state.currentQuote.japanese || '（日本語訳はありません）';
    progressBar.style.width = '0%'; // Reset progress bar

    quoteDisplayElement.innerHTML = '';
    state.currentQuote.text.split('').forEach(character => {
        const characterSpan = document.createElement('span');
        characterSpan.innerText = character;
        quoteDisplayElement.appendChild(characterSpan);
    });

    const firstCharacter = quoteDisplayElement.querySelector('span');
    if (firstCharacter) {
        firstCharacter.classList.add('current');
    }
}

export function getRandomQuote() {
    if (state.filteredQuotes.length <= 1) {
        return state.filteredQuotes[0];
    }

    let nextQuote;
    do {
        nextQuote = state.filteredQuotes[Math.floor(Math.random() * state.filteredQuotes.length)];
    } while (nextQuote === state.currentQuote);

    return nextQuote;
}

export function handleInput() {
    if (state.isPaused || !state.currentQuote) return;

    const arrayQuote = quoteDisplayElement.querySelectorAll('span');
    const arrayValue = quoteInputElement.value.split('');

    // Update progress bar
    const progress = (arrayValue.length / arrayQuote.length) * 100;
    progressBar.style.width = `${progress}%`;

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

    if (allCorrectSoFar && arrayValue.length === state.currentQuote.text.length) {
        state.cumulativeScore += state.currentQuote.text.length;
        scoreElement.innerText = state.cumulativeScore;
        renderNewQuote();
    }
}

export function startTimer() {
    state.startTime = new Date();
    state.timerInterval = setInterval(() => {
        const elapsedTime = Math.floor((new Date() - state.startTime) / 1000);
        const currentRemaining = state.timeRemaining - elapsedTime;
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
            clearInterval(state.timerInterval);
            endGame();
        }
    }, 1000);
}

export function togglePause() {
    if (state.isPaused) {
        state.isPaused = false;
        quoteInputElement.disabled = false;
        pauseButton.innerText = '一時停止';
        state.startTime = new Date() - ((60 - state.timeRemaining) * 1000);
        startTimer();
    } else {
        state.isPaused = true;
        clearInterval(state.timerInterval);
        quoteInputElement.disabled = true;
        pauseButton.innerText = '再開';
        state.timeRemaining = parseInt(timerElement.innerText);
    }
}

export function confirmEndGame() {
    if (confirm('本当にゲームを終了しますか？')) {
        endGame();
    }
}

export function endGame() {
    clearInterval(state.timerInterval);
    quoteInputElement.disabled = true;
    state.isPaused = false;

    state.totalTypedChars += quoteInputElement.value.length;

    const wpm = Math.round((state.cumulativeScore / 5) / 1);
    const accuracy = state.totalTypedChars > 0 ? Math.round((state.cumulativeScore / state.totalTypedChars) * 100) : 0;

    // Save to state
    state.wpm = wpm;
    state.accuracy = accuracy;

    saveScore(state.difficulty, state.category, state.cumulativeScore, wpm, accuracy);
    showResultModal(state.cumulativeScore, wpm, accuracy);
}

// --- Results and Highscores ---
export function showResultModal(score, wpm, accuracy) {
    resultDifficultyElement.innerText = `${state.difficulty} / ${state.category}`;
    resultScoreElement.innerText = score;
    resultWpmElement.innerText = wpm;
    resultAccuracyElement.innerText = `${accuracy}%`;

    displayHighScores(state.difficulty, state.category);

    resultModal.style.display = 'block';
}
