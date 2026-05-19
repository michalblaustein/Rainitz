import { motion } from "motion/react";
import { CheckCircle, Target, Shield, Users, Award, TrendingUp, Presentation, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="bg-babun-light pt-32 pb-24 min-h-screen">
      {/* Page Header Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-20 text-right">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 border-b border-babun-primary/10 pb-20">
          <div className="max-w-3xl">
             <span className="inline-block text-[11px] font-bold uppercase tracking-[0.5em] text-babun-accent mb-6 px-4 py-1.5 border border-babun-accent/20 bg-babun-accent/5">
                ON A MISSION
              </span>
              <h1 className="text-6xl md:text-8xl font-display font-black leading-[0.9] text-babun-primary mb-8 lowercase tracking-tighter">
                Our <br />
                <span className="text-babun-accent italic">Story.</span>
              </h1>
          </div>
          <div className="lg:max-w-md pt-12">
             <p className="text-babun-primary/60 text-lg leading-relaxed font-light">
               עיתונאי שהפך למומחה נדל"ן. מומחה שהפך לשליחות. 18 שנות ניסיון במרכז העשייה.
             </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-40">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-right"
          >
            <h2 className="text-4xl md:text-5xl font-display font-black text-babun-primary mb-10 tracking-tight">הביוגרפיה.</h2>
            <div className="space-y-8 text-lg text-babun-primary/70 leading-relaxed font-light">
              <p>
                18 שנה בשטח — כעיתונאי כלכלי וכמומחה נדל"ן — לימדו אותי דבר אחד: רוב הבעיות בנדל"ן לא נולדות מרצון רע. הן נולדות מחוסר מידע.
              </p>
              <p>
                כשהתחלתי לכתוב את הטור השבועי ב"המודיע", הייתה לי מטרה אחת: לתת לאנשים את הכלים שהשוק לא נותן להם. לא שיחת מכירה. לא הבטחה לתשואה. ידע. שקוף. מדויק. בלי פילטרים.
              </p>
              <p>
                כיום, מרכז רייניץ לנדל"ן הוא המקום שבו מתחברים יחד ייעוץ אישי, קורסים מקצועיים, וספר — כולם עם תפקיד אחד: שתגיע לחתימה ולטאבו מתוך בהירות מלאה ושקט נפשי.
              </p>
              <p>
                אני מאמין שכל עסקה חייבת להתחיל בתכנון פיננסי מדויק ובכללי זהירות בלתי מתפשרים. התפקיד שלי הוא לוודא שאתה לא רק "קונה קירות" — אלא מבצע השקעה שתצמח יחד איתך.
              </p>
            </div>
            
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-8">
               <div className="p-8 bg-white border border-babun-primary/5 rounded-babun-md relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-1 h-full bg-babun-accent" />
                  <Target size={24} className="mb-4 text-babun-primary group-hover:text-babun-accent transition-colors" />
                  <div className="text-sm font-black text-babun-primary mb-1 uppercase tracking-wider">עיתונאי כלכלי</div>
                  <div className="text-xs opacity-40 font-bold uppercase tracking-widest">כיסוי שוק הנדל"ן הישראלי</div>
               </div>
               <div className="p-8 bg-white border border-babun-primary/5 rounded-babun-md relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-1 h-full bg-babun-accent" />
                  <Award size={24} className="mb-4 text-babun-primary group-hover:text-babun-accent transition-colors" />
                  <div className="text-sm font-black text-babun-primary mb-1 uppercase tracking-wider">טור שבועי "המודיע"</div>
                  <div className="text-xs opacity-40 font-bold uppercase tracking-widest">ניתוחים, עצות, מאחורי הקלעים</div>
               </div>
               <div className="p-8 bg-white border border-babun-primary/5 rounded-babun-md relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-1 h-full bg-babun-accent" />
                  <BookOpen size={24} className="mb-4 text-babun-primary group-hover:text-babun-accent transition-colors" />
                  <div className="text-sm font-black text-babun-primary mb-1 uppercase tracking-wider">מחבר "שליש בקרקע"</div>
                  <div className="text-xs opacity-40 font-bold uppercase tracking-widest">הידע בפורמט נגיש לכולם</div>
               </div>
               <div className="p-8 bg-white border border-babun-primary/5 rounded-babun-md relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-1 h-full bg-babun-accent" />
                  <Presentation size={24} className="mb-4 text-babun-primary group-hover:text-babun-accent transition-colors" />
                  <div className="text-sm font-black text-babun-primary mb-1 uppercase tracking-wider">מרכז רייניץ</div>
                  <div className="text-xs opacity-40 font-bold uppercase tracking-widest">ייעוץ, קורסים, ליווי</div>
               </div>
            </div>
          </motion.div>

          {/* Portrait Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative group">
              <div className="absolute -inset-4 border border-babun-accent/20 translate-x-4 translate-y-4 -z-10 transition-transform duration-700 hover:translate-x-0 hover:translate-y-0" />
              <div className="aspect-[4/5] bg-babun-primary overflow-hidden rounded-babun-lg grayscale">
                <img 
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200" 
                  alt="Jacob Rainitz" 
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
              <div className="absolute top-10 -right-10 bg-babun-accent text-babun-primary p-12 shadow-2xl max-w-xs text-right rounded-babun-md">
                 <div className="text-5xl font-display font-black mb-2 italic">18</div>
                 <div className="text-[10px] uppercase tracking-widest font-bold opacity-60">שנה שבהן ליוויתי את פני השוק.</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* VALUES */}
        <section className="py-32 border-t border-babun-primary/5">
           <div className="mb-20 text-right">
              <h2 className="text-4xl md:text-5xl font-display font-black text-babun-primary tracking-tight">אני עובד לפי כללים פשוטים:</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: "אומר את האמת", desc: "גם כשהיא לא נוחה" },
                { title: "ללא ניגוד אינטרסים", desc: "לא מחויב לאף קבלן ולאף יזם" },
                { title: "בשפה שלך", desc: "מסביר פשוט, לא בשפת המקצוע" },
                { title: "אחריות מלאה", desc: "לא מכניס אותך לעסקה שאינך מוכן לה" }
              ].map((val, i) => (
                <div key={i} className="text-right p-10 bg-white border border-babun-primary/5 rounded-babun-lg flex flex-col items-end">
                   <div className="w-10 h-10 bg-babun-accent/20 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle size={20} className="text-babun-primary" />
                   </div>
                   <div className="text-lg font-bold text-babun-primary mb-2 tracking-tight">{val.title}</div>
                   <div className="text-[11px] font-bold uppercase tracking-widest opacity-40">{val.desc}</div>
                </div>
              ))}
           </div>
        </section>

        {/* MEDIA RECOGNITION */}
        <section className="py-20 mt-20 bg-babun-primary text-white p-20 rounded-babun-lg text-right relative overflow-hidden">
           <div className="relative z-10">
              <h3 className="text-2xl font-display font-bold mb-8 text-babun-accent italic">מופיע באופן קבוע ב:</h3>
              <div className="flex flex-wrap gap-12 justify-end opacity-40 grayscale invert">
                 <span className="text-3xl font-display font-black">המודיע</span>
                 <span className="text-3xl font-display font-black">כלכלה נבונה</span>
                 <span className="text-3xl font-display font-black">קווי מידע</span>
              </div>
           </div>
           <Award className="absolute -bottom-10 -left-10 text-white/5" size={200} />
        </section>

        <section className="py-40 text-center">
           <h2 className="text-4xl font-display font-black text-babun-primary mb-10 tracking-tight">רוצה לדבר?</h2>
           <p className="text-xl text-babun-primary/60 font-light mb-12">פגישת ייעוץ אחת. 60 דקות. ₪1,200.</p>
           <Link to="/consulting" className="btn-babun-primary px-16 py-6 shadow-2xl">קביעת מועד ←</Link>
        </section>
      </div>
    </div>
  );
}

