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

export const register = async (uname: string, pwd: string, phe: string, gen: number) => {
  try {
    let res = await invoke("register_user", {
      data: {
        username: uname,
        password: pwd,
        phone: phe,
        gender: gen, // Or pass actual gender if available (0 for Male, 1 for Female)
      },
    });
    return res;
  } catch (error) {
    console.error("register failed:", error);
    return false;
  }
};
