import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  message: string;
  timestamp: Date;
}

export default function TaxBot() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      message: "Hi! I'm TaxBot 🤖 Ask me anything about taxes, investments, or your ITR filing!",
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest("POST", "/api/taxbot/chat", {
        question,
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Add bot response
      const botMessage: ChatMessage = {
        id: Date.now().toString() + '_bot',
        type: 'bot',
        message: data.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Send to API
    sendMessageMutation.mutate(inputMessage);
    setInputMessage("");
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
    handleSendMessage();
  };

  const quickQuestions = [
    "What is ELSS and how does it save tax?",
    "What's the difference between 80C and 80D?",
    "What's the ITR filing deadline?",
    "How to calculate income tax?",
    "What are the best tax-saving investments?",
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* TaxBot Card */}
      <Card data-testid="taxbot-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <i className="fas fa-robot text-purple-600"></i>
            </div>
            <span>TaxBot Assistant</span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              Hi there! 👋 I can help answer your tax questions in simple language. 
              What would you like to know?
            </p>
          </div>
          <Button 
            onClick={() => setIsOpen(true)} 
            className="w-full bg-purple-600 text-white hover:bg-purple-700"
            data-testid="button-open-taxbot"
          >
            <i className="fas fa-comments mr-2"></i>Ask TaxBot
          </Button>
        </CardContent>
      </Card>

      {/* TaxBot Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col" data-testid="taxbot-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <i className="fas fa-robot text-purple-600"></i>
              </div>
              <div>
                <span>TaxBot Assistant</span>
                <div className="flex items-center space-x-1 text-xs font-normal">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-500">Online</span>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {/* Messages */}
          <ScrollArea className="flex-1 p-4 max-h-96" data-testid="chat-messages">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-2 ${
                    message.type === 'user' ? 'justify-end' : ''
                  }`}
                  data-testid={`message-${message.type}-${message.id}`}
                >
                  {message.type === 'bot' && (
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <i className="fas fa-robot text-purple-600 text-xs"></i>
                    </div>
                  )}
                  <div
                    className={`rounded-lg p-3 max-w-xs ${
                      message.type === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  {message.type === 'user' && (
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <i className="fas fa-user text-white text-xs"></i>
                    </div>
                  )}
                </div>
              ))}
              
              {sendMessageMutation.isPending && (
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="fas fa-robot text-purple-600 text-xs"></i>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="p-4 border-t">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Quick Questions:</p>
              <div className="space-y-2">
                {quickQuestions.slice(0, 3).map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickQuestion(question)}
                    className="w-full text-left justify-start h-auto py-2 px-3 text-xs"
                    data-testid={`quick-question-${index}`}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Ask me anything about taxes..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 text-sm"
                disabled={sendMessageMutation.isPending}
                data-testid="chat-input"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={sendMessageMutation.isPending || !inputMessage.trim()}
                size="sm"
                data-testid="button-send-message"
              >
                <i className="fas fa-paper-plane"></i>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
