import React from 'react';
import { motion } from 'motion/react';

interface NanoBotProps {
  isListening: boolean;
  isSpeaking: boolean;
  isConnecting: boolean;
  isPaused?: boolean;
}

export const NanoBot: React.FC<NanoBotProps> = ({ isListening, isSpeaking, isConnecting, isPaused = false }) => {
  const animationState = isPaused ? "paused" : "running";

  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {/* Outer Ring */}
      <motion.div
        className="absolute w-full h-full border-2 border-emerald-500/20 rounded-full"
        animate={isPaused ? {} : {
          rotate: 360,
          scale: isListening ? [1, 1.05, 1] : 1,
        }}
        transition={{
          rotate: { duration: 10, repeat: Infinity, ease: "linear" },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
      />

      {/* Pulsing Core */}
      <motion.div
        className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl ${
          isConnecting ? 'bg-zinc-800' : isSpeaking ? 'bg-emerald-500' : 'bg-zinc-900'
        }`}
        animate={isPaused ? {} : {
          scale: isSpeaking ? [1, 1.1, 1] : isListening ? [1, 1.05, 1] : 1,
          boxShadow: isSpeaking 
            ? "0 0 40px rgba(16, 185, 129, 0.6)" 
            : isListening 
              ? "0 0 20px rgba(16, 185, 129, 0.3)" 
              : "0 0 10px rgba(0, 0, 0, 0.5)"
        }}
        transition={{
          duration: isSpeaking ? 0.5 : 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Bot "Eye" or Core Symbol */}
        <motion.div 
          className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden"
          animate={isPaused ? {} : {
            height: isConnecting ? [48, 2, 48] : 48
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            times: [0, 0.1, 0.2]
          }}
        >
          <div className="w-8 h-8 bg-zinc-900 rounded-full" />
        </motion.div>
      </motion.div>

      {/* Orbiting Particles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 bg-emerald-400 rounded-full"
          animate={isPaused ? {} : {
            rotate: 360,
            x: [100, 120, 100],
          }}
          transition={{
            rotate: { duration: 5 + i * 2, repeat: Infinity, ease: "linear" },
            x: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{
            transformOrigin: "center",
          }}
        />
      ))}

      {/* Status Text */}
      <div className="absolute -bottom-12 text-center w-full">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-500/70">
          {isConnecting ? "Initializing..." : isSpeaking ? "Transmitting" : isListening ? "Listening" : "Standby"}
        </p>
      </div>
    </div>
  );
};
