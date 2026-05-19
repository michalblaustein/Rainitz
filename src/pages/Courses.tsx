import { motion } from "motion/react";
import { Presentation, CheckCircle, ArrowLeft, ArrowRight, Video, Users, User, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Courses() {
  const [status, setStatus] = useState<null | "loading" | "success">(null);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await addDoc(collection(db, "course_registrations"), { ...formData, createdAt: serverTimestamp() });
      setStatus("success");
    } catch (e) {
      console.error(e);
      setStatus(null);
    }
  };

  const curriculum = [
    { num: "1", title: "איך עובד שוק הנדל\"ן", desc: "מה אתה לא רואה במבט ראשון, מגמות ופסיכולוגיה של השוק." },
    { num: "2", title: "תכנון פיננסי ומשכנתאות", desc: "מה ששווה לדעת לפני שיוצאים לדרך - המספרים האמיתיים." },
    { num: "3", title: "בדיקת נכסים", desc: "מה לבדוק ואיך לבדוק - פיזית ותכנונית." },
    { num: "4", title: "אנשי המקצוע", desc: "מתווך, שמאי, עורך דין, קבלן - איך לנהל אותם לטובתך." },
    { num: "5", title: "עסקאות מיוחדות", desc: "מחיר למשתכן, קבוצות רכישה, תמ\"א 38 - סיכוי מול סיכון." },
    { num: "6", title: "ניהול משא ומתן", desc: "איך לסגור עסקה חכמה ולא לוותר על מה שחשוב." },
  ];

  return (
    <div className="bg-babun-light pt-32 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-20 text-right">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 border-b border-babun-primary/10 pb-20">
          <div className="max-w-3xl">
             <span className="inline-block text-[11px] font-bold uppercase tracking-[0.5em] text-babun-accent mb-6 px-4 py-1.5 border border-babun-accent/20 bg-babun-accent/5">
                KNOWLEDGE IS POWER
              </span>
              <h1 className="text-6xl md:text-8xl font-display font-black leading-[0.9] text-babun-primary mb-8 lowercase tracking-tighter">
                Smart <br />
                <span className="text-babun-accent italic">Learning.</span>
              </h1>
          </div>
          <div className="lg:max-w-md pt-12">
             <h2 className="text-2xl font-display font-bold text-babun-primary mb-4">הקורס שהיית צריך לפני שקנית.</h2>
             <p className="text-babun-primary/60 text-lg leading-relaxed font-light">
               6 מפגשים. שלב אחר שלב. בסוף — אתה מבין ננדל"ן בעצמך.
             </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          <div className="lg:col-span-8 space-y-20 order-2 lg:order-1 text-right">
             <section>
                <h3 className="text-4xl font-display font-black text-babun-primary mb-10 tracking-tight">על הקורס.</h3>
                <div className="text-xl text-babun-primary/70 leading-relaxed font-light space-y-6">
                   <p>רוב האנשים מגיעים לרכישה עם מידע חסר. הם יודעים שיש "משכנתא" ויש "מחיר מבוקש" — אבל לא יודעים מה הם לא יודעים.</p>
                   <p>הקורס הזה נבנה מ-18 שנות ניסיון בשטח ומשאלות שלקוחות שאלו אותי לפני שחתמו — ואחרי.</p>
                </div>
             </section>

             <section>
                <div className="flex items-center justify-between flex-row-reverse mb-12 border-b border-babun-primary/5 pb-4">
                   <h3 className="text-3xl font-display font-black text-babun-primary tracking-tight">סילבוס הלימודים.</h3>
                   <span className="text-xs font-bold opacity-30 uppercase tracking-widest text-right">6 SESSIONS</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {curriculum.map((item, i) => (
                     <div key={i} className="bg-white p-10 border border-babun-primary/5 rounded-babun-lg group hover:border-babun-accent transition-all duration-500">
                        <div className="text-4xl font-display font-black text-babun-accent/20 group-hover:text-babun-accent transition-colors mb-6">{item.num}</div>
                        <h4 className="text-xl font-display font-bold mb-4 text-babun-primary">{item.title}</h4>
                        <p className="text-babun-primary/60 text-sm leading-relaxed">{item.desc}</p>
                     </div>
                   ))}
                </div>
             </section>

             <section className="bg-babun-primary text-white p-12 md:p-20 rounded-babun-lg relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                   <div className="flex-1">
                      <h3 className="text-3xl font-display font-black text-babun-accent mb-4 tracking-tight">הקורס הדיגיטלי — בקרוב</h3>
                      <p className="text-white/60 text-lg font-light leading-relaxed">לא יכול להגיע פיזית? הקורס המוקלט בדרך. השאירו פרטים להרשמה מוקדמת.</p>
                   </div>
                   <button className="btn-babun-primary border-transparent whitespace-nowrap">הרשמה מוקדמת</button>
                </div>
                <Video className="absolute -bottom-10 -left-10 text-white/5" size={200} />
             </section>
          </div>

          <aside className="lg:col-span-4 order-1 lg:order-2">
             <div className="sticky top-32">
                <div className="bg-white p-10 shadow-2xl border border-babun-accent/30 rounded-babun-lg text-right">
                   <h2 className="text-2xl font-display font-black text-babun-primary mb-2">הרשמה לקורס</h2>
                   <p className="text-xs font-bold opacity-30 uppercase tracking-widest mb-8">Save your spot</p>
                   
                   <div className="space-y-6 mb-10">
                      <div className="flex items-center gap-4 justify-end text-sm font-bold text-babun-primary/70">
                         <span>מחזור קרוב: ספטמבר 2026</span>
                         <Calendar size={18} className="text-babun-accent" />
                      </div>
                      <div className="flex items-center gap-4 justify-end text-sm font-bold text-babun-primary/70">
                         <span>קבוצות של עד 25 משתתפים</span>
                         <Users size={18} className="text-babun-accent" />
                      </div>
                      <div className="flex items-center gap-4 justify-end text-sm font-bold text-babun-primary/70">
                         <span>₪4,500 + מע"מ למשתתף</span>
                         <CheckCircle size={18} className="text-babun-accent" />
                      </div>
                   </div>

                   {status === "success" ? (
                      <div className="text-center py-10 bg-babun-accent/10 border border-babun-accent rounded-babun-md font-bold text-babun-primary">
                         נרשמת בהצלחה! ניצור קשר לתיאום.
                      </div>
                   ) : (
                      <form onSubmit={handleRegister} className="space-y-6">
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest block">שם מלא</label>
                            <input 
                              required
                              className="input-babun w-full text-right"
                              value={formData.name}
                              onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest block">טלפון</label>
                            <input 
                              required
                              className="input-babun w-full text-left"
                              value={formData.phone}
                              onChange={e => setFormData({...formData, phone: e.target.value})}
                            />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest block">מייל</label>
                            <input 
                              required
                              type="email"
                              className="input-babun w-full text-right"
                              value={formData.email}
                              onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                         </div>
                         <button 
                           disabled={status === "loading"}
                           className="w-full btn-babun-primary justify-center py-4 uppercase tracking-widest"
                         >
                           {status === "loading" ? "מעבד..." : "שמור לי מקום"}
                         </button>
                      </form>
                   )}
                </div>
             </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
