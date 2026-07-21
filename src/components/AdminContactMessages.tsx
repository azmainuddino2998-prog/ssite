import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, Sparkles, User, Calendar } from 'lucide-react';
import { De } from '../lib/sdk';
import { ContactMessage } from '../types';

export const AdminContactMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    De.entities.ContactMessage.list('-created_date', 100)
      .then(setMessages)
      .catch((err) => console.error('Failed to load contact messages:', err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl text-silver font-bold">Contact Messages</h2>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-2 border-cobalt/30 border-t-cobalt rounded-full animate-spin" />
        </div>
      ) : messages.length === 0 ? (
        <p className="text-silver/30 text-sm text-center py-8">No contact messages received yet.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="glass-card rounded-xl p-5 border border-silver/5 space-y-4"
            >
              {/* Header meta */}
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 border-b border-silver/5 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full glass flex items-center justify-center text-cobalt">
                    <User size={14} />
                  </div>
                  <div>
                    <h4 className="text-silver text-sm font-semibold">{msg.name}</h4>
                    <p className="text-silver/40 text-xs">
                      {msg.email} {msg.phone ? `• ${msg.phone}` : ''}
                    </p>
                  </div>
                </div>

                {msg.created_date && (
                  <div className="flex items-center gap-1.5 text-silver/30 text-xs">
                    <Calendar size={12} />
                    <span>{msg.created_date.slice(0, 10)}</span>
                  </div>
                )}
              </div>

              {/* Message block */}
              <div className="space-y-1">
                <p className="text-silver/40 text-[10px] uppercase tracking-wider font-semibold">Message</p>
                <p className="text-silver/80 text-sm leading-relaxed italic">
                  "{msg.message}"
                </p>
              </div>

              {/* AI Auto Reply block */}
              {msg.ai_response && (
                <div className="bg-cobalt/5 border border-cobalt/10 rounded-xl p-4 space-y-2 relative overflow-hidden">
                  <div className="flex items-center gap-1.5 text-cobalt text-xs font-semibold">
                    <Sparkles size={12} />
                    <span>Instant AI auto-response sent:</span>
                  </div>
                  <p className="text-silver/70 text-xs leading-relaxed font-mono whitespace-pre-wrap">
                    {msg.ai_response}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default AdminContactMessages;
