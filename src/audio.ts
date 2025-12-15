// Web Audio APIのコンテキストを初期化
let audioContext: AudioContext | null = null;
let soundEnabled = true; // デフォルトでサウンドを有効にする

function getAudioContext(): AudioContext {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
}

// 指定された周波数と長さでビープ音を再生するコア関数
function playBeep(frequency: number, duration: number, volume: number = 0.3): void {
    if (!soundEnabled || !getAudioContext()) return;

    const context = getAudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = 'sine'; // サイン波
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);

    gainNode.gain.setValueAtTime(volume, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + duration / 1000);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration / 1000);
}

// --- Public API ---

export function setSoundEnabled(isEnabled: boolean): void {
    soundEnabled = isEnabled;
    // サウンドが有効になったときにAudioContextを初期化（ユーザー操作がきっかけで呼ばれることを想定）
    if (isEnabled && !audioContext) {
        getAudioContext();
    }
}

export function playTypeSound() {
    playBeep(1200, 50, 0.1); // 高めの周波数、短い音
}

export function playErrorSound() {
    playBeep(200, 150, 0.2); // 低めの周波数、少し長い音
}

export function playCorrectSound() {
    playBeep(1500, 100, 0.3);
    setTimeout(() => playBeep(2000, 100, 0.3), 120);
}

export function playFinishSound() {
    playBeep(800, 50, 0.3);
    setTimeout(() => playBeep(600, 50, 0.3), 80);
    setTimeout(() => playBeep(400, 150, 0.3), 160);
}
