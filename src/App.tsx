import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, MessageCircle, ShieldAlert, Download, CheckCircle2, Star, 
  ExternalLink, AlertTriangle, ChevronDown, Gamepad2, X, LogIn, LogOut, 
  MonitorPlay, Maximize2, Copy, Check, LayoutDashboard, Users, Clock, 
  RefreshCw, Mail, Hash, Trash2, UserX, ShieldOff, Crown, Key, Plus, Ban, 
  Snowflake, Play, Search, Bell, List, Crosshair, Cpu, Shield, HelpCircle
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

function Navbar({ user, userProfile, onLogin, onLogout, authLoading, isAdminUser, unreadCount, notifications, onReadNotifications }: any) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifPopup, setShowNotifPopup] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setShowNotifPopup(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <motion.nav 
      initial={{ y: -100 }} animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-[100] glass border-b border-white/5"
    >
      <div className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
        {/* Right side: User Info */}
        <div className="flex items-center gap-4">
          {!authLoading && (
            user ? (
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                <img src={user.photoURL || ''} className="w-8 h-8 rounded-full border border-blue-500/30" alt="" />
                <div className="flex flex-col items-start leading-none">
                  <span className="text-white text-xs font-bold">{user.displayName || 'koz'}</span>
                  <span className="text-blue-400 text-[10px] font-bold">ID: {getNumericId(user.uid, userProfile?.assignedId)}</span>
                </div>
                <button onClick={onLogout} className="p-1.5 hover:bg-red-500/20 rounded-full transition-all text-zinc-400 hover:text-red-400"><LogOut className="w-4 h-4" /></button>
              </div>
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
        </div>

        {/* Center: Nav Links */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-bold text-zinc-400">
          <a href="#delivery" className="hover:text-blue-400 transition-colors">استلام الطلبات</a>
          <a href="#products" className="hover:text-blue-400 transition-colors">المنتجات</a>
          <a href="#reviews" className="hover:text-blue-400 transition-colors">التقييمات</a>
          <a href="#faq" className="hover:text-blue-400 transition-colors">الأسئلة الشائعة</a>
          <a href="#rules" className="hover:text-blue-400 transition-colors">القوانين</a>
        </div>

        {/* Left Side: Logo */}
        <div className="flex items-center gap-3">
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
            <a href="#products" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-white">المنتجات</a>
            <a href="#reviews" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-white">التقييمات</a>
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
              onClick={() => document.getElementById('delivery')?.scrollIntoView({ behavior: 'smooth' })}
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

function Products() {
  return (
    <section id="products" className="py-24 container mx-auto px-6">
      <div className="text-center mb-16">
        <span className="text-blue-500 font-bold text-xs tracking-widest uppercase">CATALOGUE</span>
        <h2 className="text-4xl font-black text-white mt-2 mb-4">منتجاتنا الحصرية</h2>
        <p className="text-zinc-500 max-w-xl mx-auto">تشكيلة مختارة من أفضل المنتجات الرقمية المصممة لتعطيك الأفضلية</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Card 1 */}
        <motion.div whileHover={{ y: -10 }} className="glass rounded-[32px] overflow-hidden border border-white/5 flex flex-col group">
          <div className="h-64 bg-gradient-to-br from-blue-900/20 to-black relative flex items-center justify-center p-8 overflow-hidden">
            <span className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse z-10">الأكثر طلباً 🔥</span>
            <Gamepad2 className="w-32 h-32 text-blue-500/20 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay group-hover:opacity-100 opacity-0 transition-opacity" />
          </div>
          <div className="p-8">
            <h3 className="text-2xl font-black text-white mb-3">هاك فورت نايت</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">أفضل وأأمن هاك لفورت نايت بمميزات حصرية وتحديثات مستمرة للحماية من الباند. العب أمن واحترافي.</p>
            <div className="flex gap-3">
              <a href={STORE_URL} target="_blank" className="btn-primary flex-1 py-3 rounded-xl font-bold text-center flex items-center justify-center gap-2">🔗 شراء الآن</a>
              <button className="btn-ghost flex-1 py-3 rounded-xl font-bold">تفاصيل المنتج</button>
            </div>
          </div>
        </motion.div>
        
        {/* Card 2 */}
        <motion.div whileHover={{ y: -10 }} className="glass rounded-[32px] overflow-hidden border border-white/5 flex flex-col group">
          <div className="h-64 bg-gradient-to-br from-blue-900/20 to-black relative flex items-center justify-center p-8 overflow-hidden">
            <span className="absolute top-4 right-4 bg-yellow-500 text-black text-[10px] font-black px-3 py-1 rounded-full z-10">الإصدار الذهبي ⭐</span>
            <Gamepad2 className="w-32 h-32 text-blue-500/20 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay group-hover:opacity-100 opacity-0 transition-opacity" />
          </div>
          <div className="p-8">
            <h3 className="text-2xl font-black text-white mb-3">السبوفر المتميز</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">أقوى أداة سبوفر تدعم جميع المذريودات وحمايات الألعاب. استعمال مرة واحدة لفك الحظر نهائياً بضمان كامل.</p>
            <div className="flex gap-3">
              <a href={STORE_URL} target="_blank" className="btn-primary flex-1 py-3 rounded-xl font-bold text-center flex items-center justify-center gap-2">🔗 شراء الآن</a>
              <button className="btn-ghost flex-1 py-3 rounded-xl font-bold">تفاصيل المنتج</button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ActivationGateway({ user, onLogin, onActivate, loading, result }: any) {
  const [keyInput, setKeyInput] = useState('');

  return (
    <section id="delivery" className="py-24 bg-white/[0.02] border-y border-white/5">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mb-4">بوابة التفعيل</h2>
          <p className="text-zinc-500">من هنا يمكنك تفعيل مفاتيحك للارتباط بحسابك واستلام منتجك</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left Card: Video */}
          <div className="glass rounded-[32px] p-8 border border-white/5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400"><MonitorPlay className="w-6 h-6" /></div>
              <div><h3 className="text-xl font-black text-white">فيديو الشرح</h3><p className="text-zinc-500 text-sm">شاهد هذا المقطع لمعرفة كيفية استلام المنتج</p></div>
            </div>
            <CustomVideoPlayer />
          </div>

          {/* Right Card: Activation */}
          <div className="glass rounded-[32px] p-8 border border-white/5 flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]"><Key className="w-6 h-6" /></div>
              <div><h3 className="text-xl font-black text-white">تفعيل المفتاح</h3><p className="text-zinc-500 text-sm">أدخل مفتاح المنتج المكون من 12 رمزاً</p></div>
            </div>
            
            <p className="text-zinc-400 text-sm leading-relaxed mb-8">أدخل مفتاح المنتج الخاص بك لاستلام مشترياتك فوراً. يرجى تسجيل الدخول باستخدام ديسكورد.</p>
            
            {user ? (
              <div className="mb-6 py-2 px-4 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold w-fit">مسجّل دخول: {user.displayName} 🌙</div>
            ) : (
              <button onClick={onLogin} className="mb-6 py-3 px-6 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold hover:bg-blue-500/20 transition-all flex items-center gap-2"><LogIn className="w-4 h-4" /> يجب تسجيل الدخول أولاً</button>
            )}

            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="T3N-XXXXXX-XXXXXX" 
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 px-6 text-white font-mono text-center tracking-[4px] focus:outline-none focus:border-blue-500/50 transition-all" 
              />
              <button 
                onClick={() => onActivate(keyInput)}
                disabled={loading || !user}
                className="w-full btn-primary py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Key className="w-5 h-5" /> تفعيل المفتاح</>}
              </button>
            </div>
            
            {result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 p-4 rounded-xl border ${result.success ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'} text-sm font-bold text-center`}>
                {result.message || result.error}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Reviews() {
  const reviewImages = [
    '0092536c-2359-46e6-9687-68bd8a63ab2a.jpg','148a0680-d94f-4872-8edc-baae55fb99c3.png',
    '15b5fba4-c8cd-410a-ba44-a40b387006be.jpg','1cf6fde4-f699-48c1-b138-62b31d85481e.png',
    '1edfc461-eafa-4876-9be9-de6b668c0410.jpg','3db92eae-f863-4bf2-b642-b1a7065e6141.jpg',
    '5766c4f7-aabf-4859-a93f-809699dde917.jpg','666acf6b-07d4-4764-84ec-7ed1886e0dd7.jpg',
    '6d44bcab-1467-4c02-bb58-6ac082c30616.png','6d8059c1-8fb0-4374-8825-72ef42b4e67a.jpg',
    '8801a17d-01f2-4f58-9810-2155bc2ebdd2.jpg','93081051-6699-465a-a156-0f1d15b01a5a.jpg',
    'a06a962f-6c53-488c-a8c8-af98e10ce1a7.jpg','d4c3fce5-32ea-4b0d-af20-f64fe1b66b8d.jpg',
    'ef94177f-cb9c-42b1-8f54-995b3c33385d.jpg','f6cfed1a-8c23-41d9-85f7-e1d33961e2b8.jpg',
  ];
  return (
    <section id="reviews" className="py-24 container mx-auto px-6">
      <div className="text-center mb-12">
        <div className="flex justify-center gap-2 mb-4">{[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />)}</div>
        <h2 className="text-4xl font-black text-white mb-2">آراء العملاء</h2>
        <p className="text-zinc-500">تقييمات حقيقية من عملائنا الكرام</p>
      </div>
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 max-w-6xl mx-auto">
        {reviewImages.map((img, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="mb-4 break-inside-avoid">
            <img src={`/reviews/${img}`} className="w-full rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all hover:scale-[1.02] pointer-events-auto" alt={`تقييم ${i+1}`} style={{pointerEvents:'auto'}} />
          </motion.div>
        ))}
      </div>
      <div className="text-center mt-10">
        <a href={STORE_URL} target="_blank" className="btn-primary px-8 py-4 rounded-2xl font-bold inline-flex items-center gap-2">عرض المزيد من التقييمات</a>
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
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleMsg, setRoleMsg] = useState('');
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
      className="fixed inset-0 z-[9999] overflow-y-auto"
      style={{ background: 'radial-gradient(ellipse at center, #0a1a5c 0%, #040c2e 50%, #020618 100%)' }}
    >
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(59,130,246,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.4) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

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

        {/* استلام الرتبة */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mb-8">
          <div className="rounded-2xl p-6 md:p-8 bg-[#5865F2]/10 backdrop-blur-lg border border-[#5865F2]/30 text-center">
            <MessageCircle className="w-12 h-12 text-[#5865F2] mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">استلام رتبة الديسكورد</h3>
            <p className="text-blue-200/60 mb-6">اضغط الزر أدناه لربط حسابك وإعطائك الرتبة في سيرفر تعن T3N</p>
            {roleMsg && <p className="mb-4 font-bold text-lg" style={{ color: roleMsg.startsWith('✅') ? '#34d399' : '#f87171' }}>{roleMsg}</p>}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAssignRole} disabled={roleLoading}
                className="px-8 py-4 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold rounded-2xl text-lg transition-all shadow-[0_0_20px_rgba(88,101,242,0.4)] disabled:opacity-60 flex items-center gap-2 justify-center">
                {roleLoading ? <><RefreshCw className="w-5 h-5 animate-spin" /> جاري الربط...</> : <><MessageCircle className="w-5 h-5" /> استلام الرتبة</>}
              </motion.button>
              <a href={DISCORD_URL} target="_blank"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-lg transition-all border border-white/10 flex items-center gap-2 justify-center">
                <ExternalLink className="w-5 h-5" /> دخول السيرفر
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
      const profile = await getUserData(user.uid);
      setUserProfile(profile);
      if (res.success) {
        setTimeout(() => setShowSpooferGuide(true), 800);
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
      />
      
      <main>
        <Hero />
        <ActivationGateway 
          user={user} 
          onLogin={() => setShowLoginModal(true)} 
          onActivate={handleActivate}
          loading={activationLoading}
          result={activationResult}
        />
        <Products />
        <Reviews />
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
      </AnimatePresence>
      {/* VIP shortcut button */}
      {userProfile?.isVIP && !showSpooferGuide && (
        <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          onClick={() => setShowSpooferGuide(true)}
          className="fixed bottom-24 right-6 z-[89] flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-2xl text-sm transition-all border border-blue-400/30">
          <Cpu className="w-4 h-4" /> شرح السبوفر
        </motion.button>
      )}
    </div>
  );
}
