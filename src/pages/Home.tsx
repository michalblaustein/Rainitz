import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { ArrowLeft, ArrowRight, CheckCircle, Target, Shield, BookOpen, Users, MessageCircle, BarChart3, Presentation, Mail, Send, Star, MoveLeft, Phone, CreditCard, ShieldAlert, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { syncLeadToBackend } from "../lib/leadSync";
import { defaultSeedArticles } from "../data/defaultArticles";
import { formatExternalUrl } from "../lib/utils";


const services = [
  {
    title: "פגישת ייעוץ אישית",
    desc: "פגישת ייעוץ שעושה סדר בראש. בודקים כדאיות, מזהים סיכונים, יוצאים עם תכלס ומשימות ברורות איך מתקדמים.",
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
    title: "הרצאות וסדנאות",
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
  const [newsletterName, setNewsletterName] = useState("");
  const [status, setStatus] = useState<null | "loading" | "success">(null);
  const [courseName, setCourseName] = useState("");
  const [coursePhone, setCoursePhone] = useState("");
  const [courseEmail, setCourseEmail] = useState("");
  const [courseStatus, setCourseStatus] = useState<null | "loading" | "success">(null);
  const [heroVideoLoaded, setHeroVideoLoaded] = useState(false);

  const [latestMedia, setLatestMedia] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem("babun_articles_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((item: any) => item.categoryId === "podcast").slice(0, 4);
        }
      }
    } catch (e) {
      console.error("Failed to load local articles cache for home page:", e);
    }
    return defaultSeedArticles.filter((item: any) => item.categoryId === "podcast").slice(0, 4);
  });
  const [loadingMedia, setLoadingMedia] = useState(false);

  useEffect(() => {
    // 1. Initial quick load from server backup (instant load, completely bypasses firestore offline/quota lock)
    setLoadingMedia(true);
    fetch("/api/articles")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const podcastsOnly = data.filter((item: any) => item.categoryId === "podcast" || item.category === "פודקאסטים");
          if (podcastsOnly.length > 0) {
            setLatestMedia(podcastsOnly.slice(0, 4));
          }
          // Also update cache if this computer had stale cache
          try {
            const cached = localStorage.getItem("babun_articles_cache");
            const parsed = cached ? JSON.parse(cached) : [];
            if (!Array.isArray(parsed) || data.length > parsed.length) {
              localStorage.setItem("babun_articles_cache", JSON.stringify(data));
            }
          } catch (e) {}
        }
      })
      .catch((err) => {
        console.warn("Home initial fetch from server fallback failed, trying local storage cache...", err);
        try {
          const cached = localStorage.getItem("babun_articles_cache");
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const podcastsOnly = parsed.filter((item: any) => item.categoryId === "podcast" || item.category === "פודקאסטים");
              setLatestMedia(podcastsOnly.slice(0, 4));
            }
          }
        } catch (e) {
          console.error("Local home cache load fallback error:", e);
        }
      })
      .finally(() => {
        setLoadingMedia(false);
      });

    // 2. Setup subscription to automatically update from Firestore (no orderBy to prevent missing docs)
    const articlesCol = collection(db, "articles");
    const unsubscribe = onSnapshot(articlesCol, (snapshot) => {
      if (!snapshot.empty) {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const podcastsOnly = docs.filter((item: any) => item.categoryId === "podcast" || item.category === "פודקאסטים");
        if (podcastsOnly.length > 0) {
          setLatestMedia(podcastsOnly.slice(0, 4));
        }
        setLoadingMedia(false);
      }
    }, (error) => {
      console.warn("Home Firestore snapshot note:", error);
    });
    return () => unsubscribe();
  }, []);

  const getDisplayImage = (url: string) => {
    if (!url) return "";
    const driveFileRegex = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const driveIdRegex = /[?&]id=([a-zA-Z0-9_-]+)/;

    const fileMatch = url.match(driveFileRegex);
    const idMatch = url.match(driveIdRegex);

    const fileId = fileMatch ? fileMatch[1] : idMatch ? idMatch[1] : null;

    if (fileId) {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w600`;
    }
    return url;
  };

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      // 1. Save to local Firestore (subscribers collection as defined in blueprint)
      try {
        await addDoc(collection(db, "subscribers"), { 
          email, 
          createdAt: serverTimestamp() 
        });
      } catch (dbErr) {
        console.warn("Firestore newsletter subscription failed, proceeding with backend sync:", dbErr);
      }

      // 2. Forward to Plando CRM and notify team via Email
      await syncLeadToBackend({
        name: newsletterName || "לקוח ניוזלטר",
        phone: "לא צוין",
        email,
        message: "הרשמה לניוזלטר השבועי באתר",
        source: "הרשמה לניוזלטר",
        tag: "הרשמה לניוזלטר"
      });

      setStatus("success");
      setNewsletterName("");
      setEmail("");
    } catch (e) {
      console.error("Newsletter registration failed:", e);
      setStatus(null);
    }
  };

  const handleCourseSyllabus = async (e: React.FormEvent) => {
    e.preventDefault();
    const registrationUrl = "https://rainitz.ravpage.co.il/lo-mehakim-ladira?ref=atar";

    if (courseName || coursePhone || courseEmail) {
      try {
        // 1. Save to local Firestore
        addDoc(collection(db, "course_signups"), { 
          name: courseName || "ללא שם",
          phone: coursePhone || "",
          email: courseEmail || "", 
          courseType: "digital",
          createdAt: serverTimestamp() 
        }).catch(() => {});

        // 2. Forward lead details directly to CRM
        syncLeadToBackend({
          name: courseName || "ללא שם",
          phone: coursePhone || "",
          email: courseEmail || "",
          message: "הרשמה לקורס מדף הבית",
          source: "הרשמה לקורס - דף הבית",
          tag: "הרשמה לקורס"
        }).catch(() => {});
      } catch (err) {
        console.warn("Lead save notice:", err);
      }
    }

    // Lead directly to the course registration page
    window.location.href = registrationUrl;
  };

  return (
    <div className="bg-babun-light" dir="rtl">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center pt-28 sm:pt-36 md:pt-40 pb-16 md:pb-24 overflow-hidden bg-black text-white">
        {/* Background Mesh */}
        <div className="absolute inset-0 mesh-grid z-0" />
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 w-full relative z-10 text-right">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Image Side (Left) */}
            <div className="lg:col-span-5 relative order-2 flex justify-center w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
              <div className="relative w-full aspect-square">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 rounded-full overflow-hidden bg-babun-primary shadow-2xl z-10 pointer-events-none"
                    style={{ maskImage: 'radial-gradient(circle, white 100%, black 100%)', WebkitMaskImage: '-webkit-radial-gradient(circle, white 100%, black 100%)' }}
                  >
                    {/* Instant High-Res Video Poster displayed on frame 0 */}
                    <img
                      src="https://i.vimeocdn.com/video/2190633761-18d5d8077236dbecbc57c7f8792fbb8a2d6fa5fba2ed1afdc10e9e83ad30eb0b-d_640"
                      alt="יעקב רייניץ"
                      fetchPriority="high"
                      loading="eager"
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />

                    {/* Vimeo Background Video with Eager Loading and Auto-Optimized Quality */}
                    <iframe 
                      src="https://player.vimeo.com/video/1218630094?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1&playsinline=1&dnt=1&quality=720p" 
                      title="יעקב רייניץ - וידאו"
                      frameBorder="0"
                      loading="eager"
                      onLoad={() => setHeroVideoLoaded(true)}
                      allow="autoplay; fullscreen; picture-in-picture"
                      className={`absolute top-1/2 left-1/2 min-w-full min-h-full w-[177.77vw] h-[56.25vw] max-w-none max-h-none -translate-x-1/2 -translate-y-1/2 object-cover pointer-events-none transition-opacity duration-700 ${
                        heroVideoLoaded ? "opacity-100" : "opacity-0"
                      }`}
                      style={{
                        width: '180%',
                        height: '180%',
                        minWidth: '100%',
                        minHeight: '100%',
                      }}
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
                    className="absolute top-1/4 -right-4 sm:-right-8 lg:-right-12 z-20 bg-white p-3 sm:p-5 md:p-6 rounded-babun-lg shadow-2xl text-black text-center min-w-[130px] sm:min-w-[170px]"
                 >
                    <div className="text-2xl sm:text-4xl font-display font-black text-babun-primary">
                      <AnimatedNumber value={2000} />+
                    </div>
                    <div className="text-xs sm:text-sm font-bold opacity-80 mt-1">פגישות ייעוץ</div>
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
                    className="absolute bottom-6 sm:bottom-10 -left-4 sm:-left-8 lg:-left-12 z-20 bg-white p-3 sm:p-5 md:p-6 rounded-babun-lg shadow-2xl text-black text-center min-w-[140px] sm:min-w-[180px]"
                 >
                    <div className="text-xs sm:text-sm font-bold leading-tight mb-2 sm:mb-3">הפודקאסט הכי מושמע<br />בציבור החרדי</div>
                    <div className="flex justify-center gap-1 text-babun-accent">
                        {[...Array(5)].map((_, i) => <Star key={i} size={13} fill="currentColor" className="sm:w-4 sm:h-4" />)}
                    </div>
                 </motion.div>

              </div>
            </div>

            {/* Text Side (Right) */}
            <div className="lg:col-span-7 order-1 flex flex-col items-start text-right w-full min-h-0" id="hero-text-side">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col items-start w-full text-right"
              >
                <h1 className="font-display text-white mb-6 md:mb-8 tracking-tighter flex flex-col items-start text-right w-full">
                  <span className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold leading-[1.08] block w-full">
                    כש<span className="text-babun-accent">אתה</span> לא יודע
                  </span>
                  <span className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold leading-[1.08] block w-full mt-1">
                    <span className="text-babun-accent">מה</span> אתה לא יודע
                  </span>
                </h1>
                <h2 className="text-lg sm:text-2xl md:text-3xl font-normal text-white mb-8 md:mb-12 leading-relaxed text-right w-full max-w-2xl">
                  <span>חושבים להשקיע בנדל״ן?</span>
                  <span className="block mt-1 text-white/90">בואו להבין את היכולות שלכם, המספרים, הסיכונים וההזדמנויות.</span>
                </h2>
                <div className="flex flex-wrap gap-4 md:gap-6 justify-start items-center w-full">
                   <Link 
                    to="/consulting" 
                    className="bg-babun-accent text-babun-primary font-bold py-4 px-8 sm:py-5 sm:px-10 rounded-babun-full text-base sm:text-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-babun-accent/20"
                   >
                      קביעת פגישת ייעוץ
                   </Link>
                   <Link 
                    to="/about" 
                    className="bg-white text-babun-primary font-bold py-4 px-8 sm:py-5 sm:px-10 rounded-babun-full text-base sm:text-xl transition-all duration-300 hover:bg-white/90 active:scale-95 shadow-lg"
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
              מרכז רייניץ <span className="text-babun-accent">במספרים</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-8 w-full">
            {[
              { 
                val: 18, 
                label: "שנים", 
                sub: "של פגישות ייעוץ" 
              },
              { 
                val: 2000, 
                label: "משפחות", 
                suffix: "+",
                sub: "שליווינו לרכישה בטוחה" 
              },
              { 
                val: 60, 
                label: "דקות", 
                sub: "שנותנות לך תמונה בהירה" 
              },
              { 
                val: 12, 
                label: "קורסים", 
                sub: "שלימדו את רזי סודות הנדל״ן" 
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
                <div className="text-6xl md:text-8xl font-display font-black text-babun-primary mb-2 flex items-center justify-center">
                  <AnimatedNumber value={stat.val} />{stat.suffix || ""}
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
      <section className="bg-black pt-16 pb-28 lg:pb-36 relative overflow-visible min-h-[640px] flex items-center" dir="rtl">
        {/* Grid Background */}
        <div className="absolute inset-x-0 top-0 opacity-[0.15] h-full overflow-hidden" 
             style={{ 
               backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
               backgroundSize: '100px 100px'
             }} 
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12"
        >
          
          {/* Right Column - Titles */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-right">
            <h2 className="text-5xl sm:text-6xl md:text-[6.5rem] lg:text-[7.5rem] font-display font-black leading-[0.9] lg:leading-[0.85] mb-6">
              <span className="text-babun-accent block lg:pr-8">הקורס</span>
              <span className="text-white block mt-2 lg:mt-3 lg:pr-8">הבא</span>
              <span className="text-white block mt-2 lg:mt-3 lg:pr-8">נפתח</span>
            </h2>
          </div>

          {/* Center Column - Enlarged Contact Form (Circular Lead Card) */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center relative z-20 my-4 lg:my-0">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white/95 backdrop-blur-md p-8 sm:p-12 md:p-14 lg:p-16 rounded-full shadow-[0_25px_60px_rgba(0,0,0,0.6)] border border-white/30 w-[340px] sm:w-[440px] md:w-[500px] lg:w-[540px] aspect-square flex flex-col justify-center items-center text-center mx-auto"
            >
              <div className="bg-[#fe0000] text-white px-5 py-1.5 rounded-full font-black text-xs sm:text-sm inline-block mb-3 sm:mb-4 shadow-md">
                מחזור חדש נפתח!
              </div>

              {courseStatus === "success" ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center w-full max-w-[240px] sm:max-w-[280px]"
                >
                  <CheckCircle size={52} className="text-green-500 mx-auto mb-3 animate-bounce" />
                  <div className="text-babun-primary font-bold text-xl leading-tight mb-2">פרטיך התקבלו בהצלחה!</div>
                  <p className="text-babun-primary/70 text-sm leading-snug mb-3">מעביר אותך לעמוד ההרשמה לקורס...</p>
                  <a
                    href="https://rainitz.ravpage.co.il/lo-mehakim-ladira?ref=atar"
                    className="inline-block bg-babun-primary text-white text-xs font-bold py-2.5 px-5 rounded-full hover:bg-black transition-colors"
                  >
                    מעבר לעמוד ההרשמה ←
                  </a>
                </motion.div>
              ) : (
                <div className="w-full max-w-[240px] sm:max-w-[290px] md:max-w-[320px]">
                  <p className="text-babun-primary text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 leading-tight px-2">
                    השאירו פרטים להרשמה:
                  </p>
                  
                  <form onSubmit={handleCourseSyllabus} className="flex flex-col gap-2.5 sm:gap-3 w-full">
                    <input 
                      type="text" 
                      placeholder="שם מלא"
                      className="w-full h-10 sm:h-11 bg-gray-50/90 px-4 rounded-full border border-gray-200 focus:border-babun-accent focus:bg-white outline-none text-xs sm:text-sm text-center text-babun-primary placeholder:text-gray-400 shadow-inner"
                      value={courseName}
                      onChange={e => setCourseName(e.target.value)}
                    />
                    <input 
                      type="tel" 
                      placeholder="מספר טלפון"
                      className="w-full h-10 sm:h-11 bg-gray-50/90 px-4 rounded-full border border-gray-200 focus:border-babun-accent focus:bg-white outline-none text-xs sm:text-sm text-center text-babun-primary placeholder:text-gray-400 shadow-inner"
                      value={coursePhone}
                      onChange={e => setCoursePhone(e.target.value)}
                    />
                    <input 
                      type="email" 
                      placeholder="כתובת אימייל"
                      className="w-full h-10 sm:h-11 bg-gray-50/90 px-4 rounded-full border border-gray-200 focus:border-babun-accent focus:bg-white outline-none text-xs sm:text-sm text-center text-babun-primary placeholder:text-gray-400 shadow-inner"
                      value={courseEmail}
                      onChange={e => setCourseEmail(e.target.value)}
                    />
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="bg-babun-primary text-white font-bold w-full h-10 sm:h-11 rounded-full shadow-md transition-colors hover:bg-black flex items-center justify-center text-xs sm:text-sm cursor-pointer mt-1"
                    >
                      להרשמה
                    </motion.button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>

          {/* Left Column - Yellow Circle overlapping onto the white form circle */}
          <div className="flex-1 flex justify-center lg:justify-start items-center relative z-30 lg:translate-y-[60px] lg:translate-x-[80px] lg:-mr-20 -mt-12 lg:mt-0">
            <div className="w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-[380px] lg:h-[380px] bg-babun-accent rounded-full relative flex items-center justify-center shadow-[0_20px_60px_rgba(0,0,0,0.45)] border-4 border-babun-accent overflow-hidden">
               <img 
                 src="/src/assets/images/lo-mehakim.svg" 
                 alt="לא מחכים לדירה" 
                 className="w-full h-full object-cover"
                 referrerPolicy="no-referrer"
               />
            </div>
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
                 className={`rounded-babun-lg p-10 flex flex-col items-center text-center shadow-sm border border-black/5 relative overflow-hidden ${card.bgImage ? 'text-white' : 'bg-white'}`}
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
      <section className="py-24 bg-babun-accent text-babun-primary" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-8">
            <div className="text-right">
              <h2 className="text-4xl md:text-6xl font-display font-black text-babun-primary leading-tight mb-4">פודקאסטים</h2>
              <p className="text-xl text-babun-primary/70 font-light">ידע שווה כח. תאזינו ותשארו מעודכנים.</p>
            </div>
            
            <Link to="/articles?category=podcast" className="flex items-center gap-4 group cursor-pointer">
               <span className="font-bold text-babun-primary/80 group-hover:text-babun-primary transition-colors">לכל הפודקאסטים</span>
               <div className="w-12 h-12 bg-babun-primary text-white rounded-none flex items-center justify-center transition-all group-hover:bg-babun-accent group-hover:text-babun-primary border border-babun-primary">
                  <ArrowLeft size={20} />
               </div>
            </Link>
          </div>

          {/* Articles/Podcasts Asymmetric Grid */}
          {latestMedia.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Right Column: 1 Large Featured Article/Podcast */}
              <div className="lg:col-span-7 flex flex-col">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="flex flex-col h-full group cursor-pointer"
                >
                  {(() => {
                    return (
                      <Link
                        to={`/articles/${latestMedia[0].id || ""}`}
                        className="flex flex-col h-full bg-white hover:bg-zinc-50/50 p-6 rounded-none border-2 border-babun-primary transition-all duration-300"
                      >
                        <div className="relative aspect-[16/9] rounded-none overflow-hidden mb-6 border border-babun-primary/25">
                          <img 
                            src={getDisplayImage(latestMedia[0].image)} 
                            alt={latestMedia[0].title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-4 right-4 z-20">
                            <span className="px-3 py-1 bg-babun-accent text-babun-primary text-[10px] uppercase font-black tracking-widest rounded-none border border-babun-primary">
                              {latestMedia[0].category || "פודקאסט"}
                            </span>
                          </div>
                          <div className="absolute bottom-4 left-4">
                            <div className="w-12 h-12 bg-babun-primary text-white rounded-none flex items-center justify-center border border-babun-primary transition-all group-hover:bg-babun-accent group-hover:text-babun-primary group-hover:rotate-[-45deg]">
                              <ArrowLeft size={22} />
                            </div>
                          </div>
                        </div>
                        <div className="px-2 text-right">
                          <div className="flex items-center justify-end gap-2 text-babun-primary/60 font-bold text-xs mb-3">
                            <span>{latestMedia[0].date}</span>
                            <div className="w-1.5 h-1.5 bg-babun-primary/30 rounded-none" />
                            <span>יעקב רייניץ</span>
                          </div>
                          <h3 className="text-2xl md:text-3xl lg:text-4xl font-display font-black text-babun-primary leading-snug group-hover:text-babun-accent transition-colors line-clamp-2">
                            {latestMedia[0].title}
                          </h3>
                          {latestMedia[0].summary && (
                            <p className="mt-4 text-babun-primary/70 text-sm md:text-base leading-relaxed line-clamp-2 font-medium">
                              {latestMedia[0].summary}
                            </p>
                          )}
                          <div className="mt-4 flex items-center justify-end gap-2 text-babun-primary font-bold text-sm">
                            <span>צפייה והאזנה לפרק באתר</span>
                            <ArrowLeft size={16} />
                          </div>
                        </div>
                      </Link>
                    );
                  })()}
                </motion.div>
              </div>

              {/* Left Column: 3 Smaller Stacked Articles/Podcasts */}
              <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
                {latestMedia.slice(1, 4).map((item, index) => {
                  return (
                    <motion.div
                      key={item.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="group"
                    >
                      <Link
                        to={`/articles/${item.id || ""}`}
                        className="flex gap-4 p-4 rounded-none bg-white hover:bg-zinc-50/50 transition-all duration-300 border-2 border-babun-primary"
                      >
                        <div className="relative w-28 sm:w-36 aspect-[4/3] rounded-none overflow-hidden flex-shrink-0 border border-babun-primary/10">
                          <img 
                            src={getDisplayImage(item.image)} 
                            alt={item.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-2 right-2 z-20">
                            <span className="px-2 py-0.5 bg-babun-accent text-babun-primary text-[8px] uppercase font-black tracking-widest rounded-none border border-babun-primary">
                              {item.category || "פודקאסט"}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col justify-center text-right flex-1 min-w-0">
                          <div className="flex items-center justify-end gap-1.5 text-babun-primary/60 font-bold text-[10px] mb-2">
                            <span>{item.date}</span>
                          </div>
                          <h4 className="text-base sm:text-lg font-display font-black text-babun-primary leading-tight group-hover:text-babun-accent transition-colors line-clamp-2">
                            {item.title}
                          </h4>
                          <div className="mt-2 flex items-center justify-end gap-1 text-[11px] font-bold text-babun-primary/70 group-hover:text-babun-primary">
                            <span>האזנה לפרק באתר</span>
                            <ArrowLeft size={12} />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="col-span-full bg-white/70 border border-babun-primary/10 rounded-none p-12 text-center text-babun-primary/60 font-display">
              <p className="text-lg font-bold mb-2">אין עדיין פודקאסטים במערכת</p>
              <p className="text-sm opacity-70">
                כל התכנים הקודמים נמחקו לבקשתך על מנת לאפשר התחלה נקייה ומהירה מן היסוד.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-[#121212] flex items-center">
         {/* Video Background */}
         <div className="absolute inset-0 z-0 opacity-60 select-none pointer-events-none overflow-hidden">
            <iframe 
               className="absolute top-1/2 left-1/2 min-w-full min-h-full w-[180%] h-[180%] aspect-video -translate-x-1/2 -translate-y-1/2 pointer-events-none object-cover scale-125"
               src="https://player.vimeo.com/video/1218634309?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1&playsinline=1&dnt=1"
               allow="autoplay; fullscreen; picture-in-picture"
               frameBorder="0"
            />
            {/* Transparent click/tap block layer */}
            <div className="absolute inset-0 bg-transparent z-[10] pointer-events-auto" />
            {/* Dark Gradient Overlay & Black Semi-Transparent Layer */}
            <div className="absolute inset-0 bg-black/60 z-[1]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60 z-[2]" />
         </div>

         <div className="w-full max-w-none px-4 md:px-12 lg:px-24 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16 text-right">
            <div className="flex-1 lg:max-w-4xl">
               <h2 className="text-5xl md:text-7xl lg:text-[7.5rem] font-display font-black mb-6 text-white leading-[0.9]">קבל את המידע <br /><span className="text-babun-accent">לפני כולם</span></h2>
               <p className="text-white/80 text-xl md:text-2xl font-light leading-relaxed max-w-2xl">הטור השבועי, ניתוחי שוק, פינת חדשות נדל"ן - ישירות אליך.</p>
            </div>
            <div className="w-full max-w-lg bg-transparent backdrop-blur-xl p-12 rounded-2xl border border-white/20 shadow-2xl">
               {status === "success" ? (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="bg-babun-accent/10 p-10 text-center rounded-2xl border border-babun-accent/30"
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
                     placeholder="שם פרטי" value={newsletterName} onChange={e => setNewsletterName(e.target.value)} 
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
