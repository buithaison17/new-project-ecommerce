import { useState, useRef, useEffect } from "react";
import {
    Sparkles,
    Send,
    Bot,
    User,
    Copy,
    Check,
    RotateCcw,
    Lightbulb,
    Loader2,
    ExternalLink,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { aiChatService } from "../../service/aiChatService";
import { useAuthStore } from "../../store/authStore";
import { extractAndFetchSuggestedProducts } from "../../lib/aiHelper";
import { formatProductImageUrl } from "../../lib/image";
import type { AiChatMessage, SuggestedProduct, AiMessageWithProducts } from "../../types/ai";

const INITIAL_MESSAGES: AiMessageWithProducts[] = [
    {
        id: "welcome-1",
        sender: "ai",
        text: "Xin chào! Tôi là trợ lý ảo AI thông minh của ShopNova ✨\n\nTôi có thể hỗ trợ bạn tìm kiếm sản phẩm, tư vấn chọn mua đồ công nghệ, giải đáp chính sách bảo hành, theo dõi đơn hàng và cập nhật các ưu đãi mới nhất. Bạn đang quan tâm đến sản phẩm nào?",
        timestamp: new Date().toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        }),
    },
];

const SUGGESTED_PROMPTS = [
    "Gợi ý smartphone chụp ảnh đẹp dưới 10 triệu",
    "Chính sách đổi trả hàng của ShopNova thế nào?",
    "Hôm nay có chương trình Flash Sale nào nổi bật?",
    "Thời gian giao hàng toàn quốc mất bao lâu?",
];

