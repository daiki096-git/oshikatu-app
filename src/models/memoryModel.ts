import connection from "../config/db"
import { ResultSetHeader } from "mysql2";
import { RowDataPacket } from "mysql2";

type MemoryWithImages = {
  id: number;
  date: string;
  title: string;
  memory: string;
  imageUrl: string[];
};
type MemoryRow = {
  id: number;
  date: string;
  title: string;
  memory: string;
  image_path: string | null;
};

export const registerMemoryModel=async(memory:string,title:string,date:string,imageUrl:string[]):Promise<void>=>{
const conn=await connection.getConnection()
try{
    await conn.beginTransaction();
    const [result]=await conn.execute<ResultSetHeader>('insert into memories (date,memory,title) values (?,?,?)',[date,memory,title])
    const memoryId=result.insertId;
    console.log("aaaaaaa")
    for(const url of imageUrl){
        await conn.execute('insert into memory_images (memory_id,image_path) values (?,?)',[memoryId,url])
    }
    await conn.commit();
}catch(error){
    await conn.rollback();
    throw error

}finally{
    conn.release();
}

}
export const fetchMemoryModel=async():Promise<MemoryWithImages[]>=>{
  
    const [rows]=await connection.execute<RowDataPacket[]&MemoryRow[]>('select m.id,m.date,m.title,m.memory,mi.image_path from memories m left join memory_images mi on m.id=mi.memory_id')
    const memoryMap = new Map<number, MemoryWithImages>();

  for (const row of rows) {
    if (!memoryMap.has(row.id)) {
      memoryMap.set(row.id, {
        id: row.id,
        date: row.date,
        title: row.title,
        memory: row.memory,
        imageUrl: [],
      });
    }
    if (row.image_path) {
      memoryMap.get(row.id)?.imageUrl.push(row.image_path);
    }
  }

  return Array.from(memoryMap.values());

}