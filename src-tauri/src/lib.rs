use chrono::{Datelike, Local, NaiveDate};
use mysql::{params, prelude::Queryable, Error as MySQLError, Opts, OptsBuilder, Pool};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use tauri::State;

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

#[derive(Serialize, Deserialize, Clone)]
struct MonthlyConsumptionSummary {
    month: String, // "YYYY-MM"
    total_amount: Decimal,
}

#[derive(Serialize, Deserialize, Clone)]
struct GoodsConsumptionShare {
    goods_name: String,
    amount: Decimal,
}

#[derive(Deserialize)]
struct UpdateUserData {
    phone: Option<String>,
    gender: Option<i8>,
}

#[derive(Deserialize)]
struct UpdatePasswordData {
    current_password: String,
    new_password: String,
}

#[derive(Serialize, Deserialize, Clone)]
struct Goods {
    id: i32,
    goods_name: String,
    goods_type: Option<String>,
    price: Decimal,
    stock: Option<i32>,
}

#[derive(Deserialize)]
struct AddGoodsData {
    goods_name: String,
    goods_type: Option<String>,
    price: Decimal,
    stock: Option<i32>,
}

#[derive(Deserialize)]
struct UpdateGoodsData {
    stock: Option<i32>,     // Made optional
    price: Option<Decimal>, // Added price field
}

#[derive(Deserialize)]
struct RechargeBalanceData {
    user_id: i64,
    amount: Decimal,
}

#[derive(Deserialize, Clone)] // New struct for an item in the purchase list
struct PurchaseItem {
    goods_id: i32,
    quantity: i32,
}

#[derive(Deserialize)]
struct PurchaseGoodsData {
    user_id: i64,
    items: Vec<PurchaseItem>, // Changed from single goods_id and quantity to a list of items
}

#[derive(Serialize, Deserialize, Clone)]
struct LostItem {
    id: i64,
    item_name: String,
    pick_place: Option<String>,
    pick_user_id: Option<i64>,
    claim_user_id: Option<i64>,
    pick_time: Option<NaiveDate>,
    claim_time: Option<NaiveDate>,
    status: i8, // 0: Unclaimed, 1: Claimed
}

#[derive(Deserialize)]
struct ReportLostItemData {
    item_name: String,
    pick_place: Option<String>,
    pick_user_id: Option<i64>,
}

#[derive(Deserialize)]
struct ClaimLostItemData {
    item_id: i64,
    claim_user_id: i64,
}

#[derive(Deserialize)]
struct SendMessageData {
    sender_id: i64,
    receiver_id: i64,
    title: Option<String>,
    message_content: String,
}

#[derive(Serialize, Deserialize, Clone)]
struct MessageInfo {
    id: i64,
    sender_id: i64,
    receiver_id: i64,
    sender_username: String,
    receiver_username: String,
    title: Option<String>,
    message_content: String,
    send_date: Option<NaiveDate>,
    read_status: i8, // 0: Unread, 1: Read
    is_sender: bool, // True if the current user is the sender of this message
}

#[derive(Serialize, Deserialize, Clone)]
struct MarkReadData {
    message_id: i64,
    // The user_id of the one marking it read will be passed to the function
}

#[derive(Serialize, Deserialize, Clone)]
struct UserBasicInfo {
    id: i64,
    username: String,
}

struct MySQLConfig {
    user: String,
    password: String,
    host: String,
    database: String,
}

impl MySQLConfig {
    fn new(user: String, password: String, host: String, database: String) -> Self {
        MySQLConfig {
            user,
            password,
            host,
            database,
        }
    }
    fn format_url(&self) -> String {
        format!(
            "mysql://{}:{}@{}/{}",
            self.user, self.password, self.host, self.database
        )
    }
}

#[tauri::command]
fn login(username: String, password: String, mysql_pool: State<Pool>) -> Result<Account, String> {
    let mut conn = mysql_pool
        .get_conn()
        .map_err(|e| format!("Failed to get DB connection: {}", e))?;
    let result: Result<Option<(i64, String, Option<String>, Option<i8>, Option<NaiveDate>, Option<Decimal>, i8)>, mysql::Error> = conn.exec_first("SELECT id, username, phone, gender, join_time, balance, user_type FROM account WHERE username = :username AND password = :password", params! {"username" => &username, "password" => &password,});
    match result {
        Ok(Some((id, uname, phone, gender, join_time, balance, user_type))) => {
            let account = Account {
                id,
                username: uname,
                phone,
                gender,
                join_time,
                balance,
                user_type,
            };
            println!("Login successful for user: {}", username);
            Ok(account)
        }
        Ok(None) => {
            println!("Login failed for user: {}", username);
            Err("Invalid username or password".to_string())
        }
        Err(e) => {
            eprintln!("Database query failed for user {}: {}", username, e);
            Err(format!("Database query failed: {}", e))
        }
    }
}

