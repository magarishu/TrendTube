import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! 👋 I'm TrendTube AI Assistant. I can help you understand your video analytics, optimize content, and answer questions about YouTube growth. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const testConnection = async () => {
    try {
      console.log('[ChatBot] Testing connection...');
      const response = await fetch("/api/chatbot/test");
      const data = await response.json();
      console.log('[ChatBot] Test response:', data);
      
      if (response.ok) {
        const testMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `✅ Connection successful! Chatbot is running. Gemini API is ${data.geminiConfigured ? 'configured' : 'NOT configured'}. You can now ask me questions about YouTube and video optimization.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, testMsg]);
        setError(null);
      }
    } catch (error) {
      console.error('[ChatBot] Connection test failed:', error);
      const testMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `❌ Connection failed. Make sure the backend server is running on http://localhost:5000 and your Gemini API key is configured in .env`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, testMsg]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    setError(null);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      console.log('[ChatBot Frontend] Sending message:', inputValue);
      
      const response = await fetch("/api/chatbot/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputValue,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      console.log('[ChatBot Frontend] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.reply) {
        throw new Error('Empty response from server');
      }

      console.log('[ChatBot Frontend] Received reply:', data.reply);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('[ChatBot Frontend] Error:', error);
      
      const errorMessage = error.message || "Connection error";
      setError(errorMessage);

      // Add error message to chat
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I encountered an error: ${errorMessage}. Please make sure the backend is running and try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-40 flex items-center justify-center h-14 w-14 rounded-full transition-all duration-300 shadow-lg ${
          isOpen
            ? "bg-[#FF0000] text-white"
            : "bg-[#FF0000] text-white hover:shadow-xl hover:scale-110"
        }`}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 max-w-[calc(100vw-24px)] bg-[#121212] border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Header */}
          <div className="bg-[#FF0000] text-white p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">TrendTube AI</h3>
              <p className="text-sm opacity-90">YouTube Analytics Assistant</p>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-orange-900/50 border-b border-orange-700 text-orange-200 px-4 py-2 flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-orange-300 hover:text-orange-100"
              >
                ✕
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-96 bg-[#030303]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs rounded-lg px-4 py-3 ${
                    message.role === "user"
                      ? "bg-[#FF0000] text-white rounded-br-none"
                      : "bg-[#121212] text-[#FFFFFF] border border-gray-700 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#121212] text-[#FFFFFF] border border-gray-700 rounded-lg rounded-bl-none px-4 py-3 flex items-center gap-2">
                  <Loader className="h-4 w-4 animate-spin text-[#FF0000]" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-700 p-4 bg-[#121212] space-y-3">
            <div className="flex justify-between items-center">
              <div className="text-xs text-[#A0A0A0]">
                💡 Ask about video analytics, titles, thumbnails, or growth strategies
              </div>
              <Button
                onClick={testConnection}
                variant="ghost"
                size="sm"
                className="text-xs text-[#A0A0A0] hover:text-[#FF0000] hover:bg-transparent"
                title="Test connection to chatbot"
              >
                🔧 Test
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Ask me anything..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="flex-1 bg-[#030303] border-gray-700 text-[#FFFFFF] placeholder-[#64748B] focus:border-[#FF0000] focus:ring-[#FF0000]"
              />
              <Button
                onClick={handleSendMessage}
                disabled={loading || !inputValue.trim()}
                className="bg-[#FF0000] hover:bg-[#E60030] text-white px-4 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
