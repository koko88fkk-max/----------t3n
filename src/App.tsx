import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, MessageCircle, ShieldAlert, Download, CheckCircle2, Star, 
  ExternalLink, AlertTriangle, ChevronDown, Gamepad2, X, LogIn, LogOut, 
  MonitorPlay, Maximize2, Copy, Check, LayoutDashboard, Users, Clock, 
  RefreshCw, Mail, Hash, Trash2, UserX, ShieldOff, Crown, Key, Plus, Ban, 
  Snowflake, Play, Search, Bell, List, Crosshair, Cpu, Shield, HelpCircle, Wrench, Youtube
} from 'lucide-react';
import { 
  auth, loginWithDiscord, logout, checkUserVIP, activateKey, isAdmin, 
  getAdminStats, banUser, unbanUser, removeVIP, deleteUserData, 
  addAdminUser, removeAdminUser, checkIsAdmin, checkBanned, getAllKeys, 
  deleteKey, deleteAllKeys, banKey, unbanKey, freezeKey, unfreezeKey, 
  isValidKeyFormat, trackSiteVisit, checkKeyStatus, createKeys, 
  listenToNotifications, deleteNotification, listenToMaintenanceMode, 
  toggleMaintenanceMode, getUserData, resetAllUsersAndCounter 
} from './lib/firebase';
import { onAuthStateChanged, User, signInWithCustomToken } from 'firebase/auth';
import LoginModal from './LoginModal';
import { AdminDashboard, KeyManagement } from './AdminComponents';

const LOGO_URL = "/logo.png";
const STORE_URL = "https://salla.sa/t3nn";
const DISCORD_URL = "https://discord.gg/tjMWEccj3J";

// Utility Functions
const getNumericId = (uid: string, assignedId?: number) => {
  if (assignedId) return assignedId.toString();
  if (!uid) return '0';
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = ((hash << 5) - hash) + uid.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString().slice(0, 6);
};

// ==========================================
// 🏗️ Components
// ==========================================

