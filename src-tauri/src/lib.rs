use chrono::{Datelike, Local, NaiveDate};
use mysql::prelude::*;
use mysql::{params, prelude::Queryable, Error as MySQLError, Opts, OptsBuilder, Pool};
use rust_decimal::Decimal;
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

    // Validate gender: 4代表性别不是0或1
    if let Some(gender_val) = data.gender {
        if gender_val != 0 && gender_val != 1 {
            return Ok(4);
        }
    }

    // Validate phone: 3代表手机号并非11位 (and must be all digits)
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
            Ok(1) // 1代表成功
        }
        Err(e) => {
            eprintln!("Database insert failed for user {}: {}", data.username, e); // Log the raw error
            if let MySQLError::MySqlError(ref mysql_err) = e {
                if mysql_err.code == 1062 {
                    // MySQL error code for duplicate entry
                    return Ok(2); // 2代表用户重复
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

    let query = "
        SELECT g.goods_name, SUM(c.amount) as consumed_amount
        FROM consumption c
        JOIN goods g ON c.goods_id = g.id
        WHERE c.month = :current_month
        GROUP BY g.goods_name
        ORDER BY consumed_amount DESC";

    let results: Vec<GoodsConsumptionShare> = conn
        .exec_map(
            query,
            params! { "current_month" => &current_month_str },
            |(goods_name, amount)| GoodsConsumptionShare { goods_name, amount },
        )
        .map_err(|e| {
            format!(
                "Database query failed for current month goods consumption share: {}",
                e
            )
        })?;

    Ok(results)
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
            update_user_password
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
