import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "motion/react";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { syncLeadToBackend } from "../lib/leadSync";
import { 
  Users, 
  Clock, 
  MapPin, 
  Globe, 
  Calendar, 
  CheckCircle2, 
  ChevronDown, 
  HelpCircle, 
  User, 
  Phone, 
  Mail, 
  MessageSquare, 
  ArrowLeft,
  DollarSign,
  Sparkles,
  BookOpen,
  Send,
  Star,
  ExternalLink,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  X
} from "lucide-react";

function AnimatedNumber({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    const controls = animate(count, value, { duration: 2, ease: "easeOut" });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

export default function Consulting() {
  // Booking Form & Workflow State
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showFilloutModal, setShowFilloutModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // URLs for payment & scheduling
  const filloutFormId = "ekmXie9Vt9us";
  const filloutUrl = `https://forms.fillout.com/t/${filloutFormId}`;
  const plandoPaymentUrl = "https://plando.co.il/self_services/embed_store/25442?ak=597df96284d52e5dd3be33b6ff7afc68";

  // Re-initialize Fillout embed script when needed
  useEffect(() => {
    if (typeof (window as any).Fillout !== "undefined") {
      try {
        (window as any).Fillout?.init?.();
      } catch (e) {}
    }
  }, [isSubmitted, showFilloutModal]);

  const openFilloutPopup = () => {
    // Attempt triggering native Fillout script button if rendered
    const filloutBtn = document.querySelector(`[data-fillout-id="${filloutFormId}"] button, [data-fillout-id="${filloutFormId}"]`) as HTMLElement;
    if (filloutBtn && typeof (window as any).Fillout !== "undefined") {
      try {
        filloutBtn.click();
        return;
      } catch (e) {}
    }
    // Fallback to responsive full-experience modal
    setShowFilloutModal(true);
  };

  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.email) {
      setErrorMsg("אנא מלא שם מלא, מספר טלפון וכתובת מייל.");
      return;
    }
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      // 1. Save to local Firestore database
      try {
        await addDoc(collection(db, "consulting_leads"), {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          message: formData.message,
          createdAt: serverTimestamp(),
        });
      } catch (dbErr) {
        console.warn("Firestore lead save fallback:", dbErr);
      }

      // 2. Sync lead to backend (Plando CRM & Email Alerts)
      await syncLeadToBackend({
        name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        message: formData.message || "תיאום פגישת ייעוץ",
        source: "פגישת ייעוץ אישית",
        tag: "תיאום פגישת ייעוץ"
      });

      // 3. Direct Redirect to Plando Payment Store (eliminates all iframe blocking/locking issues)
      window.location.href = plandoPaymentUrl;
    } catch (err: any) {
      console.error("Error saving lead, redirecting to payment anyway:", err);
      window.location.href = plandoPaymentUrl;
    }
  };

  // Scroll smoothly to appointment form
  const scrollToBooking = () => {
    const bookingSection = document.getElementById("booking-section");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const trustItems = [
    { label: "18 שנים", sub: "נסיון בשוק הנדל\"ן" },
    { label: "ייעוץ אישי", sub: "תכלס. ממוקד ומניע לפעולה" },
    { label: "בלי אינטרסים", sub: "לא מחוייב לשום איש מקצוע" },
    { label: "פיזי / זום", sub: "ירושלים / בני ברק" }
  ];

  const whatWeDoList = [
    {
      title: "מיפוי המצב שלך",
      desc: "נבדוק יחד איפה אתה עומד: מה יש לך, מה אתה שוקל, ומה עדיין לא ברור לך. בלי שיפוטים. בלי מכירה."
    },
    {
      title: "ניתוח העסקה / הנכס",
      desc: "אם יש נכס ספציפי על הפרק - נפרק אותו. מחיר, מיקום, פוטנציאל, סיכונים. מה שאנשים מדלגים עליו - זה מה שנסתכל עליו."
    },
    {
      title: "תוכנית לצעד הבא",
      desc: "יוצאים מהפגישה עם תמונה ברורה: מה לעשות, מה לבדוק, ועל מה לא להתפשר. לא עוד מידע - כיוון."
    }
  ];

  const matchingProfiles = [
    {
      title: "זוגות ואברכים לפני רכישת דירה ראשונה",
      desc: "שמעתם מכל כיוון. לא ברור מאיפה להתחיל. פגישה אחת שמה סדר - בלי שפת מתווכים, בלי בלבול."
    },
    {
      title: "משקיעים שבוחנים עסקה ספציפית",
      desc: "יש לך הזדמנות על השולחן. אתה לא בטוח. בואו נסתכל עליה ביחד - לפני שאתה חותם."
    },
    {
      title: "מי שכבר עשה טעות - ורוצה להבין מה קרה",
      desc: "לא כדי לשפוט. כדי לא לחזור על זה. ולדעת אם יש מה לתקן עכשיו."
    },
    {
      title: "מתווכים ואנשי מקצוע",
      desc: "רוצים להבין את הצד השני של השולחן. פגישה שחודדת את השיחה שלך עם הלקוח."
    }
  ];

  const faqData = [
    {
      q: "האם אפשר לשלוח חומר לפני הפגישה?",
      a: "כן - ומומלץ. ככל שתשלח יותר מידע מראש, כך הפגישה תהיה ממוקדת יותר."
    },
    {
      q: "האם פגישה אחת מספיקה?",
      a: "לרוב הלקוחות - כן. לפעמים יש צורך בהמשך. נדבר על זה בסוף הפגישה."
    },
    {
      q: "האם אתה מייצג קבלנים או יזמים?",
      a: "לא. בכלל. אני עובד בשביל מי ששילם לי - זה אתה."
    },
    {
      q: "האם הפגישה סודית?",
      a: "כמובן. כל מה שנאמר - נשאר בינינו."
    },
    {
      q: "האם אפשר בזום?",
      a: "כן. הפגישה עובדת באותה איכות - פנים מול מסך."
    }
  ];

  return (
    <div className="bg-babun-light min-h-screen text-right font-sans" dir="rtl">
      
      {/* 1. HERO SECTION */}
      <section className="bg-babun-primary text-white pt-52 pb-28 md:pt-64 relative overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0 opacity-80 select-none pointer-events-none">
          <iframe 
            className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto aspect-video -translate-x-1/2 -translate-y-1/2 pointer-events-none object-cover scale-150"
            src="https://player.vimeo.com/video/1218634309?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1&playsinline=1&dnt=1"
            allow="autoplay; fullscreen; picture-in-picture"
            frameBorder="0"
          />
          {/* Transparent click/tap block layer */}
          <div className="absolute inset-0 bg-transparent z-[10] pointer-events-auto" />
          {/* Dark Gradient Overlay & Black Semi-Transparent Layer */}
          <div className="absolute inset-0 bg-black/60 z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-t from-babun-primary/90 via-black/40 to-babun-primary/60 z-[2]" />
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-8 relative z-10 text-right">

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-display font-black leading-tight text-white mb-6 max-w-4xl tracking-tight"
            id="hero-main-title"
          >
            שאלה אחת יכולה לחסוך לך <br />
            <span className="text-babun-accent drop-shadow-sm font-black">עשרות אלפי שקלים.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white/85 max-w-2xl mb-10 leading-relaxed font-light"
          >
            פגישת ייעוץ אישית עם יעקב רייניץ. שעה אחת. תשובות ישירות. בלי אינטרסים נסתרים.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-start gap-3"
          >
            <button 
              onClick={scrollToBooking}
              className="bg-babun-accent hover:bg-white text-babun-primary hover:text-babun-primary px-10 py-5 rounded-[100px] font-bold text-lg md:text-xl shadow-xl hover:shadow-babun-accent/25 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-3 z-10 cursor-pointer"
              id="hero-cta-btn"
            >
              <ArrowLeft size={20} className="stroke-[2.5px] animate-pulse" />
              <span>קבע פגישה עכשיו</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. TRUST BAR */}
      <section style={{ backgroundColor: '#000102' }} className="py-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {trustItems.map((item, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center justify-center text-center"
              >
                <div className="text-babun-accent text-xl md:text-2xl font-black font-display mb-1">
                  {item.label}
                </div>
                <div className="text-white/80 text-sm font-bold">
                  {item.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. TRUTH / PROBLEM SECTION */}
      <section className="py-24 bg-white relative">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-right max-w-3xl">
            <div className="space-y-6 text-lg text-babun-primary/80 leading-relaxed font-light">
              <p className="text-xl md:text-2xl text-babun-primary mb-6 font-normal">
                רוב האנשים שמגיעים אלי - מגיעים אחרי שחתמו. אחרי שגילו שהנכס שרכשו שווה פחות ממה שחשבו. אחרי שלקחו משכנתא שלא הבינו לגמרי. אחרי שהמתווך "עזר" - לצד השני.
              </p>
              <p className="font-display font-black text-[32px] md:text-[49px] leading-tight text-babun-primary mt-8 mb-8" id="highlight-quote">
                <span style={{ color: '#fee104' }}>לפני החתימה</span>, שאלה אחת
                <br />
                יכולה לשנות את כל העסקה.
                <br />
                שאלה אחת <span style={{ color: '#fee104' }}>אחרי</span> - עולה הרבה יותר.
              </p>
              
              <div className="pt-4">
                <button 
                  onClick={scrollToBooking}
                  className="bg-babun-accent hover:bg-babun-primary hover:text-white text-babun-primary px-10 py-5 rounded-[100px] font-bold text-lg md:text-xl shadow-xl hover:shadow-babun-accent/25 transition-all duration-300 transform hover:-translate-y-0.5 inline-flex items-center gap-3 z-10 cursor-pointer"
                  id="truth-cta-btn"
                >
                  <ArrowLeft size={20} className="stroke-[2.5px] animate-pulse" />
                  <span>קבע פגישה עכשיו</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHAT WE DO IN THE MEETING */}
      <section className="py-24 bg-gray-100 border-y border-babun-primary/5">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-right mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-black text-babun-primary mt-2" id="what-we-do-title">
              מה נעשה בפגישה?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whatWeDoList.map((item, index) => (
              <div 
                key={index}
                className="bg-white p-8 md:p-10 rounded-babun-lg border border-babun-primary/5 hover:border-babun-accent transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 bg-babun-primary text-babun-accent rounded-full flex items-center justify-center font-black text-lg mb-6">
                    {`0${index + 1}`}
                  </div>
                  <h3 className="text-xl font-display font-bold text-babun-primary mb-4">
                    {item.title}
                  </h3>
                  <p className="text-babun-primary/70 text-base leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. WHO IS THIS FOR */}
      <section className="py-24 bg-babun-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 mesh-grid opacity-10 z-0" />
        <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-right mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-black text-white" id="for-whom-title">
              למי הפגישה מתאימה?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {matchingProfiles.map((profile, i) => (
              <div 
                key={i}
                className="bg-white/5 border border-white/10 hover:border-babun-accent/30 p-8 md:p-10 rounded-babun-lg transition-all duration-300 group flex items-start gap-4 text-right"
              >
                <div className="w-10 h-10 bg-babun-accent/10 group-hover:bg-babun-accent/20 rounded-full flex items-center justify-center text-babun-accent shrink-0 mt-1">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-babun-accent mb-3">
                    {profile.title}
                  </h3>
                  <p className="text-white/80 text-base leading-relaxed font-light">
                    {profile.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <button 
              onClick={scrollToBooking}
              className="bg-babun-accent hover:bg-white text-babun-primary hover:text-babun-primary px-10 py-5 rounded-[100px] font-bold text-lg md:text-xl shadow-xl hover:shadow-babun-accent/25 transition-all duration-300 transform hover:-translate-y-0.5 inline-flex items-center gap-3 z-10 cursor-pointer"
            >
              <ArrowLeft size={20} className="stroke-[2.5px] animate-pulse" />
              <span>קבע פגישה עכשיו</span>
            </button>
          </div>
        </div>
      </section>

      {/* 7. ABOUT JACOB REINITZ */}
      <section className="py-24 bg-white relative">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Image Side (Left) - Reinitz visual from Home page */}
            <div className="lg:col-span-5 relative flex justify-center max-lg:order-2 z-10 py-10 md:py-0">
              <div className="relative w-full max-w-sm aspect-square">
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
                     className="absolute top-1/4 -right-12 z-20 bg-white p-5 rounded-babun-lg shadow-2xl text-black text-center min-w-[140px]"
                  >
                     <div className="text-3xl font-display font-black text-babun-primary">
                       <AnimatedNumber value={4981} />
                     </div>
                     <div className="text-xs font-bold opacity-80 mt-1">פגישות ייעוץ</div>
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
                     className="absolute bottom-10 -left-12 z-20 bg-white p-5 rounded-babun-lg shadow-2xl text-black text-center min-w-[140px]"
                  >
                     <div className="text-[11px] font-bold leading-tight mb-2">עצמאות מלאה</div>
                     <div className="flex justify-center gap-1 text-babun-accent">
                         {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                     </div>
                  </motion.div>
              </div>
            </div>

            {/* Main Content Column */}
            <div className="lg:col-span-7 text-right max-lg:order-1 space-y-6">
              <h2 className="text-3xl md:text-5xl font-display font-black text-babun-primary" id="about-jacob-title">
                על יעקב רייניץ
              </h2>
              <h3 className="text-xl md:text-2xl font-bold text-babun-primary/80">
                עיתונאי כלכלי שהפך למומחה נדל"ן. מומחה שהפך לשליחות.
              </h3>
              
              <div className="space-y-4 text-base md:text-lg font-light text-babun-primary/80 leading-relaxed">
                <p>
                  התחלתי כעיתונאי כלכלי - כיסיתי את שוק הנדל"ן העשיר והמורכב מבחוץ. הייתה לי גישה בלעדית לנתונים ומהלכים שרוב רובו של הציבור בארץ לא ראה או הבין לעומק. ראיתי יותר מדי פעמים מה קורה כשאנשים חותמים על חוזים דרקוניים ללא כל ידע קודם.
                </p>
                <p>
                  כשעברתי באופן רשמי לתחום הייעוץ האישי, הבנתי אמת פשוטה: הבעיה העיקרית היא איננה קיומם של אנשים רעים ומניפולטיביים בשוק. הבעיה המרכזית היא כוח משמעותי של ידע מקצועי פשוט שלא מגיע לאנשים הנכונים ברגע הנכון.
                </p>
                <p className="font-medium text-babun-primary bg-babun-light p-4 rounded-babun-md border-r-4 border-babun-accent">
                  הטור השבועי שלי ב"המודיע", הספר שכתבתי "שליש בקרקע" והקורסים שאני מעביר כיום - כולם קיימים עם מטרה אחת ברורה ובלעדית: שגם אתה תוכל לרכוש נדל״ן מתוך הבנת הנתונים וראש שקט ובטוח.
                </p>
                <p>
                  אני לא מחויב לאף קבלן, לאף יזם או לאף גורם פיננסי או מסחרי בשוק. מה שתשמע ממני במהלך הלימודים עובר דרך מסננת אחת בלבד: <strong className="font-bold text-babun-primary">האם זה נכון ומדויק עבורך.</strong>
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. FAQs SECTION */}
      <section className="py-24 bg-gray-100 border-y border-babun-primary/5">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-right mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-black text-babun-primary" id="faq-title">
              שאלות נפוצות:
            </h2>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="bg-white border border-babun-primary/5 rounded-babun-md overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full py-5 px-6 md:px-8 text-right font-display font-bold text-lg text-babun-primary hover:text-babun-accent transition-colors flex items-center justify-between gap-4"
                  >
                    <span className="leading-tight">{faq.q}</span>
                    <ChevronDown 
                      size={20} 
                      className={`text-babun-primary/30 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-babun-accent' : ''}`} 
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-6 md:px-8 pb-6 border-t border-babun-primary/5 text-base text-babun-primary/75 font-light leading-relaxed">
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

      {/* 9. BOOKING FORM SECTION WITH PLANDO & FILLOUT */}
      <section id="booking-section" className="py-24 bg-babun-accent relative scroll-mt-28 w-full overflow-hidden">
        <div className="absolute inset-0 mesh-grid opacity-10 z-0 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Right Side: Message & Info */}
            <div className="lg:col-span-5 text-right flex flex-col justify-start space-y-6 pt-0">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-babun-primary leading-tight">
                קביעת פגישת ייעוץ <br />
                אישית וממוקדת
              </h2>
              
              <p className="text-babun-primary/80 font-medium text-base leading-relaxed">
                מלאו את פרטיכם ותעברו לדף תשלום, מיד אחרי אישור התשלום תוכלו לקבוע פגישה בזמן שנוח לכם.
              </p>
            </div>

            {/* Left Side: Form or Post-Payment Status */}
            <div className="lg:col-span-7">
              <div className={`bg-white text-babun-primary rounded-babun-xl shadow-2xl border border-babun-primary/10 transition-all ${
                isSubmitted ? "p-3 sm:p-4 md:p-6" : "p-6 md:p-10"
              }`}>
                
                <AnimatePresence mode="wait">
                  {isSubmitted ? (
                    <motion.div
                      key="submitted-state"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-3 text-right"
                    >
                      {/* Clean Top Navigation Bar */}
                      <div className="flex items-center justify-between px-2 py-1">
                        <button 
                          type="button"
                          onClick={() => setIsSubmitted(false)}
                          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-babun-primary font-bold transition-colors cursor-pointer"
                        >
                          <ChevronRight size={14} />
                          <span>חזרה לעריכת פרטים</span>
                        </button>

                        <a 
                          href={plandoPaymentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-babun-primary bg-babun-accent/20 hover:bg-babun-accent/30 px-3 py-1.5 rounded-full transition-colors"
                        >
                          <span>פתיחת דף תשלום מאובטח בלשונית נפרדת</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>

                      {/* Clean Full Plando Payment Iframe */}
                      <div className="w-full rounded-lg overflow-hidden bg-white min-h-[640px] border border-zinc-100 relative">
                        <iframe 
                          src={plandoPaymentUrl} 
                          title="טופס תשלום מאובטח פלאנדו"
                          className="w-full h-[650px] md:h-[720px] border-0"
                          allow="payment *; payment; fullscreen; clipboard-write; forms; scripts; cross-origin-isolated"
                        />
                      </div>

                      {/* Official Fillout Popup Embed Trigger Element */}
                      <div className="hidden">
                        <div 
                          data-fillout-id={filloutFormId} 
                          data-fillout-embed-type="popup" 
                          data-fillout-dynamic-resize 
                          data-fillout-inherit-parameters 
                          data-fillout-popup-size="medium"
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="form-state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <form onSubmit={handleSubmit} className="space-y-6">
                        {errorMsg && (
                          <div className="bg-red-500/15 border border-red-500/30 text-red-900 p-4 rounded-babun-md text-sm text-right font-medium">
                            {errorMsg}
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Full Name */}
                          <div className="space-y-2">
                            <label className="block text-sm font-bold text-babun-primary text-right">
                              שם מלא <span className="text-red-600">*</span>
                            </label>
                            <div className="relative">
                              <input 
                                type="text"
                                name="fullName"
                                required
                                value={formData.fullName}
                                onChange={handleInputChange}
                                placeholder="ישראל ישראלי"
                                className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white text-babun-primary border border-babun-primary/15 focus:border-babun-primary rounded-babun-md px-12 py-4 text-right outline-none transition-all duration-300 font-medium placeholder-babun-primary/40"
                              />
                              <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-babun-primary/50 pointer-events-none" />
                            </div>
                          </div>

                          {/* Phone */}
                          <div className="space-y-2">
                            <label className="block text-sm font-bold text-babun-primary text-right">
                              מספר טלפון <span className="text-red-600">*</span>
                            </label>
                            <div className="relative">
                              <input 
                                type="tel"
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="050-0000000"
                                className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white text-babun-primary border border-babun-primary/15 focus:border-babun-primary rounded-babun-md px-12 py-4 text-right outline-none transition-all duration-300 font-medium placeholder-babun-primary/40"
                              />
                              <Phone size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-babun-primary/50 pointer-events-none" />
                            </div>
                          </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-babun-primary text-right">
                            כתובת מייל <span className="text-red-600">*</span>
                          </label>
                          <div className="relative">
                            <input 
                              type="email"
                              name="email"
                              required
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="yourname@gmail.com"
                              className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white text-babun-primary border border-babun-primary/15 focus:border-babun-primary rounded-babun-md px-12 py-4 text-left outline-none transition-all duration-300 font-medium placeholder-babun-primary/40"
                            />
                            <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-babun-primary/50 pointer-events-none" />
                          </div>
                        </div>

                        {/* Topic / Message */}
                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-babun-primary text-right">
                            על מה תרצה לדבר? <span className="text-babun-primary/70 font-light">(בקצרה)</span>
                          </label>
                          <div className="relative">
                            <textarea 
                              name="message"
                              rows={3}
                              value={formData.message}
                              onChange={handleInputChange}
                              placeholder="למשל: בוחנים רכישת דירת 4 חדרים בשכונה..."
                              className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white text-babun-primary border border-babun-primary/15 focus:border-babun-primary rounded-babun-md px-12 py-4 text-right outline-none transition-all duration-300 resize-none font-medium placeholder-babun-primary/40"
                            />
                            <MessageSquare size={18} className="absolute right-4 top-4 text-babun-primary/50 pointer-events-none" />
                          </div>
                        </div>

                        {/* Submit button */}
                        <div className="pt-2">
                          <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-babun-primary hover:bg-babun-primary/95 text-white font-bold py-5 px-8 rounded-[100px] transition-all duration-300 flex items-center justify-center gap-3 shadow-lg cursor-pointer text-lg"
                          >
                            {isSubmitting ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                <span>מעביר לתשלום...</span>
                              </>
                            ) : (
                              <>
                                <span>המשך לתשלום</span>
                                <ArrowLeft size={20} />
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FILLOUT POPUP MODAL */}
      <AnimatePresence>
        {showFilloutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-4xl h-[85vh] max-h-[750px] rounded-babun-xl shadow-2xl overflow-hidden flex flex-col border border-babun-primary/20 relative"
            >
              {/* Modal Header */}
              <div className="p-4 px-6 bg-neutral-900 text-white flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Calendar size={20} className="text-babun-accent" />
                  <h3 className="font-display font-bold text-base md:text-lg">
                    קביעת מועד לפגישת ייעוץ (Fillout)
                  </h3>
                </div>
                
                <div className="flex items-center gap-3">
                  <a
                    href={filloutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-neutral-300 hover:text-white flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full transition-all"
                  >
                    <span>חלון חדש</span>
                    <ExternalLink size={12} />
                  </a>
                  <button
                    type="button"
                    onClick={() => setShowFilloutModal(false)}
                    className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Iframe Content */}
              <div className="flex-1 w-full h-full bg-white relative">
                <iframe
                  src={filloutUrl}
                  className="w-full h-full border-0"
                  title="קביעת מועד לפגישת ייעוץ - Fillout"
                  allow="camera; microphone; autoplay; encrypted-media; fullscreen"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
