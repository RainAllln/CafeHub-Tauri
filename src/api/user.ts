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
    return true;
  } catch (error) {
    console.error("Login failed:", error);
    return false;
  }
};