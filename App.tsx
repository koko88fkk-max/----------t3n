import React, { useState, useEffect } from 'react';
import { 
  Shield, Key, User, LogOut, Search, Users, Settings, 
  Trash2, Ban, Lock, Unlock, Eye, FileText, Sparkles, CheckCircle2, 
  AlertTriangle, Copy, ExternalLink, RefreshCw, Smartphone, ChevronRight, 
  MessageSquare, AlertCircle, LayoutDashboard, Package, Clock, ShieldAlert,
  Check, UserCheck, Activity, Database, KeyRound, ShoppingBag
} from 'lucide-react';
import { 
  loginWithGoogle, logout, checkIsAdmin, getAdminStats, 
  activateOrder, deleteOrder, banOrder, unbanOrder, 
  revokeUserProduct, saveUserAdminNotes, banUser, unbanUser, auth, db 
} from './lib/firebase.ts';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false);
  
  // Navigation Tabs: 'overview' | 'my_products' | 'profile' | 'admin'
  const [activeTab, setActiveTab] = useState<'overview' | 'my_products' | 'profile' | 'admin'>('overview');
  const [adminSubTab, setAdminSubTab] = useState<'logs' | 'users' | 'keys'>('logs');

  // Admin Data State
  const [adminData, setAdminData] = useState<{
    users: any[];
    orders: any[];
    banned: any[];
    logs: any[];
    totalUsers: number;
    vipUsers: number;
    totalOrders: number;
    bannedCount: number;
  }>({
    users: [],
    orders: [],
    banned: [],
    logs: [],
    totalUsers: 0,
    vipUsers: 0,
    totalOrders: 0,
    bannedCount: 0
  });

  // Admin Filters & Selected User States
  const [searchUser, setSearchUser] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userNote, setUserNote] = useState<string>('');
  const [searchKey, setSearchKey] = useState<string>('');

  // Key Activation Input State
  const [orderInput, setOrderInput] = useState<string>('');
  const [activationResult, setActivationResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Copy State
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Toast System
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({ show: false, msg: '', type: 'success' });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 4000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    showToast('تم نسخ المفتاح بنجاح!');
    setTimeout(() => setCopiedKey(null), 3000);
  };

  const fetchUserData = async (uid: string) => {
    try {
      const userRef = doc(db, "users", uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        setUserData(snap.data());
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserData(currentUser.uid);
        const adminStatus = await checkIsAdmin(currentUser.email);
        setIsAdminUser(adminStatus);
        if (adminStatus) {
          fetchAdminStats();
        }
      } else {
        setUserData(null);
        setIsAdminUser(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const stats = await getAdminStats();
      setAdminData(stats);
    } catch (err) {
      console.error('Failed to load admin stats', err);
    }
  };

  const handleOrderActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('يرجى تسجيل الدخول أولاً لتفعيل الطلب', 'error');
      return;
    }
    if (!orderInput.trim()) return;

    setIsSubmitting(true);
    setActivationResult(null);

    const res = await activateOrder(orderInput, user.uid, user.email || '');
    setIsSubmitting(false);

    if (res.success) {
      setActivationResult({ success: true, message: 'تم تفعيل رقم الطلب والمرتبط بحسابك بنجاح!' });
      showToast('تم تفعيل المنتج بنجاح!');
      setOrderInput('');
      fetchUserData(user.uid);
      if (isAdminUser) fetchAdminStats();
    } else {
      setActivationResult({ success: false, message: res.error || 'فشل التفعيل' });
    }
  };

  // Filtered Lists for Admin
  const filteredUsers = adminData.users.filter(u => 
    (u.email && u.email.toLowerCase().includes(searchUser.toLowerCase())) ||
    (u.displayName && u.displayName.toLowerCase().includes(searchUser.toLowerCase())) ||
    (u.uid && u.uid.includes(searchUser))
  );

  const filteredKeys = adminData.orders.filter(o => 
    (o.id && o.id.toLowerCase().includes(searchKey.toLowerCase())) ||
    (o.usedByEmail && o.usedByEmail.toLowerCase().includes(searchKey.toLowerCase()))
  );

  const handleSaveNotes = async () => {
    if (!selectedUser) return;
    await saveUserAdminNotes(selectedUser.uid, userNote);
    showToast('تم حفظ ملاحظات الإدارة بنجاح');
    fetchAdminStats();
    setSelectedUser((prev: any) => ({ ...prev, adminNotes: userNote }));
  };

  const handleRevokeProduct = async (orderId: string) => {
    if (!selectedUser) return;
    if (confirm(`هل أنت تأكد من إلغاء المنتج / المفتاح رقم (${orderId}) من العميل؟`)) {
      await revokeUserProduct(selectedUser.uid, orderId);
      showToast('تم إلغاء المنتج وسحبه من العميل');
      fetchAdminStats();
      setSelectedUser((prev: any) => ({
        ...prev,
        verifiedOrders: (prev.verifiedOrders || []).filter((o: any) => (typeof o === 'string' ? o !== orderId : o.orderId !== orderId))
      }));
    }
  };

  const handleToggleUserBan = async (u: any) => {
    if (u.banned) {
      await unbanUser(u.uid);
      showToast('تم إلغاء حظر المستخدم');
    } else {
      const reason = prompt('سبب الحظر:', 'مخالفة الشروط والأحكام');
      if (reason) {
        await banUser(u.uid, u.email, reason);
        showToast('تم حظر المستخدم بنجاح', 'error');
      }
    }
    fetchAdminStats();
  };

  // User Verified Keys List
  const userKeys: any[] = userData?.verifiedOrders || [];

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex font-sans dir-rtl">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl border shadow-2xl flex items-center gap-3 backdrop-blur-md transition-all ${
          toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' : 'bg-red-950/90 border-red-500/50 text-red-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
          <span className="font-semibold text-sm">{toast.msg}</span>
        </div>
      )}

      {/* ─── SIDEBAR NAVIGATION ─── */}
      <aside className="w-64 bg-[#080D1A] border-l border-slate-800/80 flex flex-col justify-between p-4 flex-shrink-0 min-h-screen">
        
        <div className="space-y-6">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="bg-sky-500/10 border border-sky-500/30 p-2 rounded-xl">
              <Shield className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider text-white">T3N STORE</h1>
              <p className="text-[10px] text-slate-500">بوابة خدمات تعن</p>
            </div>
          </div>

          {/* Clean Organized Navigation Menu */}
          <nav className="space-y-5 text-xs font-semibold">
            
            {/* Category 1: General */}
            <div className="space-y-1">
              <p className="px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">عام</p>
              <button 
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  activeTab === 'overview' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                نظرة عامة
              </button>
            </div>

            {/* Category 2: Licenses */}
            <div className="space-y-1">
              <p className="px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">التراخيص</p>
              <button 
                onClick={() => setActiveTab('my_products')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  activeTab === 'my_products' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Package className="w-4 h-4" />
                منتجاتي
              </button>
            </div>

            {/* Category 3: Account */}
            <div className="space-y-1">
              <p className="px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">الحساب</p>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  activeTab === 'profile' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <User className="w-4 h-4" />
                الملف الشخصي
              </button>

              {/* Admin Panel Button directly inside Account category right under Profile */}
              {isAdminUser && (
                <button 
                  onClick={() => setActiveTab('admin')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all mt-1 ${
                    activeTab === 'admin' ? 'bg-indigo-600/25 text-indigo-300 border border-indigo-500/40 font-bold' : 'text-indigo-400/90 hover:text-indigo-200 hover:bg-indigo-950/40'
                  }`}
                >
                  <Settings className="w-4 h-4 text-indigo-400" />
                  لوحة التحكم للإدارة
                </button>
              )}
            </div>

          </nav>
        </div>

        {/* Sidebar Bottom Profile Card */}
        <div className="pt-4 border-t border-slate-800/80">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-9 h-9 rounded-xl border border-sky-500/40 object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center font-bold text-sm">
                    {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{user.displayName || user.email?.split('@')[0]}</h4>
                  <p className="text-[10px] text-slate-400 truncate dir-ltr">{user.email}</p>
                </div>
              </div>

              <button 
                onClick={logout}
                className="w-full py-2 bg-red-950/30 hover:bg-red-900/50 border border-red-500/30 text-red-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                تسجيل الخروج
              </button>
            </div>
          ) : (
            <button 
              onClick={loginWithGoogle}
              className="w-full btn-primary py-2.5 text-xs font-bold"
            >
              <User className="w-4 h-4" />
              تسجيل الدخول
            </button>
          )}
        </div>

      </aside>

      {/* ─── MAIN CONTENT VIEW ─── */}
      <main className="flex-1 p-8 overflow-y-auto">

        {/* ─── TAB 1: OVERVIEW (نظرة عامة) ─── */}
        {activeTab === 'overview' && (
          <div className="space-y-8 max-w-5xl">
            
            <div className="glass-panel p-8 space-y-4 border-sky-500/20">
              <span className="bg-sky-500/10 border border-sky-500/20 text-sky-400 px-3 py-1 rounded-full text-xs font-bold">
                أهلاً بك في بوابة T3N
              </span>
              <h2 className="text-3xl font-black text-white">المنصة الرقمية المتكاملة لخدمات الألعاب وربط الحسابات</h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                مرحباً بك في منصتك الرسمية لتفعيل التراخيص، متابعة اشتراكاتك، والوصول الفوري للخدمات.
              </p>
            </div>

            {/* Quick Actions (إجراءات سريعة - مرتبة بدون مزامنة ديسكورد) */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">إجراءات سريعة</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => setActiveTab('my_products')}
                  className="glass-panel p-5 text-right space-y-2 border-slate-800 hover:border-sky-500/40 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">منتجاتي</h4>
                  <p className="text-[11px] text-slate-400">عرض المفاتيح والتفعيلات الخاصة بك</p>
                </button>

                <a 
                  href="https://discord.gg/t3n" 
                  target="_blank" 
                  rel="noreferrer"
                  className="glass-panel p-5 text-right space-y-2 border-slate-800 hover:border-sky-500/40 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">الانضمام للديسكورد</h4>
                  <p className="text-[11px] text-slate-400">الدعم الفني المباشر والتحديثات</p>
                </a>

                <a 
                  href="https://salla.sa/t3nn/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="glass-panel p-5 text-right space-y-2 border-slate-800 hover:border-sky-500/40 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">زيارة المتجر</h4>
                  <p className="text-[11px] text-slate-400">شراء ترخيص ومفتاح جديد</p>
                </a>
              </div>
            </div>

            {/* Key Activation Box */}
            <div className="glass-panel p-6 space-y-4 max-w-xl border-sky-500/30">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-sky-400" />
                تفعيل رقم طلب / مفتاح جديد
              </h3>

              <form onSubmit={handleOrderActivation} className="space-y-4">
                <div>
                  <input 
                    type="text" 
                    placeholder="أدخل رقم الطلب هنا (مثال: 210894562)" 
                    value={orderInput}
                    onChange={(e) => setOrderInput(e.target.value)}
                    className="input-field font-mono text-sm text-center"
                    required
                  />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-2.5 text-xs font-bold">
                  {isSubmitting ? 'جاري التفعيل...' : 'تفعيل وربط بحسابي'}
                </button>
              </form>

              {activationResult && (
                <p className={`text-xs font-semibold text-center ${activationResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                  {activationResult.message}
                </p>
              )}
            </div>

            {/* Active Keys Display with Copy Button */}
            {user && userKeys.length > 0 && (
              <div className="space-y-4 pt-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  المفاتيح المفعلة حالياً على حسابك
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userKeys.map((k: any, i: number) => {
                    const keyStr = typeof k === 'string' ? k : k.orderId;
                    const prodName = typeof k === 'object' ? k.productName : 'سبوفر T3N الشامل';
                    return (
                      <div key={i} className="glass-panel p-4 flex items-center justify-between border-sky-500/30">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            مُفعل
                          </span>
                          <h4 className="text-xs font-bold text-white mt-1">{prodName}</h4>
                          <p className="text-xs font-mono text-sky-400 font-bold mt-1 dir-ltr">{keyStr}</p>
                        </div>

                        <button 
                          onClick={() => copyToClipboard(keyStr)}
                          className="px-3 py-1.5 bg-sky-500/15 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          {copiedKey === keyStr ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedKey === keyStr ? 'تم النسخ' : 'نسخ'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ─── TAB 2: MY PRODUCTS (منتجاتي) ─── */}
        {activeTab === 'my_products' && (
          <div className="space-y-6 max-w-5xl">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-sky-400" />
              منتجاتي والمفاتيح المفعلة
            </h2>

            {user ? (
              <div className="space-y-4">
                {userKeys.length > 0 ? (
                  <div className="space-y-3">
                    {userKeys.map((k: any, i: number) => {
                      const keyStr = typeof k === 'string' ? k : k.orderId;
                      const prodName = typeof k === 'object' ? k.productName : 'سبوفر T3N الشامل';
                      const actDate = typeof k === 'object' && k.activatedAt ? new Date(k.activatedAt).toLocaleString('ar-SA') : 'تفعيل دائم';
                      return (
                        <div key={i} className="glass-panel p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-sky-500/30">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                                نشط ومربوط
                              </span>
                              <span className="text-xs text-slate-400 font-medium">تاريخ التفعيل: {actDate}</span>
                            </div>
                            <h3 className="text-base font-bold text-white">{prodName}</h3>
                            <div className="flex items-center gap-3 pt-1">
                              <span className="text-xs text-slate-400">رمز الترخيص / Key:</span>
                              <span className="text-sm font-mono font-bold text-sky-400 dir-ltr">{keyStr}</span>
                            </div>
                          </div>

                          <button 
                            onClick={() => copyToClipboard(keyStr)}
                            className="px-4 py-2 bg-sky-500/15 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
                          >
                            {copiedKey === keyStr ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            {copiedKey === keyStr ? 'تم النسخ' : 'نسخ المفتاح'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="glass-panel p-8 text-center space-y-3">
                    <p className="text-sm text-slate-300">لم يتم العثور على مفاتيح مفعّلة لحسابك بعد.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-panel p-8 text-center space-y-3">
                <p className="text-sm text-slate-300">يرجى تسجيل الدخول لعرض مفاتيحك المفعلة.</p>
                <button onClick={loginWithGoogle} className="btn-primary py-2 px-6 text-xs">
                  تسجيل الدخول
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 3: PROFILE (الملف الشخصي) ─── */}
        {activeTab === 'profile' && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <User className="w-6 h-6 text-sky-400" />
              الملف الشخصي
            </h2>

            {user ? (
              <div className="glass-panel p-6 space-y-6">
                <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-16 h-16 rounded-2xl border-2 border-sky-500/40 object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-sky-500/20 border-2 border-sky-500/40 text-sky-400 flex items-center justify-center font-bold text-xl">
                      {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-white">{user.displayName || 'مستخدم'}</h3>
                    <p className="text-xs text-slate-400 dir-ltr">{user.email}</p>
                    <span className="inline-block mt-2 text-[10px] font-mono text-slate-500">UID: {user.uid}</span>
                  </div>
                </div>

                {/* Display User's Key if Available */}
                {userKeys.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider">مفتاح الحساب الرئيسي المفعل</h4>
                    {userKeys.map((k: any, i: number) => {
                      const keyStr = typeof k === 'string' ? k : k.orderId;
                      return (
                        <div key={i} className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-sky-400 dir-ltr">{keyStr}</span>
                          <button 
                            onClick={() => copyToClipboard(keyStr)}
                            className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 rounded-lg text-xs font-bold flex items-center gap-1.5"
                          >
                            {copiedKey === keyStr ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedKey === keyStr ? 'تم النسخ' : 'نسخ'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-panel p-8 text-center text-slate-400 text-xs">
                يرجى تسجيل الدخول لعرض الملف الشخصي.
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 4: FULL ADMIN CONTROL PANEL (لوحة التحكم للإدارة) ─── */}
        {activeTab === 'admin' && isAdminUser && (
          <div className="space-y-8 max-w-6xl">
            
            {/* Header & Subtabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <Settings className="w-6 h-6 text-indigo-400" />
                  لوحة التحكم للإدارة
                </h2>
                <p className="text-xs text-slate-400">سجل الأحداث الكامل، إدارة العملاء، المنتجات، والمفاتيح</p>
              </div>

              {/* Subtab Selector */}
              <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                <button 
                  onClick={() => setAdminSubTab('logs')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    adminSubTab === 'logs' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  سجل الأحداث واللوقات
                </button>

                <button 
                  onClick={() => setAdminSubTab('users')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    adminSubTab === 'users' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  إدارة العملاء ({adminData.totalUsers})
                </button>

                <button 
                  onClick={() => setAdminSubTab('keys')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    adminSubTab === 'keys' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  المفاتيح والطلبات ({adminData.totalOrders})
                </button>
              </div>
            </div>

            {/* 1. ADMIN SUBTAB: FULL SITE AUDIT LOGS */}
            {adminSubTab === 'logs' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    لوقات الحركة الكاملة بالموقع (Audit Logs)
                  </h3>
                  <button 
                    onClick={fetchAdminStats}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-lg border border-slate-800 flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    تحديث اللوقات
                  </button>
                </div>

                <div className="glass-panel overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-bold">
                        <tr>
                          <th className="p-4">الوقت والتاريخ</th>
                          <th className="p-4">نوع الحركة</th>
                          <th className="p-4">المستخدم / البريد</th>
                          <th className="p-4">تفاصيل العملية</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {adminData.logs && adminData.logs.length > 0 ? (
                          adminData.logs.map((log: any) => (
                            <tr key={log.id} className="hover:bg-slate-900/40">
                              <td className="p-4 text-slate-400 font-mono text-[11px]">
                                {log.timestamp ? new Date(log.timestamp).toLocaleString('ar-SA') : '-'}
                              </td>
                              <td className="p-4">
                                <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                                  {log.action}
                                </span>
                              </td>
                              <td className="p-4 text-slate-200 font-medium dir-ltr">{log.email || 'زائر'}</td>
                              <td className="p-4 text-slate-300 leading-relaxed">{log.details}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-slate-500">لا يوجد لوقات مسجلة حالياً</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 2. ADMIN SUBTAB: CUSTOMERS & PRODUCTS MANAGEMENT */}
            {adminSubTab === 'users' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Users List & Search */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                    <input 
                      type="text" 
                      placeholder="البحث بالبريد أو الاسم..." 
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                      className="input-field pr-10 text-xs"
                    />
                  </div>

                  <div className="glass-panel p-2 space-y-1 max-h-[550px] overflow-y-auto">
                    {filteredUsers.map((u) => (
                      <div 
                        key={u.id} 
                        onClick={() => {
                          setSelectedUser(u);
                          setUserNote(u.adminNotes || '');
                        }}
                        className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                          selectedUser?.id === u.id ? 'bg-indigo-600/20 border border-indigo-500/40' : 'hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-sky-400">
                            {u.displayName ? u.displayName[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white truncate max-w-[140px]">{u.displayName || 'مستخدم'}</h4>
                            <p className="text-[10px] text-slate-400 truncate max-w-[140px] dir-ltr">{u.email}</p>
                          </div>
                        </div>

                        {u.isVIP && (
                          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            VIP
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected User Details & Actions Panel */}
                <div className="lg:col-span-2 space-y-6">
                  {selectedUser ? (
                    <div className="glass-panel p-6 space-y-6">
                      
                      {/* User Header */}
                      <div className="flex justify-between items-start pb-4 border-b border-slate-800">
                        <div>
                          <h3 className="text-lg font-bold text-white">{selectedUser.displayName || 'مستخدم'}</h3>
                          <p className="text-xs text-slate-400 dir-ltr">{selectedUser.email}</p>
                          <p className="text-[10px] text-slate-500 mt-1 font-mono">UID: {selectedUser.uid}</p>
                        </div>

                        <button 
                          onClick={() => handleToggleUserBan(selectedUser)}
                          className={`btn-danger ${selectedUser.banned ? 'bg-emerald-950 text-emerald-300 border-emerald-500/30' : ''}`}
                        >
                          <Ban className="w-4 h-4" />
                          {selectedUser.banned ? 'إلغاء حظر العميل' : 'حظر العميل'}
                        </button>
                      </div>

                      {/* Customer Verified Keys with Time & Date */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider">المنتجات والمفاتيح المفعلة لدى العميل</h4>
                        
                        {selectedUser.verifiedOrders && selectedUser.verifiedOrders.length > 0 ? (
                          <div className="space-y-2">
                            {selectedUser.verifiedOrders.map((ord: any, i: number) => {
                              const orderKey = typeof ord === 'string' ? ord : ord.orderId;
                              const prodName = typeof ord === 'object' ? ord.productName : 'سبوفر T3N الشامل';
                              const dateStr = typeof ord === 'object' && ord.activatedAt ? new Date(ord.activatedAt).toLocaleString('ar-SA') : 'تفعيل دائم';
                              return (
                                <div key={i} className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                                  <div>
                                    <p className="text-xs font-bold text-white">{prodName}</p>
                                    <p className="text-[11px] font-mono text-sky-400 mt-0.5 dir-ltr">Key: {orderKey}</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">وقت التفعيل: {dateStr}</p>
                                  </div>

                                  <button 
                                    onClick={() => handleRevokeProduct(orderKey)}
                                    className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    إلغاء وسحب المفتاح
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 bg-slate-900/40 p-4 rounded-xl border border-slate-800/50 text-center">لا يوجد منتجات أو مفاتيح مفعلة لهذا العميل حالياً</p>
                        )}
                      </div>

                      {/* Admin Notes */}
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          ملاحظات الإدارة الخاصة بالعميل
                        </h4>
                        <textarea 
                          rows={3}
                          placeholder="اكتب أي ملاحظة أو تنبيه حول العميل هنا..."
                          value={userNote}
                          onChange={(e) => setUserNote(e.target.value)}
                          className="input-field text-xs leading-relaxed"
                        />
                        <button 
                          onClick={handleSaveNotes}
                          className="btn-primary text-xs py-2 px-5"
                        >
                          حفظ الملاحظة
                        </button>
                      </div>

                    </div>
                  ) : (
                    <div className="glass-panel p-12 text-center text-slate-500 text-xs">
                      اختر عميلاً من القائمة لعرض تفاصيله، مفاتيحه المفعلة بالأوقات، وتدوين ملاحظات الإدارة.
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* 3. ADMIN SUBTAB: KEYS & ORDERS */}
            {adminSubTab === 'keys' && (
              <div className="space-y-4">
                <div className="relative max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                  <input 
                    type="text" 
                    placeholder="البحث برقم الطلب أو بريد المستعمل..." 
                    value={searchKey}
                    onChange={(e) => setSearchKey(e.target.value)}
                    className="input-field pr-10 text-xs"
                  />
                </div>

                <div className="glass-panel overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                        <tr>
                          <th className="p-4">رقم الطلب / المفتاح</th>
                          <th className="p-4">الحالة</th>
                          <th className="p-4">المستخدم</th>
                          <th className="p-4">تاريخ التفعيل</th>
                          <th className="p-4 text-left">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {filteredKeys.map((k) => (
                          <tr key={k.id} className="hover:bg-slate-900/30">
                            <td className="p-4 font-mono font-bold text-sky-400 dir-ltr">{k.id}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                k.status === 'banned' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}>
                                {k.status || 'نشط'}
                              </span>
                            </td>
                            <td className="p-4 text-slate-300 dir-ltr">{k.usedByEmail || 'غير معروف'}</td>
                            <td className="p-4 text-slate-400 font-mono text-[11px]">
                              {k.activatedAt ? new Date(k.activatedAt).toLocaleString('ar-SA') : '-'}
                            </td>
                            <td className="p-4 text-left space-x-2 space-x-reverse">
                              <button 
                                onClick={async () => {
                                  if (k.status === 'banned') await unbanOrder(k.id);
                                  else await banOrder(k.id);
                                  fetchAdminStats();
                                }}
                                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
                              >
                                {k.status === 'banned' ? 'إلغاء الحظر' : 'حظر المفتاح'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

    </div>
  );
}
