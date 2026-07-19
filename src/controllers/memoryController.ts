import { Request, Response } from "express"
import memoryService from "../services/memoryService";
import { isValidCostCategory } from "../config/costCategories";
import { MemoryCost, MemoryTaskInput } from "../models/memoryModel";

const MAX_COST_AMOUNT = 9999999;
const MAX_TASK_NAME_LENGTH = 255;
const MAX_TASKS = 100;
// due_date は YYYY-MM-DD 形式のみ許可（過去日も可）
const DUE_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

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

// 実在する日付か（YYYY-MM-DD 形式は正規表現で確認済みの前提）を検証する
const isRealDate = (value: string): boolean => {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

// FormData の JSON文字列フィールド tasks をパースし、型付き配列に変換・検証する（parseCosts と同型）。
// 不正時は Error(message) を throw し、呼び出し側で 400 に振り分ける。
const parseTasks = (raw: unknown): MemoryTaskInput[] => {
    if (raw === undefined || raw === null || raw === "") {
        return [];
    }
    if (typeof raw !== "string") {
        throw new Error("INVALID_TASK_FORMAT");
    }
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        throw new Error("INVALID_TASK_FORMAT");
    }
    if (!Array.isArray(parsed)) {
        throw new Error("INVALID_TASK_FORMAT");
    }
    // タスクは重複可のため件数が無制限になりやすい。大量INSERT防止に上限を設ける
    if (parsed.length > MAX_TASKS) {
        throw new Error("INVALID_TASK_COUNT");
    }
    const tasks: MemoryTaskInput[] = [];
    for (const item of parsed) {
        if (typeof item !== "object" || item === null) {
            throw new Error("INVALID_TASK_FORMAT");
        }
        const rawName = (item as { task_name?: unknown }).task_name;
        const rawCompleted = (item as { is_completed?: unknown }).is_completed;
        const rawDueDate = (item as { due_date?: unknown }).due_date;
        if (typeof rawName !== "string") {
            throw new Error("INVALID_TASK_NAME");
        }
        const taskName = rawName.trim();
        if (taskName.length < 1 || taskName.length > MAX_TASK_NAME_LENGTH) {
            throw new Error("INVALID_TASK_NAME");
        }
        // is_completed は真偽値／0／1 を許容し 0|1 へ正規化する
        let isCompleted: number;
        if (rawCompleted === true || rawCompleted === 1) {
            isCompleted = 1;
        } else if (rawCompleted === false || rawCompleted === 0 || rawCompleted === undefined || rawCompleted === null) {
            isCompleted = 0;
        } else {
            throw new Error("INVALID_TASK_COMPLETED");
        }
        // due_date は空・null は未設定、指定時は YYYY-MM-DD 形式かつ実在日
        let dueDate: string | null;
        if (rawDueDate === undefined || rawDueDate === null || rawDueDate === "") {
            dueDate = null;
        } else if (typeof rawDueDate === "string" && DUE_DATE_PATTERN.test(rawDueDate) && isRealDate(rawDueDate)) {
            dueDate = rawDueDate;
        } else {
            throw new Error("INVALID_TASK_DUE_DATE");
        }
        tasks.push({ task_name: taskName, is_completed: isCompleted, due_date: dueDate });
    }
    return tasks;
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

// 準備TODOバリデーションのエラーを日本語メッセージ付き 400 レスポンスへ変換する。該当しなければ false。
const handleTaskValidationError = (error: unknown, res: Response): boolean => {
    if (!(error instanceof Error)) {
        return false;
    }
    switch (error.message) {
        case "INVALID_TASK_FORMAT":
            res.status(400).json({ message: "準備TODOの形式が正しくありません" });
            return true;
        case "INVALID_TASK_COUNT":
            res.status(400).json({ message: "準備TODOは100件までです" });
            return true;
        case "INVALID_TASK_NAME":
            res.status(400).json({ message: "準備TODOは1〜255文字で入力してください" });
            return true;
        case "INVALID_TASK_COMPLETED":
            res.status(400).json({ message: "準備TODOの完了状態が正しくありません" });
            return true;
        case "INVALID_TASK_DUE_DATE":
            res.status(400).json({ message: "準備TODOの期限が正しくありません" });
            return true;
        default:
            return false;
    }
};

export const registerMemoryController = async (req: Request, res: Response) => {
    try {
        const costs = parseCosts(req.body.costs);
        const tasks = parseTasks(req.body.tasks);
        const result=await memoryService.register({
            memory: req.body.memory,
            title: req.body.title,
            date: req.body.date,
            category: req.body.category,
            costs: costs,
            tasks: tasks,
            files: req.files as Express.Multer.File[]
        })

        res.status(201).json({ message: "登録に成功しました", imageUrl: result.imageUrl })

    } catch (error) {
        console.error(error);
        if (handleCostValidationError(error, res)) {
            return;
        }
        if (handleTaskValidationError(error, res)) {
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
    const tasks = parseTasks(req.body.tasks);
    const result= await memoryService.update({
        id: req.body.id,
        memory: req.body.memory,
        date: req.body.date,
        costs: costs,
        tasks: tasks,
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
    if (handleTaskValidationError(error, res)) {
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