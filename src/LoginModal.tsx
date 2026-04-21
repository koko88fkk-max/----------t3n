import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Smartphone, ArrowRight, ShieldCheck, Gamepad2, Info, Loader2 } from 'lucide-react';
import { loginWithGoogle, sendPhoneSMS, verifyPhoneOTP, initRecaptcha } from './lib/firebase';

export default function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [method, setMethod] = useState<'select' | 'phone'>('select');
  const [phoneNumber, setPhoneNumber] = useState('');
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
      setTimeout(() => initRecaptcha('recaptcha-admin'), 1000);
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
    
    let formattedPhone = phoneNumber;
    if (formattedPhone.startsWith('05')) {
      formattedPhone = '+966' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+966' + formattedPhone;
    }

    setLoading(true);
    const verifier = initRecaptcha('recaptcha-admin');
    const res = await sendPhoneSMS(formattedPhone, verifier);
    setLoading(false);

    if (res.success) {
      setConfirmationResult(res.confirmationResult);
      setStep('verify');
    } else {
      setError(res.error || 'فشل إرسال كود التحقق');
    }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-[#0F111A] border border-blue-500/20 rounded-3xl p-6 shadow-2xl overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8 pt-4">
          <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">تسجيل الدخول</h2>
          <p className="text-gray-400 text-sm">بوابة الدخول الرسمية لمتجر تعن T3N</p>
        </div>

        <div id="recaptcha-admin"></div>

        <AnimatePresence mode="wait">
          {method === 'select' && (
            <motion.div 
              key="select"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 p-4 bg-white hover:bg-gray-100 text-gray-900 rounded-2xl font-bold transition-all"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>الدخول باستخدام Google</span>
                  </>
                )}
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-white/40 text-sm">أو</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              <button 
                onClick={() => setMethod('phone')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 p-4 bg-transparent border border-blue-500/30 text-white hover:bg-blue-600/10 rounded-2xl font-bold transition-all"
              >
                <Smartphone className="w-6 h-6 text-blue-400" />
                <span>الدخول برقم الجوال</span>
              </button>
            </motion.div>
          )}

          {method === 'phone' && step === 'input' && (
            <motion.div 
              key="phone-input"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm text-gray-400 mb-2 mr-2">رقم الجوال</label>
                <div className="flex items-center gap-2 bg-[#0A0C13] border border-blue-500/20 p-3 rounded-xl focus-within:border-blue-500/50 transition-all">
                  <span className="text-gray-500 text-sm dir-ltr shrink-0">+966</span>
                  <input 
                    type="tel"
                    dir="ltr"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="5xxxxxxxxx"
                    className="w-full bg-transparent text-white font-mono outline-none text-left"
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 text-red-400 rounded-xl text-sm border border-red-500/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button 
                onClick={handlePhoneSubmit}
                disabled={loading || phoneNumber.length < 9}
                className="w-full flex items-center justify-center gap-2 p-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-2xl font-bold transition-all"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    <span>إرسال الكود</span>
                    <ArrowRight className="w-5 h-5 rotate-180" />
                  </>
                )}
              </button>

              <button 
                onClick={() => { setMethod('select'); setError(null); }}
                className="w-full p-2 text-gray-400 hover:text-white text-sm transition-colors"
                disabled={loading}
              >
                رجوع
              </button>
            </motion.div>
          )}

          {method === 'phone' && step === 'verify' && (
            <motion.div 
              key="phone-verify"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm text-gray-400 mb-2 mr-2 text-center">
                  أدخل الرمز المكون من 6 أرقام
                </label>
                <div className="flex justify-center">
                  <input 
                    type="text"
                    dir="ltr"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-40 bg-[#0A0C13] border border-blue-500/40 p-4 rounded-2xl text-center text-3xl tracking-[0.5em] font-mono text-white outline-none focus:border-blue-400 transition-all"
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 text-red-400 rounded-xl text-sm border border-red-500/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button 
                onClick={handleVerifyOTP}
                disabled={loading || otp.length < 6}
                className="w-full flex items-center justify-center gap-2 p-4 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:hover:bg-green-600 text-white rounded-2xl font-bold transition-all"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    <span>تأكيد الدخول</span>
                    <ShieldCheck className="w-5 h-5" />
                  </>
                )}
              </button>

              <button 
                onClick={() => { setStep('input'); setError(null); }}
                className="w-full p-2 text-gray-400 hover:text-white text-sm transition-colors"
                disabled={loading}
              >
                تغيير رقم الجوال
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}
