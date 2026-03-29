import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Bot, Zap, Shield, Globe, MessageSquare, BarChart3, ArrowRight, Volume2, Send, MessageCircle, Instagram } from 'lucide-react';
import { speak } from '../services/ttsService';
import { auth } from '../firebase';

export default function LandingPage() {
  const [hasSpoken, setHasSpoken] = useState(false);

  useEffect(() => {
    const welcomeUser = async () => {
      // Only speak if not logged in and hasn't spoken yet
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (!user && !hasSpoken) {
          // Try to speak. Browsers might block this until first interaction.
          const success = await speak("Welcome to Botify AI. Please login or signup to start building your intelligent custom bots.");
          if (success) setHasSpoken(true);
        }
      });
      return () => unsubscribe();
    };

    welcomeUser();
  }, [hasSpoken]);

  // Fallback: Speak on first click if it hasn't spoken yet
  const handleFirstInteraction = () => {
    if (!hasSpoken && !auth.currentUser) {
      speak("Welcome to Botify AI. Please login or signup to start building your intelligent custom bots.");
      setHasSpoken(true);
    }
  };

  return (
    <div className="bg-white" onClick={handleFirstInteraction}>
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden min-h-[90vh] flex items-center">
        {/* Video Background Animation */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105"
          >
            <source 
              src="https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-network-connections-background-4000-large.mp4" 
              type="video/mp4" 
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/40 to-white"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 mb-8 border border-indigo-100">
                <Zap className="w-4 h-4 mr-2 fill-indigo-700" />
                Next-Gen AI Chatbots
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-[1.1]">
                Empower Your Business with <br />
                <span className="text-indigo-600">Intelligent Custom Bots</span>
              </h1>
              <p className="max-w-2xl mx-auto text-xl text-gray-500 mb-12 leading-relaxed">
                Botify AI helps you build, train, and deploy custom AI chatbots in minutes. 
                Automate customer support, generate leads, and engage users 24/7.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/auth"
                  className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center"
                >
                  Start Building Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <a
                  href="#features"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all"
                >
                  View Features
                </a>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 pointer-events-none opacity-20">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-400 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-400 rounded-full blur-[120px]"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Multi-Platform Deployment</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Deploy your AI assistant wherever your customers are. One bot, multiple platforms.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
            {[
              { icon: <Globe className="w-8 h-8" />, name: "Website", color: "bg-blue-50 text-blue-600" },
              { icon: <Send className="w-8 h-8" />, name: "Telegram", color: "bg-sky-50 text-sky-600" },
              { icon: <MessageCircle className="w-8 h-8" />, name: "WhatsApp", color: "bg-green-50 text-green-600" },
              { icon: <Instagram className="w-8 h-8" />, name: "Instagram", color: "bg-pink-50 text-pink-600" },
            ].map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
              >
                <div className={`w-16 h-16 ${p.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {p.icon}
                </div>
                <span className="font-bold text-gray-900">{p.name}</span>
              </motion.div>
            ))}
          </div>

          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need to succeed</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Powerful tools designed to help you create the perfect AI assistant for your unique business needs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe className="w-6 h-6 text-indigo-600" />,
                title: "Website Analysis",
                description: "Simply provide your URL and our AI will extract knowledge base automatically."
              },
              {
                icon: <Shield className="w-6 h-6 text-indigo-600" />,
                title: "Secure Integration",
                description: "Generate unique HTML/JS snippets with anti-edit protection for your site."
              },
              {
                icon: <BarChart3 className="w-6 h-6 text-indigo-600" />,
                title: "Real-time Analytics",
                description: "Track bot health, usage stats, and customer satisfaction in real-time."
              },
              {
                icon: <MessageSquare className="w-6 h-6 text-indigo-600" />,
                title: "Custom Training",
                description: "Manually add company details or upload documents to refine bot knowledge."
              },
              {
                icon: <Bot className="w-6 h-6 text-indigo-600" />,
                title: "AI Avatars",
                description: "Personalize your bot with AI-generated avatars based on your brand identity."
              },
              {
                icon: <Zap className="w-6 h-6 text-indigo-600" />,
                title: "Instant Deployment",
                description: "Go live in minutes with our streamlined creation and implementation engine."
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-indigo-600 rounded-[2.5rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-8">Ready to transform your business?</h2>
              <p className="text-indigo-100 text-lg mb-12 max-w-2xl mx-auto">
                Join thousands of businesses already using Botify AI to scale their customer engagement.
              </p>
              <Link
                to="/auth"
                className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-lg"
              >
                Get Started for Free
              </Link>
            </div>
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-indigo-500 rounded-full opacity-20"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-700 rounded-full opacity-20"></div>
          </div>
        </div>
      </section>
    </div>
  );
}
