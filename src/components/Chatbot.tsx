import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Loader2, Send } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { De } from '../lib/sdk';
import { Product } from '../types';

interface ChatMessage {
  role: 'ai' | 'user';
  text: string;
}

export const Chatbot: React.FC = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      text: `Hello! Welcome to Kozzak Mens Wear. Ask me anything about our products! 🛍️\n\nআমাদের প্রোডাক্ট সম্পর্কে যেকোনো প্রশ্ন করুন!`,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue('');
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    let productsList: Product[] = [];
    try {
      productsList = await De.entities.Product.list('-created_date', 50);
    } catch (err) {
      console.error('Error loading products for chatbot:', err);
    }

    let settingsContext = '';
    try {
      const settingsList = await De.entities.SiteSettings.list();
      if (settingsList && settingsList.length > 0) {
        const s = settingsList[0];
        settingsContext = `Store Name: ${s.site_name || 'Kozzak Mens Wear'}, Phone: ${s.phone || 'N/A'}, WhatsApp: ${s.whatsapp_number || 'N/A'}, Address: ${s.address || 'N/A'}, Bio: ${s.footer_text || ''}`;
      }
    } catch (err) {
      console.error('Error loading site settings for chatbot:', err);
    }

    // Format current product catalog for context
    const catalogContext = productsList
      .map(
        (p) =>
          `Product: ${p.title}, Price: ৳${p.price}${
            p.discount_price ? `, Sale: ৳${p.discount_price}` : ''
          }, Category: ${p.category}, SKU: ${p.sku}, Sizes: ${p.sizes || 'N/A'}, Colors: ${
            p.colors || 'N/A'
          }, Description: ${p.description || ''}`
      )
      .join('\n');

    try {
      const response = await De.integrations.Core.InvokeLLM({
        prompt: `You are a helpful customer support assistant for Kozzak Mens Wear, a premium men's fashion e-commerce store in Bangladesh. Answer in the same language the customer asks in (English or Bangla). Be friendly, helpful, and concise.

Store Details:
${settingsContext || 'Store: Kozzak Mens Wear'}

Available Products:
${catalogContext || 'No products available yet.'}

Customer's question: ${userText}`,
      });

      setMessages((prev) => [...prev, { role: 'ai', text: response }]);
    } catch (err) {
      console.error('AI chat failed:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAdminPath) return null;

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-4 md:right-8 w-14 h-14 rounded-full bg-cobalt glow-blue flex items-center justify-center text-white z-50 shadow-lg cursor-pointer"
        title="Chat with Assistant"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </motion.button>

      {/* Chat window drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-20 right-4 md:right-8 w-[340px] md:w-[380px] h-[480px] glass rounded-2xl z-50 flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-silver/10">
              <div>
                <h3 className="text-silver font-semibold text-sm">Kozzak Assistant</h3>
                <p className="text-silver/40 text-xs">Ask about products & orders</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-silver/40 hover:text-silver">
                <X size={18} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-cobalt text-white rounded-br-sm'
                        : 'glass-light text-silver/80 rounded-bl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="glass-light rounded-xl px-3 py-2 text-silver/40">
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Input area */}
            <div className="p-3 border-t border-silver/10">
              <div className="flex items-center gap-2">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your question..."
                  className="flex-1 bg-transparent text-silver text-sm placeholder:text-silver/30 outline-none px-2"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  className="w-8 h-8 rounded-full bg-cobalt flex items-center justify-center text-white disabled:opacity-30 cursor-pointer"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export default Chatbot;
