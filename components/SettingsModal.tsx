import React, { useState, useEffect } from 'react';
import { X, Key, Save, Check, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('GEMINI_API_KEY');
    if (storedKey) setApiKey(storedKey);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('GEMINI_API_KEY', apiKey.trim());
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1000);
    }
  };

  const handleClear = () => {
      localStorage.removeItem('GEMINI_API_KEY');
      setApiKey('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-charcoal-100 border border-charcoal-50 rounded-2xl shadow-2xl p-8 overflow-hidden">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Key className="text-neon" size={20} /> API Configuration
          </h2>
          <p className="text-slate-400 text-sm">
            Enter your Google Gemini API Key. This is stored locally in your browser.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Gemini API Key</label>
            <div className="relative">
              <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-charcoal-200 border border-charcoal-50 rounded-lg py-3 pl-4 pr-4 text-white focus:border-neon focus:outline-none transition-colors font-mono text-sm"
                placeholder="AIzaSy..."
              />
            </div>
            <p className="text-xs text-slate-600">
                Don't have a key? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-electric hover:underline">Get one here</a>.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
                type="button"
                onClick={handleClear}
                className="px-4 py-3 bg-charcoal-200 text-slate-400 font-bold rounded-lg hover:bg-red-900/20 hover:text-red-400 transition-colors text-sm"
            >
                Clear
            </button>
            <button 
                type="submit"
                className={`flex-1 py-3 font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${saved ? 'bg-green-500 text-white' : 'bg-neon text-charcoal-900 hover:bg-neon-dim'}`}
            >
                {saved ? <Check size={18} /> : <Save size={18} />}
                {saved ? 'Saved!' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};