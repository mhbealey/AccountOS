'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, X, Send, Loader2, User, Bot } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const quickActions = [
  'Summarize portfolio',
  'At-risk clients',
  'Pipeline analysis',
  'Suggest next actions',
];

export default function CopilotPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      const userMessage: Message = { role: 'user', content: content.trim() };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput('');
      setIsStreaming(true);

      try {
        const response = await fetch('/api/v1/copilot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get response');
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No reader available');

        const decoder = new TextDecoder();
        let assistantContent = '';

        setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          assistantContent += chunk;

          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: 'assistant',
              content: assistantContent,
            };
            return updated;
          });
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again.',
          },
        ]);
      } finally {
        setIsStreaming(false);
      }
    },
    [messages, isStreaming]
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-[#050E1A]/50 md:bg-transparent"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-96 max-w-full bg-[#0B1B2E] border-l border-[#1A3550] shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A3550]">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#00D4AA]" />
            <h2 className="text-sm font-semibold text-[#F0F4F8]">AI Copilot</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#1A3550] text-[#829AB1] transition-colors"
            aria-label="Close copilot"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-12 h-12 rounded-full bg-[#00D4AA]/10 flex items-center justify-center">
                <Sparkles size={24} className="text-[#00D4AA]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#F0F4F8]">
                  How can I help you today?
                </p>
                <p className="text-xs text-[#829AB1] mt-1">
                  Ask me about your clients, pipeline, or tasks.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {quickActions.map((action) => (
                  <button
                    key={action}
                    onClick={() => sendMessage(action)}
                    className="px-3 py-1.5 text-xs rounded-full border border-[#1A3550] text-[#829AB1] hover:text-[#00D4AA] hover:border-[#00D4AA]/40 transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2.5 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-[#00D4AA]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={14} className="text-[#00D4AA]" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-[#00D4AA]/15 text-[#F0F4F8]'
                    : 'bg-[#1A3550]/50 text-[#F0F4F8]'
                }`}
              >
                {msg.content || (
                  <Loader2 size={14} className="animate-spin text-[#829AB1]" />
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-[#1A3550] flex items-center justify-center shrink-0 mt-0.5">
                  <User size={14} className="text-[#829AB1]" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick actions (shown when there are messages) */}
        {messages.length > 0 && !isStreaming && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {quickActions.map((action) => (
              <button
                key={action}
                onClick={() => sendMessage(action)}
                className="px-2.5 py-1 text-[11px] rounded-full border border-[#1A3550] text-[#829AB1] hover:text-[#00D4AA] hover:border-[#00D4AA]/40 transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="px-4 py-3 border-t border-[#1A3550]"
        >
          <div className="flex items-center gap-2 bg-[#050E1A] rounded-lg border border-[#1A3550] px-3 py-2 focus-within:border-[#00D4AA]/40 transition-colors">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the copilot..."
              disabled={isStreaming}
              className="flex-1 bg-transparent text-sm text-[#F0F4F8] placeholder-[#829AB1]/60 outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="p-1 rounded text-[#829AB1] hover:text-[#00D4AA] disabled:opacity-30 disabled:hover:text-[#829AB1] transition-colors"
              aria-label="Send message"
            >
              {isStreaming ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
