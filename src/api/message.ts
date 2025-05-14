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

export interface MarkReadPayload {
  message_id: number;
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

/**
 * Marks a message as read by the current user.
 * @param messageId The ID of the message to mark as read.
 * @param currentUserId The ID of the user performing the action (should be the receiver).
 * @returns A promise that resolves to a number:
 *          0: Successfully marked as read (or was already read by this user).
 *          1: Current user is not the receiver of the message.
 *          Rejects with an error message for other failures (e.g., message not found, DB error).
 */
export const markMessageAsReadApi = async (messageId: number, currentUserId: number): Promise<number> => {
  try {
    // The Rust command `mark_message_as_read` expects `data` (MarkReadData) and `current_user_id`.
    const payload: MarkReadPayload = { message_id: messageId };
    const result = await invoke<number>("mark_message_as_read", {
      data: payload,
      currentUserId: currentUserId,
    });
    return result;
  } catch (error) {
    console.error(`Failed to mark message ${messageId} as read:`, error);
    if (typeof error === 'string') {
      throw new Error(error);
    } else if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("An unknown error occurred while marking the message as read.");
    }
  }
};