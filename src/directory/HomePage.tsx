import { useState } from "react";
import { invoke } from "@tauri-apps/api/core"; // <-- 修改这里
import NavBar from "@/components/NavBar";
import WebTitle from "@/icon/WebTitle";

const HomePage = () => {
  const [greeting, setGreeting] = useState("Click the button to fetch name");

  const fetchNameFromDb = async () => {
    try {
      const name = await invoke<string>("get_name_from_db"); // 调用 Rust 后端命令
      setGreeting(name); // 更新 greeting 为数据库返回的 name
    } catch (error) {
      console.error("Failed to fetch name from database:", error);
      setGreeting("Error fetching name");
    }
  };

  return (
    <>
      <div className="flex flex-col h-screen">
        <NavBar />
        <h1 className="font-bold underline">你好</h1>
        <p>{greeting}</p>
        <button onClick={fetchNameFromDb}>Fetch Name from DB</button>
      </div>
    </>
  );
};

export default HomePage;
