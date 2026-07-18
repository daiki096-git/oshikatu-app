import { Request, Response } from "express"
import memoryService from "../services/memoryService";
import { isValidCostCategory } from "../config/costCategories";
import { MemoryCost } from "../models/memoryModel";

const MAX_COST_AMOUNT = 9999999;

// FormData の JSON文字列フィールド costs をパースし、型付き配列に変換・検証する。
// 不正時は Error(message) を throw し、呼び出し側で 400 に振り分ける。
const parseCosts = (raw: unknown): MemoryCost[] => {
    if (raw === undefined || raw === null || raw === "") {
        return [];
    }
    if (typeof raw !== "string") {
        throw new Error("INVALID_COST_FORMAT");
    }
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        throw new Error("INVALID_COST_FORMAT");
    }
    if (!Array.isArray(parsed)) {
        throw new Error("INVALID_COST_FORMAT");
    }
    const seen = new Set<string>();
    const costs: MemoryCost[] = [];
    for (const item of parsed) {
        if (typeof item !== "object" || item === null) {
            throw new Error("INVALID_COST_FORMAT");
        }
        const category = (item as { category?: unknown }).category;
        const rawAmount = (item as { amount?: unknown }).amount;
        if (typeof category !== "string" || !isValidCostCategory(category)) {
            throw new Error("INVALID_COST_CATEGORY");
        }
        if (typeof rawAmount !== "number" && typeof rawAmount !== "string") {
            throw new Error("INVALID_COST_AMOUNT");
        }
        const amount = typeof rawAmount === "number" ? rawAmount : Number(rawAmount);
        if (!Number.isInteger(amount) || amount <= 0 || amount > MAX_COST_AMOUNT) {
            throw new Error("INVALID_COST_AMOUNT");
        }
        if (seen.has(category)) {
            throw new Error("DUPLICATE_COST_CATEGORY");
        }
        seen.add(category);
        costs.push({ category, amount });
    }
    return costs;
};

// 費用バリデーションのエラーを日本語メッセージ付き 400 レスポンスへ変換する。該当しなければ false。
const handleCostValidationError = (error: unknown, res: Response): boolean => {
    if (!(error instanceof Error)) {
        return false;
    }
    switch (error.message) {
        case "INVALID_COST_FORMAT":
            res.status(400).json({ message: "費用の形式が正しくありません" });
            return true;
        case "INVALID_COST_CATEGORY":
            res.status(400).json({ message: "費用カテゴリが正しくありません" });
            return true;
        case "INVALID_COST_AMOUNT":
            res.status(400).json({ message: "金額は1以上の整数で入力してください" });
            return true;
        case "DUPLICATE_COST_CATEGORY":
            res.status(400).json({ message: "同じ費用カテゴリは登録できません" });
            return true;
        default:
            return false;
    }
};

export const registerMemoryController = async (req: Request, res: Response) => {
    try {
        const costs = parseCosts(req.body.costs);
        const result=await memoryService.register({
            memory: req.body.memory,
            title: req.body.title,
            date: req.body.date,
            category: req.body.category,
            costs: costs,
            files: req.files as Express.Multer.File[]
        })

        res.status(201).json({ message: "登録に成功しました", imageUrl: result.imageUrl })

    } catch (error) {
        console.error(error);
        if (handleCostValidationError(error, res)) {
            return;
        }
         if (error instanceof Error) {
        switch (error.message) {
            case "S3_UPLOAD_FAILED":
                return res.status(500).json({
                    message: "ファイルのアップロードに失敗しました"
                });

            case "DB_UPDATE_FAILED":
                return res.status(500).json({
                    message: "データベースの更新に失敗しました"
                });
        }
    }
        return res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
}

export const deleteMemoryController = async (req: Request, res: Response) => {
    try {
        await memoryService.delete(req.params.id);
        res.status(200).json({ message: "削除に成功しました" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "削除に失敗しました" });
    }
}
    
export const fetchMemoryController = async (_req: Request, res: Response) => {
    try {
        const events = await memoryService.fetch();
        res.status(200).json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
};

export const updateMemoryController = async (req: Request, res: Response) => {
    try {
    const costs = parseCosts(req.body.costs);
    const result= await memoryService.update({
        id: req.body.id,
        memory: req.body.memory,
        date: req.body.date,
        costs: costs,
        category: req.body.category,
        title: req.body.title,
        files: req.files as Express.Multer.File[]|undefined
    })
    return res.status(201).json({ message: "更新に成功しました", imageUrl: result })
} catch (error) {
    console.error(error);
    if (handleCostValidationError(error, res)) {
        return;
    }
    if (error instanceof Error) {
        switch (error.message) {
            case "S3_UPLOAD_FAILED":
                return res.status(500).json({
                    message: "ファイルのアップロードに失敗しました"
                });

            case "DB_UPDATE_FAILED":
                return res.status(500).json({
                    message: "更新に失敗しました"
                });
        }
    }
    return res.status(500).json({ message: "サーバーエラーが発生しました" });
}
}