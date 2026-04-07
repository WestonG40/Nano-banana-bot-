import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage } from '../services/geminiLiveService';
import { User, Bot } from 'lucide-react';

interface ChatHistoryProps {
  history: ChatMessage[];
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ history }) => {
  return (
    <div className="w-full max-w-2xl mt-8 space-y-4 max-h-[40vh] overflow-y-auto px-4 scrollbar-thin scrollbar-thumb-emerald-500/20 scrollbar-track-transparent">
      <AnimatePresence initial={false}>
        {history.map((msg, i) => (
          <motion.div
            key={`${i}-${msg.role}`}
            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`p-2 rounded-lg border ${
              msg.role === 'user' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-300'
            }`}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-mono leading-relaxed ${
              msg.role === 'user'
                ? 'bg-emerald-500/5 border border-emerald-500/10 text-emerald-300 rounded-tr-none'
                : 'bg-zinc-900/50 border border-zinc-800 text-zinc-400 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
