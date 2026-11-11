import { api } from "../lib/axios";
import { useAuthStore } from "../store/authStore";
import type { AiChatMessage, AiChatHistoryResponse } from "../types/ai";

const getApiBase = (): string => {
  const base =
    api.defaults.baseURL ||
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.PROD
      ? "http://221.121.4.43:8080/api/v1"
      : "http://localhost:8080/api/v1");
  return base.replace(/\/+$/, "");
};

/**
 * Lấy token xác thực hợp lệ từ Zustand store hoặc LocalStorage (hỗ trợ cả accessToken và fallback token cũ).
 * Loại bỏ tiền tố Bearer thừa nếu có và tự động đồng bộ sang key chuẩn "accessToken".
 */
export const getAuthToken = (): string => {
  let token =
    useAuthStore.getState().accessToken ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    "";

  if (!token || token === "undefined" || token === "null") {
    return "";
  }

  token = token.replace(/^Bearer\s+/i, "").trim();

  // Tự động đồng bộ sang key chuẩn "accessToken" nếu trước đó lưu ở key cũ "token"
  if (token && !localStorage.getItem("accessToken")) {
    try {
      localStorage.setItem("accessToken", token);
    } catch {
      // ignore
    }
  }

  return token;
};

/**
 * Đảm bảo token còn hạn bằng cách chủ động refresh nếu chưa có hoặc có thể refresh được
 */
const ensureFreshToken = async (): Promise<string> => {
  let token = getAuthToken();
  if (!token) {
    try {
      await useAuthStore.getState().refresh();
      token = getAuthToken();
    } catch {
      // ignore
    }
  }
  return token;
};

export const aiChatService = {
  /**
   * Lấy lịch sử chat AI thông qua instance axios `api` (tự động đính kèm accessToken và refresh nếu 401)
   */
  getHistory: async (): Promise<AiChatMessage[]> => {
    try {
      const response = await api.get<AiChatHistoryResponse>("/ai/history");
      return response.data?.data || [];
    } catch (error) {
      console.warn("Không thể tải lịch sử chat AI:", error);
      return [];
    }
  },

  /**
   * Gọi POST /api/v1/ai/chat nhận phản hồi stream SSE (text/event-stream)
   * Cơ chế Senior: Tự động refresh token nếu 401/403 và tự động retry 1 lần trong suốt quá trình người dùng chat.
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
    let token = await ensureFreshToken();
    if (!token) {
      throw new Error("UNAUTHORIZED");
    }

    const apiBase = getApiBase();

    const executeFetch = async (authToken: string) => {
      const cleanToken = authToken.replace(/^Bearer\s+/i, "").trim();
      return fetch(`${apiBase}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          Authorization: `Bearer ${cleanToken}`,
        },
        credentials: "include",
        body: JSON.stringify({ message }),
        signal,
      });
    };

    let response = await executeFetch(token);

    // Nếu gặp 401 hoặc 403, tự động refresh token và thử lại ngay lập tức
    if (response.status === 401 || response.status === 403) {
      try {
        await useAuthStore.getState().refresh();
        const freshToken = getAuthToken();
        if (freshToken && freshToken !== token) {
          token = freshToken;
          response = await executeFetch(token);
        }
      } catch (refreshErr) {
        console.error("Lỗi tự động làm mới token cho AI Chat stream:", refreshErr);
      }
    }

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