#[tauri::command]
fn register_user(data: RegistrationData, mysql_pool: State<Pool>) -> Result<i32, String> {
    // Validate username and password are not empty
    if data.username.is_empty() || data.password.is_empty() {
        return Err("Username and password cannot be empty".to_string());
    }

    // Validate gender: 4 means gender is not 0 or 1
    if let Some(gender_val) = data.gender {
        if gender_val != 0 && gender_val != 1 {
            return Ok(4);
        }
    }

    // Validate phone: 3 means the phone number is not 11 digits (and must be all digits)
    if let Some(ref phone_str) = data.phone {
        // Check if phone_str is not composed of 11 digits.
        // This means either it contains non-digit characters or its length is not 11.
        if !phone_str.chars().all(|c| c.is_ascii_digit()) || phone_str.len() != 11 {
            return Ok(3);
        }
    }

    let mut conn = mysql_pool
        .get_conn()
        .map_err(|e| format!("Failed to get DB connection: {}", e))?;
    let current_date = Local::now().date_naive();
    let user_type: i8 = 1; // Default user_type, assuming 1 for regular members
    let default_balance: Decimal = Decimal::new(0, 2); // Default balance

    let result = conn.exec_drop(
        "INSERT INTO account (username, password, phone, gender, join_time, balance, user_type) VALUES (:username, :password, :phone, :gender, :join_time, :balance, :user_type)",
        params! {
            "username" => &data.username,
            "password" => &data.password, // Note: Storing passwords in plain text is a security risk. Consider hashing.
            "phone" => &data.phone,
            "gender" => &data.gender,
            "join_time" => current_date,
            "balance" => default_balance,
            "user_type" => user_type,
        }
    );

    match result {
        Ok(_) => {
            println!("Successfully registered user: {}", data.username);
            Ok(1) // 1 means success
        }
        Err(e) => {
            eprintln!("Database insert failed for user {}: {}", data.username, e); // Log the raw error
            if let MySQLError::MySqlError(ref mysql_err) = e {
                if mysql_err.code == 1062 {
                    // MySQL error code for duplicate entry
                    return Ok(2); // 2 means duplicate user
                }
            }
            // For other database errors, return a generic error string
            Err(format!("Database error during registration: {}", e))
        }
    }
}

#[tauri::command]
fn get_total_users(mysql_pool: State<Pool>) -> Result<i64, String> {
    let mut conn = mysql_pool
        .get_conn()
        .map_err(|e| format!("Failed to get DB connection: {}", e))?;
    let count: Result<Option<i64>, mysql::Error> =
        conn.query_first("SELECT COUNT(*) FROM account WHERE user_type = 1");

    match count {
        Ok(Some(num_users)) => Ok(num_users),
        Ok(None) => Ok(0), // Should not happen with COUNT(*), but good to handle
        Err(e) => {
            eprintln!("Database query failed for total users: {}", e);
            Err(format!("Database query failed: {}", e))
        }
    }
}

#[tauri::command]
fn get_new_users_this_month(mysql_pool: State<Pool>) -> Result<i64, String> {
    let mut conn = mysql_pool
        .get_conn()
        .map_err(|e| format!("Failed to get DB connection: {}", e))?;
    let now = Local::now();
    let current_year = now.year();
    let current_month_num = now.month();

    // Construct the first day of the current month
    let first_day_current_month = NaiveDate::from_ymd_opt(current_year, current_month_num, 1)
        .ok_or_else(|| "Failed to construct first day of current month".to_string())?;

    let count: Result<Option<i64>, mysql::Error> = conn.exec_first(
        "SELECT COUNT(*) FROM account WHERE user_type = 1 AND join_time >= :start_date",
        params! {
            "start_date" => first_day_current_month.format("%Y-%m-%d").to_string(),
        },
    );

    match count {
        Ok(Some(num_users)) => Ok(num_users),
        Ok(None) => Ok(0), // Should not happen with COUNT(*), but good to handle
        Err(e) => {
            eprintln!("Database query failed for new users this month: {}", e);
            Err(format!("Database query failed: {}", e))
        }
    }
}

#[tauri::command]
fn get_monthly_consumption_summary(
    mysql_pool: State<Pool>,
) -> Result<Vec<MonthlyConsumptionSummary>, String> {
    let mut conn = mysql_pool
        .get_conn()
        .map_err(|e| format!("Failed to get DB connection: {}", e))?;

    let query = "SELECT month, SUM(amount) as total_amount FROM consumption GROUP BY month ORDER BY month ASC";

    let results: Vec<MonthlyConsumptionSummary> = conn
        .query_map(query, |(month, total_amount)| MonthlyConsumptionSummary {
            month,
            total_amount,
        })
        .map_err(|e| {
            format!(
                "Database query failed for monthly consumption summary: {}",
                e
            )
        })?;

    Ok(results)
}

