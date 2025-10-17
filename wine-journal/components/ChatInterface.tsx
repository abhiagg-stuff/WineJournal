import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import XIcon from './icons/XIcon';
import SendIcon from './icons/SendIcon';
import { WineEntry } from '../types';
import LoadingSpinner from './LoadingSpinner';

const mergeClassNames = (...classes: (string | undefined)[]) =>
  classes.filter(Boolean).join(' ');

const QUICK_PROMPTS = [
  'What wine from my cellar pairs with pasta? 🍝',
  'Which red wine should I drink from my cellar? 🍾',
  'Do I have any Chardonnay? 🔍',
  'Recommend a new Cabernet under $50. 🛒'
];

const PROGRESS_MESSAGES = [
  'Just a sec...',
  'Checking your cellar and ratings...',
  'Preparing my response...'
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  wines: WineEntry[];
  onGenerateRecommendation: (prompt: string, context: { cellarWines: WineEntry[], likedWines: WineEntry[] }) => Promise<string>;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ isOpen, onClose, wines, onGenerateRecommendation }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState(PROGRESS_MESSAGES[0]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && showSuggestions) {
      requestAnimationFrame(scrollToBottom);
    }
  }, [isOpen, showSuggestions]);

  useEffect(() => {
    if (!isLoading) {
      setLoadingMessageIndex(0);
      setLoadingMessage(PROGRESS_MESSAGES[0]);
      return;
    }

    setLoadingMessageIndex(0);
    setLoadingMessage(PROGRESS_MESSAGES[0]);

    const intervals = PROGRESS_MESSAGES.slice(1).map((message, index) =>
      window.setTimeout(() => {
        setLoadingMessageIndex(index + 1);
        setLoadingMessage(message);
      }, 1800 * (index + 1))
    );

    return () => {
      intervals.forEach(id => window.clearTimeout(id));
    };
  }, [isLoading]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: 'Hello! I can help you find a wine from your cellar or new wines to purchase based on your past ratings'
        }
      ]);
    }
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');
    await processUserMessage(userMessage);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const processUserMessage = async (message: string) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    setMessages(prev => [...prev, { role: 'user', content: trimmedMessage }]);
    setShowSuggestions(false);
    setIsLoading(true);

    try {
      const cellarWines = wines.filter(wine => wine.inCellar);
      const likedWines = wines.filter(wine => wine.rating >= 4);

      const response = await onGenerateRecommendation(trimmedMessage, {
        cellarWines,
        likedWines
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error while generating recommendations. Please try again.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    if (isLoading) return;
    setInputText(prompt);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Wine Recommendations</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Close chat"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={mergeClassNames(
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={mergeClassNames(
                  message.role === 'user'
                    ? 'max-w-[72%] rounded-2xl shadow-sm bg-red-800 text-white px-4 py-3 text-sm leading-relaxed'
                    : 'w-full text-gray-800'
                )}
              >
                {message.role === 'assistant' ? (
                  <div className="space-y-3 text-sm leading-relaxed">
                    <ReactMarkdown
                      components={{
                        ul: ({ className, ...props }) => (
                          <ul
                            className={mergeClassNames(
                              'list-disc pl-6 space-y-1',
                              className
                            )}
                            {...props}
                          />
                        ),
                        ol: ({ className, ...props }) => (
                          <ol
                            className={mergeClassNames(
                              'list-decimal pl-6 space-y-1',
                              className
                            )}
                            {...props}
                          />
                        ),
                        li: ({ className, ...props }) => (
                          <li
                            className={mergeClassNames('pl-1', className)}
                            {...props}
                          />
                        ),
                        strong: ({ className, ...props }) => (
                          <strong
                            className={mergeClassNames('font-semibold', className)}
                            {...props}
                          />
                        ),
                        p: ({ className, ...props }) => (
                          <p
                            className={mergeClassNames(
                              'text-sm leading-relaxed',
                              className
                            )}
                            {...props}
                          />
                        )
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                )}
              </div>
            </div>
          ))}
          {showSuggestions && (
            <div className="flex flex-wrap gap-2 pt-2">
              {QUICK_PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleQuickPrompt(prompt)}
                  className="px-3 py-2 text-xs sm:text-sm rounded-full border border-red-200 bg-white hover:bg-red-50 text-red-800 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <LoadingSpinner className="h-6 w-6 animate-spin text-red-800" />
                <span className="animate-pulse">{loadingMessage}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="px-4 pb-4 pt-0">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything ..."
              className="w-full border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent resize-none px-4 py-3 pr-20 text-sm leading-relaxed min-h-[96px]"
              rows={3}
              disabled={isLoading}
            />
            <button
              type="submit"
              aria-label="Send message"
              disabled={isLoading || !inputText.trim()}
              className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center bg-red-800 text-white rounded-full shadow-sm hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SendIcon className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;