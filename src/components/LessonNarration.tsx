import { useEffect, useRef, useState } from 'react';
import { Square, Volume2 } from 'lucide-react';

export function LessonNarration({ transcript }: { transcript: string }) {
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');
  const active = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => () => {
    if (active.current) {
      active.current = null;
      window.speechSynthesis.cancel();
    }
  }, []);

  const toggle = () => {
    if (!('speechSynthesis' in window)) {
      setError('Audio is unavailable in this browser. You can read the transcript below.');
      return;
    }
    if (active.current) {
      active.current = null;
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }
    setError('');
    const line = new SpeechSynthesisUtterance(transcript);
    line.lang = 'en-PH';
    line.rate = 0.92;
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(item => item.lang.toLowerCase() === 'en-ph')
      ?? voices.find(item => item.lang.toLowerCase().startsWith('en') && item.localService);
    if (voice) {
      line.voice = voice;
      line.lang = voice.lang;
    }
    const finish = () => {
      if (active.current !== line) return false;
      active.current = null;
      setPlaying(false);
      return true;
    };
    line.onend = finish;
    line.onerror = () => {
      if (finish()) setError('Audio could not play. You can retry or read the transcript below.');
    };
    active.current = line;
    setPlaying(true);
    window.speechSynthesis.speak(line);
  };

  const Icon = playing ? Square : Volume2;
  return (
    <div className="mt-4 space-y-2 border-t border-sky-100 pt-3">
      <button type="button" onClick={toggle} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-sky-200 bg-white px-3 font-semibold text-sky-900 hover:bg-sky-100 focus-visible:outline-2 focus-visible:outline-sky-700">
        <Icon size={16} aria-hidden="true" />
        {playing ? 'Stop narration' : 'Listen to explanation'}
      </button>
      {error && <p className="text-sm text-slate-700" role="status">{error}</p>}
      <details className="text-sm text-slate-700">
        <summary className="cursor-pointer py-2 font-semibold text-sky-900">Read transcript</summary>
        <p className="leading-relaxed">{transcript}</p>
      </details>
    </div>
  );
}
