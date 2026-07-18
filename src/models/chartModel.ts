import connection from "../config/db"
type categoryCount={
    category:string,
    count:number,
    cost:string
}

export const fetchChartModel=async(year:string,month:string):Promise<categoryCount[]>=>{
    // 活動回数は memories から取得（memory_costs と JOIN すると費用行数分だけ回数が膨らむため）
    const [countRows]=await connection.execute('select category,COUNT(*) as count from memories where YEAR(date)=? AND MONTH(date)=? AND date <= CURDATE() group by category order by category',[year,month])
    // 費用は memory_costs.amount を memory カテゴリ別に集計（集計元を memories.cost から切替）
    const [costRows]=await connection.execute('select m.category as category, sum(mc.amount) as cost from memory_costs mc join memories m on mc.memory_id = m.id where YEAR(m.date)=? AND MONTH(m.date)=? AND m.date <= CURDATE() group by m.category',[year,month])
    const counts=countRows as { category:string, count:number }[];
    const costs=costRows as { category:string, cost:string }[];
    const costMap=new Map<string, string>();
    for(const c of costs){
        costMap.set(c.category, c.cost);
    }
    // 回数の行を基準に費用をカテゴリで紐付ける。費用が無いカテゴリは "0"
    return counts.map((r):categoryCount => ({ category: r.category, count: r.count, cost: costMap.get(r.category) ?? "0" }));
}

//年間集計用の型。SUMは対象0件のときNULLになり得るのでnullを許容する
type yearlySummary={
    count:number,
    cost:string|null
}

//指定年の活動回数(count)と費用合計(cost)を1行で返す
export const fetchYearlyChartModel=async(year:string):Promise<yearlySummary[]>=>{
    // 回数は memories、費用は memory_costs.amount 由来へ切替（JOIN による回数の水増しを避けるため別クエリ）
    const [countRows]=await connection.execute('select COUNT(*) as count from memories where YEAR(date)=? AND date <= CURDATE()',[year])
    const [costRows]=await connection.execute('select sum(mc.amount) as cost from memory_costs mc join memories m on mc.memory_id = m.id where YEAR(m.date)=? AND m.date <= CURDATE()',[year])
    const count=(countRows as { count:number }[])[0]?.count ?? 0;
    const cost=(costRows as { cost:string|null }[])[0]?.cost ?? null;
    return [{ count, cost }];
}

//費用カテゴリ別ランキング用の型
type costByCategory={
    category:string,
    amount:string
}

//指定年月の費用カテゴリ別合計を高い順で返す
export const fetchCostByCategoryModel=async(year:string,month:string):Promise<costByCategory[]>=>{
    const [rows]=await connection.execute('select mc.category as category, sum(mc.amount) as amount from memory_costs mc join memories m on mc.memory_id = m.id where YEAR(m.date)=? AND MONTH(m.date)=? AND m.date <= CURDATE() group by mc.category order by amount desc',[year,month])
    return rows as costByCategory[];
}
