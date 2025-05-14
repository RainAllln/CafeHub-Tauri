# CafeHub - Self-Service Cafe Management System

This is a software engineering course project for a self-service cafe management system.

## Project Overview

CafeHub is a desktop application built with Tauri, React, TypeScript, and Rust, designed to manage various aspects of a self-service cafe. It provides a user-friendly interface for both customers and administrators.

## Features

- **Customer Interface:**
  - Browse products
  - Place orders
  - Manage account (balance, order history, profile)
  - Report lost items
  - Send and receive messages
- **Administrator Interface:**
  - Manage products (add, edit, view)
  - View sales statistics and charts
  - Manage user accounts
  - Handle lost and found items
  - Communicate with customers

## Technology Stack

- **Frontend:** React, TypeScript
- **Backend:** Rust
- **Framework:** Tauri
- **Database:** MySQL

## Getting Started

This project is based on the template provided by [winchfilbert/Tauri-React-Rust-MySQL](https://github.com/winchfilbert/Tauri-React-Rust-MySQL). Thanks to winchfilbert for the excellent starting point!

To get started with this project:

1. **Clone the repository:**

   ```cmd
   git clone https://github.com/RainAllln/CafeHub-Tauri
   cd CafeHub-Tauri
   ```

2. **Install dependencies:**

   Make sure you have Node.js, Rust, and Microsoft Edge WebView2 Runtime installed.

   ```cmd
   npm install
   ```

3. **Set up the database:**

   - Import the `database/cafehub.sql` file into your MySQL database.
   - Configure the database connection in `src-tauri/src/db_config.rs`.
4. **Run the development server:**

   ```cmd
   npx tauri dev
   ```

5. **Build the application:**

   ```cmd
   npx tauri build 
   ```

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/)
- [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Acknowledgements

- Special thanks to the creators of the [Tauri-React-Rust-MySQL template](https://github.com/winchfilbert/Tauri-React-Rust-MySQL).