#[tauri::command]
fn get_goods_consumption_share_current_month(
    mysql_pool: State<Pool>,
) -> Result<Vec<GoodsConsumptionShare>, String> {
    let mut conn = mysql_pool
        .get_conn()
        .map_err(|e| format!("Failed to get DB connection: {}", e))?;

    let now = Local::now();
    let current_month_str = now.format("%Y-%m").to_string();
    // ---- 添加的调试日志 ----
    println!("[RUST DEBUG] get_goods_consumption_share_current_month: Determined current_month_str = '{}'", current_month_str);

    let query = "
        SELECT g.goods_name, SUM(c.amount) as consumed_amount
        FROM consumption c
        JOIN goods g ON c.goods_id = g.id
        WHERE c.month = :current_month
        GROUP BY g.goods_name
        ORDER BY consumed_amount DESC";

    match conn.exec_map(
        query,
        params! { "current_month" => &current_month_str },
        |(goods_name, amount_val): (String, Decimal)| GoodsConsumptionShare {
            goods_name,
            amount: amount_val,
        }, // 明确指定元组类型
    ) {
        Ok(results) => {
            // ---- 添加的调试日志 ----
            println!("[RUST DEBUG] get_goods_consumption_share_current_month: Query successful. Results count = {}", results.len());
            if results.is_empty() {
                println!("[RUST DEBUG] get_goods_consumption_share_current_month: No goods consumption data found for month '{}'", current_month_str);
            } else {
                // (可选) 打印部分结果内容，帮助调试
                for (index, item) in results.iter().take(3).enumerate() {
                    // 最多打印前3条
                    println!("[RUST DEBUG] get_goods_consumption_share_current_month: Result[{}]: Name='{}', Amount='{}'", index, item.goods_name, item.amount);
                }
            }
            Ok(results)
        }
        Err(e) => {
            // ---- 现有错误日志 ----
            eprintln!(
                "[RUST ERROR] Database query failed for current month goods consumption share (month: {}): {}",
                current_month_str, e
            );
            Err(format!(
                "Database query failed for current month goods consumption share: {}",
                e
            ))
        }
    }
}

#[tauri::command]
fn get_user_details(user_id: i64, mysql_pool: State<Pool>) -> Result<Account, String> {
    let mut conn = mysql_pool
        .get_conn()
        .map_err(|e| format!("Failed to get DB connection: {}", e))?;

    // Ensure we are fetching a customer account
    let result: Result<Option<(i64, String, Option<String>, Option<i8>, Option<NaiveDate>, Option<Decimal>, i8)>, mysql::Error> =
        conn.exec_first(
            "SELECT id, username, phone, gender, join_time, balance, user_type FROM account WHERE id = :user_id AND user_type = 1",
            params! { "user_id" => user_id },
        );

    match result {
        Ok(Some((id, username, phone, gender, join_time, balance, user_type))) => Ok(Account {
            id,
            username,
            phone,
            gender,
            join_time,
            balance,
            user_type,
        }),
        Ok(None) => Err(format!(
            "User with ID {} not found or is not a customer.",
            user_id
        )),
        Err(e) => {
            eprintln!(
                "Database query failed for user details (ID {}): {}",
                user_id, e
            );
            Err(format!("Database query failed: {}", e))
        }
    }
}

#[tauri::command]
fn get_user_monthly_consumption(
    user_id: i64,
    mysql_pool: State<Pool>,
) -> Result<Vec<MonthlyConsumptionSummary>, String> {
    let mut conn = mysql_pool
        .get_conn()
        .map_err(|e| format!("Failed to get DB connection: {}", e))?;

    let query = "
        SELECT month, SUM(amount) as total_amount
        FROM consumption
        WHERE user_id = :user_id
        GROUP BY month
        ORDER BY month ASC";

    let results: Vec<MonthlyConsumptionSummary> = conn
        .exec_map(
            query,
            params! { "user_id" => user_id },
            |(month, total_amount)| MonthlyConsumptionSummary {
                month,
                total_amount,
            },
        )
        .map_err(|e| format!("Database query failed for user monthly consumption: {}", e))?;

    Ok(results)
}

#[tauri::command]
fn update_user_details(
    user_id: i64,
    data: UpdateUserData,
    mysql_pool: State<Pool>,
) -> Result<String, String> {
    let mut conn = mysql_pool
        .get_conn()
        .map_err(|e| format!("Failed to get DB connection: {}", e))?;

    let mut set_clauses: Vec<String> = Vec::new();
    let mut query_params: Vec<(String, mysql::Value)> = Vec::new();

    if let Some(phone_val) = &data.phone {
        if !phone_val.chars().all(|c| c.is_ascii_digit()) || phone_val.len() != 11 {
            return Err("Invalid phone number format. Must be 11 digits.".to_string());
        }
        set_clauses.push("phone = :phone".to_string());
        query_params.push(("phone".to_string(), phone_val.clone().into()));
    }

    if let Some(gender_val) = data.gender {
        if gender_val != 0 && gender_val != 1 {
            return Err("Invalid gender value. Must be 0 (Male) or 1 (Female).".to_string());
        }
        set_clauses.push("gender = :gender".to_string());
        query_params.push(("gender".to_string(), gender_val.into()));
    }

    if set_clauses.is_empty() {
        return Ok("No details provided to update.".to_string());
    }

    query_params.push(("user_id".to_string(), user_id.into()));

    let query = format!(
        "UPDATE account SET {} WHERE id = :user_id AND user_type = 1",
        set_clauses.join(", ")
    );

    match conn.exec_drop(&query, mysql::Params::from(query_params)) {
        Ok(_) => {
            // Check if any rows were affected to confirm the user exists and is a customer
            if conn.affected_rows() > 0 {
                Ok("User details updated successfully.".to_string())
            } else {
                Err("User not found, not a customer, or no changes made.".to_string())
            }
        }
        Err(e) => {
            eprintln!("Database update failed for user ID {}: {}", user_id, e);
            Err(format!("Database update failed: {}", e))
        }
    }
}

