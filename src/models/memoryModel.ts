import connection from "../config/db"
import { ResultSetHeader } from "mysql2";
import { RowDataPacket } from "mysql2";

type MemoryWithImages = {
  id: number;
  date: string;
  title: string;
  memory: string;
  category:string;
  color:string;
  imageUrl: string[];
};
/*type MemoryRow = {
  id: number;
  date: string;
  title: string;
  memory: string;
  category:string;
  image_path: string | null;
};*/
const categoryColorMap: Record<string, string> = {
  live: "#FF6B6B",
  goods: "#FFD93D",
  communication: "#6BCB77",
  annivarsary: "#4D96FF",
  activity: "#9D4EDD"
};

export const registerMemoryModel=async(memory:string,title:string,category:string,date:string,imageUrl:string[]):Promise<void>=>{
const conn=await connection.getConnection()
try{
    await conn.beginTransaction();
    const [result]=await conn.execute<ResultSetHeader>('insert into memories (date,memory,title,category) values (?,?,?,?)',[date,memory,title,category])
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
export const deleteMemoryModel=async(id:string):Promise<void>=>{
const conn=await connection.getConnection();
try{
  await conn.beginTransaction();
  await conn.execute('delete from memories where id=?',[id]);
  await conn.execute('delete from memory_images where memory_id=?',[id]) 
}catch(error){
    await conn.rollback();
    throw error

}finally{
    conn.release();
}

}

export const fetchMemoryModel=async():Promise<MemoryWithImages[]>=>{
  
    const [rows]=await connection.execute<RowDataPacket[]>('select m.id,m.date,m.category,m.title,m.memory,mi.image_path from memories m left join memory_images mi on m.id=mi.memory_id')
    const memoryMap = new Map<number, MemoryWithImages>();

  for (const row of rows) {
    if (!memoryMap.has(row.id)) {
      memoryMap.set(row.id, {
        id: row.id,
        date: row.date,
        title: row.title,
        memory: row.memory,
        category:row.category,
        imageUrl: [],
        color:categoryColorMap[row.category]
      });
    }
    if (row.image_path) {
      memoryMap.get(row.id)?.imageUrl.push(row.image_path);
    }
  }

  return Array.from(memoryMap.values());

}

export const updateMemoryModel=async(memory:string,title:string,date:string,category:string,imageUrl:string[],id:string):Promise<boolean>=>{
const conn=await connection.getConnection();
try{
await conn.beginTransaction();
await conn.execute('UPDATE memories set memory=?,title=?,date=?,category=? where id=?',[memory,title,date,category,id])
await conn.execute('DELETE FROM memory_images where memory_id=?',[id])
for(let i=0;i<imageUrl.length;i++){
await conn.execute('INSERT INTO memory_images (memory_id,image_path) values (?,?)',[id,imageUrl[i]])
}
await conn.commit();
return true;
}catch(error){
await conn.rollback();
throw error;
}finally{
conn.release()
}
}