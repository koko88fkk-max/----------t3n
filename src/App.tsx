import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Download, ExternalLink, MessageCircle, AlertTriangle, 
  CheckCircle2, Play, Cpu, RefreshCw, FileArchive, Wrench, ChevronDown, 
  Copy, Check, ShieldAlert, Sparkles
} from 'lucide-react';

const LOGO_URL = "/logo.png";
const STORE_URL = "https://salla.sa/t3nn";
const DISCORD_URL = "https://discord.gg/tjMWEccj3J";

function CopyButton({ text, label = "نسخ" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button 
      onClick={handleCopy} 
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${
        copied 
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
          : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
      }`}
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      <span>{copied ? 'تم النسخ' : label}</span>
    </button>
  );
}

export default function App() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const steps = [
    {
      num: "01",
      title: "تجهيز الكمبيوتر وتعطيل الحمايات",
      desc: "قبل تشغيل السبوفر، قم بإيقاف جدار الحماية (Windows Defender) وأي برنامج حماية من الفيروسات لتجنب حظر ملفات النظام.",
      icon: ShieldAlert,
      tag: "خطوة مهمة جداً",
      commands: [
        { label: "أمر إيقاف الحماية السريع (PowerShell):", cmd: "Set-MpPreference -DisableRealtimeMonitoring $true" }
      ]
    },
    {
      num: "02",
      title: "تحميل ملف السبوفر والأدوات المساعدة",
      desc: "قم بتحميل حزمة السبوفر الرسمية وفك الضغط عنها في مجلد جديد على سطح المكتب.",
      icon: Download,
      tag: "التحميل الآمن",
      downloadUrl: "/External_T3N.rar"
    },
    {
      num: "03",
      title: "تشغيل الملف كمسؤول (Administrator)",
      desc: "اضغط بالزر الأيمن على ملف السبوفر واختر 'Run as Administrator'. ضع مفتاح التفعيل الخاص بك ثم اضغط Enter.",
      icon: Cpu,
      tag: "التفعيل الفوري"
    },
    {
      num: "04",
      title: "إعادة التشغيل والاستمتاع باللعب",
      desc: "بعد ظهور رسالة نجاح السبوفر، أعد تشغيل الجهاز. يمكنك الآن الدخول للعبة بحساب جديد وبدون أي باند نهائياً!",
      icon: CheckCircle2,
      tag: "تم فك الباند بنجاح"
    }
  ];

  const faqs = [
    {
      q: "ماذا أفعل إذا ظهرت لي رسالة حظر من برنامج الحماية؟",
      a: "تأكد من إيقاف Real-time Protection في جدار حماية الويندوز وإضافة مجلد السبوفر لقائمة الاستثناءات (Exclusions)."
    },
    {
      q: "هل السبوفر يعمل على جميع الألعاب والتحديثات؟",
      a: "نعم، سبوفر تعن يدعم فك الباند النهائي والهاردوير لجميع الألعاب (Fortnite, Valorant, Call of Duty, Apex, etc)."
    },
    {
      q: "ما هي طريقة التأكد من تغيير السيريال نمبر بالكامل؟",
      a: "يمكنك التحقق من تغيير الهاردوير وسيريالات المذربورد والهاردسك فور إعادة تشغيل الجهاز عبر فتح موجه الأوامر CMD."
    }
  ];

  return (
    <div className="min-h-screen bg-[#06060c] text-white font-sans antialiased selection:bg-blue-600 selection:text-white" dir="rtl">
      
      {/* Background Glow Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#06060c]/80 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="T3N Logo" className="w-12 h-12 rounded-xl border border-white/10 shadow-lg" />
            <div>
              <h1 className="font-black text-xl tracking-wider text-white flex items-center gap-2">
                تــعــن <span className="text-blue-500 text-xs px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">SPOOFER</span>
              </h1>
              <p className="text-[11px] text-zinc-400">الدليل الرسمي لفك الباند النهائي</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a 
              href={DISCORD_URL} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] font-bold text-xs transition-all shadow-lg shadow-indigo-500/20"
            >
              <MessageCircle className="w-4 h-4" />
              <span>مجتمع الديسكورد</span>
            </a>
            <a 
              href={STORE_URL} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-xs transition-all"
            >
              <ExternalLink className="w-4 h-4 text-zinc-400" />
              <span>المتجر الرسمي</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-16 relative z-10">
        
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto pt-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>شرح تفعيل سبوفر تعن الرسمي T3N Spoofer</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-white leading-tight"
          >
            دليل فك الباند النهائي وشرح الاستخدام خطوة بخطوة
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-sm md:text-base leading-relaxed"
          >
            قم باتباع الخطوات الموضحة أسفله لتنفيذ عملية التغيير وتجاوز الباند النهائي بسهولة وأمان 100%.
          </motion.p>
        </section>

        {/* Video Tutorial Section */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#0F111A] shadow-2xl p-4 md:p-6"
        >
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-white text-base">الشرح المرئي للتفعيل (شرح بالفيديو)</h3>
            </div>
            <span className="text-xs text-zinc-500">مدة الشرح: 2 دقيقة</span>
          </div>

          <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/60 border border-white/5 flex items-center justify-center">
            <video 
              controls 
              className="w-full h-full object-cover"
              poster="/bg-fortnite-new.jpg"
            >
              <source src="/video-fortnite-main.mp4" type="video/mp4" />
              متصفحك لا يدعم تشغيل الفيديو المباشر.
            </video>
          </div>
        </motion.section>

        {/* Step-by-Step Cards */}
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-white flex items-center gap-3">
              <Wrench className="w-6 h-6 text-blue-500" />
              <span>خطوات التفعيل الشاملة</span>
            </h3>
            <span className="text-xs text-zinc-500">4 خطوات سهلة</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-[#0F111A] border border-white/10 rounded-2xl p-6 relative hover:border-blue-500/30 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-black text-white/10 group-hover:text-blue-500/20 transition-colors">
                      {step.num}
                    </span>
                  </div>

                  <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-400 mb-3">
                    {step.tag}
                  </div>

                  <h4 className="text-lg font-bold text-white mb-2">{step.title}</h4>
                  <p className="text-zinc-400 text-xs leading-relaxed mb-4">{step.desc}</p>

                  {step.commands && step.commands.map((c, cIdx) => (
                    <div key={cIdx} className="mt-3 p-3 rounded-xl bg-black/50 border border-white/5 space-y-2">
                      <span className="text-[11px] text-zinc-400 font-bold block">{c.label}</span>
                      <div className="flex items-center justify-between bg-black/80 p-2 rounded-lg dir-ltr">
                        <code className="text-xs font-mono text-blue-300 truncate max-w-[280px]">{c.cmd}</code>
                        <CopyButton text={c.cmd} />
                      </div>
                    </div>
                  ))}

                  {step.downloadUrl && (
                    <a
                      href={step.downloadUrl}
                      download
                      className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white transition-all shadow-lg shadow-blue-600/20"
                    >
                      <FileArchive className="w-4 h-4" />
                      <span>تحميل حزمة السبوفر المباشرة</span>
                    </a>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Quick Downloads Section */}
        <section className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/20 rounded-3xl p-8 text-center space-y-6">
          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-2xl font-black text-white">روابط التحميل المباشرة والحلول</h3>
            <p className="text-xs text-zinc-400">حمل الملفات المطلوبة للبدء فوراً في فك الباند</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/External_T3N.rar"
              download
              className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold text-sm text-white transition-all shadow-xl shadow-blue-600/30"
            >
              <Download className="w-5 h-5" />
              <span>تحميل السبوفر (T3N Spoofer)</span>
            </a>
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 font-bold text-sm text-white transition-all"
            >
              <MessageCircle className="w-5 h-5 text-indigo-400" />
              <span>طلب المساعدة والدعم الفني</span>
            </a>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="space-y-6 pt-4">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-white">الأسئلة الشائعة وحل المشاكل</h3>
            <p className="text-xs text-zinc-400">إجابات سريعة لأهم استفسارات تفعيل السبوفر</p>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-[#0F111A] border border-white/10 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full p-5 text-right flex items-center justify-between font-bold text-sm text-white hover:bg-white/5 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform ${activeFaq === index ? 'rotate-180 text-blue-400' : ''}`} />
                </button>
                {activeFaq === index && (
                  <div className="p-5 pt-0 text-xs text-zinc-400 border-t border-white/5 leading-relaxed bg-black/20">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-20 py-8 text-center text-xs text-zinc-600 space-y-2">
        <p>جميع الحقوق محفوظة لمتجر تعن T3N © {new Date().getFullYear()}</p>
        <p className="text-[10px]">دليل التفعيل والتطوير لمستخدمي السبوفر الرسمي</p>
      </footer>

    </div>
  );
}
