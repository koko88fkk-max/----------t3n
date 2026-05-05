import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, ShieldCheck } from 'lucide-react';

export default function LoginModal({ onClose, loading: externalLoading }: { onClose: () => void; onLogin?: () => void; loading?: boolean }) {
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = externalLoading || internalLoading;

  const handleDiscordLogin = () => {
    setInternalLoading(true);
    const clientId = '1462977086653464729';
    const redirectUri = encodeURIComponent('https://t3n-2a2i.vercel.app/api/discord-auth');
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify`;
    window.location.href = discordAuthUrl;
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-xl"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md glass border border-blue-500/20 rounded-[32px] p-8 shadow-2xl overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/20 blur-[80px] rounded-full" />
        
        <button onClick={onClose} className="absolute top-6 left-6 p-2 rounded-full bg-white/5 text-zinc-500 hover:text-white transition-all z-10"><X className="w-5 h-5" /></button>

        <div className="text-center mb-10 pt-4 relative z-10">
          <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20 shadow-[0_0_30px_rgba(37,99,235,0.2)]">
            <ShieldCheck className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">تسجيل الدخول</h2>
          <p className="text-zinc-500 text-sm font-bold">بوابة الدخول الرسمية لمتجر تعن T3N</p>
        </div>

        <div className="space-y-4 relative z-10">
          <button 
            disabled={loading} 
            onClick={handleDiscordLogin} 
            className="w-full flex items-center justify-center gap-3 py-4 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-2xl font-black transition-all shadow-[0_10px_30px_rgba(88,101,242,0.3)] disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                <svg className="w-6 h-6 fill-current" viewBox="0 0 127.14 96.36">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a67.58,67.58,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.09,53,91.08,65.69,84.69,65.69Z"/>
                </svg>
                <span>الدخول باستخدام Discord</span>
              </>
            )}
          </button>
          
          <p className="text-[10px] text-zinc-600 text-center font-bold px-6">بتسجيل دخولك، أنت توافق على شروط وقوانين متجر تعن T3N الرسمية.</p>
        </div>
      </motion.div>
    </div>
  );
}