#[tauri::command]
fn update_user_password(
    user_id: i64,
    data: UpdatePasswordData,
    mysql_pool: State<Pool>,
) -> Result<String, String> {
    if data.new_password.is_empty() {
        return Err("New password cannot be empty".to_string());
    }

    let mut conn = mysql_pool
        .get_conn()
        .map_err(|e| format!("Failed to get DB connection: {}", e))?;

    let stored_password: Result<Option<String>, mysql::Error> = conn.exec_first(
        "SELECT password FROM account WHERE id = :user_id AND user_type = 1",
        params! { "user_id" => user_id },
    );

    match stored_password {
        Ok(Some(current_db_password)) => {
            if current_db_password != data.current_password {
                return Err("Incorrect current password".to_string());
            }
        }
        Ok(None) => {
            return Err(format!(
                "User with ID {} not found or is not a customer.",
                user_id
            ))
        }
        Err(e) => {
            eprintln!(
                "Database query failed for current password (ID {}): {}",
                user_id, e
            );
            return Err(format!("Database query failed: {}", e));
        }
    }

    let update_result = conn.exec_drop(
        "UPDATE account SET password = :new_password WHERE id = :user_id AND user_type = 1",
        params! {
            "new_password" => &data.new_password,
            "user_id" => user_id,
        },
    );

    match update_result {
        Ok(_) => {
            if conn.affected_rows() > 0 {
                println!("Successfully updated password for user ID: {}", user_id);
                Ok("Password updated successfully.".to_string())
            } else {
                // This case should ideally not be reached if current password check passed
                // and user_id is valid, but good for robustness.
                Err("Failed to update password, user not found or no change made.".to_string())
            }
        }
        Err(e) => {
            eprintln!(
                "Database password update failed for user ID {}: {}",
                user_id, e
            );
            Err(format!("Database password update failed: {}", e))
        }
    }
}

#[tauri::command]
fn get_all_goods(mysql_pool: State<Pool>) -> Result<Vec<Goods>, String> {
    let mut conn = mysql_pool
        .get_conn()
        .map_err(|e| format!("Failed to get DB connection: {}", e))?;

    let query = "SELECT id, goods_name, goods_type, price, stock FROM goods";

    let results: Vec<Goods> = conn
        .query_map(query, |(id, goods_name, goods_type, price, stock)| Goods {
            id,
            goods_name,
            goods_type,
            price,
            stock,
        }).map(|items| {
            println!("[RUST DEBUG] get_all_goods: Query successful. Fetched {} goods items.", items.len());
            for (index, item) in items.iter().enumerate() {
            println!(
                "[RUST DEBUG] get_all_goods: Item[{}]: ID={}, Name='{}', Type='{:?}', Price={}, Stock={:?}",
                index, item.id, &item.goods_name, &item.goods_type, &item.price, &item.stock
            );
            }
            items // Pass items through for further processing
        })
        .map_err(|e| format!("Database query failed for all goods: {}", e))?;

    Ok(results)
}

#[tauri::command]
fn add_goods(data: AddGoodsData, mysql_pool: State<Pool>) -> Result<String, String> {
    if data.goods_name.is_empty() {
        return Err("Goods name cannot be empty".to_string());
    }
    if data.price <= Decimal::ZERO {
        return Err("Price must be positive".to_string());
    }

    let mut conn = mysql_pool
        .get_conn()
        .map_err(|e| format!("Failed to get DB connection: {}", e))?;

    let stock_value = data.stock.unwrap_or(0); // Default to 0 if not provided

    let result = conn.exec_drop(
        "INSERT INTO goods (goods_name, goods_type, price, stock) VALUES (:goods_name, :goods_type, :price, :stock)",
        params! {
            "goods_name" => &data.goods_name,
            "goods_type" => &data.goods_type,
            "price" => data.price,
            "stock" => stock_value,
        }
    );

    match result {
        Ok(_) => {
            println!("Successfully added goods: {}", data.goods_name);
            Ok(format!("Goods '{}' added successfully.", data.goods_name))
        }
        Err(e) => {
            eprintln!(
                "Database insert failed for goods {}: {}",
                data.goods_name, e
            );
            if let MySQLError::MySqlError(ref mysql_err) = e {
                if mysql_err.code == 1062 {
                    // Duplicate entry for unique key (e.g. goods_name if unique)
                    return Err(format!(
                        "Goods with name '{}' already exists.",
                        data.goods_name
                    ));
                }
            }
            Err(format!("Database error while adding goods: {}", e))
        }
    }
}

