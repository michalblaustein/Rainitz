import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  CheckCircle, 
  Video, 
  Star, 
  MapPin, 
  Clock, 
  Award, 
  ChevronDown, 
  MessageSquare, 
  BookOpen, 
  Check 
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  startFrom?: number;
}

function AnimatedCounter({ 
  value, 
  duration = 1500, 
  prefix = "", 
  suffix = "",
  startFrom = 0
}: AnimatedCounterProps) {
  const [count, setCount] = useState(startFrom);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let startTimestamp: number | null = null;
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Cubic ease-out curve
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(startFrom + easeOutProgress * (value - startFrom)));
            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              setCount(value);
            }
          };
          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [value, duration, startFrom]);

  return (
    <span ref={elementRef}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

export default function Courses() {
  // Navigation / smooth scroll helper
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  // Firestore submission states
  const [digitalFormData, setDigitalFormData] = useState({ name: "", phone: "", email: "" });
  const [frontalFormData, setFrontalFormData] = useState({ name: "", phone: "", email: "" });
  const [digitalStatus, setDigitalStatus] = useState<null | "loading" | "success">(null);
  const [frontalStatus, setFrontalStatus] = useState<null | "loading" | "success">(null);

  const handleRegisterDigital = async (e: React.FormEvent) => {
    e.preventDefault();
    setDigitalStatus("loading");
    try {
      await addDoc(collection(db, "course_registrations"), {
        ...digitalFormData,
        type: "קורס דיגיטלי - רישום מוקדם",
        createdAt: serverTimestamp(),
      });
      setDigitalStatus("success");
      setDigitalFormData({ name: "", phone: "", email: "" });
    } catch (err) {
      console.error(err);
      setDigitalStatus(null);
    }
  };

  const handleRegisterFrontal = async (e: React.FormEvent) => {
    e.preventDefault();
    setFrontalStatus("loading");
    try {
      await addDoc(collection(db, "course_registrations"), {
        ...frontalFormData,
        type: "קורס פרונטלי - רישום לעדכונים",
        createdAt: serverTimestamp(),
      });
      setFrontalStatus("success");
      setFrontalFormData({ name: "", phone: "", email: "" });
    } catch (err) {
      console.error(err);
      setFrontalStatus(null);
    }
  };

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "האם הקורס מתאים לי אם עוד לא קניתי?",
      a: "כן - זה בדיוק הזמן. לפני שחתמתם, לא אחרי. קודם מקבלים את הידע כדי להימנע מטעויות קריטיות שיעלו מאות אלפי שקלים."
    },
    {
      q: "האם אפשר להצטרף באמצע סדרה?",
      a: "לא. כל מחזור מבוסס על שלבים נבנים ומתחיל מההתחלה. מומלץ להירשם ולשריין מקום מראש כדי לא לפספס את תחילת הסדרה."
    },
    {
      q: "יש קורס דיגיטלי?",
      a: "בקרוב מאוד! אנחנו בתהליכי הקלטה של הגרסה הדיגיטלית המלאה. מומלץ להירשם בהרשמה מוקדמת כדי לקבל עדיפות ומחיר מיוחד כשיעלה לאוויר."
    },
    {
      q: "האם הקורס מתאים לאנשי מקצוע?",
      a: "כן בהחלט. בכל מחזור משתתפים מתווכים, ברוקרים ויועצי משכנתאות שרוצים לחדד את ארגז הכלים המעשי שלהם ולשפר את איכות השיחה עם הלקוחות."
    },
    {
      q: "כמה משתתפים בקבוצה?",
      a: "עד 25 משתתפים בלבד לכל היותר. המגבלה הזו אינה מקרית - קבוצה גדולה יותר מייצרת הרצאה חד-צדדית, בשעה שאנחנו שואפים למפגש דינמי ושיחה אמיתית עם מענה לכל שאלה."
    }
  ];

  const syllabus = [
    {
      num: "מפגש 1",
      title: "איך עובד השוק: מה אתה לא רואה",
      desc: "מחיר בשוק לא תמיד שווה למחיר האמיתי. נלמד לקרוא את מפות הכוח והאינטרסים של השוק, לנתח מחירים בפועל, ולפתח עין חדה לפני שהשוק קורא אותך."
    },
    {
      num: "מפגש 2",
      title: "תכנון פיננסי ומשכנתא",
      desc: "כמה באמת אתה יכול לקחת? כמה אתה באמת צריך? נעבור לעומק על החזרים, ריביות, תמהילים נפוצים ובנקאות - כל מה שהבנק נוטה לא להסביר לך לפני שאתה חותם."
    },
    {
      num: "מפגש 3",
      title: "בדיקת נכסים",
      desc: "המדריך המעשי לבדיקת נכס: מה בודקים, מי בודק, אילו דברים מסתתרים מאחורי הקירות, ומה קורה כשמדלגים על הבדיקות הפיזיות והמשפטיות. תקבל רשימת בדיקה (Checklist) ברורה לשטח."
    },
    {
      num: "מפגש 4",
      title: "אנשי המקצוע",
      desc: "מי עומד מולך? מתווך, שמאי, עורך דין, יזם, קבלן. נבין לעומק מי באמת עובד בשבילך, למי יש אינטרס כפול, ואיך מייצרים איתם יחסי עבודה בריאים לטובת הכיס שלך."
    },
    {
      num: "מפגש 5",
      title: "עסקאות מיוחדות",
      desc: "בוחנים את המכשולים וההזדמנויות: מחיר למשתכן (דירה בהנחה), קבוצות רכישה, תמ\"א 38, ופינוי-בינוי. מה באמת שווה את ההשקעה ומה בעיקר נשמע טוב על הנייר."
    },
    {
      num: "מפגש 6",
      title: "משא ומתן וסגירה",
      desc: "תורת המו\"מ בנדל\"ן: איך מנהלים שיחה, באילו טקטיקות להשתמש, על מה אסור לחתום בשום אופן בטיוטות, ואיך להשלים את העסקה ולצאת לדרך ארוכה בראש שקט לגמרי."
    }
  ];

  const whatYouGet = [
    {
      title: "ידע שקוף, בלי אינטרסים",
      desc: "אני לא מחויב לאף קבלן, לאף יזם, או לאף גורם פיננסי בשוק. מה שתשמע בקורס - זה בדיוק מה שאני אומר לחברים קרובים שמבקשים עצה."
    },
    {
      title: "ליווי אנושי אמיתי",
      desc: "ליווי, בדיקת שיעורי בית ומענה לשאלות אונליין"
    },
    {
      title: "6 מפגשים שבונים שלב אחרי שלב",
      desc: "מסלול לימוד מסודר ובונה. אין קפיצות חדות או הנחה מראש שאתה כבר שולט בחומר. אנחנו מתחילים מהיסודות האיתנים ומגיעים להבנת הרזים העמוקים ביותר."
    },
    {
      title: "כלים שאפשר להשתמש בהם מחר",
      desc: "רשימות בדיקה פרקטיות למגרשים ודירות, שאלות זהב לשאול מתווכים, וזיהוי מיידי של דגלים אדומים בנכס. לא תיאוריות באוויר - אלא כלים אמיתיים."
    }
  ];

  const personas = [
    {
      title: "זוגות ואברכים - דירה ראשונה",
      desc: "שמעתם כבר עצות מכל כיוון אפשרי ומצאתם את עצמכם מבולבלים. הקורס יעשה לכם סדר מופתי, בשפה פשוטה וברורה בגובה העיניים, בלי מונחים מתוחכמים של מתווכים."
    },
    {
      title: "משקיעים פרטיים",
      desc: "צברתם הון ראשוני ואתם רוצים לנווט אותו בצורה הבטוחה ביותר. הקורס יצייד אתכם בכלים מקצועיים לבחון בעצמכם כל פרויקט או הצעה - רגע לפני שאתם מתייעצים עם אחרים."
    },
    {
      title: "נפגעי נדל\"ן",
      desc: "ביצעתם בעבר עסקה שלא צלחה או שהסתבכה בדרך? זה הזמן המדויק להבין באופן מקצועי מה קרה שם, להפיק לקחים ברורים ולרכוש ביטחון חדש כדי לא לחזור על הטעות לעולם."
    },
    {
      title: "אנשי מקצוע",
      desc: "הזדמנות יקרת ערך למתווכים, ברוקרים ויועצי משכנתאות בתחילת הדרך או ותיקים שרוצים לחדד את הידע השיווקי והמקצועי, ולשפר לאין שיעור את השיח היומיומי מול הלקוחות."
    }
  ];

  return (
    <div className="bg-babun-light min-h-screen text-right font-sans antialiased selection:bg-babun-accent/30 selection:text-babun-primary">
      
      {/* HERO SECTION */}
      <section className="relative bg-black text-white pt-40 pb-28 overflow-hidden">
        {/* Background YouTube Video */}
        <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none">
          <iframe
            className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto aspect-video -translate-x-1/2 -translate-y-1/2 pointer-events-none object-cover scale-150 opacity-100"
            src="https://www.youtube.com/embed/-4PqP8IkpH0?autoplay=1&mute=1&loop=1&playlist=-4PqP8IkpH0&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&disablekb=1&fs=0&autohide=1"
            title="Syllabus Promo Background Video"
            frameBorder="0"
            allow="autoplay; encrypted-media"
          />
          {/* Transparent click/tap block layer */}
          <div className="absolute inset-0 bg-transparent z-[10] pointer-events-auto" />
          {/* Black Transparent Overlay & mesh grid */}
          <div className="absolute inset-0 bg-black/75 z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/45 z-[2]" />
          <div className="absolute inset-0 mesh-grid opacity-5 z-[3]" />
        </div>
        
        {/* Ambient subtle glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-babun-accent/10 rounded-full blur-[120px] pointer-events-none z-10" />
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 text-right">
          <div className="max-w-4xl">

            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="text-4xl md:text-6xl lg:text-[86px] lg:leading-[84px] font-display font-black pt-28 mb-6 tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]"
            >
              רוב הטעויות בנדל"ן <br />
              <span className="text-babun-accent">קורות מחוסר ידע.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-white text-lg md:text-2xl font-light mb-10 max-w-2xl leading-relaxed md:leading-[33px] flex flex-col gap-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
            >
              <span>הקורס המקצועי לרוכשי דירות ומשקיעי נדל"ן.</span>
              <span>קצר, ממוקד, אישי, פרקטי. והכי חשוב: בשפה שלך.</span>
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-5 pt-2"
            >
              {/* White Button - מה לומדים בקורס? */}
              <button 
                onClick={() => scrollToSection("syllabus-section")}
                className="bg-white hover:bg-zinc-100 text-babun-primary text-lg px-9 py-4 font-black rounded-[100px] shadow-lg border border-zinc-200/80 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>מה לומדים בקורס?</span>
              </button>

              {/* Yellow Button - להרשמה לקורס */}
              <button 
                onClick={() => scrollToSection("register-section")}
                className="bg-babun-accent hover:bg-babun-accent/90 text-babun-primary text-lg px-9 py-4 font-black rounded-[100px] shadow-lg shadow-babun-accent/25 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 group cursor-pointer"
              >
                <span className="font-display">להרשמה לקורס</span>
                <ArrowLeft size={20} className="group-hover:translate-x-[-6px] transition-transform duration-300" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* QUICK TRUST BAR (רצועת אמינות מהירה) */}
      <section className="bg-black text-white py-8 border-y border-zinc-900 relative z-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-zinc-800">
            
            <div className="text-center px-4 flex flex-col justify-center items-center">
              <span className="text-babun-accent font-display text-2xl md:text-3xl font-black">
                <AnimatedCounter value={2006} prefix="משנת " startFrom={1995} />
              </span>
              <span className="text-zinc-400 text-sm md:text-base mt-1">בשוק הנדל״ן</span>
            </div>

            <div className="text-center px-4 pt-4 lg:pt-0 flex flex-col justify-center items-center">
              <span className="text-babun-accent font-display text-2xl md:text-3xl font-black">
                <AnimatedCounter value={500} suffix=" בוגרים" />
              </span>
              <span className="text-zinc-400 text-sm md:text-base mt-1">שיצאו לשטח</span>
            </div>

            <div className="text-center px-4 pt-4 lg:pt-0 flex flex-col justify-center items-center">
              <span className="text-babun-accent font-display text-2xl md:text-3xl font-black">
                <AnimatedCounter value={6} suffix=" מפגשים" />
              </span>
              <span className="text-zinc-400 text-sm md:text-base mt-1">שלב אחרי שלב</span>
            </div>

            <div className="text-center px-4 pt-4 lg:pt-0 flex flex-col justify-center items-center">
              <span className="text-babun-accent font-display text-2xl md:text-3xl font-black">
                <AnimatedCounter value={100} suffix="%" />
              </span>
              <span className="text-zinc-400 text-sm md:text-base mt-1">ללא אינטרסים</span>
            </div>

          </div>
        </div>
      </section>

      {/* THE SECTION PEOPLE SKIP - AND REGRET LATER (הסקשן שאנשים מדלגים עליו - ואחר כך מתחרטים) */}
      <section className="py-24 bg-[#FFFBEB] relative overflow-hidden text-right">
        <div className="absolute top-0 right-0 w-24 h-24 bg-babun-accent/20 rounded-bl-full pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 md:px-8 text-babun-primary relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Right column: Text content */}
            <div className="lg:col-span-7">
              <h2 className="text-3xl md:text-5xl font-display font-black mb-8 leading-tight">
                בוא נדבר ישר.
              </h2>

              <div className="space-y-6 text-lg md:text-xl font-light text-babun-primary">
                <p className="leading-relaxed">
                  רוב האנשים שמגיעים אלי לייעוץ - מגיעים אחרי שחתמו. אחרי שסמכו על מתווך שעבד בשביל הצד השני. אחרי שלקחו משכנתא שלא הבינו עד הסוף. אחרי שגילו שאפשר היה לשלם פחות.
                </p>
                <p className="leading-relaxed flex flex-col gap-1">
                  <span>אני שואל אותם כל פעם: <strong className="font-bold bg-babun-accent/30 py-0.5 px-1.5 rounded">"למה לא למדת לפני?"</strong></span>
                  <span>התשובה תמיד אותה תשובה: <strong className="font-bold">"לא ידעתי שצריך."</strong></span>
                </p>
                <div className="pt-4">
                  <p className="text-2xl md:text-3xl font-display font-black text-babun-primary leading-snug">
                    <span>הקורס הזה קיים כדי שאתה תדע!</span>
                    <span className="block mt-1 text-babun-primary">כי ידע = כסף!</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Left column: Image */}
            <div className="lg:col-span-5 flex justify-center">
              <img 
                src="https://lh3.googleusercontent.com/d/1h-0JRjvxlcFpQE7nTFKcsAXMlfCchmec" 
                alt="בוא נדבר ישר"
                className="w-full max-w-md lg:max-w-none h-auto rounded-lg object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET (מה תקבל - בקורס הזה) */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-right">
          <div className="text-right mb-16 lg:mb-20">
            <h2 className="text-3xl md:text-5xl font-display font-black text-babun-primary tracking-tight">
              מה תקבל - בקורס הזה
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {whatYouGet.map((item, index) => (
              <div 
                key={index}
                className="bg-zinc-50 p-8 md:p-10 rounded-babun-lg border border-zinc-100 hover:border-babun-accent hover:bg-white transition-all duration-300 group shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-full bg-babun-accent/10 flex items-center justify-center text-babun-primary mb-6 group-hover:bg-babun-accent transition-colors">
                    <Check size={24} className="group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-display font-black mb-4 text-babun-primary leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-zinc-600 font-light leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6 MEETINGS SYLLABUS (6 מפגשים - מה לומדים) */}
      <section id="syllabus-section" className="py-24 bg-zinc-950 relative border-t border-zinc-900 overflow-hidden">
        {/* Animated/Video Background Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none">
          <iframe
            src="https://www.youtube.com/embed/-4PqP8IkpH0?autoplay=1&mute=1&loop=1&playlist=-4PqP8IkpH0&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&disablekb=1&fs=0&autohide=1"
            className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto aspect-video -translate-x-1/2 -translate-y-1/2 pointer-events-none object-cover scale-150 opacity-100"
            title="Syllabus background video"
            frameBorder="0"
            allow="autoplay; encrypted-media"
          />
          {/* Transparent click/tap block layer */}
          <div className="absolute inset-0 bg-transparent z-[10] pointer-events-auto" />
          <div className="absolute inset-0 bg-black/75 z-[1]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 text-right relative z-10">
          <div className="text-right mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-black text-white flex items-center justify-start gap-3">
              <span>מה מחכה לך בקורס?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {syllabus.map((item, index) => (
              <div 
                key={index}
                className="bg-black/50 backdrop-blur-md p-8 md:p-10 rounded-[24px] border border-zinc-800/80 shadow-md shadow-black/40 hover:shadow-xl hover:border-babun-accent/50 transition-all duration-300 relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-2 h-full bg-transparent group-hover:bg-babun-accent transition-colors" />
                <div className="text-sm font-bold text-babun-accent tracking-widest uppercase mb-4 font-display group-hover:opacity-100 transition-opacity">
                  {item.num}
                </div>
                <h3 className="text-lg md:text-xl font-display font-black text-white mb-4 leading-snug">
                  {item.title}
                </h3>
                <p className="text-zinc-300 text-sm md:text-base leading-relaxed font-light">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS (מה אומרים המשתתפים) */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-right mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-black text-babun-primary">
              מה אומרים המשתתפים
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Testimonial 1 */}
            <div className="bg-zinc-50 p-8 md:p-10 rounded-[30px] border border-zinc-200/70 relative flex flex-col justify-between">
              <div className="absolute top-8 left-8 text-babun-accent opacity-20 hover:opacity-40 pointer-events-none">
                <MessageSquare size={48} fill="currentColor" />
              </div>
              <p className="text-lg md:text-xl font-light leading-relaxed italic text-zinc-800 mb-8 z-10">
                "הכי הפתיע אותי כמה הדגלים האדומים פשוטים לזיהוי ברגע שיודעים מה הם. לפני הקורס היינו בטוחים שמתווך רואה רק אותנו בעיניים, בזכות יעקב הבנו איך לעשות את הבדיקה בעצמנו ולחסוך המון."
              </p>
              <div className="border-t border-zinc-200/60 pt-6">
                <span className="block font-display font-black text-babun-primary text-base">אברהם ש'</span>
                <span className="block text-zinc-400 text-sm font-bold">בני ברק</span>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-zinc-50 p-8 md:p-10 rounded-[30px] border border-zinc-200/70 relative flex flex-col justify-between">
              <div className="absolute top-8 left-8 text-babun-accent opacity-20 hover:opacity-40 pointer-events-none">
                <MessageSquare size={48} fill="currentColor" />
              </div>
              <p className="text-lg md:text-xl font-light leading-relaxed italic text-zinc-800 mb-8 z-10">
                "תוצאה מעשית שאני יכולה למדוד: פשוט שמרתי על הכסף שלי. הבנתי בדיוק למה לקחת משכנתא רק עם ליווי פיננסי עצמאי ולא להסתפק במה שנציג הבנק אומר. קומבינות שלא הכרתי נחשפו לחלוטין."
              </p>
              <div className="border-t border-zinc-200/60 pt-6">
                <span className="block font-display font-black text-babun-primary text-base">מרדכי בר\"ג</span>
                <span className="block text-zinc-400 text-sm font-bold">ירושלים</span>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-zinc-50 p-8 md:p-10 rounded-[30px] border border-zinc-200/70 relative flex flex-col justify-between">
              <div className="absolute top-8 left-8 text-babun-accent opacity-20 hover:opacity-40 pointer-events-none">
                <MessageSquare size={48} fill="currentColor" />
              </div>
              <p className="text-lg md:text-xl font-light leading-relaxed italic text-zinc-800 mb-8 z-10">
                "קיבלתי משמעת שטח יוצאת מן הכלל. הכלים שיוצאים איתך לפגישה עם אנשי הצעד השני כמו מתווכים ושמאים גרמו לי להשקיע בביטחון של 100% בלי חששות."
              </p>
              <div className="border-t border-zinc-200/60 pt-6">
                <span className="block font-display font-black text-babun-primary text-base">אסתר ל'</span>
                <span className="block text-zinc-400 text-sm font-bold">בית שמש</span>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* TALMUDIC QUOTE BANNER (ציטוט חז"ל - שליש בקרקע) */}
      <section className="relative py-28 overflow-hidden text-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://lh3.googleusercontent.com/d/106j555_P00ozO9jb9m_3SiK8uffjmOEz" 
            alt="רקע שליש בקרקע" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="space-y-6">
            <h3 className="text-2xl md:text-3.5xl font-display font-black text-black leading-relaxed max-w-3xl mx-auto">
              "לעולם ישליש אדם את מעותיו: שליש בקרקע, ושליש בפרקמטיה (מסחר/עסקים), ושליש תחת ידו (מזומן נזיל)."
            </h3>
            <cite className="block text-xs md:text-sm font-bold text-zinc-800 not-italic pt-1">
              תלמוד בבלי, מסכת בבא מציעא, דף מ"ב, עמוד א
            </cite>
          </div>
        </div>
      </section>



      {/* ABOUT YAAKOV REINITZ (על יעקב רייניץ) */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-right">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left side: Photo with visual container */}
            <div className="lg:col-span-5 relative flex justify-center order-2 lg:order-1">
              <div className="relative w-full max-w-md aspect-square overflow-visible">
                <img 
                  src="https://lh3.googleusercontent.com/d/1wzfE5sZMtpfnHN39XgYqYtvsHanSB_vn" 
                  alt="יעקב רייניץ" 
                  className="w-full h-full object-cover rounded-[28px]"
                  referrerPolicy="no-referrer"
                />
                <motion.div 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 3, 
                    ease: "easeInOut" 
                  }}
                  className="absolute -bottom-6 -right-6 bg-white text-babun-primary p-5 rounded-babun-md font-display font-black shadow-lg border border-zinc-100 text-center min-w-[150px]"
                >
                  <span className="block text-3xl font-black text-babun-primary">18+</span>
                  <span className="text-xs font-bold leading-tight text-zinc-500">שנות מומחיות בשוק</span>
                </motion.div>
              </div>
            </div>

            {/* Right side: Bio copy */}
            <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
              <h2 className="text-3xl md:text-5xl font-display font-black text-babun-primary">
                על יעקב רייניץ
              </h2>
              <h3 className="text-xl md:text-2xl font-bold text-babun-primary/80">
                עיתונאי כלכלי שהפך למומחה נדל"ן. מומחה שהפך לשליחות.
              </h3>
              
              <div className="text-base md:text-lg font-light text-zinc-700 space-y-4 leading-relaxed">
                <p>
                  התחלתי כעיתונאי כלכלי - כיסיתי את שוק הנדל"ן העשיר והמורכב מבחוץ. הייתה לי גישה בלעדית לנתונים ומהלכים שרוב רובו של הציבור בארץ לא ראה או הבין לעומק. ראיתי יותר מדי פעמים מה קורה כשאנשים חותמים על חוזים דרקוניים ללא כל ידע קודם.
                </p>
                <p>
                  כשעברתי באופן רשמי לתחום הייעוץ האישי, הבנתי אמת פשוטה: הבעיה העיקרית היא איננה קיומם של אנשים רעים ומניפולטיביים בשוק. הבעיה המרכזית היא כוח משמעותי של ידע מקצועי פשוט שלא מגיע לאנשים הנכונים ברגע הנכון.
                </p>
                <p className="font-medium text-babun-primary bg-zinc-50 border-r-4 border-babun-accent p-4 rounded-l-babun-md">
                  הטור השבועי שלי ב"המודיע", הספר שכתבתי "שליש בקרקע" והקורסים שאני מעביר כיום - כולם קיימים עם מטרה אחת ברורה ובלעדית: שגם אתה תוכל לרכוש נדל״ן מתוך הבנת הנתונים וראש שקט ובטוח.
                </p>
                <p>
                  אני לא מחויב לאף קבלן, לאף יזם או לאף גורם פיננסי או מסחרי בשוק. מה שתשמע ממני במהלך הלימודים עובר דרך מסננת אחת בלבד: <strong className="font-bold">האם זה נכון ומדויק עבורך.</strong>
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* WHO IS THE COURSE FOR (למי הקורס מתאים) */}
      <section className="py-24 bg-zinc-50 relative border-y border-zinc-200/60">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-right">
          <div className="text-right mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-black text-babun-primary">
              למי הקורס מתאים
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {personas.map((persona, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-[24px] border border-zinc-200 hover:border-babun-accent transition-all duration-300 shadow-sm flex flex-col justify-between group"
              >
                <div>
                  <h3 className="text-xl font-display font-black text-babun-primary mb-4 leading-tight group-hover:text-babun-accent transition-colors">
                    {persona.title}
                  </h3>
                  <p className="text-zinc-600 text-sm md:text-base leading-relaxed font-light">
                    {persona.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION (שאלות נפוצות) */}
      <section className="py-24 bg-white relative">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-right">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-black text-babun-primary">
              שאלות נפוצות
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index} 
                  className="bg-zinc-50 rounded-babun-md border border-zinc-200/60 overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-6 text-right flex items-center justify-between gap-4 font-bold text-lg text-babun-primary hover:bg-zinc-100 transition-colors"
                  >
                    <span className="font-display font-black">{faq.q}</span>
                    <ChevronDown 
                      size={20} 
                      className={`text-zinc-500 transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="p-6 pt-0 border-t border-zinc-200/40 text-zinc-700 leading-relaxed font-light text-base">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* REGISTRATION SECTION (הרשמה) */}
      <section id="register-section" className="py-24 bg-white relative scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-black text-babun-primary">
              מסלולי הלימוד והרשמה
            </h2>
            <p className="text-zinc-600 mt-4 text-base md:text-lg max-w-2xl mx-auto font-light">
              בחרו את מסלול הלימוד המתאים לכם ביותר: קורס טלפוני זמין, קורס דיגיטלי מתקדם או קורס פרונטלי מעמיק בקבוצה.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            
            {/* CARD 1: PHONE COURSE */}
            <div className="bg-zinc-50 border border-zinc-200/80 p-8 rounded-[32px] shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-babun-primary/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 left-0 h-2 bg-babun-primary/20" />
              <div>
                <div className="flex justify-between items-start mb-6 gap-2">
                  <div>
                    <span className="inline-block px-3 py-1 bg-babun-primary/10 text-babun-primary text-xs font-black rounded-full mb-3">
                      במערכת אור עולם
                    </span>
                    <h3 className="text-2xl font-display font-black text-babun-primary">קורס טלפוני</h3>
                  </div>
                  <div className="text-left shrink-0">
                    <span className="text-2xl font-black text-babun-primary">1,200 ₪</span>
                    <p className="text-xs text-zinc-500 font-light">מחיר חד פעמי</p>
                  </div>
                </div>

                <p className="text-zinc-600 text-sm leading-relaxed mb-6 font-light">
                  לימוד נוח וזמין ישירות מהטלפון האישי שלך, בקצב שלך ובזמן שלך באמצעות מערכת הטלפוניה המתקדמת. הקורס מועבר במערכת הטלפונית של חסידות אור עולם ופתוח להאזנה בכל עת.
                </p>

                <div className="space-y-4 bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-zinc-200/60 mb-6">
                  <div className="flex justify-between items-center text-sm border-b border-zinc-100 pb-3">
                    <span className="text-zinc-500">מערכת:</span>
                    <span className="font-bold text-babun-primary">אור עולם</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-zinc-100 pb-3">
                    <span className="text-zinc-500">טלפון בחיוג ישיר:</span>
                    <a href="tel:0733454545" className="font-black text-babun-primary hover:text-babun-accent hover:underline">073-3454545</a>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500">שלוחה להרשמה:</span>
                    <span className="font-black text-babun-primary bg-zinc-100 px-2 py-0.5 rounded text-xs">שלוחה 6-2-2</span>
                  </div>
                </div>
              </div>

              <div>
                <a 
                  href="tel:0733454545"
                  className="w-full btn-babun-primary text-center justify-center font-black py-4 rounded-xl flex items-center gap-2 shadow-md hover:scale-[1.02] transition-transform"
                >
                  <span>☏ התקשרו עכשיו: 073-3454545</span>
                </a>
                <p className="text-center text-xs text-zinc-400 mt-3 font-light">שלוחה להאזנה וכל הפרטים: 6-2-2</p>
              </div>
            </div>

            {/* CARD 2: DIGITAL COURSE */}
            <div className="bg-zinc-50 border border-zinc-200/80 p-8 rounded-[32px] shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-babun-accent/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 left-0 h-2 bg-babun-accent" />
              <div>
                <div className="flex justify-between items-start mb-6 gap-2">
                  <div>
                    <span className="inline-block px-3 py-1 bg-babun-accent/15 text-babun-accent text-[11px] font-black rounded-full mb-3">
                      יפתח בקרוב
                    </span>
                    <h3 className="text-2xl font-display font-black text-babun-primary">קורס דיגיטלי</h3>
                  </div>
                  <div className="text-left shrink-0">
                    <span className="text-2xl font-black text-babun-primary">1,700 ₪</span>
                    <p className="text-xs text-zinc-500 font-light">לרוכשים ברישום מוקדם</p>
                  </div>
                </div>

                <p className="text-zinc-600 text-sm leading-relaxed mb-6 font-light">
                  המסלול המושלם ללמידה עצמית דינמית בקצב שלכם ובמכשיר שלכם. הרשמו עכשיו ללא כל התחייבות כספית כדי לשריין את הטבת הרישום המוקדם במועד ההשקה הקרוב.
                </p>

                {digitalStatus === "success" ? (
                  <div className="p-6 bg-babun-accent/20 border border-babun-accent text-babun-primary font-bold text-center rounded-2xl text-sm animate-fade-in my-6">
                    ✓ נרשמת בהצלחה לרישום מוקדם לקורס הדיגיטלי! נעדכן אותך ראשון ברגע ההשקה עם מחיר ההטבה.
                  </div>
                ) : (
                  <form onSubmit={handleRegisterDigital} className="space-y-3 mb-6 bg-white p-5 rounded-2xl border border-zinc-200/60 shadow-inner">
                    <span className="text-xs font-black text-babun-primary block mb-1">טופס רישום מוקדם</span>
                    
                    <div className="space-y-1">
                      <input 
                        required
                        type="text"
                        placeholder="שם מלא"
                        className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 focus:border-babun-accent focus:outline-none text-right"
                        value={digitalFormData.name}
                        onChange={e => setDigitalFormData({...digitalFormData, name: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-1 font-sans">
                      <input 
                        required
                        type="tel"
                        placeholder="מספר טלפון"
                        className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 focus:border-babun-accent focus:outline-none text-right"
                        value={digitalFormData.phone}
                        onChange={e => setDigitalFormData({...digitalFormData, phone: e.target.value})}
                      />
                    </div>

                    <div className="space-y-1 font-sans">
                      <input 
                        required
                        type="email"
                        placeholder="כתובת מייל"
                        className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 focus:border-babun-accent focus:outline-none text-right"
                        value={digitalFormData.email}
                        onChange={e => setDigitalFormData({...digitalFormData, email: e.target.value})}
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={digitalStatus === "loading"}
                      className="w-full bg-babun-accent text-babun-primary font-black py-2.5 rounded-lg text-xs hover:bg-babun-accent/90 transition-colors mt-2 cursor-pointer"
                    >
                      {digitalStatus === "loading" ? "שולח..." : "אישור ושמירת מקום ←"}
                    </button>
                  </form>
                )}
              </div>

              <div>
                <span className="block text-center text-xs text-zinc-400 font-light italic">הרשמה מוקדמת ללא צורך בכרטיס אשראי</span>
              </div>
            </div>

            {/* CARD 3: FRONTAL COURSE */}
            <div className="bg-zinc-50 border border-zinc-200/80 p-8 rounded-[32px] shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-babun-primary/15 relative overflow-hidden group">
              <div className="absolute top-0 right-0 left-0 h-2 bg-babun-primary" />
              <div>
                <div className="flex justify-between items-start mb-6 gap-2">
                  <div>
                    <span className="inline-block px-3 py-1 bg-babun-primary/10 text-babun-primary text-xs font-black rounded-full mb-3">
                      עדכון על מחזור קרוב
                    </span>
                    <h3 className="text-2xl font-display font-black text-babun-primary">קורס פרונטלי</h3>
                  </div>
                  <div className="text-left shrink-0">
                    <span className="text-2xl font-black text-babun-primary">2,500 ₪</span>
                    <p className="text-xs text-zinc-500 font-light">לרישום לעדכונים</p>
                  </div>
                </div>

                <p className="text-zinc-600 text-sm leading-relaxed mb-6 font-light">
                  מפגשים קבוצתיים פרונטליים, דיוני עומק, למידת עמיתים ישירה ומענה פנים-אל-פנים לשאלות הלב שלכם. צרו קשר לקבלת עדכונים על קורס חדש שיפתח בקרוב.
                </p>

                {frontalStatus === "success" ? (
                  <div className="p-6 bg-babun-primary/10 border border-babun-primary text-babun-primary font-bold text-center rounded-2xl text-sm animate-fade-in my-6">
                    ✓ תודה רבה! פרטיך נקלטו במערכת לעדכונים על פתיחת קורס פרונטלי קרוב. נהיה בקשר בהקדם!
                  </div>
                ) : (
                  <form onSubmit={handleRegisterFrontal} className="space-y-3 mb-6 bg-white p-5 rounded-2xl border border-zinc-200/60 shadow-inner">
                    <span className="text-xs font-black text-babun-primary block mb-1">טופס רישום לעדכונים</span>
                    
                    <div className="space-y-1">
                      <input 
                        required
                        type="text"
                        placeholder="שם מלא"
                        className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 focus:border-babun-primary focus:outline-none text-right"
                        value={frontalFormData.name}
                        onChange={e => setFrontalFormData({...frontalFormData, name: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-1 font-sans">
                      <input 
                        required
                        type="tel"
                        placeholder="מספר טלפון"
                        className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 focus:border-babun-primary focus:outline-none text-right"
                        value={frontalFormData.phone}
                        onChange={e => setFrontalFormData({...frontalFormData, phone: e.target.value})}
                      />
                    </div>

                    <div className="space-y-1 font-sans">
                      <input 
                        required
                        type="email"
                        placeholder="כתובת מייל"
                        className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 focus:border-babun-primary focus:outline-none text-right"
                        value={frontalFormData.email}
                        onChange={e => setFrontalFormData({...frontalFormData, email: e.target.value})}
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={frontalStatus === "loading"}
                      className="w-full bg-babun-primary text-white font-black py-2.5 rounded-lg text-xs hover:bg-babun-primary/90 transition-colors mt-2 cursor-pointer"
                    >
                      {frontalStatus === "loading" ? "שולח..." : "אישור ושמירת פרטים ←"}
                    </button>
                  </form>
                )}
              </div>

              <div>
                <span className="block text-center text-xs text-zinc-400 font-light italic">הירשמו כעת לעדכונים ללא כל עלות</span>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
