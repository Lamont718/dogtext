'use client';

import { useEffect, useState } from 'react';
import { Volume2, Square } from 'lucide-react';
import { Button } from '../ui/button';

// Reads the dog's letter aloud with the device's own voice (no service, free).
// For breakfast-table and bedtime reading.
export default function ReadAloudButton({ text }: { text: string }) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  if (!supported) return null;

  const toggle = () => {
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ''));
    u.rate = 0.9; // a little slower, for kids
    u.pitch = 1.1;
    const english = synth.getVoices().find((v) => v.lang?.startsWith('en-US')) || synth.getVoices().find((v) => v.lang?.startsWith('en'));
    if (english) u.voice = english;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(u);
    setSpeaking(true);
  };

  return (
    <Button size="sm" variant="outline" onClick={toggle} className="rounded-full">
      {speaking ? <Square className="w-4 h-4 mr-2" /> : <Volume2 className="w-4 h-4 mr-2" />}
      {speaking ? 'Stop' : 'Read aloud'}
    </Button>
  );
}
