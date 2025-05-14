import { invoke } from "@tauri-apps/api/core";

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  sender_username: string;
  receiver_username: string;
  title: string;
  message_content: string;
  send_date: string; // Assuming NaiveDate is serialized to YYYY-MM-DD string or null
  read_status: 0 | 1;
}

export const fetchReceivedMessages = async (userId: number): Promise<Message[]> => {
  try {
    const messages = await invoke<Message[]>("get_recived_messages", { userId });
    return messages;
  } catch (error) {
    console.error("Failed to fetch received messages:", error);
    throw error;
  }
};

export const fetchSentMessages = async (userId: number): Promise<Message[]> => {
  try {
    const messages = await invoke<Message[]>("get_sent_messages", { userId });
    return messages;
  } catch (error) {
    console.error("Failed to fetch sent messages:", error);
    throw error;
  }
};