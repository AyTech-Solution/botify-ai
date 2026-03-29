import React, { useState, useEffect, useRef, memo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, collection, query, where, onSnapshot, addDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { generateBotResponse, generateVoiceOutput } from '../services/geminiService';
import { 
  Bot, 
  ArrowLeft, 
  Send, 
  Settings, 
  Activity, 
  MessageSquare, 
  Code,
  Globe,
  Copy,
  Check,
  Loader2,
  Server,
  BarChart3,
  History,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  BookOpen,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  AlertTriangle,
  HeartPulse,
  TrendingUp,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { deleteDoc } from 'firebase/firestore';
import IntegrationGuide from '../components/IntegrationGuide';

// Memoized Knowledge Entry for performance
const KnowledgeEntry = memo(({ 
  entry, 
  editingKnowledgeId, 
  deletingKnowledgeId, 
  knowledgeInput, 
  setKnowledgeInput, 
  setEditingKnowledgeId, 
  setDeletingKnowledgeId, 
  handleUpdateKnowledge, 
  handleDeleteKnowledge, 
  isSavingKnowledge,
  setIsAddingKnowledge
}: any) => {
  return (
    <div className="group bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-indigo-200 transition-all relative">
      {editingKnowledgeId === entry.id ? (
        <div className="space-y-4">
          <textarea
            value={knowledgeInput}
            onChange={(e) => setKnowledgeInput(e.target.value)}
            className="w-full p-4 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm min-h-[120px]"
          />
          <div className="flex justify-end space-x-2">
            <button 
              onClick={() => setEditingKnowledgeId(null)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleUpdateKnowledge(entry.id)}
              disabled={!knowledgeInput.trim() || isSavingKnowledge}
              className="p-2 text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
            >
              {isSavingKnowledge ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Source: {entry.sourceUrl === 'manual' ? 'Manual Entry' : 'Website Analysis'}
            </span>
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => {
                  setEditingKnowledgeId(entry.id);
                  setKnowledgeInput(entry.content);
                  setIsAddingKnowledge(false);
                }}
                className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setDeletingKnowledgeId(entry.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {deletingKnowledgeId === entry.id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl z-20 flex flex-col items-center justify-center p-6 text-center"
              >
                <Trash2 className="w-8 h-8 text-red-500 mb-3" />
                <h4 className="text-sm font-bold text-gray-900 mb-1">Delete this entry?</h4>
                <p className="text-xs text-gray-500 mb-4">This action cannot be undone.</p>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setDeletingKnowledgeId(null)}
                    className="px-4 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleDeleteKnowledge(entry.id)}
                    className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">{entry.content}</p>
        </>
      )}
    </div>
  );
});

KnowledgeEntry.displayName = 'KnowledgeEntry';

export default function BotDetail() {
  const { botId } = useParams();
  const navigate = useNavigate();
  const [bot, setBot] = useState<any>(null);
  const [knowledge, setKnowledge] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<{ id: string, type: 'info' | 'error', message: string, timestamp: string }[]>([]);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isAddingKnowledge, setIsAddingKnowledge] = useState(false);
  const [editingKnowledgeId, setEditingKnowledgeId] = useState<string | null>(null);
  const [deletingKnowledgeId, setDeletingKnowledgeId] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const currentAudioBufferRef = useRef<AudioBuffer | null>(null);
  const recognitionRef = useRef<any>(null);
  const [knowledgeInput, setKnowledgeInput] = useState('');
  const [isSavingKnowledge, setIsSavingKnowledge] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    setLogs([
      { id: '1', type: 'info', message: 'Bot engine initialized', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
      { id: '2', type: 'info', message: 'Knowledge base loaded', timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString() },
      { id: '3', type: 'info', message: 'System check passed', timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString() },
      { id: '4', type: 'info', message: 'Ready for deployment', timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString() },
    ]);
  }, []);

  useEffect(() => {
    if (!botId) return;

    const fetchBot = async () => {
      const docRef = doc(db, 'bots', botId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.ownerId !== auth.currentUser?.uid) {
          navigate('/dashboard');
          return;
        }
        setBot(data);
      } else {
        navigate('/dashboard');
      }
    };

    fetchBot();

    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      const docRef = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      }
    };
    fetchProfile();

    const q = query(collection(db, 'bots', botId, 'knowledge'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setKnowledge(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [botId, navigate]);

  useEffect(() => {
    if (bot && messages.length === 0) {
      const greeting = bot.greetingMessage || 'Hello! How can I help you today?';
      setMessages([{ role: 'bot', text: greeting }]);
      speak(greeting);
    }
  }, [bot, messages.length]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = (bot?.primaryLanguage === 'auto' || !bot?.primaryLanguage) ? 'en-US' : bot.primaryLanguage;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [bot?.primaryLanguage]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const speak = async (text: string) => {
    if (!bot?.voiceOutputEnabled) return;
    try {
      // Stop current playback
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current = null;
      }

      const base64Audio = await generateVoiceOutput(text, bot.voiceId || 'Kore');
      if (base64Audio) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          gainNodeRef.current = audioContextRef.current.createGain();
          gainNodeRef.current.connect(audioContextRef.current.destination);
        }
        
        const audioContext = audioContextRef.current;
        const gainNode = gainNodeRef.current!;
        gainNode.gain.value = volume;

        const binaryString = window.atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Int16Array(len / 2);
        const view = new DataView(new ArrayBuffer(len));
        for (let i = 0; i < len; i++) {
          view.setUint8(i, binaryString.charCodeAt(i));
        }
        
        for (let i = 0; i < len; i += 2) {
          bytes[i / 2] = view.getInt16(i, true); // Little Endian
        }

        const audioBuffer = audioContext.createBuffer(1, bytes.length, 24000);
        const channelData = audioBuffer.getChannelData(0);
        for (let i = 0; i < bytes.length; i++) {
          channelData[i] = bytes[i] / 32768;
        }
        
        currentAudioBufferRef.current = audioBuffer;
        playBuffer(audioBuffer);
      }
    } catch (err) {
      console.error("Error playing voice output:", err);
      setIsPlaying(false);
    }
  };

  const playBuffer = (buffer: AudioBuffer) => {
    if (!audioContextRef.current || !gainNodeRef.current) return;
    
    const audioContext = audioContextRef.current;
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(gainNodeRef.current);
    
    source.onended = () => {
      setIsPlaying(false);
      audioSourceRef.current = null;
    };

    audioSourceRef.current = source;
    source.start();
    setIsPlaying(true);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current = null;
      }
      setIsPlaying(false);
    } else if (currentAudioBufferRef.current) {
      playBuffer(currentAudioBufferRef.current);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMsg = input.trim();
    const timestamp = new Date().toISOString();
    setLogs(prev => [{ id: Date.now().toString(), type: 'info' as const, message: `User message: "${userMsg.substring(0, 30)}..."`, timestamp: new Date().toISOString() }, ...prev].slice(0, 10));
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setSending(true);

    // Save to Firestore
    let currentSessionId = sessionId;
    try {
      if (!currentSessionId) {
        const initialMessages = [
          { role: 'bot', text: bot.greetingMessage || 'Hello! How can I help you today?', timestamp },
          { role: 'user', text: userMsg, timestamp }
        ];
        const sessionRef = await addDoc(collection(db, 'bots', botId!, 'chats'), {
          botId,
          userId: auth.currentUser?.uid,
          startedAt: timestamp,
          lastMessageAt: timestamp,
          messages: initialMessages
        });
        currentSessionId = sessionRef.id;
        setSessionId(currentSessionId);
      } else {
        await updateDoc(doc(db, 'bots', botId!, 'chats', currentSessionId), {
          lastMessageAt: timestamp,
          messages: arrayUnion({ role: 'user', text: userMsg, timestamp })
        });
      }
    } catch (err) {
      console.error("Error saving user message to history:", err);
    }

    const fullKnowledge = knowledge.map(k => k.content).join('\n\n');
    const botResponse = await generateBotResponse(userMsg, fullKnowledge, bot.personality, bot.customInstructions, bot.primaryLanguage);
    
    // Artificial delay based on responseSpeed setting
    const delay = bot.responseSpeed === 'instant' ? 0 : bot.responseSpeed === 'slow' ? 4000 : 1500;
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    const botTimestamp = new Date().toISOString();
    
    setLogs(prev => [{ id: Date.now().toString(), type: 'info' as const, message: 'Bot response generated', timestamp: new Date().toISOString() }, ...prev].slice(0, 10));
    setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    setSending(false);
    speak(botResponse);

    // Update usage stats in Firestore
    try {
      const botRef = doc(db, 'bots', botId!);
      await updateDoc(botRef, {
        'usageStats.totalMessages': (bot.usageStats?.totalMessages || 0) + 2,
        'usageStats.userMessages': (bot.usageStats?.userMessages || 0) + 1,
        'usageStats.botMessages': (bot.usageStats?.botMessages || 0) + 1,
        'usageStats.lastActiveAt': botTimestamp
      });
    } catch (err) {
      console.error("Error updating usage stats:", err);
    }

    // Save bot response to Firestore
    if (currentSessionId) {
      try {
        await updateDoc(doc(db, 'bots', botId!, 'chats', currentSessionId), {
          lastMessageAt: botTimestamp,
          messages: arrayUnion({ role: 'bot', text: botResponse, timestamp: botTimestamp })
        });
      } catch (err) {
        console.error("Error saving bot response to history:", err);
      }
    }
  };

  const copySnippet = () => {
    const snippet = `<script src="${window.location.origin}/bot-widget.js" data-bot-id="${botId}"></script>`;
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddKnowledge = async () => {
    if (!knowledgeInput.trim() || !botId) return;
    setIsSavingKnowledge(true);
    try {
      await addDoc(collection(db, 'bots', botId, 'knowledge'), {
        botId,
        content: knowledgeInput.trim(),
        sourceUrl: 'manual',
        lastUpdated: new Date().toISOString()
      });
      setKnowledgeInput('');
      setIsAddingKnowledge(false);
    } catch (err) {
      console.error("Error adding knowledge:", err);
    } finally {
      setIsSavingKnowledge(false);
    }
  };

  const handleUpdateKnowledge = async (id: string) => {
    if (!knowledgeInput.trim() || !botId) return;
    setIsSavingKnowledge(true);
    try {
      await updateDoc(doc(db, 'bots', botId, 'knowledge', id), {
        content: knowledgeInput.trim(),
        lastUpdated: new Date().toISOString()
      });
      setKnowledgeInput('');
      setEditingKnowledgeId(null);
    } catch (err) {
      console.error("Error updating knowledge:", err);
    } finally {
      setIsSavingKnowledge(false);
    }
  };

  const handleDeleteKnowledge = async (id: string) => {
    if (!botId) return;
    try {
      await deleteDoc(doc(db, 'bots', botId, 'knowledge', id));
      setDeletingKnowledgeId(null);
    } catch (err) {
      console.error("Error deleting knowledge:", err);
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
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors font-medium">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center space-x-4">
            <Link 
              to={`/bot/${botId}/settings`}
              className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-indigo-600 transition-all"
            >
              <Settings className="w-5 h-5" />
            </Link>
            <Link 
              to={`/bot/${botId}/history`}
              className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-indigo-600 transition-all"
              title="View Chat History"
            >
              <History className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Left: Bot Info & Snippet */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 rounded-bl-[5rem] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10">
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 text-white font-bold text-3xl shadow-lg shadow-indigo-100 overflow-hidden"
                >
                  <img src="/logo.svg" alt="Botify AI Logo" className="w-full h-full object-cover" />
                </motion.div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{bot.name || 'Unnamed Bot'}</h1>
                <p className="text-gray-500 text-sm mb-6">{bot.companyName}</p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Status</span>
                    <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full font-bold text-[10px] uppercase tracking-wider">
                      {bot.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Total Chats</span>
                    <span className="text-gray-900 font-bold">{bot.usageStats?.totalChats || 0}</span>
                  </div>
                </div>

                <Link 
                  to={`/bot/${botId}/history`}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-all mt-6"
                >
                  <History className="w-4 h-4" />
                  <span>View Chat History</span>
                </Link>
              </div>
            </motion.div>

            {/* Detailed Usage Statistics */}
            <motion.div 
              variants={itemVariants} 
              className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Usage Statistics</h3>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                >
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                </motion.div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <User className="w-3 h-3 text-indigo-600" />, label: 'User Msgs', value: bot.usageStats?.userMessages || 0 },
                  { icon: <Bot className="w-3 h-3 text-purple-600" />, label: 'Bot Msgs', value: bot.usageStats?.botMessages || 0 },
                  { icon: <AlertTriangle className="w-3 h-3 text-amber-600" />, label: 'Error Rate', value: bot.usageStats?.errorRate || '0%' },
                  { icon: <HeartPulse className="w-3 h-3 text-red-600" />, label: 'Health', value: bot.usageStats?.health || '100%' }
                ].map((stat, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:border-indigo-200 transition-colors group/stat"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {stat.icon}
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{stat.label}</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 group-hover/stat:text-indigo-600 transition-colors">{stat.value}</p>
                  </motion.div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-50">
                <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                  <span>Total Messages</span>
                  <motion.span 
                    key={(bot.usageStats?.userMessages || 0) + (bot.usageStats?.botMessages || 0)}
                    initial={{ scale: 1.2, color: '#4f46e5' }}
                    animate={{ scale: 1, color: '#4f46e5' }}
                    className="text-indigo-600"
                  >
                    {(bot.usageStats?.userMessages || 0) + (bot.usageStats?.botMessages || 0)}
                  </motion.span>
                </div>
              </div>
            </motion.div>

            {/* Status Indicators */}
            <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">System Health</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-100">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75" />
                    </div>
                    <span className="text-sm font-bold text-green-700 uppercase tracking-widest">Bot Online</span>
                  </div>
                  <Check className="w-4 h-4 text-green-600" />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <Server className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-bold text-gray-600 uppercase tracking-widest">Server Status</span>
                  </div>
                  <span className="text-xs font-black text-indigo-600 uppercase">{bot.usageStats?.serverStatus || 'Online'}</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-50">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Activity Logs</h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {logs.length === 0 ? (
                    <p className="text-[10px] text-gray-400 italic text-center py-2">No recent activity</p>
                  ) : (
                    logs.map(log => (
                      <div key={log.id} className={`p-2 rounded-lg border text-[9px] font-mono flex items-start space-x-2 ${
                        log.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-white border-gray-100 text-gray-600'
                      }`}>
                        <span className="opacity-50 shrink-0">{new Date(log.timestamp).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' })}</span>
                        <span className="flex-grow truncate">{log.message}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50">
                <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                  <span>Last Checked</span>
                  <span>Just Now</span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-gray-900 rounded-3xl p-8 text-white">
              <div className="flex items-center space-x-3 mb-6">
                <Code className="text-indigo-400 w-6 h-6" />
                <h2 className="text-lg font-bold">Integration</h2>
              </div>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Copy this snippet into your website's <code>&lt;head&gt;</code> or <code>&lt;body&gt;</code> to deploy your bot.
              </p>
              <div className="bg-black/30 rounded-xl p-4 mb-6 relative group">
                <code className="text-indigo-300 text-xs font-mono break-all">
                  {`<script src="${window.location.origin}/bot-widget.js" data-bot-id="${botId}"></script>`}
                </code>
                <button 
                  onClick={copySnippet}
                  className="absolute top-2 right-2 p-2 text-gray-500 hover:text-white transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <button 
                onClick={() => setIsGuideOpen(true)}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition-all border border-white/10 mb-6"
              >
                <Globe className="w-4 h-4" />
                <span>How to Install?</span>
              </button>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Anti-edit Protection Enabled</p>
            </motion.div>
          </div>

          {/* Right: Chat Preview */}
          <div className="lg:col-span-2">
            <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-[600px] overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold overflow-hidden">
                    {bot.avatarUrl ? (
                      <img 
                        src={bot.avatarUrl} 
                        alt={bot.name} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    ) : (
                      bot.name?.[0]?.toUpperCase() || '?'
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Chat Preview</h3>
                    <p className="text-xs text-green-500 font-medium flex items-center">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                      Bot is Online
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {bot.voiceOutputEnabled && (
                    <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                      <button
                        onClick={togglePlayback}
                        className={`p-2 rounded-lg transition-all ${
                          isPlaying 
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                            : 'bg-white text-gray-600 hover:text-indigo-600 border border-gray-200'
                        }`}
                        title={isPlaying ? 'Stop Playback' : 'Replay Last Message'}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      
                      <div className="flex items-center space-x-2">
                        {volume === 0 ? (
                          <VolumeX className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-gray-400" />
                        )}
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                          className="w-20 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                      </div>
                    </div>
                  )}
                  <MessageSquare className="text-gray-300 w-6 h-6" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-sm italic">Send a message to test your bot's knowledge base.</p>
                  </div>
                )}
                {messages.map((msg, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-end space-x-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'bot' && (
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold overflow-hidden shadow-sm">
                        {bot.avatarUrl ? (
                          <img 
                            src={bot.avatarUrl} 
                            alt={bot.name} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                        ) : (
                          bot.name?.[0]?.toUpperCase() || '?'
                        )}
                      </div>
                    )}
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                {sending && (
                  <div className="flex justify-start items-end space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold overflow-hidden shadow-sm">
                      {bot.avatarUrl ? (
                        <img 
                          src={bot.avatarUrl} 
                          alt={bot.name} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                      ) : (
                        bot.name?.[0]?.toUpperCase() || '?'
                      )}
                    </div>
                    <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {(userProfile?.subscription?.status !== 'premium' || bot.showPoweredBy) && (
                <div className="py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-center space-x-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Powered by</span>
                  <div className="flex items-center bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm">
                    <Bot className="w-3 h-3 text-indigo-600 mr-1.5" />
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Botify AI</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-gray-100 flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Type a message to test..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                />
                {bot.voiceEnabled && (
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`p-3 rounded-xl transition-all shadow-lg ${
                      isListening 
                        ? 'bg-red-500 text-white shadow-red-100 animate-pulse' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-gray-100'
                    }`}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          </div>
        </motion.div>

        {/* Knowledge Base Management */}
        <motion.div variants={itemVariants} className="mt-12">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Knowledge Base</h2>
                  <p className="text-sm text-gray-500">Manage the information your bot uses to answer questions.</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsAddingKnowledge(true);
                  setEditingKnowledgeId(null);
                  setKnowledgeInput('');
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                <Plus className="w-4 h-4" />
                <span>Add Entry</span>
              </button>
            </div>

            <div className="p-8">
              <AnimatePresence mode="wait">
                {isAddingKnowledge && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-8 p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100"
                  >
                    <h3 className="text-sm font-bold text-indigo-900 mb-4">New Knowledge Entry</h3>
                    <textarea
                      value={knowledgeInput}
                      onChange={(e) => setKnowledgeInput(e.target.value)}
                      placeholder="Enter information for the bot to learn..."
                      className="w-full p-4 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm min-h-[120px] mb-4"
                    />
                    <div className="flex justify-end space-x-3">
                      <button 
                        onClick={() => setIsAddingKnowledge(false)}
                        className="px-4 py-2 text-gray-500 font-bold text-sm hover:text-gray-700"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleAddKnowledge}
                        disabled={!knowledgeInput.trim() || isSavingKnowledge}
                        className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-50"
                      >
                        {isSavingKnowledge ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>Save Entry</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {knowledge.length === 0 ? (
                  <div className="col-span-full py-12 text-center">
                    <p className="text-gray-400 italic">No knowledge entries found. Add some information to help your bot learn.</p>
                  </div>
                ) : (
                  knowledge.map((entry) => (
                    <KnowledgeEntry 
                      key={entry.id}
                      entry={entry}
                      editingKnowledgeId={editingKnowledgeId}
                      deletingKnowledgeId={deletingKnowledgeId}
                      knowledgeInput={knowledgeInput}
                      setKnowledgeInput={setKnowledgeInput}
                      setEditingKnowledgeId={setEditingKnowledgeId}
                      setDeletingKnowledgeId={setDeletingKnowledgeId}
                      handleUpdateKnowledge={handleUpdateKnowledge}
                      handleDeleteKnowledge={handleDeleteKnowledge}
                      isSavingKnowledge={isSavingKnowledge}
                      setIsAddingKnowledge={setIsAddingKnowledge}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </motion.div>
        {/* Integration Guide Modal */}
        <IntegrationGuide 
          isOpen={isGuideOpen} 
          onClose={() => setIsGuideOpen(false)} 
          botId={botId!} 
        />
      </div>
    </div>
  );
}