export default function ChatAIPage() {
    const navigate = useNavigate();
    const { accessToken } = useAuthStore();
    const [messages, setMessages] = useState<AiMessageWithProducts[]>(INITIAL_MESSAGES);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isSearchingProducts, setIsSearchingProducts] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Format timestamp từ ISO string sang dạng hh:mm
    const formatTimestamp = (dateStr?: string) => {
        if (!dateStr) {
            return new Date().toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
            });
        }
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            return dateStr;
        }
        return date.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Gọi API lấy lịch sử chat khi component mount hoặc khi đăng nhập
    useEffect(() => {
        const token = accessToken || localStorage.getItem("accessToken");
        if (!token) return;

        let isMounted = true;
        const fetchHistory = async () => {
            setIsLoadingHistory(true);
            try {
                const history = await aiChatService.getHistory();
                if (isMounted && Array.isArray(history) && history.length > 0) {
                    const mappedMessages: AiMessageWithProducts[] = history.map((item: AiChatMessage) => ({
                        id: `history-${item.id}`,
                        sender: item.role === "assistant" ? "ai" : "user",
                        text: item.content,
                        timestamp: formatTimestamp(item.createdAt),
                    }));
                    setMessages(mappedMessages);
                }
            } catch (error) {
                console.error("Lỗi khi tải lịch sử chat AI:", error);
            } finally {
                if (isMounted) setIsLoadingHistory(false);
            }
        };

        fetchHistory();
        return () => {
            isMounted = false;
        };
    }, [accessToken]);

    // Tự động cuộn xuống cuối danh sách tin nhắn khi có tin nhắn mới hoặc đang gõ
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Xử lý gửi tin nhắn
    const handleSendMessage = async (textToSend?: string) => {
        const text = (textToSend || inputValue).trim();
        if (!text || isTyping) return;

        const now = new Date().toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        });

        const userMessage: AiMessageWithProducts = {
            id: `user-${Date.now()}`,
            sender: "user",
            text,
            timestamp: now,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setIsTyping(true);

        const currentToken = accessToken || localStorage.getItem("accessToken");

        if (!currentToken) {
            const aiMessage: AiMessageWithProducts = {
                id: `ai-${Date.now()}`,
                sender: "ai",
                text: "Bạn vui lòng đăng nhập tài khoản ShopNova để có thể trò chuyện và được trợ lý AI hỗ trợ tốt nhất nhé! ✨",
                timestamp: new Date().toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            };
            setMessages((prev) => [...prev, aiMessage]);
            setIsTyping(false);
            return;
        }

        const aiMsgId = `ai-${Date.now()}`;
        let fullResponseText = "";
        let isSuccess = false;

        try {
            // Gọi API backend stream SSE: POST /api/v1/ai/chat
            await aiChatService.chatStream(text, (chunk) => {
                fullResponseText += chunk;
                setIsTyping(false);
                setMessages((prev) => {
                    const existingIdx = prev.findIndex((m) => m.id === aiMsgId);
                    const updatedMsg: AiMessageWithProducts = {
                        id: aiMsgId,
                        sender: "ai",
                        text: fullResponseText,
                        timestamp: new Date().toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                        }),
                    };
                    if (existingIdx !== -1) {
                        const copy = [...prev];
                        copy[existingIdx] = updatedMsg;
                        return copy;
                    } else {
                        return [...prev, updatedMsg];
                    }
                });
            });
            isSuccess = true;
        } catch (error: any) {
            console.error("Lỗi khi chat với AI:", error);
            let errorMessage =
                "Đã xảy ra lỗi khi kết nối với máy chủ AI. Bạn vui lòng thử lại sau!";
            if (error?.message === "UNAUTHORIZED") {
                errorMessage =
                    "Phiên đăng nhập đã hết hạn hoặc bạn chưa đăng nhập. Vui lòng đăng nhập lại để tiếp tục trò chuyện.";
            } else if (error?.message) {
                errorMessage = error.message;
            }
            fullResponseText = errorMessage;
            setMessages((prev) => {
                const existingIdx = prev.findIndex((m) => m.id === aiMsgId);
                const updatedMsg: AiMessageWithProducts = {
                    id: aiMsgId,
                    sender: "ai",
                    text: errorMessage,
                    timestamp: new Date().toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                };
                if (existingIdx !== -1) {
                    const copy = [...prev];
                    copy[existingIdx] = updatedMsg;
                    return copy;
                } else {
                    return [...prev, updatedMsg];
                }
            });
        } finally {
            setIsTyping(false);
        }

        // Đề xuất sản phẩm từ nội dung phản hồi AI và câu hỏi người dùng khi phản hồi thành công
        if (isSuccess && fullResponseText) {
            let suggestedProducts: SuggestedProduct[] = [];
            try {
                setIsSearchingProducts(true);
                suggestedProducts = await extractAndFetchSuggestedProducts(
                    fullResponseText,
                    text
                );
            } catch (err) {
                console.warn("Lỗi khi tìm sản phẩm đề xuất:", err);
            } finally {
                setIsSearchingProducts(false);
            }

            if (suggestedProducts.length > 0) {
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === aiMsgId ? { ...m, suggestedProducts } : m
                    )
                );
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleClearChat = () => {
        setMessages(INITIAL_MESSAGES);
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="relative min-h-[calc(100vh-140px)] bg-slate-950 py-6 px-3 sm:px-6 lg:px-8 flex items-center justify-center overflow-hidden">
            {/* Ambient Background Glow Effect */}
            <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-[700px] rounded-full bg-gradient-to-tr from-indigo-600/20 via-violet-600/15 to-transparent blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 right-1/4 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

            {/* Main Glassmorphism Chat Container */}
            <div className="relative z-10 w-full max-w-4xl h-[780px] max-h-[86vh] flex flex-col rounded-3xl border border-slate-800/80 bg-slate-900/75 backdrop-blur-xl shadow-2xl shadow-indigo-950/40 overflow-hidden">
                {/* Header */}
                <header className="flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60 px-5 py-4 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/10">
                            <Sparkles className="h-5 w-5 animate-pulse" />
                            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                            </span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                                    Chat AI
                                </h1>
                                <span className="rounded-full bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                                    Trợ lý ShopNova
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                Luôn sẵn sàng hỗ trợ 24/7
                            </p>
                        </div>
                    </div>

                    {/* Header Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleClearChat}
                            title="Xóa đoạn chat làm mới"
                            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white hover:border-slate-700"
                        >
                            <RotateCcw size={14} />
                            <span className="hidden sm:inline">Làm mới</span>
                        </button>
                    </div>
                </header>

                {/* Messages Scroll Area */}
                <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 space-y-5 scroll-smooth">
                    {isLoadingHistory ? (
                        <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-3 text-slate-400">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                            <span className="text-sm font-medium">Đang tải lịch sử trò chuyện...</span>
                        </div>
                    ) : (
                        <>
                            {messages.map((msg) => {
                                const isUser = msg.sender === "user";
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex items-start gap-3 ${
                                            isUser ? "flex-row-reverse" : "flex-row"
                                        } animate-in fade-in duration-200`}
                                    >
                                        {/* Avatar */}
                                        <div
                                            className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl shadow-md ${
                                                isUser
                                                    ? "bg-gradient-to-tr from-violet-600 to-indigo-600 text-white"
                                                    : "bg-gradient-to-tr from-indigo-500 to-violet-500 text-white ring-1 ring-white/10"
                                            }`}
                                        >
                                            {isUser ? <User size={18} /> : <Bot size={18} />}
                                        </div>

                                        {/* Message Bubble */}
                                        <div
                                            className={`group relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm ${
                                                isUser
                                                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-tr-xs"
                                                    : "bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-tl-xs backdrop-blur-xs"
                                            }`}
                                        >
                                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                                {msg.text}
                                            </div>

                                            {/* Nút hành động đăng nhập nếu phiên hết hạn hoặc chưa đăng nhập */}
                                            {!isUser && msg.text.includes("đăng nhập") && (
                                                <div className="mt-3 pt-2.5 border-t border-slate-700/60">
                                                    <Link
                                                        to="/login"
                                                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition cursor-pointer"
                                                    >
                                                        <User size={13} /> Đăng nhập ngay
                                                    </Link>
                                                </div>
                                            )}

                                            {/* Suggested Products */}
                                            {!isUser && msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-slate-700/60 space-y-2.5">
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                                                        <Sparkles size={13} className="text-amber-400" />
                                                        <span>Gợi ý sản phẩm phù hợp cho bạn:</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                                        {msg.suggestedProducts.map((prod) => (
                                                            <div
                                                                key={prod.id}
                                                                onClick={() => navigate(`/products/${prod.id}`)}
                                                                className="flex items-center gap-2.5 rounded-xl border border-slate-700/80 bg-slate-900/90 p-2.5 transition hover:border-indigo-500 hover:bg-slate-800/90 cursor-pointer group/card"
                                                            >
                                                                <img
                                                                    src={formatProductImageUrl(prod.imageUrl)}
                                                                    alt={prod.name}
                                                                    className="h-14 w-14 shrink-0 rounded-lg object-cover bg-slate-800 border border-slate-700/50"
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    {prod.categoryName && (
                                                                        <span className="text-[10px] text-slate-400 truncate block">
                                                                            {prod.categoryName}
                                                                        </span>
                                                                    )}
                                                                    <h4 className="text-xs font-semibold text-slate-100 truncate group-hover/card:text-indigo-300 transition">
                                                                        {prod.name}
                                                                    </h4>
                                                                    <div className="flex items-center justify-between mt-1">
                                                                        <span className="text-xs font-bold text-indigo-400">
                                                                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(prod.price)}
                                                                        </span>
                                                                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-indigo-300 group-hover/card:underline">
                                                                            Xem chi tiết <ExternalLink size={10} />
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Footer info: Timestamp & Copy action */}
                                            <div
                                                className={`mt-2 flex items-center justify-end gap-2 text-[11px] ${
                                                    isUser ? "text-indigo-200/80" : "text-slate-400"
                                                }`}
                                            >
                                                <span>{msg.timestamp}</span>
                                                {!isUser && (
                                                    <button
                                                        type="button"
                                                        onClick={() => copyToClipboard(msg.text, msg.id)}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
                                                        title="Sao chép câu trả lời"
                                                    >
                                                        {copiedId === msg.id ? (
                                                            <Check size={12} className="text-emerald-400" />
                                                        ) : (
                                                            <Copy size={12} />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <div className="flex items-start gap-3 animate-in fade-in duration-150">
                                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-md ring-1 ring-white/10">
                                        <Bot size={18} />
                                    </div>
                                    <div className="rounded-2xl rounded-tl-xs border border-slate-700/60 bg-slate-800/90 px-4 py-3 shadow-sm backdrop-blur-xs">
                                        <div className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.3s]" />
                                            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]" />
                                            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" />
                                            <span className="ml-2 text-xs text-slate-400 font-medium">
                                                ShopNova AI đang trả lời...
                                            </span>
                                        </div>
                                        {isSearchingProducts && (
                                            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium pt-2 border-t border-slate-700/50 mt-2">
                                                <Sparkles size={12} className="animate-spin text-amber-400" />
                                                <span>Đang tìm sản phẩm phù hợp...</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Suggested Prompts (Gợi ý câu hỏi khi người dùng cần ý tưởng) */}
                {messages.length <= 2 && (
                    <div className="px-4 pb-2 sm:px-6">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2 font-medium">
                            <Lightbulb size={13} className="text-amber-400" /> Gợi ý câu hỏi nhanh:
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {SUGGESTED_PROMPTS.map((prompt, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSendMessage(prompt)}
                                    disabled={isTyping || isLoadingHistory}
                                    className="rounded-xl border border-slate-700/70 bg-slate-800/50 px-3 py-1.5 text-xs text-slate-300 hover:border-indigo-500/60 hover:bg-slate-800 hover:text-white transition cursor-pointer text-left disabled:opacity-50"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <footer className="border-t border-slate-800/80 bg-slate-950/70 p-3 sm:p-4 backdrop-blur-md">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSendMessage();
                        }}
                        className="flex items-end gap-2 sm:gap-3"
                    >
                        <div className="relative flex-1">
                            <textarea
                                ref={inputRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                rows={1}
                                disabled={isLoadingHistory}
                                placeholder="Nhập câu hỏi hoặc yêu cầu tư vấn cho AI... (Enter để gửi)"
                                className="w-full resize-none rounded-2xl border border-slate-700/80 bg-slate-900/90 py-3 pl-4 pr-10 text-sm text-slate-100 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 disabled:opacity-50"
                                style={{ maxHeight: "120px" }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isTyping || isLoadingHistory}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 transition hover:from-indigo-500 hover:to-violet-500 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                            aria-label="Gửi tin nhắn"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                    <div className="mt-2 text-center text-[11px] text-slate-400">
                        <span>AI có thể mắc lỗi. Vui lòng kiểm tra lại các thông tin quan trọng.</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}