#[tauri::command]
fn update_goods_info(
    goods_id: i32,
    data: UpdateGoodsData,
    mysql_pool: State<Pool>,
) -> Result<String, String> {
    let mut conn = mysql_pool
        .get_conn()
        .map_err(|e| format!("Failed to get DB connection: {}", e))?;

    let mut set_clauses: Vec<String> = Vec::new();
    let mut query_params: Vec<(String, mysql::Value)> = Vec::new();

    if let Some(stock_val) = data.stock {
        if stock_val < 0 {
            return Err("Stock cannot be negative".to_string());
        }
        set_clauses.push("stock = :stock".to_string());
        query_params.push(("stock".to_string(), stock_val.into()));
    }

    if let Some(price_val) = data.price {
        if price_val <= Decimal::ZERO {
            return Err("Price must be positive".to_string());
        }
        set_clauses.push("price = :price".to_string());
        query_params.push(("price".to_string(), price_val.into()));
    }

    if set_clauses.is_empty() {
        return Ok("No details provided to update.".to_string());
    }

    query_params.push(("goods_id".to_string(), goods_id.into()));

    let query = format!(
        "UPDATE goods SET {} WHERE id = :goods_id",
        set_clauses.join(", ")
    );

    match conn.exec_drop(&query, mysql::Params::from(query_params)) {
        Ok(_) => {
            if conn.affected_rows() > 0 {
                println!("Successfully updated info for goods ID: {}", goods_id);
                Ok(format!(
                    "Info for goods ID {} updated successfully.",
                    goods_id
                ))
            } else {
                Err(format!(
                    "Goods with ID {} not found or no changes made.",
                    goods_id
                ))
            }
        }
        Err(e) => {
            eprintln!(
                "Database update failed for goods info (ID {}): {}",
                goods_id, e
            );
            Err(format!("Database error while updating goods info: {}", e))
        }
    }
}

#[tauri::command]
fn recharge_balance(data: RechargeBalanceData, mysql_pool: State<Pool>) -> Result<String, String> {
    if data.amount <= Decimal::ZERO {
        return Err("Recharge amount must be positive".to_string());
    }

    let mut conn = mysql_pool
        .get_conn()
        .map_err(|e| format!("Failed to get DB connection: {}", e))?;

    // Check if the user exists and is a customer
    let user_exists: Option<i8> = conn
        .exec_first(
            "SELECT user_type FROM account WHERE id = :user_id",
            params! { "user_id" => data.user_id },
        )
        .map_err(|e| format!("Failed to query user: {}", e))?;

    match user_exists {
        Some(1) => {
            // User is a customer
            let update_result = conn.exec_drop(
                "UPDATE account SET balance = balance + :amount WHERE id = :user_id AND user_type = 1",
                params! {
                    "amount" => data.amount,
                    "user_id" => data.user_id,
                },
            );

            match update_result {
                Ok(_) => {
                    if conn.affected_rows() > 0 {
                        println!(
                            "Successfully recharged {} for user ID: {}. New balance might be reflected in a subsequent query.",
                            data.amount, data.user_id
                        );
                        Ok(format!(
                            "Successfully recharged {} for user ID {}.",
                            data.amount, data.user_id
                        ))
                    } else {
                        // Should not happen if user_exists check passed, but good for robustness
                        Err(format!(
                            "Failed to recharge balance for user ID {}. User not found or no change made.",
                            data.user_id
                        ))
                    }
                }
                Err(e) => {
                    eprintln!(
                        "Database update failed for balance recharge (user ID {}): {}",
                        data.user_id, e
                    );
                    Err(format!("Database error while recharging balance: {}", e))
                }
            }
        }
        Some(_) => Err(format!("User with ID {} is not a customer.", data.user_id)), // User is not a customer
        None => Err(format!("User with ID {} not found.", data.user_id)),
    }
}

