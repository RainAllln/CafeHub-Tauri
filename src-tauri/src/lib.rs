use chrono::{Local, NaiveDate, Datelike, Duration}; 
use mysql::prelude::*; 
use mysql::{params, Error as MySQLError, Pool, OptsBuilder, Opts, prelude::Queryable}; 
use rust_decimal::Decimal;
use rust_decimal::prelude::FromStr; 
use serde::{Deserialize, Serialize};
use tauri::State;

// --- struct 定义 ---
#[derive(Serialize, Deserialize, Clone)]
struct Account {
    id: i64,
    username: String,
    phone: Option<String>,
    gender: Option<i8>,
    join_time: Option<NaiveDate>, 
    balance: Option<Decimal>,
    user_type: i8,
}

#[derive(Deserialize)]
struct RegistrationData {
    username: String,
    password: String,
    phone: Option<String>,
    gender: Option<i8>, 
}

struct MySQLConfig {
    user: String,
    password: String,
    host: String,
    database: String,
}

impl MySQLConfig {
    fn new(user: String, password: String, host: String, database: String) -> Self {
        MySQLConfig { user, password, host, database }
    }
    fn format_url(&self) -> String {
        format!("mysql://{}:{}@{}/{}", self.user, self.password, self.host, self.database)
    }
}

#[derive(Serialize, Clone)]
struct MonthlyConsumption {
    month: String, 
    total: Decimal,
}

#[derive(Serialize, Clone)]
struct ConsumptionSummary {
    join_date: Option<NaiveDate>,         
    current_balance: Option<Decimal>,       
    total_consumption: Option<Decimal>,     
    latest_spending: Option<Decimal>,       
    yearly_consumption_trend: Vec<MonthlyConsumption>, 
}

// --- 新增用于营收统计的 struct ---
#[derive(Serialize, Clone, Default)] 
struct RevenueSummary {
    total_members: u64, // 会员总数
    new_members_this_month: u64, // 本月新增会员
}

#[derive(Serialize, Clone)]
struct ProductSales { // 用于后续商品销售分布
    name: String,               // 商品名称
    total_amount: Decimal,      // 商品总销售额
}

#[derive(Serialize, Clone)]
struct MonthlyIncome { // 用于后续年度收入趋势
    month: String, 
    income: Decimal,
}


// --- command 函数 ---
#[tauri::command]
fn login(username: String, password: String, mysql_pool: State<Pool>) -> Result<Account, String> {
    let mut conn = mysql_pool.get_conn().map_err(|e| format!("Failed to get DB connection: {}", e))?;
    let result: Result<Option<(i64, String, Option<String>, Option<i8>, Option<NaiveDate>, Option<Decimal>, i8)>, mysql::Error> = conn.exec_first("SELECT id, username, phone, gender, join_time, balance, user_type FROM account WHERE username = :username AND password = :password", params! {"username" => &username, "password" => &password,});
    match result {
        Ok(Some((id, uname, phone, gender, join_time, balance, user_type))) => {
            let account = Account { id, username: uname, phone, gender, join_time, balance, user_type };
            println!("Login successful for user: {}", username); 
            Ok(account)
        }
        Ok(None) => { println!("Login failed for user: {}", username); Err("Invalid username or password".to_string()) }
        Err(e) => { eprintln!("Database query failed for user {}: {}", username, e); Err(format!("Database query failed: {}", e)) }
    }
}

#[tauri::command]
fn register_user(data: RegistrationData, mysql_pool: State<Pool>) -> Result<String, String> {
    if data.username.is_empty() || data.password.is_empty() { return Err("Username and password cannot be empty".to_string()); }
    if let Some(gender) = data.gender { if gender != 0 && gender != 1 { return Err("Invalid gender value. Use 0 for Male or 1 for Female.".to_string()); } }
    let mut conn = mysql_pool.get_conn().map_err(|e| format!("Failed to get DB connection: {}", e))?;
    let current_date = Local::now().date_naive();
    let user_type: i8 = 1;
    let default_balance: Decimal = Decimal::new(0, 2);
    let result = conn.exec_drop("INSERT INTO account (username, password, phone, gender, join_time, balance, user_type) VALUES (:username, :password, :phone, :gender, :join_time, :balance, :user_type)", params! {"username" => &data.username, "password" => &data.password, "phone" => &data.phone, "gender" => &data.gender, "join_time" => current_date, "balance" => default_balance, "user_type" => user_type,});
    match result {
        Ok(_) => { println!("Successfully registered user: {}", data.username); Ok(format!("User '{}' registered successfully!", data.username)) }
        Err(e) => {
            eprintln!("Failed to register user {}: {}", data.username, e);
            if let MySQLError::MySqlError(ref mysql_err) = e { if mysql_err.code == 1062 { return Err(format!("Username '{}' already exists.", data.username)); } }
            Err(format!("Database error during registration: {}", e))
        }
    }
}

