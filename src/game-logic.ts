import quotesData from './quotes.json';
import {
    quoteDisplayElement,
    quoteInputElement,
    timerElement,
    scoreElement,
    pauseButton,
    quoteSummaryElement,
    modeSelectionElement,
    modeSelectionTextElement,
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
    resultAccuracyElement,
    timerStatElement,
    scoreStatElement,
    questionCounterStatElement,
    questionCounterElement
} from './dom.ts';
import { state, Quote } from './state.ts';
import { saveScore, displayHighScores } from './highscore.ts';
import { playErrorSound, playCorrectSound, playFinishSound } from './audio.ts';

function formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10); // 10ms単位
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

export function loadAllQuotes(): void {
    state.allQuotes = quotesData as Quote[];
}

export function showModeSelection(): void {
    gameAreaElement.style.display = 'none';
    resultModal.style.display = 'none';
    categorySelectionElement.style.display = 'none';
    difficultySelectionElement.style.display = 'none';
    modeSelectionElement.style.display = 'block';
    modeSelectionTextElement.style.display = 'block';
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

    const availableCategories = [...new Set(
        state.allQuotes
            .filter(quote => quote.difficulty === state.difficulty)
            .map(quote => quote.category)
    )];

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

export async function startGame(): Promise<void> {
    let quotesByDifficulty = state.allQuotes.filter(quote => quote.difficulty === state.difficulty);
    state.filteredQuotes = state.category === 'All' ? quotesByDifficulty : quotesByDifficulty.filter(quote => quote.category === state.category);

    if (state.filteredQuotes.length === 0) {
        alert(`No quotes found for difficulty: ${state.difficulty} and category: ${state.category}`);
        showModeSelection();
        return;
    }

    modeSelectionTextElement.style.display = 'none';
    categorySelectionElement.style.display = 'none';
    gameAreaElement.style.display = 'block';
    resetGameState();
    setupModeUI();
    renderNewQuote();
    quoteInputElement.disabled = true;

    await runCountdown();

    quoteInputElement.disabled = false;
    quoteInputElement.focus();
    if (state.gameMode === 'TimeAttack') {
        startTimeAttackTimer();
    } else if (state.gameMode === 'Normal') {
        startNormalTimer();
    }
}

function setupModeUI(): void {
    const isSurvival = state.gameMode === 'Survival';
    const isTimeAttack = state.gameMode === 'TimeAttack';

    timerStatElement.style.display = isSurvival ? 'none' : 'flex';
    scoreStatElement.style.display = isTimeAttack ? 'none' : 'flex';
    questionCounterStatElement.style.display = isTimeAttack ? 'flex' : 'none';
    pauseButton.style.display = isSurvival ? 'none' : 'inline-block';

    if (isTimeAttack) {
        timerElement.previousElementSibling!.textContent = '時間';
        questionCounterElement.textContent = `${state.clearedQuestions}/${state.questionsToClear}`;
    } else {
        timerElement.previousElementSibling!.textContent = 'タイマー';
    }
}

async function runCountdown(): Promise<void> {
    countdownOverlay.style.display = 'flex';
    for (let i = 3; i > 0; i--) {
        countdownText.innerText = String(i);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    countdownText.innerText = 'Go!';
    await new Promise(resolve => setTimeout(resolve, 1000));
    countdownOverlay.style.display = 'none';
}

export function resetGameState(): void {
    state.cumulativeScore = 0;
    state.totalTypedChars = 0;
    state.currentQuote = null;
    scoreElement.innerText = '0';
    quoteInputElement.disabled = false;
    quoteInputElement.value = '';
    state.isPaused = false;
    state.timeRemaining = 60;
    timerElement.innerText = '60';
    timerElement.classList.remove('timer-warning', 'timer-danger');
    pauseButton.innerText = '一時停止';
    quoteSummaryElement.innerText = '';
    if (state.timerInterval) window.clearInterval(state.timerInterval);

    // Time Attack reset
    state.clearedQuestions = 0;
    state.elapsedTime = 0;
}

export function renderNewQuote(): void {
    if (state.gameMode === 'TimeAttack' && state.clearedQuestions >= state.questionsToClear) {
        endGame();
        return;
    }

    if (state.currentQuote) {
        state.totalTypedChars += state.currentQuote.text.length;
    }

    state.currentQuote = getRandomQuote();
    if (!state.currentQuote) {
        alert('No more quotes available!');
        showModeSelection();
        return;
    }

    if (state.gameMode === 'TimeAttack') {
        state.clearedQuestions++;
        questionCounterElement.textContent = `${state.clearedQuestions}/${state.questionsToClear}`;
    }

    quoteInputElement.value = '';
    quoteSummaryElement.innerText = state.currentQuote.japanese || '（日本語訳はありません）';
    progressBar.style.width = '0%';

    quoteDisplayElement.innerHTML = '';
    state.currentQuote.text.split('').forEach(character => {
        const characterSpan = document.createElement('span');
        characterSpan.innerText = character;
        quoteDisplayElement.appendChild(characterSpan);
    });
    (quoteDisplayElement.firstChild as HTMLElement)?.classList.add('current');
}

export function getRandomQuote(): Quote | null {
    if (state.filteredQuotes.length === 0) return null;
    if (state.filteredQuotes.length <= 1) return state.filteredQuotes[0];
    let nextQuote;
    do {
        nextQuote = state.filteredQuotes[Math.floor(Math.random() * state.filteredQuotes.length)];
    } while (nextQuote === state.currentQuote);
    return nextQuote;
}

export function handleInput(): void {
    if (state.isPaused || !state.currentQuote) return;

    const arrayQuote = quoteDisplayElement.querySelectorAll('span');
    const arrayValue = quoteInputElement.value.split('');
    progressBar.style.width = `${(arrayValue.length / arrayQuote.length) * 100}%`;

    let hasError = false;
    arrayQuote.forEach((span, i) => {
        span.classList.remove('current');
        const char = arrayValue[i];
        if (char == null) {
            span.classList.remove('correct', 'incorrect');
        } else if (char === span.innerText) {
            span.classList.add('correct');
            span.classList.remove('incorrect');
        } else {
            span.classList.add('incorrect');
            span.classList.remove('correct');
            if (!hasError) {
                playErrorSound();
                hasError = true;
            }
        }
    });

    if (hasError && state.gameMode === 'Survival') {
        endGame();
        return;
    }

    if (arrayValue.length < arrayQuote.length) {
        arrayQuote[arrayValue.length].classList.add('current');
    } else if (arrayValue.length === state.currentQuote.text.length && !hasError) {
        playCorrectSound();
        state.cumulativeScore += state.currentQuote.text.length;
        scoreElement.innerText = String(state.cumulativeScore);
        renderNewQuote();
    }
}

function startNormalTimer(): void {
    state.startTime = new Date();
    state.timerInterval = window.setInterval(() => {
        if (!state.startTime) return;
        const elapsedTime = Math.floor((new Date().getTime() - state.startTime.getTime()) / 1000);
        const currentRemaining = state.timeRemaining - elapsedTime;
        timerElement.innerText = String(currentRemaining);

        if (currentRemaining <= 10) timerElement.classList.add('timer-danger');
        else if (currentRemaining <= 30) timerElement.classList.add('timer-warning');

        if (currentRemaining <= 0) endGame();
    }, 1000);
}

function startTimeAttackTimer(): void {
    state.startTime = new Date();
    state.timerInterval = window.setInterval(() => {
        if (!state.startTime) return;
        state.elapsedTime = new Date().getTime() - state.startTime.getTime();
        timerElement.innerText = formatTime(state.elapsedTime);
    }, 10);
}

export function togglePause(): void {
    if (state.gameMode === 'Survival') return;

    state.isPaused = !state.isPaused;
    quoteInputElement.disabled = state.isPaused;
    pauseButton.innerText = state.isPaused ? '再開' : '一時停止';

    if (state.isPaused) {
        if (state.timerInterval) window.clearInterval(state.timerInterval);
        if (state.gameMode === 'Normal') {
            state.timeRemaining = parseInt(timerElement.innerText, 10);
        }
    } else {
        if (state.gameMode === 'Normal') {
            state.startTime = new Date(new Date().getTime() - ((60 - state.timeRemaining) * 1000));
            startNormalTimer();
        } else if (state.gameMode === 'TimeAttack') {
            state.startTime = new Date(new Date().getTime() - state.elapsedTime);
            startTimeAttackTimer();
        }
    }
}

export function confirmEndGame(): void {
    if (confirm('本当にゲームを終了しますか？')) endGame();
}

export function endGame(): void {
    if (state.timerInterval) window.clearInterval(state.timerInterval);
    quoteInputElement.disabled = true;
    state.isPaused = false;
    playFinishSound();

    let score = 0, wpm = 0, accuracy = 0;

    switch (state.gameMode) {
        case 'Survival':
            const correctChars = quoteInputElement.value.length > 0 ? quoteInputElement.value.length - 1 : 0;
            score = state.cumulativeScore + correctChars;
            break;
        case 'TimeAttack':
            score = state.elapsedTime; // Lower is better
            const totalSeconds = state.elapsedTime / 1000;
            state.totalTypedChars += state.currentQuote?.text.length || 0;
            wpm = totalSeconds > 0 ? Math.round((state.totalTypedChars / 5) / (totalSeconds / 60)) : 0;
            accuracy = state.totalTypedChars > 0 ? Math.round(((state.totalTypedChars - (state.filteredQuotes.length - state.clearedQuestions)) / state.totalTypedChars) * 100) : 100;
            break;
        default: // Normal
            state.totalTypedChars += quoteInputElement.value.length;
            score = state.cumulativeScore;
            wpm = Math.round((score / 5) / 1);
            accuracy = state.totalTypedChars > 0 ? Math.round((score / state.totalTypedChars) * 100) : 0;
            break;
    }

    state.cumulativeScore = score;
    state.wpm = wpm;
    state.accuracy = accuracy;

    saveScore(state.gameMode, state.difficulty, state.category, score, wpm, accuracy);
    showResultModal(score, wpm, accuracy);
}

export function showResultModal(score: number, wpm: number, accuracy: number): void {
    resultDifficultyElement.innerText = `${state.gameMode} / ${state.difficulty} / ${state.category}`;

    const wpmItem = resultWpmElement.parentElement!;
    const accuracyItem = resultAccuracyElement.parentElement!;
    const scoreLabel = resultScoreElement.previousElementSibling!;

    if (state.gameMode === 'TimeAttack') {
        scoreLabel.textContent = 'クリアタイム:';
        resultScoreElement.innerText = formatTime(score);
        wpmItem.style.display = 'block';
        accuracyItem.style.display = 'block';
        resultWpmElement.innerText = String(wpm);
        resultAccuracyElement.innerText = `${accuracy}%`;
    } else if (state.gameMode === 'Survival') {
        scoreLabel.textContent = 'スコア:';
        resultScoreElement.innerText = String(score);
        wpmItem.style.display = 'none';
        accuracyItem.style.display = 'none';
    } else { // Normal
        scoreLabel.textContent = 'スコア:';
        resultScoreElement.innerText = String(score);
        wpmItem.style.display = 'block';
        accuracyItem.style.display = 'block';
        resultWpmElement.innerText = String(wpm);
        resultAccuracyElement.innerText = `${accuracy}%`;
    }

    displayHighScores(state.gameMode, state.difficulty, state.category);
    resultModal.style.display = 'block';
}