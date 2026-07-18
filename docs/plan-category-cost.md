# 実装計画: イベント費用のカテゴリ別入力・集計対応

> ステータス: **計画確定・未実装**（この計画は着手前の設計メモ。実装は未開始）
> 再開時: 「この計画のフェーズ1から実装して」と指示すれば planner→developer→reviewer で進められる。

## ゴール
イベント（memory）の費用を、単一テキストボックスの合計金額入力から「費用カテゴリごとの明細」に変更する。1イベントにつき同一費用カテゴリは1件のみ登録でき、追加・編集・削除ができ、年間分析（chart画面）で費用カテゴリ別に合計金額を集計・表示できる状態にする。カレンダーのモーダルでは費用の合計も表示する。

## 確定した設計判断（要ユーザー確認の結果）
| 項目 | 決定 | 補足 |
|---|---|---|
| 保存方式 | **A：イベント保存と一体** | 費用はモーダルでクライアント保持→保存時にmemory本体とまとめて送信→トランザクションで memory_costs を全削除→再挿入（既存の画像アップロードと同じパターン）。新規イベントのID未採番問題を回避、変更最小 |
| 過去の cost データ | **破棄**（移行しない） | 過去データはカテゴリ内訳が無く固定カテゴリに割り当て不可。学習・個人開発でデータ量も少ない |
| memories.cost 列 | **段階的に残置** | すぐDROPせず全参照を memory_costs に切替→動作確認後に列削除を別途検討（参照漏れバグ回避） |
| 集計画面の費用表示 | **費用を2軸で表示（すべて月別・セレクタ連動）** | ①費用の円グラフ＝大きな種別（memoryカテゴリ：イベント/交流…）別を**残す**（集計元を memories.cost → memory_costs 合計に切替）。②その下に費用カテゴリ（グッズ/交通費…）別の**金額一覧（ランキング・高い順）**を追加。活動回数の円グラフも現状維持。※要件は「年間分析」だが、月別（年月セレクタ連動）で表示する方針にユーザーが決定 |
| カテゴリ管理 | **コード内の定数1箇所** | key↔日本語ラベルの配列で定義。プルダウン・バリデーション・集計が参照。カテゴリ変更は定数編集のみ（DB変更不要） |
| 追加要件 | **モーダルに費用合計を表示** | 追加した明細の合計金額をモーダル内に表示 |

## 仕様の細部（確定）
1. **過去イベントの費用は分析・モーダルから消える**（破棄の帰結）。改修前イベントは memory_costs 行が無いため、集計（home今月の支出／chart月別・年間費用・費用円グラフ・費用一覧）で0扱い、モーダルを開いても費用は空。旧 memories.cost の値は列に残るが表示・集計に使わない。必要な過去分は手動で入力し直す。→ ユーザー了承済み。
2. **金額**: 円なので小数なし・正の整数のみ。0円/マイナス不可。上限は現実的に大きめ（例 9,999,999円）。全角数字入力は半角へ正規化。
3. **費用ゼロ件のイベント**: 費用を1件も追加せずに保存可能（費用は任意、後から追加できる）。
4. **費用の2軸表示**: 上記「確定した設計判断」の集計表示欄を参照（種別別の円グラフ＋費用カテゴリ別の金額一覧、いずれも月別）。
5. 細部のデフォルト: 編集(✏️)＝その行を入力欄に戻して更新／削除(🗑️)＝一覧から除去（保存時に確定）。プルダウンは定数の定義順、金額一覧は高い順。追加時・編集時とも同一カテゴリ重複を弾く。

## カテゴリ（暫定・実運用開始前に確定させる）
コード定数の初期値。後から差し替え可能だが、**実データ投入後にキーを変えると古いデータが宙に浮く**ため本格運用前に確定すること。

```ts
export const COST_CATEGORIES = [
  { key: "goods",     label: "グッズ" },
  { key: "transport", label: "交通費" },
  { key: "food",      label: "飲食" },
  { key: "hotel",     label: "宿泊" },
  { key: "ticket",    label: "チケット" },
];
```

## DB設計
新テーブル `memory_costs`（1費用=1行の縦持ち）。既存 `memory_images` の作法に合わせる:

