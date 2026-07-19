import { Request, Response } from "express"
import { fetchChartModel, fetchYearlyChartModel, fetchMonthlyChartModel, fetchCostByCategoryModel } from "../models/chartModel";
import { getCostCategoryLabel } from "../config/costCategories";

//集計・分析ページを描画し、プルダウンの初期選択用に現在の年月を渡す
export const renderChartController = (_req: Request, res: Response) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    res.render('chart', { currentPage: 'chart', currentYear, currentMonth });
}

export const fetchChartController = async (req: Request, res: Response) => {
    try {
        const year = req.query.year as string;
        const month = req.query.month as string;
        const data = await fetchChartModel(year, month);
        if(!data || data.length === 0 || data[0].category === null)return res.status(404).json({ message: "データが存在しません" });
        let total = 0;
        let cost_total = 0;
        for (let i = 0; i < data.length; i++) {
            total += data[i].count
            let cost = 0;
            if(data[i].cost){
            cost = parseInt(data[i].cost)
            cost_total += cost || 0
            }
        }
        for (let i = 0; i < data.length; i++) {
            data[i].count = Math.floor(data[i].count / total * 100)
        }
        // 費用カテゴリ別ランキング（memory_costs 由来・高い順）。key→日本語ラベルは定数を参照
        const ranking = await fetchCostByCategoryModel(year, month);
        const costRanking = ranking.map((r) => ({ category: r.category, label: getCostCategoryLabel(r.category), amount: Number(r.amount) }));
        res.status(200).json({ data, total, cost_total, costRanking })
    } catch (error) {
        console.error("集計データの取得に失敗しました", error);
        res.status(500).json({ message: "集計データの取得に失敗しました" });
    }

}

//選択年の年間集計（活動回数・合計費用）をJSONで返す。月に依存しないため月別とは分離
export const fetchYearlyChartController = async (req: Request, res: Response) => {
    try {
        const year = req.query.year as string;
        const data = await fetchYearlyChartModel(year);
        const yearCount = data[0]?.count ?? 0;
        //SUM(cost)はmysql2から文字列で返るため数値化する。0件時はNULL→0に整形
        const yearCostTotal = Number(data[0]?.cost ?? 0);
        res.status(200).json({ yearCount, yearCostTotal });
    } catch (error) {
        console.error("年間集計の取得に失敗しました", error);
        res.status(500).json({ message: "年間集計の取得に失敗しました" });
    }
}

//選択年の月ごと集計（活動回数・費用）を1〜12月ぶんJSONで返す。年のみ依存のため月別円グラフとは分離
export const fetchMonthlyChartController = async (req: Request, res: Response) => {
    try {
        const year = req.query.year as string;
        // 未指定/不正な年はMySQLのバインドエラー（例外→500）を招くため、Model呼び出し前に弾く
        if (!/^\d{4}$/.test(year)) return res.status(400).json({ message: "年の指定が正しくありません" });
        const months = await fetchMonthlyChartModel(year);
        res.status(200).json({ months });
    } catch (error) {
        console.error("月別集計の取得に失敗しました", error);
        res.status(500).json({ message: "月別集計の取得に失敗しました" });
    }
}