function Navbar({ user, userProfile, onLogin, onLogout, authLoading, isAdminUser, unreadCount, notifications, onReadNotifications, setShowSpooferGuide, setShowFortniteGuide, setShowTroubleshoot }: any) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifPopup, setShowNotifPopup] = useState(false);
  const [showProductMenu, setShowProductMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const productMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setShowNotifPopup(false);
      if (productMenuRef.current && !productMenuRef.current.contains(event.target as Node)) setShowProductMenu(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <motion.nav 
      initial={{ y: -100 }} animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-[100] glass border-b border-white/5"
    >
      <div className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between relative">
        {/* Right side: User Info */}
        <div className="flex items-center gap-4 flex-1">
          {!authLoading && (
            user ? (
              <>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                  <img src={user.photoURL || ''} className="w-8 h-8 rounded-full border border-blue-500/30" alt="" />
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-white text-xs font-bold">{user.displayName || 'koz'}</span>
                    <span className="text-blue-400 text-[10px] font-bold">ID: {getNumericId(user.uid, userProfile?.assignedId)}</span>
                  </div>
                  <button onClick={onLogout} className="p-1.5 hover:bg-red-500/20 rounded-full transition-all text-zinc-400 hover:text-red-400"><LogOut className="w-4 h-4" /></button>
                </div>
                {userProfile?.isVIP && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_6px_rgba(234,179,8,0.8)]" />
                    <span className="text-yellow-400 font-bold text-xs tracking-wide">عميل مميز</span>
                  </motion.div>
                )}
              </>
            ) : (
              <button onClick={onLogin} className="flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white px-5 py-2 rounded-full font-bold text-sm transition-all shadow-lg"><LogIn className="w-4 h-4" /> دخول</button>
            )
          )}
          
          <div className="relative" ref={notifRef}>
            <button onClick={() => { setShowNotifPopup(!showNotifPopup); if(!showNotifPopup && unreadCount > 0) onReadNotifications(); }} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">{unreadCount}</span>}
            </button>
            <AnimatePresence>
              {showNotifPopup && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute left-0 mt-3 w-80 bg-[#0e0e1a] border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden z-[110]">
                  <div className="p-4 border-b border-white/10 bg-white/5"><h3 className="text-sm font-bold text-white">الإشعارات</h3></div>
                  <div className="max-h-96 overflow-y-auto p-2">
                    {notifications.length === 0 ? <p className="text-center text-zinc-500 py-4 text-xs">لا توجد إشعارات</p> : 
                      notifications.slice(0, 5).map((n:any) => (
                        <div key={n.id} className="p-3 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5 transition-all mb-1">
                          <p className="text-xs text-zinc-300 leading-relaxed">{n.content}</p>
                        </div>
                      ))
                    }
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {userProfile?.isVIP && (
            <div className="hidden lg:flex items-center gap-3 border-l border-white/10 pl-4 ml-4" dir="rtl">
              <button onClick={() => setShowTroubleshoot(true)} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-full shadow-lg transition-all border border-red-500/30">
                <Wrench className="w-4 h-4" />
                <span className="text-xs">حل مشاكل عامة</span>
              </button>
              
              <div className="relative" ref={productMenuRef}>
                <button onClick={() => setShowProductMenu(!showProductMenu)} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold rounded-full shadow-lg transition-all border border-emerald-500/30">
                  <List className="w-4 h-4" />
                  <span className="text-xs">اختيار المنتج</span>
                  <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
                </button>
                <AnimatePresence>
                  {showProductMenu && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-3 w-48 bg-[#0e0e1a] border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden z-[110]">
                      <div className="flex flex-col p-2 gap-1">
                        {!userProfile.activatedProducts?.length && (
                          <div className="p-3 text-xs text-center text-zinc-500">لا يوجد منتجات مفعلة</div>
                        )}
                        {userProfile.activatedProducts?.includes('superstar') && (
                          <button onClick={() => { setShowProductMenu(false); setShowSpooferGuide(true); }} className="flex items-center gap-2 px-3 py-2.5 hover:bg-white/5 rounded-xl transition-all text-sm font-bold text-blue-400">
                            <Cpu className="w-4 h-4" /> قسم السبوفر
                          </button>
                        )}
                        {userProfile.activatedProducts?.includes('fortnite') && (
                          <button onClick={() => { setShowProductMenu(false); setShowFortniteGuide(true); }} className="flex items-center gap-2 px-3 py-2.5 hover:bg-white/5 rounded-xl transition-all text-sm font-bold text-purple-400">
                            <Gamepad2 className="w-4 h-4" /> قسم فورت نايت
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* Center: Nav Links */}
        <div className="hidden lg:flex items-center justify-center gap-8 text-sm font-bold text-zinc-400 absolute left-1/2 -translate-x-1/2">
          <a href="#delivery" className="hover:text-blue-400 transition-colors">استلام الطلبات</a>
          <a href="#rules" className="hover:text-blue-400 transition-colors">القوانين</a>
        </div>

        {/* Left Side: Logo */}
        <div className="flex items-center justify-end gap-3 flex-1">
          <span className="text-lg font-black text-white glow-text hidden sm:block">تعن T3N</span>
          <img src={LOGO_URL} className="w-10 h-10 object-contain rounded-xl border border-white/10" alt="Logo" />
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden w-10 h-10 flex items-center justify-center text-white"><List /></button>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex flex-col p-8 pt-24 text-right gap-6">
            <button onClick={() => setMobileMenuOpen(false)} className="absolute top-6 left-6 text-white"><X /></button>
            <a href="#delivery" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-white">استلام الطلبات</a>
            <a href="#rules" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-white">القوانين</a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Ambient Lighting */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.08, 0.15, 0.08]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-500/30 blur-[120px] rounded-full mix-blend-screen" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.05, 0.12, 0.05]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen" 
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <motion.div 
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative mb-8"
          >
            <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full pointer-events-none -z-10" />
            <div className="relative z-10 p-2 rounded-3xl bg-white/5 border border-blue-500/20 shadow-[0_20px_50px_rgba(59,130,246,0.15)] backdrop-blur-md">
              <img src={LOGO_URL} alt="تعن T3N" className="w-40 h-40 md:w-48 md:h-48 object-contain rounded-2xl" />
            </div>
          </motion.div>
          
          <h1 className="relative z-20 text-5xl md:text-7xl font-extrabold mb-6 text-transparent bg-clip-text text-gradient-gold drop-shadow-2xl">
            تعن T3N
          </h1>
          <p className="text-lg md:text-xl text-zinc-300 mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-md font-medium px-4">
            وجهتك الأولى للمنتجات الرقمية الفاخرة. استمتع بتجربة استثنائية، جودة عالية، وموثوقية لا تضاهى.
          </p>
          
          <div className="flex flex-col gap-4 justify-center items-center mt-4 w-full max-w-md mx-auto">
            {/* Site Guide Button */}
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255,255,255,0.1)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('activation')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 glass-panel text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all w-full relative overflow-hidden group border-white/20"
            >
              <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <Hash className="w-5 h-5 text-blue-400 relative z-10" />
              <span className="relative z-10 tracking-wide">بوابة الاستلام</span>
            </motion.button>
            
            {/* Store and Discord Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <motion.a 
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(59,130,246,0.4)" }}
                whileTap={{ scale: 0.95 }}
                href={STORE_URL} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-8 py-4 bg-gradient-gold text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(59,130,246,0.2)] transition-all w-full sm:flex-1 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-2xl" />
                <ShoppingBag className="w-5 h-5 relative z-10" />
                <span className="relative z-10">تصفح المتجر</span>
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(88,101,242,0.3)" }}
                whileTap={{ scale: 0.95 }}
                href={DISCORD_URL} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-8 py-4 glass-panel text-[#5865F2] font-bold rounded-2xl hover:bg-[#5865F2]/10 flex items-center justify-center gap-2 transition-colors w-full sm:flex-1"
              >
                <MessageCircle className="w-5 h-5" />
                مجتمع ديسكورد
              </motion.a>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-20 flex justify-center w-full text-zinc-500 animate-bounce"
        >
          <ChevronDown className="w-8 h-8" />
        </motion.div>
      </div>
    </section>
  );
}

function CustomVideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setIsPlaying(true); }
    else { v.pause(); setIsPlaying(false); }
  };

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(37,99,235,0.2)] bg-black/80 relative group">
      <video
        ref={videoRef}
        src="/site-guide-vid.mp4"
        poster="/site-guide-poster.jpg"
        className="w-full aspect-video object-contain outline-none bg-black cursor-pointer"
        onClick={togglePlay}
        controls
        preload="metadata"
      />
    </div>
  );
}


function ActivationGateway({ user, onLogin, onActivate, loading, result, onReset, onShowGuide }: any) {
  const [keyInput, setKeyInput] = useState('');
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleMsg, setRoleMsg] = useState('');

  const handleAssignRole = async () => {
    if (!user) return;
    setRoleLoading(true);
    setRoleMsg('');
    try {
      const res = await fetch('/api/assign-role', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid })
      });
      const data = await res.json();
      setRoleMsg(data.message || 'تمت العملية بنجاح');
    } catch(e) {
      setRoleMsg('حدث خطأ أثناء المحاولة');
    } finally { setRoleLoading(false); }
  };

  return (
    <section id="activation" className="relative py-32 container mx-auto px-6 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mb-4">بوابة التفعيل</h2>
          <p className="text-zinc-500">من هنا يمكنك تفعيل مفاتيحك للارتباط بحسابك واستلام منتجك</p>
        </div>
        
        {result?.success ? (
          <div className="max-w-4xl mx-auto glass rounded-[40px] p-8 border border-white/5 relative overflow-hidden flex flex-col items-center">
            {/* Background effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center w-full max-w-2xl mx-auto z-10 py-10">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <Check className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-3xl font-black text-white mb-3">تم التفعيل بنجاح!</h3>
              <div className="flex items-center gap-2 text-zinc-400 mb-2 text-sm">
                <span>المفتاح</span>
                <code className="bg-white/5 px-3 py-1 rounded text-white font-mono text-xs tracking-wider">{keyInput}</code>
                <span>مفعل ومربط بحسابك.</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-bold mb-10">
                <CheckCircle2 className="w-4 h-4" /> مربط بحسابك للأبد
              </div>
              
              {/* Cards Container */}
              <div className="w-full flex flex-col gap-4">
                {/* Product Card */}
                <div className={`bg-black/40 border border-white/5 rounded-3xl p-6 flex flex-col gap-5 relative overflow-hidden group transition-all hover:border-yellow-500/30`}>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col text-right">
                      <h4 className="text-xl font-bold text-white mb-1">
                        {result.productType === 'fortnite_unban' ? 'فك باند فورت هاردوير' : result.productType === 'spoofer_temp' ? 'سبوفر تيمب' : 'سبوفر تعن'}
                      </h4>
                      <p className="text-sm text-zinc-500">منتج السبوفر والشروحات الخاصة به.</p>
                    </div>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border bg-yellow-500/10 border-yellow-500/20 text-yellow-500`}>
                      <Cpu className="w-7 h-7" />
                    </div>
                  </div>
                  <button onClick={() => onShowGuide?.(result.productType)} className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/30 text-yellow-500`}>
                    <MonitorPlay className="w-5 h-5" /> الانتقال إلى الشرح والملفات
                  </button>
                </div>

                {/* Discord Role Card */}
                <div className="bg-black/40 border border-white/5 rounded-3xl p-6 flex flex-col gap-5 relative overflow-hidden group hover:border-[#5865F2]/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col text-right">
                      <h4 className="text-xl font-bold text-white mb-1">رتبة ديسكورد</h4>
                      <p className="text-sm text-zinc-500">اربط حسابك بالسيرفر للوصول للدعم.</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-[#5865F2]/10 border border-[#5865F2]/20 flex items-center justify-center text-[#5865F2]">
                      <MessageCircle className="w-7 h-7" />
                    </div>
                  </div>
                  <button onClick={handleAssignRole} disabled={roleLoading} className="w-full py-4 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    {roleLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MessageCircle className="w-5 h-5" />}
                    ربط الحساب وإستلام الرتبة
                  </button>
                  {roleMsg && <p className="text-center text-sm mt-1 text-[#5865F2] font-bold">{roleMsg}</p>}
                </div>
              </div>

              <button onClick={() => { setKeyInput(''); setRoleMsg(''); onReset?.(); }} className="mt-8 text-zinc-500 hover:text-white transition-colors text-sm underline decoration-white/20 underline-offset-4">تفعيل مفتاح آخر</button>
            </motion.div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Video Card */}
            <div className="glass rounded-[32px] p-8 border border-white/5 flex flex-col items-center text-center h-full">
              <div className="w-20 h-20 rounded-[1.5rem] bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 mb-6 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                <MonitorPlay className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">فيديو الشرح</h3>
              <p className="text-zinc-400 text-sm mb-8 max-w-sm">شاهد هذا المقطع لمعرفة كيفية استلام المنتج وتفعيله خطوة بخطوة.</p>
              <div className="w-full mt-auto rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                <CustomVideoPlayer />
              </div>
            </div>

            {/* Activation Card */}
            <div className="glass rounded-[32px] p-8 border border-white/5 flex flex-col items-center text-center h-full">
              <div className="w-20 h-20 rounded-[1.5rem] bg-blue-600/20 flex items-center justify-center text-blue-400 border border-blue-500/30 mb-6 shadow-[0_0_30px_rgba(37,99,235,0.2)]">
                <Key className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">تفعيل المفتاح</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-sm">أدخل مفتاح المنتج المكون من 12 رمزاً لاستلام مشترياتك فوراً.</p>
              
              {user ? (
                <div className="mb-8 py-2 px-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  مسجّل دخول: {user.displayName}
                </div>
              ) : (
                <button onClick={onLogin} className="mb-8 py-3 px-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold hover:bg-blue-500/20 transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95">
                  <LogIn className="w-5 h-5" /> تسجيل الدخول بديسكورد
                </button>
              )}

              <div className="w-full space-y-4 mt-auto">
                <input 
                  type="text" 
                  placeholder="T3N-XXXXXX-XXXXXX" 
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-2xl py-5 px-6 text-white font-mono text-center tracking-[4px] focus:outline-none focus:border-blue-500/50 transition-all text-lg shadow-inner" 
                />
                <button 
                  onClick={() => onActivate(keyInput)}
                  disabled={loading || !user}
                  className="w-full btn-primary py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 disabled:opacity-50 transition-all hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]"
                >
                  {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Key className="w-6 h-6" /> تفعيل المفتاح</>}
                </button>
              </div>
              
              {result && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`w-full mt-6 p-4 rounded-xl border ${result.success ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'} text-sm font-bold text-center flex items-center justify-center gap-2`}>
                  {result.success ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                  {result.message || result.error}
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Rules() {
  const rules = [
    { id: 1, title: 'سياسة الاسترجاع', text: 'يتم استرجاع المبلغ فقط في حال وجود خطأ من المسؤول أو المنفذ للطلب. غير ذلك لا يحق للعميل المطالبة بالاسترجاع.' },
    { id: 2, title: 'بعد الشراء', text: 'لا يمكنك طلب استرجاع المبلغ بعد شراء المنتج أو استلامه بأي حال من الأحوال. يرجى التأكد قبل إتمام عملية الدفع.' },
    { id: 3, title: 'فترة الضمان', text: 'لا يمكن طلب تعويض أو استرجاع بعد مرور 3 أيام من استخدام المنتج. يرجى فحص المنتج فور استلامه.' }
  ];

  return (
    <section id="rules" className="py-24 container mx-auto px-6">
      <div className="flex flex-col items-center mb-16">
        <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 mb-4"><Shield className="w-8 h-8" /></div>
        <h2 className="text-4xl font-black text-white mb-2">القوانين والشروط</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {rules.map((r) => (
          <div key={r.id} className="glass p-8 rounded-[32px] border border-white/5 hover:border-white/20 transition-all flex flex-col gap-4">
            <span className="text-blue-500 font-black text-3xl opacity-30">0{r.id}</span>
            <h3 className="text-xl font-bold text-white">{r.title}</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">{r.text}</p>
          </div>
        ))}
      </div>
      
      <div className="max-w-4xl mx-auto mt-12 p-6 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-400 font-bold text-center text-sm">
        شرائك من المتجر يعني موافقتك التامة على جميع الشروط والقوانين المذكورة أعلاه
      </div>
    </section>
  );
}


function SpooferGuide({ onClose, user }: { onClose: () => void; user: any }) {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const winCmd = 'windowsdefender://threatsettings/';

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const copyCmd = () => {
    navigator.clipboard.writeText(winCmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleProtectedDownload = (filename: string, saveName: string) => {
    const link = document.createElement('a');
    link.href = filename.startsWith('/') ? filename : `/${filename}`;
    link.download = saveName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return createPortal(
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] overflow-y-auto"
      style={{ background: 'radial-gradient(ellipse at center, #0a1a5c 0%, #040c2e 50%, #020618 100%)' }}
    >
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(59,130,246,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.4) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      {/* Floating Download Card - Desktop */}
      <div className="hidden 2xl:flex fixed top-1/2 right-12 -translate-y-1/2 z-50 flex-col gap-4 w-80">
        <div className="bg-[#0a1a5c]/80 backdrop-blur-2xl border border-blue-500/30 rounded-3xl p-8 flex flex-col items-center gap-6 shadow-[0_0_40px_rgba(59,130,246,0.15)]">
          <div className="w-24 h-24 rounded-3xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
            <Cpu className="w-12 h-12" />
          </div>
          <div className="text-center w-full">
            <h3 className="text-white font-black text-3xl mb-2">ملف الاسبوفر</h3>
            <p className="text-blue-200/60 text-base mb-2">discord.gg_t3n</p>
          </div>
          <button 
            onContextMenu={(e) => e.preventDefault()}
            onClick={() => handleProtectedDownload('downloads/discord.gg_t3n.rar', 'discord.gg_t3n.rar')}
            className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-blue-500 hover:bg-blue-400 text-white font-black text-lg rounded-2xl transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95"
          >
            <Download className="w-6 h-6" />
            تحميل الملف
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Sticky Download */}
      <div className="2xl:hidden fixed bottom-6 left-4 right-4 z-50">
        <div className="bg-[#0a1a5c]/90 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-4 flex items-center justify-between shadow-[0_0_30px_rgba(59,130,246,0.2)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-bold">ملف الاسبوفر</h3>
            </div>
          </div>
          <button 
            onContextMenu={(e) => e.preventDefault()}
            onClick={() => handleProtectedDownload('downloads/discord.gg_t3n.rar', 'discord.gg_t3n.rar')}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-black rounded-lg transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]"
          >
            <Download className="w-4 h-4" />
            تحميل
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-[#040c2e]/80 border-b border-blue-500/20">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="T3N" className="w-10 h-10 object-contain rounded-lg" />
            <span className="font-bold text-xl text-white">شرح السبوفر Spoofer</span>
          </div>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-all border border-white/10">
            <X className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl relative z-10">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
            <Cpu className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200">شرح استخدام السبوفر</h1>
          <p className="text-blue-200/60 text-lg max-w-2xl mx-auto">اتبع الخطوات التالية بالترتيب لتفعيل السبوفر بنجاح</p>
        </motion.div>

        {/* STEP 1 */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <div className="rounded-2xl p-6 md:p-8 bg-[#0a1a5c]/60 backdrop-blur-lg border border-blue-500/20">
            <div className="flex gap-5 items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center shrink-0 border border-red-500/20">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">أول شي: تطفي الحماية بشكل كامل</h3>
                <p className="text-blue-200/60 leading-relaxed text-lg">تضغط <span className="text-white font-bold">Win+R</span> وتحط هذا الأمر:</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-black/40 rounded-xl p-4 border border-blue-500/20 mb-4">
              <code className="text-blue-300 font-mono text-lg flex-1 select-all" dir="ltr">{winCmd}</code>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={copyCmd}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${copiedCmd ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-400'}`}>
                {copiedCmd ? <><CheckCircle2 className="w-4 h-4" /> تم النسخ</> : <><ExternalLink className="w-4 h-4" /> نسخ</>}
              </motion.button>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
              <p className="text-red-400 font-bold text-lg">⚠️ وتطفي جميع الخيارات حقت الحماية اللي ظاهرة لك بالكامل!</p>
            </div>
          </div>
        </motion.div>

        {/* STEP 2 */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="mb-8">
          <div className="rounded-2xl p-6 md:p-8 bg-[#0a1a5c]/60 backdrop-blur-lg border border-blue-500/20">
            <div className="flex gap-5 items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center shrink-0 border border-yellow-500/20">
                <Download className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">ثم تروح لملف discord.gg t3n</h3>
                <p className="text-blue-200/60 leading-relaxed text-lg">تدخل على مجلد <span className="text-white font-bold">كلين</span> ثم تشغل ملف <span className="text-yellow-400 font-bold">UpdatedApple.exe</span> — مهم تسويه قبل السبوفر!</p>
              </div>
            </div>
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><span className="text-blue-400">👇</span> شرح UpdatedApple طريقة استعمال</h4>
            <div className="rounded-xl overflow-hidden border border-blue-500/20">
              <video controls controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} className="w-full" preload="metadata">
                <source src="/video-updatedapple.mp4" type="video/mp4" />
                متصفحك لا يدعم تشغيل الفيديو
              </video>
            </div>
          </div>
        </motion.div>

        {/* STEP 3 */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="mb-8">
          <div className="rounded-2xl p-6 md:p-8 bg-[#0a1a5c]/60 backdrop-blur-lg border border-blue-500/20">
            <div className="flex gap-5 items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                <Cpu className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">بعد ما تسوي UpdatedApple.exe وإعادة تشغيل للجهاز</h3>
                <p className="text-blue-200/60 leading-relaxed text-lg">تكمل شرح السبوفر 👇</p>
              </div>
            </div>
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><span className="text-blue-400">👇</span> شرح السبوفر</h4>
            <div className="rounded-xl overflow-hidden border border-blue-500/20">
              <video controls controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} className="w-full" preload="metadata">
                <source src="/video-spoofer.mp4" type="video/mp4" />
                متصفحك لا يدعم تشغيل الفيديو
              </video>
            </div>
          </div>
        </motion.div>

        {/* STEP 4 */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 }} className="mb-8">
          <div className="rounded-2xl p-6 md:p-8 bg-[#0a1a5c]/60 backdrop-blur-lg border border-blue-500/20">
            <div className="flex gap-5 items-start">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <Gamepad2 className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 text-white">بعد ما تسوي السبوفر وإعادة تشغيل للجهاز</h3>
                <p className="text-blue-200/60 leading-relaxed text-lg mb-4">تخش بحساب جديد بأي لعبة تبيها ومبروك عليك باندك انفك! 🎉</p>
                <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/30 mb-4 flex items-start gap-3">
                  <ShieldAlert className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-red-200 text-sm md:text-base font-bold leading-relaxed">مهم جداً: لازم تسوي وتخش بحساب جديد تماماً عشان ما يرجع لك الباند! لو دخلت بحسابك القديم المتبند راح تنحظر من جديد.</p>
                </div>
                <div className="bg-black/30 p-5 rounded-2xl border border-blue-500/10">
                  <p className="text-zinc-200 leading-relaxed mb-3 font-medium">وهذا <a href="https://tmailor.com/ar/" target="_blank" rel="noopener noreferrer" className="text-blue-400 font-bold hover:underline">موقع ايميل مهمل</a> تقدر تسوي فيه حساب على السريع.</p>
                  <p className="text-zinc-400 leading-relaxed">ولو ما زبط دور لك ايميل معتمد سوا <a href="https://mail.google.com/mail" target="_blank" rel="noopener noreferrer" className="text-blue-400 font-bold hover:underline">Gmail</a> أو <a href="https://account.proton.me/mail" target="_blank" rel="noopener noreferrer" className="text-blue-400 font-bold hover:underline">Proton Mail</a> أو أي ايميل جاهز عندك.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Troubleshooting / Format Guide */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.65 }} className="mb-8">
          <div className="rounded-2xl p-6 md:p-8 bg-red-500/5 backdrop-blur-lg border border-red-500/20">
            <div className="flex gap-5 items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 border border-red-500/20">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">الاسبوفر ما زبط معك؟ (فورمات الجهاز)</h3>
                <p className="text-red-200/80 leading-relaxed text-lg">
                  إذا ما زبط معك الاسبوفر وقتها لازم تفرمت الجهاز بـ USB فلاشة، ويكون نظام ويندوز جديد ونظيف، ثم تعيد الخطوات وراح يضبط معك 100%.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {/* Win 11 */}
              <a href="https://www.youtube.com/watch?v=XZ-9RbqlA2k" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-black/40 border border-white/5 hover:border-red-500/30 hover:bg-red-500/5 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Youtube className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">شرح فورمات ويندوز 11</h4>
                  <p className="text-sm text-zinc-500">مقطع يوتيوب يوضح الطريقة</p>
                </div>
                <ExternalLink className="w-5 h-5 text-zinc-600 mr-auto group-hover:text-red-400 transition-colors" />
              </a>

              {/* Win 10 */}
              <a href="https://www.youtube.com/watch?v=aeokLW7juAw" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-black/40 border border-white/5 hover:border-red-500/30 hover:bg-red-500/5 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Youtube className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">شرح فورمات ويندوز 10</h4>
                  <p className="text-sm text-zinc-500">مقطع يوتيوب يوضح الطريقة</p>
                </div>
                <ExternalLink className="w-5 h-5 text-zinc-600 mr-auto group-hover:text-red-400 transition-colors" />
              </a>
            </div>
          </div>
        </motion.div>

        {/* Discord Help */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mb-8">
          <div className="rounded-2xl p-6 md:p-8 bg-[#5865F2]/10 backdrop-blur-lg border border-[#5865F2]/30 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#5865F2]/20 flex items-center justify-center text-[#5865F2] mb-4">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">مافهمت شي؟</h3>
            <p className="text-blue-200/60 mb-6 max-w-md mx-auto">حياك سيرفر الديسكورد، فريق الدعم الفني متواجد لمساعدتك خطوة بخطوة.</p>
            <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer"
              className="px-8 py-4 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold rounded-2xl text-lg transition-all shadow-[0_0_20px_rgba(88,101,242,0.4)] flex items-center gap-3 justify-center w-full sm:w-auto hover:scale-105 active:scale-95">
              <ExternalLink className="w-5 h-5" /> دخول سيرفر الديسكورد
            </a>
          </div>
        </motion.div>

        {/* Back */}
        <div className="mt-8 text-center pb-12">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClose}
            className="px-8 py-3 bg-white/10 text-white rounded-xl border border-white/10 hover:bg-white/20 transition-all font-bold">
            الرجوع للصفحة الرئيسية
          </motion.button>
        </div>
      </div>
    </motion.div>,
    document.body
  );
}

// =============================================
// 🎮 Fortnite Guide
// =============================================
function FortniteGuide({ onClose, user }: { onClose: () => void; user: any }) {
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleMsg, setRoleMsg] = useState('');
  const [dlLoading, setDlLoading] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleProtectedDownload = (filename: string, saveName: string) => {
    // Direct download is instant, no need for fetch/blob buffering for large files
    const link = document.createElement('a');
    link.href = filename.startsWith('/') ? filename : `/${filename}`;
    link.download = saveName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAssignRole = async () => {
    if (!user) return;
    setRoleLoading(true);
    setRoleMsg('');
    try {
      const idToken = await user.getIdToken();
      const discordId = user.uid.replace('discord_', '');
      const res = await fetch('/api/assign-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discordId, accessToken: '', idToken })
      });
      const data = await res.json();
      setRoleMsg(data.success ? '✅ تم ربط الرتبة بنجاح! ادخل السيرفر الآن.' : ('❌ ' + (data.error || 'حدث خطأ')));
    } catch { setRoleMsg('❌ فشل الاتصال بالسيرفر'); }
    setRoleLoading(false);
  };

  return createPortal(
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] overflow-y-auto bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: 'url("/fortnite-bg.jpg")' }}
    >
      <div className="fixed inset-0 z-0 bg-[#040c2e]/70 pointer-events-none mix-blend-overlay" />
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-[#040c2e]/80 border-b border-blue-500/20">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="T3N" className="w-10 h-10 object-contain rounded-lg" />
            <span className="font-bold text-xl text-white">هاك فورت نايت 🎮</span>
          </div>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-all border border-white/10">
            <X className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl relative z-10">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
            <Gamepad2 className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200">شرح هاك فورت نايت</h1>
          <p className="text-blue-200/60 text-lg max-w-2xl mx-auto">اتبع الخطوات التالية بالترتيب لتشغيل الهاك بنجاح</p>
        </motion.div>

        {/* STEP 1: تركيب التعريفات */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <div className="rounded-2xl p-6 md:p-8 bg-[#0a1a5c]/40 backdrop-blur-md border border-blue-500/20 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="flex gap-5 items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                <Download className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">أول شي: شرح تركيب تعريفات الهاك</h3>
                <p className="text-blue-200/60 leading-relaxed text-lg">شاهد الفيديو أدناه لتركيب تعريفات الهاك بشكل صحيح قبل أي شيء</p>
              </div>
            </div>
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><span className="text-blue-400">👇</span> شرح تركيب التعريفات</h4>
            <div className="flex flex-col lg:flex-row gap-4 items-stretch">
              <div className="flex-1 rounded-xl overflow-hidden border border-blue-500/20 shadow-2xl">
                <video controls controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} className="w-full h-full object-cover" preload="metadata">
                  <source src="/video-fort-drivers.mp4" type="video/mp4" />
                  متصفحك لا يدعم تشغيل الفيديو
                </video>
              </div>
              <motion.button
                onContextMenu={(e) => e.preventDefault()}
                onClick={() => handleProtectedDownload('Mouse Driver.rar', 'Mouse_Driver.rar')}
                whileHover={{ scale: 1.03, boxShadow: '0 0 35px rgba(59,130,246,0.45)' }}
                whileTap={{ scale: 0.97 }}
                className="lg:w-48 flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-gradient-to-b from-blue-600/30 to-blue-900/50 border border-blue-500/40 hover:border-blue-400 transition-all shadow-[0_0_25px_rgba(59,130,246,0.2)] select-none cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center shadow-[0_0_25px_rgba(59,130,246,0.6)]">
                  <Download className="w-7 h-7 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-white font-black text-base leading-tight">Mouse Driver</p>
                  <p className="text-blue-300/70 text-xs font-bold mt-1">اضغط للتحميل</p>
                </div>
                <span className="bg-blue-500/20 text-blue-300 text-[10px] font-black px-3 py-1 rounded-full border border-blue-500/30">تعريف الماوس</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* STEP 2: شرح الهاك */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="mb-8">
          <div className="rounded-2xl p-6 md:p-8 bg-[#0a1a5c]/40 backdrop-blur-md border border-blue-500/20 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="flex gap-5 items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                <Gamepad2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">ثم شرح تشغيل الهاك</h3>
                <p className="text-blue-200/60 leading-relaxed text-lg">بعد تركيب التعريفات، شاهد هذا الشرح لتشغيل هاك فورت نايت 👇</p>
              </div>
            </div>
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><span className="text-blue-400">👇</span> شرح تشغيل الهاك</h4>
            <div className="flex flex-col lg:flex-row-reverse gap-4 items-stretch">
              <div className="flex-1 rounded-xl overflow-hidden border border-blue-500/20 shadow-2xl">
                <video controls controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} className="w-full h-full object-cover" preload="metadata">
                  <source src="/video-fort-hack.mp4" type="video/mp4" />
                  متصفحك لا يدعم تشغيل الفيديو
                </video>
              </div>
              <motion.button
                onContextMenu={(e) => e.preventDefault()}
                onClick={() => handleProtectedDownload('External_T3N.rar', 'External_T3N.rar')}
                whileHover={{ scale: 1.03, boxShadow: '0 0 35px rgba(99,102,241,0.45)' }}
                whileTap={{ scale: 0.97 }}
                className="lg:w-48 flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-gradient-to-b from-indigo-600/30 to-indigo-900/50 border border-indigo-500/40 hover:border-indigo-400 transition-all shadow-[0_0_25px_rgba(99,102,241,0.2)] select-none cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-[0_0_25px_rgba(99,102,241,0.6)]">
                  <Download className="w-7 h-7 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-white font-black text-base leading-tight">External_T3N</p>
                  <p className="text-indigo-300/70 text-xs font-bold mt-1">اضغط للتحميل</p>
                </div>
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black px-3 py-1 rounded-full border border-indigo-500/30">ملف الهاك</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* استلام الرتبة */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8">
          <div className="rounded-2xl p-6 md:p-8 bg-[#5865F2]/10 backdrop-blur-md border border-[#5865F2]/30 text-center shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <MessageCircle className="w-12 h-12 text-[#5865F2] mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">مافهمت شي؟</h3>
            <p className="text-blue-200/60 mb-6 max-w-md mx-auto">حياك سيرفر الديسكورد، فريق الدعم الفني متواجد لمساعدتك خطوة بخطوة.</p>
            <div className="flex justify-center">
              <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer"
                className="px-8 py-4 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold rounded-2xl text-lg transition-all shadow-[0_0_20px_rgba(88,101,242,0.4)] flex items-center gap-3 justify-center w-full sm:w-auto hover:scale-105 active:scale-95">
                <ExternalLink className="w-5 h-5" /> دخول سيرفر الديسكورد
              </a>
            </div>
          </div>
        </motion.div>

        {/* Back */}
        <div className="mt-8 text-center pb-12">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClose}
            className="px-8 py-3 bg-white/10 text-white rounded-xl border border-white/10 hover:bg-white/20 transition-all font-bold">
            الرجوع للصفحة الرئيسية
          </motion.button>
        </div>
      </div>
    </motion.div>,
    document.body
  );
}

// =============================================
// 🔧 Troubleshoot Guide
// =============================================
function TroubleshootGuide({ onClose }: { onClose: () => void }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return createPortal(
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ backgroundColor: '#030000' }} />
      <div className="fixed inset-0 z-0 pointer-events-none opacity-80" style={{ background: 'radial-gradient(60% 60% at 50% 100%, rgba(200, 10, 10, 0.6) 0%, transparent 100%)' }} />
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, #000000 0%, rgba(0,0,0,0.8) 20%, transparent 60%)' }} />
      <div className="fixed inset-0 z-0 bg-black/40 pointer-events-none" />

      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-black/60 border-b border-red-500/30">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="T3N" className="w-10 h-10 object-contain rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.3)]" />
            <span className="font-bold text-xl text-white">حل مشاكل السبوفر</span>
          </div>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-red-500/30 hover:text-red-400 transition-all border border-white/20">
            <X className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-5xl relative z-10 flex flex-col items-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center w-full mb-16">
          <div className="w-24 h-24 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <HelpCircle className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white drop-shadow-xl">شروحات حل المشاكل</h1>
          <p className="text-red-200/80 text-xl font-bold max-w-2xl mx-auto leading-relaxed">هنا تجد جميع الحلول والفيديوهات لحل أي مشكلة قد تواجهك أثناء تطبيق السبوفر</p>
        </motion.div>

        <div className="w-full grid gap-8">
          {[
            { num: 1, title: 'حل مشكلة خطأ الوقت', q: 'هل تظهر لك رسالة خطأ الوقت الموضحة بالصورة؟', img: '/error-time.png', vid: '/video-solution-time.mp4', alt: 'خطأ الوقت' },
            { num: 2, title: 'إيبك قيمز لا يعمل أو لا يحمل؟', q: 'هل تواجه مشكلة في تشغيل إيبك قيمز أو عدم قدرتة على التحميل بعد تطبيق الشرح؟', img: '/error-epic.png', vid: '/video-solution-epic.mp4', alt: 'مشكلة إيبك' },
            { num: 3, title: 'خطأ في الشبكة أو كلام أزرق؟', q: 'هل عند تشغيل السبوفر يطفى فجأة أو يظهر لك خطأ بالشبكة؟', img: '/error-network.png', vid: '/video-solution-network.mp4', alt: 'خطأ الشبكة' },
            { num: 4, title: 'خطأ في تعريفات DLL', q: 'هل تظهر لك رسالة خطأ تقول أن ملف DLL غير موجود مثل SDL3.dll أو ما شابهها؟', img: '/error-dll.png', vid: '', alt: 'خطأ DLL' },
          ].map(({ num, title, q, img, vid, alt }) => (
            <motion.div key={num} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: num * 0.1 }}
              className="bg-[#0a0a0f]/80 backdrop-blur-md p-6 lg:p-10 rounded-[2rem] border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)] flex flex-col items-center">
              <div className="flex gap-4 items-center mb-8 bg-red-500/10 px-6 py-3 rounded-2xl border border-red-500/20">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white font-bold text-lg">{num}</span>
                <h3 className="text-2xl md:text-3xl font-bold text-white">{title}</h3>
              </div>
              <p className="text-zinc-300 text-xl font-medium mb-6 leading-relaxed text-center">{q}</p>
              <div className="rounded-2xl overflow-hidden border-2 border-white/10 shadow-lg mb-8 max-w-2xl w-full cursor-zoom-in relative group" onClick={() => setSelectedImage(img)}>
                <img src={img} alt={alt} className="w-full h-auto object-cover opacity-90 group-hover:scale-[1.02] transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-black/80 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm"><Maximize2 className="w-4 h-4" /> انقر لتكبير</span>
                </div>
              </div>
              <div className="w-full max-w-3xl flex items-center gap-4 mb-8 opacity-90">
                <span className="h-[2px] flex-1 bg-gradient-to-l from-red-500 to-transparent"></span>
                <span className="text-red-400 font-bold flex items-center gap-2 text-xl"><CheckCircle2 className="w-7 h-7" /> {vid ? 'إليك الحل بالفيديو 👇' : 'الحل 👇'}</span>
                <span className="h-[2px] flex-1 bg-gradient-to-r from-red-500 to-transparent"></span>
              </div>
              {vid && (
                <div className="w-full max-w-4xl rounded-3xl overflow-hidden border-2 border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.2)] bg-black">
                  <video controls controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} className="w-full aspect-video outline-none" preload="metadata">
                    <source src={vid} type="video/mp4" />متصفحك لا يدعم تشغيل الفيديو
                  </video>
                </div>
              )}

              {num === 3 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-10 w-full">
                  <a href="https://downloads.cloudflareclient.com/v1/download/windows/ga" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-4 py-3 px-5 rounded-2xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 hover:border-blue-400 hover:bg-blue-600/30 transition-all group shadow-[0_8px_30px_rgba(37,99,235,0.15)] w-full">
                    <div className="w-12 h-12 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-lg group-hover:rotate-6 transition-transform">
                      <img src="/warp-icon.png" alt="WARP" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Recommended</span>
                        <h4 className="text-white font-black text-lg tracking-tight">برنامج WARP</h4>
                      </div>
                      <p className="text-blue-200/70 text-sm font-bold leading-tight">اضغط هنا لتحميل البرنامج لحل مشكلة الشبكة</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-all shrink-0">
                      <Download className="w-5 h-5" />
                    </div>
                  </a>
                  <div className="mt-4 flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl px-5 py-4">
                    <span className="text-yellow-400 text-xl shrink-0 mt-0.5">⚠️</span>
                    <p className="text-yellow-200/90 text-sm font-bold leading-relaxed text-right">
                      <span className="text-yellow-400 font-black">تنبيه: </span>اذا ما ضبط معك، لازم وقتها تفرمت فلاشة USB أو فورمات عادي من نفس ويندوز، وبعد الفورمات تأكد من المشكلة إذا راحت.
                    </p>
                  </div>
                </motion.div>
              )}

              {num === 4 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8 w-full flex flex-col gap-4">
                  <p className="text-zinc-300 text-base font-bold text-center mb-2">حمّل وثبّت هذين البرنامجين بالترتيب لحل المشكلة:</p>
                  <a href="https://aka.ms/vc14/vc_redist.x64.exe" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-4 py-3 px-5 rounded-2xl bg-gradient-to-r from-purple-600/20 to-purple-800/20 border border-purple-500/30 hover:border-purple-400 hover:bg-purple-600/20 transition-all group shadow-[0_8px_30px_rgba(147,51,234,0.1)] w-full">
                    <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-all">
                      <Download className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-right">
                      <h4 className="text-white font-black text-base tracking-tight">Visual C++ Redistributable</h4>
                      <p className="text-purple-200/70 text-xs font-bold">تعريفات VC++ الأساسية — ابدأ بهذا</p>
                    </div>
                    <span className="bg-purple-500/30 text-purple-300 text-[10px] font-black px-2 py-1 rounded-full shrink-0">1</span>
                  </a>
                  <a href="https://dotnet.microsoft.com/en-us/download/dotnet-framework/thank-you/net48-web-installer" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-4 py-3 px-5 rounded-2xl bg-gradient-to-r from-indigo-600/20 to-indigo-800/20 border border-indigo-500/30 hover:border-indigo-400 hover:bg-indigo-600/20 transition-all group shadow-[0_8px_30px_rgba(99,102,241,0.1)] w-full">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-all">
                      <Download className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-right">
                      <h4 className="text-white font-black text-base tracking-tight">.NET Framework 4.8</h4>
                      <p className="text-indigo-200/70 text-xs font-bold">إطار عمل دوت نت — ثانياً</p>
                    </div>
                    <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-black px-2 py-1 rounded-full shrink-0">2</span>
                  </a>
                  <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl px-5 py-4">
                    <span className="text-yellow-400 text-xl shrink-0 mt-0.5">⚠️</span>
                    <p className="text-yellow-200/90 text-sm font-bold leading-relaxed text-right">
                      <span className="text-yellow-400 font-black">تنبيه: </span>بعد التثبيت أعد تشغيل الجهاز، ثم شغّل البرنامج مجدداً.
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Support */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-16 text-center w-full max-w-2xl bg-blue-500/10 backdrop-blur-md p-8 rounded-3xl border border-blue-500/30">
          <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center justify-center gap-2"><MessageCircle className="w-6 h-6" /> ما زلت تواجه مشكلة؟</h3>
          <p className="text-zinc-300 leading-relaxed text-lg mb-6">توجه إلى الديسكورد وافتح تذكرة دعم فني وسيقوم الفريق بتقديم المساعدة الكاملة.</p>
          <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
            الانتقال إلى سيرفر الديسكورد <ExternalLink className="w-5 h-5" />
          </a>
        </motion.div>

        <div className="mt-10 text-center pb-12">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClose}
            className="px-8 py-3 bg-white/10 text-white rounded-xl border border-white/10 hover:bg-white/20 transition-all font-bold">
            الرجوع للصفحة الرئيسية
          </motion.button>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[100000] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out backdrop-blur-md">
            <button className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-red-500/20 border border-white/20" onClick={() => setSelectedImage(null)}>
              <X className="w-6 h-6" />
            </button>
            <motion.img initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} src={selectedImage} alt="صورة مكبرة" className="max-w-full max-h-full object-contain rounded-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>,
    document.body
  );
}

