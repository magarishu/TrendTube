import { useState } from "react";
import { Send, Bot, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const defaultMessages: Message[] = [
  {
    role: "assistant",
    content: "Hi! I'm your AI Video Strategy Assistant. Ask me anything about optimizing your YouTube videos — titles, thumbnails, strategy, or viral potential. Try asking:\n\n• \"Why did this video go viral?\"\n• \"How can I improve my title?\"\n• \"What thumbnail style would perform best?\"",
  },
];

const mockResponses: Record<string, string> = {
  default:
    "Based on the current trending data, I'd recommend focusing on curiosity-driven titles with strong emotional hooks. Videos with questions in titles see 14% higher CTR on average. Pair this with a high-contrast thumbnail featuring an expressive face for maximum click potential.",
};

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>(defaultMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", content: mockResponses.default }]);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">AI Strategy Assistant</h3>

      <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm flex flex-col h-[500px]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "assistant" && (
                <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 text-sm whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="rounded-lg bg-secondary px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse [animation-delay:150ms]" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border p-3 flex gap-2">
          <Input
            placeholder="Ask about your video strategy..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            className="bg-secondary/50 border-border"
          />
          <Button onClick={send} size="icon" disabled={loading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
