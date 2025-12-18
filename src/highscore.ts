import { highscoreListElement } from './dom.ts';
import { GameMode } from './state.ts';

interface ScoreEntry {
    score: number; // For Normal/Survival, this is points. For TimeAttack, this is milliseconds.
    wpm: number;
    accuracy: number;
    date: string;
}

function formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10); // 10ms単位
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

export function getHighScores(gameMode: GameMode | '', difficulty: string, category: string): ScoreEntry[] {
    const key = `highScores_${gameMode}_${difficulty}_${category}`;
    const scoresJSON = localStorage.getItem(key);
    return scoresJSON ? JSON.parse(scoresJSON) : [];
}

export function saveScore(gameMode: GameMode | '', difficulty: string, category: string, score: number, wpm: number, accuracy: number): void {
    if (!gameMode) return;
    const highScores = getHighScores(gameMode, difficulty, category);
    const newScore: ScoreEntry = { score, wpm, accuracy, date: new Date().toLocaleDateString() };

    highScores.push(newScore);

    // Sort based on game mode
    if (gameMode === 'TimeAttack') {
        highScores.sort((a, b) => a.score - b.score); // Ascending for time
    } else {
        highScores.sort((a, b) => b.score - a.score); // Descending for points
    }

    highScores.splice(5);

    const key = `highScores_${gameMode}_${difficulty}_${category}`;
    localStorage.setItem(key, JSON.stringify(highScores));
}

export function displayHighScores(gameMode: GameMode | '', difficulty: string, category: string): void {
    if (!gameMode) return;
    const highScores = getHighScores(gameMode, difficulty, category);
    highscoreListElement.innerHTML = '';

    if (highScores.length === 0) {
        highscoreListElement.innerHTML = '<li>まだハイスコアはありません。</li>';
        return;
    }

    highScores.forEach((scoreEntry: ScoreEntry) => {
        const li = document.createElement('li');
        switch (gameMode) {
            case 'TimeAttack':
                li.innerText = `タイム: ${formatTime(scoreEntry.score)} - WPM: ${scoreEntry.wpm} (${scoreEntry.date})`;
                break;
            case 'Survival':
                li.innerText = `スコア: ${scoreEntry.score} (${scoreEntry.date})`;
                break;
            default: // Normal
                li.innerText = `スコア: ${scoreEntry.score} - WPM: ${scoreEntry.wpm} - 正答率: ${scoreEntry.accuracy}% (${scoreEntry.date})`;
                break;
        }
        highscoreListElement.appendChild(li);
    });
}
