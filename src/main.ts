import {
    modeButtons,
    difficultyButtons,
    categoryButtons,
    restartButton,
    pauseButton,
    endGameButton,
    quoteInputElement,
    closeModalButton,
    playAgainButton,
    resultModal,
    shareButton,
    soundButton
} from './dom.ts';
import { state, GameMode } from './state.ts';
import {
    loadAllQuotes,
    showModeSelection,
    showDifficultySelection,
    showCategorySelection,
    startGame,
    togglePause,
    confirmEndGame,
    handleInput
} from './game-logic.ts';
import { setSoundEnabled } from './audio.ts';

function setupEventListeners(): void {
    modeButtons.forEach((button: HTMLButtonElement) => {
        button.addEventListener('click', () => {
            state.gameMode = (button.dataset.mode as GameMode) || '';
            showDifficultySelection();
        });
    });

    difficultyButtons.forEach((button: HTMLButtonElement) => {
        button.addEventListener('click', () => {
            state.difficulty = button.dataset.difficulty || '';
            showCategorySelection();
        });
    });

    categoryButtons.forEach((button: HTMLButtonElement) => {
        button.addEventListener('click', () => {
            state.category = button.dataset.category || '';
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
        showModeSelection();
    });
    window.addEventListener('click', (event: MouseEvent) => {
        if (event.target instanceof HTMLElement && event.target === resultModal) {
            resultModal.style.display = 'none';
        }
    });

    shareButton.addEventListener('click', () => {
        const { difficulty, category, cumulativeScore, wpm, accuracy } = state;
        const text = `タイピングゲームでハイスコアを達成しました！
難易度: ${difficulty} (${category})
スコア: ${cumulativeScore}
WPM: ${wpm}
正答率: ${accuracy}%

#タイピングゲーム`;
        const encodedText = encodeURIComponent(text);
        const url = `https://twitter.com/intent/tweet?text=${encodedText}`;
        window.open(url, '_blank');
    });

    soundButton.addEventListener('click', () => {
        state.isSoundEnabled = !state.isSoundEnabled;
        setSoundEnabled(state.isSoundEnabled);
        soundButton.innerText = state.isSoundEnabled ? '🔊' : '🔇';
    });
}

function initializeGame(): void {
    loadAllQuotes();
    setupEventListeners();
    showModeSelection();
    // Initialize sound state
    setSoundEnabled(state.isSoundEnabled);
    soundButton.innerText = state.isSoundEnabled ? '🔊' : '🔇';
}

// --- Start the application ---
initializeGame();