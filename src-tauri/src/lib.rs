use chrono::{Local, NaiveDate};
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
        // --- 修改：添加了 get_revenue_summary ---
        .invoke_handler(tauri::generate_handler![login, register_user])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
