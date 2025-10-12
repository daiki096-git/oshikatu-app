import { Request, Response } from "express"
import { registerMemoryModel, fetchMemoryModel, updateMemoryModel, deleteMemoryModel } from "../models/memoryModel";
import s3 from "../config/s3"
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import { getKeyModel } from "../models/getKeyModel";

export const registerMemoryController = async (req: Request, res: Response) => {
    try {
        if(req.body.action==="delete"){
            const id=req.body.id;
            await deleteMemoryModel(id);
            res.status(201).json({message:"削除に成功しました"})
            return
            
        }
        const memory = req.body.memory;
        const title = req.body.title;
        const date = req.body.date;
        const files = req.files as Express.Multer.File[];
        let imageUrl: string[] = []
        if (files && files.length > 0) {
            for (const file of files) {
                const ext = path.extname(file.originalname)
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
        await registerMemoryModel(memory, title, date, imageUrl)
        res.status(201).json({ message: "登録に成功しました", imageUrl: imageUrl })

    } catch (error) {
        return res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
}
export const fetchMemoryController = async (req: Request, res: Response) => {
  try {
    const memories = await fetchMemoryModel();
    const events = memories.map(memory => ({
      id: memory.id.toString(),         
      title: memory.title,
      start: memory.date,
      allDay: true,
      extendedProps: {
        id: memory.id.toString(),
        memory: memory.memory,
        imageUrl: memory.imageUrl
      }
    }));

    res.status(200).json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "サーバーエラーが発生しました" });
  }
};

export const updateMemoryController = async (req: Request, res: Response) => {
    console.log("updateMemoryController called");
    const id = req.body.id;
    const memory = req.body.memory;
    const date = req.body.date;
    const title = req.body.title;
    const files = req.files as Express.Multer.File[] | undefined;
    let imageUrl: string[] = []
    let deleteUrl: string[] = []
    //s3にファイルをアップロード
    if (files && files.length > 0) {
        for (const file of files) {
            const ext = path.extname(file.originalname)
            const fileName = `${Date.now()}_${uuidv4()}${ext}`;
            deleteUrl.push(fileName)
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
                await Promise.all(deleteUrl.map(key =>
                    s3.deleteObject({ Bucket: process.env.AWS_S3_BUCKET!, Key: key }).promise()
                ));
                return res.status(500).json({ message: "ファイルのアップロードに失敗しました" });
            }
        }
    }
    //S3削除のためにkeyを取得
    const result = await getKeyModel(id);
    //DB更新
    const updateResult = await updateMemoryModel(memory, title, date, imageUrl, id)
    if (!updateResult) {
        //S3にアップロードしたファイルを削除
        await Promise.all(deleteUrl.map(key =>
            s3.deleteObject({ Bucket: process.env.AWS_S3_BUCKET!, Key: key }).promise()
        ));
        return res.status(500).json({ message: "DB更新に失敗しました" })
    }
    //s3の既存のファイルを削除

    await Promise.all(result.map(key =>
        s3.deleteObject({ Bucket: process.env.AWS_S3_BUCKET!, Key: key }).promise()
    ))
    return res.status(201).json({ message: "更新に成功しました",imageUrl:imageUrl})

}