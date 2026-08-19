import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Calendar, ShieldCheck, Clock, ExternalLink } from "lucide-react";

export default function Scheduler() {
  const filloutFormId = "ekmXie9Vt9us";
  const filloutUrl = `https://forms.fillout.com/t/${filloutFormId}`;
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    // Scroll smoothly to top on arrival
    window.scrollTo(0, 0);

    // If Fillout script exists globally, re-trigger
    if (typeof (window as any).Fillout !== "undefined") {
      try {
        (window as any).Fillout?.init?.();
      } catch (e) {}
    }
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-babun-accent selection:text-babun-primary pt-24 pb-20 px-4 md:px-8">
      {/* Background Accent Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-babun-accent/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        
        {/* Top Success Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-neutral-900/90 backdrop-blur-md border border-emerald-500/30 rounded-babun-xl p-6 md:p-8 text-right shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-emerald-500 via-babun-accent to-emerald-400" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                <CheckCircle2 size={32} className="text-emerald-400" />
              </div>
              <div className="space-y-1 text-right">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                  <ShieldCheck size={13} />
                  <span>התשלום נקלט בהצלחה</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-display font-black text-white">
                  מעולה! כעת קבעו את המועד הנוח לכם ביומן
                </h1>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs text-neutral-400 bg-neutral-800/80 px-4 py-2 rounded-xl border border-neutral-700">
              <Clock size={15} className="text-babun-accent" />
              <span>משך הפגישה: כ-60 דקות</span>
            </div>
          </div>

          <p className="text-sm md:text-base text-neutral-300 font-light mt-4 leading-relaxed">
            בחרו מתוך היומן למטה את התאריך והשעה המתאימים לפגישת הייעוץ האישית עם יעקב רייניץ. מיד לאחר הבחירה תקבלו אישור ישיר ליומן ולמייל.
          </p>
        </motion.div>

        {/* Fillout Embedded Calendar Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-white rounded-babun-xl shadow-2xl overflow-hidden border border-neutral-800 min-h-[750px] relative"
        >
          {/* Fallback Loading State */}
          {!iframeLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 text-babun-primary">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-babun-primary border-t-transparent mb-4" />
              <p className="font-display font-bold text-sm text-neutral-600">טוען את יומן הפגישות...</p>
            </div>
          )}

          {/* Fillout Form Iframe */}
          <iframe
            src={filloutUrl}
            title="תיאום מועד פגישת ייעוץ - Fillout"
            onLoad={() => setIframeLoaded(true)}
            className="w-full min-h-[780px] md:min-h-[840px] border-0"
            allow="camera; microphone; autoplay; encrypted-media; fullscreen"
          />
        </motion.div>

        {/* External Link Direct Backup */}
        <div className="text-center pt-2 pb-6">
          <a
            href={filloutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-babun-accent transition-colors py-2 px-4 rounded-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700"
          >
            <span>היומן לא נטען בצורה חלקה במכשירך? לחץ לפתיחה ישירה בחלון חדש</span>
            <ExternalLink size={12} />
          </a>
        </div>

      </div>
    </div>
  );
}
