import axios from "axios";
import type { AiChatMessage, AiChatHistoryResponse } from "../types/ai";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

export const aiChatService = {
  getHistory: async (): Promise<AiChatMessage[]> => {
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    const response = await axios.get<AiChatHistoryResponse>(
      `${API_BASE}/ai/history`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.data;
  },
};

