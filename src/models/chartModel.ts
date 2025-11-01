import connection from "../config/db"
type categoryCount={
    category:string,
    count:number
}

export const fetchChartModel=async(year:string,month:string):Promise<categoryCount[]>=>{
    const [rows]=await connection.execute('select category,COUNT(*) as count from memories where YEAR(date)=? AND MONTH(date)=? group by category order by category',[year,month])
    return rows as categoryCount[];
}