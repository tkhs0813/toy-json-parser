# Toy JSON Parser

さまざまなプログラミング言語で JSON パーサーを実装する学習用リポジトリです。
TDD（テスト駆動開発）の手法を用いて、各言語で JSON パーサーを一から実装していきます。

## セットアップ

```bash
git clone --recurse-submodules https://github.com/<user>/toy-json-parser.git

# すでにクローン済みの場合
git submodule update --init
```

## ディレクトリ構造

```
toy-json-parser/
├── vendor/
│   └── JSONTestSuite/   # テストデータ (git submodule)
├── typescript/           # TypeScript 実装
└── ...                   # 他の言語も追加予定
```

## 実装一覧

| 言語 | ディレクトリ | 状態 |
|------|-------------|------|
| [TypeScript](./typescript/) | `typescript/` | 実装済み |

## ライセンス

MIT
