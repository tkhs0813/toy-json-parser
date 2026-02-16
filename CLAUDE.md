# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

多言語でJSONパーサーを実装する学習用モノレポ。各言語ごとにサブディレクトリを持ち、テストデータはgit submoduleで共有する。

## Commands (TypeScript)

```bash
# 初回セットアップ（サブモジュール取得必須）
git submodule update --init
cd typescript && npm install

# テスト
cd typescript && npm test              # 全テスト実行
cd typescript && npx vitest run -t "y_" # パターン指定で実行

# ビルド
cd typescript && npm run build
```

## Architecture

- **モノレポ構成**: 各言語が独立したディレクトリ(`typescript/`, 将来は`go/`, `rust/`等)
- **共有テストデータ**: `vendor/JSONTestSuite/` (git submodule) — [nst/JSONTestSuite](https://github.com/nst/JSONTestSuite)の318個のJSONファイル
  - `y_*`: 有効なJSON（パース成功必須）
  - `n_*`: 無効なJSON（パース失敗必須）
  - `i_*`: 実装依存（成功/失敗どちらでもよい）

### TypeScript実装

- `typescript/src/parser.ts`: 手書きの再帰降下パーサー。クロージャベースで`pos`を共有し、`parseValue()`から各型のパース関数にディスパッチする構造
- `typescript/src/parser.spec.ts`: JSONTestSuiteの全ファイルを`it.each`で回すパラメタライズドテスト
- テストランナー: Vitest / ESM (`"type": "module"`)
- `tsconfig.json`の`exclude`でテストファイル(`*.test.ts`, `*.spec.ts`)をビルドから除外

## Conventions

- 言語は日本語で記述する（コメント、ドキュメント、コミットメッセージ）
- 新しい言語を追加する場合はルートディレクトリに言語名のディレクトリを作り、`vendor/JSONTestSuite/test_parsing/`を参照するテストを書く
