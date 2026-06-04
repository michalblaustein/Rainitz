import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { ArrowLeft, ArrowRight, CheckCircle, Target, Shield, BookOpen, Users, MessageCircle, BarChart3, Presentation, Mail, Send, Star, MoveLeft, Phone, CreditCard, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";


const services = [
  {
    title: "פגישת ייעוץ אישית",
    desc: "פגישת ייעוץ שעושה סדר בראש. בודקים כדאיות ופוטנציאל רווח. מזהים סיכונים ואתגרים. יוצאים עם תכלס - משימות ברורות איך מתקדמים.",
    price: "₪1,200",
    cta: "לקביעת פגישה",
    link: "/consulting",
    icon: Users
  },
  {
    title: "קורסים מקצועיים",
    desc: "בא ללמוד איך להפוך למומחה. מתאים ל: משקיעים, זוגות, ולכל מי שרוצה להבין את השוק לעומקו.",
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
  const [courseEmail, setCourseEmail] = useState("");
  const [courseStatus, setCourseStatus] = useState<null | "loading" | "success">(null);

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

  const handleCourseSyllabus = async (e: React.FormEvent) => {
    e.preventDefault();
    setCourseStatus("loading");
    try {
      await addDoc(collection(db, "syllabus_requests"), { 
        email: courseEmail, 
        course: "telephonic",
        createdAt: serverTimestamp() 
      });
      setCourseStatus("success");
    } catch (e) {
      console.error(e);
      setCourseStatus(null);
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
                    <div className="text-4xl font-display font-black text-babun-primary">
                      <AnimatedNumber value={4981} />
                    </div>
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
            <div className="lg:col-span-7 order-1 flex flex-col items-start text-right w-[1000px] h-[500px]" id="hero-text-side">
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
                  <span>חושבים להשקיע בנדל״ן?</span>
                  <span className="block mt-1">בואו להבין את היכולות שלכם, המספרים, הסיכונים וההזדמנויות.</span>
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
                val: 4981, 
                label: "משפחות", 
                sub: "שליווינו לרכישה בטוחה" 
              },
              { 
                val: 60, 
                label: "דקות", 
                sub: "שנותנות לך תמונה מלאה" 
              },
              { 
                val: 12, 
                label: "קורסים", 
                sub: "שלימדו מאות תלמידים את סודות הנדל״ן" 
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
      <section className="py-32 bg-[#ededed]">
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

      {/* TELEPHONIC COURSE SECTION */}
      <section className="bg-black pt-16 pb-32 lg:pb-48 relative overflow-visible lg:h-[650px]" dir="rtl">
        {/* Grid Background */}
        <div className="absolute inset-x-0 top-0 opacity-[0.15] lg:h-[750px] overflow-hidden" 
             style={{ 
               backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
               backgroundSize: '100px 100px'
             }} 
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8"
        >
          
          {/* Right Column - Titles */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-right">
            <div className="bg-white text-babun-primary px-5 py-1.5 rounded-full font-bold text-base mb-10 shadow-lg">
              שליש בקרקע
            </div>
            <h2 className="text-6xl md:text-[8rem] font-display font-black leading-[0.8] mb-8 text-right">
              <span className="text-babun-accent block">הקורס</span>
              <span className="text-white block mt-3">הטלפוני</span>
            </h2>
            <p className="text-white text-2xl md:text-4xl font-light opacity-90 text-right w-full">במערכת אור עולם</p>
          </div>
 
          {/* Center Column - Illustration & Stats */}
          <div className="flex-shrink-0 relative flex justify-center items-center py-10">
            {/* Yellow Circle */}
            <div className="w-72 h-72 md:w-[450px] md:h-[450px] bg-babun-accent rounded-full relative flex items-center justify-center shadow-[0_0_100px_rgba(255,215,0,0.15)]">
               <img 
                 src="https://lh3.googleusercontent.com/d/1miE-lXse5oAtOurCfE92ls5lWpxGdUnj" 
                 alt="Illustration" 
                 className="w-full h-full object-contain"
                 referrerPolicy="no-referrer"
               />
 
               {/* Phone Icon Tag (Top-Right) */}
               <div className="absolute top-10 right-[-20px] md:right-[-40px] bg-white/80 backdrop-blur-md p-6 md:p-10 rounded-full shadow-2xl text-babun-primary z-20 flex items-center justify-center aspect-square">
                 <motion.div
                   animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                   transition={{ repeat: Infinity, duration: 4 }}
                 >
                   <Phone size={64} className="text-black" strokeWidth={2.5} />
                 </motion.div>
               </div>
            </div>
          </div>
 
          {/* Left Column - Contact Info (Left side, Right-aligned text) */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-right">
            <h4 className="text-white text-3xl md:text-4xl font-display font-medium mb-2">כל הפרטים:</h4>
            <div className="text-babun-accent text-6xl md:text-[39px] font-display font-black tracking-tight mb-2 leading-none">
              073-3454545
            </div>
            <div className="text-white text-3xl md:text-[36px] font-display font-medium opacity-90 mb-6">
              שלוחה 6-2-2
            </div>

            {/* LEAD CARD */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 lg:mt-[60px] lg:-mr-[260px] lg:-translate-x-[100px] lg:translate-y-[15px] bg-white/80 backdrop-blur-md p-8 md:p-10 lg:p-12 rounded-full shadow-[0_30px_70px_rgba(0,0,0,0.4)] relative z-30 w-[310px] sm:w-[350px] md:w-[380px] lg:w-[400px] aspect-square border border-black/5 flex flex-col justify-center items-center text-center mx-auto lg:mx-0"
            >
              <div className="bg-[#fe0000] text-white px-4 py-1.5 rounded-[100px] font-black text-xs md:text-sm inline-block mb-4 shadow-sm self-center">
                מחזור חדש נפתח!
              </div>

              {courseStatus === "success" ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-babun-accent/10 p-6 rounded-2xl border border-babun-accent/30 text-center w-full"
                >
                  <div className="text-babun-primary font-bold text-lg mb-1">נשלח! תבדוק את המייל שלך</div>
                </motion.div>
              ) : (
                <div className="w-full">
                  <p className="text-babun-primary/60 text-sm md:text-base lg:text-lg mb-4 font-medium leading-tight">
                    לקבלת הסילבוס המלא לקורס,
                    <br />
                    הכנס את המייל שלך:
                  </p>
                  <form onSubmit={handleCourseSyllabus} className="flex flex-col gap-3 w-full max-w-[220px] sm:max-w-xs mx-auto">
                    <input 
                      required 
                      type="email" 
                      placeholder="המייל שלך"
                      className="w-full h-11 sm:h-12 bg-gray-50 px-6 rounded-2xl outline-none border border-gray-200 focus:border-babun-accent text-babun-primary text-center text-sm placeholder:text-gray-400"
                      value={courseEmail}
                      onChange={e => setCourseEmail(e.target.value)}
                    />
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={courseStatus === "loading"}
                      className="bg-babun-primary text-white font-bold w-full h-11 sm:h-12 rounded-2xl shadow-lg transition-colors hover:bg-black disabled:opacity-50 flex items-center justify-center text-sm"
                    >
                      {courseStatus === "loading" ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                      ) : (
                        "שלח"
                      )}
                    </motion.button>
                  </form>
                </div>
              )}
            </motion.div>


          </div>
        </motion.div>
      </section>

      {/* TARGET AUDIENCE - NEW DESIGN */}
      <section className="py-24 bg-[#f8f9f8]" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl text-right">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-babun-primary leading-[1.1] mb-2 tracking-tight">
                בא לרכוש כלים פרקטיים <br />
                שיעזרו לך למקסם את הרווח שלך.
              </h2>
            </div>
          </div>
          
          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-6">
             {[
               {
                 title: "משקיעים פרטיים",
                 desc: "ליווי מלא ואישי למשקיעים שרוצים שההון שלהם יעבוד בשבילם ובשקיפות מלאה.",
                 icon: <Users size={24} />,
                 color: "bg-babun-accent",
                 bgImage: "https://lh3.googleusercontent.com/d/15L8OYyohuuxBsk0WlOP9RHfPVkgWRWD8"
               },
               {
                 title: "זוגות צעירים",
                 desc: "עוזרים לכם לעשות את הצעד הראשון בדרך לדירה הראשונה עם מפת דרכים ברורה.",
                 icon: <Target size={24} />,
                 color: "bg-babun-accent",
                 bgImage: "https://lh3.googleusercontent.com/d/1ZKNBgDkj5ttwdr07Q9YjdYClJJxn7jVW"
               },
               {
                 title: "נפגעי נדל\"ן",
                 desc: "עשית עסקה שלא יצאה כמו שחשבת. אתה לא לבד - וזה לא חייב להישאר ככה. בוא נבין ביחד מה קרה ומה עושים מכאן.",
                 icon: <Shield size={24} />,
                 color: "bg-babun-accent",
                 bgImage: "https://lh3.googleusercontent.com/d/1lcJUIGz6H2Zt0Orl3jsc1WRCub4hVd82"
               }
             ].map((card: any, idx) => (
               <motion.div 
                 key={idx}
                 whileHover={{ y: -10 }}
                 className={`rounded-[25px] p-10 flex flex-col items-center text-center shadow-sm border border-black/5 relative overflow-hidden ${card.bgImage ? 'text-white' : 'bg-white'}`}
                 style={card.bgImage ? {
                   backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url(${card.bgImage})`,
                   backgroundSize: 'cover',
                   backgroundPosition: 'center'
                 } : {}}
               >
                  <div className={`w-16 h-16 ${card.color} rounded-full flex items-center justify-center text-babun-primary mb-8 relative z-10`}>
                    {card.icon}
                  </div>
                  <h4 className={`text-[30px] font-display font-black mb-4 relative z-10 ${card.bgImage ? 'text-white' : 'text-babun-primary'}`}>{card.title}</h4>
                  <p className={`text-[16px] font-bold leading-relaxed mb-10 min-h-[4rem] relative z-10 ${card.bgImage ? 'text-white/90' : 'text-babun-primary/60'}`}>
                    {card.desc}
                  </p>
                  <div className="mt-auto h-0" />
               </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* ARTICLES & PODCASTS SECTION */}
      <section className="py-24 bg-white" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-8">
            <div className="text-right">
              <h2 className="text-4xl md:text-6xl font-display font-black text-babun-primary leading-tight mb-4">כתבות ופודקאסטים.</h2>
              <p className="text-xl text-babun-primary/60 font-light">ידע שווה כח. תקראו ותאזינו ותשארו מעודכנים.</p>
            </div>
            
            <Link to="/articles" className="flex items-center gap-4 group cursor-pointer">
               <span className="font-bold text-babun-primary/80 group-hover:text-babun-primary transition-colors">לכל הכתבות</span>
               <div className="w-12 h-12 bg-babun-primary text-white rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
                  <ArrowLeft size={20} />
               </div>
            </Link>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Article 1 */}
            <motion.a 
              href="https://www.youtube.com/watch?v=WEhvhlX_UhY"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="flex flex-col group cursor-pointer"
            >
              <div className="relative aspect-[16/10] rounded-[30px] overflow-hidden mb-6">
                <img 
                  src="https://img.youtube.com/vi/WEhvhlX_UhY/maxresdefault.jpg" 
                  alt="נדל״ן בשלושה - פרק חדש" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 z-20">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-babun-primary text-[10px] uppercase font-bold tracking-widest rounded-full shadow-sm">
                    וידאו
                  </span>
                </div>
                <div className="absolute bottom-4 left-4">
                  <div className="w-10 h-10 bg-babun-accent text-babun-primary rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:rotate-[-45deg]">
                    <ArrowLeft size={20} />
                  </div>
                </div>
              </div>
              <div className="px-2">
                <div className="flex items-center gap-2 text-babun-primary/40 font-bold text-xs mb-3">
                  <span>יעקב רייניץ</span>
                  <div className="w-1 h-1 bg-babun-primary/40 rounded-full" />
                  <span>28 באפר׳ 2026</span>
                </div>
                <h3 className="text-xl font-display font-black text-babun-primary leading-tight group-hover:text-babun-accent transition-colors line-clamp-2">
                  נדל״ן בשלושה: פרק חדש עם יעקב רייניץ
                </h3>
              </div>
            </motion.a>

            {/* Article 2 */}
            <motion.a 
              href="https://www.doscast.co.il/episode/12896"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -10 }}
              className="flex flex-col group cursor-pointer"
            >
              <div className="relative aspect-[16/10] rounded-[30px] overflow-hidden mb-6">
                <img 
                  src="https://lh3.googleusercontent.com/d/1uquDwMRs3_fuhwfNSMKkAIWLjz1qKyCg" 
                  alt="Financial Guidance" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 z-20">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-babun-primary text-[10px] uppercase font-bold tracking-widest rounded-full shadow-sm">
                    פודקאסט
                  </span>
                </div>
                <div className="absolute bottom-4 left-4">
                  <div className="w-10 h-10 bg-white text-babun-primary rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:rotate-[-45deg]">
                    <ArrowLeft size={20} />
                  </div>
                </div>
              </div>
              <div className="px-2">
                <div className="flex items-center gap-2 text-babun-primary/40 font-bold text-xs mb-3">
                  <span>יעקב רייניץ</span>
                  <div className="w-1 h-1 bg-babun-primary/40 rounded-full" />
                  <span>18 מאי 2024</span>
                </div>
                <h3 className="text-xl font-display font-black text-babun-primary leading-tight group-hover:text-babun-accent transition-colors line-clamp-3">
                  הסודות של הנדל"ן החרדי: עם עו"ד נתן רוזנבלט
                </h3>
              </div>
            </motion.a>

            {/* Article 3 */}
            <motion.a 
              href="https://plus-m.co.il/podcast/%D7%99%D7%A2%D7%A7%D7%91-%D7%A8%D7%99%D7%99%D7%A0%D7%99%D7%A5-%D7%A0%D7%93%D7%9C%D7%9F/"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -10 }}
              className="flex flex-col group cursor-pointer"
            >
              <div className="relative aspect-[16/10] rounded-[30px] overflow-hidden mb-6">
                <img 
                  src="https://lh3.googleusercontent.com/d/1vaDMSOrPbWERhQojXQrcd2rCM6c-qwoY" 
                  alt="Market Trends" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 z-20">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-babun-primary text-[10px] uppercase font-bold tracking-widest rounded-full shadow-sm">
                    פודקאסט
                  </span>
                </div>
                <div className="absolute bottom-4 left-4">
                  <div className="w-10 h-10 bg-babun-accent text-babun-primary rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:rotate-[-45deg]">
                    <ArrowLeft size={20} />
                  </div>
                </div>
              </div>
              <div className="px-2">
                <div className="flex items-center gap-2 text-babun-primary/40 font-bold text-xs mb-3">
                  <span>מערכת פלוס מינוס</span>
                  <div className="w-1 h-1 bg-babun-primary/40 rounded-full" />
                  <span>12 מאי 2024</span>
                </div>
                <h3 className="text-xl font-display font-black text-babun-primary leading-tight group-hover:text-babun-accent transition-colors line-clamp-2">
                  פלוס מינוס: יעקב רייניץ על השקעות נדל"ן ומצוקת הדיור
                </h3>
              </div>
            </motion.a>

            {/* Article 4 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -10 }}
              className="flex flex-col group"
            >
              <div className="relative aspect-[16/10] rounded-[30px] overflow-hidden mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1434626881859-194d67b2b86f?auto=format&fit=crop&q=80&w=800" 
                  alt="Mortgage Tips" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 z-20">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-babun-primary text-[10px] uppercase font-bold tracking-widest rounded-full shadow-sm">
                    כתבה
                  </span>
                </div>
                <div className="absolute bottom-4 left-4">
                  <div className="w-10 h-10 bg-white text-babun-primary rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:rotate-[-45deg]">
                    <ArrowLeft size={20} />
                  </div>
                </div>
              </div>
              <div className="px-2">
                <div className="flex items-center gap-2 text-babun-primary/40 font-bold text-sm mb-3 text-xs">
                  <span>מערכת רייניץ</span>
                  <div className="w-1 h-1 bg-babun-primary/40 rounded-full" />
                  <span>05 מאי 2024</span>
                </div>
                <h3 className="text-xl font-display font-black text-babun-primary leading-tight group-hover:text-babun-accent transition-colors line-clamp-2">
                  5 טעויות נפוצות של רוכשי דירה ראשונה ואיך להימנע מהן
                </h3>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-[#121212] flex items-center">
         {/* Video Background */}
         <div className="absolute inset-0 z-0 opacity-60 select-none pointer-events-none">
            <iframe 
               className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto aspect-video -translate-x-1/2 -translate-y-1/2 pointer-events-none object-cover scale-150"
               src="https://www.youtube.com/embed/-4PqP8IkpH0?autoplay=1&mute=1&loop=1&playlist=-4PqP8IkpH0&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&disablekb=1&fs=0&autohide=1"
               allow="autoplay; encrypted-media"
               frameBorder="0"
            />
            {/* Transparent click/tap block layer */}
            <div className="absolute inset-0 bg-transparent z-[10] pointer-events-auto" />
            {/* Dark Gradient Overlay & Black Semi-Transparent Layer */}
            <div className="absolute inset-0 bg-black/50 z-[1]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 z-[2]" />
         </div>

         <div className="w-full max-w-none px-4 md:px-12 lg:px-24 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16 text-right">
            <div className="flex-1 lg:max-w-4xl">
               <h2 className="text-5xl md:text-7xl lg:text-[7.5rem] font-display font-black mb-6 text-white leading-[0.9]">קבל את המידע <br /><span className="text-babun-accent">לפני כולם</span></h2>
               <p className="text-white/80 text-xl md:text-2xl font-light leading-relaxed max-w-2xl">הטור השבועי, ניתוחי שוק, פינת חדשות נדל"ן - ישירות אליך.</p>
            </div>
            <div className="w-full max-w-lg bg-black/60 backdrop-blur-xl p-12 rounded-[25px] border border-white/20 shadow-2xl">
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




    </div>
  );
}
