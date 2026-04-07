import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

interface VoiceVisualizerProps {
  analyser: AnalyserNode | null;
  isSpeaking: boolean;
  isPaused?: boolean;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ analyser, isSpeaking, isPaused = false }) => {
  const [volumes, setVolumes] = useState<number[]>(new Array(8).fill(0));
  const requestRef = useRef<number>(0);

  useEffect(() => {
    if (!analyser || !isSpeaking || isPaused) {
      if (!isPaused) setVolumes(new Array(8).fill(0));
      return;
    }

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const update = () => {
      analyser.getByteFrequencyData(dataArray);
      
      // Get 8 frequency bands
      const newVolumes = [];
      const step = Math.floor(dataArray.length / 8);
      for (let i = 0; i < 8; i++) {
        let sum = 0;
        for (let j = 0; j < step; j++) {
          sum += dataArray[i * step + j];
        }
        newVolumes.push(sum / step / 255);
      }
      
      setVolumes(newVolumes);
      requestRef.current = requestAnimationFrame(update);
    };

    requestRef.current = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [analyser, isSpeaking]);

  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {volumes.map((vol, i) => (
        <motion.div
          key={i}
          animate={{
            height: isSpeaking ? `${Math.max(4, vol * 40)}px` : '4px',
            backgroundColor: isSpeaking ? '#10b981' : '#374151',
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
          }}
          className="w-1 rounded-full"
        />
      ))}
    </div>
  );
};
