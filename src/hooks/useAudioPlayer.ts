import { useRef, useCallback } from 'react';

export const useAudioPlayer = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const BUFFER_OFFSET = 0.05; // 50ms safety buffer for the start of a sequence

  const initAudio = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.connect(audioContextRef.current.destination);
      nextStartTimeRef.current = 0;
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  }, []);

  const playChunk = useCallback(async (base64Data: string) => {
    await initAudio();
    const ctx = audioContextRef.current!;
    const analyser = analyserRef.current!;
    
    // Decode base64 to ArrayBuffer
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Convert Int16 PCM to Float32
    const int16Data = new Int16Array(bytes.buffer);
    const float32Data = new Float32Array(int16Data.length);
    for (let i = 0; i < int16Data.length; i++) {
      float32Data[i] = int16Data[i] / 32768.0;
    }

    const audioBuffer = ctx.createBuffer(1, float32Data.length, 24000);
    audioBuffer.getChannelData(0).set(float32Data);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(analyser);

    const currentTime = ctx.currentTime;
    
    // If we are starting fresh or have fallen behind, start with a small offset
    // to allow the browser to schedule the audio precisely.
    if (nextStartTimeRef.current < currentTime) {
      nextStartTimeRef.current = currentTime + BUFFER_OFFSET;
    }

    const startTime = nextStartTimeRef.current;
    source.start(startTime);
    
    // Update next start time for the next chunk
    nextStartTimeRef.current = startTime + audioBuffer.duration;
  }, [initAudio]);

  const stopAll = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      analyserRef.current = null;
      nextStartTimeRef.current = 0;
    }
  }, []);

  return { playChunk, stopAll, initAudio, analyser: analyserRef.current };
};
