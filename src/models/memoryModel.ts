import connection from "../config/db"
import { ResultSetHeader } from "mysql2";
import { RowDataPacket } from "mysql2";

export type MemoryCost = {
  category: string;
  amount: number;
};

export type MemoryTask = {
  id: number;
  task_name: string;
  is_completed: number;
  due_date: string | null;
};

// 登録・更新時の入力（idはDB採番のため持たない）
export type MemoryTaskInput = {
  task_name: string;
  is_completed: number;
  due_date: string | null;
};

type MemoryWithImages = {
  id: number;
  date: string;
  title: string;
  memory: string;
  cost: number;
  costs: MemoryCost[];
  tasks: MemoryTask[];
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

export const registerMemoryModel=async(memory:string,title:string,category:string,date:string,costs:MemoryCost[],tasks:MemoryTaskInput[],imageUrl:string[]):Promise<void>=>{
const conn=await connection.getConnection()
try{
    await conn.beginTransaction();
    // memories.cost は段階的残置。フェーズ2まで集計が cost を参照するため明細の合計を書き込む
    const total=costs.reduce((sum,c)=>sum+c.amount,0)
    const [result]=await conn.execute<ResultSetHeader>('insert into memories (date,memory,title,category,cost) values (?,?,?,?,?)',[date,memory,title,category,total])
    const memoryId=result.insertId;
    for(const url of imageUrl){
        await conn.execute('insert into memory_images (memory_id,image_path) values (?,?)',[memoryId,url])
    }
    for(const c of costs){
        await conn.execute('insert into memory_costs (memory_id,category,amount) values (?,?,?)',[memoryId,c.category,c.amount])
    }
    // 準備TODOも費用と同じく明細一括INSERT
    for(const t of tasks){
        await conn.execute('insert into memory_tasks (memory_id,task_name,is_completed,due_date) values (?,?,?,?)',[memoryId,t.task_name,t.is_completed,t.due_date])
    }
    await conn.commit();
}catch(error){
    console.error(error);
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
  const [result]=await conn.execute('delete from memories where id=?',[id]);
  const affectedRow=(result as any).affectedRows
  if (affectedRow === 0) {
      throw new Error("データが存在しません");
  }
  await conn.execute('delete from memory_images where memory_id=?',[id]) 
  await conn.commit();
}catch(error){
    await conn.rollback();
    throw error

}finally{
    conn.release();
}

}

export const fetchMemoryModel=async():Promise<MemoryWithImages[]>=>{
  
    const [rows]=await connection.execute<RowDataPacket[]>('select m.id,m.date,m.category,m.title,m.memory,m.cost,mi.image_path from memories m left join memory_images mi on m.id=mi.memory_id')
    const memoryMap = new Map<number, MemoryWithImages>();

  for (const row of rows) {
    if (!memoryMap.has(row.id)) {
      memoryMap.set(row.id, {
        id: row.id,
        date: row.date,
        title: row.title,
        memory: row.memory,
        category:row.category,
        cost: row.cost,
        costs: [],
        tasks: [],
        imageUrl: [],
        color:categoryColorMap[row.category]
      });
    }
    if (row.image_path) {
      memoryMap.get(row.id)?.imageUrl.push(row.image_path);
    }
  }

  // 費用明細は別クエリで取得して memory_id で紐付ける
  // （memory_images との JOIN は画像×費用の直積で行が増えるため避ける）
  const [costRows]=await connection.execute<RowDataPacket[]>('select memory_id,category,amount from memory_costs')
  for (const cost of costRows) {
    memoryMap.get(cost.memory_id)?.costs.push({ category: cost.category, amount: cost.amount });
  }

  // 準備TODOも別クエリで取得して memory_id で紐付ける（画像・費用との直積を避ける）
  // due_date は DATE 型を YYYY-MM-DD 文字列で受け取り（NULL可）、未完了→完了・id昇順で並べる
  const [taskRows]=await connection.execute<RowDataPacket[]>("select memory_id,id,task_name,is_completed,date_format(due_date,'%Y-%m-%d') as due_date from memory_tasks order by is_completed asc, id asc")
  for (const task of taskRows) {
    memoryMap.get(task.memory_id)?.tasks.push({
      id: task.id,
      task_name: task.task_name,
      is_completed: task.is_completed,
      due_date: task.due_date
    });
  }

  return Array.from(memoryMap.values());

}

export const updateMemoryModel=async(memory:string,title:string,date:string,costs:MemoryCost[],tasks:MemoryTaskInput[],category:string,imageUrl:string[],id:string):Promise<boolean>=>{
const conn=await connection.getConnection();
try{
await conn.beginTransaction();
// memories.cost は段階的残置。フェーズ2まで集計が cost を参照するため明細の合計を書き込む
const total=costs.reduce((sum,c)=>sum+c.amount,0)
await conn.execute('UPDATE memories set memory=?,title=?,date=?,category=?,cost=? where id=?',[memory,title,date,category,total,id])
await conn.execute('DELETE FROM memory_images where memory_id=?',[id])
for(let i=0;i<imageUrl.length;i++){
await conn.execute('INSERT INTO memory_images (memory_id,image_path) values (?,?)',[id,imageUrl[i]])
}
// 費用明細は全削除→再挿入（画像と同じパターン）
await conn.execute('DELETE FROM memory_costs where memory_id=?',[id])
for(const c of costs){
await conn.execute('INSERT INTO memory_costs (memory_id,category,amount) values (?,?,?)',[id,c.category,c.amount])
}
// 準備TODOも全削除→再挿入（費用と同型）
await conn.execute('DELETE FROM memory_tasks where memory_id=?',[id])
for(const t of tasks){
await conn.execute('INSERT INTO memory_tasks (memory_id,task_name,is_completed,due_date) values (?,?,?,?)',[id,t.task_name,t.is_completed,t.due_date])
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

