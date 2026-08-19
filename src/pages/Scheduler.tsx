import { useEffect } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Clock } from "lucide-react";

export default function Scheduler() {
  const filloutFormId = "ekmXie9Vt9us";
  const filloutUrl = `https://forms.fillout.com/t/${filloutFormId}`;

  useEffect(() => {
    // Scroll smoothly to top on arrival
    window.scrollTo(0, 0);

    // Initialize Fillout embed if script is present
    if (typeof (window as any).Fillout !== "undefined") {
      try {
        (window as any).Fillout?.init?.();
      } catch (e) {}
    }
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-babun-accent selection:text-babun-primary pt-36 md:pt-48 pb-12 w-full flex flex-col items-center">
      {/* Background Accent Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-babun-accent/10 rounded-full blur-[180px]" />
      </div>

      {/* Top Header Section - Fully Centered, No green border */}
      <div className="w-full max-w-5xl px-4 md:px-8 relative z-10 text-center mb-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4 max-w-3xl mx-auto flex flex-col items-center"
        >
          {/* Status Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 text-sm font-bold border border-emerald-500/30">
            <CheckCircle2 size={16} />
            <span>התשלום נקלט בהצלחה</span>
          </div>

          {/* Centered Main Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white tracking-tight leading-tight">
            מעולה! כעת קבעו את המועד הנוח לכם ביומן
          </h1>

          {/* Centered Description */}
          <p className="text-base sm:text-lg text-neutral-300 font-light leading-relaxed max-w-2xl mx-auto">
            בחרו מתוך היומן למטה את התאריך והשעה המתאימים לפגישת הייעוץ האישית עם יעקב רייניץ. מיד לאחר הבחירה תקבלו אישור ישיר ליומן ולמייל.
          </p>

          <div className="inline-flex items-center gap-2 text-xs text-neutral-400 bg-neutral-900 px-4 py-1.5 rounded-full border border-neutral-800">
            <Clock size={14} className="text-babun-accent" />
            <span>משך הפגישה: כ-60 דקות</span>
          </div>
        </motion.div>
      </div>

      {/* 100% Full Width Fillout Container */}
      <div className="w-full px-2 sm:px-4 md:px-8 max-w-[1400px] relative z-10">
        <div className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[850px] border border-neutral-800">
          <iframe
            src={filloutUrl}
            title="תיאום מועד פגישת ייעוץ - Fillout"
            className="w-full h-[880px] md:h-[950px] border-0"
            allow="camera; microphone; autoplay; encrypted-media; fullscreen"
          />
        </div>
      </div>

    </div>
  );
}
