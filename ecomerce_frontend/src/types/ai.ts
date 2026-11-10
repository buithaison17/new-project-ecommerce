export interface AiChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface AiChatHistoryResponse {
  data: AiChatMessage[];
}

