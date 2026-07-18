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

//年間集計用の型。SUMは対象0件のときNULLになり得るのでnullを許容する
type yearlySummary={
    count:number,
    cost:string|null
}

//指定年の活動回数(count)と費用合計(cost)を1行で返す
export const fetchYearlyChartModel=async(year:string):Promise<yearlySummary[]>=>{
    const [rows]=await connection.execute('select COUNT(*) as count, sum(cost) as cost from memories where YEAR(date)=? AND date <= CURDATE()',[year])
    return rows as yearlySummary[];
}