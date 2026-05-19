import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, CheckCircle, Target, Shield, BookOpen, Users, MessageCircle, BarChart3, Presentation, Mail, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";

const trustLogos = [
  { name: "המודיע", url: "https://upload.wikimedia.org/wikipedia/he/thumb/d/d4/HaModia_logo.svg/1200px-HaModia_logo.svg.png" },
  { name: "كلية נבונה", url: "https://kolkalanavona.co.il/wp-content/uploads/2021/04/logo-new.png" },
  { name: "קווי מידע", url: "https://kaveimedia.co.il/wp-content/uploads/2021/02/logo.png" }
];

const services = [
  {
    title: "ייעוץ נדל\"ן אישי",
    desc: "פגישה אחת שמשנה את כל ההחלטה. מסתכלים יחד על העסקה, מזהים סיכונים שלא ראית, ובונים צעד ברור קדימה.",
    price: "₪1,200",
    cta: "קביעת מועד",
    link: "/consulting",
    icon: Users
  },
  {
    title: "קורסים מקצועיים",
    desc: "שישה מפגשים שבסופם אתה כבר לא תלוי באף אחד. למשקיעים, לזוגות, לכל מי שרוצה להבין את השוק לעומקו.",
    price: "הרשמה פתוחה",
    cta: "הצטרפות למחזור הקרוב",
    link: "/courses",
    icon: Presentation
  },
  {
    title: "הרצאות והדרכות",
    desc: "לארגונים, קהילות, וחברות. תוכן שמשנה את הדרך שבה אנשים מסתכלים על נדל\"ן — ממחרת.",
    price: "הזמנה מראש",
    cta: "תיאום הרצאה",
    link: "/contact",
    icon: MessageCircle
  },
  {
    title: "שיתופי פעולה",
    desc: "מתווך, יזם, או איש נדל\"ן שרוצה זווית חיצונית? נבנה מסגרת עבודה שמועילה לשני הצדדים.",
    price: "B2B",
    cta: "שלח פנייה",
    link: "/contact",
    icon: Shield
  },
  {
    title: "ספר \"שליש בקרקע\"",
    desc: "148 עמודים. כל מה שצריך לדעת לפני שחותמים. מהמשכנתא ועד הטאבו, מהמכרז ועד קבוצת הרכישה.",
    price: "₪149",
    cta: "הזמנת הספר",
    link: "/book",
    icon: BookOpen
  }
];

