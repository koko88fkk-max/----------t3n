import React from 'react';
import { Home, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#020618] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/20 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center max-w-lg w-full bg-[#0a1a5c]/40 backdrop-blur-xl border border-red-500/20 p-10 rounded-[32px] shadow-[0_0_50px_rgba(239,68,68,0.15)]"
      >
        <motion.div 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', bounce: 0.6 }}
          className="w-24 h-24 mx-auto bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center text-red-500 mb-8"
        >
          <AlertTriangle className="w-12 h-12" />
        </motion.div>

        <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 mb-4 tracking-tighter">404</h1>
        
        <h2 className="text-2xl font-bold text-white mb-4">الصفحة غير موجودة</h2>
        
        <p className="text-blue-200/60 mb-10 leading-relaxed text-lg">
          عذراً، الرابط الذي تحاول الوصول إليه غير صحيح أو تم نقل الصفحة. 
          الرجاء التأكد من الرابط أو العودة للصفحة الرئيسية.
        </p>

        <a 
          href="/"
          className="inline-flex items-center justify-center gap-3 w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] hover:scale-[1.02] active:scale-95"
        >
          <Home className="w-5 h-5" />
          العودة للرئيسية
        </a>
      </motion.div>
    </div>
  );
}
