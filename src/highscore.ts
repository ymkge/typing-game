import { highscoreListElement } from './dom.ts';

interface ScoreEntry {
    score: number;
    wpm: number;
    accuracy: number;
    date: string;
}

export function getHighScores(difficulty: string, category: string): ScoreEntry[] {
    const scoresJSON = localStorage.getItem(`highScores_${difficulty}_${category}`);
    return scoresJSON ? JSON.parse(scoresJSON) : [];
}

export function saveScore(difficulty: string, category: string, score: number, wpm: number, accuracy: number): void {
    const highScores = getHighScores(difficulty, category);
    const newScore: ScoreEntry = { score, wpm, accuracy, date: new Date().toLocaleDateString() };

    highScores.push(newScore);
    highScores.sort((a: ScoreEntry, b: ScoreEntry) => b.score - a.score);
    highScores.splice(5);

    localStorage.setItem(`highScores_${difficulty}_${category}`, JSON.stringify(highScores));
}

export function displayHighScores(difficulty: string, category: string): void {
    const highScores = getHighScores(difficulty, category);
    highscoreListElement.innerHTML = '';

    if (highScores.length === 0) {
        highscoreListElement.innerHTML = '<li>まだハイスコアはありません。</li>';
        return;
    }

    highScores.forEach((score: ScoreEntry) => {
        const li = document.createElement('li');
        li.innerText = `スコア: ${score.score} - WPM: ${score.wpm} - 正答率: ${score.accuracy}% (${score.date})`;
        highscoreListElement.appendChild(li);
    });
}
