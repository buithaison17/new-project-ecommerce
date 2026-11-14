import { useState, useRef, useEffect } from "react";
import {
    Sparkles,
    Send,
    Bot,
    User,
    Copy,
    Check,
    RotateCcw,
    X,
    Maximize2,
    Loader2,
    ExternalLink,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { aiChatService } from "../service/aiChatService";
import { useAuthStore } from "../store/authStore";
import { extractAndFetchSuggestedProducts } from "../lib/aiHelper";
import { formatProductImageUrl } from "../lib/image";
import type { AiChatMessage, SuggestedProduct, AiMessageWithProducts } from "../types/ai";

const INITIAL_MESSAGES: AiMessageWithProducts[] = [
    {
        id: "welcome-widget",
        sender: "ai",
        text: "Xin chào! Tôi là trợ lý ảo AI thông minh của ShopNova ✨\n\nTôi có thể hỗ trợ bạn tìm kiếm sản phẩm, tư vấn mua sắm, theo dõi đơn hàng và giải đáp chính sách. Bạn cần hỗ trợ gì?",
        timestamp: new Date().toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        }),
    },
];

const SUGGESTED_PROMPTS = [
    "Gợi ý smartphone dưới 10 triệu",
    "Tìm máy đọc sách Kindle",
    "Chính sách đổi trả bảo hành thế nào?",
];

