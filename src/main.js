import {
    difficultyButtons,
    categoryButtons,
    restartButton,
    pauseButton,
    endGameButton,
    quoteInputElement,
    closeModalButton,
    playAgainButton,
    resultModal
} from './dom.js';
import { state } from './state.js';
import {
    loadAllQuotes,
    showDifficultySelection,
    showCategorySelection,
    startGame,
    togglePause,
    confirmEndGame,
    handleInput
} from './game-logic.js';

function setupEventListeners() {
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            state.difficulty = button.dataset.difficulty;
            showCategorySelection();
        });
    });

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            state.category = button.dataset.category;
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

function initializeGame() {
    loadAllQuotes();
    setupEventListeners();
    showDifficultySelection();
}

// --- Start the application ---
initializeGame();
