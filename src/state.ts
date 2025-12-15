export interface Quote {
    id: number;
    text: string;
    difficulty: string;
    category: string;
    japanese: string;
}

interface GameState {
    allQuotes: Quote[];
    filteredQuotes: Quote[];
    difficulty: string;
    category: string;
    startTime: Date | null;
    timerInterval: number | null; // setIntervalの戻り値はnumber
    isPaused: boolean;
    timeRemaining: number;
    currentQuote: Quote | null;
    cumulativeScore: number;
    totalTypedChars: number;
    wpm: number;
    accuracy: number;
    isSoundEnabled: boolean;
}

export const state: GameState = {
    allQuotes: [],
    filteredQuotes: [],
    difficulty: '',
    category: '',
    startTime: null,
    timerInterval: null,
    isPaused: false,
    timeRemaining: 60,
    currentQuote: null,
    cumulativeScore: 0,
    totalTypedChars: 0,
    wpm: 0,
    accuracy: 0,
    isSoundEnabled: true,
};
