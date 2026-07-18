import connection from "../config/db"
type homeData={
    count:number,
    cost:string

}

export const fetchHomeModel=async(year:number,month:number):Promise<[homeData[], { title:string, date: Date }[]]>=>{
    // 活動回数は memories から。費用を memory_costs と JOIN すると費用行数分だけ回数が膨らむため回数と費用は別クエリで取得する
    const [countRows]=await connection.execute('select COUNT(*) as count from memories where YEAR(date)=? AND MONTH(date)=? AND date <= CURDATE()',[year,month])
    // 費用は memory_costs.amount 由来へ切替。memories と JOIN し対象月で絞る。対象0件は COALESCE で "0" に整形
    const [costRows]=await connection.execute('select COALESCE(sum(mc.amount),0) as cost from memory_costs mc join memories m on mc.memory_id = m.id where YEAR(m.date)=? AND MONTH(m.date)=? AND m.date <= CURDATE()',[year,month])
    const count=(countRows as { count:number }[])[0]?.count ?? 0;
    const cost=(costRows as { cost:string }[])[0]?.cost ?? "0";
    const [dateRows]= await connection.execute('select title, date from memories where  date > CURDATE() order by date limit 1')
    return [[{ count, cost }], dateRows as { title:string, date: Date }[]];
}