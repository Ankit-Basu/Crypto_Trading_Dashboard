"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquareIcon, 
  SendIcon, 
  BotIcon, 
  UserIcon, 
  TrendingUpIcon, 
  LineChartIcon, 
  NewspaperIcon, 
  AlertCircleIcon,
  BellIcon
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface QuickAction {
  label: string;
  query: string;
  icon: React.ReactNode;
  color: string;
}

export default function ChatbotAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your crypto trading assistant. Ask me anything about cryptocurrencies, trading strategies, or market analysis.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const quickActions: QuickAction[] = [
    {
      label: "Market Analysis",
      query: "Give me a market analysis for Bitcoin and Ethereum",
      icon: <TrendingUpIcon className="h-4 w-4" />,
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      label: "Trading Strategies",
      query: "What trading strategies work best in the current market?",
      icon: <LineChartIcon className="h-4 w-4" />,
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      label: "Latest News",
      query: "What are the latest crypto news headlines?",
      icon: <NewspaperIcon className="h-4 w-4" />,
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      label: "Set Alert",
      query: "Set an alert for Bitcoin when RSI goes below 30",
      icon: <BellIcon className="h-4 w-4" />,
      color: "bg-amber-500 hover:bg-amber-600"
    },
    {
      label: "Risk Assessment",
      query: "What's the risk level for investing in Ethereum now?",
      icon: <AlertCircleIcon className="h-4 w-4" />,
      color: "bg-red-500 hover:bg-red-600"
    }
  ];

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage: Message = {
      role: 'user',
      content: input.trim()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input.trim() })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response
      }]);
    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Failed to get response');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (query: string) => {
    setInput(query);
  };

  return (
    <Card className="w-full h-[700px] flex flex-col shadow-lg border-2 border-primary/10 rounded-xl bg-gradient-to-b from-background to-background/80">
      <CardHeader className="border-b px-6 py-4 bg-primary/5 rounded-t-xl">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <BotIcon className="h-6 w-6 text-primary" />
          Crypto Trading Assistant
        </CardTitle>
      </CardHeader>
      
      <div className="flex-grow overflow-hidden" ref={scrollAreaRef}>
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'assistant' ? 'items-start' : 'items-start justify-end'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.role === 'assistant'
                      ? 'bg-secondary/80 text-secondary-foreground shadow-md'
                      : 'bg-primary text-primary-foreground shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {message.role === 'assistant' ? (
                      <BotIcon className="h-5 w-5 mt-1 text-primary" />
                    ) : (
                      <UserIcon className="h-5 w-5 mt-1" />
                    )}
                    <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-pulse flex space-x-2">
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                </div>
                <span>Thinking...</span>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Quick Action Buttons */}
      <div className="px-4 py-3 border-t border-border/50 bg-muted/30">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              size="sm"
              onClick={() => handleQuickAction(action.query)}
              className={`whitespace-nowrap text-white ${action.color}`}
            >
              {action.icon}
              <span className="ml-1">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <CardContent className="border-t p-4 mt-auto">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <Input
            placeholder="Ask about crypto trading..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-grow rounded-full bg-muted/50 border-primary/20 focus-visible:ring-primary/30"
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="rounded-full aspect-square p-2"
          >
            <SendIcon className="h-4 w-4" />
          </Button>
        </form>
        {error && (
          <p className="text-sm text-destructive mt-2">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}