#[tauri::command]
fn purchase_goods(data: PurchaseGoodsData, mysql_pool: State<Pool>) -> Result<String, String> {
    if data.items.is_empty() {
        return Err("No items provided for purchase.".to_string());
    }

    for item in &data.items {
        if item.quantity <= 0 {
            return Err(format!(
                "Quantity for goods ID {} must be positive.",
                item.goods_id
            ));
        }
    }

    let mut conn = mysql_pool
        .get_conn()
        .map_err(|e| format!("Failed to get DB connection: {}", e))?;

    // Start a transaction
    let mut tx = conn
        .start_transaction(mysql::TxOpts::default())
        .map_err(|e| format!("Failed to start transaction: {}", e))?;

    let mut total_purchase_price = Decimal::ZERO;
    // To store information about items being processed, including their price
    struct ProcessedItemDetail {
        goods_id: i32,
        quantity: i32,
        price_per_item: Decimal,
        item_total_price: Decimal,
    }
    let mut processed_item_details: Vec<ProcessedItemDetail> = Vec::new();

    // 1. Check stock for all goods, lock rows, and calculate total price
    for item in &data.items {
        let goods_info: Option<(Decimal, i32)> = tx
            .exec_first(
                "SELECT price, stock FROM goods WHERE id = :goods_id FOR UPDATE",
                params! { "goods_id" => item.goods_id },
            )
            .map_err(|e| format!("Failed to query goods ID {}: {}", item.goods_id, e))?;

        let (price_per_item, current_stock) = match goods_info {
            Some(info) => info,
            None => {
                return Err(format!("Goods with ID {} not found.", item.goods_id));
            }
        };

        if current_stock < item.quantity {
            return Err(format!(
                "Insufficient stock for goods ID {}. Available: {}, Requested: {}.",
                item.goods_id, current_stock, item.quantity
            ));
        }

        let item_total_price = price_per_item * Decimal::from(item.quantity);
        total_purchase_price += item_total_price;
        processed_item_details.push(ProcessedItemDetail {
            goods_id: item.goods_id,
            quantity: item.quantity,
            price_per_item,
            item_total_price,
        });
    }

    // 2. Check user information and balance, and lock the row
    let user_info: Option<(Decimal, i8)> = tx
        .exec_first(
            "SELECT balance, user_type FROM account WHERE id = :user_id AND user_type = 1 FOR UPDATE",
            params! { "user_id" => data.user_id },
        )
        .map_err(|e| format!("Failed to query user: {}", e))?;

    let (current_balance, _user_type) = match user_info {
        // user_type is already checked by `user_type = 1` in SQL
        Some(info) => info,
        None => {
            return Err(format!(
                "Customer account with ID {} not found.",
                data.user_id
            ));
        }
    };

    if current_balance < total_purchase_price {
        return Err(format!(
            "Insufficient balance for user ID {}. Required: {}, Available: {}.",
            data.user_id, total_purchase_price, current_balance
        ));
    }

    // 3. Update goods stock for each item
    for p_item_detail in &processed_item_details {
        tx.exec_drop(
            "UPDATE goods SET stock = stock - :quantity WHERE id = :goods_id",
            params! {
                "quantity" => p_item_detail.quantity,
                "goods_id" => p_item_detail.goods_id,
            },
        )
        .map_err(|e| {
            format!(
                "Failed to update stock for goods ID {}: {}",
                p_item_detail.goods_id, e
            )
        })?;
    }

    // 4. Update user balance
    tx.exec_drop(
        "UPDATE account SET balance = balance - :total_price WHERE id = :user_id",
        params! {
            "total_price" => total_purchase_price,
            "user_id" => data.user_id,
        },
    )
    .map_err(|e| format!("Failed to update user balance: {}", e))?;

    // 5. Record consumption for each item
    let current_month_str = Local::now().format("%Y-%m").to_string();
    for p_item_detail in &processed_item_details {
        tx.exec_drop(
            "INSERT INTO consumption (user_id, month, goods_id, amount) VALUES (:user_id, :month, :goods_id, :amount)
             ON DUPLICATE KEY UPDATE amount = amount + VALUES(amount)",
            params! {
                "user_id" => data.user_id,
                "month" => &current_month_str,
                "goods_id" => p_item_detail.goods_id,
                "amount" => p_item_detail.item_total_price, // Use the total price for this specific item
            },
        )
        .map_err(|e| format!("Failed to record consumption for goods ID {}: {}", p_item_detail.goods_id, e))?;
    }

    // Commit transaction
    tx.commit()
        .map_err(|e| format!("Failed to commit transaction: {}", e))?;

    Ok(format!(
        "Purchase of {} item type(s) successful. Total cost: {}. Remaining balance: {}.",
        processed_item_details.len(),
        total_purchase_price,
        current_balance - total_purchase_price
    ))
}

#[tauri::command]
fn get_all_lost_items(mysql_pool: State<Pool>) -> Result<Vec<LostItem>, String> {
    let mut conn = mysql_pool
        .get_conn()
        .map_err(|e| format!("Failed to get DB connection: {}", e))?;

    let query = "SELECT id, item_name, pick_place, pick_user_id, claim_user_id, pick_time, claim_time, status FROM lost_items ORDER BY pick_time DESC, id DESC";

    let results: Vec<LostItem> = conn
        .query_map(
            query,
            |(
                id,
                item_name,
                pick_place,
                pick_user_id,
                claim_user_id,
                pick_time,
                claim_time,
                status,
            )| {
                LostItem {
                    id,
                    item_name,
                    pick_place,
                    pick_user_id,
                    claim_user_id,
                    pick_time,
                    claim_time,
                    status,
                }
            },
        )
        .map_err(|e| format!("Database query failed for lost items: {}", e))?;

    Ok(results)
}