export default function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<null | "loading" | "success">(null);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await addDoc(collection(db, "newsletter"), { email, createdAt: serverTimestamp() });
      setStatus("success");
    } catch (e) {
      console.error(e);
      setStatus(null);
    }
  };

  return (
    <div className="bg-babun-light">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-babun-primary/5 -skew-x-12 translate-x-20 z-0" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 w-full relative z-10 text-right">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center gap-4 justify-end mb-8">
                   <div className="w-12 h-px bg-babun-accent" />
                   <span className="text-[11px] font-black uppercase tracking-[0.5em] text-babun-primary">Jacob Rainitz Real Estate</span>
                </div>
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-black leading-[0.85] text-babun-primary mb-10 tracking-tighter">
                  ידעת כמה <br />
                  עסקאות טובות <br />
                  <span className="text-babun-accent italic">אבדו?</span>
                </h1>
                <p className="text-xl md:text-2xl font-light text-babun-primary/60 mb-12 leading-relaxed max-w-2xl ml-auto">
                  18 שנות ניסיון. טור שבועי ב"המודיע". ספר שמסביר מה אף אחד לא אמר לך. יעקב רייניץ לצידך — מהשאלה הראשונה עד חתימת הטאבו.
                </p>
                <div className="flex flex-wrap gap-6 justify-end">
                   <Link to="/consulting" className="btn-babun-primary shadow-2xl shadow-babun-primary/20">
                      קביעת פגישת ייעוץ ←
                   </Link>
                   <Link to="/about" className="btn-babun-outline group">
                      קרא עוד על יעקב ←
                   </Link>
                </div>
              </motion.div>
            </div>
            <div className="lg:col-span-4 relative hidden lg:block">
               <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="aspect-[4/5] bg-babun-primary grayscale rounded-babun-lg overflow-hidden relative"
               >
                 <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                 <div className="absolute inset-0 bg-gradient-to-t from-babun-primary to-transparent" />
                 <div className="absolute bottom-10 right-10 left-10 text-white text-right">
                    <div className="text-4xl font-display font-black text-babun-accent mb-2 italic">18</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 leading-relaxed">שנות ניסיון בלב העשייה של הנדל"ן החרדי והכללי.</div>
                 </div>
               </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="bg-babun-primary py-16 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 font-sans">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-right border-b border-white/10 pb-16">
              <div className="flex flex-col md:flex-row items-center gap-6 justify-end">
                 <div className="md:order-1 text-right">
                    <div className="text-4xl font-display font-black text-babun-accent mb-1">מ-2006</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">בשטח הנדל"ן הישראלי</div>
                 </div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-6 justify-end border-x border-white/5">
                 <div className="md:order-1 text-right">
                    <div className="text-4xl font-display font-black text-babun-accent mb-1">500+</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">משפחות ומשקיעים שליוויתי</div>
                 </div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-6 justify-end">
                 <div className="md:order-1 text-right">
                    <div className="text-4xl font-display font-black text-babun-accent mb-1">1</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">ספר שמסביר את כל מה שלא סיפרו לך</div>
                 </div>
              </div>
           </div>
           
           <div className="mt-16 flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-30 grayscale invert">
              <div className="flex flex-col items-center">
                <span className="font-display font-black text-2xl">המודיע</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-display font-black text-2xl">כלכלה נבונה</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-display font-black text-2xl">קווי מידע</span>
              </div>
           </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
           <div className="mb-20 text-right">
              <span className="text-babun-accent font-black text-[11px] uppercase tracking-[0.4em] block mb-4">WHAT WE OFFER</span>
              <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter text-babun-primary">מה תמצא כאן.</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -10 }}
                  className="bg-white p-12 shadow-2xl shadow-babun-primary/5 border border-babun-primary/5 rounded-babun-lg flex flex-col items-start text-right relative group transition-all duration-500"
                >
                  <div className="mb-10 text-babun-primary group-hover:text-babun-accent transition-colors">
                     <item.icon size={40} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-display font-bold mb-6 text-babun-primary">{item.title}</h3>
                  <p className="text-babun-primary/60 text-lg font-light leading-relaxed mb-10 flex-grow">{item.desc}</p>
                  <div className="w-full pt-10 border-t border-babun-primary/5 flex items-center justify-between flex-row-reverse">
                     <span className="text-[11px] font-black uppercase text-babun-accent tracking-widest">{item.price}</span>
                     <Link to={item.link} className="text-babun-primary font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:text-babun-accent transition-colors">
                        {item.cta} <ArrowLeft size={16} />
                     </Link>
                  </div>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* TARGET AUDIENCE - BENTO */}
      <section className="py-32 bg-babun-primary text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-right">
          <div className="max-w-3xl ml-auto mb-20">
             <h2 className="text-4xl md:text-6xl font-display font-black mb-8 leading-tight tracking-tight">בין אם זו הדירה הראשונה שלך, בין אם זו ההשקעה העשירית —</h2>
             <p className="text-xl text-babun-accent italic font-light">מרכז רייניץ בנוי לאנשים שרוצים להבין, לא רק לקנות.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
             <div className="md:col-span-8 bg-white/5 p-12 border border-white/10 hover:border-babun-accent transition-colors">
                 <h4 className="text-2xl font-display font-bold mb-6 text-babun-accent">משקיעים פרטיים</h4>
                 <p className="text-lg font-light text-white/60 leading-relaxed">יש לך הון. אתה רוצה שהוא יעבוד חכם. הבעיה: לא תמיד יודעים מי עובד בשבילך ומי בשביל העמלה שלו. כאן — זה ברור.</p>
             </div>
             <div className="md:col-span-4 bg-white/5 p-12 border border-white/10 hover:border-babun-accent transition-colors">
                 <h4 className="text-2xl font-display font-bold mb-6 text-babun-accent">זוגות ואברכים</h4>
                 <p className="text-lg font-light text-white/60 leading-relaxed">חולמים על דירה. לא יודעים מאיפה להתחיל. אנחנו פורסים בפניך את כל המפה.</p>
             </div>
             <div className="md:col-span-4 bg-white/5 p-12 border border-white/10 hover:border-babun-accent transition-colors">
                 <h4 className="text-2xl font-display font-bold mb-6 text-babun-accent">אנשי מקצוע</h4>
                 <p className="text-lg font-light text-white/60 leading-relaxed">מתווך, יועץ, ברוקר — רוצה לחדד את הכלים? נדבר.</p>
             </div>
             <div className="md:col-span-8 bg-babun-accent text-babun-primary p-12">
                 <h4 className="text-2xl font-display font-black mb-6">נפגעי נדל"ן</h4>
                 <p className="text-lg font-bold leading-relaxed mb-8">עשית עסקה שלא יצאה כמו שחשבת. אתה לא לבד — וזה לא חייב להישאר ככה. בוא נבין ביחד מה קרה ומה עושים מכאן.</p>
                 <Link to="/contact" className="text-[11px] font-black uppercase tracking-widest border-b-2 border-babun-primary pb-1">תיאום שיחת חירום</Link>
             </div>
          </div>
        </div>
      </section>

      {/* PROOF SECTION */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
           <h2 className="text-5xl md:text-8xl font-display font-black text-babun-primary mb-24 lowercase tracking-tighter">The <span className="text-babun-accent italic">Proof.</span></h2>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              {[
                { label: "בשרי בשטח, לא בכיתה", val: "18 שנה" },
                { label: "משפחות ומשקיעים שליווינו", val: "500+" },
                { label: "טור שבועי ב'המודיע'", val: "שנים" },
                { label: "ספר מקצועי אחד", val: "1" }
              ].map((stat, i) => (
                <div key={i} className="space-y-4">
                   <div className="text-6xl font-display font-black text-babun-primary mb-2 tracking-tighter">{stat.val}</div>
                   <div className="w-12 h-0.5 bg-babun-accent mx-auto" />
                   <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{stat.label}</div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-24 bg-babun-primary">
         <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="bg-white p-12 md:p-20 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center gap-16 text-right rounded-babun-lg">
               <div className="flex-1">
                  <h2 className="text-4xl font-display font-black mb-4 text-babun-primary">קבל את המידע לפני כולם.</h2>
                  <p className="text-babun-primary/60 text-lg font-light leading-relaxed">הטור השבועי, ניתוחי שוק, פינת חדשות נדל"ן — ישירות אליך.</p>
               </div>
               <div className="flex-1 w-full max-w-md">
                  {status === "success" ? (
                    <div className="bg-babun-accent/20 p-8 text-center font-bold text-babun-primary border border-babun-accent">תודה על ההרשמה!</div>
                  ) : (
                    <form onSubmit={handleNewsletter} className="flex flex-col gap-4">
                       <input 
                        required 
                        type="text" 
                        placeholder="שם פרטי" 
                        className="h-14 bg-babun-light px-6 outline-none border-0 focus:ring-1 ring-babun-accent transition-all text-right" 
                      />
                       <input 
                        required 
                        type="email" 
                        placeholder="כתובת דוא'ל" 
                        className="h-14 bg-babun-light px-6 outline-none border-0 focus:ring-1 ring-babun-accent transition-all text-right"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                       <button className="btn-babun-primary w-full justify-center py-5 uppercase tracking-widest h-14">הרשמה לניוזלטר</button>
                    </form>
                  )}
                  <div className="mt-8 flex justify-end">
                     <a href="https://wa.me/972504141516" target="_blank" className="flex items-center gap-4 text-[#25D366] font-bold text-xs uppercase tracking-widest hover:opacity-80 transition-all">
                        הצטרפו לקבוצת הווצאפ שלנו <BarChart3 size={18} />
                     </a>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-40 text-center">
         <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-4xl md:text-6xl font-display font-black text-babun-primary mb-10 leading-tight">לא בטוח מאיפה להתחיל?</h2>
            <p className="text-xl text-babun-primary/60 font-light mb-12 max-w-2xl mx-auto leading-relaxed">
               שאלה אחת נכונה שווה יותר מעשרה ייעוצים. קבע פגישה. 60 דקות. ₪1,200. ותצא עם תמונה ברורה.
            </p>
            <Link to="/consulting" className="btn-babun-primary px-16 py-6 shadow-2xl">קביעת פגישה ←</Link>
         </div>
      </section>
    </div>
  );
}
