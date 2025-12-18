// --- DOM Elements ---
export const quoteDisplayElement = document.getElementById('quote-display') as HTMLDivElement;
export const quoteInputElement = document.getElementById('quote-input') as HTMLTextAreaElement;
export const timerElement = document.getElementById('timer') as HTMLDivElement;
export const scoreElement = document.getElementById('score') as HTMLDivElement;
export const restartButton = document.getElementById('restart-button') as HTMLButtonElement;
export const pauseButton = document.getElementById('pause-button') as HTMLButtonElement;
export const endGameButton = document.getElementById('end-game-button') as HTMLButtonElement;
export const quoteSummaryElement = document.getElementById('quote-summary') as HTMLDivElement;

export const modeSelectionElement = document.getElementById('mode-selection') as HTMLDivElement;
export const difficultySelectionElement = document.getElementById('difficulty-selection') as HTMLDivElement;
export const categorySelectionElement = document.getElementById('category-selection') as HTMLDivElement;
export const gameAreaElement = document.getElementById('game-area') as HTMLDivElement;
export const modeButtons = document.querySelectorAll('.mode-button') as NodeListOf<HTMLButtonElement>;
export const difficultyButtons = document.querySelectorAll('.difficulty-button') as NodeListOf<HTMLButtonElement>;
export const categoryButtons = document.querySelectorAll('.category-button') as NodeListOf<HTMLButtonElement>;

// --- Game Stats ---
export const timerStatElement = document.getElementById('timer-stat') as HTMLDivElement;
export const scoreStatElement = document.getElementById('score-stat') as HTMLDivElement;
export const questionCounterStatElement = document.getElementById('question-counter-stat') as HTMLDivElement;
export const questionCounterElement = document.getElementById('question-counter') as HTMLDivElement;

// --- Modal Elements ---
export const resultModal = document.getElementById('result-modal') as HTMLDivElement;
export const closeModalButton = document.querySelector('.close-button') as HTMLSpanElement;
export const playAgainButton = document.getElementById('play-again-button') as HTMLButtonElement;
export const resultDifficultyElement = document.getElementById('result-difficulty') as HTMLSpanElement;
export const resultScoreElement = document.getElementById('result-score') as HTMLSpanElement;
export const resultWpmElement = document.getElementById('result-wpm') as HTMLSpanElement;
export const resultAccuracyElement = document.getElementById('result-accuracy') as HTMLSpanElement;
export const highscoreListElement = document.getElementById('highscore-list') as HTMLOListElement;

// --- Countdown Elements ---
export const countdownOverlay = document.getElementById('countdown-overlay') as HTMLDivElement;
export const countdownText = document.getElementById('countdown-text') as HTMLSpanElement;

// --- Progress Bar Elements ---
export const progressBar = document.getElementById('progress-bar') as HTMLDivElement;

// --- Share Button ---
export const shareButton = document.getElementById('share-button') as HTMLButtonElement;

// --- Sound Button ---
export const soundButton = document.getElementById('sound-button') as HTMLButtonElement;