#[tauri::command]
fn report_lost_item(data: ReportLostItemData, mysql_pool: State<Pool>) -> Result<String, String> {
    if data.item_name.is_empty() {
        return Err("Item name cannot be empty".to_string());
    }

    let mut conn = mysql_pool
        .get_conn()
        .map_err(|e| format!("Failed to get DB connection: {}", e))?;

    let current_date = Local::now().date_naive();
    let status: i8 = 0; // 0: Unclaimed

    let result = conn.exec_drop(
        "INSERT INTO lost_items (item_name, pick_place, pick_user_id, pick_time, status) VALUES (:item_name, :pick_place, :pick_user_id, :pick_time, :status)",
        params! {
            "item_name" => &data.item_name,
            "pick_place" => &data.pick_place,
            "pick_user_id" => &data.pick_user_id,
            "pick_time" => current_date,
            "status" => status,
        }
    );

    match result {
        Ok(_) => {
            println!("Successfully reported lost item: {}", data.item_name);
            Ok(format!(
                "Lost item '{}' reported successfully.",
                data.item_name
            ))
        }
        Err(e) => {
            eprintln!(
                "Database insert failed for lost item {}: {}",
                data.item_name, e
            );
            Err(format!("Database error while reporting lost item: {}", e))
        }
    }
}

#[tauri::command]
fn claim_lost_item(data: ClaimLostItemData, mysql_pool: State<Pool>) -> Result<String, String> {
    let mut conn = mysql_pool
        .get_conn()
        .map_err(|e| format!("Failed to get DB connection: {}", e))?;

    let current_date = Local::now().date_naive();
    let new_status: i8 = 1; // 1: Claimed

    // Check if the item exists and is unclaimed
    let item_status: Option<i8> = conn
        .exec_first(
            "SELECT status FROM lost_items WHERE id = :item_id",
            params! { "item_id" => data.item_id },
        )
        .map_err(|e| format!("Failed to query lost item status: {}", e))?;

    match item_status {
        Some(0) => {
            // Status 0 means unclaimed
            // Update item status, claimer user ID, and claim time
            let update_result = conn.exec_drop(
                "UPDATE lost_items SET status = :status, claim_user_id = :claim_user_id, claim_time = :claim_time WHERE id = :item_id",
                params! {
                    "status" => new_status,
                    "claim_user_id" => data.claim_user_id,
                    "claim_time" => current_date,
                    "item_id" => data.item_id,
                }
            );

            match update_result {
                Ok(_) => {
                    if conn.affected_rows() > 0 {
                        println!(
                            "Lost item ID {} claimed successfully by user ID {}.",
                            data.item_id, data.claim_user_id
                        );
                        Ok(format!("Item ID {} claimed successfully.", data.item_id))
                    } else {
                        // Theoretically, if the previous query was successful, this update should succeed
                        // and user_id is valid, but good for robustness.
                        Err(format!("Failed to update item ID {}. It might have been claimed or deleted concurrently.", data.item_id))
                    }
                }
                Err(e) => {
                    eprintln!(
                        "Database update failed for claiming item ID {}: {}",
                        data.item_id, e
                    );
                    Err(format!("Database error while claiming item: {}", e))
                }
            }
        }
        Some(1) => Err(format!(
            "Item ID {} has already been claimed.",
            data.item_id
        )),
        None => Err(format!("Lost item with ID {} not found.", data.item_id)),
        Some(_) => Err(format!("Unknown status for item ID {}.", data.item_id)), // Other unknown status
    }
}

#[tauri::command]
fn send_message(data: SendMessageData, mysql_pool: State<Pool>) -> Result<String, String> {
    if data.message_content.is_empty() {
        return Err("Message content cannot be empty".to_string());
    }
    if data.sender_id == data.receiver_id {
        return Err("Sender and receiver cannot be the same user".to_string());
    }

    let mut conn = mysql_pool
        .get_conn()
        .map_err(|e| format!("Failed to get DB connection: {}", e))?;

    // Optional: Check if sender_id and receiver_id exist in the account table
    let sender_exists: Option<i64> = conn
        .exec_first(
            "SELECT id FROM account WHERE id = :id",
            params! {"id" => data.sender_id},
        )
        .map_err(|e| format!("Failed to verify sender: {}", e))?;
    if sender_exists.is_none() {
        return Err(format!("Sender with ID {} not found.", data.sender_id));
    }

    let receiver_exists: Option<i64> = conn
        .exec_first(
            "SELECT id FROM account WHERE id = :id",
            params! {"id" => data.receiver_id},
        )
        .map_err(|e| format!("Failed to verify receiver: {}", e))?;
    if receiver_exists.is_none() {
        return Err(format!("Receiver with ID {} not found.", data.receiver_id));
    }

    let current_date = Local::now().date_naive();
    let read_status: i8 = 0; // 0: Unread

    let result = conn.exec_drop(
        "INSERT INTO message (sender_id, receiver_id, title, message_content, send_date, read_status) VALUES (:sender_id, :receiver_id, :title, :message_content, :send_date, :read_status)",
        params! {
            "sender_id" => data.sender_id,
            "receiver_id" => data.receiver_id,
            "title" => &data.title,
            "message_content" => &data.message_content,
            "send_date" => current_date,
            "read_status" => read_status,
        }
    );

    match result {
        Ok(_) => {
            println!(
                "Message sent from {} to {}",
                data.sender_id, data.receiver_id
            );
            Ok("Message sent successfully.".to_string())
        }
        Err(e) => {
            eprintln!("Database insert failed for message: {}", e);
            Err(format!("Database error while sending message: {}", e))
        }
    }
}

