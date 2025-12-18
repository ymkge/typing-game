import quotesData from './quotes.json';
import {
    quoteDisplayElement,
    quoteInputElement,
    timerElement,
    scoreElement,
    pauseButton,
    quoteSummaryElement,
    modeSelectionElement,
    difficultySelectionElement,
    categorySelectionElement,
    gameAreaElement,
    countdownOverlay,
    countdownText,
    progressBar,
    resultModal,
    categoryButtons,
    resultDifficultyElement,
    resultScoreElement,
    resultWpmElement,
    resultAccuracyElement
} from './dom.ts';
import { state, Quote } from './state.ts';
import { saveScore, displayHighScores } from './highscore.ts';
import { playErrorSound, playCorrectSound, playFinishSound } from './audio.ts';

export function loadAllQuotes(): void {
    state.allQuotes = quotesData as Quote[];
}

export function showModeSelection(): void {
    gameAreaElement.style.display = 'none';
    resultModal.style.display = 'none';
    categorySelectionElement.style.display = 'none';
    difficultySelectionElement.style.display = 'none';
    modeSelectionElement.style.display = 'block';
}

export function showDifficultySelection(): void {
    modeSelectionElement.style.display = 'none';
    gameAreaElement.style.display = 'none';
    resultModal.style.display = 'none';
    categorySelectionElement.style.display = 'none';
    difficultySelectionElement.style.display = 'block';
}

export function showCategorySelection(): void {
    modeSelectionElement.style.display = 'none';
    difficultySelectionElement.style.display = 'none';

    // Get available categories for the selected difficulty
    const availableCategories = [...new Set(
        state.allQuotes
            .filter(quote => quote.difficulty === state.difficulty)
            .map(quote => quote.category)
    )];

    // Show/hide category buttons based on availability
    categoryButtons.forEach((button: HTMLButtonElement) => {
        const category = button.dataset.category;
        if (category === 'All' || (category && availableCategories.includes(category))) {
            button.style.display = 'inline-block';
        } else {
            button.style.display = 'none';
        }
    });

    categorySelectionElement.style.display = 'block';
}

