// 費用カテゴリの共有定数。プルダウン生成・バリデーション・（将来の）集計がここを参照する。
// カテゴリの追加・変更はこの配列の編集のみで完結する（DB変更不要）。
// ※ 実データ投入後にキーを変えると古いデータが宙に浮くため、本格運用前に確定させること。

export type CostCategory = {
  key: string;
  label: string;
};

export const COST_CATEGORIES: readonly CostCategory[] = [
  { key: "goods", label: "グッズ" },
  { key: "transport", label: "交通費" },
  { key: "food", label: "飲食" },
  { key: "hotel", label: "宿泊" },
  { key: "ticket", label: "チケット" },
] as const;

// key の一覧（バリデーションでの存在チェックに使う）
export const COST_CATEGORY_KEYS: readonly string[] = COST_CATEGORIES.map(
  (c) => c.key
);

// key が定数に存在するか判定する
export const isValidCostCategory = (key: string): boolean =>
  COST_CATEGORY_KEYS.includes(key);

// key から日本語ラベルを取得する（未定義なら key をそのまま返す）
export const getCostCategoryLabel = (key: string): string =>
  COST_CATEGORIES.find((c) => c.key === key)?.label ?? key;