export default function AIChatWidget() {
    const navigate = useNavigate();
    const { accessToken } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<AiMessageWithProducts[]>(INITIAL_MESSAGES);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isSearchingProducts, setIsSearchingProducts] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Format timestamp từ ISO string sang hh:mm
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

    // Tải lịch sử chat khi mở widget hoặc khi trạng thái đăng nhập thay đổi
    useEffect(() => {
        if (!isOpen) return;

        const token = accessToken || localStorage.getItem("accessToken");
        if (!token) return;

        let isMounted = true;
        const fetchHistory = async () => {
            setIsLoadingHistory(true);
            try {
                const history = await aiChatService.getHistory();
                if (isMounted && Array.isArray(history) && history.length > 0) {
                    const mappedMessages: AiMessageWithProducts[] = history.map((item: AiChatMessage) => ({
                        id: `widget-history-${item.id}`,
                        sender: item.role === "assistant" ? "ai" : "user",
                        text: item.content,
                        timestamp: formatTimestamp(item.createdAt),
                    }));
                    setMessages(mappedMessages);
                }
            } catch (error) {
                console.error("Lỗi tải lịch sử chat:", error);
            } finally {
                if (isMounted) setIsLoadingHistory(false);
            }
        };

        void fetchHistory();
        return () => {
            isMounted = false;
        };
    }, [isOpen, accessToken]);

    // Cuộn xuống cuối khi có tin nhắn mới hoặc đang gõ
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isTyping, isOpen]);

    // Focus vào input khi mở widget
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 150);
        }
    }, [isOpen]);

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

    const handleClearChat = () => {
        setMessages(INITIAL_MESSAGES);
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="fixed bottom-4 left-4 z-50">
            {/* Trạng thái mở: Khung chat nhỏ gọn */}
            {isOpen ? (
                <div className="flex flex-col w-[350px] sm:w-[370px] h-[520px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-32px)] rounded-3xl border border-slate-800 bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-indigo-950/60 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
                    {/* Header */}
                    <header className="flex items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-4 py-3 backdrop-blur-md">
                        <div className="flex items-center gap-2.5">
                            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 ring-1 ring-white/10">
                                <Sparkles className="h-4 w-4 animate-pulse text-amber-300" />
                                <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 ring-1 ring-slate-900" />
                                </span>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                                    Trợ lý AI ShopNova
                                </h3>
                                <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Luôn trực tuyến 24/7
                                </p>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1">
                            <Link
                                to="/chat-ai"
                                onClick={() => setIsOpen(false)}
                                title="Mở trang chat đầy đủ"
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
                            >
                                <Maximize2 size={13} />
                            </Link>
                            <button
                                type="button"
                                onClick={handleClearChat}
                                title="Làm mới đoạn chat"
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
                            >
                                <RotateCcw size={13} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                title="Thu nhỏ widget"
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
                            >
                                <X size={15} />
                            </button>
                        </div>
                    </header>

                    {/* Messages Scroll Area */}
                    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 scroll-smooth text-xs">
                        {isLoadingHistory ? (
                            <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-2 text-slate-400">
                                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                                <span className="text-xs font-medium">Đang tải lịch sử trò chuyện...</span>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg) => {
                                    const isUser = msg.sender === "user";
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex items-start gap-2 ${
                                                isUser ? "flex-row-reverse" : "flex-row"
                                            }`}
                                        >
                                            <div
                                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg shadow-sm ${
                                                    isUser
                                                        ? "bg-gradient-to-tr from-violet-600 to-indigo-600 text-white"
                                                        : "bg-gradient-to-tr from-indigo-500 to-violet-500 text-white ring-1 ring-white/10"
                                                }`}
                                            >
                                                {isUser ? <User size={13} /> : <Bot size={13} />}
                                            </div>

                                            <div
                                                className={`group relative max-w-[85%] rounded-2xl px-3 py-2 text-xs shadow-xs ${
                                                    isUser
                                                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-tr-xs"
                                                        : "bg-slate-800 text-slate-100 border border-slate-700/60 rounded-tl-xs"
                                                }`}
                                            >
                                                <div className="whitespace-pre-wrap leading-relaxed">
                                                    {msg.text}
                                                </div>

                                                {/* Nút hành động đăng nhập trực tiếp nếu chưa đăng nhập hoặc hết phiên */}
                                                {!isUser && msg.text.includes("đăng nhập") && (
                                                    <div className="mt-2.5 pt-2 border-t border-slate-700/60">
                                                        <Link
                                                            to="/login"
                                                            onClick={() => setIsOpen(false)}
                                                            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm hover:bg-indigo-500 transition cursor-pointer"
                                                        >
                                                            <User size={12} /> Đăng nhập ngay
                                                        </Link>
                                                    </div>
                                                )}

                                                {/* Danh sách sản phẩm đề xuất từ AI */}
                                                {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                                                    <div className="mt-2.5 pt-2 border-t border-slate-700/60 space-y-2">
                                                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
                                                            <Sparkles size={12} className="text-amber-400" />
                                                            <span>Sản phẩm gợi ý cho bạn:</span>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            {msg.suggestedProducts.map((prod) => (
                                                                <div
                                                                    key={prod.id}
                                                                    onClick={() => {
                                                                        navigate(`/products/${prod.id}`);
                                                                        setIsOpen(false);
                                                                    }}
                                                                    className="flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/90 p-2 transition hover:border-indigo-500 hover:bg-slate-800/90 cursor-pointer group"
                                                                >
                                                                    <img
                                                                        src={formatProductImageUrl(prod.imageUrl)}
                                                                        alt={prod.name}
                                                                        className="h-11 w-11 shrink-0 rounded-lg object-cover bg-slate-800 border border-slate-700/50"
                                                                    />
                                                                    <div className="flex-1 min-w-0">
                                                                        {prod.categoryName && (
                                                                            <span className="text-[10px] text-slate-400 truncate block">
                                                                                {prod.categoryName}
                                                                            </span>
                                                                        )}
                                                                        <h4 className="text-xs font-semibold text-slate-100 truncate group-hover:text-indigo-300 transition">
                                                                            {prod.name}
                                                                        </h4>
                                                                        <div className="flex items-center justify-between mt-0.5">
                                                                            <span className="text-xs font-bold text-indigo-400">
                                                                                {new Intl.NumberFormat("vi-VN", {
                                                                                    style: "currency",
                                                                                    currency: "VND",
                                                                                }).format(prod.price)}
                                                                            </span>
                                                                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-indigo-300 group-hover:underline">
                                                                                Xem chi tiết <ExternalLink size={10} />
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div
                                                    className={`mt-1 flex items-center justify-end gap-1.5 text-[10px] ${
                                                        isUser ? "text-indigo-200/80" : "text-slate-400"
                                                    }`}
                                                >
                                                    <span>{msg.timestamp}</span>
                                                    {!isUser && (
                                                        <button
                                                            type="button"
                                                            onClick={() => copyToClipboard(msg.text, msg.id)}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
                                                            title="Sao chép"
                                                        >
                                                            {copiedId === msg.id ? (
                                                                <Check size={10} className="text-emerald-400" />
                                                            ) : (
                                                                <Copy size={10} />
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {isTyping && (
                                    <div className="flex items-start gap-2 animate-in fade-in duration-150">
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-sm ring-1 ring-white/10">
                                            <Bot size={13} />
                                        </div>
                                        <div className="rounded-2xl rounded-tl-xs border border-slate-700/60 bg-slate-800 px-3 py-2 space-y-1">
                                            <div className="flex items-center gap-1">
                                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.3s]" />
                                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]" />
                                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" />
                                            </div>
                                            {isSearchingProducts && (
                                                <div className="flex items-center gap-1.5 text-[10px] text-amber-300 font-medium pt-0.5">
                                                    <Sparkles size={11} className="animate-spin text-amber-400" />
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

                    {/* Suggested Prompts */}
                    {messages.length <= 2 && (
                        <div className="px-3 pb-1.5">
                            <div className="flex flex-wrap gap-1.5">
                                {SUGGESTED_PROMPTS.slice(0, 2).map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleSendMessage(prompt)}
                                        disabled={isTyping || isLoadingHistory}
                                        className="rounded-lg border border-slate-700/70 bg-slate-800/60 px-2.5 py-1 text-[11px] text-slate-300 hover:border-indigo-500/60 hover:text-white transition cursor-pointer text-left truncate max-w-full"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <footer className="border-t border-slate-800/80 bg-slate-950/70 p-2.5 backdrop-blur-md">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSendMessage();
                            }}
                            className="flex items-center gap-2"
                        >
                            <input
                                ref={inputRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                disabled={isLoadingHistory}
                                placeholder="Hỏi AI về sản phẩm..."
                                className="w-full rounded-xl border border-slate-700/80 bg-slate-900 py-2 px-3 text-xs text-slate-100 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim() || isTyping || isLoadingHistory}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30 transition hover:from-indigo-500 hover:to-violet-500 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                                aria-label="Gửi tin nhắn"
                            >
                                <Send size={14} />
                            </button>
                        </form>
                    </footer>
                </div>
            ) : (
                /* Trạng thái đóng: Nút icon chat kèm badge "Trợ lý AI" */
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 px-4 py-3 text-white shadow-xl shadow-indigo-900/40 ring-1 ring-white/20 transition-all duration-300 hover:scale-105 hover:shadow-indigo-600/50 active:scale-95 cursor-pointer"
                    aria-label="Mở Trợ lý AI"
                >
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                        <Sparkles className="h-4 w-4 animate-pulse text-amber-300" />
                        <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-indigo-600" />
                        </span>
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-xs font-bold leading-tight">Trợ lý AI</span>
                        <span className="text-[10px] text-indigo-100 font-medium">Hỗ trợ 24/7</span>
                    </div>
                </button>
            )}
        </div>
    );
}
