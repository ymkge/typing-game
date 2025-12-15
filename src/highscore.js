import { highscoreListElement } from './dom.js';

export function getHighScores(difficulty, category) {
    const scoresJSON = localStorage.getItem(`highScores_${difficulty}_${category}`);
    return scoresJSON ? JSON.parse(scoresJSON) : [];
}

export function saveScore(difficulty, category, score, wpm, accuracy) {
    const highScores = getHighScores(difficulty, category);
    const newScore = { score, wpm, accuracy, date: new Date().toLocaleDateString() };

    highScores.push(newScore);
    highScores.sort((a, b) => b.score - a.score);
    highScores.splice(5);

    localStorage.setItem(`highScores_${difficulty}_${category}`, JSON.stringify(highScores));
}

export function displayHighScores(difficulty, category) {
    const highScores = getHighScores(difficulty, category);
    highscoreListElement.innerHTML = '';

    if (highScores.length === 0) {
        highscoreListElement.innerHTML = '<li>まだハイスコアはありません。</li>';
        return;
    }

    highScores.forEach(score => {
        const li = document.createElement('li');
        li.innerText = `スコア: ${score.score} - WPM: ${score.wpm} - 正答率: ${score.accuracy}% (${score.date})`;
        highscoreListElement.appendChild(li);
    });
}
