import { Request, Response } from "express"
import memoryService from "../services/memoryService";

export const registerMemoryController = async (req: Request, res: Response) => {
    try {
        const result=await memoryService.register({
            memory: req.body.memory,
            title: req.body.title,
            date: req.body.date,
            category: req.body.category,
            cost: Number(req.body.cost),
            files: req.files as Express.Multer.File[]
        })
        
        res.status(201).json({ message: "登録に成功しました", imageUrl: result.imageUrl })

    } catch (error) {
        console.error(error);
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
    const result= await memoryService.update({
        id: req.body.id,
        memory: req.body.memory,
        date: req.body.date,
        cost: Number(req.body.cost),
        category: req.body.category,
        title: req.body.title,
        files: req.files as Express.Multer.File[]|undefined
    })
    return res.status(201).json({ message: "更新に成功しました", imageUrl: result })
} catch (error) {
    console.error(error);
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