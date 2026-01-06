import React, { useState } from 'react';
import { generateVideo } from '../services/geminiService';
import { AspectRatio } from '../types';
import { Loader2, Play, Video, Wand2, Upload, AlertCircle } from 'lucide-react';

export const VeoDemo = () => {
  const [prompt, setPrompt] = useState('A cinematic drone shot of a futuristic city with neon lights, 4k resolution');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setVideoUrl(null);
    
    try {
      const url = await generateVideo({
        prompt: prompt,
        aspectRatio: AspectRatio.LANDSCAPE
        // imageBase64 is optional now, allowing text-to-video
      });
      
      setVideoUrl(url);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to generate video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-charcoal-100 rounded-2xl border border-charcoal-50 p-8 max-w-4xl mx-auto my-12 shadow-2xl">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-charcoal-50">
            <div className="w-10 h-10 bg-electric/10 rounded-full flex items-center justify-center text-electric">
                <Video size={20} />
            </div>
            <div>
                <h3 className="text-xl font-bold text-white">Veo Direct Generator</h3>
                <p className="text-sm text-slate-500">Test the video generation model directly without the EDL pipeline.</p>
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Wand2 size={12} className="text-neon" /> Prompt
                    </label>
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full h-32 bg-charcoal-900 border border-charcoal-50 rounded-lg p-4 text-white focus:border-neon outline-none resize-none transition-colors"
                        placeholder="Describe your video..."
                    />
                </div>

                <button 
                    onClick={handleGenerate}
                    disabled={loading || !prompt}
                    className="w-full py-4 bg-neon text-charcoal-900 font-bold rounded-lg hover:bg-neon-dim transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" /> Generating...
                        </>
                    ) : (
                        <>
                            <Play size={18} fill="currentColor" /> Generate Video
                        </>
                    )}
                </button>
                
                {error && (
                    <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg flex items-start gap-3 text-red-200 text-sm">
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}
            </div>

            <div className="bg-charcoal-900 rounded-xl overflow-hidden border border-charcoal-50 flex items-center justify-center aspect-video relative group">
                {videoUrl ? (
                    <video 
                        src={videoUrl} 
                        controls 
                        autoPlay 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="text-center text-slate-600">
                        <div className="w-16 h-16 bg-charcoal-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-charcoal-50">
                            {loading ? <Loader2 className="animate-spin text-neon" size={24} /> : <Video size={24} />}
                        </div>
                        <p className="text-sm">{loading ? "Rendering pixels..." : "Preview will appear here"}</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default VeoDemo;