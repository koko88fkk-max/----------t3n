import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { LayoutDashboard, Key, X, RefreshCw, Trash2, ShieldOff, Gamepad2, Copy, Ban, Snowflake, Search, Users, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { getAdminStats, getAllKeys, createKeys, deleteKey, banKey, unbanKey, freezeKey, unfreezeKey, banUser, deleteUserData, resetAllUsersAndCounter } from './lib/firebase';

const getNumericId = (uid: string, assignedId?: number) => {
  if (assignedId) return assignedId.toString();
  if (!uid) return '0';
  let h = 0;
  for (let i = 0; i < uid.length; i++) { h = ((h << 5) - h) + uid.charCodeAt(i); h |= 0; }
  return Math.abs(h).toString().slice(0, 6);
};

const formatDetailedDate = (dateStr: string | null) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const secs = Math.floor(diff / 1000);
  const mins = Math.floor(secs / 60);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);

  let ago = '';
  if (months > 0) ago = `منذ ${months} شهر`;
  else if (days > 0) ago = `منذ ${days} يوم`;
  else if (hours > 0) ago = `منذ ${hours} ساعة`;
  else if (mins > 0) ago = `منذ ${mins} دقيقة`;
  else ago = `منذ ${secs} ثانية`;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const dateFormatted = `${d.getFullYear()}/${pad(d.getMonth()+1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  return `${dateFormatted} (${ago})`;
};

const StatusBadge = ({ status }: { status: string }) => {
  const colors: any = { unused: 'bg-emerald-500/20 text-emerald-400', active: 'bg-blue-500/20 text-blue-400', banned: 'bg-red-500/20 text-red-400', frozen: 'bg-cyan-500/20 text-cyan-400' };
  const labels: any = { unused: 'متاح', active: 'مستخدم', banned: 'محظور', frozen: 'مجمد' };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${colors[status] || 'bg-zinc-500/20 text-zinc-400'}`}>{labels[status] || status}</span>;
};