```sql
CREATE TABLE `memory_costs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `memory_id` int NOT NULL,
  `category` varchar(32) NOT NULL,
  `amount` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_memory_category` (`memory_id`, `category`),
  KEY `memory_id` (`memory_id`),
  CONSTRAINT `memory_costs_ibfk_1`
    FOREIGN KEY (`memory_id`) REFERENCES `memories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```
- `unique(memory_id, category)` … 「同一カテゴリ1件のみ」をDBで担保
- `amount` は正の整数（バリデーションで担保）

### テーブル追加の適用方法（マイグレーション基盤なし）
マイグレーションツールは無い。**接続先DBが2通りあり、両者は別のMySQLインスタンス**なので、片方に適用してももう片方には反映されない。使う方に個別適用する。

| プロファイル | DB_HOST | 接続先 |
|---|---|---|
| `.env` / `.env.localfile` | localhost:3306 | ホストのローカルMySQL |
| `.env.container` | db:3306（ホストは3309公開） | DockerコンテナのMySQL（oshikatu_db） |

**※ 現在の開発は `.env`＝ローカルホスト（localhost:3306）を使用。よって主対象はローカルMySQL。**

1. **使っているDBに手動で1回適用**（追加DDLなのでデータは消えない）。上記CREATE文を `db/create_memory_costs.sql` に保存して流す:
   - ローカル（ホスト）MySQL ← **現在こちら**:
     ```bash
     mysql -u root -p oshikatu < db/create_memory_costs.sql
     ```
   - Docker の MySQL（コンテナ運用時のみ）:
     ```bash
     docker exec -i oshikatu_db mysql -u root -p oshikatu < db/create_memory_costs.sql
     ```
   - 両方の環境で動かすなら両方に適用する。
2. **将来のまっさら環境用に初期化SQLへ追記**: 上記CREATE文を `backup.sql`（Dockerの初期化スクリプト。`/docker-entrypoint-initdb.d/`、データ領域が空の初回起動時のみ実行）にも書き足す。加えて参照用の `schema.sql` も更新して実DBと揃える。

**注意**:
- `backup.sql` を編集しても既存DBには反映されない（初回のみ実行のため）。既存DBには必ず手順1の手動適用が要る。
- `docker compose down -v` はボリュームごと削除＝全データ消去なので、移行手段には使わない。

## タスク一覧（実装順）
| # | タスク | フェーズ | 完了条件 | 触る箇所 |
|---|--------|---------|----------|----------|
| 1 | `memory_costs` テーブル作成SQL＋schema.sql追記 | 1 | テーブル定義・適用SQL・unique制約あり | schema.sql / 新規SQL |
| 2 | 費用カテゴリ定数（key↔label）を追加 | 1 | 1ファイルで定義、Controller/EJS/集計から参照可 | 新規 config/constants |
| 3 | Model: 登録/更新を明細対応（トランザクションで全削除→再挿入）、取得は明細を別クエリで紐付け（画像JOINとの直積回避） | 1 | 複数明細を登録・更新・取得でき、同一カテゴリ重複はunique制約で弾かれる | src/models/memoryModel.ts |
| 4 | Service/Controller: DTOの cost:number を明細配列に変更、パース・型明示 | 1 | register/update が明細配列を受け取りfetchに明細が含まれる。any不使用 | memoryController.ts / memoryService.ts |
| 5 | モーダルUI（index.ejs）: `#cost`廃止→「＋費用を追加」＋カテゴリプルダウン＋金額＋明細一覧（✏️🗑️）＋費用合計表示 | 1 | モーダルで費用を追加/編集/削除でき合計が出る。既存イベントは登録済み明細を表示。保存時に明細配列を送信 | src/views/index.ejs |
| 6 | バリデーション: 金額（正の整数）・カテゴリ固定値・同一カテゴリ重複不可（サーバ＋クライアント＋DB uniqueの三重） | 1 | 不正金額/不正カテゴリ/重複で日本語エラー、登録されない | memoryController.ts / index.ejs |
| 7 | 集計元切替: home「今月の支出」・chart年間合計費用の集計元を memory_costs.amount に変更 | 2 | home・年間合計が memory_costs 由来で正しい合計 | homeModel.ts / homeController.ts / chartModel.ts / chartController.ts |
| 8 | 費用を2軸で集計・表示（すべて月別）。①費用円グラフ＝memoryカテゴリ別（集計元を memory_costs 合計に切替、円グラフ自体は維持）②費用カテゴリ別の金額一覧を円グラフ下に追加。回数円グラフは維持 | 2 | 選択年月で、種別別の費用円グラフが表示され、その下に費用カテゴリ別の金額が高い順で一覧表示される | chartModel.ts / chartController.ts / chart.ejs |
| 9 | 体裁: 一覧の見た目・カンマ区切り等 | 2 | 見た目が整いレスポンシブが崩れない | index.ejs / chart.ejs (+css) |
| 10 | （任意・後日）memories.cost の DROP COLUMN | 後 | 全参照が memory_costs 化された後に列削除 | schema/SQL |

## フェーズ分割
- **フェーズ1（カレンダー側）**: タスク1〜6。カテゴリ別に費用を追加・編集・削除でき、モーダルに合計表示。機能の中心。全体の約6〜7割。
- **フェーズ2（集計側）**: タスク7〜9。集計画面の費用カテゴリ別一覧・home/年間の集計元切替。約3〜4割。

## 規模感（実測ベース）
- `cost` 参照: 10ファイル・計58箇所
- 新規ファイル: 2（作成SQL・カテゴリ定数）／修正ファイル: 約9
- 正味の新規・変更行数: ざっくり **300〜450行**
- 最重量は index.ejs のモーダルUI（費用の追加/一覧/編集/削除/合計＋クライアント検証）で体感4割
- 位置づけ: 「1行修正」ではなく DBからUIまで一通り触る**機能追加レベル（中規模）**

## 難所・注意点
- `fetchMemoryModel` は memory_images を LEFT JOIN して集約している。memory_costs も JOIN すると画像×費用の直積で行が増えるため、**費用は別クエリで取得して memory_id で紐付ける**（実装時の落とし穴）。
- 費用は memory に紐づくが新規作成時は memory_id 未採番 → 保存方式A（クライアント保持→保存時一括）で回避。
- memoryカテゴリ（イベント/グッズ/交流/記念日/個人活動）と費用カテゴリ（グッズ/交通費/…）は別物。集計は「回数=memoryカテゴリ」「金額=費用カテゴリ」の二軸。
- CLAUDE.md 準拠: MVC、生SQL＋プレースホルダー、複数テーブル更新はトランザクション、any禁止、layout.ejs前提、S3ロールバック踏襲。

## 参照した主なファイル
src/models/memoryModel.ts / src/services/memoryService.ts / src/controllers/memoryController.ts / src/routes/memoryRoute.ts / src/models/chartModel.ts / src/controllers/chartController.ts / src/views/chart.ejs / src/views/index.ejs / src/models/homeModel.ts / src/controllers/homeController.ts / schema.sql
