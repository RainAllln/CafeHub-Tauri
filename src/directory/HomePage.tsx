import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import NavBar from "@/components/AdminNavBar";

interface Account {
  id: number;
  username: string;
  phone?: string | null;
  gender?: number | null;
  join_time?: string | null;
  balance?: number | null;
  user_type: number;
}

const HomePage = () => {
  const [loginResult, setLoginResult] = useState("Click the button to test login");

  const testAdminLogin = async () => {
    try {
      const account = await invoke<Account>("login", {
        username: "admin",
        password: "123456",
      });
      setLoginResult(`Login Successful! Welcome, ${account.username}`);
      console.log("Login successful, account data:", account);
    } catch (error) {
      console.error("Login failed:", error);
      setLoginResult(`Login failed: ${error}`);
    }
  };

  return (
    <>
      <div className="flex flex-col h-screen">
        <NavBar />
        <p>{loginResult}</p>
        <button onClick={testAdminLogin}>Test Admin Login</button>
      </div>
    </>
  );
};

export default HomePage;