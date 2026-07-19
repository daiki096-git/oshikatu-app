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

//月別棒グラフ用の型（1〜12月ぶんを0埋めして返す）
type monthlyChart={
    month:number,
    count:number,
    cost:number
}

//指定年の月ごと活動回数・費用を1〜12月ぶん返す。無い月はcount:0/cost:0で0埋め
export const fetchMonthlyChartModel=async(year:string):Promise<monthlyChart[]>=>{
    // 回数は memories、費用は memory_costs.amount 由来へ切替（JOINによる回数の水増しを避けるため別クエリ）
    const [countRows]=await connection.execute('select MONTH(date) as month, COUNT(*) as count from memories where YEAR(date)=? AND date <= CURDATE() group by MONTH(date)',[year])
    const [costRows]=await connection.execute('select MONTH(m.date) as month, sum(mc.amount) as cost from memory_costs mc join memories m on mc.memory_id = m.id where YEAR(m.date)=? AND m.date <= CURDATE() group by MONTH(m.date)',[year])
    const counts=countRows as { month:number, count:number }[];
    const costs=costRows as { month:number, cost:string }[];
    const countMap=new Map<number, number>();
    for(const c of counts){
        countMap.set(c.month, c.count);
    }
    const costMap=new Map<number, string>();
    for(const c of costs){
        costMap.set(c.month, c.cost);
    }
    // SQLは活動のある月しか返さないため、1〜12月をループして無い月は0埋めする
    const result:monthlyChart[]=[];
    for(let m=1;m<=12;m++){
        // SUM(amount)はmysql2から文字列で返るためNum()で数値化する
        result.push({ month: m, count: countMap.get(m) ?? 0, cost: Number(costMap.get(m) ?? 0) });
    }
    return result;
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
