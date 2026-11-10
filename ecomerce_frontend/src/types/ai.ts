export interface AiChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface AiChatHistoryResponse {
  data: AiChatMessage[];
}

export interface SuggestedProduct {
  id: number;
  name: string;
  price: number;
  imageUrl?: string | null;
  categoryName?: string | null;
}

export interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export interface AiMessageWithProducts extends Message {
  suggestedProducts?: SuggestedProduct[];
}
