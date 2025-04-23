import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import NavBar from "@/components/NavBar";

const HomePage = () => {
  const [loginResult, setLoginResult] = useState("Click the button to test login");

  const testAdminLogin = async () => {
    try {
      const result = await invoke<string>("login", {
        username: "admin",
        password: "123456",
      });
      setLoginResult(`Login Result: ${result}`);
    } catch (error) {
      console.error("Login failed:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setLoginResult(`Login failed: ${errorMessage}`);
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