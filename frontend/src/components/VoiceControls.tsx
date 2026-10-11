'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Play,
  Square,
  RotateCcw,
  Settings,
  AlertCircle,
} from 'lucide-react';

interface VoiceControlsProps {
  questionText: string;
  onTranscriptChange: (transcript: string) => void;
  currentTranscript: string;
}

export default function VoiceControls({
  questionText,
  onTranscriptChange,
  currentTranscript,
}: VoiceControlsProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Check for Speech Synthesis support
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSupported(true);
      
      // Load voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          setAvailableVoices(voices);
          
          // Try to find a good default voice
          const englishVoices = voices.filter(v => v.lang.startsWith('en'));
          const defaultIndex = englishVoices.length > 0 
            ? voices.indexOf(englishVoices[0])
            : 0;
          setSelectedVoiceIndex(defaultIndex);
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Check for Speech Recognition support
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setRecognitionSupported(true);
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          const newTranscript = currentTranscript + finalTranscript + interimTranscript;
          onTranscriptChange(newTranscript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            setError('Microphone permission denied. Please allow microphone access.');
          } else if (event.error === 'no-speech') {
            setError('No speech detected. Please try again.');
          } else {
            setError(`Speech recognition error: ${event.error}`);
          }
          setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
      if (speechSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakQuestion = () => {
    if (!speechSupported) {
      setError('Speech synthesis not supported in this browser');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    setError(null);
    const utterance = new SpeechSynthesisUtterance(questionText);
    utterance.voice = availableVoices[selectedVoiceIndex] || null;
    utterance.rate = speechRate;
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      console.error('Speech error:', event);
      setError('Failed to speak question. Please try again.');
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const stopSpeaking = () => {
    if (speechSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const startRecording = async () => {
    if (!recognitionSupported) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    setError(null);

    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('Microphone permission denied. Please allow microphone access in your browser settings.');
      } else {
        setError('Failed to start recording. Please check your microphone.');
      }
      console.error('Microphone error:', err);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
      setIsRecording(false);
    }
  };

  const getMaleVoices = () => {
    return availableVoices
      .map((voice, index) => ({ voice, index }))
      .filter(({ voice }) => 
        voice.name.toLowerCase().includes('male') ||
        voice.name.toLowerCase().includes('man') ||
        voice.name.toLowerCase().includes('david') ||
        voice.name.toLowerCase().includes('james')
      );
  };

  const getFemaleVoices = () => {
    return availableVoices
      .map((voice, index) => ({ voice, index }))
      .filter(({ voice }) => 
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('woman') ||
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('karen') ||
        voice.name.toLowerCase().includes('victoria')
      );
  };

  const selectMaleVoice = () => {
    const maleVoices = getMaleVoices();
    if (maleVoices.length > 0) {
      setSelectedVoiceIndex(maleVoices[0].index);
      setError(null);
    } else {
      setError('No male voices available. Using default voice.');
    }
  };

  const selectFemaleVoice = () => {
    const femaleVoices = getFemaleVoices();
    if (femaleVoices.length > 0) {
      setSelectedVoiceIndex(femaleVoices[0].index);
      setError(null);
    } else {
      setError('No female voices available. Using default voice.');
    }
  };

  const previewVoice = () => {
    if (!speechSupported) return;
    
    const utterance = new SpeechSynthesisUtterance('Hello, this is a voice preview for your interview.');
    utterance.voice = availableVoices[selectedVoiceIndex] || null;
    utterance.rate = speechRate;
    window.speechSynthesis.speak(utterance);
  };

  const selectedVoice = availableVoices[selectedVoiceIndex];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 flex items-center space-x-2">
          <Volume2 className="w-4 h-4 text-indigo-500" />
          <span>Voice Interview Settings</span>
        </h4>
        <button
          type="button"
          onClick={() => setShowSettings(!showSettings)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Settings className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-rose-700 dark:text-rose-300">{error}</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={isSpeaking ? stopSpeaking : speakQuestion}
          disabled={!speechSupported}
          className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all flex items-center justify-center space-x-2 ${
            isSpeaking
              ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
              : 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-950/60'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSpeaking ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isSpeaking ? 'Stop Speaking' : 'Read Question Aloud'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            stopSpeaking();
            setTimeout(speakQuestion, 100);
          }}
          disabled={!speechSupported}
          className="p-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-all hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Replay Question</span>
        </button>
      </div>

      {/* Voice Settings (Expandable) */}
      {showSettings && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-4">
          {/* Voice Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Voice Selection
            </label>
            
            {speechSupported && availableVoices.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={selectMaleVoice}
                    className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Male Voice
                  </button>
                  <button
                    type="button"
                    onClick={selectFemaleVoice}
                    className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Female Voice
                  </button>
                </div>

                <select
                  value={selectedVoiceIndex}
                  onChange={(e) => setSelectedVoiceIndex(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
                >
                  {availableVoices.map((voice, index) => (
                    <option key={index} value={index}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>

                {selectedVoice && (
                  <p className="text-xs text-slate-500">
                    Current: {selectedVoice.name} • {selectedVoice.lang}
                  </p>
                )}

                <button
                  type="button"
                  onClick={previewVoice}
                  className="w-full p-2 rounded-lg border border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-medium hover:bg-indigo-100 dark:hover:bg-indigo-950/60 transition-colors"
                >
                  Preview Voice
                </button>
              </>
            ) : (
              <p className="text-xs text-slate-500">Speech synthesis not available in this browser</p>
            )}
          </div>

          {/* Speech Rate */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Speech Speed: {speechRate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speechRate}
              onChange={(e) => setSpeechRate(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>Slow</span>
              <span>Normal</span>
              <span>Fast</span>
            </div>
          </div>
        </div>
      )}

      {/* Microphone Controls */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          Voice Answer (Microphone)
        </label>
        
        {recognitionSupported ? (
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-full p-3 rounded-xl border-2 font-semibold text-sm transition-all flex items-center justify-center space-x-2 ${
              isRecording
                ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 animate-pulse'
                : 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/60'
            }`}
          >
            {isRecording ? (
              <>
                <Square className="w-4 h-4" />
                <span>Stop Recording</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>Start Microphone</span>
              </>
            )}
          </button>
        ) : (
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Voice recognition not supported in this browser. Please use Chrome, Edge, or Safari.
            </p>
          </div>
        )}
      </div>

      {/* Status Indicators */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-1 ${speechSupported ? 'text-emerald-600' : 'text-slate-400'}`}>
            <Volume2 className="w-3.5 h-3.5" />
            <span>{speechSupported ? 'Speech Ready' : 'No Speech'}</span>
          </div>
          <div className={`flex items-center space-x-1 ${recognitionSupported ? 'text-emerald-600' : 'text-slate-400'}`}>
            <Mic className="w-3.5 h-3.5" />
            <span>{recognitionSupported ? 'Mic Ready' : 'No Mic'}</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500 italic">
        Tip: You can type your answer directly below or use the microphone. The transcript is editable before submission.
      </p>
    </div>
  );
}
