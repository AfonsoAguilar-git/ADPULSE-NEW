import React, { useState, useRef, useEffect } from 'react';
import { 
  Zap, 
  Upload, 
  CheckCircle2, 
  Play, 
  BarChart3, 
  Search, 
  ArrowRight, 
  Wand2, 
  Layers, 
  Download,
  Loader2,
  AlertCircle,
  FileVideo,
  MousePointer2,
  Share2,
  Github,
  Twitter,
  Disc,
  Image as ImageIcon,
  Film,
  Eye,
  DollarSign,
  TrendingUp,
  BrainCircuit,
  Link as LinkIcon,
  ShieldCheck,
  AlertTriangle,
  Target,
  Lightbulb,
  Sparkles,
  Lock,
  Settings2,
  RefreshCw,
  Music,
  FileText,
  Clock,
  Video,
  Palette,
  Anchor,
  Wind,
  MousePointer,
  Mic,
  Activity,
  User,
  Menu,
  X,
  XCircle,
  LogOut
} from 'lucide-react';
import { analyzeVideo, generateEditDecisionList, generateImage } from './services/geminiService';
import { VideoGenerationConfig, AspectRatio, VideoAnalysisResult, VideoPlan, ImageSize } from './types';
import { VeoDemo } from './components/VeoDemo';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';

// --- Types for Workflow State ---
type WorkflowStep = 'hero' | 'brand' | 'analysis' | 'generation';
type BrandVoice = 'Professional' | 'Gen-Z/Trendy' | 'Urgent/Sales' | 'Storyteller';

// --- Components ---