export function AdminDashboard({ onClose }: { onClose: () => void }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [wiping, setWiping] = useState(false);

  const load = async () => { setLoading(true); setStats(await getAdminStats()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const filteredUsers = stats?.users?.filter((u: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return u.displayName?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s) || getNumericId(u.id, u.assignedId).includes(s);
  }) || [];

  const handleWipe = async () => {
    if (!confirm('⚠️ هل أنت متأكد من حذف جميع الحسابات؟ هذا الإجراء لا يمكن التراجع عنه!')) return;
    if (!confirm('⚠️ تأكيد أخير: سيتم حذف كل المستخدمين وإعادة تعيين نظام الـ ID. متأكد؟')) return;
    setWiping(true);
    try { await resetAllUsersAndCounter(); await load(); alert('✅ تم حذف جميع الحسابات وإعادة تعيين العداد'); } 
    catch (e) { alert('خطأ في الحذف'); }
    setWiping(false);
  };

  return createPortal(
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 md:p-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-white flex items-center gap-3"><LayoutDashboard className="text-red-500" /> لوحة التحكم</h2>
          <div className="flex items-center gap-3">
            <button onClick={load} className="p-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
            <button onClick={onClose} className="p-2 rounded-xl bg-white/5 text-zinc-400 hover:text-red-400"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {loading ? <div className="flex justify-center py-20"><RefreshCw className="animate-spin text-blue-500 w-10 h-10" /></div> : stats && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
              {[
                { label: 'المستخدمين', val: stats.totalUsers, color: 'text-white' },
                { label: 'VIP', val: stats.vipUsers, color: 'text-yellow-400' },
                { label: 'إجمالي المفاتيح', val: stats.totalKeys, color: 'text-blue-400' },
                { label: 'مستخدمة', val: stats.usedKeys, color: 'text-emerald-400' },
                { label: 'متاحة', val: stats.unusedKeys, color: 'text-cyan-400' },
                { label: 'محظورة', val: stats.bannedKeys, color: 'text-red-400' },
                { label: 'مجمدة', val: stats.frozenKeys, color: 'text-purple-400' },
              ].map((s, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-center">
                  <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
                  <span className="text-zinc-500 text-[10px] font-bold">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input type="text" placeholder="ابحث بالاسم أو الـ ID..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pr-12 pl-4 text-white text-sm font-bold" />
            </div>

            {/* Users Table */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden mb-8">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2"><Users className="w-4 h-4 text-blue-400" /> المستخدمين ({filteredUsers.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead><tr className="bg-white/5 text-zinc-500 border-b border-white/5">
                    <th className="p-3">ID</th><th className="p-3">المستخدم</th><th className="p-3">الحالة</th><th className="p-3">المفاتيح</th><th className="p-3">إجراءات</th>
                  </tr></thead>
                  <tbody>
                    {filteredUsers.map((u: any) => (
                      <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="p-3"><span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-mono text-[10px]">{getNumericId(u.id, u.assignedId)}</span></td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {u.photoURL && <img src={u.photoURL} className="w-6 h-6 rounded-full" />}
                            <div><p className="text-white font-bold text-xs">{u.displayName || '-'}</p><p className="text-zinc-600 text-[10px]">{u.provider || 'discord'}</p></div>
                          </div>
                        </td>
                        <td className="p-3">{u.isVIP ? <span className="text-yellow-400 text-[10px] font-bold">⭐ VIP</span> : <span className="text-zinc-600 text-[10px]">عادي</span>}</td>
                        <td className="p-3 text-zinc-500 font-mono text-[10px]">{u.activatedKeys?.length || 0}</td>
                        <td className="p-3 flex gap-1">
                          <button onClick={async () => { if(confirm('حظر؟')) { await banUser(u.id, u.email || '', 'Admin'); load(); } }} className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400"><ShieldOff className="w-3 h-3" /></button>
                          <button onClick={async () => { if(confirm('حذف؟')) { await deleteUserData(u.id); load(); } }} className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
              <h3 className="text-red-400 font-bold text-sm mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> منطقة الخطر والإعدادات المتقدمة</h3>
              <div className="flex flex-col gap-3">
                <button onClick={async () => {
                  try {
                    await toggleMaintenanceMode();
                    alert('تم تغيير حالة وضع الصيانة بنجاح!');
                  } catch (e: any) {
                    alert('خطأ: ' + e.message);
                  }
                }} className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-bold text-sm w-full md:w-auto text-center flex items-center justify-center gap-2">
                  <Wrench className="w-4 h-4" /> تفعيل / تعطيل وضع الصيانة
                </button>
                
                <button onClick={handleWipe} disabled={wiping} className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-sm disabled:opacity-50 w-full md:w-auto text-center flex items-center justify-center gap-2">
                  {wiping ? 'جاري الحذف...' : <><Trash2 className="w-4 h-4" /> حذف جميع الحسابات وإعادة تعيين IDs</>}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>, document.body
  );
}

export function KeyManagement({ onClose }: { onClose: () => void }) {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [createCount, setCreateCount] = useState(1);
  const [createType, setCreateType] = useState<'fortnite_unban' | 'spoofer_t3n' | 'spoofer_temp'>('spoofer_t3n');
  const [lastCreated, setLastCreated] = useState<string[]>([]);
  const [createError, setCreateError] = useState('');
  const [activeTab, setActiveTab] = useState<'superstar' | 'used'>('superstar');
  const [keySearch, setKeySearch] = useState('');
  const [deletingAll, setDeletingAll] = useState(false);

  const load = async () => { setLoading(true); try { setKeys(await getAllKeys()); } catch(e){} setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (isCreating) return;
    setIsCreating(true); setCreateError('');
    try {
      const c = await createKeys(Math.min(100, Math.max(1, createCount)), createType);
      if (c.length === 0) setCreateError('فشل في الإنشاء');
      else { setLastCreated(c); await load(); }
    } catch (e: any) { setCreateError(e.message || 'خطأ غير معروف'); }
    setIsCreating(false);
  };

  const spooferKeys = keys.filter(k => ['superstar', 'spoofer', 'fortnite_unban', 'spoofer_t3n', 'spoofer_temp'].includes(k.productType) && k.status !== 'active');
  const usedKeys = keys.filter(k => k.status === 'active');
  const currentKeys = activeTab === 'superstar' ? spooferKeys : usedKeys;

  // Apply search filter
  const filteredKeys = currentKeys.filter(k => {
    if (!keySearch) return true;
    const s = keySearch.toLowerCase();
    return k.id?.toLowerCase().includes(s) || k.usedByName?.toLowerCase().includes(s) || k.usedByEmail?.toLowerCase().includes(s) || k.usedByUid?.toLowerCase().includes(s);
  });

  const totalUnused = keys.filter(k => k.status === 'unused').length;
  const totalUsed = keys.filter(k => k.status === 'active').length;
  const totalBanned = keys.filter(k => k.status === 'banned').length;
  const totalFrozen = keys.filter(k => k.status === 'frozen').length;

  const handleDeleteAllVisible = async () => {
    if (!confirm(`⚠️ هل أنت متأكد من حذف ${filteredKeys.length} مفتاح من هذه الصفحة؟`)) return;
    if (!confirm('⚠️ تأكيد أخير: لا يمكن التراجع عن هذا!')) return;
    setDeletingAll(true);
    try {
      for (const k of filteredKeys) { await deleteKey(k.id); }
      await load();
    } catch (e: any) { alert('خطأ: ' + e.message); }
    setDeletingAll(false);
  };

  return createPortal(
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 md:p-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-white flex items-center gap-3"><Key className="text-emerald-500" /> إدارة المفاتيح</h2>
          <div className="flex gap-2">
            <button onClick={load} className="p-2 rounded-xl bg-white/5 text-zinc-400"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
            <button onClick={onClose} className="p-2 rounded-xl bg-white/5 text-zinc-400 hover:text-red-400"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { l: 'الكل', v: keys.length, c: 'text-white' },
            { l: 'متاحة', v: totalUnused, c: 'text-emerald-400' },
            { l: 'مستخدمة', v: totalUsed, c: 'text-blue-400' },
            { l: 'محظورة', v: totalBanned, c: 'text-red-400' },
            { l: 'مجمدة', v: totalFrozen, c: 'text-purple-400' },
          ].map((s, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-3 text-center">
              <p className={`text-xl font-black ${s.c}`}>{s.v}</p>
              <span className="text-zinc-500 text-[10px] font-bold">{s.l}</span>
            </div>
          ))}
        </div>

        {/* Create Section - 3 Products */}
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 mb-6">
          <h3 className="text-sm font-bold text-white mb-4">إنشاء مفاتيح جديدة</h3>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <button onClick={() => setCreateType('fortnite_unban')} className={`py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${createType === 'fortnite_unban' ? 'bg-purple-600 text-white' : 'bg-white/5 text-zinc-500'}`}>
                <Gamepad2 className="w-4 h-4" /> فك باند فورت هاردوير
              </button>
              <button onClick={() => setCreateType('spoofer_t3n')} className={`py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${createType === 'spoofer_t3n' ? 'bg-blue-600 text-white' : 'bg-white/5 text-zinc-500'}`}>
                <Gamepad2 className="w-4 h-4" /> سبوفر تعن
              </button>
              <button onClick={() => setCreateType('spoofer_temp')} className={`py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${createType === 'spoofer_temp' ? 'bg-cyan-600 text-white' : 'bg-white/5 text-zinc-500'}`}>
                <Gamepad2 className="w-4 h-4" /> سبوفر تيمب
              </button>
            </div>
            <div className="flex flex-col md:flex-row gap-3">
              <input type="number" min={1} max={100} value={createCount} onChange={e => setCreateCount(Math.min(100,Math.max(1,Number(e.target.value)||1)))} className="w-24 bg-white/5 border border-white/10 rounded-xl p-2.5 text-white text-center font-black text-sm" />
              <button onClick={handleCreate} disabled={isCreating} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 flex items-center gap-2">
                {isCreating ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> جاري...</> : `إنشاء ${createCount} مفتاح`}
              </button>
            </div>
          </div>
          {createError && <p className="text-red-400 text-xs font-bold mt-3">{createError}</p>}
          {lastCreated.length > 0 && (
            <div className="mt-4 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-emerald-400 text-xs font-bold">✅ تم إنشاء {lastCreated.length} مفتاح</span>
                <button onClick={() => navigator.clipboard.writeText(lastCreated.join('\n'))} className="text-emerald-400 text-xs font-bold flex items-center gap-1 hover:text-emerald-300"><Copy className="w-3 h-3" /> نسخ الكل</button>
              </div>
              <div className="max-h-24 overflow-y-auto text-[10px] font-mono text-zinc-400">{lastCreated.map(k => <div key={k}>{k}</div>)}</div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => setActiveTab('superstar')} className={`px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'superstar' ? 'bg-blue-600 text-white' : 'bg-white/5 text-zinc-500'}`}>
            <Gamepad2 className="w-4 h-4" /> مفاتيح السبوفر ({spooferKeys.length})
          </button>
          <button onClick={() => setActiveTab('used')} className={`px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'used' ? 'bg-emerald-600 text-white' : 'bg-white/5 text-zinc-500'}`}>
            <CheckCircle2 className="w-4 h-4" /> المستخدمة ({usedKeys.length})
          </button>
        </div>

        {/* Search + Delete All */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input type="text" placeholder="ابحث بالمفتاح أو اسم المستخدم أو الإيميل..." value={keySearch} onChange={e => setKeySearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pr-12 pl-4 text-white text-sm font-bold" />
          </div>
          {activeTab === 'superstar' && filteredKeys.length > 0 && (
            <button onClick={handleDeleteAllVisible} disabled={deletingAll} className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs disabled:opacity-50 flex items-center gap-2 whitespace-nowrap">
              {deletingAll ? <><RefreshCw className="w-3 h-3 animate-spin" /> جاري الحذف...</> : <><Trash2 className="w-3 h-3" /> حذف الكل ({filteredKeys.length})</>}
            </button>
          )}
        </div>

        {/* Keys Table */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead><tr className="bg-white/5 text-zinc-500 border-b border-white/5">
                <th className="p-3">المفتاح</th><th className="p-3">الحالة</th><th className="p-3">المستخدم</th><th className="p-3">تاريخ الإنشاء</th><th className="p-3">تاريخ التفعيل</th><th className="p-3">إجراءات</th>
              </tr></thead>
              <tbody>
                {filteredKeys.map(k => (
                  <tr key={k.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span title="مخصص للسبوفر" className="bg-blue-500/20 text-blue-400 p-1 rounded-md"><Gamepad2 className="w-3 h-3" /></span>
                        <span className="font-mono text-[11px] text-zinc-300">{k.id}</span>
                      </div>
                    </td>
                    <td className="p-3"><StatusBadge status={k.status} /></td>
                    <td className="p-3">
                      {k.usedByName ? (
                        <div className="flex items-center gap-2">
                          {k.usedByPhoto && <img src={k.usedByPhoto} className="w-5 h-5 rounded-full" />}
                          <div>
                            <p className="text-zinc-300 text-[10px] font-bold">{k.usedByName}</p>
                            <p className="text-zinc-600 text-[9px]">{k.usedByEmail || ''}</p>
                          </div>
                        </div>
                      ) : <span className="text-zinc-600 text-[10px]">-</span>}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-zinc-500 text-[10px]">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{formatDetailedDate(k.createdAt)}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-zinc-500 text-[10px]">
                        {k.activatedAt ? (
                          <><Clock className="w-3 h-3 shrink-0 text-emerald-500" /><span className="text-emerald-400">{formatDetailedDate(k.activatedAt)}</span></>
                        ) : <span className="text-zinc-600">لم يُفعّل</span>}
                      </div>
                    </td>
                    <td className="p-3 flex gap-1">
                      <button onClick={() => navigator.clipboard.writeText(k.id)} className="p-1 rounded hover:bg-white/10 text-zinc-500" title="نسخ"><Copy className="w-3 h-3" /></button>
                      {k.status !== 'banned' && <button onClick={async () => { try { await banKey(k.id); await load(); } catch(e:any) { alert('خطأ: ' + e.message); } }} className="p-1 rounded hover:bg-red-500/10 text-zinc-500 hover:text-red-400" title="حظر"><Ban className="w-3 h-3" /></button>}
                      {k.status === 'banned' && <button onClick={async () => { try { await unbanKey(k.id); await load(); } catch(e:any) { alert('خطأ: ' + e.message); } }} className="p-1 rounded hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-400" title="فك الحظر"><CheckCircle2 className="w-3 h-3" /></button>}
                      {k.status !== 'frozen' && k.status !== 'banned' && <button onClick={async () => { try { await freezeKey(k.id); await load(); } catch(e:any) { alert('خطأ: ' + e.message); } }} className="p-1 rounded hover:bg-cyan-500/10 text-zinc-500 hover:text-cyan-400" title="تجميد"><Snowflake className="w-3 h-3" /></button>}
                      {k.status === 'frozen' && <button onClick={async () => { try { await unfreezeKey(k.id); await load(); } catch(e:any) { alert('خطأ: ' + e.message); } }} className="p-1 rounded hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-400" title="فك التجميد"><CheckCircle2 className="w-3 h-3" /></button>}
                      <button onClick={async () => { if(confirm('حذف المفتاح؟')) { try { await deleteKey(k.id); await load(); } catch(e:any) { alert('خطأ: ' + e.message); } } }} className="p-1 rounded hover:bg-red-500/10 text-zinc-500 hover:text-red-400" title="حذف"><Trash2 className="w-3 h-3" /></button>
                    </td>
                  </tr>
                ))}
                {filteredKeys.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-zinc-600 text-sm">لا توجد مفاتيح</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>, document.body
  );
}
