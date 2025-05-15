# CafeHub - Self-Service Cafe Management System

[![Windows](https://img.shields.io/badge/platform-Windows-blue)](https://www.microsoft.com/windows) [![Rust](https://img.shields.io/badge/language-Rust-orange)](https://www.rust-lang.org/) [![Tauri](https://img.shields.io/badge/framework-Tauri-green)](https://tauri.app/) [![React](https://img.shields.io/badge/library-React-blue)](https://reactjs.org/) [![MySQL](https://img.shields.io/badge/database-MySQL-blue)](https://www.mysql.com/) [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/RainAllln/CafeHub-Tauri)

This is a software engineering course project for a self-service cafe management system.

## Project Overview

CafeHub is a desktop application built with Tauri, React, TypeScript, and Rust, designed to manage various aspects of a self-service cafe. It provides a user-friendly interface for both customers and administrators.

## Features

- **Customer Interface:**
  - View and edit personal information
  - Browse and purchase products
  - Report and claim lost items
  - Send messages to administrator
- **Administrator Interface:**
  - View Business Performance
  - Manage products
  - View lost and found items
  - Respond to customer messages

## Technology Stack

- **Frontend:** React, TypeScript, Vite
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