// 0. NAVIGATION BAR (NEW)
const Navbar = ({ onOpenAuth, onOpenSettings }: { onOpenAuth: () => void, onOpenSettings: () => void }) => {
    const [activeSection, setActiveSection] = useState<string>('hero');
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, signOut } = useAuth();

    const navItems = [
        { id: 'brand-dna', label: '1. Brand DNA' },
        { id: 'market-intel', label: '2. Analyze' },
        { id: 'generator', label: '3. Generate' },
    ];

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setMobileMenuOpen(false);
        }
    };

    // Scroll Spy & Navbar appearance logic
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);

            // Determine active section
            const sections = navItems.map(item => document.getElementById(item.id));
            const scrollPosition = window.scrollY + 200; // Offset for better triggering

            let current = '';
            for (const section of sections) {
                if (section && section.offsetTop <= scrollPosition) {
                    current = section.id;
                }
            }
            if (window.scrollY < 300) current = 'hero';
            setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav 
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
                isScrolled 
                ? 'bg-charcoal-900/80 backdrop-blur-md border-white/10 py-3' 
                : 'bg-transparent border-transparent py-5'
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                
                {/* LEFT: Brand */}
                <div 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="flex items-center gap-2 cursor-pointer group"
                >
                    <div className="text-white group-hover:text-neon transition-colors duration-300">
                        <Activity size={24} strokeWidth={3} />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">
                        AdPulse
                    </span>
                </div>

                {/* CENTER: Workflow Navigation (Desktop) */}
                <div className="hidden md:flex items-center bg-charcoal-100/50 backdrop-blur-sm p-1 rounded-full border border-white/5 shadow-lg shadow-black/20">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => scrollToSection(item.id)}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                                activeSection === item.id 
                                ? 'bg-white/10 text-neon shadow-[0_0_10px_rgba(204,255,0,0.1)]' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* RIGHT: Auth & Mobile Toggle */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onOpenSettings}
                        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        title="API Settings"
                    >
                        <Settings2 size={20} />
                    </button>

                    {user ? (
                        <div className="hidden md:flex items-center gap-4">
                            <span className="text-xs text-slate-500 font-mono">{user.email}</span>
                            <button 
                                onClick={signOut}
                                className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-red-400 transition-colors px-4 py-2 rounded-lg border border-transparent hover:border-white/10 hover:bg-white/5"
                            >
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={onOpenAuth}
                            className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors px-4 py-2 rounded-lg border border-transparent hover:border-white/10 hover:bg-white/5"
                        >
                            <User size={16} />
                            Login / Sign Up
                        </button>
                    )}
                    
                    {/* Mobile Menu Toggle */}
                    <button 
                        className="md:hidden text-white"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-charcoal-900 border-b border-white/10 p-4 flex flex-col gap-2 shadow-2xl">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => scrollToSection(item.id)}
                            className={`p-4 text-left rounded-lg text-sm font-medium ${
                                activeSection === item.id 
                                ? 'bg-white/10 text-neon' 
                                : 'text-slate-400'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                    <div className="h-px bg-white/10 my-2"></div>
                    <button 
                        onClick={() => { onOpenSettings(); setMobileMenuOpen(false); }}
                        className="p-4 text-left text-slate-300 hover:text-white flex items-center gap-2"
                    >
                        <Settings2 size={16} /> API Settings
                    </button>
                    {user ? (
                        <button onClick={signOut} className="p-4 text-left text-slate-300 hover:text-red-400">Sign Out</button>
                    ) : (
                        <button onClick={onOpenAuth} className="p-4 text-left text-slate-300 hover:text-white">Login</button>
                    )}
                </div>
            )}
        </nav>
    );
};

// 1. HERO SECTION
const Hero = ({ onStart }: { onStart: () => void }) => (
  <section id="hero" className="min-h-screen flex flex-col items-center justify-center relative border-b border-charcoal-50 overflow-hidden pt-20">
    {/* Background Grid & Effects */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2229_1px,transparent_1px),linear-gradient(to_bottom,#1f2229_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-20"></div>
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-electric/10 blur-[120px] rounded-full pointer-events-none"></div>

    <div className="z-10 text-center max-w-5xl px-6">
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight leading-none animate-in slide-in-from-bottom-5 duration-700 delay-100">
            DECODE THE MARKET.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon to-electric">GENERATE THE WINNER.</span>
        </h1>

        <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto font-light animate-in slide-in-from-bottom-5 duration-700 delay-200">
            A única IA que analisa a estrutura dos seus concorrentes para gerar anúncios de alta performance para a sua marca.
        </p>

        <button 
            onClick={onStart}
            className="group relative px-8 py-5 bg-neon text-charcoal-900 font-bold text-lg rounded-none skew-x-[-10deg] hover:bg-neon-dim transition-all shadow-[0_0_40px_-10px_rgba(204,255,0,0.3)] hover:shadow-[0_0_60px_-15px_rgba(204,255,0,0.5)] animate-in slide-in-from-bottom-5 duration-700 delay-300"
        >
            <span className="block skew-x-[10deg] flex items-center gap-2">
                CREATE NEW CAMPAIGN <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </span>
        </button>
    </div>

    {/* Abstract visual of a viral video wireframe */}
    <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-charcoal to-transparent"></div>
  </section>
);

// 2. BRAND DNA SECTION
interface BrandDNAProps { 
    onComplete: () => void;
    assets: File[];
    onAssetsChange: (files: File[]) => void;
    voice: BrandVoice;
    setVoice: (v: BrandVoice) => void;
    description: string;
    setDescription: (s: string) => void;
}

const BrandDNA = ({ onComplete, assets, onAssetsChange, voice, setVoice, description, setDescription }: BrandDNAProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files) as File[];
        onAssetsChange([...assets, ...files]);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files) as File[];
            onAssetsChange([...assets, ...files]);
        }
    };

    return (
        <section id="brand-dna" className="py-24 px-6 max-w-7xl mx-auto min-h-[80vh] flex flex-col justify-center scroll-mt-20">
            <div className="flex items-center gap-4 mb-12 border-b border-charcoal-50 pb-6">
                <div className="w-10 h-10 bg-charcoal-50 text-electric flex items-center justify-center font-mono text-xl border border-charcoal-100">01</div>
                <h2 className="text-4xl text-white font-bold">Brand Identity Setup</h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
                {/* Visual Assets */}
                <div className="space-y-6">
                    <h3 className="text-slate-400 font-mono text-sm uppercase tracking-wider flex items-center gap-2">
                        <Upload size={16} /> Visual Assets
                    </h3>
                    
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        className="border-2 border-dashed border-charcoal-50 bg-charcoal-100/30 rounded-lg h-64 flex flex-col items-center justify-center text-slate-500 hover:border-electric/50 hover:bg-charcoal-100/50 hover:text-electric transition-all cursor-pointer group"
                    >
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            multiple 
                            accept="image/*,video/*" 
                            onChange={handleFileSelect} 
                        />
                        <Upload className="mb-4 text-slate-600 group-hover:text-electric transition-colors" size={40} />
                        <p className="font-medium group-hover:text-white transition-colors">Drop Brand Assets or Click to Upload</p>
                        <p className="text-sm opacity-50">Images & Videos Supported</p>
                    </div>

                    {assets.length > 0 && (
                        <div className="grid grid-cols-4 gap-4">
                            {assets.map((file, i) => (
                                <div key={i} className="bg-charcoal-50 p-2 rounded border border-charcoal-100 flex flex-col items-center justify-center relative group aspect-square">
                                    <div className="absolute -top-2 -right-2 bg-neon text-charcoal-900 rounded-full p-0.5 z-10">
                                        <CheckCircle2 size={12} />
                                    </div>
                                    <div className="mb-2 text-slate-500">
                                        {file.type.startsWith('video') ? <Film size={20} /> : <ImageIcon size={20} />}
                                    </div>
                                    <span className="text-[10px] text-slate-300 truncate w-full text-center px-1">{file.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Voice & Persona */}
                <div className="space-y-8">
                    <h3 className="text-slate-400 font-mono text-sm uppercase tracking-wider flex items-center gap-2">
                        <Zap size={16} /> Voice & Persona
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        {(['Professional', 'Gen-Z/Trendy', 'Urgent/Sales', 'Storyteller'] as BrandVoice[]).map((v) => (
                            <button
                                key={v}
                                onClick={() => setVoice(v)}
                                className={`p-4 border text-left transition-all ${voice === v 
                                    ? 'bg-electric/10 border-electric text-electric' 
                                    : 'bg-charcoal-50 border-charcoal-100 text-slate-400 hover:border-slate-600'}`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <label className="text-slate-400 text-sm">Product Description / URL</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-charcoal-100 border border-charcoal-50 rounded p-4 text-white focus:border-neon focus:outline-none transition-colors h-32 font-mono text-sm"
                            placeholder="Describe the product or paste LP URL..."
                        />
                    </div>

                    <div className="flex justify-end">
                        <button onClick={onComplete} className="px-6 py-3 bg-white text-charcoal-900 font-bold hover:bg-slate-200 transition-colors">
                            CONFIRM IDENTITY &rarr;
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

// 3. MARKET INTELLIGENCE SECTION
interface MarketIntelligenceProps {
    onComplete: () => void;
    onAnalysisComplete: (result: VideoAnalysisResult) => void;
    currentResult: VideoAnalysisResult | null;
}

const MarketIntelligence = ({ onComplete, onAnalysisComplete, currentResult }: MarketIntelligenceProps) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [videoSrc, setVideoSrc] = useState<string | null>(null);
    const [urlInput, setUrlInput] = useState("");
    
    const videoInputRef = useRef<HTMLInputElement>(null);

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setVideoSrc(URL.createObjectURL(file));
        setUploadError(null);
        setIsAnalyzing(true);

        try {
            const result = await analyzeVideo(file);
            onAnalysisComplete(result);
        } catch (err: any) {
            setUploadError(err.message || "Failed to analyze video.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleUrlSubmit = async () => {
        if (!urlInput.trim()) {
            setUploadError("Please enter a valid URL.");
            return;
        }

        setUploadError(null);
        setIsAnalyzing(true);
        setVideoSrc(null); 

        try {
            const result = await analyzeVideo(urlInput);
            onAnalysisComplete(result);
        } catch (err: any) {
            setUploadError(err.message || "Failed to analyze URL.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <section id="market-intel" className="py-24 px-6 max-w-7xl mx-auto min-h-[80vh] flex flex-col justify-center border-t border-charcoal-50 scroll-mt-20">
             <div className="flex items-center gap-4 mb-12 border-b border-charcoal-50 pb-6">
                <div className="w-10 h-10 bg-charcoal-50 text-electric flex items-center justify-center font-mono text-xl border border-charcoal-100">02</div>
                <h2 className="text-4xl text-white font-bold">Audit Competition</h2>
            </div>

            <div className="bg-charcoal-50 border border-charcoal-100 rounded-xl overflow-hidden min-h-[600px] relative">
                {!currentResult && !isAnalyzing ? (
                    <div className="p-12 flex flex-col items-center justify-center h-full space-y-8">
                        <div className="text-center max-w-lg mx-auto mb-4">
                            <h3 className="text-2xl text-white font-bold mb-2">Feed the Audit Engine</h3>
                            <p className="text-slate-400">Upload a video or paste a URL. Our Auditor will scan for Hooks, CTAs, and Commercial Intent markers.</p>
                        </div>

                        <div className="flex gap-4 p-1 bg-charcoal-100 rounded-lg">
                            <button className="px-6 py-2 bg-charcoal-200 text-white rounded shadow-sm">Paste URL</button>
                            <button 
                                onClick={() => videoInputRef.current?.click()}
                                className="px-6 py-2 text-slate-500 hover:text-white transition-colors"
                            >
                                Upload Video
                            </button>
                        </div>
                        
                        <div className="flex w-full max-w-xl gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                <input 
                                    type="text" 
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    placeholder="Paste TikTok, Reels, or Shorts URL..." 
                                    className="w-full bg-charcoal-100 border border-charcoal-200 rounded-lg py-4 pl-12 pr-4 text-white focus:border-neon focus:outline-none"
                                />
                            </div>
                            <button 
                                onClick={handleUrlSubmit}
                                className="bg-charcoal-200 text-slate-300 font-bold px-8 rounded-lg hover:bg-charcoal-100 transition-colors hover:text-white"
                            >
                                AUDIT
                            </button>
                        </div>

                        <input 
                            type="file" 
                            ref={videoInputRef} 
                            onChange={handleVideoUpload} 
                            accept="video/*" 
                            className="hidden" 
                        />
                        
                        {uploadError && (
                            <div className="text-red-400 flex items-center gap-2 bg-red-900/10 p-4 rounded border border-red-900/20">
                                <AlertCircle size={16} /> {uploadError}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-2 h-full min-h-[600px]">
                        {/* Left: Competitor Video Placeholder */}
                        <div className="bg-black flex flex-col items-center justify-center relative border-r border-charcoal-100 p-8">
                            <div className="w-full max-w-xs aspect-[9/16] bg-charcoal-900 rounded-xl overflow-hidden relative shadow-2xl border border-charcoal-800">
                                {videoSrc ? (
                                    <video src={videoSrc} controls className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-charcoal-800">
                                        <LinkIcon size={48} className="mb-4 text-electric" />
                                        <p className="text-sm px-4 text-center">Remote Analysis of: <br/> <span className="text-white break-all line-clamp-2">{urlInput || "Video URL"}</span></p>
                                    </div>
                                )}
                                
                                {isAnalyzing && (
                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm z-20">
                                        <Loader2 size={48} className="text-neon animate-spin mb-4" />
                                        <p className="text-white font-bold text-lg mb-2">Auditing Ad Markers...</p>
                                        <p className="text-slate-400 text-sm font-mono animate-pulse">
                                            Scanning for CTAs... <br/>
                                            Measuring Commercial Intent... <br/>
                                            Detecting Hooks...
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Structural Breakdown */}
                        <div className="bg-charcoal-50 overflow-y-auto max-h-[800px] scrollbar-thin scrollbar-thumb-charcoal-200 scrollbar-track-transparent flex flex-col">
                            {currentResult && (
                                <div className="p-8 space-y-8 flex-1">
                                    {/* Classification Status */}
                                    <div className={`p-6 rounded-xl border ${currentResult.is_ad ? 'bg-charcoal-100 border-neon/30' : 'bg-red-900/10 border-red-900/30'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2 font-mono uppercase tracking-wider text-xs text-slate-400">
                                                <ShieldCheck size={14} className={currentResult.is_ad ? "text-neon" : "text-red-400"} />
                                                Auditor Classification
                                            </div>
                                            <div className="text-xs font-mono text-slate-500">Confidence: {(currentResult.confidence_score * 100).toFixed(0)}%</div>
                                        </div>
                                        <div className="text-2xl font-bold text-white mb-2">
                                            {currentResult.is_ad ? "VERIFIED ADVERTISEMENT" : "NON-COMMERCIAL CONTENT"}
                                        </div>
                                        <p className="text-sm text-slate-400 border-l-2 border-slate-700 pl-3">
                                            "{currentResult.classification_reason}"
                                        </p>
                                    </div>

                                    {currentResult.is_ad ? (
                                        <>
                                             <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-charcoal-100 p-4 rounded-xl border border-charcoal-200">
                                                    <div className="flex items-center gap-2 text-slate-400 text-xs font-mono uppercase tracking-wider mb-2">
                                                        <DollarSign size={14} className="text-electric" /> Commercial Intent
                                                    </div>
                                                    <div className="flex items-end gap-2">
                                                        <span className="text-4xl font-bold text-white">{currentResult.metrics.commercial_intent_score}</span>
                                                        <span className="text-slate-500 mb-1">/ 10</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="bg-charcoal-100 p-4 rounded-xl border border-charcoal-200">
                                                    <div className="flex items-center gap-2 text-slate-400 text-xs font-mono uppercase tracking-wider mb-2">
                                                        <Target size={14} className="text-purple-400" /> Target Audience
                                                    </div>
                                                    <div className="text-lg font-bold text-white leading-tight">
                                                        {currentResult.metrics.target_audience}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Detailed Structural Markers */}
                                            <div>
                                                <h3 className="text-slate-300 font-bold mb-4 flex items-center gap-2 border-b border-charcoal-200 pb-2">
                                                    <BarChart3 size={18} className="text-electric" /> Structural DNA
                                                </h3>
                                                
                                                <div className="grid gap-4">
                                                    {/* HOOK ANALYSIS */}
                                                    <div className="bg-charcoal-100 p-4 rounded-lg border border-charcoal-200">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2 text-white font-bold text-sm">
                                                                <Anchor size={16} className="text-neon" /> Hook Analysis
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Score</span>
                                                                <span className="text-neon font-bold text-sm">{currentResult.structure.hook.effectiveness_score}/10</span>
                                                            </div>
                                                        </div>
                                                        <div className="mb-2">
                                                            <span className="text-xs bg-neon/10 text-neon px-2 py-0.5 rounded border border-neon/20 font-mono">{currentResult.structure.hook.type}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-400">
                                                            {currentResult.structure.hook.description}
                                                        </p>
                                                    </div>

                                                    {/* FLOW & PACING */}
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="bg-charcoal-100 p-3 rounded-lg border border-charcoal-200">
                                                            <div className="text-xs text-slate-500 uppercase font-bold mb-1 flex items-center gap-1">
                                                                <Wind size={12} /> Pacing
                                                            </div>
                                                            <div className="text-white text-sm font-medium">{currentResult.structure.flow.pacing}</div>
                                                        </div>
                                                        <div className="bg-charcoal-100 p-3 rounded-lg border border-charcoal-200">
                                                            <div className="text-xs text-slate-500 uppercase font-bold mb-1 flex items-center gap-1">
                                                                <Activity size={12} /> Framework
                                                            </div>
                                                            <div className="text-white text-sm font-medium">{currentResult.structure.flow.structure_type}</div>
                                                        </div>
                                                    </div>

                                                    {/* ELEMENTS */}
                                                    <div className="bg-charcoal-100 p-4 rounded-lg border border-charcoal-200">
                                                        <div className="text-xs text-slate-500 uppercase font-bold mb-3 flex items-center gap-2">
                                                            <Palette size={12} /> Creative Composition
                                                        </div>
                                                        <div className="space-y-2 text-xs">
                                                            <div className="flex justify-between border-b border-charcoal-200 pb-1">
                                                                <span className="text-slate-400 flex items-center gap-1"><Mic size={10} /> Audio</span>
                                                                <span className="text-white">{currentResult.structure.elements.audio_style}</span>
                                                            </div>
                                                            <div className="flex justify-between border-b border-charcoal-200 pb-1">
                                                                <span className="text-slate-400 flex items-center gap-1"><Eye size={10} /> Visuals</span>
                                                                <span className="text-white">{currentResult.structure.elements.visual_style}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-400 flex items-center gap-1"><FileText size={10} /> Text</span>
                                                                <span className="text-white">{currentResult.structure.elements.text_overlay_usage}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* CTA */}
                                                    <div className="bg-charcoal-100 p-4 rounded-lg border border-charcoal-200 flex items-start gap-3">
                                                        <div className={`mt-0.5 ${currentResult.structure.cta.detected ? 'text-electric' : 'text-slate-600'}`}>
                                                            <MousePointer size={16} />
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-bold text-white mb-0.5">
                                                                Call to Action ({currentResult.structure.cta.type})
                                                            </div>
                                                            <p className="text-xs text-slate-400 italic">
                                                                "{currentResult.structure.cta.content || "No explicit CTA detected"}"
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Pain Points & Product */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-charcoal-100 p-3 rounded-lg border border-charcoal-200">
                                                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Pain Point</div>
                                                    <div className="text-white text-xs leading-tight">{currentResult.metrics.pain_point}</div>
                                                </div>
                                                <div className="bg-charcoal-100 p-3 rounded-lg border border-charcoal-200">
                                                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Product Focus</div>
                                                    <div className="text-white text-xs leading-tight">{currentResult.metrics.product_focus}</div>
                                                </div>
                                            </div>
                                            
                                            {/* Strategies */}
                                            {currentResult.strategies && currentResult.strategies.length > 0 && (
                                                <div>
                                                    <h3 className="text-slate-300 font-bold mb-4 flex items-center gap-2 border-b border-charcoal-200 pb-2">
                                                        <BrainCircuit size={18} className="text-purple-400" /> Deep Strategy Analysis
                                                    </h3>
                                                    <div className="grid gap-3">
                                                        {currentResult.strategies.map((strategy, idx) => (
                                                            <div key={idx} className="bg-charcoal-100 p-4 rounded-lg border border-charcoal-200 hover:border-purple-500/50 transition-colors">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <Sparkles size={14} className="text-purple-400" />
                                                                        <h4 className="font-bold text-white text-sm">{strategy.name}</h4>
                                                                    </div>
                                                                    <span className="text-[10px] uppercase font-mono text-slate-500 bg-charcoal-200 px-2 py-0.5 rounded">
                                                                        {strategy.psychological_trigger}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-slate-400 leading-relaxed">
                                                                    {strategy.description}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <button 
                                                onClick={onComplete}
                                                className="w-full py-4 bg-neon text-charcoal-900 font-bold rounded hover:bg-neon-dim transition-colors flex items-center justify-center gap-2 mt-4"
                                            >
                                                PROCEED TO GENERATION <ArrowRight size={18} />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="bg-red-500/10 p-4 rounded border border-red-500/20 flex gap-3 text-red-300 text-sm">
                                            <AlertTriangle className="flex-shrink-0" />
                                            <div>
                                                <p className="font-bold mb-1">Audit Failed: Not an Ad</p>
                                                <p>This content lacks the necessary markers (CTA, Hook, Product) to be used as a reference for generation. Please upload a valid ad.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

// 4. GENERATOR CORE SECTION (The Decision Core)
interface GeneratorCoreProps {
    analysisData: VideoAnalysisResult | null;
    brandAssets: File[];
    brandInfo: { voice: string; description: string };
}

const GeneratorCore = ({ analysisData, brandAssets, brandInfo }: GeneratorCoreProps) => {
    const [mode, setMode] = useState<'custom' | 'replica'>('custom');
    
    // Custom Inputs
    const [customPrompt, setCustomPrompt] = useState("");
    const [duration, setDuration] = useState("30s");
    const [style, setStyle] = useState("Cinematic");

    // Replica Inputs
    const [mixAssets, setMixAssets] = useState(true);

    // Execution State
    const [isGenerating, setIsGenerating] = useState(false);
    const [videoPlan, setVideoPlan] = useState<VideoPlan | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [statusMsg, setStatusMsg] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [referenceImage, setReferenceImage] = useState<File | null>(null);


    const handleEnhancePrompt = () => {
        if (!customPrompt) return;
        setCustomPrompt(prev => prev + " -- high quality, 4k, trending on social media, detailed texture, perfect lighting.");
    };

    const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setReferenceImage(e.target.files[0]);
        }
    }

    const handleExportImages = async () => {
        if (!videoPlan || !videoPlan.timeline) return;
        
        const generatedSegments = videoPlan.timeline.filter(t => t.generated_image);
        if (generatedSegments.length === 0) return;

        // Sequential download to avoid browser blocking
        for (const segment of generatedSegments) {
            if (segment.generated_image) {
                const a = document.createElement('a');
                a.href = segment.generated_image;
                a.download = `frame_${segment.sequence_id}_${segment.segment_type}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                await new Promise(r => setTimeout(r, 500));
            }
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(null);
        setVideoPlan(null);
        setStatusMsg("Architecting Script & Strategy...");

        try {
            // 1. Generate the EDL (Edit Decision List)
            const generatedPlan = await generateEditDecisionList(
                brandAssets,
                analysisData,
                mode === 'replica' ? 'COMPETITOR_REPLICA' : 'CUSTOM_PROMPT',
                customPrompt,
                `Voice: ${brandInfo.voice}. Product: ${brandInfo.description}`
            );

            // Validation check to prevent "undefined reading length" errors later
            if (!generatedPlan || !Array.isArray(generatedPlan.timeline)) {
                throw new Error("AI generated an incomplete plan structure (Missing timeline). Please try again.");
            }

            // Set initial plan to show UI immediately
            setVideoPlan(generatedPlan);
            setStatusMsg("Visualizing Storyboard Frames...");

            // Prepare reference image for consistency
            let referenceBase64: string | undefined = undefined;
            const imgToUse = referenceImage || brandAssets[0];
            
            if (imgToUse) {
                const reader = new FileReader();
                const base64Promise = new Promise<string>((resolve) => {
                    reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
                });
                reader.readAsDataURL(imgToUse);
                referenceBase64 = await base64Promise;
            }

            // 2. Automatically generate images for each segment
            const newTimeline = [...generatedPlan.timeline];
            
            // Mark all as loading initially
             setVideoPlan(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    timeline: prev.timeline.map(t => ({ ...t, is_generating_image: true }))
                };
            });

            // Sequential generation to maintain style consistency or context
            for (let i = 0; i < newTimeline.length; i++) {
                const segment = newTimeline[i];
                try {
                     // Pass the product reference image to the first frame, or carry over? 
                     // Best strategy: Always pass the product reference to ensure product placement.
                    const imgUrl = await generateImage(
                        segment.visual_prompt, 
                        generatedPlan.aspect_ratio, 
                        referenceBase64
                    );
                    
                    newTimeline[i] = { 
                        ...segment, 
                        generated_image: imgUrl, 
                        is_generating_image: false 
                    };
                    
                    // Update state incrementally
                    setVideoPlan(prev => prev ? { ...prev, timeline: [...newTimeline] } : null);

                } catch (e) {
                    console.error(`Failed to generate image for segment ${i}`, e);
                    newTimeline[i] = { 
                        ...segment, 
                        is_generating_image: false 
                    };
                    setVideoPlan(prev => prev ? { ...prev, timeline: [...newTimeline] } : null);
                }
            }
            
            setStatusMsg("Storyboard Generation Complete.");

        } catch (err: any) {
            console.error(err);
            setError(err.message || "An unexpected error occurred during generation.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <section id="generator" className="py-24 px-6 max-w-7xl mx-auto min-h-[80vh] flex flex-col justify-center border-t border-charcoal-50 scroll-mt-20">
             <div className="flex items-center gap-4 mb-12 border-b border-charcoal-50 pb-6">
                <div className="w-10 h-10 bg-charcoal-50 text-electric flex items-center justify-center font-mono text-xl border border-charcoal-100">03</div>
                <h2 className="text-4xl text-white font-bold">Generation Strategy</h2>
            </div>

            {/* Main Decision Interface */}
            <div className="bg-charcoal-50 border border-charcoal-100 rounded-2xl overflow-hidden min-h-[500px] flex flex-col">
                
                {/* 1. Navigation (Segmented Control) */}
                <div className="p-2 border-b border-charcoal-100 bg-charcoal-100/50 flex justify-center">
                    <div className="relative bg-charcoal-900 p-1 rounded-lg flex items-center shadow-inner w-full max-w-md">
                        {/* Slider Background */}
                        <div 
                            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-charcoal-100 border border-charcoal-50 rounded shadow-sm transition-all duration-300 ease-out ${mode === 'custom' ? 'left-1' : 'left-[calc(50%+4px)]'}`}
                        ></div>
                        
                        <button 
                            onClick={() => setMode('custom')}
                            className={`relative flex-1 py-2 text-sm font-bold transition-colors z-10 flex items-center justify-center gap-2 ${mode === 'custom' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Sparkles size={14} className={mode === 'custom' ? 'text-neon' : ''} /> Custom Prompt
                        </button>
                        <button 
                            onClick={() => setMode('replica')}
                            className={`relative flex-1 py-2 text-sm font-bold transition-colors z-10 flex items-center justify-center gap-2 ${mode === 'replica' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <BrainCircuit size={14} className={mode === 'replica' ? 'text-electric' : ''} /> Competitor Replica
                        </button>
                    </div>
                </div>

                {/* 2. Content Area */}
                <div className="flex-1 p-8 md:p-12 relative">
                    
                    {/* STATE A: CUSTOM PROMPT */}
                    {mode === 'custom' && (
                        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                             <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <Wand2 size={16} className="text-neon" /> Creative Concept
                                    </label>
                                    <button 
                                        onClick={handleEnhancePrompt}
                                        className="text-xs text-electric hover:text-white flex items-center gap-1 transition-colors"
                                    >
                                        <Zap size={12} /> Enhance Prompt with AI
                                    </button>
                                </div>
                                <textarea 
                                    value={customPrompt}
                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                    className="w-full bg-charcoal-100 border border-charcoal-200 rounded-xl p-6 text-lg text-white placeholder:text-slate-600 focus:border-neon focus:outline-none min-h-[160px] resize-none transition-colors"
                                    placeholder="Describe your video concept..."
                                />
                             </div>

                             <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-500 font-bold uppercase">Duration</label>
                                    <select 
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        className="w-full bg-charcoal-100 border border-charcoal-200 rounded-lg p-3 text-white focus:border-neon outline-none appearance-none"
                                    >
                                        <option>15s (Short)</option>
                                        <option>30s (Standard)</option>
                                        <option>60s (Long)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-500 font-bold uppercase">Style</label>
                                    <select 
                                        value={style}
                                        onChange={(e) => setStyle(e.target.value)}
                                        className="w-full bg-charcoal-100 border border-charcoal-200 rounded-lg p-3 text-white focus:border-neon outline-none appearance-none"
                                    >
                                        <option>Cinematic</option>
                                        <option>UGC / Native</option>
                                        <option>Promotional</option>
                                        <option>Minimalist</option>
                                    </select>
                                </div>
                             </div>

                             {/* Optional visual reference if no brand assets */}
                             {!brandAssets.length && (
                                 <div className="space-y-2 pt-4 border-t border-charcoal-100">
                                     <label className="text-xs text-slate-500 font-bold uppercase flex items-center gap-2">
                                        Visual Reference <span className="text-slate-600 font-normal normal-case">(Required if no Brand Assets)</span>
                                     </label>
                                     <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-4 p-3 bg-charcoal-100 rounded-lg border border-charcoal-200 cursor-pointer hover:border-slate-500 transition-colors"
                                     >
                                        <div className="w-10 h-10 bg-charcoal-200 rounded flex items-center justify-center text-slate-500">
                                            {referenceImage ? <CheckCircle2 size={20} className="text-neon" /> : <ImageIcon size={20} />}
                                        </div>
                                        <span className="text-sm text-slate-400">
                                            {referenceImage ? referenceImage.name : "Upload image..."}
                                        </span>
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleCustomImageUpload} />
                                     </div>
                                 </div>
                             )}

                             <div className="pt-4">
                                <button 
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className="w-full py-5 bg-neon text-charcoal-900 font-bold text-lg rounded-xl hover:bg-neon-dim transition-all shadow-[0_0_20px_rgba(204,255,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                                    GENERATE SCRIPT & STORYBOARD
                                </button>
                             </div>
                        </div>
                    )}

                    {/* STATE B: COMPETITOR REPLICA */}
                    {mode === 'replica' && (
                        <div className="max-w-3xl mx-auto h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
                            
                            {!analysisData ? (
                                // LOCKED STATE
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-60">
                                    <div className="w-20 h-20 bg-charcoal-100 rounded-full flex items-center justify-center border-2 border-dashed border-charcoal-200">
                                        <Lock size={32} className="text-slate-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2">Strategy Locked</h3>
                                        <p className="text-slate-400 max-w-sm mx-auto">Please analyze a video in Step 2 to unlock this advanced replication strategy.</p>
                                    </div>
                                </div>
                            ) : (
                                // UNLOCKED DASHBOARD
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4 pb-6 border-b border-charcoal-100">
                                        <div className="w-12 h-12 bg-electric/10 rounded-full flex items-center justify-center text-electric border border-electric/20">
                                            <Layers size={24} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-mono text-electric uppercase tracking-wider mb-1">Active Blueprint</div>
                                            <h3 className="text-xl font-bold text-white">Replicating Proven Structure</h3>
                                        </div>
                                    </div>

                                    {/* Data Summary Cards */}
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="bg-charcoal-100 p-4 rounded-lg border border-charcoal-200">
                                            <div className="flex items-center gap-2 text-xs text-slate-500 uppercase font-bold mb-2">
                                                <Target size={12} /> Hook Type
                                            </div>
                                            <div className="text-white font-medium text-sm line-clamp-2">
                                                {analysisData.structure.hook.type || "Visual Hook Detected"}
                                            </div>
                                        </div>
                                        <div className="bg-charcoal-100 p-4 rounded-lg border border-charcoal-200">
                                            <div className="flex items-center gap-2 text-xs text-slate-500 uppercase font-bold mb-2">
                                                <TrendingUp size={12} /> Audience
                                            </div>
                                            <div className="text-white font-medium text-sm">
                                                {analysisData.metrics.target_audience}
                                            </div>
                                        </div>
                                        <div className="bg-charcoal-100 p-4 rounded-lg border border-charcoal-200">
                                            <div className="flex items-center gap-2 text-xs text-slate-500 uppercase font-bold mb-2">
                                                <Music size={12} /> Tone
                                            </div>
                                            <div className="text-white font-medium text-sm">
                                                {analysisData.structure.elements.audio_style || "High Energy / Commercial"}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Asset Mix Confirmation */}
                                    <div className="bg-charcoal-100/50 p-6 rounded-xl border border-charcoal-200 flex items-start gap-4">
                                        <div className="pt-1">
                                            <div 
                                                onClick={() => setMixAssets(!mixAssets)}
                                                className={`w-6 h-6 rounded border cursor-pointer flex items-center justify-center transition-colors ${mixAssets ? 'bg-electric border-electric text-charcoal-900' : 'border-slate-500'}`}
                                            >
                                                {mixAssets && <CheckCircle2 size={16} />}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm mb-1">Mix with Brand Assets from Step 1</h4>
                                            <p className="text-xs text-slate-400">
                                                We will apply the competitor's successful pacing and structure to your brand's visuals to create a unique high-performance ad.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button 
                                            onClick={handleGenerate}
                                            disabled={isGenerating}
                                            className="w-full py-5 bg-electric text-charcoal-900 font-bold text-lg rounded-xl hover:bg-electric-dim transition-all shadow-[0_0_20px_rgba(0,240,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isGenerating ? <Loader2 className="animate-spin" /> : <RefreshCw size={20} />}
                                            REMIX STRUCTURE & GENERATE
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* RESULT OVERLAY - FULL SCREEN SCRIPT/STORYBOARD */}
                {videoPlan && (
                    <div className="fixed inset-0 bg-charcoal-900/95 backdrop-blur-md z-50 flex overflow-hidden animate-in fade-in duration-300">
                         <div className="w-full max-w-6xl mx-auto flex flex-col h-full p-4 md:p-8 gap-6 relative">
                             
                             {/* Close Button */}
                             <button 
                                onClick={() => setVideoPlan(null)}
                                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors bg-black/50 p-2 rounded-full z-10"
                             >
                                <XCircle size={32} />
                             </button>

                             {/* HEADER */}
                             <div className="flex-shrink-0">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sparkles size={18} className="text-neon" />
                                            <span className="text-xs font-mono text-neon uppercase tracking-wider">Campaign Strategy Generated</span>
                                        </div>
                                        <h2 className="text-3xl font-bold text-white">{videoPlan.project_title || "Untitled Campaign"}</h2>
                                        <p className="text-slate-400 text-sm mt-1">
                                            {videoPlan.timeline?.length || 0} Scenes • {videoPlan.total_duration_sec}s Duration • {videoPlan.aspect_ratio}
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={handleExportImages}
                                            disabled={isGenerating || !videoPlan.timeline?.some(s => s.generated_image)}
                                            className="px-6 py-3 bg-charcoal-100 border border-charcoal-200 hover:border-white/20 text-white rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                                        >
                                            <Download size={18} /> Download All Frames
                                        </button>
                                    </div>
                                </div>
                             </div>

                             {/* SCROLLABLE CONTENT */}
                             <div className="flex-1 overflow-y-auto pr-2 pb-12 custom-scrollbar">
                                <div className="space-y-8">
                                    
                                    {/* MUSIC & ATMOSPHERE */}
                                    <div className="bg-charcoal-100/50 rounded-xl p-6 border border-white/5 flex flex-wrap gap-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-electric/10 rounded-full flex items-center justify-center text-electric">
                                                <Music size={20} />
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-500 uppercase font-bold">Soundtrack Direction</div>
                                                <div className="text-white font-medium">{videoPlan.background_music_keyword}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-400">
                                                <Palette size={20} />
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-500 uppercase font-bold">Visual Style</div>
                                                <div className="text-white font-medium">{style}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* TIMELINE CARDS */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {videoPlan.timeline?.map((segment, idx) => (
                                            <div key={idx} className="bg-charcoal-100 rounded-xl border border-charcoal-200 overflow-hidden flex flex-col hover:border-white/10 transition-colors">
                                                
                                                {/* Header */}
                                                <div className="p-4 border-b border-charcoal-200 bg-charcoal-50/50 flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${segment.segment_type === 'Hook' ? 'bg-neon text-charcoal-900' : segment.segment_type === 'CTA' ? 'bg-electric text-charcoal-900' : 'bg-charcoal-200 text-slate-400'}`}>
                                                            {idx + 1}
                                                        </div>
                                                        <span className="text-sm font-bold text-white uppercase tracking-wider">{segment.segment_type}</span>
                                                    </div>
                                                    <span className="text-xs font-mono text-slate-500 bg-black/20 px-2 py-1 rounded">
                                                        {segment.duration}s
                                                    </span>
                                                </div>

                                                {/* Content Grid */}
                                                <div className="grid grid-cols-2 h-full">
                                                    {/* Text Column */}
                                                    <div className="p-4 flex flex-col gap-4 border-r border-charcoal-200">
                                                        <div>
                                                            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Visual Prompt</span>
                                                            <p className="text-sm text-slate-300 leading-snug">{segment.visual_prompt}</p>
                                                        </div>
                                                        
                                                        {segment.text_overlay?.content && (
                                                            <div className="mt-auto bg-black/30 p-3 rounded-lg border border-white/5">
                                                                <span className="text-[10px] text-electric uppercase font-bold block mb-1">Text Overlay</span>
                                                                <p className="text-white font-bold italic text-sm">"{segment.text_overlay.content}"</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Image Column */}
                                                    <div className="bg-black relative group flex items-center justify-center min-h-[200px]">
                                                        {segment.is_generating_image ? (
                                                            <div className="flex flex-col items-center gap-3">
                                                                <Loader2 className="animate-spin text-electric" size={24} />
                                                                <span className="text-xs text-slate-500 font-mono">Rendering...</span>
                                                            </div>
                                                        ) : segment.generated_image ? (
                                                            <>
                                                                <img 
                                                                    src={segment.generated_image} 
                                                                    alt="Storyboard Frame" 
                                                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                                />
                                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                    <a 
                                                                        href={segment.generated_image} 
                                                                        download={`frame_${idx + 1}.png`}
                                                                        className="bg-white text-charcoal-900 px-4 py-2 rounded-full font-bold text-xs hover:bg-neon transition-colors"
                                                                    >
                                                                        Download
                                                                    </a>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-slate-600">No Image</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                             </div>
                         </div>
                    </div>
                )}
            </div>
             
             {/* Status/Error Toast */}
            {isGenerating && (
                <div className="fixed bottom-8 right-8 bg-charcoal-100 border border-neon/30 p-4 rounded-lg shadow-2xl flex items-center gap-4 z-50 animate-in slide-in-from-bottom-10">
                    <Loader2 className="text-neon animate-spin" />
                    <div>
                        <p className="text-white font-bold text-sm">Creative Director Engine</p>
                        <p className="text-xs text-slate-400 font-mono">{statusMsg}</p>
                    </div>
                </div>
            )}
             {error && (
                <div className="fixed bottom-8 right-8 bg-red-900/90 border border-red-500/50 p-4 rounded-lg shadow-2xl flex items-center gap-4 z-50 animate-in slide-in-from-bottom-10">
                    <AlertCircle className="text-white" />
                    <p className="text-white text-sm">{error}</p>
                    <button onClick={() => setError(null)} className="ml-2 text-white/50 hover:text-white">✕</button>
                </div>
            )}
        </section>
    );
}

// 5. FOOTER
const Footer = () => (
    <footer className="py-12 border-t border-charcoal-50 bg-charcoal-50/30">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col gap-2">
                <span className="text-lg font-bold text-white tracking-tight">AdPulse AI</span>
                <span className="text-xs text-slate-500">© 2025. Made for Performance Marketers.</span>
            </div>
            
            <div className="flex gap-8 text-sm text-slate-400">
                <a href="#" className="hover:text-neon transition-colors">Pricing</a>
                <a href="#" className="hover:text-neon transition-colors">Enterprise</a>
                <a href="#" className="hover:text-neon transition-colors">API Docs</a>
            </div>

            <div className="flex gap-4">
                <Github size={20} className="text-slate-500 hover:text-white cursor-pointer" />
                <Twitter size={20} className="text-slate-500 hover:text-white cursor-pointer" />
                <Disc size={20} className="text-slate-500 hover:text-white cursor-pointer" />
            </div>
        </div>
    </footer>
)

// --- MAIN APP ---

const App = () => {
    // Simple scrolling logic for SPA feel
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const [brandAssets, setBrandAssets] = useState<File[]>([]);
    const [brandVoice, setBrandVoice] = useState<BrandVoice>('Professional');
    const [productDesc, setProductDesc] = useState("");
    const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    return (
        <AuthProvider>
            <div className="bg-charcoal min-h-screen text-slate-300">
                <Navbar 
                    onOpenAuth={() => setIsAuthModalOpen(true)} 
                    onOpenSettings={() => setIsSettingsModalOpen(true)}
                />
                <Hero onStart={() => scrollToSection('brand-dna')} />
                <BrandDNA 
                    onComplete={() => scrollToSection('market-intel')} 
                    assets={brandAssets}
                    onAssetsChange={setBrandAssets}
                    voice={brandVoice}
                    setVoice={setBrandVoice}
                    description={productDesc}
                    setDescription={setProductDesc}
                />
                <MarketIntelligence 
                    onComplete={() => scrollToSection('generator')} 
                    currentResult={analysisResult}
                    onAnalysisComplete={setAnalysisResult}
                />
                <GeneratorCore 
                    analysisData={analysisResult} 
                    brandAssets={brandAssets}
                    brandInfo={{ voice: brandVoice, description: productDesc }}
                />
                <Footer />
                <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
                <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
            </div>
        </AuthProvider>
    );
};

export default App;