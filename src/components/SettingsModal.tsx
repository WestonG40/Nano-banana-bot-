import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Volume2, User, Settings as SettingsIcon, Activity } from 'lucide-react';
import { VoiceSettings } from '../services/geminiLiveService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VoiceSettings;
  onSettingsChange: (settings: VoiceSettings) => void;
}

const VOICES = [
  { id: 'Zephyr', name: 'Zephyr', description: 'Deep & Resonant' },
  { id: 'Puck', name: 'Puck', description: 'Light & Playful' },
  { id: 'Charon', name: 'Charon', description: 'Steady & Calm' },
  { id: 'Kore', name: 'Kore', description: 'Warm & Clear' },
  { id: 'Fenrir', name: 'Fenrir', description: 'Bold & Sharp' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-zinc-900 border border-emerald-500/20 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-emerald-500/10 flex justify-between items-center bg-emerald-500/5">
              <div className="flex items-center gap-3">
                <SettingsIcon size={18} className="text-emerald-400" />
                <h2 className="text-sm font-mono font-bold tracking-widest uppercase text-emerald-400">System Configuration</h2>
              </div>
              <button 
                onClick={onClose}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500/20">
              {/* Voice Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-emerald-500/50">
                  <User size={12} />
                  <span>Vocal Processor</span>
                </div>
                
                <div className="grid gap-2">
                  {VOICES.map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => onSettingsChange({ ...settings, voiceName: voice.id })}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                        settings.voiceName === voice.id
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                          : 'bg-zinc-800/50 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                      }`}
                    >
                      <div className="text-left">
                        <p className="text-xs font-mono font-bold">{voice.name}</p>
                        <p className="text-[10px] opacity-50">{voice.description}</p>
                      </div>
                      {settings.voiceName === voice.id && (
                        <motion.div
                          layoutId="active-voice"
                          className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Speech Rate */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-emerald-500/50">
                    <Volume2 size={12} />
                    <span>Temporal Rate</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">{settings.speechRate.toFixed(1)}x</span>
                </div>
                
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={settings.speechRate}
                  onChange={(e) => onSettingsChange({ ...settings, speechRate: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[8px] font-mono opacity-30 uppercase tracking-tighter">
                  <span>Slow</span>
                  <span>Normal</span>
                  <span>Fast</span>
                </div>
              </div>

              {/* Info Note */}
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                <div className="flex gap-3">
                  <Activity size={16} className="text-emerald-500 shrink-0" />
                  <p className="text-[10px] font-mono leading-relaxed text-emerald-500/70">
                    System parameters are applied during the next initialization cycle. 
                    Temporal rate adjustments optimize processing latency.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-black/20 border-t border-emerald-500/10 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-emerald-500 text-black text-[10px] font-mono font-bold uppercase tracking-widest rounded-lg hover:bg-emerald-400 transition-colors"
              >
                Apply Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
