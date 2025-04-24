import { invoke } from "@tauri-apps/api/core";

interface Account {
  id: number;
  username: string;
  phone?: string | null;
  gender?: number | null;
  join_time?: string | null;
  balance?: number | null;
  user_type: number;
}

export const login = async (uname: string, pwd: string) => {
  try {
    const account: Account | null = await invoke<Account>("login", {
      username: uname,
      password: pwd,
    });
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("loginAccount", JSON.stringify(account));
  } catch (error) {
    console.error("Login failed:", error);
    localStorage.setItem("isAuthenticated", "false");
  }
};