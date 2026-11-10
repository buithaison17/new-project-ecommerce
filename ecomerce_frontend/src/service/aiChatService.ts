import axios from "axios";
import type { AiChatMessage, AiChatHistoryResponse } from "../types/ai";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? "http://221.121.4.43:8080/api/v1"
    : "http://localhost:8080/api/v1");

const getAuthToken = (): string =>
  localStorage.getItem("accessToken") || localStorage.getItem("token") || "";

export const aiChatService = {
  getHistory: async (): Promise<AiChatMessage[]> => {
    const token = getAuthToken();
    if (!token) return [];

    const response = await axios.get<AiChatHistoryResponse>(
      `${API_BASE}/ai/history`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data?.data || [];
  },

  /**
   * Gọi POST /api/v1/ai/chat nhận phản hồi stream SSE (text/event-stream)
   * @param message Tin nhắn của người dùng
   * @param onChunk Callback khi nhận từng chunk text từ AI stream
   * @param signal AbortSignal tùy chọn để hủy request nếu cần
   * @returns Chuỗi văn bản phản hồi hoàn chỉnh của AI
   */
  chatStream: async (
    message: string,
    onChunk: (chunk: string) => void,
    signal?: AbortSignal
  ): Promise<string> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("UNAUTHORIZED");
    }

    const response = await fetch(`${API_BASE}/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
      signal,
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error("UNAUTHORIZED");
      }
      let errText = "";
      try {
        const errorJson = await response.json();
        errText = errorJson.message || errorJson.error || response.statusText;
      } catch {
        errText = await response.text();
      }
      throw new Error(errText || `Lỗi kết nối máy chủ AI (${response.status})`);
    }

    if (!response.body) {
      throw new Error("Không nhận được dữ liệu phản hồi từ máy chủ");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullText = "";
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split(/\r?\n\r?\n/);
        buffer = events.pop() || "";

        for (const event of events) {
          const lines = event.split(/\r?\n/);
          const dataLines: string[] = [];
          for (const line of lines) {
            if (line.startsWith("data:")) {
              dataLines.push(line.substring(5));
            }
          }
          if (dataLines.length > 0) {
            const eventText = dataLines.join("\n");
            fullText += eventText;
            onChunk(eventText);
          }
        }
      }

      if (buffer.trim()) {
        const lines = buffer.split(/\r?\n/);
        const dataLines: string[] = [];
        for (const line of lines) {
          if (line.startsWith("data:")) {
            dataLines.push(line.substring(5));
          }
        }
        if (dataLines.length > 0) {
          const eventText = dataLines.join("\n");
          fullText += eventText;
          onChunk(eventText);
        }
      }
    } finally {
      reader.releaseLock();
    }

    return fullText;
  },
};
