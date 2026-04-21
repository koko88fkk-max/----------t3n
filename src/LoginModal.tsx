import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Smartphone, ArrowRight, ShieldCheck, Loader2, AlertCircle, Search, ChevronDown } from 'lucide-react';
import { loginWithGoogle, sendPhoneSMS, verifyPhoneOTP, initRecaptcha } from './lib/firebase';

const ARAB_COUNTRIES = [
  { name: 'السعودية', code: '+966', id: 'sa' },
  { name: 'الإمارات', code: '+971', id: 'ae' },
  { name: 'الكويت', code: '+965', id: 'kw' },
  { name: 'البحرين', code: '+973', id: 'bh' },
  { name: 'قطر', code: '+974', id: 'qa' },
  { name: 'عمان', code: '+968', id: 'om' },
  { name: 'مصر', code: '+20', id: 'eg' },
  { name: 'الأردن', code: '+962', id: 'jo' },
  { name: 'العراق', code: '+964', id: 'iq' },
  { name: 'المغرب', code: '+212', id: 'ma' },
  { name: 'الجزائر', code: '+213', id: 'dz' },
  { name: 'تونس', code: '+216', id: 'tn' },
  { name: 'اليمن', code: '+967', id: 'ye' },
  { name: 'السودان', code: '+249', id: 'sd' },
  { name: 'ليبيا', code: '+218', id: 'ly' },
  { name: 'فلسطين', code: '+970', id: 'ps' },
  { name: 'لبنان', code: '+961', id: 'lb' },
  { name: 'سوريا', code: '+963', id: 'sy' }
];

