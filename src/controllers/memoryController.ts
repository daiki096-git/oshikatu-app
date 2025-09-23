import { Request, Response } from "express"
import { registerMemoryModel, fetchMemoryModel } from "../models/memoryModel";
import s3 from "../config/s3"
import {v4 as uuidv4} from 'uuid'
import path from 'path'

export const registerMemoryController = async (req: Request, res: Response) => {
    try {
        const memory = req.body.memory;
        const title = req.body.title;
        const date = req.body.date;
        const files = req.files as Express.Multer.File[];
        let imageUrl: string[]=[]
        if (files && files.length > 0) {
            for (const file of files) {
                const ext=path.extname(file.originalname)
                const fileName = `${Date.now()}_${uuidv4()}${ext}`;
                const params = {
                    Bucket: process.env.AWS_S3_BUCKET!,
                    Key: fileName,
                    Body: file?.buffer,
                    ContentType: file?.mimetype
                }
                try {
                    const result = await s3.upload(params).promise();
                    imageUrl.push(result.Location)
                } catch (error) {
                    return res.status(500).json({ message: "ファイルのアップロードに失敗しました" });
                }
            }
        }
        await registerMemoryModel(memory, title, date,imageUrl)
        res.status(201).json({ message: "登録に成功しました",imageUrl:imageUrl })

    } catch (error) {
        return res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
}
export const fetchMemoryController = async (req: Request, res: Response) => {
    try {
        const result = await fetchMemoryModel();
        res.status(200).json(result)

    } catch (error) {

    }

}

export const updateMemoryController=async(req:Request,res:Response)=>{
    console.log("updateMemoryController called")
    

    
}