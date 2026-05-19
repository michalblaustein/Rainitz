import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { ArrowLeft, ArrowRight, CheckCircle, Target, Shield, BookOpen, Users, MessageCircle, BarChart3, Presentation, Mail, Send, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";


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

function AnimatedNumber({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    const controls = animate(count, value, { duration: 2, ease: "easeOut" });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

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
      <section className="relative min-h-screen flex items-center pt-24 overflow-hidden bg-black text-white">
        {/* Background Mesh */}
        <div className="absolute inset-0 mesh-grid z-0" />
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 w-full relative z-10 text-right">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Image Side (Left) */}
            <div className="lg:col-span-5 relative order-2 flex justify-center">
              <div className="relative w-full max-w-lg aspect-square">
                 {/* Yellow Circle Background */}
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ duration: 1 }}
                   className="absolute inset-0 bg-babun-accent rounded-full z-0"
                 />
                 
                 <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 1 }}
                  className="relative z-10 w-full h-full flex items-end justify-center"
                 >
                   <img 
                    src="https://lh3.googleusercontent.com/d/1wzfE5sZMtpfnHN39XgYqYtvsHanSB_vn" 
                    alt="יעקב רייניץ" 
                    className="w-[120%] max-w-none -mb-4 drop-shadow-2xl"
                    referrerPolicy="no-referrer"
                   />
                 </motion.div>

                 {/* Floating Cards */}
                 <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      y: [0, -10, 0] 
                    }}
                    transition={{ 
                      opacity: { delay: 0.6 },
                      x: { delay: 0.6 },
                      y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="absolute top-1/4 -right-12 z-20 bg-white p-6 rounded-babun-lg shadow-2xl text-black text-center min-w-[180px]"
                 >
                    <div className="text-4xl font-display font-black text-babun-primary">+5,000</div>
                    <div className="text-sm font-bold opacity-80 mt-1">פגישות ייעוץ</div>
                 </motion.div>

                 <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      y: [0, 10, 0]
                    }}
                    transition={{ 
                      opacity: { delay: 0.8 },
                      x: { delay: 0.8 },
                      y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="absolute bottom-10 -left-12 z-20 bg-white p-6 rounded-babun-lg shadow-2xl text-black text-center min-w-[180px]"
                 >
                    <div className="text-sm font-bold leading-tight mb-3">הפודקאסט הכי מושמע<br />בציבור החרדי</div>
                    <div className="flex justify-center gap-1 text-babun-accent">
                        {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                    </div>
                 </motion.div>
              </div>
            </div>

            {/* Text Side (Right) */}
            <div className="lg:col-span-7 order-1 flex flex-col items-start text-right">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col items-start w-full text-right"
              >
                <h1 className="font-display text-white mb-8 tracking-tighter flex flex-col items-start text-right w-full">
                  <span className="text-6xl md:text-8xl lg:text-[6rem] font-bold leading-[1.05] block w-full">
                    כש<span className="text-babun-accent">אתה</span> לא יודע
                  </span>
                  <span className="text-6xl md:text-8xl lg:text-[6rem] font-bold leading-[1.05] block w-full">
                    <span className="text-babun-accent">מה</span> אתה לא יודע
                  </span>
                </h1>
                <h2 className="text-2xl md:text-3xl font-normal text-white mb-12 leading-tight text-right w-full">
                  חושבים להשקיע בנדל״ן? בואו להבין את היכולות שלכם, המספרים, הסיכונים וההזדמנויות.
                </h2>
                <div className="flex flex-wrap gap-6 justify-start items-center w-full">
                   <Link 
                    to="/consulting" 
                    className="bg-babun-accent text-babun-primary font-bold py-5 px-10 rounded-babun-full text-xl transition-all duration-300 hover:scale-105"
                   >
                      קביעת פגישת ייעוץ
                   </Link>
                   <Link 
                    to="/about" 
                    className="bg-white text-babun-primary font-bold py-5 px-10 rounded-babun-full text-xl transition-all duration-300 hover:bg-white/90"
                   >
                      קרא עוד
                   </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION - REINITZ IN NUMBERS */}
      <section className="bg-white py-32 overflow-hidden border-t border-babun-primary/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-32"
          >
            <h2 className="text-6xl md:text-8xl font-display font-black tracking-tighter text-babun-primary">
              רייניץ <span className="text-babun-accent">במספרים</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-8 w-full">
            {[
              { 
                val: 18, 
                label: "שנים", 
                sub: "של ייעוצים, הרצאות וסדנאות" 
              },
              { 
                val: 5000, 
                label: "משפחות +", 
                sub: "שליווינו לרכישה בטוחה" 
              },
              { 
                val: 60, 
                label: "דקות", 
                sub: "שנותנות לך תמונה מלאה" 
              },
              { 
                val: 1, 
                label: "ספר", 
                sub: "שהפך ידע מקצועי לשפה של כולם" 
              }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="flex flex-col items-center"
              >
                <div className="text-6xl md:text-8xl font-display font-black text-babun-primary mb-2">
                  <AnimatedNumber value={stat.val} />
                </div>
                <div className="text-4xl md:text-5xl font-display font-black text-babun-primary mb-6">
                  {stat.label}
                </div>
                <div className="w-16 h-1 bg-babun-accent mb-8" />
                <p className="text-sm font-bold opacity-40 max-w-[200px] leading-relaxed">
                  {stat.sub}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
           <div className="mb-20 text-right">
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
                  <div className="mt-8 flex justify-start">
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
