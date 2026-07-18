# CLAUDE.md

## プロジェクト概要

このプロジェクトは、推し活の思い出を管理するWebアプリケーションです。

### 技術スタック

* Node.js
* Express
* TypeScript
* EJS
* MySQL
* Docker
* AWS S3（画像保存）

---

## 開発コマンド

```bash
npm run dev
npm run build
npm start
docker-compose up
```

---

## アーキテクチャ

MVCアーキテクチャを採用しています。

```
Route
 ↓
Controller
 ↓
(場合によってServices)
 ↓
Model
 ↓
MySQL
 ↓
Controller
 ↓
View

```

### 各レイヤーの責務

#### Route

* ルーティングのみ行う
* ビジネスロジックを書かない

#### Controller

* リクエストの受け取り
* バリデーション
* Modelの呼び出し
* Servicesの呼び出し
* ViewまたはJSONの返却

#### Model

* SQLのみ記述する
* データ取得・登録・更新・削除を担当する
* 複数テーブル更新時はトランザクションを使用する

#### Services
* memoryControllerファイル経由のみServicesフォルダで分離する
* Servicesにはビジネスロジックを記載する
* 今後もビジネスロジックを記載するときはServicesに新規でファイル作成してコードを記載する


---

## コーディングルール

### TypeScript

* `any`は使用しない
* 型を明示する
* async/awaitを使用する
* Promiseチェーンよりasync/awaitを優先する

### JavaScript

* constを優先する
* letは必要な場合のみ使用する
* varは禁止

### 命名規則

* camelCaseを使用する
* クラス名はPascalCase
* ファイル名は既存ルールに合わせる

### SQL

* SQLインジェクション対策としてプレースホルダーを使用する
* ORMは使用しない
* 生SQLで実装する

### エラーハンドリング

* try/catchを使用する
* ユーザーには日本語のメッセージを表示する
* サーバーには原因をログ出力する

---

## View

* 共通レイアウトは`layout.ejs`
* 各ページでは`<html>`、`<head>`、`<body>`を書かない
* `express-ejs-layouts`を利用する
* 共通ナビゲーションは`layout.ejs`で管理する

---

## データベース

* MySQLを使用する
* コネクションプールを利用する
* 複数テーブル更新時は必ずTransactionを使用する

---

## ファイルアップロード

* multerを使用する
* AWS S3へ保存する
* DB更新失敗時はS3もロールバックする

---

## UI

* ユーザー向けメッセージは日本語
* デザインはシンプルで見やすさを優先する
* レスポンシブ対応を考慮する

---

## 開発フロー（planner / developer / reviewer）

コード変更の依頼は、原則として planner → developer → reviewer のフローで対応する。ただし規模で線引きする。

* **harness で対応**: 新機能・改修・バグ対応など、**ロジックを伴う変更**や**複数ファイルにまたがる変更**。
* **直接対応（harness不要）**: 1行程度の文言変更・色替え・軽微なスタイル調整など、ロジックを伴わず影響が局所的な些末な修正。手早く直す。
* 迷う場合は harness 側に寄せる。

* **planner**（`.claude/agents/planner.md`）: 要件をタスク分解し、優先順位・実装順・完了条件を決めて計画書を作る。実装はしない。
* **developer**（`.claude/agents/developer.md`）: 計画に沿って実装し、reviewer の指摘を修正する。
* **reviewer**（`.claude/agents/reviewer.md`）: バグ・保守性・セキュリティ・パフォーマンスと完了条件を確認し、指摘を developer に返す。
* このフローは `/feature <依頼内容>` で自動起動できる。
* **git 運用**: harness で対応する変更は、**main を基点に作業ブランチを作成**してから実装し、完了後に **commit → push → PR作成（base main）→ GitHub上のレビュー（Claude等）の指摘対応** まで行う。ブランチ名は依頼内容から自動生成する。**各 git 操作（ブランチ作成・commit・push・PR作成・修正のpush）は実行前にユーザーへ確認する**。
* **ユーザーに確認するのは、判断で結論が変わる点（仕様・デザイン、および重要な技術判断）と、git 操作の前**。命名やインデントなど些末な点は確認せずデフォルトで進める。
* 破壊的・不可逆な操作が必要な場合も、実行前に別途確認する。

---

## Claudeへの依頼

コードを生成・修正する際は以下を必ず守ること。

* 既存の設計を崩さない
* 必要以上にリファクタリングしない
* 変更箇所を最小限にする
* 可読性を優先する
* セキュリティを考慮する
* パフォーマンスを意識する
* 重複コードを作らない
* TypeScriptの型安全性を維持する
* ExpressのMVC構成を維持する
* 生成したコードは実装理由も簡潔に説明する
* 不要なライブラリは追加しない
* コメントは必要最小限にする
* コードレビューではバグ、保守性、セキュリティ、パフォーマンスの観点で確認する
