import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { ArrowLeft, ArrowRight, CheckCircle, Target, Shield, BookOpen, Users, MessageCircle, BarChart3, Presentation, Mail, Send, Star, MoveLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";


const services = [
  {
    title: "פגישת ייעוץ אישית",
    desc: "פגישת ייעוץ שעושה סדר בראש. בודקים כדאיות ופוטנציאל רווח. מזהים סיכונים ואתגרים. יוצאים עם תכלס - משימות ברורות איך מתקדמים.",
    price: "₪1,200",
    cta: "קביעת מועד",
    link: "/consulting",
    icon: Users
  },
  {
    title: "קורסים מקצועיים",
    desc: "שישה מפגשים שבסופם אתה הופך למומחה. מתאים ל: משקיעים, זוגות, ולכל מי שרוצה להבין את השוק לעומקו.",
    price: "הרשמה פתוחה",
    cta: "הצטרפות למחזור הקרוב",
    link: "/courses",
    icon: Presentation
  },
  {
    title: "הרצאות והדרכות",
    desc: "לארגונים, קהילות, וחברות. תוכן מרתק ומעשיר שמשנה את הדרך שבה אנשים מסתכלים על נדל\"ן.",
    price: "הזמנה מראש",
    cta: "תיאום הרצאה",
    link: "/contact",
    icon: MessageCircle
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
    <div className="bg-babun-light" dir="rtl">
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
      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
           <div className="mb-20 text-center">
              <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter text-babun-primary">איך תרצה <span className="text-babun-accent">להתקדם</span>?</h2>
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
                  <div className="w-full pt-10 border-t border-babun-primary/5 flex items-center justify-start">
                     <Link to={item.link} className="text-babun-primary font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:text-babun-accent transition-colors">
                        {item.cta} <ArrowLeft size={16} />
                     </Link>
                  </div>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* BOOK SECTION */}
      <section className="relative mt-20 mb-8 lg:mt-32 lg:mb-10" id="book-section">
        {/* Yellow Strip Background - Expanded upwards */}
        <div className="absolute -top-12 left-0 right-0 bg-[#FFFBEB] z-0 h-[400px]" />
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            {/* Text (Right) */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:flex-[2] text-right flex flex-col items-start"
            >
               <div className="text-lg md:text-xl lg:text-2xl font-display font-medium text-black mb-3 leading-tight">
                  <p>כשה<span className="font-bold">מתווך</span> עובד בשביל העמלה, וה<span className="font-bold">בנק</span> עובד בשביל עצמו.</p>
               </div>
               
               <div className="mb-6">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-black leading-[1.1] tracking-tight">
                    לך נשאר לרכוש כלים ולגלות <br />
                    איפה מסתתר <span className="text-babun-accent">הרווח</span> בעסקאות נדל״ן
                  </h2>
               </div>

               <p className="text-sm md:text-base lg:text-lg text-black font-bold mb-10 text-right">
                 בין הנושאים בספר: משכנתאות • מחיר למשתכן • קבוצות רכישה <br />
                 תמ״א • משא ומתן • מיסוי • ועוד...
               </p>

               <Link 
                to="/book" 
                className="group bg-black text-white px-8 md:px-12 py-3 md:py-4 rounded-full font-black text-lg md:text-xl hover:scale-105 transition-all shadow-xl hover:shadow-black/20 flex items-center gap-3"
               >
                 <span>לרכישה</span>
                 <motion.div
                   animate={{ x: [0, -5, 0] }}
                   transition={{ repeat: Infinity, duration: 1.5 }}
                 >
                   <MoveLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
                 </motion.div>
               </Link>
            </motion.div>

            {/* Image (Left) - Pop out of the strip */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, x: -50 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="flex-1 relative flex justify-center lg:justify-end"
            >
              <img 
                src="https://lh3.googleusercontent.com/d/1YATeihtnryr9oCFr2-byVjsEYCnxVtIl" 
                alt="הספר שליש בקרקע" 
                className="w-full max-w-sm md:max-w-xl lg:max-w-5xl drop-shadow-[60px_90px_140px_rgba(0,0,0,0.35)] hover:scale-105 transition-transform duration-700 pointer-events-auto lg:-translate-x-24 lg:scale-[1.7] lg:-translate-y-16"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* TARGET AUDIENCE - BENTO */}
      <section className="pt-12 pb-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-right">
          <div className="max-w-3xl ml-auto mb-20">
             <h2 className="text-3xl md:text-5xl font-display font-black mb-8 leading-tight tracking-tight text-babun-primary">בין אם זו הדירה <span className="text-babun-accent">הראשונה</span> שלך, <br />בין אם זו ההשקעה <span className="text-babun-accent">העשירית</span></h2>
             <p className="text-2xl text-babun-primary/60 font-light">מרכז רייניץ בנוי לאנשים שרוצים להבין, לא רק לקנות.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full">
             {/* TOP LEFT - LARGE GREEN CARD */}
             <motion.div 
               whileHover={{ y: -5 }}
               className="md:col-span-8 bg-[#424242] rounded-[48px] p-12 md:p-16 relative overflow-hidden flex flex-col justify-end min-h-[400px]"
             >
                <div className="absolute top-12 left-12 w-20 h-20 bg-babun-accent rounded-full flex items-center justify-center text-babun-primary shadow-lg">
                   <Users size={32} />
                </div>
                <div className="relative z-10 max-w-xl">
                   <h4 className="text-3xl md:text-5xl font-display font-black mb-8 text-white leading-tight">משקיעים פרטיים</h4>
                   <p className="text-xl font-light text-white/80 leading-relaxed mb-8">יש לך הון. אתה רוצה שהוא יעבוד חכם. הבעיה: לא תמיד יודעים מי עובד בשבילך ומי בשביל העמלה שלו. כאן - זה ברור.</p>
                   <div className="flex items-center gap-4 text-babun-accent font-bold">
                      <div className="w-12 h-px bg-babun-accent/30" />
                      <span>ליווי מלא ומקצועי</span>
                   </div>
                </div>
                {/* Abstract shape */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
             </motion.div>

             {/* TOP RIGHT - SMALL WHITE CARD */}
             <motion.div 
               whileHover={{ y: -5 }}
               className="md:col-span-4 bg-white rounded-[48px] p-10 flex flex-col justify-between shadow-sm border border-gray-100"
             >
                <div className="w-16 h-16 bg-babun-accent/20 rounded-2xl flex items-center justify-center text-babun-accent">
                   <Target size={28} />
                </div>
                <div>
                   <h4 className="text-2xl font-display font-black mb-4 text-babun-primary">זוגות ואברכים</h4>
                   <p className="text-babun-primary/60 font-light leading-relaxed">חולמים על דירה. לא יודעים מאיפה להתחיל. אנחנו פורסים בפניך את כל המפה.</p>
                </div>
                <div className="pt-6">
                   <ArrowLeft className="text-babun-primary/20" />
                </div>
             </motion.div>

             {/* BOTTOM LEFT - SMALL WHITE CARD */}
             <motion.div 
               whileHover={{ y: -5 }}
               className="md:col-span-4 bg-white rounded-[48px] p-10 flex flex-col justify-between shadow-sm border border-gray-100"
             >
                <div className="w-16 h-16 bg-babun-accent/20 rounded-2xl flex items-center justify-center text-babun-accent">
                   <Shield size={28} />
                </div>
                <div>
                   <h4 className="text-2xl font-display font-black mb-4 text-babun-primary">אנשי מקצוע</h4>
                   <p className="text-babun-primary/60 font-light leading-relaxed">מתווך, יועץ, ברוקר - רוצה לחדד את הכלים? נדבר ונעלה את הרמה יחד.</p>
                </div>
                <div className="pt-6">
                   <ArrowLeft className="text-babun-primary/20" />
                </div>
             </motion.div>

             {/* BOTTOM RIGHT - LARGE WHITE CARD */}
             <motion.div 
               whileHover={{ y: -5 }}
               className="md:col-span-8 bg-white rounded-[48px] p-12 md:p-16 flex flex-col md:flex-row shadow-sm border border-gray-100 items-center gap-12"
             >
                <div className="flex-1 text-right">
                   <h4 className="text-3xl md:text-5xl font-display font-black mb-6 text-babun-primary">נפגעי נדל"ן</h4>
                   <p className="text-lg text-babun-primary/60 font-light leading-relaxed mb-8">עשית עסקה שלא יצאה כמו שחשבת. אתה לא לבד - וזה לא חייב להישאר ככה. בוא נבין ביחד מה קרה ומה עושים מכאן.</p>
                   <Link to="/contact" className="inline-flex items-center gap-3 bg-[#424242] text-white px-8 py-4 rounded-full font-bold transition-transform hover:scale-105">
                      <span>תיאום שיחת חירום</span>
                      <ArrowLeft size={18} />
                   </Link>
                </div>
                <div className="grid grid-cols-2 gap-8 border-r border-gray-100 pr-12 hidden md:grid">
                   <div>
                      <div className="text-4xl font-display font-black text-babun-primary">500+</div>
                      <div className="text-sm text-babun-primary/40 font-bold">מקרים שנפתרו</div>
                   </div>
                   <div>
                      <div className="text-4xl font-display font-black text-babun-primary">100%</div>
                      <div className="text-sm text-babun-primary/40 font-bold">שקיפות מלאה</div>
                   </div>
                </div>
             </motion.div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-[#121212] flex items-center">
         {/* Video Background */}
         <div className="absolute inset-0 z-0 opacity-60">
            <iframe 
               className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto aspect-video -translate-x-1/2 -translate-y-1/2 pointer-events-none object-cover scale-150"
               src="https://www.youtube.com/embed/-4PqP8IkpH0?autoplay=1&mute=1&loop=1&playlist=-4PqP8IkpH0&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1"
               allow="autoplay; encrypted-media"
               frameBorder="0"
            />
            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
         </div>

         <div className="w-full max-w-none px-4 md:px-12 lg:px-24 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16 text-right">
            <div className="flex-1 lg:max-w-4xl">
               <h2 className="text-5xl md:text-7xl lg:text-[7.5rem] font-display font-black mb-6 text-white leading-[0.9]">קבל את המידע <br /><span className="text-babun-accent">לפני כולם</span></h2>
               <p className="text-white/80 text-xl md:text-2xl font-light leading-relaxed max-w-2xl">הטור השבועי, ניתוחי שוק, פינת חדשות נדל"ן - ישירות אליך.</p>
            </div>
            <div className="w-full max-w-lg bg-black/60 backdrop-blur-xl p-12 rounded-[64px] border border-white/20 shadow-2xl">
               {status === "success" ? (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="bg-babun-accent/10 p-10 text-center rounded-[32px] border border-babun-accent/30"
                 >
                    <div className="text-babun-accent mb-4 flex justify-center"><CheckCircle size={48} /></div>
                    <div className="text-white text-2xl font-bold">תודה על ההרשמה!</div>
                    <div className="text-white/60 mt-2">נתראה בתיבת הדואר שלך בקרוב.</div>
                 </motion.div>
               ) : (
                 <form onSubmit={handleNewsletter} className="flex flex-col gap-5">
                    <input 
                     required 
                     type="text" 
                     placeholder="שם פרטי" 
                     className="h-16 bg-white/10 px-8 rounded-2xl outline-none border border-white/20 focus:border-babun-accent/50 focus:bg-white/20 transition-all text-right text-white" 
                   />
                    <input 
                     required 
                     type="email" 
                     placeholder="כתובת דוא'ל" 
                     className="h-16 bg-white/10 px-8 rounded-2xl outline-none border border-white/20 focus:border-babun-accent/50 focus:bg-white/20 transition-all text-right text-white"
                     value={email}
                     onChange={e => setEmail(e.target.value)}
                   />
                    <button className="bg-babun-accent text-babun-primary font-bold px-10 h-16 rounded-2xl hover:scale-105 transition-transform text-lg shadow-xl shadow-babun-accent/20">
                       הרשמה לניוזלטר
                    </button>
                 </form>
               )}
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
