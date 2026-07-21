import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Send, Check, Mail, Phone, MapPin, Sparkles } from 'lucide-react';
import { De } from '../lib/sdk';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const Contact: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiReply, setAiReply] = useState('');

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setIsSubmitting(true);
    setAiReply('');

    try {
      // 1. Submit contact message to local REST DB
      const record = await De.entities.ContactMessage.create(form);

      // 2. Generate instant AI reply via server-side Gemini Proxy
      const prompt = `You are a professional customer care manager for Kozzak Mens Wear, a premium men's fashion e-commerce brand.
Customer ${form.name} sent the following message: "${form.message}"
Write a friendly, polite, and helpful auto-response email acknowledging their query. Let them know a team representative will reach out in person within 24 hours. Sign off as 'Kozzak Care Team'.`;

      const aiResponse = await De.integrations.Core.InvokeLLM({ prompt });
      setAiReply(aiResponse);

      // 3. Update the record with the generated AI response for logs
      await De.entities.ContactMessage.update(record.id, {
        ai_response: aiResponse
      });

      setIsSent(true);
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      console.error('Contact message submission failed:', err);
      // Fallback
      setAiReply('Thank you for contacting us! We received your message and will get back to you within 24 hours.');
      setIsSent(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian text-silver">
      <Navbar />

      <div className="pt-24 pb-16 max-w-7xl mx-auto px-4">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-silver/40 hover:text-silver text-sm mb-8 transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Home</span>
        </Link>

        {/* Title */}
        <div className="text-center mb-12">
          <p className="text-cobalt text-xs tracking-[0.3em] uppercase mb-2 font-semibold">Get In Touch</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-silver">
            Contact Us
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Brand Info */}
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-silver tracking-wide mb-4">
                KOZZAK MENS WEAR
              </h2>
              <p className="text-silver/40 text-sm leading-relaxed max-w-md">
                Have a question about sizes, styles, or order tracking? Fill out the form and our team (and AI customer assistant) will help you immediately!
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-cobalt">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-silver/30 text-[10px] tracking-wider uppercase">HQ Address</p>
                  <p className="text-silver text-sm font-medium">Dhaka, Bangladesh</p>
                </div>
              </div>

              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-cobalt">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-silver/30 text-[10px] tracking-wider uppercase">Hotline</p>
                  <p className="text-silver text-sm font-medium">+8801XXXXXXXXX</p>
                </div>
              </div>

              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-cobalt">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-silver/30 text-[10px] tracking-wider uppercase">Email Support</p>
                  <p className="text-silver text-sm font-medium">samirazmain8@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form / Instant reply block */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {!isSent ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onSubmit={handleSendMessage}
                  className="glass-card rounded-2xl p-6 md:p-8 space-y-4 border border-silver/5"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your Name *"
                      className="bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm focus:border-cobalt outline-none transition-colors"
                      required
                    />
                    <input
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      type="email"
                      placeholder="Your Email *"
                      className="bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm focus:border-cobalt outline-none transition-colors"
                      required
                    />
                  </div>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Phone (Optional)"
                    className="w-full bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm focus:border-cobalt outline-none transition-colors"
                  />
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Write your message here... *"
                    rows={5}
                    className="w-full bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm focus:border-cobalt outline-none transition-colors resize-none"
                    required
                  />

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={isSubmitting || !form.name || !form.email || !form.message}
                    className="w-full py-4 rounded-xl bg-cobalt text-white font-semibold flex items-center justify-center gap-3 glow-blue transition-all cursor-pointer disabled:opacity-30"
                  >
                    <Send size={18} />
                    <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                  </motion.button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card rounded-2xl p-6 md:p-8 border border-silver/5 text-center space-y-6"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 mx-auto text-green-500">
                    <Check size={28} />
                  </div>
                  <div>
                    <h3 className="text-silver font-semibold text-lg">Message Sent!</h3>
                    <p className="text-silver/40 text-xs mt-1">
                      Your query has been recorded. Here's an instant reply from our AI customer manager:
                    </p>
                  </div>

                  {/* AI response box */}
                  <div className="bg-obsidian/40 rounded-xl p-5 border border-silver/10 text-left relative overflow-hidden">
                    <div className="absolute top-2 right-2 text-cobalt opacity-40 flex items-center gap-1 text-[9px] font-mono tracking-widest uppercase">
                      <Sparkles size={10} />
                      <span>Instant AI Reply</span>
                    </div>
                    <p className="text-silver/70 text-xs font-mono leading-relaxed whitespace-pre-wrap pt-2">
                      {aiReply}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsSent(false)}
                    className="px-6 py-2.5 glass text-silver/60 rounded-xl text-xs hover:text-silver transition-colors"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
export default Contact;
