import connection from "../config/db"
type homeData={
    count:number,
    cost:string
    
}

export const fetchHomeModel=async(year:number,month:number):Promise<[homeData[], { title:string, date: Date }[]]>=>{
    const [rows]=await connection.execute('select COUNT(*) as count,sum(cost) as cost from memories where YEAR(date)=? AND MONTH(date)=? AND date <= CURDATE() group by category order by category',[year,month])
    const [dateRows]= await connection.execute('select title, date from memories where  date > CURDATE() order by date limit 1')  
    return [rows as homeData[], dateRows as { title:string, date: Date }[]];
}