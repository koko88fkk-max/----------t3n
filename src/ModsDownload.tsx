import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Monitor, ChevronLeft, ChevronRight, X, ShieldCheck } from 'lucide-react';

const LOGO_URL = "/logo.png";
const GDRIVE_URL = "https://drive.google.com/file/d/1GSJoul75rHGHwi__NU2ZK7jLqAK_zVZC/view?usp=sharing";

const images = [
  "/mods/dsada.webp.webp",
  "/mods/sde.png.png",
  "/mods/see.webp.webp",
  "/mods/seero.png.png",
  "/mods/serr.png.png",
  "/mods/serro.png.png",
  "/mods/ssss.png.png",
];

export default function ModsDownload() {
  const [currentImage, setCurrentImage] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  // Auto slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleDownload = () => {
    window.open(GDRIVE_URL, '_blank');
  };

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="min-h-screen bg-[#020618] relative overflow-hidden font-sans text-white selection:bg-blue-500/30">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#020512]" />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-[#1e3a8a] blur-[150px] mix-blend-screen" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-[10%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-[#1d4ed8] blur-[130px] mix-blend-screen" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020512] via-transparent to-transparent opacity-80" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between p-6 md:px-12 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img src={LOGO_URL} alt="T3N Logo" className="w-10 h-10 object-contain rounded-xl" />
          <span className="font-black text-xl tracking-wider">T3N <span className="text-blue-400">MODS</span></span>
        </div>
        <a href="/" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">العودة للرئيسية</a>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-12 md:py-20">
        <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-stretch">
          
          {/* Left Side: Info & Download */}
          <div className="flex-1 text-right flex flex-col justify-center order-2 lg:order-1 w-full max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-800/20 border border-blue-700/30 text-blue-500 font-bold text-sm mb-6">
                <Monitor className="w-4 h-4" /> مود الجرافيك الأقوى
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                مود الجودة <br/> <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-600 to-indigo-800">𝗚𝗥𝗔𝗣𝗛𝗜𝗖𝗦 𝗙𝗜𝗩𝗘𝗠</span>
              </h1>
              
              <p className="text-lg md:text-xl text-blue-100/70 mb-10 leading-relaxed font-medium">
                ارفع مستوى تجربتك البصرية إلى أقصى حد! هذا المود مصمم خصيصاً لتحسين جودة الرسومات، الألوان، والتفاصيل الدقيقة في اللعبة.
              </p>

              {/* Download Box */}
              <div className="bg-[#0a1a5c]/40 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(59,130,246,0.15)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out" />
                
                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                  <div className="w-20 h-20 shrink-0 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    <Download className="w-10 h-10 text-blue-400" />
                  </div>
                  
                  <div className="flex-1 text-center md:text-right">
                    <h2 className="text-2xl font-black text-white mb-2">T3N mods.rar</h2>
                    <p className="text-blue-200/60 text-sm font-bold flex items-center justify-center md:justify-end gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" /> آمن ومفحوص بنسبة 100% — مجاني للجميع
                    </p>
                  </div>

                  <motion.button 
                    onClick={handleDownload}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] flex items-center justify-center gap-3 shrink-0"
                  >
                    <Download className="w-5 h-5" />
                    تحميل مجاني الحين
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Side: Image Gallery */}
          <div className="flex-1 w-full order-1 lg:order-2">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <div className="flex items-center gap-3 mb-4 justify-end">
                <span className="text-white font-black text-lg tracking-wide">صور من داخل <span className="text-blue-400">𝗙𝗜𝗩𝗘𝗠</span></span>
                <div className="h-0.5 flex-1 bg-gradient-to-r from-blue-600/60 to-transparent rounded-full" />
              </div>
              <div 
                className="relative aspect-video rounded-[32px] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] group cursor-zoom-in" 
                onClick={() => setFullscreenImage(images[currentImage])}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImage}
                    src={images[currentImage]}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 w-full h-full object-cover"
                    alt={`T3N Mod Screenshot ${currentImage + 1}`}
                  />
                </AnimatePresence>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Navigation Arrows */}
                <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-all border border-white/10"><ChevronLeft className="w-6 h-6" /></button>
                  <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-all border border-white/10"><ChevronRight className="w-6 h-6" /></button>
                </div>

                {/* Dots indicator */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
                  {images.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={(e) => { e.stopPropagation(); setCurrentImage(i); }} 
                      className={`h-2.5 rounded-full transition-all ${i === currentImage ? 'bg-blue-500 w-8 shadow-[0_0_10px_rgba(59,130,246,0.8)]' : 'w-2.5 bg-white/30 hover:bg-white/50'}`} 
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </main>

      {/* Fullscreen Image Modal */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setFullscreenImage(null)}
          >
            <button className="absolute top-6 right-6 p-3 bg-white/10 rounded-full text-white hover:bg-red-500/50 transition-all"><X className="w-6 h-6" /></button>
            <img src={fullscreenImage} alt="Fullscreen" className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
