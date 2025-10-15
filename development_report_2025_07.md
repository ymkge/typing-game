---
marp: true
theme: uncover
size: 16:9
paginate: true
style: |
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap');
  
  section {
    background-color: #2B2B2B;
    color: #E0E0E0;
    font-family: 'Noto Sans JP', sans-serif;
    padding: 60px;
    font-size: 28px;
  }

  h1, h2, h3 {
    color: #82AAFF;
    border-bottom: 2px solid #82AAFF;
    padding-bottom: 10px;
  }

  h1 {
    font-size: 2.6em;
    text-align: center;
  }

  h2 {
    font-size: 1.8em;
  }

  ul {
    list-style-type: none;
  }

  li::before {
    content: '✓';
    color: #82AAFF;
    margin-right: 15px;
  }

  code {
    background-color: #424242;
    color: #C3E88D;
    padding: 3px 6px;
    border-radius: 5px;
  }

  header, footer {
    position: absolute;
    left: 60px;
    right: 60px;
    color: #9E9E9E;
    font-size: 0.7em;
  }

  header {
    top: 30px;
  }

  footer {
    bottom: 30px;
  }
---

<style scoped>
  h1 {
    padding-top: 15%;
  }
</style>

<!-- header: '2025年7月度 開発状況報告' -->
<!-- footer: '© 2025 Your Company Name' -->

# 2025年7月度 開発状況報告

---

## サマリー

2025年7月は、複数の新規アプリケーション開発と、既存アプリケーションの機能改善が活発に行われました。特に`ymkge`氏による広範な開発がプロジェクトを大きく前進させました。

- **主な開発項目:**
    - 新規ゲーム開発: `invaders`, `tictactoe`, `block-breaker`, `puzzle`, `tetris`
    - 新規アプリケーション開発: `todo-app`, `character_chat_web`, `stock_analyzer`, `proofreading_app`
    - 機能改善: `proofreading_app`の多言語化、UI改善
- **担当者**:
    - `ymkge`: 主な開発を担当
    - `ymto`: プロジェクトの初期設定、ドキュメント更新を担当

---

## 担当者別詳細: ymkge (1/3)

### 新規ゲーム・アプリケーション開発

- **`invaders`**: ゲーム実装、リファクタリング、ドキュメント作成
- **`tictactoe`**: ゲーム実装、ドキュメント作成
- **`block-breaker`**: ゲーム実装
- **`puzzle`**: ゲームの初期実装、BGM機能・画像追加
- **`tetris`**: ゲームの初期実装

---

## 担当者別詳細: ymkge (2/3)

### 新規ゲーム・アプリケーション開発 (続き)

- **`todo-app`**: ToDoアプリケーションの実装
- **`character_chat_web`**: キャラクターチャットWebアプリの実装
- **`stock_analyzer`**: 日本株分析ツールの初期実装（RCI表示改善含む）
- **`proofreading_app`**: 校正アプリケーションの初期実装

---

## 担当者別詳細: ymkge (3/3)

### 機能改善・バグ修正

- **`proofreading_app`**:
    - 日本語への翻訳対応
    - `gemini-2.5` モデルを選択肢に追加
    - UI改善（背景色、文字色のモダン化）
    - 設定ファイル(`config.toml`)を用いたスタイリングへリファクタリング
    - `prompt.txt`へのパスを修正
    - 入力欄の文字色を黒に修正
- **`character_chat_web`**:
    - 画像(`placeholder.png`)のサイズ調整
- **その他**:
    - `README.md`の更新
    - `.gitignore`ファイルの追加

---

## 担当者別詳細: ymto

### プロジェクト管理・ドキュメント

- **プロジェクトの初期化**:
    - `Initial commit` を行い、プロジェクトを開始
- **ドキュメント管理**:
    - `README.md` の更新
