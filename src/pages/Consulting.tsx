import { motion } from "motion/react";
import { Users, Clock, Landmark, Home, CheckCircle, ArrowRight, Video, Calendar, MapPin, Calculator } from "lucide-react";
import { Link } from "react-router-dom";

export default function Consulting() {
  return (
    <div className="bg-babun-light pt-32 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-20 text-right">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 border-b border-babun-primary/10 pb-20">
          <div className="max-w-3xl">
             <span className="inline-block text-[11px] font-bold uppercase tracking-[0.5em] text-babun-accent mb-6 px-4 py-1.5 border border-babun-accent/20 bg-babun-accent/5">
                EXPERT GUIDANCE
              </span>
              <h1 className="text-6xl md:text-8xl font-display font-black leading-[0.9] text-babun-primary mb-8 lowercase tracking-tighter">
                Smart <br />
                <span className="text-babun-accent italic">Advice.</span>
              </h1>
          </div>
          <div className="lg:max-w-md pt-12">
             <h2 className="text-2xl font-display font-bold text-babun-primary mb-4">שאלה נכונה שווה יותר ממיליון שקל.</h2>
             <p className="text-babun-primary/60 text-lg leading-relaxed font-light">
               60 דקות. ₪1,200. תצא עם תמונה ברורה — ולא עם עוד בלבול.
             </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          <div className="lg:col-span-8 space-y-20 order-2 lg:order-1 text-right">
             <section>
                <h3 className="text-4xl font-display font-black text-babun-primary mb-10 tracking-tight">מה קורה בפגישה.</h3>
                <div className="text-xl text-babun-primary/70 leading-relaxed font-light space-y-6 mb-12">
                   <p>אין שאלות "טיפשות" כאן. אתה מביא את העסקה, הנכס, הספקות — ואני מביא 18 שנים של ניסיון בלב שוק הנדל"ן.</p>
                   <p>בסוף הפגישה — יש לך החלטה. לא "בואו נראה". תצא עם רשימת צעדים מעשיים וביטחון מלא בדרך שלך.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {[
                     { title: "הנכס שאתה בוחן", desc: "שווי, מצב, סיכונים שאולי פספסת.", icon: Home },
                     { title: "המשכנתא שלך", desc: "האם היא באמת מתאימה לצרכי המשק הבית שלך?", icon: Landmark },
                     { title: "צעד הבא", desc: "בניית אסטרטגיה ברורה - מה עושים מכאן?", icon: ArrowRight },
                     { title: "כדאיות כלכלית", desc: "חישוב קר ומדויק של רווחיות מול סיכון.", icon: Calculator },
                   ].map((item, i) => (
                     <div key={i} className="bg-white p-10 border border-babun-primary/5 rounded-babun-lg flex flex-col items-end">
                        <item.icon className="text-babun-accent mb-6" size={32} strokeWidth={1.5} />
                        <h4 className="text-lg font-display font-bold mb-2 text-babun-primary">{item.title}</h4>
                        <p className="text-babun-primary/60 text-sm leading-relaxed">{item.desc}</p>
                     </div>
                   ))}
                </div>
             </section>

             <section className="bg-babun-primary text-white p-12 md:p-20 rounded-babun-lg relative overflow-hidden">
                <div className="relative z-10">
                   <h3 className="text-3xl font-display font-black text-babun-accent mb-8 tracking-tight">למי זה מתאים?</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {[
                        "לפני שחותמים על חוזה רכישה",
                        "כשיש עסקה על השולחן ולא בטוחים",
                        "כשעשית עסקה שלא יצאה כמו שחשבת",
                        "כשרוצים לבנות אסטרטגיית השקעה חכמה"
                      ].map((text, i) => (
                        <div key={i} className="flex items-center gap-4 justify-end">
                           <span className="text-lg font-light text-white/80">{text}</span>
                           <CheckCircle size={20} className="text-babun-accent shrink-0" />
                        </div>
                      ))}
                   </div>
                </div>
                <Users className="absolute -bottom-10 -left-10 text-white/5" size={200} />
             </section>
          </div>

          <aside className="lg:col-span-4 order-1 lg:order-2">
             <div className="sticky top-32">
                <div className="bg-white p-10 shadow-2xl border border-babun-accent/30 rounded-babun-lg text-right">
                   <h2 className="text-2xl font-display font-black text-babun-primary mb-2">הזמנת פגישה</h2>
                   <p className="text-xs font-bold opacity-30 uppercase tracking-widest mb-10">Book a session</p>
                   
                   <div className="space-y-8 mb-12">
                      <div className="flex items-center gap-6 justify-end">
                         <div className="text-right">
                            <div className="text-[10px] font-bold opacity-30 uppercase tracking-widest">מחיר הפגישה</div>
                            <div className="text-2xl font-display font-black text-babun-primary">₪1,200</div>
                         </div>
                         <div className="w-12 h-12 bg-babun-light rounded-full flex items-center justify-center text-babun-accent"><Users size={20} /></div>
                      </div>
                      <div className="flex items-center gap-6 justify-end">
                         <div className="text-right">
                            <div className="text-[10px] font-bold opacity-30 uppercase tracking-widest">אורך הפגישה</div>
                            <div className="text-xl font-display font-bold text-babun-primary">כ-60 דקות</div>
                         </div>
                         <div className="w-12 h-12 bg-babun-light rounded-full flex items-center justify-center text-babun-accent"><Clock size={20} /></div>
                      </div>
                      <div className="flex items-center gap-6 justify-end">
                         <div className="text-right">
                            <div className="text-[10px] font-bold opacity-30 uppercase tracking-widest">מיקום</div>
                            <div className="text-sm font-bold text-babun-primary">בני ברק / שיחת וידאו</div>
                         </div>
                         <div className="w-12 h-12 bg-babun-light rounded-full flex items-center justify-center text-babun-accent"><MapPin size={20} /></div>
                      </div>
                   </div>

                   <button className="w-full bg-babun-primary text-white py-6 uppercase tracking-[0.3em] font-black text-[11px] hover:bg-babun-accent hover:text-babun-primary transition-all duration-500 shadow-2xl flex items-center justify-center gap-4 rounded-babun-sm mb-6">
                      הזמן פגישה ושלם עכשיו
                   </button>
                   <p className="text-center text-[10px] font-bold opacity-30 uppercase tracking-widest">מאושר על ידי פלנדו / מערכת סליקה בטווח</p>
                </div>
             </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