#[tauri::command]
async fn get_consumption_summary(account_id: i64, mysql_pool: State<'_, Pool>) -> Result<ConsumptionSummary, String> {
    let mut conn = mysql_pool.get_conn().map_err(|e| e.to_string())?;
    let account_info: Option<(Option<NaiveDate>, Option<Decimal>)> = conn.exec_first("SELECT join_time, balance FROM account WHERE id = :account_id", params! { "account_id" => account_id }).map_err(|e| e.to_string())?;
    let (join_date, current_balance) = match account_info { Some((jd, bal)) => (jd, bal), None => (None, None), };
    let total_consumption: Option<Decimal> = conn.exec_first("SELECT COALESCE(SUM(amount), 0.00) FROM transactions WHERE account_id = :account_id AND transaction_type = 'purchase'", params! { "account_id" => account_id }).map_err(|e| e.to_string())?.map(|(sum,)| sum);
    let latest_spending: Option<Decimal> = conn.exec_first("SELECT amount FROM transactions WHERE account_id = :account_id AND transaction_type = 'purchase' ORDER BY transaction_time DESC LIMIT 1", params! { "account_id" => account_id }).map_err(|e| e.to_string())?.map(|(amount,)| amount);
    let one_year_ago = (Local::now() - Duration::days(365)).date_naive();
    let yearly_trend_raw: Vec<(String, String)> = conn.exec(r"SELECT DATE_FORMAT(transaction_time, '%Y-%m') AS month, CAST(COALESCE(SUM(amount), 0.00) AS CHAR) AS monthly_total FROM transactions WHERE account_id = :account_id AND transaction_type = 'purchase' AND transaction_time >= :one_year_ago GROUP BY month ORDER BY month ASC", params! { "account_id" => account_id, "one_year_ago" => one_year_ago }).map_err(|e| e.to_string())?;
    let yearly_consumption_trend: Vec<MonthlyConsumption> = yearly_trend_raw.into_iter().map(|(month, total_str)| { MonthlyConsumption { month, total: Decimal::from_str(&total_str).unwrap_or_else(|_| Decimal::new(0, 2)), } }).collect();
    Ok(ConsumptionSummary { join_date, current_balance, total_consumption, latest_spending, yearly_consumption_trend })
}

// --- 获取收入get_revenue_summary command 函数 ---
#[tauri::command]
async fn get_revenue_summary(mysql_pool: State<'_, Pool>) -> Result<RevenueSummary, String> {
    let mut conn = mysql_pool.get_conn().map_err(|e| e.to_string())?;

    // 查询会员总数 (假设 user_type = 1 代表客户/会员)
    let total_members: u64 = conn.query_first(
        "SELECT COUNT(*) FROM account WHERE user_type = 1"
    ).map_err(|e| e.to_string())? 
     .unwrap_or(0); 

    // 查询本月新增会员数量 (从本月第一天开始计算)
    let new_members_this_month: u64 = conn.query_first(
        "SELECT COUNT(*) FROM account WHERE user_type = 1 AND join_time >= DATE_FORMAT(CURDATE(), '%Y-%m-01')"
    ).map_err(|e| e.to_string())?
     .unwrap_or(0); 

    // 构建并返回结果
    Ok(RevenueSummary {
        total_members,
        new_members_this_month,
    })
}