function Footer() {
  return (
    <footer className="py-12 border-t border-white/5 container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
      <div className="flex items-center gap-3">
        <img src={LOGO_URL} className="w-10 h-10 object-contain rounded-lg" alt="" />
        <span className="font-black text-xl text-white">تعن T3N</span>
      </div>
      <div className="flex gap-8 text-zinc-500 text-sm font-bold">
        <a href={STORE_URL} target="_blank" className="hover:text-white transition-colors">المتجر</a>
        <a href={DISCORD_URL} target="_blank" className="hover:text-white transition-colors">الديسكورد</a>
        <a href="#" className="hover:text-white transition-colors">الدعم الفني</a>
      </div>
      <p className="text-zinc-600 text-xs font-bold">© 2025 تعن T3N — جميع الحقوق محفوظة</p>
    </footer>
  );
}

// ==========================================
// ⚙️ Main Application
// ==========================================

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showKeyManagement, setShowKeyManagement] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  
  const [activationResult, setActivationResult] = useState<any>(null);
  const [activationLoading, setActivationLoading] = useState(false);
  const [showSpooferGuide, setShowSpooferGuide] = useState(false);
  const [showFortniteGuide, setShowFortniteGuide] = useState(false);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  // Discord Auth: capture ?token= from URL after redirect from /api/discord-auth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      // Clean the URL immediately
      window.history.replaceState(null, '', window.location.pathname);
      // Sign in with the custom token from our backend
      signInWithCustomToken(auth, token)
        .then(async (result) => {
          console.log('[T3N] Discord login successful via custom token');
          // Save/update user profile in Firestore
          const user = result.user;
          const { doc, setDoc, getDoc, runTransaction } = await import('firebase/firestore');
          const { db } = await import('./lib/firebase');
          const userRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userRef);
          const existingData = snap.data();
          
          let assignedId = existingData?.assignedId;
          if (!assignedId) {
            try {
              assignedId = await runTransaction(db, async (transaction: any) => {
                const counterRef = doc(db, 'counters', 'users');
                const counterSnap = await transaction.get(counterRef);
                let newCount = 1;
                if (counterSnap.exists()) {
                  newCount = (counterSnap.data().count || 0) + 1;
                }
                transaction.set(counterRef, { count: newCount }, { merge: true });
                return newCount;
              });
            } catch (e) { console.error('ID Transaction failed:', e); }
          }

          await setDoc(userRef, {
            displayName: user.displayName || existingData?.displayName || 'مستخدم',
            photoURL: user.photoURL || existingData?.photoURL || null,
            email: user.email || existingData?.email || null,
            provider: 'discord',
            lastLoginAt: new Date().toISOString(),
            ...(assignedId ? { assignedId } : {}),
            ...(!snap.exists() ? { isVIP: false, createdAt: new Date().toISOString() } : {})
          }, { merge: true });
        })
        .catch((err) => {
          console.error('[T3N] Custom token sign-in failed:', err);
        });
    }
  }, []);

  // Auth state + site visits + notifications
  useEffect(() => {
    trackSiteVisit();
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const profile = await getUserData(currentUser.uid);
        setUserProfile(profile);
        const isAdm = await checkIsAdmin(currentUser.email, profile?.assignedId, currentUser.displayName);
        setIsAdminUser(isAdm);
      } else {
        setUserProfile(null);
        setIsAdminUser(false);
      }
      setAuthLoading(false);
    });
    
    const unsubNotifs = listenToNotifications((notifs) => {
      setNotifications(notifs);
      setUnreadNotifs(notifs.filter(n => !n.read).length);
    });

    return () => { unsubAuth(); unsubNotifs(); };
  }, []);

  const handleLogin = async () => {
    try {
      setAuthLoading(true);
      await loginWithDiscord();
      setShowLoginModal(false);
    } catch (e) { console.error(e); } finally { setAuthLoading(false); }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setUserProfile(null);
    setIsAdminUser(false);
  };

  const handleActivate = async (keyId: string) => {
    if (!user) { setShowLoginModal(true); return; }
    setActivationLoading(true);
    setActivationResult(null);
    try {
      const res = await activateKey(keyId.trim(), user.uid, user.email || '', {
        displayName: user.displayName,
        photoURL: user.photoURL,
        provider: 'discord'
      });
      setActivationResult(res);
      if (res.success && res.activatedProducts) {
        setUserProfile((prev: any) => ({
          ...prev,
          isVIP: true,
          activatedProducts: res.activatedProducts
        }));
      } else {
        const profile = await getUserData(user.uid);
        setUserProfile(profile);
      }
    } catch (e: any) {
      setActivationResult({ success: false, error: e.message || 'حدث خطأ غير متوقع' });
    } finally { setActivationLoading(false); }
  };

  return (
    <div className="min-h-screen">
      <Navbar 
        user={user} 
        userProfile={userProfile} 
        onLogin={() => setShowLoginModal(true)} 
        onLogout={handleLogout} 
        authLoading={authLoading}
        isAdminUser={isAdminUser}
        notifications={notifications}
        unreadCount={unreadNotifs}
        onReadNotifications={() => setUnreadNotifs(0)}
        setShowSpooferGuide={setShowSpooferGuide}
        setShowFortniteGuide={setShowFortniteGuide}
        setShowTroubleshoot={setShowTroubleshoot}
      />
      
      <main>
        <Hero />
        <ActivationGateway 
          user={user} 
          onLogin={() => setShowLoginModal(true)} 
          onActivate={handleActivate}
          loading={activationLoading}
          result={activationResult}
          onReset={() => setActivationResult(null)}
          onShowGuide={(type: string) => {
            setShowSpooferGuide(true);
          }}
        />
        <Rules />
      </main>
      
      <Footer />

      {/* Floating Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-[90]">
        <motion.a whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} href={DISCORD_URL} target="_blank" className="w-14 h-14 rounded-full bg-[#5865F2] flex items-center justify-center text-white shadow-2xl"><MessageCircle className="w-7 h-7" /></motion.a>
        {isAdminUser && (
          <div className="flex flex-col gap-4">
            <motion.button whileHover={{ scale: 1.1 }} onClick={() => setShowAdminDashboard(true)} className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center text-white shadow-2xl"><LayoutDashboard /></motion.button>
            <motion.button whileHover={{ scale: 1.1 }} onClick={() => setShowKeyManagement(true)} className="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-2xl"><Key /></motion.button>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} onLogin={handleLogin} loading={authLoading} />}
        {showAdminDashboard && <AdminDashboard onClose={() => setShowAdminDashboard(false)} />}
        {showKeyManagement && <KeyManagement onClose={() => setShowKeyManagement(false)} />}
        {showSpooferGuide && <SpooferGuide onClose={() => setShowSpooferGuide(false)} user={user} />}
        {showFortniteGuide && <FortniteGuide onClose={() => setShowFortniteGuide(false)} user={user} />}
        {showTroubleshoot && <TroubleshootGuide onClose={() => setShowTroubleshoot(false)} />}
      </AnimatePresence>
    </div>
  );
}
