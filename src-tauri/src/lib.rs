use chrono::NaiveDate;
use mysql::prelude::*;
use mysql::{params, Pool};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Serialize, Deserialize, Clone)]

struct Account {
    id: i64, // Use i64 for BIGINT
    username: String,
    phone: Option<String>,        // Use Option for nullable fields
    gender: Option<i8>,           // Use Option<i8> for nullable TINYINT
    join_time: Option<NaiveDate>, // Use Option<NaiveDate> for nullable DATE
    balance: Option<Decimal>,     // Use Option<Decimal> for nullable DECIMAL
    user_type: i8,                // Use i8 for non-nullable TINYINT
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
                "username" => &username, // Pass username by reference
                "password" => &password, // Pass password by reference
            },
        );

    match result {
        Ok(Some((id, uname, phone, gender, join_time, balance, user_type))) => {
            // User found, construct and return Account struct
            let account = Account {
                id,
                username: uname, // Use the username returned from DB
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
            println!("Login failed for user: {}", username); // Log failure
            Err("Invalid username or password".to_string())
        }
        Err(e) => {
            // An error occurred during query execution
            eprintln!("Database query failed for user {}: {}", username, e); // Log error to stderr
            Err(format!("Database query failed: {}", e))
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
        .invoke_handler(tauri::generate_handler![login])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
