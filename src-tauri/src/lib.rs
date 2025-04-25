use chrono::{Local, NaiveDate}; // Import Local for current date
use mysql::prelude::*;
use mysql::{params, Error as MySQLError, Pool}; // Import MySQLError
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
    gender: Option<i8>, // Expect 0 (Male) or 1 (Female) or null
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
    let result: Result<Option<(i64, String, Option<String>, Option<i8>, Option<NaiveDate>, Option<Decimal>, i8)>, mysql::Error> = conn
        .exec_first(
            "SELECT id, username, phone, gender, join_time, balance, user_type FROM account WHERE username = :username AND password = :password",
            params! {
                "username" => &username, 
                "password" => &password, 
            },
        );

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
            println!("Login successful for user: {}", username); // Log success
            Ok(account)
        }
        Ok(None) => {
            // No user found with the given credentials
            println!("Login failed for user: {}", username);
            Err("Invalid username or password".to_string())
        }
        Err(e) => {
            // An error occurred during query execution
            eprintln!("Database query failed for user {}: {}", username, e);
            Err(format!("Database query failed: {}", e))
        }
    }
}

#[tauri::command]
fn register_user(data: RegistrationData, mysql_pool: State<Pool>) -> Result<String, String> {
    // Validate input (basic example)
    if data.username.is_empty() || data.password.is_empty() {
        return Err("Username and password cannot be empty".to_string());
    }
    if let Some(gender) = data.gender {
        if gender != 0 && gender != 1 {
            return Err("Invalid gender value. Use 0 for Male or 1 for Female.".to_string());
        }
    }

    let mut conn = mysql_pool
        .get_conn()
        .map_err(|e| format!("Failed to get DB connection: {}", e))?;

    // Get current date for join_time
    let current_date = Local::now().date_naive();
    // Default user_type to Customer (1) for self-registration
    let user_type: i8 = 1;
    // Default balance
    let default_balance: Decimal = Decimal::new(0, 2);
    let result = conn.exec_drop(
        "INSERT INTO account (username, password, phone, gender, join_time, balance, user_type) VALUES (:username, :password, :phone, :gender, :join_time, :balance, :user_type)",
        params! {
            "username" => &data.username,
            "password" => &data.password, 
            "phone" => &data.phone,
            "gender" => &data.gender,
            "join_time" => current_date,
            "balance" => default_balance,
            "user_type" => user_type,
        },
    );

    match result {
        Ok(_) => {
            println!("Successfully registered user: {}", data.username);
            Ok(format!("User '{}' registered successfully!", data.username))
        }
        Err(e) => {
            eprintln!("Failed to register user {}: {}", data.username, e);
            // Check for specific MySQL errors like duplicate entry
            if let MySQLError::MySqlError(ref mysql_err) = e {
                if mysql_err.code == 1062 {
                    // Error code for duplicate entry
                    return Err(format!("Username '{}' already exists.", data.username));
                }
            }
            // Return a generic error for other database issues
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
    let pool_options = mysql::OptsBuilder::from_opts(
        mysql::Opts::from_url(&mysql_url).expect("Invalid database URL"),
    );
    let pool = Pool::new(pool_options).expect("Failed to create DB pool.");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(pool)
        .invoke_handler(tauri::generate_handler![login, register_user])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
