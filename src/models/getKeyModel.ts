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

export const getKeyModel=async(id:string)=>{
 const [rows]=await connection.execute('select image_path from memory_images where memory_id=?',[id])
 console.log(rows);
 const typeRows=rows as {image_path:string}[]
 const data:string[]=[];
 for(let i=0;i<typeRows.length;i++){
    data.push(new URL(typeRows[i].image_path).pathname.slice(1));
 }
 return data
 

}