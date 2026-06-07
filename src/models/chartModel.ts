import connection from "../config/db"
type categoryCount={
    category:string,
    count:number,
    cost:string
}

export const fetchChartModel=async(year:string,month:string):Promise<categoryCount[]>=>{
    const [rows]=await connection.execute('select category,COUNT(*) as count,sum(cost) as cost from memories where YEAR(date)=? AND MONTH(date)=? AND date <= CURDATE() group by category order by category',[year,month])
    console.log(rows)
    return rows as categoryCount[];
}