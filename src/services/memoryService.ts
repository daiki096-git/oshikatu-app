import { registerMemoryModel, fetchMemoryModel, updateMemoryModel, deleteMemoryModel } from "../models/memoryModel";
import s3 from "../config/s3"
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import { getKeyModel } from "../models/getKeyModel";

type s3UploadParam = {

    Bucket: string,
    Key: string,
    Body: Buffer,
    ContentType: string

}

type registerMemoryDto = {
    memory: string,
    title: string,
    date: string,
    category: string,
    cost: number,
    files: Express.Multer.File[]
}
type updateMemoryDto = {
    id: string,
    memory: string,
    title: string,
    date: string,
    category: string,
    cost: number,
    files: Express.Multer.File[] | undefined
}

class MemoryService {
    async register(data: registerMemoryDto) {
        try {
            let imageUrl: string[] = []
            if (data.files && data.files.length > 0) {
                for (const file of data.files) {
                    const ext = path.extname(file.originalname)
                    const fileName = `${Date.now()}_${uuidv4()}${ext}`;
                    const params: s3UploadParam = {
                        Bucket: process.env.AWS_S3_BUCKET!,
                        Key: fileName,
                        Body: file.buffer,
                        ContentType: file.mimetype
                    }
                    try {
                        const result = await s3.upload(params).promise();
                        imageUrl.push(result.Location)
                    } catch (error) {
                        console.error("ファイルのアップロードに失敗しました", error);
                        throw new Error("S3_UPLOAD_FAILED");
                    }
                }
            }
            await registerMemoryModel(data.memory, data.title, data.category, data.date, data.cost, imageUrl)
            return { imageUrl: imageUrl }
        } catch (error) {
            console.error("データベースの更新に失敗しました", error);
            throw new Error("DB_UPDATE_FAILED");
        }
    }
    async delete(id: string) {
        await deleteMemoryModel(id);
        return
    }
    async fetch() {
        const memories = await fetchMemoryModel();

        const events = memories.map(memory => ({
            title: memory.title,
            start: memory.date,
            color: memory.color,
            allDay: true,
            extendedProps: {
                id: memory.id.toString(),
                cost: memory.cost,
                memory: memory.memory,
                imageUrl: memory.imageUrl,
                category: memory.category
            }
        }));
        return events
    }
    async update(data: updateMemoryDto) {

        let imageUrl: string[] = []
        let deleteUrl: string[] = []
        //s3にファイルをアップロード
        if (data.files && data.files.length > 0) {
            for (const file of data.files) {
                const ext = path.extname(file.originalname)
                const fileName = `${Date.now()}_${uuidv4()}${ext}`;
                deleteUrl.push(fileName)
                const params: s3UploadParam = {
                    Bucket: process.env.AWS_S3_BUCKET!,
                    Key: fileName,
                    Body: file.buffer,
                    ContentType: file.mimetype
                }
                try {
                    const result = await s3.upload(params).promise();
                    imageUrl.push(result.Location)
                    return imageUrl
                } catch (error) {
                    await Promise.all(deleteUrl.map(key =>
                        s3.deleteObject({ Bucket: process.env.AWS_S3_BUCKET!, Key: key }).promise()
                    ));
                    throw new Error("S3_UPLOAD_FAILED");
                }
            }
        }
        //S3削除のためにkeyを取得
        const result = await getKeyModel(data.id);
        //DB更新
        const updateResult = await updateMemoryModel(data.memory, data.title, data.date, data.cost, data.category, imageUrl, data.id)
        if (!updateResult) {
            //S3にアップロードしたファイルを削除
            await Promise.all(deleteUrl.map(key =>
                s3.deleteObject({ Bucket: process.env.AWS_S3_BUCKET!, Key: key }).promise()
            ));
            throw new Error("DB_UPDATE_FAILED");
        }
        //s3の既存のファイルを削除

        await Promise.all(result.map(key =>
            s3.deleteObject({ Bucket: process.env.AWS_S3_BUCKET!, Key: key }).promise()
        ))

    }
}



export default new MemoryService()