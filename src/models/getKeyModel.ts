import connection from "../config/db"

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