// --- Game Flow ---
export async function startGame(): Promise<void> {
    // 1. Prepare quotes
    let quotesByDifficulty = state.allQuotes.filter(quote => quote.difficulty === state.difficulty);
    
    if (state.category === 'All') {
        state.filteredQuotes = quotesByDifficulty;
    } else {
        state.filteredQuotes = quotesByDifficulty.filter(quote => quote.category === state.category);
    }

    if (state.filteredQuotes.length === 0) {
        alert(`No quotes found for difficulty: ${state.difficulty} and category: ${state.category}`);
        showModeSelection();
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
    countdownText.innerText = String(count);

    await new Promise<void>(resolve => {
        const countdownInterval = window.setInterval(() => {
            count--;
            if (count > 0) {
                countdownText.innerText = String(count);
            } else if (count === 0) {
                countdownText.innerText = 'Go!';
            } else {
                window.clearInterval(countdownInterval);
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

export function resetGameState(): void {
    state.cumulativeScore = 0;
    state.totalTypedChars = 0;
    state.currentQuote = null;
    scoreElement.innerText = String(0);
    quoteInputElement.disabled = false;
    quoteInputElement.value = '';
    state.isPaused = false;
    state.timeRemaining = 60;
    timerElement.innerText = String(state.timeRemaining);
    timerElement.classList.remove('timer-warning', 'timer-danger'); // Reset timer color
    pauseButton.innerText = '一時停止';
    quoteSummaryElement.innerText = '';
    if (state.timerInterval !== null) {
        window.clearInterval(state.timerInterval);
    }
}

export function renderNewQuote(): void {
    if (state.currentQuote) {
        state.totalTypedChars += state.currentQuote.text.length;
    }

    state.currentQuote = getRandomQuote();
    if (!state.currentQuote) {
        // This case should ideally not happen if filteredQuotes is not empty
        alert('No more quotes available!');
        showModeSelection();
        return;
    }
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

export function getRandomQuote(): Quote | null {
    if (state.filteredQuotes.length === 0) {
        return null;
    }
    if (state.filteredQuotes.length <= 1) {
        return state.filteredQuotes[0];
    }

    let nextQuote: Quote;
    do {
        nextQuote = state.filteredQuotes[Math.floor(Math.random() * state.filteredQuotes.length)];
    } while (nextQuote === state.currentQuote);

    return nextQuote;
}

export function handleInput(): void {
    if (state.isPaused || !state.currentQuote) return;

    const arrayQuote = quoteDisplayElement.querySelectorAll('span');
    const arrayValue = quoteInputElement.value.split('');

    // Update progress bar
    const progress = (arrayValue.length / arrayQuote.length) * 100;
    progressBar.style.width = `${progress}%`;

    arrayQuote.forEach((span: HTMLSpanElement) => span.classList.remove('current'));

    let allCorrectSoFar = true;
    let hasError = false;
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
            if (!hasError) {
                playErrorSound();
                hasError = true;
            }
        }
    }

    if (arrayValue.length < arrayQuote.length) {
        arrayQuote[arrayValue.length].classList.add('current');
    }

    if (allCorrectSoFar && arrayValue.length === state.currentQuote.text.length) {
        playCorrectSound();
        state.cumulativeScore += state.currentQuote.text.length;
        scoreElement.innerText = String(state.cumulativeScore);
        renderNewQuote();
    }
}

export function startTimer(): void {
    state.startTime = new Date();
    state.timerInterval = window.setInterval(() => {
        if (state.startTime === null) return; // Should not happen
        const elapsedTime = Math.floor((new Date().getTime() - state.startTime.getTime()) / 1000);
        const currentRemaining = state.timeRemaining - elapsedTime;
        timerElement.innerText = String(currentRemaining);

        // Update timer color based on remaining time
        if (currentRemaining <= 10) {
            timerElement.classList.add('timer-danger');
            timerElement.classList.remove('timer-warning');
        } else if (currentRemaining <= 30) {
            timerElement.classList.add('timer-warning');
        } else {
            timerElement.classList.remove('timer-warning', 'timer-danger');
        }

        if (currentRemaining <= 0) {
            if (state.timerInterval !== null) {
                window.clearInterval(state.timerInterval);
            }
            endGame();
        }
    }, 1000);
}

export function togglePause(): void {
    if (state.isPaused) {
        state.isPaused = false;
        quoteInputElement.disabled = false;
        pauseButton.innerText = '一時停止';
        if (state.startTime !== null) {
            state.startTime = new Date(new Date().getTime() - ((60 - state.timeRemaining) * 1000));
        }
        startTimer();
    } else {
        state.isPaused = true;
        if (state.timerInterval !== null) {
            window.clearInterval(state.timerInterval);
        }
        quoteInputElement.disabled = true;
        pauseButton.innerText = '再開';
        state.timeRemaining = parseInt(timerElement.innerText, 10);
    }
}

export function confirmEndGame(): void {
    if (confirm('本当にゲームを終了しますか？')) {
        endGame();
    }
}

export function endGame(): void {
    if (state.timerInterval !== null) {
        window.clearInterval(state.timerInterval);
    }
    quoteInputElement.disabled = true;
    state.isPaused = false;

    state.totalTypedChars += quoteInputElement.value.length;

    const wpm = Math.round((state.cumulativeScore / 5) / 1);
    const accuracy = state.totalTypedChars > 0 ? Math.round((state.cumulativeScore / state.totalTypedChars) * 100) : 0;

    // Save to state
    state.wpm = wpm;
    state.accuracy = accuracy;

    playFinishSound();
    saveScore(state.difficulty, state.category, state.cumulativeScore, wpm, accuracy);
    showResultModal(state.cumulativeScore, wpm, accuracy);
}

// --- Results and Highscores ---
export function showResultModal(score: number, wpm: number, accuracy: number): void {
    resultDifficultyElement.innerText = `${state.difficulty} / ${state.category}`;
    resultScoreElement.innerText = String(score);
    resultWpmElement.innerText = String(wpm);
    resultAccuracyElement.innerText = `${accuracy}%`;

    displayHighScores(state.difficulty, state.category);

    resultModal.style.display = 'block';
}