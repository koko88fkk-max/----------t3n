import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  MessageCircle, 
  ChevronDown, 
  Hash, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Gamepad2, 
  Cpu, 
  Wrench,
  Bell,
  List,
  X,
  Play,
  Info,
  Download,
  ShieldCheck,
  ExternalLink,
  History,
  Settings,
  LogOut,
  User,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import AdminComponents from './AdminComponents';
import LoginModal from './LoginModal';

const STORE_URL = "https://t3n-store.com";
const DISCORD_URL = "https://discord.gg/t3n";

function App() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProductMenu, setShowProductMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showSpooferGuide, setShowSpooferGuide] = useState(false);
  const [showFortniteGuide, setShowFortniteGuide] = useState(false);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  const [activationResult, setActivationResult] = useState<any>(null);
  const [activationLoading, setActivationLoading] = useState(false);
  
  const productMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, 'users', u.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
        } else {
          const newProfile = {
            uid: u.uid,
            email: u.email,
            displayName: u.displayName,
            photoURL: u.photoURL,
            isVIP: false,
            activatedProducts: [],
            createdAt: new Date().toISOString()
          };
          await setDoc(docRef, newProfile);
          setUserProfile(newProfile);
        }

        // Listen for notifications
        const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(10));
        const unsubNotif = onSnapshot(q, (snapshot) => {
          setNotifications(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsubNotif();
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setShowLoginModal(false);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleActivate = async (key: string) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setActivationLoading(true);
    try {
      const res = await fetch('/api/activate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, userId: user.uid })
      });
      const data = await res.json();
      setActivationResult(data);
      if (data.success) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        setUserProfile(docSnap.data());
      }
    } catch (error) {
      setActivationResult({ success: false, message: "حدث خطأ في الاتصال بالخادم" });
    } finally {
      setActivationLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-blue-500/20 rounded-full animate-ping" />
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-white/5 bg-[#050508]/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between relative">
          {/* Right Side: User & Actions */}
          <div className="flex items-center gap-4">
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 hover:bg-white/5 rounded-xl transition-colors relative group"
              >
                <Bell className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#050508]" />
                )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-[#0e0e1a] border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden z-[110]"
                  >
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                      <h3 className="font-bold text-sm">الإشعارات</h3>
                      <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">جديد</span>
                    </div>
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
                
                <div 
                  className="relative" 
                  ref={productMenuRef}
                  onMouseEnter={() => setShowProductMenu(true)}
                  onMouseLeave={() => setShowProductMenu(false)}
                >
                  <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold rounded-full shadow-lg transition-all border border-emerald-500/30">
                    <motion.div
                      animate={{ rotate: showProductMenu ? 90 : 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <List className="w-4 h-4" />
                    </motion.div>
                    <span className="text-xs">اختيار المنتج</span>
                    <motion.div
                      animate={{ rotate: showProductMenu ? 180 : 0, y: showProductMenu ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {showProductMenu && (
                      <motion.div 
                        initial={{ opacity: 0, y: 15, scale: 0.95 }} 
                        animate={{ opacity: 1, y: 0, scale: 1 }} 
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-3 w-48 bg-[#0e0e1a]/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden z-[110]"
                      >
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
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <h1 className="text-xl font-black tracking-tighter text-white">T3N <span className="text-blue-500">STUDIO</span></h1>
              <p className="text-[10px] text-zinc-500 font-bold tracking-[0.2em] uppercase">Premium Services</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.3)]">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
            >
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">أهلاً بك في الجيل الجديد من الخدمات</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9]"
            >
              ارتقِ بتجربتك <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500">إلى مستوى آخر</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              نقدم لك أفضل الحلول والخدمات التقنية بأعلى جودة وأمان. انضم إلينا الآن واستمتع بمميزات حصرية لا مثيل لها.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button 
                onClick={() => document.getElementById('activation')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:shadow-[0_20px_40px_rgba(37,99,235,0.5)] hover:-translate-y-1 w-full sm:w-auto"
              >
                بوابة الاستلام
              </button>
              <a 
                href={STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl transition-all border border-white/10 backdrop-blur-sm w-full sm:w-auto"
              >
                تصفح المتجر
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Activation Section */}
      <section id="activation" className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4">بوابة التفعيل</h2>
              <p className="text-zinc-500">أدخل مفتاح المنتج الخاص بك لتفعيله والارتباط بحسابك</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Activation Form */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="glass-panel p-8 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-2xl relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-colors" />
                
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
                    <Zap className="w-7 h-7 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">تفعيل المفتاح</h3>
                  <p className="text-zinc-500 text-sm mb-8">أدخل الكود المكون من 12 رمزاً لاستلام منتجك فوراً</p>

                  <div className="space-y-4">
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="T3N-XXXXXX-XXXXXX"
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-center font-mono tracking-widest focus:outline-none focus:border-blue-500/50 transition-colors"
                        onChange={(e) => setActivationResult(null)}
                        id="keyInput"
                      />
                    </div>
                    <button 
                      onClick={() => {
                        const input = document.getElementById('keyInput') as HTMLInputElement;
                        handleActivate(input.value);
                      }}
                      disabled={activationLoading}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                    >
                      {activationLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                      تفعيل المنتج الآن
                    </button>
                  </div>

                  <AnimatePresence>
                    {activationResult && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-6 p-4 rounded-xl border flex items-center gap-3 ${
                          activationResult.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}
                      >
                        {activationResult.success ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <p className="text-sm font-bold">{activationResult.message}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Video Guide */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="glass-panel p-8 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-2xl relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition-colors" />
                
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
                    <Play className="w-7 h-7 text-purple-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">فيديو الشرح</h3>
                  <p className="text-zinc-500 text-sm mb-8">شاهد هذا المقطع لمعرفة كيفية استلام المنتج وتفعيله خطوة بخطوة</p>

                  <div className="aspect-video rounded-2xl overflow-hidden bg-black/40 border border-white/10 relative group/video cursor-pointer">
                    <img src="/site-guide-poster.jpg" alt="Guide Poster" className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-white fill-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {showLoginModal && (
          <LoginModal 
            onClose={() => setShowLoginModal(false)} 
            onLogin={handleLogin} 
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="container mx-auto px-6 text-center">
          <p className="text-zinc-500 text-sm font-bold">© 2026 T3N STUDIO. جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