// --- 获取商品销售额get_product_sales_distribution----
#[tauri::command]
async fn get_product_sales_distribution(mysql_pool: State<'_, Pool>) -> Result<Vec<ProductSales>, String> {
    let mut conn = mysql_pool.get_conn().map_err(|e| e.to_string())?;

    // SQL 查询：
    // 1. JOIN transactions (别名 t) 和 goods (别名 g) 表，通过 goods_id 关联
    // 2. WHERE 子句筛选出 transaction_type 为 'purchase' 的销售记录
    // 3. GROUP BY g.goods_name 按商品名称分组
    // 4. SUM(t.amount) 计算每个分组（即每种商品）的销售总额
    // 5. CAST(... AS CHAR) 将计算结果转为字符串，方便 mysql crate 读取 Decimal
    // 6. ORDER BY total_amount DESC 按销售额降序排序 (可选)
    let query = r"
        SELECT 
            g.goods_name, 
            CAST(SUM(t.amount) AS CHAR) AS total_amount_str 
        FROM transactions t
        JOIN goods g ON t.goods_id = g.id 
        WHERE t.transaction_type = 'purchase' 
        GROUP BY g.goods_name 
        ORDER BY SUM(t.amount) DESC 
    ";

    // 执行查询，期望返回 (商品名字符串, 总金额字符串) 的元组列表
    let result_data: Vec<(String, String)> = conn.query(query)
        .map_err(|e| e.to_string())?; // 处理查询错误

    // 将查询结果映射到 ProductSales 结构体列表
    let product_sales_list: Result<Vec<ProductSales>, _> = result_data
        .into_iter()
        .map(|(name, amount_str)| {
            // 将金额字符串解析回 Decimal 类型
            Decimal::from_str(&amount_str).map(|total_amount| {
                ProductSales { name, total_amount }
            })
        })
        .collect(); // collect 会将 Vec<Result<T, E>> 转换成 Result<Vec<T>, E>

    // 处理可能的 Decimal 解析错误
    product_sales_list.map_err(|e| format!("Failed to parse decimal amount: {}", e))
}


// 获取年收入
#[tauri::command]
async fn get_yearly_income_trend(mysql_pool: State<'_, Pool>) -> Result<Vec<MonthlyIncome>, String> {
    let mut conn = mysql_pool.get_conn().map_err(|e| e.to_string())?;

    let one_year_ago_date = (Local::now() - Duration::days(365)).date_naive();

    // SQL 查询:
    // 1. 筛选 transaction_type = 'purchase' (假设这代表收入) 并且时间在过去一年内的记录。
    // 2. 使用 DATE_FORMAT 按年月 ('YYYY-MM') 分组。
    // 3. SUM(amount) 计算每个月的总和，使用 COALESCE 处理没有收入的月份，返回 0.00。
    // 4. CAST AS CHAR 方便 Decimal 读取。
    // 5. 按月份升序排序。
    let query = r"
        SELECT 
            DATE_FORMAT(transaction_time, '%Y-%m') AS month, 
            CAST(COALESCE(SUM(amount), 0.00) AS CHAR) AS monthly_income 
        FROM transactions 
        WHERE transaction_type = 'purchase'  -- 定义哪些交易算作收入
          AND transaction_time >= :one_year_ago 
        GROUP BY month 
        ORDER BY month ASC;
    ";

    // 执行查询，期望返回 (月份字符串, 月收入字符串) 的元组列表
    let result_data: Vec<(String, String)> = conn.exec(
        query,
        params! { "one_year_ago" => one_year_ago_date }
    ).map_err(|e| e.to_string())?;

    // 将查询结果映射到 MonthlyIncome 结构体列表
    let monthly_income_list: Result<Vec<MonthlyIncome>, _> = result_data
        .into_iter()
        .map(|(month, income_str)| {
            // 将金额字符串解析回 Decimal 类型
            Decimal::from_str(&income_str).map(|income| {
                MonthlyIncome { month, income }
            })
        })
        .collect(); // collect 会将 Vec<Result<T, E>> 转换成 Result<Vec<T>, E>

    // 处理可能的 Decimal 解析错误
    monthly_income_list.map_err(|e| format!("Failed to parse monthly income: {}", e))
}
// 获取年收入结束


// --- run 函数 ---
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mysql_config: MySQLConfig = MySQLConfig::new(
        "root".to_string(),             
        "123456".to_string(),           
        "localhost".to_string(),        
        "cafehub".to_string(),         
    );
    
    let mysql_url = mysql_config.format_url();
    let pool_options = OptsBuilder::from_opts( 
        Opts::from_url(&mysql_url).expect("Invalid database URL"),
    );
    let pool = Pool::new(pool_options).expect("Failed to create DB pool."); 

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(pool) 
        // --- 修改：添加了 get_revenue_summary ---
        .invoke_handler(tauri::generate_handler![
            login, 
            register_user, 
            get_consumption_summary,
            get_revenue_summary,
            get_product_sales_distribution,
            get_yearly_income_trend
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}