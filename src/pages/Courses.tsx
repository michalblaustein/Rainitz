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
  Check,
  Phone
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
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function Courses() {
  // Navigation / smooth scroll helper
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  // Firestore submission states and active registration course
  const [activeRegisterCourse, setActiveRegisterCourse] = useState<"phone" | "digital" | "frontal" | null>(null);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
  const [registrationStatus, setRegistrationStatus] = useState<null | "loading" | "success">(null);
  const formStripRef = useRef<HTMLDivElement>(null);

  const handleCourseSelect = (courseKey: "phone" | "digital" | "frontal") => {
    setActiveRegisterCourse(courseKey);
    setRegistrationStatus(null);
    setFormData({ name: "", phone: "", email: "" });
    
    // Smooth scroll down to the bottom form strip after state updates
    setTimeout(() => {
      formStripRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRegisterCourse) return;
    setRegistrationStatus("loading");
    try {
      let typeName = "";
      if (activeRegisterCourse === "phone") typeName = "קורס טלפוני - השארת פרטים";
      if (activeRegisterCourse === "digital") typeName = "קורס דיגיטלי - רישום מוקדם";
      if (activeRegisterCourse === "frontal") typeName = "קורס פרונטלי - רישום לעדכונים";

      await addDoc(collection(db, "course_registrations"), {
        ...formData,
        type: typeName,
        createdAt: serverTimestamp(),
      });
      setRegistrationStatus("success");
      setFormData({ name: "", phone: "", email: "" });
    } catch (err) {
      console.error(err);
      setRegistrationStatus(null);
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
      a: "כן בהחלט. בכל מחזור משתתפים מתווכים ויועצי משכנתאות שרוצים לחדד את ארגז הכלים המעשי שלהם ולשפר את איכות השיחה עם הלקוחות."
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
      title: "ידע שקוף בלי אינטרסים",
      desc: "אני לא מחויב לאף קבלן, לאף יזם, או לאף גורם פיננסי בשוק. מה שתשמע בקורס - זה בדיוק מה שאני אומר לחברים קרובים שמבקשים עצה."
    },
    {
      title: "התאמה אסטרטגית של העסקה",
      desc: "איך להגדיר תקציב אמיתי, לבחור את האזור הנכון, ולוודא שהנכס משרת את המטרות שלכם ולא להפך."
    },
    {
      title: "6 מפגשים שבונים שלב אחרי שלב",
      desc: "מסלול לימוד מובנה ומדורג. בלי קפיצות חדות ובלי הנחה מוקדמת שאתם כבר שולטים בחומר. אנחנו מתחילים מהיסודות האיתנים, ובונים את הידע צעד אחר צעד, עד להבנה המעמיקה ביותר של השוק."
    },
    {
      title: "כלים שאפשר להשתמש בהם מחר",
      desc: "רשימות בדיקה פרקטיות לפני חתימה על חוזה, שאלות מפתח למתווכים, וזיהוי מיידי של דגלים אדומים בנכס. בלי תיאוריות באוויר, רק כלים שעובדים בשטח."
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
      desc: "הזדמנות יקרת ערך למתווכים ויועצי משכנתאות בתחילת הדרך או ותיקים שרוצים לחדד את הידע השיווקי והמקצועי, ולשפר לאין שיעור את השיח היומיומי מול הלקוחות."
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
            src="https://www.youtube.com/embed/psnj6fJJlRE?autoplay=1&mute=1&loop=1&playlist=psnj6fJJlRE&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&disablekb=1&fs=0&autohide=1"
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
          <div className="max-w-4xl pr-[96px]">

            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="text-4xl md:text-6xl lg:text-[86px] lg:leading-[84px] font-display font-black pt-28 mb-6 tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]"
            >
              רוב הטעויות בנדל"ן <br />
              <span className="text-white">נובעות</span> <span className="text-babun-accent">מחוסר ידע.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-white text-lg md:text-2xl font-light mb-10 max-w-2xl leading-relaxed md:leading-[33px] flex flex-col gap-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
            >
              <span>הקורס המקצועי לרוכשי דירות ומשקיעי נדל"ן</span>
              <span>קצר, ממוקד, אישי, פרקטי. והכי חשוב: בשפה שלכם.</span>
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
                <AnimatedCounter value={1500} prefix="+" suffix=" טורים" startFrom={1000} />
              </span>
              <span className="text-zinc-400 text-sm md:text-base mt-1">מקצועיים</span>
            </div>

            <div className="text-center px-4 pt-4 lg:pt-0 flex flex-col justify-center items-center">
              <span className="text-babun-accent font-display text-2xl md:text-3xl font-black">
                <AnimatedCounter value={700} suffix="+ בוגרים" startFrom={500} />
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
                בואו נדבר על הטעות הכי גדולה שלכם.
              </h2>

              <div className="space-y-6 text-lg md:text-xl font-light text-babun-primary">
                <p className="leading-relaxed">
                  רוב האנשים מגיעים אליי לייעוץ – אחרי שחתמו.<br />
                  אחרי שסמכו על מתווך שעבד בשביל המוכר.<br />
                  אחרי שגילו שהעסקה פשוט לא מתאימה להם.<br />
                  אחרי שגילו שאפשר היה לשלם פחות.<br />
                  <strong className="font-black text-xl block mt-2">אל תגיעו אחרי.</strong>
                </p>
                <p className="leading-relaxed flex flex-col gap-1">
                  <span>אני שואל אותם כל פעם מחדש: <strong className="font-bold bg-babun-accent/30 py-0.5 px-1.5 rounded inline-block">"למה לא למדתם לפני?"</strong></span>
                  <span>והתשובה תמיד אותה תשובה: <strong className="font-bold">"לא ידענו שצריך"</strong></span>
                </p>
                <div className="pt-4">
                  <p className="text-2xl md:text-3xl font-display font-black text-babun-primary leading-snug">
                    <span>הקורס הזה קיים כדי שתדע לפני.</span>
                    <span className="block mt-1 text-babun-primary">כי ידע = כסף!</span>
                  </p>
                </div>
                <div className="pt-6">
                  <button 
                    onClick={() => scrollToSection("register-section")}
                    className="bg-babun-accent hover:bg-babun-accent/90 text-babun-primary text-lg px-10 py-4 font-black rounded-[100px] shadow-lg shadow-babun-accent/25 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 group cursor-pointer w-fit"
                  >
                    <span className="font-display">להרשמה לקורס</span>
                    <ArrowLeft size={18} className="group-hover:translate-x-[-6px] transition-transform duration-300" />
                  </button>
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
              מה תקבלו - בקורס הזה
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5">
            {whatYouGet.map((item, index) => (
              <div 
                key={index}
                className="bg-zinc-50 p-6 lg:p-8 rounded-babun-lg border border-zinc-100 hover:border-babun-accent hover:bg-white transition-all duration-300 group shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className={`${
                    index === 2 
                      ? "w-9 h-9 relative right-[6px]" 
                      : "w-12 h-12"
                  } rounded-full bg-babun-accent/10 flex items-center justify-center text-babun-primary mb-6 group-hover:bg-babun-accent transition-colors`}>
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
            src="https://www.youtube.com/embed/psnj6fJJlRE?autoplay=1&mute=1&loop=1&playlist=psnj6fJJlRE&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&disablekb=1&fs=0&autohide=1"
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
              <span>מה מחכה לכם בקורס?</span>
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

          <div className="mt-16 flex justify-start">
            <button 
              onClick={() => scrollToSection("register-section")}
              className="bg-babun-accent hover:bg-babun-accent/90 text-babun-primary text-lg px-12 py-4 font-black rounded-[100px] shadow-lg shadow-babun-accent/25 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 group cursor-pointer"
            >
              <span className="font-display">להרשמה לקורס</span>
              <ArrowLeft size={20} className="group-hover:translate-x-[-6px] transition-transform duration-300" />
            </button>
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

          <div className="flex justify-center mt-12">
            <button 
              onClick={() => scrollToSection("register-section")}
              className="bg-babun-accent hover:bg-babun-accent/90 text-babun-primary text-lg px-12 py-4 font-black rounded-[100px] shadow-lg shadow-babun-accent/25 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 group cursor-pointer"
            >
              <span className="font-display">להרשמה לקורס</span>
              <ArrowLeft size={20} className="group-hover:translate-x-[-6px] transition-transform duration-300" />
            </button>
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

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="space-y-6 max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3.5xl font-display font-black text-black leading-relaxed">
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
                על יעקב רייניץ:
              </h2>
              <h3 className="text-xl md:text-2xl font-bold text-babun-primary/80">
                עיתונאי שהפך למומחה. מומחה שהפך את הידע לשליחות.
              </h3>
              
              <div className="text-base md:text-lg font-light text-zinc-700 space-y-4 leading-relaxed">
                <p>
                  הכניסה שלי לשוק הנדל"ן התחילה מהכיסוי העיתונאי. ראיתי מספרים, מגמות ומהלכים שרוב הציבור לא חשוף אליהם. אבל מה שנחרט בי עמוק יותר מכל הנתונים והגרפים היו הפנים של האנשים.<br />
                  אלו שהגיעו אליי אחרי שחתמו. אחרי שהבינו שנפלו. אחרי שגילו, בכאב עצום, שאפשר היה למנוע את זה.
                </p>
                <p>
                  זה היה הרגע שבו הבנתי שהכתיבה בעיתון לבד כבר לא מספיקה.
                </p>
                <p>
                  כשעברתי לשטח והתחלתי לייעץ, הבנתי דבר אחד: הבעיה בשוק היא לא שיש בו רק אנשים רעים, אלא שהידע שיכול להציל משפחות מטעות של מיליוני שקלים פשוט לא מגיע אליהן בזמן.
                </p>
                <p className="font-medium text-babun-primary bg-zinc-50 border-r-4 border-babun-accent p-4 rounded-l-babun-md">
                  הקמתי את "מרכז רייניץ לנדל"ן" כי הבנתי שמישהו חייב לעמוד בצד שלכם. מהרגע הראשון ועד המפתח.
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

          <div className="mt-16 flex justify-center">
            <button 
              onClick={() => scrollToSection("register-section")}
              className="bg-babun-primary hover:bg-babun-primary/95 text-white text-lg px-12 py-4 font-black rounded-[100px] shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 group cursor-pointer"
            >
              <span className="font-display">להרשמה לקורס</span>
              <ArrowLeft size={20} className="group-hover:translate-x-[-6px] transition-transform duration-300" />
            </button>
          </div>
        </div>
      </section>

      {/* FAQ SECTION (שאלות נפוצות) */}
      <section className="py-24 bg-white relative">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-right">
          <div className="text-right mb-16">
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
      <section id="register-section" className="py-24 bg-babun-accent relative scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <div className="text-right mb-16">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-black text-babun-primary">
              תוכניות הלימוד והרשמה
            </h2>
            <p className="text-babun-primary/70 mt-4 text-lg md:text-xl max-w-2xl font-light leading-relaxed">
              בחרו את מסלול ההתקדמות המקצועי המועדף עליכם והצטרפו למאות בוגרים שכבר שומרים על הכסף שלהם בשטח:
            </p>
          </div>

          {/* 3 PREMIUM COURSE CARDS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            
            {/* Card 1: Phone Course */}
            <motion.div 
              whileHover={{ y: -6 }}
              className={`bg-white border rounded-[32px] p-8 md:p-10 shadow-[0_15px_30px_rgba(0,0,0,0.05)] flex flex-col justify-between transition-all duration-300 relative ${
                activeRegisterCourse === "phone" ? "ring-4 ring-babun-primary border-transparent" : "border-zinc-200/80"
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-babun-accent/15 rounded-2xl flex items-center justify-center text-babun-primary mb-4">
                    <Phone size={28} className="text-babun-primary" />
                  </div>
                  <div className="text-left bg-babun-primary/5 px-4 py-2 rounded-2xl border border-babun-primary/5">
                    <span className="text-xs text-zinc-500 font-bold block">מחיר מיוחד</span>
                    <span className="text-2xl font-black text-babun-primary font-display">1,200 ₪</span>
                  </div>
                </div>

                <h3 className="text-2xl md:text-3xl font-display font-black text-babun-primary mb-3">
                  קורס טלפוני
                </h3>
                <span className="inline-block px-3 py-1 bg-babun-primary/10 text-babun-primary text-xs font-black rounded-full mb-6">
                  במערכת אור עולם
                </span>

                <p className="text-zinc-600 text-base leading-relaxed mb-6 font-light">
                  לימוד נוח וזמין ישירות מהטלפון האישי שלך, בקצב שלך ובזמן שלך באמצעות מערכת טלפונית מתקדמת. הקורס מובא במערכת טלפונית של מרכז רייניץ לנדל״ן ופתוח להאזנה בכל עת.
                </p>

                <div className="space-y-3 pt-4 border-t border-zinc-100 mb-8 text-sm text-zinc-700">
                  <div className="flex items-center gap-2">
                    <Check size={18} className="text-babun-primary shrink-0" />
                    <span>האזנה חופשית לכל המפגשים 24/6</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={18} className="text-babun-primary shrink-0" />
                    <span>חומרי עזר להורדה לאחר כל מפגש</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={18} className="text-babun-primary shrink-0" />
                    <span>גישה ישירה ומענה לשאלות במערכת</span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => handleCourseSelect("phone")}
                  className={`w-full py-4 px-6 rounded-2xl text-lg font-black transition-all duration-300 flex items-center justify-center gap-2 shadow-lg group cursor-pointer ${
                    activeRegisterCourse === "phone"
                      ? "bg-babun-primary text-white hover:bg-babun-primary/95"
                      : "bg-babun-accent text-babun-primary hover:bg-babun-accent/90"
                  }`}
                >
                  <span>להרשמה למסלול</span>
                  <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>

            {/* Card 2: Digital Course */}
            <motion.div 
              whileHover={{ y: -6 }}
              className={`bg-white border rounded-[32px] p-8 md:p-10 shadow-[0_15px_30px_rgba(0,0,0,0.05)] flex flex-col justify-between transition-all duration-300 relative ${
                activeRegisterCourse === "digital" ? "ring-4 ring-babun-primary border-transparent" : "border-zinc-200/80"
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-babun-accent/15 rounded-2xl flex items-center justify-center text-babun-primary mb-4">
                    <Video size={28} className="text-babun-primary" />
                  </div>
                  <div className="text-left bg-babun-primary/5 px-4 py-2 rounded-2xl border border-babun-primary/5">
                    <span className="text-xs text-zinc-500 font-bold block">רישום מוקדם</span>
                    <span className="text-2xl font-black text-babun-primary font-display">1,700 ₪</span>
                  </div>
                </div>

                <h3 className="text-2xl md:text-3xl font-display font-black text-babun-primary mb-3">
                  קורס דיגיטלי
                </h3>
                <span className="inline-block px-3 py-1 bg-babun-accent text-babun-primary text-xs font-black rounded-full mb-6">
                  הטבה לרישום מוקדם
                </span>

                <p className="text-zinc-600 text-base leading-relaxed mb-6 font-light">
                  המסלול המושלם ללמידה עצמית דינמית בקצב שלכם ובמחשב שלכם. הרשמו עכשיו ללא כל התחייבות כספית כדי לשריין את הטבת הרישום המוקדם במועד ההשקה הקרוב.
                </p>

                <div className="space-y-3 pt-4 border-t border-zinc-100 mb-8 text-sm text-zinc-700">
                  <div className="flex items-center gap-2">
                    <Check size={18} className="text-babun-primary shrink-0" />
                    <span>6 מפגשים מצולמים באיכות HD מסודרים פרקטית</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={18} className="text-babun-primary shrink-0" />
                    <span>חומרי עזר מקצועיים ורשימות בדיקה להורדה</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={18} className="text-babun-primary shrink-0" />
                    <span>שריון הנחת רישום מוקדם ללא צורך באשראי</span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => handleCourseSelect("digital")}
                  className={`w-full py-4 px-6 rounded-2xl text-lg font-black transition-all duration-300 flex items-center justify-center gap-2 shadow-lg group cursor-pointer ${
                    activeRegisterCourse === "digital"
                      ? "bg-babun-primary text-white hover:bg-babun-primary/95"
                      : "bg-babun-accent text-babun-primary hover:bg-babun-accent/90"
                  }`}
                >
                  <span>להרשמה למסלול</span>
                  <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>

            {/* Card 3: Frontal Course */}
            <motion.div 
              whileHover={{ y: -6 }}
              className={`bg-white border rounded-[32px] p-8 md:p-10 shadow-[0_15px_30px_rgba(0,0,0,0.05)] flex flex-col justify-between transition-all duration-300 relative ${
                activeRegisterCourse === "frontal" ? "ring-4 ring-babun-primary border-transparent" : "border-zinc-200/80"
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-babun-accent/15 rounded-2xl flex items-center justify-center text-babun-primary mb-4">
                    <Users size={28} className="text-babun-primary" />
                  </div>
                  <div className="text-left bg-babun-primary/5 px-4 py-2 rounded-2xl border border-babun-primary/5">
                    <span className="text-xs text-zinc-500 font-bold block">מחזור קרוב</span>
                    <span className="text-2xl font-black text-babun-primary font-display font-black">2,500 ₪</span>
                  </div>
                </div>

                <h3 className="text-2xl md:text-3xl font-display font-black text-babun-primary mb-3">
                  קורס פרונטלי
                </h3>
                <span className="inline-block px-3 py-1 bg-babun-primary/10 text-babun-primary text-xs font-black rounded-full mb-6">
                  מפגשים אישיים וקבוצתיים
                </span>

                <p className="text-zinc-600 text-base leading-relaxed mb-6 font-light">
                  מפגשים קבוצתיים פרונטליים, דיוני עומק, למידת עמיתים ישירה ומענה פנים-אל-פנים לשאלות הלב שלכם. צרו קשר לקבלת עדכונים על קורס חדש שיפתח בקרוב.
                </p>

                <div className="space-y-3 pt-4 border-t border-zinc-100 mb-8 text-sm text-zinc-700">
                  <div className="flex items-center gap-2">
                    <Check size={18} className="text-babun-primary shrink-0" />
                    <span>קבוצה קטנה למפגש דינמי ומענה אישי מעמיק</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={18} className="text-babun-primary shrink-0" />
                    <span>סימולציות משא ומתן אינטראקטיביות בשטח</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={18} className="text-babun-primary shrink-0" />
                    <span>הרצאה פנים אל פנים הכוללת ניתוחי מקרים מעשיים</span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => handleCourseSelect("frontal")}
                  className={`w-full py-4 px-6 rounded-2xl text-lg font-black transition-all duration-300 flex items-center justify-center gap-2 shadow-lg group cursor-pointer ${
                    activeRegisterCourse === "frontal"
                      ? "bg-babun-primary text-white hover:bg-babun-primary/95"
                      : "bg-babun-accent text-babun-primary hover:bg-babun-accent/90"
                  }`}
                >
                  <span>להרשמה למסלול</span>
                  <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>

          </div>

          {/* DYNAMIC REGISTRATION DETAIL STRIP CONTAINER */}
          <AnimatePresence>
            {activeRegisterCourse && (
              <motion.div
                key="register-strip"
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: "auto", scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="mt-16 bg-babun-primary text-white rounded-[32px] p-8 md:p-12 shadow-[0_30px_60px_rgba(0,0,0,0.25)] border border-babun-primary/20 relative"
                ref={formStripRef}
              >
                
                {/* Visual badge and header info inside the strip */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/10 pb-8 mb-8 gap-4">
                  <div>
                    <span className="inline-block px-3 py-1 bg-babun-accent text-babun-primary text-xs font-black rounded-full mb-3 uppercase tracking-wider">
                      השארת פרטים מהירה
                    </span>
                    <h2 className="text-3xl font-display font-black">
                      הרשמה אל:{" "}
                      <span className="text-babun-accent">
                        {activeRegisterCourse === "phone" && "הקורס הטלפוני"}
                        {activeRegisterCourse === "digital" && "הקורס הדיגיטלי (רישום מוקדם)"}
                        {activeRegisterCourse === "frontal" && "הקורס הפרונטלי (קבלת עדכונים)"}
                      </span>
                    </h2>
                    <p className="text-zinc-300 mt-2 text-sm md:text-base font-light">
                      מלאו את הפרטים הבאים ונציג שירות יחזור אליכם עם כל המידע והפרטים הדרושים לתחילת הלמידה.
                    </p>
                  </div>
                  
                  {activeRegisterCourse === "phone" && (
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center text-center shrink-0">
                      <span className="text-xs text-zinc-400 font-bold">או חייגו ישירות:</span>
                      <a href="tel:0733454545" className="text-xl md:text-2xl font-black text-babun-accent hover:underline mt-1">
                        073-3454545
                      </a>
                      <span className="text-[10px] text-zinc-400 mt-0.5">שלוחה 6-2-2 במערכת אור עולם</span>
                    </div>
                  )}
                </div>

                {registrationStatus === "success" ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 bg-babun-accent/20 border border-babun-accent/30 rounded-2xl text-center text-lg font-bold"
                  >
                    <div className="w-16 h-16 bg-babun-accent text-babun-primary rounded-full flex items-center justify-center mx-auto mb-4 font-black text-2xl shadow-lg">✓</div>
                    <h3 className="text-2xl text-babun-accent font-display font-black mb-2">הרשמתך נקלטה במערכת בהצלחה!</h3>
                    <p className="text-zinc-200 text-base font-light max-w-lg mx-auto">
                      תודה רבה שהקדשתם לנו זמן לרכוש כלים לגלות את הרווח. נציג אישי ייצור עמכם קשר טלפוני בהקדם האפשרי.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleRegisterSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-zinc-300">שם מלא</label>
                      <input 
                        required
                        type="text"
                        placeholder="שלמה כהן"
                        className="w-full text-base p-4 rounded-xl border border-white/10 bg-white/5 text-white focus:border-babun-accent focus:bg-white/10 focus:outline-none transition-all text-right placeholder-zinc-500 font-sans"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    
                    <div className="flex flex-col gap-2 font-sans">
                      <label className="text-sm font-bold text-zinc-300">מספר טלפון לרישום</label>
                      <input 
                        required
                        type="tel"
                        placeholder="050-0000000"
                        className="w-full text-base p-4 rounded-xl border border-white/10 bg-white/5 text-white focus:border-babun-accent focus:bg-white/10 focus:outline-none transition-all text-right placeholder-zinc-500 font-sans"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>

                    <div className="flex flex-col gap-2 font-sans">
                      <label className="text-sm font-bold text-zinc-300">כתובת מייל לעדכונים (רשות)</label>
                      <input 
                        type="email"
                        placeholder="yourname@gmail.com"
                        className="w-full text-base p-4 rounded-xl border border-white/10 bg-white/5 text-white focus:border-babun-accent focus:bg-white/10 focus:outline-none transition-all text-right placeholder-zinc-500 font-sans"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>

                    <div className="md:col-span-3 flex justify-end mt-4">
                      <button 
                        type="submit"
                        disabled={registrationStatus === "loading"}
                        className="w-full md:w-auto bg-babun-accent text-babun-primary font-black py-4 px-12 rounded-xl text-lg hover:bg-babun-accent/90 transition-all duration-300 active:scale-95 shadow-xl shadow-babun-accent/20 cursor-pointer flex items-center justify-center gap-2 text-right"
                      >
                        <span>{registrationStatus === "loading" ? "מעבד הרשמה..." : "אישור ושמירת פרטים ←"}</span>
                      </button>
                    </div>

                  </form>
                )}

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

    </div>
  );
}
