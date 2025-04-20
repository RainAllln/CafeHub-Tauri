//User Model
// untuk bisa passing data ke frontendnya

use mysql::prelude::*;
use mysql::{params, Pool};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;

#[derive(Serialize, Deserialize, Clone)]

pub struct User {
    id: String,
    username: String,
}

pub struct CurrentUser {
    // dispake untuk nyimpen state user yang lagi login (cookie bro
    // mutex untuk nyimpen object lognya
    user: Mutex<Option<User>>,
}

// struct buat misal connect ke mysql
struct MySQLConfig {
    user: String,
    password: String,
    host: String,
    database: String,
}

//struct function
// kek jadi biar bisa implement
impl MySQLConfig {
    fn new(user: String, password: String, host: String, database: String) -> Self {
        MySQLConfig {
            user,
            password,
            host,
            database,
        }
    }

    //refer ke self sendiri makanya pake &self
    fn format_url(&self) -> String {
        format!(
            "mysql://{}:{}@{}/{}",
            self.user, self.password, self.host, self.database
        )
    }
}

// #[tauri::command]
// fn login(
//     username: &str,
//     password: &str,
//     mysql_pool: State<Pool>,
//     current_user: State<CurrentUser>,
// ) -> bool {
//     // Get connection
//     let mut conn: mysql::PooledConn = mysql_pool.get_conn().expect("Failed to get connection.");

//     let result: Option<(String, String)> = conn
//         .exec_first(
//             "SELECT id, username FROM users WHERE username = :username AND password = :password",
//             params! {
//                 "username" => username,
//                 "password" => password,
//             },
//         )
//         .expect("Failed to execute query");

//     if let Some((id, username)) = result {
//         let user = User { id, username };
//         // update current_user
//         // lock sama unwrap punya mutex, replace() dari option
//         // lock buat ngambil lock objectnya agar bisa diakses sama satu thread doang terus unwrap buat dapetin objectnya
//         current_user.user.lock().unwrap().replace(user);

//         return true;
//     }
//     false //return value
// }

// #[tauri::command]
// fn get_current_user(current_user: State<CurrentUser>) -> Option<User> {
//     //harus di clone supaya bisa di pake
//     return current_user.user.lock().unwrap().clone();
// }

#[tauri::command]
fn get_name_from_db(mysql_pool: State<Pool>) -> Result<String, String> {
    let mut conn = mysql_pool.get_conn().map_err(|e| e.to_string())?;
    let result: Result<Option<String>, String> = conn
        .query_first("SELECT name FROM test WHERE id=1")
        .map_err(|e| e.to_string());

    match result {
        Ok(Some(name)) => Ok(name),
        Ok(None) => Err("Name not found".to_string()),
        Err(e) => Err(e),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // how to main
    //initial mysqlconfig value
    let mysql_config: MySQLConfig = MySQLConfig::new(
        "root".to_string(),
        "123456".to_string(),
        "localhost".to_string(),
        "cafehub".to_string(),
    );
    let mysql_url = mysql_config.format_url();
    let pool = Pool::new(&*mysql_url).expect("Failed getting pool.");
    // ini kayanya &* itu refer terus kek buat allocate memorynya kemana jadi di kali sama
    // memorynya mysql_config
    //

    let current_user = CurrentUser {
        user: Mutex::new(None),
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(pool)
        .manage(current_user)
        .invoke_handler(tauri::generate_handler![
            // login,
            // get_current_user,
            get_name_from_db
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
