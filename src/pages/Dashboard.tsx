import React, { useState, useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { 
  Bot, 
  Plus, 
  Settings, 
  Activity, 
  MessageSquare, 
  Crown, 
  Calendar, 
  MapPin,
  ChevronRight,
  BarChart3,
  Filter,
  User as UserIcon,
  LogOut,
  ExternalLink,
  Search,
  Grid,
  List as ListIcon,
  Loader2,
  Zap,
  Clock,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { signOut } from 'firebase/auth';
import { speak } from '../services/ttsService';
import { toast } from 'sonner';

// Memoized Bot Card for performance
const BotCard = memo(({ bot, viewMode, itemVariants }: { bot: any, viewMode: 'grid' | 'list', itemVariants: any }) => {
  if (viewMode === 'grid') {
    return (
      <motion.div 
        variants={itemVariants}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -8 }}
        className="p-8 bg-white border border-gray-100 rounded-[2.5rem] hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-50 transition-all group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 rounded-bl-[5rem] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
        
        {/* Hover Overlay Actions */}
        <div className="absolute inset-0 bg-indigo-600/95 backdrop-blur-md flex flex-col items-center justify-center space-y-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-8 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto">
          <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mb-2">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <Link 
            to={`/bot/${bot.id}`}
            className="w-48 py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <Activity className="w-4 h-4 mr-2" />
            View Details
          </Link>
          <Link 
            to={`/bot/${bot.id}/settings`}
            className="w-48 py-4 bg-indigo-500 text-white border border-indigo-400 rounded-2xl font-black text-sm flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Link>
        </div>
        
        <div className="relative">
          <div className="flex items-start justify-between mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-100 overflow-hidden">
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
            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
              bot.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
            }`}>
              {bot.status}
            </span>
          </div>

          <div className="mb-8">
            <h4 className="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{bot.name}</h4>
            <p className="text-sm text-gray-400 font-medium mt-1">{bot.companyName || 'No Company'}</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                <MessageSquare className="w-3 h-3 mr-1 text-indigo-500" />
                Chats
              </span>
              <span className="text-lg font-black text-gray-900">{bot.usageStats?.totalChats || 0}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                <TrendingUp className="w-3 h-3 mr-1 text-emerald-500" />
                Messages
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black text-gray-900">{bot.usageStats?.totalMessages || 0}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                <Clock className="w-3 h-3 mr-1 text-blue-500" />
                Last Active
              </span>
              <span className="text-xs font-black text-gray-900 truncate">
                {bot.lastActiveAt ? formatDistanceToNow(new Date(bot.lastActiveAt), { addSuffix: true }) : 'Never'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1 text-amber-500" />
                Error Rate
              </span>
              <div className="flex items-center space-x-2">
                <span className={`text-lg font-black ${parseFloat(bot.usageStats?.errorRate || '0') > 5 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {bot.usageStats?.errorRate || '0%'}
                </span>
                {parseFloat(bot.usageStats?.errorRate || '0') > 5 && (
                  <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-50">
            <Link 
              to={`/bot/${bot.id}/settings`}
              className="flex items-center text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors group/link"
            >
              <Settings className="w-4 h-4 mr-2 group-hover/link:rotate-90 transition-transform" />
              Configure
            </Link>
            <Link 
              to={`/bot/${bot.id}`} 
              className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={itemVariants}
      layout
      className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-3xl hover:border-indigo-100 hover:shadow-lg transition-all group"
    >
      <div className="flex items-center space-x-6">
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black overflow-hidden">
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
          <h4 className="font-bold text-gray-900">{bot.name}</h4>
          <p className="text-xs text-gray-400">{bot.companyName}</p>
        </div>
      </div>
      <div className="hidden md:flex items-center space-x-8 lg:space-x-12">
        <div className="text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Chats</p>
          <p className="font-bold text-gray-900">{bot.usageStats?.totalChats || 0}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Messages</p>
          <p className="font-bold text-gray-900">{bot.usageStats?.totalMessages || 0}</p>
        </div>
        <div className="text-center hidden lg:block">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Active</p>
          <p className="text-xs font-bold text-gray-900">
            {bot.lastActiveAt ? formatDistanceToNow(new Date(bot.lastActiveAt), { addSuffix: true }) : 'Never'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Error Rate</p>
          <p className={`font-bold ${parseFloat(bot.usageStats?.errorRate || '0') > 5 ? 'text-red-500' : 'text-emerald-500'}`}>
            {bot.usageStats?.errorRate || '0%'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
          <span className={`text-[10px] font-black uppercase ${bot.status === 'active' ? 'text-emerald-500' : 'text-amber-500'}`}>
            {bot.status}
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
        <Link 
          to={`/bot/${bot.id}/settings`} 
          className="flex items-center px-4 py-2 text-xs font-bold text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Link>
        <Link 
          to={`/bot/${bot.id}`} 
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 font-bold text-xs"
        >
          <ChevronRight className="w-4 h-4 mr-2" />
          View Details
        </Link>
      </div>
    </motion.div>
  );
});

BotCard.displayName = 'BotCard';

export default function Dashboard() {
  const [bots, setBots] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isPremium = userProfile?.isPremium || false;
  const [location, setLocation] = useState('Detecting...');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();

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
    if (!auth.currentUser) return;

    // Fetch user profile
    const fetchProfile = async () => {
      const docRef = doc(db, 'users', auth.currentUser!.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      }
    };
    fetchProfile();

    // Fetch bots
    const q = query(collection(db, 'bots'), where('ownerId', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const botsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBots(botsData);
      setLoading(false);
    });

    // Get location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`);
            const data = await res.json();
            setLocation(`${data.city}, ${data.countryName}`);
          } catch (e) {
            setLocation('Location unavailable');
          }
        },
        () => setLocation('Permission denied')
      );
    }

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userProfile?.displayName && !sessionStorage.getItem('hasWelcomedDashboard')) {
      const firstName = userProfile.displayName.split(' ')[0];
      speak(`Welcome back, ${firstName}! Your AI assistants are ready for action.`);
      sessionStorage.setItem('hasWelcomedDashboard', 'true');
    }
  }, [userProfile]);

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const filteredBots = bots.filter(bot => {
    const matchesStatus = statusFilter === 'all' ? true : bot.status === statusFilter;
    const matchesSearch = bot.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         bot.companyName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/auth');
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              Welcome, {userProfile?.displayName?.split(' ')[0] || 'User'} 👋
            </h1>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5" /> {format(new Date(), 'EEEE, MMMM do')}</span>
              <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5" /> {location}</span>
            </div>
          </div>
          <Link 
            to="/create-bot"
            className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Bot
          </Link>
        </div>

        {/* Stats Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {[
            { 
              label: 'Total Bots', 
              value: bots.length,
              subValue: `of ${isPremium ? '∞' : '1'} used`,
              icon: <Bot className="w-5 h-5" />, 
              color: 'bg-indigo-600 text-white', 
              trend: 'Usage',
              progress: isPremium ? null : (bots.length / 1) * 100
            },
            { label: 'Total Messages', value: bots.reduce((acc, b) => acc + (b.usageStats?.totalMessages || 0), 0), icon: <TrendingUp className="w-5 h-5" />, color: 'bg-emerald-500 text-white', trend: '+8%' },
            { label: 'Server Health', value: '99.9%', icon: <Activity className="w-5 h-5" />, color: 'bg-blue-500 text-white', trend: 'Stable' },
            { label: 'Current Plan', value: isPremium ? 'Premium' : 'Free', icon: <Crown className="w-5 h-5" />, color: 'bg-amber-500 text-white', trend: 'Active' },
          ].map((stat, idx) => (
            <motion.div 
              key={idx} 
              variants={itemVariants}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-bl-[4rem] -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={stat.color + " w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-gray-100 group-hover:scale-110 transition-transform"}>
                    {stat.icon}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{stat.trend}</span>
                </div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{stat.label}</p>
                <div className="flex items-baseline space-x-2 mt-1">
                  <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                  {stat.subValue && (
                    <p className="text-sm font-bold text-gray-400">{stat.subValue}</p>
                  )}
                </div>
                
                {stat.progress !== undefined && stat.progress !== null && (
                  <div className="mt-4">
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(stat.progress, 100)}%` }}
                        className={`h-full ${stat.progress >= 100 ? 'bg-amber-500' : 'bg-indigo-600'}`}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bots Area */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Bots</h2>
              <p className="text-sm text-gray-500 mt-1">Manage and monitor your AI assistants.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search bots..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all w-full"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="training">Training</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              </div>
            ) : filteredBots.length === 0 ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden mb-12 group">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-bl-[10rem] -mr-24 -mt-24 group-hover:scale-110 transition-transform duration-700" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 mx-auto">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-black mb-2">AyTech AI</h3>
                    <p className="text-indigo-100 text-sm mb-8">
                      The flagship SLM-trained assistant for Botify AI. Optimized for high-performance business automation.
                    </p>
                    <Link 
                      to="/create-bot"
                      className="inline-flex items-center px-8 py-3 bg-white text-indigo-600 rounded-xl font-black hover:bg-indigo-50 transition-all shadow-lg"
                    >
                      Deploy AyTech AI
                      <Plus className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>

                <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-indigo-200">
                  <Bot className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {searchQuery || statusFilter !== 'all' ? 'No bots match your criteria' : 'Create Your First Bot'}
                </h3>
                <p className="text-gray-500 mb-10 max-w-sm mx-auto">
                  {searchQuery || statusFilter !== 'all'
                    ? "Try adjusting your search or filters to find what you're looking for."
                    : "You haven't created any bots yet. Start by setting up your first AI assistant to automate your business."}
                </p>
                {searchQuery || statusFilter !== 'all' ? (
                  <button 
                    onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                    className="px-8 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                  >
                    Clear All Filters
                  </button>
                ) : (
                  <Link 
                    to="/create-bot"
                    className="inline-flex items-center px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Get Started
                  </Link>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
              >
                <AnimatePresence mode="popLayout">
                  {filteredBots.map((bot) => (
                    <BotCard 
                      key={bot.id} 
                      bot={bot} 
                      viewMode="grid" 
                      itemVariants={itemVariants} 
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                <AnimatePresence mode="popLayout">
                  {filteredBots.map((bot) => (
                    <BotCard 
                      key={bot.id} 
                      bot={bot} 
                      viewMode="list" 
                      itemVariants={itemVariants} 
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
