import React, { useState } from 'react';
import { CommuterProfile, TransitRoute } from '../types/transit';
import { SupportedLanguage, TransitVoiceSynthesizer } from '../services/speechService';
import {
  Sparkles,
  X,
  Send,
  Volume2,
  VolumeX,
  Bot,
  User,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CommuterProfile;
  language: SupportedLanguage;
  routes: TransitRoute[];
  onSelectRoute: (id: string) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  recommendedRouteId?: string;
  timestamp: string;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  profile,
  language,
  routes,
  onSelectRoute,
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-01',
      sender: 'assistant',
      text: `Hello! I am your TransitShield AI Companion. I analyze route risk scores, delay variance, crowding forecasts, and step-free accessibility constraints for your active profile (${profile.name}). How can I assist your journey?`,
      timestamp: 'Just now',
    },
  ]);

  if (!isOpen) return null;

  const handleSendMessage = async (promptText?: string) => {
    const query = promptText || inputPrompt;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: query,
          profileId: profile.id,
          language,
        }),
      });

      const data = await response.json();
      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: data.advisorText,
        recommendedRouteId: data.recommendedRouteId,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Advisor request error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      TransitVoiceSynthesizer.stop();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    TransitVoiceSynthesizer.speak(text, language, () => {
      setIsSpeaking(false);
    });
  };

  const samplePrompts = [
    'Why is Bus 500D not recommended despite being fastest?',
    'I use a motorized wheelchair, which step-free route should I take?',
    'Will I find a seat between 8:00 AM and 10:00 AM rush hour?',
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>TransitShield AI Advisor</span>
              <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 px-1.5 py-0.2 rounded border border-cyan-800">
                Gemini 3.8
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Profile: {profile.name} · Lang: {language.toUpperCase()}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Thread */}
      <div className="p-4 overflow-y-auto flex-1 space-y-4">
        {messages.map(msg => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 ${
                  isUser
                    ? 'bg-cyan-600 text-white rounded-br-xs'
                    : 'bg-slate-950/90 text-slate-200 border border-slate-800 rounded-bl-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-[10px] opacity-70 mb-1">
                  <span className="font-semibold flex items-center gap-1">
                    {isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3 text-cyan-400" />}
                    {isUser ? 'You' : 'TransitShield AI'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="whitespace-pre-line text-xs">{msg.text}</div>

                {/* Optional Recommended Route Button */}
                {msg.recommendedRouteId && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => {
                        onSelectRoute(msg.recommendedRouteId!);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 font-semibold text-[11px] transition"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Highlight Recommended Route on Map</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Voice read aloud for assistant messages */}
                {!isUser && (
                  <div className="pt-1 flex items-center justify-end">
                    <button
                      onClick={() => handleSpeak(msg.text)}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
                      title="Listen in chosen language"
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span>{isSpeaking ? 'Stop Audio' : 'Play Voice'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic bg-slate-950/60 p-3 rounded-xl border border-slate-800 w-fit">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>Evaluating route risk vectors and accessibility constraints...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Inquiries */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 space-y-1.5">
        <span className="text-[10px] font-mono uppercase text-slate-400 block px-1">
          Quick Inquiries
        </span>
        <div className="flex flex-col gap-1.5">
          {samplePrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(p)}
              className="text-left text-[11px] text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-850 p-2 rounded-lg border border-slate-800 truncate transition"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Input Box */}
      <div className="p-3 border-t border-slate-800 bg-slate-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask about crowding, stairs, or bus delays..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-cyan-400"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
