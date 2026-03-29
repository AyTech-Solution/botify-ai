import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { speak } from '../services/ttsService';
import { 
  Bot as BotIcon, 
  ArrowLeft, 
  Save, 
  Zap, 
  Smile, 
  Settings as SettingsIcon, 
  Globe, 
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Crown,
  Trash2,
  AlertTriangle,
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  CreditCard,
  Image,
  ChevronDown,
  Building2,
  BookOpen,
  Send,
  MessageCircle,
  Instagram,
  Copy,
  ExternalLink,
  RefreshCw,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function BotSettings() {
  const { botId } = useParams();
  const navigate = useNavigate();
  const [bot, setBot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);

  // Form State
  const [personality, setPersonality] = useState('professional');
  const [isPersonalityDropdownOpen, setIsPersonalityDropdownOpen] = useState(false);
  const [responseSpeed, setResponseSpeed] = useState('natural');
  const [isResponseSpeedDropdownOpen, setIsResponseSpeedDropdownOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false);
  const [voiceId, setVoiceId] = useState('Kore');
  const [isVoiceIdDropdownOpen, setIsVoiceIdDropdownOpen] = useState(false);
  const [primaryLanguage, setPrimaryLanguage] = useState('auto');
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [greetingMessage, setGreetingMessage] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showWebhookUrl, setShowWebhookUrl] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [platform, setPlatform] = useState('website');
  const [isPlatformDropdownOpen, setIsPlatformDropdownOpen] = useState(false);
  const [showPoweredBy, setShowPoweredBy] = useState(true);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  const predefinedAvatars = [
    'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Milo',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Luna',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Oscar',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Zoe',
  ];

  const usageGuideSteps = [
    { title: '1. Train your Bot', desc: 'Upload documents or add text to the Knowledge Base to give your bot specific knowledge.' },
    { title: '2. Customize Persona', desc: 'Set a unique personality and custom instructions to define how your bot speaks.' },
    { title: '3. Test & Refine', desc: 'Use the preview chat to test responses and adjust instructions for better accuracy.' },
    { title: '4. Deploy Anywhere', desc: 'Use the integration guide to embed your bot on any website or connect via Webhooks.' }
  ];

  const personaTemplates = [
    { label: 'Customer Support', icon: <Building2 className="w-3 h-3" />, text: 'You are a patient and helpful support agent. Use clear, simple language and always verify if the user needs more help before ending.' },
    { label: 'Sales Expert', icon: <Zap className="w-3 h-3" />, text: 'You are a persuasive sales consultant. Focus on highlighting benefits, creating urgency, and guiding the user toward a purchase.' },
    { label: 'Technical Guru', icon: <SettingsIcon className="w-3 h-3" />, text: 'You are a highly knowledgeable technical expert. Provide detailed, accurate explanations and don\'t shy away from complex terms when necessary.' },
    { label: 'Playful Guide', icon: <Smile className="w-3 h-3" />, text: 'You are a fun and energetic guide. Use plenty of emojis, keep responses short and punchy, and maintain a very positive vibe.' }
  ];

  const platformGuides: Record<string, any> = {
    website: {
      title: 'Website Integration',
      icon: <Globe className="w-6 h-6" />,
      steps: [
        'Copy the script snippet below.',
        'Paste it before the closing </body> tag of your website.',
        'Your bot will appear as a chat bubble in the bottom right corner.'
      ],
      snippet: `<script src="https://botify-ai.web.app/embed.js?id=${botId}"></script>`
    },
    telegram: {
      title: 'Telegram Integration',
      icon: <Send className="w-6 h-6" />,
      steps: [
        'Open Telegram and search for @BotFather.',
        'Send /newbot and follow the instructions to create your bot.',
        'Copy the API Token provided by BotFather.',
        'Paste the API Token in the API Key field below and save.'
      ]
    },
    whatsapp: {
      title: 'WhatsApp Integration',
      icon: <MessageCircle className="w-6 h-6" />,
      steps: [
        'Create a Meta Developer account and a WhatsApp Business App.',
        'Set up the WhatsApp Business API and get your Phone Number ID and Access Token.',
        'Configure the Webhook URL below in your Meta App settings.',
        'Paste your Access Token in the API Key field below.'
      ]
    },
    instagram: {
      title: 'Instagram Integration',
      icon: <Instagram className="w-6 h-6" />,
      steps: [
        'Connect your Instagram Professional account to a Facebook Page.',
        'Enable "Allow Access to Messages" in Instagram Settings > Privacy > Messages.',
        'Configure the Webhook URL below in your Meta App settings.',
        'Paste your Page Access Token in the API Key field below.'
      ]
    }
  };

  useEffect(() => {
    if (!botId) return;

    const fetchBot = async () => {
      try {
        if (auth.currentUser) {
          const userRef = doc(db, 'users', auth.currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserProfile(userSnap.data());
          }
        }

        const docRef = doc(db, 'bots', botId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.ownerId !== auth.currentUser?.uid) {
            navigate('/dashboard');
            return;
          }
          setBot(data);
          setPlatform(data.platform || 'website');
          setPersonality(data.personality || 'professional');
          setAvatarUrl(data.avatarUrl || '');
          setResponseSpeed(data.responseSpeed || 'natural');
          setVoiceEnabled(data.voiceEnabled || false);
          setVoiceOutputEnabled(data.voiceOutputEnabled || false);
          setVoiceId(data.voiceId || 'Kore');
          setPrimaryLanguage(data.primaryLanguage || 'auto');
          setGreetingMessage(data.greetingMessage || '');
          setCustomInstructions(data.customInstructions || '');
          setShowPoweredBy(data.showPoweredBy !== undefined ? data.showPoweredBy : true);
          setWebhookUrl(data.integrationParams?.webhookUrl || '');
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error("Error fetching bot settings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBot();
  }, [botId, navigate]);

  const isPremium = bot?.ownerId ? (userProfile?.subscription?.status === 'premium' || userProfile?.subscription?.status === 'trial') : false;

  const testPhrases: Record<string, string> = {
    auto: "Hello! I can automatically detect and respond in your language. How do I sound?",
    English: "Hello! This is a test of my English voice. How do I sound?",
    Spanish: "¡Hola! Esta es una prueba de mi voz en español. ¿Cómo sueno?",
    French: "Bonjour ! Ceci est un test de ma voix française. Comment est-ce que je sonne ?",
    German: "Hallo! Dies ist ein Test meiner deutschen Stimme. Wie höre ich mich an?",
    Chinese: "你好！这是我的中文声音测试。听起来怎么样？",
    Japanese: "こんにちは！これは私の日本語の音声テストです。どう聞こえますか？",
    Korean: "안녕하세요! 이것은 제 한국어 음성 테스트입니다. 어떻게 들리나요?",
    Hindi: "नमस्ते! यह मेरी हिंदी आवाज़ का परीक्षण है। मैं कैसा लग रहा हूँ?",
    Arabic: "مرحباً! هذا اختبار لصوتي باللغة العربية. كيف أبدو؟",
    Portuguese: "Olá! Este é um teste da minha voz em português. Como eu pareço?",
    Russian: "Привет! Это тест моего русского голоса. Как я звучу?"
  };

  const handleGenerateAvatar = () => {
    const styles = ['bottts', 'avataaars', 'identicon', 'pixel-art', 'big-smile', 'adventurer'];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const randomSeed = Math.random().toString(36).substring(7);
    setAvatarUrl(`https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${randomSeed}`);
    toast.success(`New ${randomStyle} avatar generated!`);
  };

  const handleResetAvatar = () => {
    if (bot?.name) {
      setAvatarUrl(`https://api.dicebear.com/7.x/bottts/svg?seed=${bot.name}`);
      toast.success('Avatar reset to default!');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) { // 500KB limit for base64 to avoid Firestore limits
        toast.error('File size must be less than 500KB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        toast.success('Avatar uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botId) return;
    
    if (!isPremium && (personality !== 'professional' || responseSpeed !== 'natural' || voiceEnabled || voiceOutputEnabled)) {
      toast.error('Advanced features require a Premium subscription.');
      return;
    }

    setSaving(true);
    setSuccess(false);

    try {
      const docRef = doc(db, 'bots', botId);
      await updateDoc(docRef, {
        platform,
        personality,
        avatarUrl,
        responseSpeed,
        voiceEnabled,
        voiceOutputEnabled,
        voiceId,
        primaryLanguage,
        greetingMessage,
        customInstructions,
        showPoweredBy,
        integrationParams: {
          webhookUrl,
        }
      });
      setSuccess(true);
      toast.success('Settings saved successfully!');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBot = async () => {
    if (!botId) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'bots', botId));
      toast.success('Bot deleted successfully');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete bot');
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading || !bot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to={`/bot/${botId}`} className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors font-medium">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Bot Details
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Bot Settings</h1>
        </div>

        {!isPremium && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <Crown className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Unlock Premium Features</h3>
                <p className="text-white/80 text-sm">Get access to voice input, advanced personalities, and more.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/premium')}
              className="w-full sm:w-auto px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center shadow-lg"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Upgrade Now
            </button>
          </motion.div>
        )}

        <motion.form 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleSave} 
          className="space-y-8"
        >
          {/* Bot Avatar */}
          <motion.section variants={itemVariants} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <Image className="text-indigo-600 w-6 h-6" />
              <h2 className="text-xl font-bold text-gray-900">Bot Avatar</h2>
            </div>
            <p className="text-gray-500 text-sm mb-8">Choose an avatar for your bot, generate a random one, or upload your own.</p>
            
            <div className="space-y-8">
              {/* Predefined Avatars */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Predefined Avatars</p>
                <div className="flex flex-wrap gap-4">
                  {predefinedAvatars.map((url) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setAvatarUrl(url)}
                      className={`w-16 h-16 rounded-2xl border-2 transition-all p-1 overflow-hidden ${
                        avatarUrl === url ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-indigo-200'
                      }`}
                    >
                      <img 
                        src={url} 
                        alt="Avatar" 
                        className="w-full h-full object-cover rounded-xl" 
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    </button>
                  ))}
                  
                  {/* Generate Button */}
                  <button
                    type="button"
                    onClick={handleGenerateAvatar}
                    className="w-16 h-16 rounded-2xl border-2 border-dashed border-gray-200 hover:border-indigo-600 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center text-gray-400 hover:text-indigo-600 group"
                    title="Generate Random Avatar"
                  >
                    <RefreshCw className="w-6 h-6 mb-1 group-hover:animate-spin" />
                    <span className="text-[10px] font-bold">Generate</span>
                  </button>

                  {/* Reset Button */}
                  <button
                    type="button"
                    onClick={handleResetAvatar}
                    className="w-16 h-16 rounded-2xl border-2 border-dashed border-gray-200 hover:border-indigo-600 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center text-gray-400 hover:text-indigo-600 group"
                    title="Reset to Default"
                  >
                    <BotIcon className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold">Reset</span>
                  </button>
                </div>
              </div>

              {/* Upload & Custom URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block">
                    <span className="text-sm font-bold text-gray-700 mb-2 block">Upload Custom Avatar</span>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="avatar-upload"
                      />
                      <label
                        htmlFor="avatar-upload"
                        className="flex items-center justify-center w-full p-4 rounded-2xl border-2 border-dashed border-gray-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer group"
                      >
                        <Upload className="w-5 h-5 mr-2 text-gray-400 group-hover:text-indigo-600" />
                        <span className="text-sm font-bold text-gray-500 group-hover:text-indigo-600">Choose File</span>
                      </label>
                    </div>
                  </label>
                  <p className="text-[10px] text-gray-400 italic mt-2">
                    Max size: 500KB. Square images work best.
                  </p>
                </div>

                <div>
                  <label className="block">
                    <span className="text-sm font-bold text-gray-700 mb-2 block">Custom Avatar URL</span>
                    <div className="flex gap-4">
                      <input
                        type="url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://example.com/avatar.png"
                        className="flex-1 p-4 rounded-2xl border-2 border-gray-100 focus:border-indigo-600 focus:ring-0 transition-all text-sm"
                      />
                      {avatarUrl && (
                        <div className="w-14 h-14 rounded-2xl border-2 border-indigo-600 p-1 overflow-hidden flex-shrink-0">
                          <img 
                            src={avatarUrl} 
                            alt="Preview" 
                            className="w-full h-full object-cover rounded-xl" 
                            referrerPolicy="no-referrer" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/bottts/svg?seed=error';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Personality Settings */}
          <motion.section variants={itemVariants} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <Smile className="text-indigo-600 w-6 h-6" />
              <h2 className="text-xl font-bold text-gray-900">Bot Personality</h2>
            </div>
            <p className="text-gray-500 text-sm mb-8">Choose how your bot interacts with users. This affects the tone and style of responses.</p>
            
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPersonalityDropdownOpen(!isPersonalityDropdownOpen)}
                className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-indigo-600 focus:ring-0 transition-all text-sm bg-white flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                    {[
                      { id: 'professional', icon: <Building2 className="w-4 h-4" /> },
                      { id: 'friendly', icon: <Smile className="w-4 h-4" /> },
                      { id: 'humorous', icon: <Zap className="w-4 h-4" /> },
                      { id: 'technical', icon: <SettingsIcon className="w-4 h-4" /> }
                    ].find(p => p.id === personality)?.icon}
                  </div>
                  <span className="font-bold text-gray-900 capitalize">{personality}</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isPersonalityDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isPersonalityDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden"
                  >
                    {[
                      { id: 'professional', label: 'Professional', desc: 'Formal, polite, and business-focused.', premium: false, icon: <Building2 className="w-4 h-4" /> },
                      { id: 'friendly', label: 'Friendly', desc: 'Warm, approachable, and helpful.', premium: true, icon: <Smile className="w-4 h-4" /> },
                      { id: 'humorous', label: 'Humorous', desc: 'Witty, light-hearted, and engaging.', premium: true, icon: <Zap className="w-4 h-4" /> },
                      { id: 'technical', label: 'Technical', desc: 'Precise, detailed, and data-driven.', premium: true, icon: <SettingsIcon className="w-4 h-4" /> }
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          if (p.premium && !isPremium) {
                            setShowUpgradeModal(true);
                            return;
                          }
                          setPersonality(p.id);
                          setIsPersonalityDropdownOpen(false);
                        }}
                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group ${
                          personality === p.id ? 'bg-indigo-50/50' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-xl ${personality === p.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'} transition-colors`}>
                            {p.icon}
                          </div>
                          <div>
                            <p className={`text-sm font-bold ${personality === p.id ? 'text-indigo-900' : 'text-gray-900'}`}>{p.label}</p>
                            <p className="text-[10px] text-gray-500">{p.desc}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {p.premium && !isPremium && (
                            <Crown className="w-3.5 h-3.5 text-amber-500" />
                          )}
                          {personality === p.id && (
                            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {!isPremium && personality === 'professional' && (
              <p className="mt-4 text-xs text-amber-600 flex items-center font-medium">
                <Crown className="w-3.5 h-3.5 mr-1" />
                Upgrade to Premium to unlock more personalities.
              </p>
            )}
          </motion.section>

          {/* Custom Persona & Instructions */}
          <motion.section variants={itemVariants} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <BotIcon className="text-indigo-600 w-6 h-6" />
              <h2 className="text-xl font-bold text-gray-900">Bot Messaging & Persona</h2>
            </div>
            
            <div className="space-y-8">
              <div>
                <label className="block">
                  <span className="text-sm font-bold text-gray-700 mb-2 block">Greeting Message</span>
                  <textarea
                    value={greetingMessage}
                    onChange={(e) => setGreetingMessage(e.target.value)}
                    placeholder="e.g., Hello! I'm Alex, your travel assistant. How can I help you plan your next adventure today?"
                    className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-indigo-600 focus:ring-0 transition-all min-h-[100px] resize-none text-sm"
                  />
                </label>
                <p className="text-xs text-gray-400 italic mt-2">
                  This message will be sent automatically when a user starts a new conversation.
                </p>
              </div>

              <div>
                <label className="block">
                  <span className="text-sm font-bold text-gray-700 mb-2 block flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-indigo-600" />
                    Primary Language
                  </span>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                      className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-indigo-600 focus:ring-0 transition-all text-sm bg-white flex items-center justify-between group"
                    >
                      <span className="font-bold text-gray-900">
                        {primaryLanguage === 'auto' ? 'Auto-detect (User\'s Language)' : primaryLanguage}
                      </span>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isLanguageDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden max-h-[240px] overflow-y-auto"
                        >
                          {[
                            'auto', 'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean', 'Hindi', 'Arabic', 'Portuguese', 'Russian'
                          ].map((lang) => (
                            <button
                              key={lang}
                              type="button"
                              onClick={() => {
                                setPrimaryLanguage(lang);
                                setIsLanguageDropdownOpen(false);
                              }}
                              className={`w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group ${
                                primaryLanguage === lang ? 'bg-indigo-50/50' : ''
                              }`}
                            >
                              <span className={`text-sm font-bold ${primaryLanguage === lang ? 'text-indigo-900' : 'text-gray-900'}`}>
                                {lang === 'auto' ? 'Auto-detect (User\'s Language)' : lang}
                              </span>
                              {primaryLanguage === lang && (
                                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </label>
                <p className="text-xs text-gray-400 italic mt-2">
                  The bot will primarily respond in this language. If set to Auto-detect, it will match the user's language.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-gray-700">Custom Instructions</span>
                    {!isPremium && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                  </label>
                  <span className={`text-[10px] font-bold ${customInstructions.length > 4500 ? 'text-red-500' : 'text-gray-400'}`}>
                    {customInstructions.length} / 5000
                  </span>
                </div>
                
                <div className="relative">
                  <textarea
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value.slice(0, 5000))}
                    disabled={!isPremium}
                    placeholder="e.g., You are a helpful travel agent named Alex. You are enthusiastic about outdoor adventures but always prioritize safety. Use emojis occasionally to keep the tone light."
                    className={`w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-indigo-600 focus:ring-0 transition-all min-h-[160px] resize-none text-sm ${
                      !isPremium ? 'bg-gray-50 opacity-60 cursor-not-allowed' : ''
                    }`}
                  />
                  {!isPremium && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-[1px] rounded-2xl pointer-events-none">
                      <div className="bg-white/90 px-4 py-2 rounded-xl shadow-sm border border-amber-100 flex items-center">
                        <Crown className="w-4 h-4 text-amber-500 mr-2" />
                        <span className="text-xs font-bold text-amber-700">Premium Feature</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quick Templates</p>
                    {customInstructions && isPremium && (
                      <button 
                        type="button"
                        onClick={() => setCustomInstructions('')}
                        className="text-[10px] font-bold text-red-500 hover:text-red-600 flex items-center"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {personaTemplates.map((template) => (
                      <button
                        key={template.label}
                        type="button"
                        onClick={() => {
                          if (!isPremium) {
                            setShowUpgradeModal(true);
                            return;
                          }
                          setCustomInstructions(template.text);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border flex items-center space-x-1.5 ${
                          isPremium 
                            ? 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100' 
                            : 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed'
                        }`}
                      >
                        {template.icon}
                        <span>{template.label}</span>
                        {!isPremium && <Lock className="w-2.5 h-2.5 ml-1" />}
                      </button>
                    ))}
                  </div>
                </div>
                
                <p className="text-xs text-gray-400 italic mt-3">
                  These instructions will be combined with the selected personality to shape the bot's behavior. Detailed instructions lead to better results.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Training Mode Settings */}
          <motion.section variants={itemVariants} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <SettingsIcon className="text-indigo-600 w-6 h-6" />
              <h2 className="text-xl font-bold text-gray-900">Training Mode</h2>
            </div>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Your bot is currently trained using **Small Language Model (SLM)** technology, optimized for high efficiency and specific business tasks.
            </p>
            
            <div className="p-6 rounded-2xl border-2 border-indigo-600 bg-indigo-50/30 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-100">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">SLM Trained</p>
                  <p className="text-xs text-gray-500">Optimized for business logic and speed.</p>
                </div>
              </div>
              <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Active
              </div>
            </div>
          </motion.section>

          {/* Performance Settings */}
          <motion.section variants={itemVariants} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <Zap className="text-indigo-600 w-6 h-6" />
              <h2 className="text-xl font-bold text-gray-900">Response Speed</h2>
            </div>
            <p className="text-gray-500 text-sm mb-8">Control the simulated typing speed of your bot to make it feel more human.</p>
            
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsResponseSpeedDropdownOpen(!isResponseSpeedDropdownOpen)}
                className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-indigo-600 focus:ring-0 transition-all text-sm bg-white flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-gray-900 capitalize">{responseSpeed}</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isResponseSpeedDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isResponseSpeedDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden"
                  >
                    {[
                      { id: 'instant', label: 'Instant', desc: 'No delay', premium: true },
                      { id: 'natural', label: 'Natural', desc: '1-2s delay', premium: false },
                      { id: 'slow', label: 'Deliberate', desc: '3-5s delay', premium: true }
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          if (s.premium && !isPremium) {
                            setShowUpgradeModal(true);
                            return;
                          }
                          setResponseSpeed(s.id);
                          setIsResponseSpeedDropdownOpen(false);
                        }}
                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group ${
                          responseSpeed === s.id ? 'bg-indigo-50/50' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-xl ${responseSpeed === s.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'} transition-colors`}>
                            <Zap className="w-4 h-4" />
                          </div>
                          <div>
                            <p className={`text-sm font-bold ${responseSpeed === s.id ? 'text-indigo-900' : 'text-gray-900'}`}>{s.label}</p>
                            <p className="text-[10px] text-gray-500">{s.desc}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {s.premium && !isPremium && (
                            <Crown className="w-3.5 h-3.5 text-amber-500" />
                          )}
                          {responseSpeed === s.id && (
                            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>

          {/* Voice Input Settings */}
          <motion.section variants={itemVariants} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm overflow-hidden relative">
            {!isPremium && (
              <div className="absolute top-0 right-0 mt-4 mr-4">
                <div className="flex items-center space-x-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Premium</span>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-3 mb-6">
              <Mic className="text-indigo-600 w-6 h-6" />
              <h2 className="text-xl font-bold text-gray-900">Voice Input</h2>
            </div>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Enable users to interact with your bot using their voice. This uses advanced speech-to-text technology to provide a hands-free experience.
            </p>
            
            <div className={`p-6 rounded-2xl border-2 transition-all ${
              voiceEnabled ? 'border-indigo-600 bg-indigo-50/30' : 'border-gray-100 bg-gray-50/50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl transition-all ${
                    voiceEnabled ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {voiceEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Enable Voice Input</p>
                    <p className="text-xs text-gray-500">Allow microphone access for real-time conversation.</p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => isPremium ? setVoiceEnabled(!voiceEnabled) : setShowUpgradeModal(true)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all focus:outline-none ${
                    voiceEnabled ? 'bg-indigo-600' : 'bg-gray-300'
                  } hover:scale-105 active:scale-95`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-sm ${
                      voiceEnabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {!isPremium && (
              <div className="mt-8 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Zap className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-bold text-amber-900">Unlock Voice Features</p>
                    <p className="text-xs text-amber-700/70">Get voice input, custom voices, and more with Premium.</p>
                  </div>
                </div>
                <Link
                  to="/premium"
                  className="px-6 py-2.5 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-all shadow-lg shadow-amber-100 flex items-center"
                >
                  Upgrade Now
                  <ArrowLeft className="ml-2 w-4 h-4 rotate-180" />
                </Link>
              </div>
            )}
          </motion.section>

          {/* Voice Output Settings */}
          <motion.section variants={itemVariants} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Volume2 className="text-indigo-600 w-6 h-6" />
                <h2 className="text-xl font-bold text-gray-900">Voice Output (TTS)</h2>
              </div>
              {!isPremium && <Crown className="w-5 h-5 text-amber-500" />}
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${voiceOutputEnabled ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
                    {voiceOutputEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Enable Voice Output</p>
                    <p className="text-sm text-gray-500">The bot will speak its responses aloud.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => isPremium ? setVoiceOutputEnabled(!voiceOutputEnabled) : setShowUpgradeModal(true)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${
                    voiceOutputEnabled ? 'bg-indigo-600' : 'bg-gray-300'
                  } hover:scale-105 active:scale-95`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      voiceOutputEnabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {voiceOutputEnabled && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-gray-700">Select Voice</label>
                    <button
                      type="button"
                      onClick={() => speak(testPhrases[primaryLanguage] || testPhrases['auto'], voiceId as any)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center"
                    >
                      <Volume2 className="w-3.5 h-3.5 mr-1" />
                      Test Voice
                    </button>
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsVoiceIdDropdownOpen(!isVoiceIdDropdownOpen)}
                      className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-indigo-600 focus:ring-0 transition-all text-sm bg-white flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                          <Volume2 className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-gray-900">{voiceId}</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isVoiceIdDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isVoiceIdDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden"
                        >
                          {['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'].map((v) => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => {
                                setVoiceId(v);
                                setIsVoiceIdDropdownOpen(false);
                              }}
                              className={`w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group ${
                                voiceId === v ? 'bg-indigo-50/50' : ''
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-xl ${voiceId === v ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'} transition-colors`}>
                                  <Volume2 className="w-4 h-4" />
                                </div>
                                <span className={`text-sm font-bold ${voiceId === v ? 'text-indigo-900' : 'text-gray-900'}`}>{v}</span>
                              </div>
                              {voiceId === v && (
                                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </div>

            {!isPremium && (
              <p className="text-xs text-amber-600 mt-4 flex items-center font-medium">
                <AlertCircle className="w-4 h-4 mr-1" />
                Voice output is a premium feature. Upgrade to enable.
              </p>
            )}
          </motion.section>

          {/* Platform Selection */}
          <motion.section variants={itemVariants} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <Globe className="text-indigo-600 w-6 h-6" />
              <h2 className="text-xl font-bold text-gray-900">Deployment Platform</h2>
            </div>
            <p className="text-gray-500 text-sm mb-8">Choose where you want to deploy your bot. This will provide tailored integration instructions.</p>
            
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPlatformDropdownOpen(!isPlatformDropdownOpen)}
                className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-indigo-600 focus:ring-0 transition-all text-sm bg-white flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                    {platformGuides[platform]?.icon || <Globe className="w-4 h-4" />}
                  </div>
                  <span className="font-bold text-gray-900 capitalize">{platform}</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isPlatformDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isPlatformDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden"
                  >
                    {Object.keys(platformGuides).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setPlatform(p);
                          setIsPlatformDropdownOpen(false);
                        }}
                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group ${
                          platform === p ? 'bg-indigo-50/50' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-xl ${platform === p ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'} transition-colors`}>
                            {platformGuides[p].icon}
                          </div>
                          <div>
                            <p className={`text-sm font-bold ${platform === p ? 'text-indigo-900' : 'text-gray-900'}`}>{platformGuides[p].title}</p>
                          </div>
                        </div>
                        {platform === p && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>

          {/* Platform Integration Guide */}
          <motion.section variants={itemVariants} className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md text-white">
                {platformGuides[platform]?.icon}
              </div>
              <h2 className="text-xl font-bold">{platformGuides[platform]?.title} Guide</h2>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {platformGuides[platform]?.steps.map((step: string, index: number) => (
                  <div key={index} className="flex items-start space-x-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                    <div className="flex-shrink-0 w-6 h-6 bg-white text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs">
                      {index + 1}
                    </div>
                    <p className="text-sm text-white/90 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>

              {platform === 'website' && (
                <div className="mt-6">
                  <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3">Embed Script</p>
                  <div className="relative group">
                    <pre className="bg-gray-900/50 p-4 rounded-2xl text-[11px] font-mono text-indigo-200 overflow-x-auto border border-white/10 backdrop-blur-md">
                      {platformGuides.website.snippet}
                    </pre>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(platformGuides.website.snippet);
                        toast.success('Snippet copied to clipboard!');
                      }}
                      className="absolute right-3 top-3 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white opacity-0 group-hover:opacity-100"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {(platform === 'telegram' || platform === 'whatsapp' || platform === 'instagram') && (
                <div className="mt-6 p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-white/60 uppercase tracking-wider">Webhook URL</p>
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${window.location.origin}/api/webhook/${botId}`;
                        navigator.clipboard.writeText(url);
                        toast.success('Webhook URL copied!');
                      }}
                      className="text-[10px] font-bold text-white hover:text-indigo-200 flex items-center transition-colors"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy URL
                    </button>
                  </div>
                  <code className="block p-3 bg-gray-900/30 rounded-xl text-[11px] font-mono text-indigo-100 break-all border border-white/5">
                    {window.location.origin}/api/webhook/{botId}
                  </code>
                </div>
              )}
            </div>
          </motion.section>

          {/* Integration Settings */}
          <motion.section variants={itemVariants} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <Globe className="text-indigo-600 w-6 h-6" />
              <h2 className="text-xl font-bold text-gray-900">Integration Parameters</h2>
            </div>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Configure advanced integration options for your bot. These parameters allow your bot to communicate with external systems and authenticate securely.
            </p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Webhook URL</label>
                <div className="relative">
                  <SettingsIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showWebhookUrl ? "text" : "password"}
                    placeholder="Enter your secure webhook endpoint (e.g., https://api.yoursite.com/webhook)"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowWebhookUrl(!showWebhookUrl)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    {showWebhookUrl ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 italic">The URL where your bot will send real-time event notifications. Masked for security.</p>
              </div>
            </div>
          </motion.section>

          {/* Branding Settings */}
          <motion.section variants={itemVariants} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <Crown className="text-indigo-600 w-6 h-6" />
              <h2 className="text-xl font-bold text-gray-900">Branding</h2>
            </div>
            <p className="text-gray-500 text-sm mb-8">Customize the appearance of your bot's interface.</p>
            
            <div className="flex items-center justify-between p-6 rounded-2xl bg-gray-50 border border-gray-100">
              <div>
                <p className="font-bold text-gray-900">Show "Powered by Botify AI"</p>
                <p className="text-xs text-gray-500">Display a small footer at the bottom of the chat widget.</p>
                {!isPremium && (
                  <p className="text-[10px] text-amber-600 font-bold mt-1 flex items-center">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium required to hide branding
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isPremium) {
                    setShowUpgradeModal(true);
                    return;
                  }
                  setShowPoweredBy(!showPoweredBy);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  showPoweredBy || !isPremium ? 'bg-indigo-600' : 'bg-gray-200'
                } ${!isPremium ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showPoweredBy || !isPremium ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </motion.section>

          {/* Bot Usage Guide */}
          <motion.section variants={itemVariants} className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-8 border border-indigo-100 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-indigo-600 rounded-xl text-white">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Bot Usage Guide</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {usageGuideSteps.map((step, index) => (
                <div key={index} className="flex space-x-4 p-4 bg-white rounded-2xl border border-indigo-50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">{step.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-indigo-600/5 rounded-2xl border border-indigo-100/50">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-indigo-900 mb-1">Pro Tip: Iterative Training</p>
                  <p className="text-xs text-indigo-700/80 leading-relaxed">
                    The most successful bots are built iteratively. Start with a small knowledge base, test common questions, and add more data based on where the bot struggles. Use the "Custom Instructions" to fine-tune specific edge cases.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Danger Zone */}
          <motion.section variants={itemVariants} className="bg-red-50 rounded-3xl p-8 border border-red-100 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <AlertTriangle className="text-red-600 w-6 h-6" />
              <h2 className="text-xl font-bold text-red-900">Danger Zone</h2>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <p className="font-bold text-red-900 mb-1">Delete this bot</p>
                <p className="text-sm text-red-600/70">Once you delete a bot, there is no going back. Please be certain.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Delete Bot
              </button>
            </div>
          </motion.section>

          {/* Actions */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <div className="flex items-center h-10">
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center text-green-600 font-bold text-sm"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Settings Saved Successfully!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              type="submit"
              disabled={saving || success}
              className={`w-full sm:w-auto px-10 py-4 rounded-xl font-bold transition-all shadow-xl flex items-center justify-center disabled:opacity-50 ${
                success 
                  ? 'bg-green-600 text-white shadow-green-100' 
                  : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700'
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  Save Changes
                  <Save className="ml-2 w-5 h-5" />
                </>
              )}
            </button>
          </motion.div>
        </motion.form>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100"
            >
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                <AlertTriangle className="text-red-600 w-8 h-8" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Bot?</h3>
              <p className="text-gray-500 mb-8">
                This will permanently delete <strong>{bot.name}</strong> and all associated chat history and knowledge base entries. This action cannot be undone.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteBot}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center justify-center disabled:opacity-50"
                >
                  {deleting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Yes, Delete Bot'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUpgradeModal(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 text-center"
            >
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Crown className="text-amber-500 w-10 h-10" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Feature</h3>
              <p className="text-gray-500 mb-8">
                Advanced features like voice integration, custom personalities, and speed settings are exclusive to our **Premium** users. Upgrade now to unlock the full potential of your AI bots.
              </p>

              <div className="flex flex-col gap-3">
                <Link
                  to="/premium"
                  className="w-full px-6 py-4 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-100 flex items-center justify-center"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Upgrade to Premium
                </Link>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