#[tauri::command]
fn get_user_messages(user_id: i64, mysql_pool: State<Pool>) -> Result<Vec<MessageInfo>, String> {
    let mut conn = mysql_pool
        .get_conn()
        .map_err(|e| format!("Failed to get DB connection: {}", e))?;

    let query = "
        SELECT
            m.id, m.sender_id, m.receiver_id,
            s_acc.username AS sender_username,
            r_acc.username AS receiver_username,
            m.title, m.message_content, m.send_date, m.read_status
        FROM message m
        JOIN account s_acc ON m.sender_id = s_acc.id
        JOIN account r_acc ON m.receiver_id = r_acc.id
        WHERE m.sender_id = :user_id OR m.receiver_id = :user_id
        ORDER BY m.send_date DESC, m.id DESC";

    let results: Vec<MessageInfo> = conn
        .exec_map(
            query,
            params! { "user_id" => user_id },
            |(
                id,
                sender_id_db,
                receiver_id_db,
                sender_username,
                receiver_username,
                title,
                message_content,
                send_date,
                read_status,
            )| {
                MessageInfo {
                    id,
                    sender_id: sender_id_db,
                    receiver_id: receiver_id_db,
                    sender_username,
                    receiver_username,
                    title,
                    message_content,
                    send_date,
                    read_status,
                    is_sender: sender_id_db == user_id,
                }
            },
        )
        .map_err(|e| format!("Database query failed for user messages: {}", e))?;

    Ok(results)
}

#[tauri::command]
fn mark_message_as_read(
    data: MarkReadData,
    current_user_id: i64, // ID of the user performing the action (should be the receiver)
    mysql_pool: State<Pool>,
) -> Result<String, String> {
    let mut conn = mysql_pool
        .get_conn()
        .map_err(|e| format!("Failed to get DB connection: {}", e))?;

    let result = conn.exec_drop(
        "UPDATE message SET read_status = 1 WHERE id = :message_id AND receiver_id = :receiver_id AND read_status = 0",
        params! {
            "message_id" => data.message_id,
            "receiver_id" => current_user_id,
        }
    );

    match result {
        Ok(_) => {
            if conn.affected_rows() > 0 {
                println!(
                    "Message ID {} marked as read by user ID {}.",
                    data.message_id, current_user_id
                );
                Ok(format!("Message ID {} marked as read.", data.message_id))
            } else {
                // Could be that message doesn't exist, user is not receiver, or already read
                Err(format!("Failed to mark message ID {} as read. It might not exist, you might not be the receiver, or it was already read.", data.message_id))
            }
        }
        Err(e) => {
            eprintln!(
                "Database update failed for marking message read (ID {}): {}",
                data.message_id, e
            );
            Err(format!(
                "Database error while marking message as read: {}",
                e
            ))
        }
    }
}

#[tauri::command]
fn get_all_users(mysql_pool: State<Pool>) -> Result<Vec<UserBasicInfo>, String> {
    let mut conn = mysql_pool
        .get_conn()
        .map_err(|e| format!("Failed to get DB connection: {}", e))?;

    let query = "SELECT id, username FROM account ORDER BY id ASC";

    let results: Vec<UserBasicInfo> = conn
        .query_map(query, |(id, username)| UserBasicInfo { id, username })
        .map_err(|e| format!("Database query failed for fetching all users: {}", e))?;

    Ok(results)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mysql_config: MySQLConfig = MySQLConfig::new(
        "root".to_string(),
        "123456".to_string(),
        "localhost".to_string(),
        "cafehub".to_string(),
    );

    let mysql_url = mysql_config.format_url();
    let pool_options =
        OptsBuilder::from_opts(Opts::from_url(&mysql_url).expect("Invalid database URL"));
    let pool = Pool::new(pool_options).expect("Failed to create DB pool.");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(pool)
        .invoke_handler(tauri::generate_handler![
            login,
            register_user,
            get_total_users,
            get_new_users_this_month,
            get_monthly_consumption_summary,
            get_goods_consumption_share_current_month,
            get_user_details,
            get_user_monthly_consumption,
            update_user_details,
            update_user_password,
            get_all_goods,
            add_goods,
            update_goods_info,
            purchase_goods,
            get_all_lost_items,
            report_lost_item,
            claim_lost_item,
            send_message,
            get_user_messages,
            mark_message_as_read,
            get_all_users,
            recharge_balance
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