export default function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [method, setMethod] = useState<'select' | 'phone'>('select');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(ARAB_COUNTRIES[0]);
  const [showCountrySelect, setShowCountrySelect] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      setMethod('select');
      setStep('input');
      setPhoneNumber('');
      setOtp('');
      setError(null);
      setShowCountrySelect(false);
      try {
        setTimeout(() => initRecaptcha('recaptcha-wrapper'), 1000);
      } catch (e) {}
    }
  }, [isOpen]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    await loginWithGoogle();
    setLoading(false);
    onClose();
  };

  const handlePhoneSubmit = async () => {
    setError(null);
    if (!phoneNumber) {
      setError('يرجى إدخال رقم الجوال');
      return;
    }
    
    // Format number correctly based on country code
    let cleanedNum = phoneNumber;
    if (cleanedNum.startsWith('0')) {
      cleanedNum = cleanedNum.substring(1);
    }
    const formattedPhone = selectedCountry.code + cleanedNum;

    setLoading(true);
    try {
      const verifier = initRecaptcha('recaptcha-wrapper');
      const res = await sendPhoneSMS(formattedPhone, verifier);
      
      if (res.success) {
        setConfirmationResult(res.confirmationResult);
        setStep('verify');
      } else {
        setError(res.error || 'فشل إرسال كود التحقق. يرجى التأكد من الرقم');
      }
    } catch (err: any) {
      console.error(err);
      setError('حدث خطأ، تأكد من الاتصال وجرب مرة أخرى');
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 6) {
      setError('رمز التحقق مكون من 6 أرقام');
      return;
    }
    setLoading(true);
    const res = await verifyPhoneOTP(confirmationResult, otp);
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'الرمز غير صحيح');
    }
  };

  const filteredCountries = ARAB_COUNTRIES.filter(c => 
    c.name.includes(searchQuery) || c.code.includes(searchQuery)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-xl"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-[#0F111A] border border-blue-500/20 rounded-3xl p-6 shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-4 left-4 p-2 rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all z-10"><X className="w-5 h-5" /></button>

        <div className="text-center mb-6 pt-4 relative z-10">
          <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">تسجيل الدخول</h2>
          <p className="text-gray-400 text-sm">بوابة الدخول الرسمية لمتجر تعن T3N</p>
        </div>

        <div id="recaptcha-wrapper" className="flex justify-center mb-4"></div>

        <AnimatePresence mode="wait">
          {method === 'select' && (
            <motion.div key="select" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4 relative z-10">
              <button disabled={loading} onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 p-4 bg-white hover:bg-gray-100 text-gray-900 rounded-2xl font-bold transition-all">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    <svg className="w-6 h-6" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    <span>الدخول باستخدام Google</span>
                  </>
                )}
              </button>
              <div className="relative flex items-center py-2"><div className="flex-grow border-t border-white/10"></div><span className="flex-shrink-0 mx-4 text-white/40 text-sm">أو</span><div className="flex-grow border-t border-white/10"></div></div>
              <button disabled={loading} onClick={() => setMethod('phone')} className="w-full flex items-center justify-center gap-3 p-4 bg-transparent border border-blue-500/30 text-white hover:bg-blue-600/10 rounded-2xl font-bold transition-all">
                <Smartphone className="w-6 h-6 text-blue-400" />
                <span>الدخول برقم الجوال</span>
              </button>
            </motion.div>
          )}

          {method === 'phone' && step === 'input' && (
            <motion.div key="phone-input" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4 relative z-10 w-full">
              <div className="relative">
                <label className="block text-sm text-gray-400 mb-2 mr-2">رقم الجوال</label>
                <div className="flex items-center gap-2 bg-[#0A0C13] border border-blue-500/20 p-2 rounded-xl focus-within:border-blue-500/50 transition-all">
                  
                  {/* Country Selector Button */}
                  <div className="relative">
                    <button onClick={() => setShowCountrySelect(!showCountrySelect)} className="flex items-center justify-between min-w-[70px] gap-2 bg-white/5 hover:bg-white/10 px-2 py-2 rounded-lg transition-all shrink-0">
                      <img src={`https://flagcdn.com/w20/${selectedCountry.id}.png`} alt={selectedCountry.name} className="w-5 rounded-[2px]" />
                      <ChevronDown className="w-3 h-3 text-gray-500" />
                    </button>
                    {/* Enhanced Country Dropdown */}
                    <AnimatePresence>
                      {showCountrySelect && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                          className="absolute top-[110%] right-0 w-[240px] max-h-[300px] bg-[#141723] border border-blue-500/30 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-[200] overflow-hidden flex flex-col"
                        >
                          <div className="p-2 border-b border-white/5 bg-black/20 shrink-0">
                            <div className="flex items-center gap-2 bg-[#0A0C13] border border-blue-500/20 rounded-lg p-2">
                              <Search className="w-4 h-4 text-gray-400 shrink-0" />
                              <input 
                                type="text" placeholder="ابحث عن دولتك..." value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent text-white text-sm outline-none"
                              />
                            </div>
                          </div>
                          <div className="overflow-y-auto no-scrollbar flex-grow">
                            {filteredCountries.map(country => (
                              <button 
                                key={country.id}
                                onClick={() => { setSelectedCountry(country); setShowCountrySelect(false); setSearchQuery(''); }}
                                className="w-full flex items-center justify-between p-3 hover:bg-blue-500/20 hover:text-white text-gray-300 transition-colors border-b border-white/5 last:border-0"
                              >
                                <div className="flex items-center gap-3">
                                  <img src={`https://flagcdn.com/w20/${country.id}.png`} alt={country.name} className="w-5 rounded-[2px]" />
                                  <span className="text-sm font-bold">{country.name}</span>
                                </div>
                                <span className="text-gray-500 text-xs font-mono dir-ltr">{country.code}</span>
                              </button>
                            ))}
                            {filteredCountries.length === 0 && (
                              <div className="p-4 text-center text-gray-500 text-sm">لم يتم العثور على نتائج المدخل</div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <span className="text-gray-400 font-mono text-sm ml-1" dir="ltr">{selectedCountry.code}</span>
                  <input 
                    type="tel" dir="ltr" value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="xxxxxxxxx"
                    className="w-full bg-transparent text-white font-mono text-lg outline-none text-left px-2" autoFocus
                  />
                </div>
              </div>

              {error && <div className="flex items-center gap-2 p-3 bg-red-500/10 text-red-400 rounded-xl text-sm border border-red-500/20"><AlertCircle className="w-4 h-4 shrink-0" /><p className="text-xs">{error}</p></div>}
              
              <button onClick={handlePhoneSubmit} disabled={loading || phoneNumber.length < 8} className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 text-white rounded-2xl font-bold transition-all relative z-10">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><span>إرسال الكود</span><ArrowRight className="w-5 h-5" style={{transform: "rotate(180deg)"}} /></>}
              </button>
              <button onClick={() => { setMethod('select'); setError(null); }} className="w-full p-2 text-gray-400 hover:text-white text-sm transition-colors relative z-10" disabled={loading}>رجوع للخيارات</button>
            </motion.div>
          )}

          {method === 'phone' && step === 'verify' && (
            <motion.div key="phone-verify" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4 relative z-10">
              <div>
                <label className="block text-sm text-gray-400 mb-2 mr-2 text-center">أدخل الرمز المكون من 6 أرقام</label>
                <div className="flex justify-center">
                  <input type="text" dir="ltr" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} className="w-64 bg-[#0A0C13] border border-blue-500/40 p-4 rounded-2xl text-center text-4xl tracking-[0.3em] font-mono font-bold text-white outline-none focus:border-blue-400 transition-all shadow-inner" autoFocus />
                </div>
              </div>
              {error && <div className="flex items-center gap-2 p-3 bg-red-500/10 text-red-400 rounded-xl text-sm border border-red-500/20"><AlertCircle className="w-4 h-4 shrink-0" /><p className="text-xs">{error}</p></div>}
              <button onClick={handleVerifyOTP} disabled={loading || otp.length < 6} className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 disabled:opacity-50 text-white rounded-2xl font-bold transition-all">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><span>تأكيد الدخول</span><ShieldCheck className="w-5 h-5" /></>}
              </button>
              <button onClick={() => { setStep('input'); setError(null); }} className="w-full p-2 text-gray-400 hover:text-white text-sm transition-colors" disabled={loading}>تغيير رقم الجوال</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
