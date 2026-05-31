import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { 
  BookOpen, 
  CheckCircle2, 
  HelpCircle, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  ChevronDown, 
  ShoppingBag, 
  ArrowLeft, 
  Sparkles, 
  Bookmark, 
  AlertTriangle, 
  DollarSign, 
  MessageSquare,
  ClipboardList,
  Flame,
  CornerDownLeft,
  X,
  Share2
} from "lucide-react";

export default function Book() {
  // Checkout Form State
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: ""
  });
  const [checkoutStatus, setCheckoutStatus] = useState<null | "loading" | "success" | "error">(null);
  const [errorMsg, setErrorMsg] = useState("");

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  // Editorial Notes State (Visible to help review the publishing metrics)
  const [showNotes, setShowNotes] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      setErrorMsg("אנא מלא את כל שדות החובה: שם מלא, מספר טלפון וכתובת למשלוח.");
      return;
    }
    setErrorMsg("");
    setCheckoutStatus("loading");

    try {
      await addDoc(collection(db, "book_orders"), {
        ...formData,
        bookTitle: "שליש בקרקע",
        price: 149,
        createdAt: serverTimestamp()
      });
      setCheckoutStatus("success");
      setFormData({ name: "", address: "", phone: "", email: "" });
    } catch (err: any) {
      console.error("Firestore error: ", err);
      setErrorMsg("אירעה שגיאה בחיבור לשרת. נא לנסות שנית.");
      setCheckoutStatus("error");
    }
  };

  // Scroll smooth to specified element ID
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-babun-light min-h-screen text-right font-sans" dir="rtl">
      
      {/* 1. HERO SECTION */}
      <section className="bg-babun-primary text-white pt-32 pb-24 relative overflow-visible z-10">
        {/* Video Background */}
        <div className="absolute inset-0 z-0 opacity-40 select-none overflow-hidden pointer-events-none">
          <iframe 
            className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto aspect-video -translate-x-1/2 -translate-y-1/2 pointer-events-none object-cover scale-150"
            src="https://www.youtube.com/embed/ZtiNxcUOgeI?autoplay=1&mute=1&loop=1&playlist=ZtiNxcUOgeI&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&disablekb=1&fs=0&autohide=1"
            allow="autoplay; encrypted-media"
            frameBorder="0"
          />
          {/* Transparent click/tap block layer */}
          <div className="absolute inset-0 bg-transparent z-[10] pointer-events-auto" />
          {/* Dark Gradient Overlay & Black Semi-Transparent Layer */}
          <div className="absolute inset-0 bg-black/60 z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-t from-babun-primary via-transparent to-babun-primary/80 z-[2]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 mt-[100px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* HERO RIGHT: COPY & MAIN CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-right">
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-babun-accent/30 bg-babun-accent/10 text-babun-accent font-medium text-xs justify-center"
              >
                <Sparkles size={12} className="shrink-0" />
                <span>הספר שמשנה את כללי המשחק</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-display font-black leading-tight text-white mb-4 tracking-tight"
                id="book-main-title"
              >
                הספר שמסביר לך את מה <br className="hidden md:inline" />
                <span className="text-babun-accent font-black">שאיש לא הסביר לפני שחתמת.</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg md:text-xl text-white/85 max-w-2xl lg:max-w-none mx-auto leading-relaxed font-light"
              >
                <strong className="font-semibold text-white">"שליש בקרקע"</strong> - המדריך המעשי לרוכשי ומשקיעי נדל"ן בישראל.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="pt-6 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
              >
                <button 
                  onClick={() => scrollToId("checkout-form-section")}
                  className="w-full sm:w-auto bg-babun-accent hover:bg-white text-babun-primary font-bold px-8 py-4.5 rounded-babun-md text-base shadow-xl hover:shadow-babun-accent/15 transition-all duration-350 cursor-pointer flex items-center justify-center gap-2.5 transform hover:-translate-y-0.5"
                >
                  <ArrowLeft size={18} className="stroke-[2.5]" />
                  <span>רכוש את הספר</span>
                </button>
              </motion.div>
            </div>

            {/* HERO LEFT: ACTUAL BOOK COVER IMAGE */}
            <div className="lg:col-span-5 flex justify-center pt-12 lg:pt-0 relative z-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1.3, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative cursor-pointer lg:mt-[-50px] md:mb-[-220px] lg:mb-[-260px] mb-[-140px]"
                onClick={() => scrollToId("checkout-form-section")}
              >
                <img 
                  src="https://lh3.googleusercontent.com/d/1YATeihtnryr9oCFr2-byVjsEYCnxVtIl" 
                  alt="הספר שליש בקרקע" 
                  className="w-full max-w-[380px] md:max-w-[480px] lg:max-w-[540px] drop-shadow-[40px_60px_100px_rgba(0,0,0,0.75)] hover:scale-[1.05] transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. OPTIONS CARDS SECTION */}
      <section id="options-section" className="py-24 bg-white relative scroll-mt-20">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          
          <div className="text-center mb-16">
            <span className="text-babun-primary/40 text-xs font-bold uppercase tracking-widest block mb-2">
              ספר פיזי עד הבית
            </span>
            <h2 className="text-2xl md:text-4xl font-display font-black text-babun-primary" id="purchase-options-title">
              רכישת המהדורה המודפסת
            </h2>
            <div className="w-16 h-1 bg-babun-accent mx-auto mt-4 rounded-full" />
          </div>

          <div className="max-w-2xl mx-auto">
            
            {/* BOOK PURCHASE OPTION A: PRINTED */}
            <div className="bg-babun-light rounded-babun-lg p-8 md:p-10 border-2 border-babun-primary flex flex-col justify-between shadow-md relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 left-0 bg-babun-primary text-babun-accent font-bold px-4 py-1.5 rounded-bl-babun-md text-xs font-display">
                המהדורה הרשמית
              </div>
              
              <div>
                <div className="w-14 h-14 bg-babun-primary text-babun-accent rounded-babun-md mb-6 flex items-center justify-center">
                  <ShoppingBag size={24} />
                </div>
                <h3 className="text-2xl font-display font-black text-babun-primary mb-2">
                  ספר מודפס - מהדורה פיזית
                </h3>
                <p className="text-babun-primary/60 text-base font-light mb-6">
                  העותק המלא בכריכה רכה. מושלם לקריאה ממוקדת של ערב אחד, הדגשת שורות מפתח ועבודה בשטח עם רשימות הבדיקה.
                </p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 justify-start flex-row">
                    <CheckCircle2 size={16} className="text-babun-primary shrink-0" />
                    <span className="text-sm font-medium text-babun-primary/95">משלוח עד הבית - עד 5 ימי עסקים</span>
                  </div>
                  <div className="flex items-center gap-3 justify-start flex-row">
                    <CheckCircle2 size={16} className="text-babun-primary shrink-0" />
                    <span className="text-sm font-medium text-babun-primary/95">כולל את כל 148 העמודים ושישה חלקים מקיפים</span>
                  </div>
                  <div className="flex items-center gap-3 justify-start flex-row">
                    <CheckCircle2 size={16} className="text-babun-primary shrink-0" />
                    <span className="text-sm font-medium text-babun-primary/95">כולל רשימת בדיקה (Checklists) להדפסה ושימוש בשטח</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-2xl font-display font-bold text-babun-primary mb-6">
                  מהדורת כריכה רכה <span className="text-sm font-light text-babun-primary/50">| חלוקת משלוח בקופה</span>
                </div>
                <button 
                  onClick={() => scrollToId("checkout-form-section")}
                  className="w-full bg-babun-accent hover:bg-babun-primary text-babun-primary hover:text-white font-bold py-4.5 rounded-babun-md transition-all duration-300 text-center cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>להזמנה עכשיו</span>
                  <ArrowLeft size={16} className="stroke-[2.5]" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. METRIC BLOCK SECTION */}
      <section className="py-24 bg-babun-primary text-white border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 mesh-grid opacity-10 z-0" />
        <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10 text-center">
          
          <div className="space-y-4 mb-4">
            <div className="inline-flex items-center justify-center gap-2 text-babun-accent bg-babun-accent/10 border border-babun-accent/25 px-4.5 py-1.5 rounded-full text-sm font-bold font-display uppercase tracking-widest">
              <span>תוצאות מדידות בשטח</span>
            </div>
            
            {/* BIG METRICS BOLD TYPOGRAPHY */}
            <h2 className="text-4xl md:text-6xl font-display font-black tracking-tight leading-tight text-white pt-4">
              ספר אחד. 148 עמודים. <br className="sm:hidden" />
              <span className="text-babun-accent font-black">תשובה לשאלה שכולם שואלים.</span>
            </h2>
          </div>

          <div className="max-w-2xl mx-auto mt-12 bg-white/5 rounded-babun-lg p-10 border border-white/10 shadow-2xl relative">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-5xl bg-babun-primary px-4 font-serif text-babun-accent font-bold">
              "
            </div>
            
            <h3 className="text-2xl md:text-3xl font-display font-black text-babun-accent mb-6">
              מאיפה מתחילים?
            </h3>
            
            <p className="text-lg text-white/90 leading-relaxed font-light mb-8">
              זו השאלה שאני שומע הכי הרבה. מאנשים שרוצים לקנות דירה ראשונה. מאנשים שרוצים להשקיע ולא יודעים בדיוק איך. מאנשים שכבר קנו - ואחר כך הבינו שהיו שאלות שלא שאלו.
            </p>

            <p className="text-xl md:text-2xl font-bold text-white border-t border-white/10 pt-8">
              כתבתי את הספר הזה בשבילם. <br className="md:hidden" />
              <span className="text-babun-accent">148 עמודים של מה שאני אומר בפגישות ייעוץ.</span>
            </p>
          </div>
        </div>
      </section>

      {/* 4. REAL NUMERICAL ESTIMATE / EXAMPLE */}
      <section className="py-24 bg-white relative">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          
          <div className="text-center md:text-right max-w-3xl mb-16">
            <span className="text-babun-primary/40 text-xs font-bold uppercase tracking-widest block mb-2">
              ניתוח כדאיות מספרי
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-black text-babun-primary" id="example-financial-title">
              כמה שווה לדעת לפני שחותמים?
            </h2>
            <p className="text-lg text-babun-primary/60 mt-3 font-light">
              נניח שאתה לקראת רכישת נכס באחד האזורים המבוקשים: <strong className="font-semibold text-babun-primary">דירה בעלות של ₪1,500,000.</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* WITHOUT THE KNOWLEDGE (RED/GRAY BORDER) */}
            <div className="bg-babun-light/50 border border-red-500/10 rounded-babun-lg p-8 md:p-10 flex flex-col justify-between">
              <div>
                <span className="text-red-500 bg-red-500/10 font-bold px-3 py-1 rounded-full text-xs uppercase block w-max mb-10">
                  בלי ידע • התנאים הרגילים
                </span>
                
                <h3 className="text-2xl font-display font-bold text-babun-primary mb-4">
                  מחיר שוק = מחיר שאתה משלם.
                </h3>
                <p className="text-babun-primary/70 text-base leading-relaxed font-light space-y-4">
                  אתה רואה דירה שמוצאת חן בעיניך, המתווך אומר לך שזה מחיר מציאה ושוק הנדל"ן רותח, ויש עוד שלושה קונים פוטנציאליים שמחכים בתור.
                </p>
                <p className="text-babun-primary/75 mt-4 leading-relaxed font-light">
                  אתה חותם על חוזה רכישה בעיניים עצומות. אתה מרוצה מהנכס, אבל לא מבין שהעסקה נסגרה בתנאים הטובים ביותר - אבל למתווך ולקבלן, לא לך.
                </p>
              </div>

              <div className="border-t border-babun-primary/15 pt-8 mt-10">
                <span className="text-xs text-babun-primary/40 uppercase block mb-1">סה"כ הוצאה בפועל:</span>
                <span className="text-2xl font-display font-bold text-babun-primary">₪1,500,000</span>
              </div>
            </div>

            {/* WITH THE BOOK'S TOOLS (GOLD BORDER WITH GRADIENT) */}
            <div className="bg-babun-accent/5 border-2 border-babun-accent rounded-babun-lg p-8 md:p-10 flex flex-col justify-between relative shadow-lg">
              <div className="absolute top-4 left-4 text-babun-accent flex items-center gap-1 bg-babun-primary px-3 py-1 rounded text-[11px] font-bold">
                <Flame size={12} className="animate-bounce" />
                <span>היתרון הבלעדי שלך</span>
              </div>

              <div>
                <span className="text-babun-primary bg-babun-accent font-bold px-3 py-1 rounded-full text-xs uppercase block w-max mb-10">
                  עם הכלים מהספר
                </span>
                
                <h3 className="text-2xl font-display font-bold text-babun-primary mb-4">
                  בדיקה מקיפה ומשא ומתן מבוסס
                </h3>
                <p className="text-babun-primary/80 text-base leading-relaxed font-light">
                  אתה יודע בדיוק איך לבדוק עסקאות קודמות שבוצעו בסביבה, מבין כיצד לחלץ את מחיר המכירה הנכון, ושואל את <span className="font-semibold text-babun-primary underline">3 השאלות הגורליות</span> שמתווכים לא מתנדבים לענות עליהן מיוזמתם.
                </p>
                <p className="text-babun-primary/80 mt-4 leading-relaxed font-semibold">
                  אתה מגלה פרטים פיננסיים שלא ידעת, פותח משא ומתן מבוסס עובדות ומוריד ₪50,000 ממחיר הדירה בקלות.
                </p>
              </div>

              <div className="border-t border-babun-accent/30 pt-8 mt-10">
                <span className="text-xs text-babun-primary/50 uppercase block mb-1">חיסכון מובטח במעמד החוזה:</span>
                <span className="text-2xl font-display font-black text-babun-primary text-black">
                  ₪1,450,000 <span className="text-sm font-normal text-babun-primary/70 mr-1.5">(חיסכון של ₪50,000!)</span>
                </span>
              </div>
            </div>

          </div>

          {/* NET DIFFERENCE FINANCIAL HIGHLIGHT BOX */}
          <div className="mt-12 bg-babun-primary text-white rounded-babun-lg p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 mesh-grid opacity-10 pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <h4 className="text-xl md:text-2xl font-bold font-display text-babun-accent">
                ₪50,000 פחות - בגלל שאלה אחת פשוטה שידעת לשאול.
              </h4>
              <p className="text-base text-white/70 font-light">
                עלות הספר החדש של יעקב רייניץ היא סמלית בלבד. פער בלתי נתפס בקנה מידה פיננסי.
              </p>
              <div className="text-2xl md:text-3xl font-black font-display text-white border-t border-white/10 pt-4 flex flex-col md:flex-row items-center justify-center gap-2">
                <span>הפרש נקי לכיס שלך:</span>
                <span className="text-babun-accent font-black">עשרות אלפי שקלים</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. 6 PARTS OF BOOK */}
      <section className="py-24 bg-babun-light border-y border-babun-primary/5">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          
          <div className="text-center mb-16">
            <span className="text-babun-accent bg-babun-primary text-xs px-3.5 py-1 rounded font-bold mb-3 inline-block">
              מה תמצא בין הדפים?
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-black text-babun-primary mt-2" id="book-content-title">
              מה בספר?
            </h2>
            <p className="text-lg text-babun-primary/60 font-light mt-3 max-w-2xl mx-auto">
              ספר חובה המחולק ל-6 חלקים מרכזיים הבונים בהדרגה את סל הכלים שלך בעולם הנדל"ן.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* PART 1 */}
            <div className="bg-white p-8 rounded-babun-lg border border-babun-primary/5 shadow-sm hover:border-babun-accent transition-all duration-300">
              <span className="text-xs font-bold text-babun-accent bg-babun-primary/95 px-2.5 py-1 rounded mb-4 inline-block font-display">
                חלק א'
              </span>
              <h3 className="text-xl font-display font-bold text-babun-primary mb-3">
                שוק הנדל"ן: מה אתה לא רואה
              </h3>
              <p className="text-babun-primary/70 text-sm leading-relaxed font-light">
                איך עובד השוק מאחורי הקלעים. מה המחיר האמיתי מול מחיר השוק. ולמה כל כך קל לשלם יותר ממה שצריך.
              </p>
            </div>

            {/* PART 2 */}
            <div className="bg-white p-8 rounded-babun-lg border border-babun-primary/5 shadow-sm hover:border-babun-accent transition-all duration-300">
              <span className="text-xs font-bold text-babun-accent bg-babun-primary/95 px-2.5 py-1 rounded mb-4 inline-block font-display">
                חלק ב'
              </span>
              <h3 className="text-xl font-display font-bold text-babun-primary mb-3">
                תכנון פיננסי ומשכנתא
              </h3>
              <p className="text-babun-primary/70 text-sm leading-relaxed font-light">
                כמה אתה יכול לקחת - ולא רק כמה הבנק מאשר לך. ההבדל ביניהם לפעמים עולה ₪200,000.
              </p>
            </div>

            {/* PART 3 */}
            <div className="bg-white p-8 rounded-babun-lg border border-babun-primary/5 shadow-sm hover:border-babun-accent transition-all duration-300">
              <span className="text-xs font-bold text-babun-accent bg-babun-primary/95 px-2.5 py-1 rounded mb-4 inline-block font-display">
                חלק ג'
              </span>
              <h3 className="text-xl font-display font-bold text-babun-primary mb-3">
                בדיקת נכסים
              </h3>
              <p className="text-babun-primary/70 text-sm leading-relaxed font-light">
                מה בודקים, באיזה סדר, ומה קורה כשמדלגים. רשימת בדיקה שאפשר להדפיס ולקחת ישירות לשטח.
              </p>
            </div>

            {/* PART 4 */}
            <div className="bg-white p-8 rounded-babun-lg border border-babun-primary/5 shadow-sm hover:border-babun-accent transition-all duration-300">
              <span className="text-xs font-bold text-babun-accent bg-babun-primary/95 px-2.5 py-1 rounded mb-4 inline-block font-display">
                חלק ד'
              </span>
              <h3 className="text-xl font-display font-bold text-babun-primary mb-3">
                אנשי המקצוע
              </h3>
              <p className="text-babun-primary/70 text-sm leading-relaxed font-light">
                מי באמת עובד בשבילך ומי לא. איך מזהים אינטרסים סמויים. ואיך בוחרים נכון את המלווים שלך בעסקה.
              </p>
            </div>

            {/* PART 5 */}
            <div className="bg-white p-8 rounded-babun-lg border border-babun-primary/5 shadow-sm hover:border-babun-accent transition-all duration-300">
              <span className="text-xs font-bold text-babun-accent bg-babun-primary/95 px-2.5 py-1 rounded mb-4 inline-block font-display">
                חלק ה'
              </span>
              <h3 className="text-xl font-display font-bold text-babun-primary mb-3">
                עסקאות מיוחדות
              </h3>
              <p className="text-babun-primary/70 text-sm leading-relaxed font-light">
                מחיר למשתכן, תמ"א 38, פינוי-בינוי, קבוצות רכישה. מה שווה והיכן טמונים הסיכונים והמלכודות הנסתרות.
              </p>
            </div>

            {/* PART 6 */}
            <div className="bg-white p-8 rounded-babun-lg border border-babun-primary/5 shadow-sm hover:border-babun-accent transition-all duration-300">
              <span className="text-xs font-bold text-babun-accent bg-babun-primary/95 px-2.5 py-1 rounded mb-4 inline-block font-display">
                חלק ו'
              </span>
              <h3 className="text-xl font-display font-bold text-babun-primary mb-3">
                משא ומתן וסגירה
              </h3>
              <p className="text-babun-primary/70 text-sm leading-relaxed font-light">
                איך לנהל מו"מ אפקטיבי. על אילו סעיפים בשום אופן לא לחתום. ואיך יוצאים מהעסקה בלב שלם וללא חרטה.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 6. READER TESTIMONIALS */}
      <section className="py-24 bg-white relative">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          
          <div className="text-center mb-16">
            <span className="text-babun-primary/40 text-xs font-bold uppercase tracking-widest block mb-2">
              משובים ייצוגיים מהשטח
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-black text-babun-primary" id="testimonials-title">
              מה אומרים הקוראים?
            </h2>
            <p className="text-lg text-babun-primary/60 mt-3 font-light max-w-2xl mx-auto">
              תוצאות ומפגשים אמיתיים עם קוראי הספר "שליש בקרקע".
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            
            {/* Testimonial 1 */}
            <div className="bg-babun-light/40 border border-babun-primary/5 p-8 rounded-babun-lg flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-babun-accent mb-4">
                  <span className="text-xl font-bold font-serif">★★★★★</span>
                </div>
                <p className="text-base text-babun-primary/80 italic leading-relaxed font-light">
                  "בגלל הספר שאלתי את המתווך שאלה אחת ממוקדת לגבי היתרי הבנייה הנוכחיים של יחידת הקצה. השאלה הזו בלבד פתחה מחדש את השיחה וחסכה לי ₪35,000 שלמים במחיר הסגירה הסופי! זה לא סתם 'ספר מעולה', זה כלי עבודה שמחזיר את עצמו פי מאה."
                </p>
              </div>
              <div className="border-t border-babun-primary/5 pt-4 mt-6 flex justify-between items-center">
                <span className="font-bold text-sm text-babun-primary">דניאל ק.</span>
                <span className="text-xs text-babun-primary/40 font-medium">ירושלים</span>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-babun-light/40 border border-babun-primary/5 p-8 rounded-babun-lg flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-babun-accent mb-4">
                  <span className="text-xl font-bold font-serif">★★★★★</span>
                </div>
                <p className="text-base text-babun-primary/80 italic leading-relaxed font-light">
                  "לפני שקראתי את הספר חשבתי שהמדד היחידי בשבילי לקחת משכנתא הוא גובה האישור העקרוני שקיבלתי מהבנק. אחרי שקראתי הבנתי את מלכודות ריביות הפתע, החשבתי את אופק החזרי המדדים וביצעתי תכנון חדש לחלוטין שמנע מאיתנו לקפוץ מעל הפופיק."
                </p>
              </div>
              <div className="border-t border-babun-primary/5 pt-4 mt-6 flex justify-between items-center">
                <span className="font-bold text-sm text-babun-primary">יוסי ה.</span>
                <span className="text-xs text-babun-primary/40 font-medium">בני ברק</span>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-babun-light/40 border border-babun-primary/5 p-8 rounded-babun-lg flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-babun-accent mb-4">
                  <span className="text-xl font-bold font-serif">★★★★★</span>
                </div>
                <p className="text-base text-babun-primary/80 italic leading-relaxed font-light">
                  "מה שהכי הפתיע אותי בספר הוא חלק ג' העוסק בבדיקת נכסים. הוא חילק את התהליך לשלבים כל כך ברורים שכל אחד יכול להבין, כולל דברים שלעולם לא הייתי חושב לבדוק בעצמי כמו כיווני אוויר, רישום בעלות בטאבו, ומיפוי מדויק של שטח הדירה."
                </p>
              </div>
              <div className="border-t border-babun-primary/5 pt-4 mt-6 flex justify-between items-center">
                <span className="font-bold text-sm text-babun-primary">רבקה פ.</span>
                <span className="text-xs text-babun-primary/40 font-medium">פתח תקווה</span>
              </div>
            </div>

            {/* Testimonial 4 */}
            <div className="bg-babun-light/40 border border-babun-primary/5 p-8 rounded-babun-lg flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-babun-accent mb-4">
                  <span className="text-xl font-bold font-serif">★★★★★</span>
                </div>
                <p className="text-base text-babun-primary/80 italic leading-relaxed font-light">
                  "כבר קניתי דירה ראשונה בעבר, ובאתי לקרוא רק לקראת עסקת השקעה שנייה. הספר הזה האיר לי את כל הטעויות שעשיתי בעסקת הדירה הראשונה שלי, ופשוט שינה לחלוטין את הגישה שבה אני מתנהלת מול מתווכים ויזמי תקומה עירונית מעכשיו והלאה."
                </p>
              </div>
              <div className="border-t border-babun-primary/5 pt-4 mt-6 flex justify-between items-center">
                <span className="font-bold text-sm text-babun-primary">אלישבע מ.</span>
                <span className="text-xs text-babun-primary/40 font-medium">חיפה</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. ABOUT JACOB REINITZ SECTION */}
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
              <h2 className="text-3xl md:text-5xl font-display font-black text-babun-primary" id="author-about-title">
                על יעקב רייניץ
              </h2>
              <h3 className="text-xl md:text-2xl font-bold text-babun-primary/80">
                עיתונאי כלכלי שהפך למומחה נדל"ן. מומחה שהפך לשליחות.
              </h3>
              
              <div className="text-base md:text-lg font-light text-zinc-700 space-y-4 leading-relaxed text-babun-primary/90">
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

      {/* 8. FAQs SECTION */}
      <section className="py-24 bg-white relative">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          
          <div className="text-center mb-16">
            <span className="text-babun-accent bg-babun-primary text-xs px-3.5 py-1 rounded font-bold mb-3 inline-block">
              ריכזנו את השאלות הנפוצות
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-black text-babun-primary" id="faq-section-title">
              שאלות נפוצות בנושא הספר
            </h2>
            <p className="text-lg text-babun-primary/50 font-light mt-3">
              לחץ על השאלה להרחבת התשובה
            </p>
          </div>

          <div className="space-y-4">
            
            {/* FAQ 1 */}
            <div className="bg-babun-light border border-babun-primary/5 rounded-babun-md overflow-hidden transition-all duration-300">
              <button 
                onClick={() => toggleFaq(0)}
                className="w-full py-5 px-6 md:px-8 text-right font-display font-bold text-lg text-babun-primary hover:text-babun-accent transition-colors flex items-center justify-between gap-4"
              >
                <span>לאיזה שלב הספר מתאים?</span>
                <ChevronDown size={18} className={`text-babun-primary/40 transition-transform duration-300 ${openFaq === 0 ? 'rotate-180 text-babun-accent' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {openFaq === 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <div className="px-6 md:px-8 pb-6 border-t border-babun-primary/5 text-base text-babun-primary/75 font-light leading-relaxed">
                      לכל שלב. לפני שמתחילים לחפש דירה, תוך כדי התנעה, ואפילו אחרי שביצעתם רכישה ראשונה - כדי להבין מה ואיך אפשר לשפר לקראת הפעם הבאה.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* FAQ 2 */}
            <div className="bg-babun-light border border-babun-primary/5 rounded-babun-md overflow-hidden transition-all duration-300">
              <button 
                onClick={() => toggleFaq(1)}
                className="w-full py-5 px-6 md:px-8 text-right font-display font-bold text-lg text-babun-primary hover:text-babun-accent transition-colors flex items-center justify-between gap-4"
              >
                <span>האם הספר מתאים למי שאין לו ידע קודם?</span>
                <ChevronDown size={18} className={`text-babun-primary/40 transition-transform duration-300 ${openFaq === 1 ? 'rotate-180 text-babun-accent' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {openFaq === 1 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <div className="px-6 md:px-8 pb-6 border-t border-babun-primary/5 text-base text-babun-primary/75 font-light leading-relaxed">
                      זה בדיוק בשבילו. הספר אינו מניח שאתה יודע כלום מראש. הוא נכתב בצורה פשוטה, שווה לכל נפש, ומתחיל מהבסיס הפיננסי הרחב ועד לסגירת העסקה.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* FAQ 3 */}
            <div className="bg-babun-light border border-babun-primary/5 rounded-babun-md overflow-hidden transition-all duration-300">
              <button 
                onClick={() => toggleFaq(2)}
                className="w-full py-5 px-6 md:px-8 text-right font-display font-bold text-lg text-babun-primary hover:text-babun-accent transition-colors flex items-center justify-between gap-4"
              >
                <span>האם הספר מכסה גם השקעות, לא רק דירה ראשונה?</span>
                <ChevronDown size={18} className={`text-babun-primary/40 transition-transform duration-300 ${openFaq === 2 ? 'rotate-180 text-babun-accent' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {openFaq === 2 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <div className="px-6 md:px-8 pb-6 border-t border-babun-primary/5 text-base text-babun-primary/75 font-light leading-relaxed">
                      כן בהחלט. חלקים גדולים ומכובדים בספר מוקדשים ומוכוונים לפרספקטיבה של משקיעים - ניתוח גובה תשואה, אומדן סיכונים, בדיקת ביקוש שכירות וניתוח היתכנות של עסקאות מורכבות יותר.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* FAQ 4 */}
            <div className="bg-babun-light border border-babun-primary/5 rounded-babun-md overflow-hidden transition-all duration-300">
              <button 
                onClick={() => toggleFaq(3)}
                className="w-full py-5 px-6 md:px-8 text-right font-display font-bold text-lg text-babun-primary hover:text-babun-accent transition-colors flex items-center justify-between gap-4"
              >
                <span>כמה זמן לוקח לקרוא את הספר?</span>
                <ChevronDown size={18} className={`text-babun-primary/40 transition-transform duration-300 ${openFaq === 3 ? 'rotate-180 text-babun-accent' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {openFaq === 3 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <div className="px-6 md:px-8 pb-6 border-t border-babun-primary/5 text-base text-babun-primary/75 font-light leading-relaxed">
                      הספר תמציתי ומדויק ביותר. ערב אחד מרוכז יספיק לקריאה ראשונה של כל הספר. לאחר מכן, מומלץ מאוד לחזור במהלך השבועות הבאים לפרקים הספציפיים שהכי רלוונטיים לשלב שבו העסקה שלכם עומדת כעת.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* FAQ 5 */}
            <div className="bg-babun-light border border-babun-primary/5 rounded-babun-md overflow-hidden transition-all duration-300">
              <button 
                onClick={() => toggleFaq(4)}
                className="w-full py-5 px-6 md:px-8 text-right font-display font-bold text-lg text-babun-primary hover:text-babun-accent transition-colors flex items-center justify-between gap-4"
              >
                <span>מה ההבדל בין הספר לפגישת ייעוץ אצל יעקב?</span>
                <ChevronDown size={18} className={`text-babun-primary/40 transition-transform duration-300 ${openFaq === 4 ? 'rotate-180 text-babun-accent' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {openFaq === 4 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <div className="px-6 md:px-8 pb-6 border-t border-babun-primary/5 text-base text-babun-primary/75 font-light leading-relaxed">
                      הספר מעניק לך את בסיס הידע, הכלים והמושגים הנדרשים. פגישת הייעוץ מיישמת את כל המנגנונים הללו ומפצחת אותם ישירות על המקרה הספציפי והנתונים הפיננסיים האישיים שלך. הרבה אנשים קוראים את הספר תחילה, ומגיעים לפגישה כאשר הם כבר בעלי הבנה ומעלים שאלות ממוקדות ואיכותיות פי כמה.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>

      {/* 9. BOOKING / ORDER FORM CHECKOUT SECTION */}
      <section id="checkout-form-section" className="py-24 bg-babun-primary text-white relative scroll-mt-20">
        <div className="absolute inset-0 mesh-grid opacity-15 z-0" />
        
        <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10">
          <div className="bg-white text-babun-primary rounded-babun-xl p-8 md:p-14 shadow-2xl relative border border-white/10">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Form Input Side */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <span className="text-babun-primary/40 text-xs font-bold uppercase tracking-widest block mb-2">
                    טופס הזמנה מאובטח
                  </span>
                  <h2 className="text-3xl md:text-4xl font-display font-black text-babun-primary" id="order-title">
                    קבל את הספר אליך
                  </h2>
                  <p className="text-sm md:text-base text-babun-primary/60 font-light mt-2">
                    148 עמודים. כל שאלה שאנשים שואלים אותי - בפנים. קרא לפני שאתה חותם.
                  </p>
                </div>

                {checkoutStatus === "success" ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-babun-accent/10 border-2 border-babun-accent p-8 rounded-babun-lg text-center"
                  >
                    <div className="w-14 h-14 bg-babun-accent text-babun-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={28} className="stroke-[2.5]" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-babun-primary mb-2">
                      הזמנתך התקבלה בהצלחה!
                    </h3>
                    <p className="text-sm text-babun-primary/80 mb-6 leading-relaxed">
                      מזל טוב ומודה לך על הזמנתך. העותק הפיזי שלך נכנס לתהליך אריזה ומשלוח מיידי.
                    </p>
                    <div className="py-2 px-4 bg-babun-primary text-white font-bold text-xs rounded inline-block">
                      משלוח עד הבית - עד 5 ימי עסקים 🚚
                    </div>
                    <button 
                      onClick={() => setCheckoutStatus(null)}
                      className="block text-xs text-babun-primary/40 hover:text-babun-primary mt-6 underline mx-auto"
                    >
                      בצע הזמנה נוספת
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                    {errorMsg && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-4 rounded-babun-md text-xs font-bold">
                        {errorMsg}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-babun-primary/80">
                        שם מלא לקבלת המשלוח <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input 
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="ישראל משה ישראלי"
                          className="w-full bg-babun-light border border-babun-primary/10 rounded-babun-md px-10 py-3.5 text-right outline-none focus:border-babun-accent transition-all text-sm text-babun-primary"
                        />
                        <User size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-babun-primary/30" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-babun-primary/80">
                        מספר טלפון לתיאום משלוח <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input 
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="050-1234567"
                          className="w-full bg-babun-light border border-babun-primary/10 rounded-babun-md px-10 py-3.5 text-right outline-none focus:border-babun-accent transition-all text-sm text-babun-primary"
                        />
                        <Phone size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-babun-primary/30" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-babun-primary/80">
                        כתובת מלאה למשלוח (עיר, רחוב ומספר בית) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input 
                          type="text"
                          name="address"
                          required
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="רחוב מצדה 3, בני ברק, דירה 12"
                          className="w-full bg-babun-light border border-babun-primary/10 rounded-babun-md px-10 py-3.5 text-right outline-none focus:border-babun-accent transition-all text-sm text-babun-primary"
                        />
                        <MapPin size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-babun-primary/30" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-babun-primary/80">
                        כתובת אימייל (לקבלת חשבונית ופרטי מעקב)
                      </label>
                      <div className="relative">
                        <input 
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="yourmail@domain.com"
                          className="w-full bg-babun-light border border-babun-primary/10 rounded-babun-md px-10 py-3.5 text-left outline-none focus:border-babun-accent transition-all text-sm text-babun-primary"
                        />
                        <Mail size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-babun-primary/30" />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button 
                        type="submit"
                        disabled={checkoutStatus === "loading"}
                        className="w-full bg-babun-accent hover:bg-babun-primary text-babun-primary hover:text-white font-bold py-4 px-6 rounded-babun-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                      >
                        {checkoutStatus === "loading" ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-babun-primary border-t-transparent" />
                            <span>מעבד הזמנה...</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={18} />
                            <span>רכוש עכשיו</span>
                          </>
                        )}
                      </button>
                      <p className="text-center text-babun-primary/30 text-[11px] mt-3">
                        משלוח עד הבית - עד 5 ימי עסקים לכל נקודה בארץ
                      </p>
                    </div>
                  </form>
                )}
              </div>

              {/* Promo Visual Sidebar (3D Book and Journey path) */}
              <div className="lg:col-span-5 bg-babun-light p-6 md:p-8 rounded-babun-lg flex flex-col justify-between text-right border border-babun-primary/5">
                <div>
                  <div className="text-2xl font-display font-bold text-babun-primary mb-3">
                    מהדורת נייר מהודרת
                  </div>
                  <div className="text-sm font-bold text-babun-accent bg-babun-primary px-3 py-1 rounded inline-block mb-6">
                    הפגישה שתחסוך לך עשרות אלפים
                  </div>

                  <div className="space-y-4 text-xs text-babun-primary/80 font-light leading-relaxed">
                    <div className="flex gap-2.5 items-start">
                      <CheckCircle2 size={15} className="text-babun-primary shrink-0 mt-0.5" />
                      <span>148 עמודים מקיפים של מידע מקצועי מזוקק</span>
                    </div>
                    <div className="flex gap-2.5 items-start">
                      <CheckCircle2 size={15} className="text-babun-primary shrink-0 mt-0.5" />
                      <span>רשימות בדיקה מעשיות הניתנות להדפסה ישירה לקראת שטח</span>
                    </div>
                    <div className="flex gap-2.5 items-start">
                      <CheckCircle2 size={15} className="text-babun-primary shrink-0 mt-0.5" />
                      <span>גישה פתוחה והבנה פיננסית קלה ששום איש מקצוע לא יתנדב למסור מיוזמתו</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-babun-primary/10 pt-6 mt-8 space-y-4">
                  <div className="text-xs text-babun-primary/50 font-bold block">מחפש משוב אישי ומעמיק יותר?</div>
                  <Link 
                    to="/consulting"
                    className="group text-sm font-bold text-babun-primary hover:text-babun-accent transition-colors flex items-center gap-1.5 justify-start cursor-pointer"
                  >
                    <CornerDownLeft size={16} className="text-babun-accent transition-transform group-hover:-translate-x-1" />
                    <span>יש לך שאלה ספציפית שהספר לא מכסה? ← קבע פגישת ייעוץ אישית</span>
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
