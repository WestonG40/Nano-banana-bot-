import React, { useState, useCallback, useEffect, useRef } from 'react';
import { NanoBot } from './components/NanoBot';
import { VoiceVisualizer } from './components/VoiceVisualizer';
import { ChatHistory } from './components/ChatHistory';
import { SettingsModal } from './components/SettingsModal';
import { connectToGeminiLive, LiveSession, ChatMessage, VoiceSettings } from './services/geminiLiveService';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { Mic, MicOff, Power, Terminal, Cpu, Activity, Trash2, Play, Pause, RotateCcw, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAnimationsPaused, setIsAnimationsPaused] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
    const saved = localStorage.getItem('nanobot_voice_settings');
    return saved ? JSON.parse(saved) : { voiceName: 'Zephyr', speechRate: 1.0 };
  });
  const [error, setError] = useState<{ message: string; canRetry: boolean } | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('nanobot_history');
    return saved ? JSON.parse(saved) : [];
  });
  
  const sessionRef = useRef<LiveSession | null>(null);
  const { isRecording, startRecording, stopRecording, initRecorder } = useAudioRecorder();
  const { playChunk, stopAll, initAudio, analyser } = useAudioPlayer();
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    localStorage.setItem('nanobot_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('nanobot_voice_settings', JSON.stringify(voiceSettings));
  }, [voiceSettings]);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('nanobot_history');
  };

  const resetAnimations = () => {
    setResetKey(prev => prev + 1);
    setIsAnimationsPaused(false);
  };

  const handleConnect = useCallback(async () => {
    if (isConnected) {
      sessionRef.current?.close();
      stopRecording();
      stopAll();
      setIsConnected(false);
      retryCountRef.current = 0;
      return;
    }

    setError(null);
    setIsConnecting(true);

    try {
      console.log("[NanoBot] Initializing audio contexts...");
      await initAudio();
      await initRecorder();
      
      console.log("[NanoBot] Requesting microphone access...");
      await startRecording((base64) => {
        if (sessionRef.current) {
          sessionRef.current.sendRealtimeInput({
            media: { data: base64, mimeType: 'audio/pcm;rate=16000' }
          });
        }
      });

      const session = await connectToGeminiLive({
        onAudioData: (base64) => {
          setIsSpeaking(true);
          playChunk(base64);
        },
        onInterrupted: () => {
          stopAll();
          setIsSpeaking(false);
        },
        onTranscription: (text, isModel) => {
          setHistory(prev => {
            const last = prev[prev.length - 1];
            // If the last message was from the same role, append to it (simple deduplication/merging for streaming)
            if (last && last.role === (isModel ? 'model' : 'user')) {
              // Only append if it's not exactly the same (some overlap might happen in streaming)
              if (last.text.endsWith(text)) return prev;
              const newHistory = [...prev];
              newHistory[newHistory.length - 1] = { ...last, text: last.text + " " + text };
              return newHistory;
            }
            return [...prev, { role: isModel ? 'model' : 'user', text }];
          });
        },
        onError: (err) => {
          console.error("Session error:", err);
          const userMsg = err.userMessage || "Connection lost.";
          setError({ message: userMsg, canRetry: retryCountRef.current < MAX_RETRIES });
          setIsConnecting(false);
          setIsConnected(false);
          stopRecording();
        },
        onOpen: () => {
          setIsConnecting(false);
          setIsConnected(true);
          setError(null);
          retryCountRef.current = 0;
        },
        onClose: () => {
          setIsConnected(false);
          setIsConnecting(false);
          stopRecording();
        }
      }, history.slice(-10), voiceSettings); // Pass voice settings
      sessionRef.current = session;
    } catch (err: any) {
      console.error("Failed to initialize NanoBot:", err);
      let message = "Failed to initialize NanoBot. Check your connection or API key.";
      let canRetry = true;

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.message?.includes('Permission denied')) {
        message = "Microphone access denied. To fix: 1. Click the lock/camera icon in your address bar. 2. Set Microphone to 'Allow'. 3. Refresh this page.";
        canRetry = false;
      } else if (err.message?.includes('GEMINI_API_KEY')) {
        message = "API Key missing. Please set GEMINI_API_KEY in the Settings menu.";
        canRetry = false;
      }

      setError({ message, canRetry });
      setIsConnecting(false);
      stopRecording();
    }
  }, [isConnected, stopRecording, stopAll, initAudio, initRecorder, startRecording, playChunk, history, voiceSettings]);

  const handleRetry = () => {
    retryCountRef.current += 1;
    handleConnect();
  };

  // Simple heuristic for speaking state (reset if no audio for 500ms)
  useEffect(() => {
    if (isSpeaking) {
      const timeout = setTimeout(() => setIsSpeaking(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [isSpeaking]);

  return (
    <div className="min-h-screen bg-[#050505] text-emerald-500 font-sans selection:bg-emerald-500/30 overflow-hidden flex flex-col">
      {/* Header / HUD */}
      <header className="p-6 flex justify-between items-center border-b border-emerald-500/10 backdrop-blur-md bg-black/50 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Cpu size={18} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-sm font-mono font-bold tracking-widest uppercase">NanoBot v3.1</h1>
            <p className="text-[10px] opacity-50 font-mono">SYSTEM STATUS: {isConnected ? 'ONLINE' : 'OFFLINE'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 lg:gap-8">
          <div className="hidden md:flex items-center gap-6 text-[10px] font-mono uppercase tracking-tighter opacity-70">
            <div className="flex items-center gap-2">
              <Activity size={12} />
              <span>Neural Link: {isConnected ? 'Active' : 'Standby'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Terminal size={12} />
              <span>Core: Gemini 3 Flash</span>
            </div>
          </div>

          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all group"
          >
            <SettingsIcon size={18} className="text-emerald-400 group-hover:rotate-90 transition-transform duration-500" />
          </button>
        </div>
      </header>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={voiceSettings}
        onSettingsChange={setVoiceSettings}
      />

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col items-center justify-center p-4">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-8 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-md text-xs font-mono max-w-md flex flex-col gap-2 items-center text-center backdrop-blur-sm z-50"
            >
              <p>{error.message}</p>
              {error.canRetry && (
                <button 
                  onClick={handleRetry}
                  className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded text-[10px] uppercase tracking-widest transition-colors"
                >
                  Retry Connection
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10 flex flex-col items-center gap-16">
          <div key={resetKey} className="flex flex-col items-center">
            <NanoBot 
              isListening={isConnected && isRecording} 
              isSpeaking={isSpeaking} 
              isConnecting={isConnecting} 
              isPaused={isAnimationsPaused}
            />

            {/* Animation Controls */}
            <div className="mt-4 flex items-center gap-4 bg-emerald-500/5 border border-emerald-500/10 rounded-full px-4 py-2 backdrop-blur-sm">
              <button 
                onClick={() => setIsAnimationsPaused(!isAnimationsPaused)}
                className="p-1 hover:text-white transition-colors"
                title={isAnimationsPaused ? "Resume Animations" : "Pause Animations"}
              >
                {isAnimationsPaused ? <Play size={14} /> : <Pause size={14} />}
              </button>
              <button 
                onClick={resetAnimations}
                className="p-1 hover:text-white transition-colors"
                title="Reset Animations"
              >
                <RotateCcw size={14} />
              </button>
              <div className="w-px h-3 bg-emerald-500/20" />
              <span className="text-[9px] font-mono uppercase tracking-widest opacity-50">
                {isAnimationsPaused ? "Paused" : "Live"}
              </span>
            </div>
          </div>

          <div className="h-12">
            <VoiceVisualizer 
              analyser={analyser} 
              isSpeaking={isSpeaking} 
              isPaused={isAnimationsPaused}
            />
          </div>

          <div className="flex flex-col items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleConnect}
              disabled={isConnecting}
              className={`group relative flex items-center justify-center w-20 h-20 rounded-full border-2 transition-all duration-500 ${
                isConnected 
                  ? 'border-red-500/50 bg-red-500/5 text-red-500' 
                  : 'border-emerald-500/50 bg-emerald-500/5 text-emerald-500'
              } ${isConnecting ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
            >
              <div className={`absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500 ${
                isConnected ? 'bg-red-500' : 'bg-emerald-500'
              }`} />
              {isConnecting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Power size={32} />
                </motion.div>
              ) : isConnected ? (
                <MicOff size={32} />
              ) : (
                <Mic size={32} />
              )}
            </motion.button>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-50">
              {isConnecting ? "Establishing Link" : isConnected ? "Tap to Disconnect" : "Tap to Initialize"}
            </p>
          </div>

          <ChatHistory history={history} />
          
          {history.length > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              whileHover={{ opacity: 1 }}
              onClick={clearHistory}
              className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest text-red-400 mt-4"
            >
              <Trash2 size={10} />
              Clear Context
            </motion.button>
          )}
        </div>

        {/* Decorative Side Elements */}
        <div className="absolute left-8 bottom-8 hidden lg:block">
          <div className="space-y-2 opacity-30 font-mono text-[9px]">
            <p className="text-emerald-400">0x4F2A // MEMORY_ALLOC</p>
            <p>0x91B3 // BUFFER_SYNC</p>
            <p>0xCC12 // LATENCY_LOW</p>
            <div className="w-32 h-1 bg-emerald-500/20 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-emerald-500"
                animate={{ width: isConnected ? "80%" : "10%" }}
              />
            </div>
          </div>
        </div>

        <div className="absolute right-8 bottom-8 hidden lg:block text-right">
          <div className="space-y-1 opacity-30 font-mono text-[9px]">
            <p>ENCRYPTION: AES-256</p>
            <p>PROTOCOL: WEBSOCKET_LIVE</p>
            <p>MODALITY: AUDIO_NATIVE</p>
          </div>
        </div>
      </main>

      {/* Footer / Info */}
      <footer className="p-6 border-t border-emerald-500/10 flex justify-center">
        <p className="text-[9px] font-mono opacity-40 uppercase tracking-widest">
          &copy; 2026 NanoBot Systems // Powered by Google Gemini
        </p>
      </footer>
    </div>
  );
}
