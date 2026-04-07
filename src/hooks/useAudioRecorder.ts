import { useState, useCallback, useRef } from 'react';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const initRecorder = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
    }
  }, []);

  const startRecording = useCallback(async (onData: (base64Data: string) => void) => {
    try {
      console.log("[Recorder] Checking mediaDevices support...");
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Microphone API not supported in this browser.");
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log("[Recorder] Available devices:", devices.map(d => `${d.kind}: ${d.label}`).join(', '));

      console.log("[Recorder] Requesting getUserMedia (FIRST)...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("[Recorder] getUserMedia successful.");
      streamRef.current = stream;

      initRecorder();
      const audioContext = audioContextRef.current!;
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32 to Int16
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        
        // Convert to Base64
        const buffer = pcmData.buffer;
        const base64Data = btoa(
          new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        
        onData(base64Data);
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
      
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      throw err;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  }, []);

  return { isRecording, startRecording, stopRecording, initRecorder };
};
