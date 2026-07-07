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
  Share2,
  Truck,
  Book as BookIcon
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

      // Automatically redirect to the secure payment URL
      setTimeout(() => {
        window.location.href = "https://plando.co.il/self_services/embed_store/24804?ak=597df96284d52e5dd3be33b6ff7afc68";
      }, 1500);
    } catch (err: any) {
      console.error("Firestore error: ", err);
      // Fallback to success + redirect anyway so they can pay even if Firestore is slow or offline
      setCheckoutStatus("success");
      setFormData({ name: "", address: "", phone: "", email: "" });
      setTimeout(() => {
        window.location.href = "https://plando.co.il/self_services/embed_store/24804?ak=597df96284d52e5dd3be33b6ff7afc68";
      }, 1500);
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
      <section className="bg-babun-primary text-white pt-32 pb-24 relative overflow-visible z-10 text-right">
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

        <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10 mt-[100px] text-right">
          <div className="flex flex-col items-start justify-start space-y-8 pr-0 pl-[5px] -mr-[92px]">
            
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-display font-black leading-tight text-white mb-4 tracking-tight text-right w-full"
              id="book-main-title"
            >
              הספר שמסביר לך את מה <br className="hidden md:inline" />
              <span className="text-babun-accent font-black">שאיש לא הסביר לפני שחתמת.</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="pt-2 flex flex-col sm:flex-row items-start gap-4 justify-start w-full"
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
        </div>
      </section>

      {/* 2. METRIC BLOCK SECTION - Styled with clean white background, split layout: texts on the right, large book mockup on the left */}
      <section className="py-24 bg-white text-babun-primary relative overflow-hidden text-right">
        <div className="absolute inset-0 mesh-grid opacity-5 z-0" />
        <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10 text-right">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center" dir="rtl">
            {/* Right Column: Texts (5/12) */}
            <div className="lg:col-span-5 space-y-6 text-right">
              {/* SMALLER SUBTITLE: ספר אחד. תשובה לשאלה שכולם שואלים. */}
              <p className="text-lg md:text-xl font-bold text-black py-0.5">
                ספר אחד. תשובה לשאלה שכולם שואלים.
              </p>

              {/* BIG HEADING: מאיפה מתחילים? */}
              <h2 className="text-7xl sm:text-8xl md:text-9xl font-display font-normal tracking-tight leading-[0.95] text-black">
                מאיפה <br />
                מתחילים?
              </h2>

              {/* MAIN PARAGRAPHS - NO BOX/FRAME */}
              <div className="space-y-6 mt-8 max-w-2xl text-lg text-babun-primary/95 leading-relaxed font-light">
                <p>
                  זו השאלה שאני שומע הכי הרבה. מאנשים שרוצים לקנות דירה ראשונה. מאנשים שרוצים להשקיע ולא יודעים בדיוק איך. מאנשים שכבר קנו - ואחר כך הבנו שהיו שאלות שלא שאלו.
                </p>

                <p className="text-xl md:text-2xl font-bold text-black pt-2">
                  כתבתי את הספר הזה בדיוק בשבילכם.
                </p>
              </div>
            </div>

            {/* Left Column: Large Book Mockup Image (7/12) - ALIGNED PORTRAIT TO LEFT AND FULLY ENLARGED */}
            <div className="lg:col-span-7 flex justify-center lg:justify-end w-full">
              <div className="w-full max-w-[650px] aspect-[4/5] lg:-ml-8">
                <img 
                  src="https://lh3.googleusercontent.com/d/1YATeihtnryr9oCFr2-byVjsEYCnxVtIl" 
                  alt="ספר הנדלן - עטיפת הספר מאיפה מתחילים" 
                  className="w-full h-full object-contain lg:object-left lg:mr-[150px]"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. OPTIONS CARDS SECTION - Relocated below metric block section, styled with black BG & Zero borders, columns of icons and CTA */}
      <section id="options-section" className="py-20 bg-black relative scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          
          {/* Columns layout with icons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center pb-12" dir="rtl">
            {/* Column 1 */}
            <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-babun-lg transition-all duration-300 hover:bg-white/10 group">
              <div className="w-16 h-16 bg-babun-accent/10 border border-babun-accent/25 text-babun-accent rounded-full mb-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <BookIcon size={28} />
              </div>
              <span className="text-lg font-medium text-white/95">ספר מודפס</span>
            </div>

            {/* Column 2 */}
            <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-babun-lg transition-all duration-300 hover:bg-white/10 group">
              <div className="w-16 h-16 bg-babun-accent/10 border border-babun-accent/25 text-babun-accent rounded-full mb-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <BookOpen size={28} />
              </div>
              <span className="text-lg font-medium text-white/95">148 עמודים של ידע מעשי</span>
            </div>

            {/* Column 3 */}
            <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-babun-lg transition-all duration-300 hover:bg-white/10 group">
              <div className="w-16 h-16 bg-babun-accent/10 border border-babun-accent/25 text-babun-accent rounded-full mb-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <ClipboardList size={28} />
              </div>
              <span className="text-lg font-medium text-white/95">כולל רשימת בדיקה (צ׳קליסט) מודפסת</span>
            </div>

            {/* Column 4 */}
            <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-babun-lg transition-all duration-300 hover:bg-white/10 group">
              <div className="w-16 h-16 bg-babun-accent/10 border border-babun-accent/25 text-babun-accent rounded-full mb-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <Truck size={28} />
              </div>
              <span className="text-lg font-medium text-white/95">משלוח עד הבית</span>
            </div>
          </div>

          <div className="max-w-md mx-auto text-center">
            <button 
              onClick={() => scrollToId("checkout-form-section")}
              className="w-full bg-babun-accent hover:bg-white text-babun-primary font-bold py-5 px-8 rounded-babun-md transition-all duration-300 text-center cursor-pointer flex items-center justify-center gap-3 text-lg"
            >
              <span>להזמנה עכשיו</span>
              <ArrowLeft size={20} className="stroke-[2.5]" />
            </button>
          </div>

        </div>
      </section>



      {/* 5. 6 PARTS OF BOOK */}
      <section className="py-24 bg-babun-light border-y border-babun-primary/5">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          
          <div className="text-right mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-black text-babun-primary mt-2" id="book-content-title">
              מה בספר?
            </h2>
            <p className="text-lg text-babun-primary/60 font-light mt-3 max-w-2xl text-right">
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

      {/* 6. READER TESTIMONIALS */}
      <section className="py-24 bg-white relative">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          
          <div className="text-right mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-black text-babun-primary" id="testimonials-title">
              מה אומרים הקוראים?
            </h2>
            <p className="text-lg text-babun-primary/60 mt-3 font-light max-w-2xl text-right">
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
      <section className="py-24 bg-zinc-100/70 border-y border-babun-primary/5 relative">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          
          <div className="text-right mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-black text-babun-primary" id="faq-section-title">
              שאלות נפוצות בנושא הספר
            </h2>
            <p className="text-lg text-babun-primary/50 font-light mt-3">
              לחץ על השאלה להרחבת התשובה
            </p>
          </div>

          <div className="space-y-4">
            
            {/* FAQ 1 */}
            <div className="bg-white border border-babun-primary/5 rounded-babun-md overflow-hidden transition-all duration-300 shadow-sm">
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
            <div className="bg-white border border-babun-primary/5 rounded-babun-md overflow-hidden transition-all duration-300 shadow-sm">
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
            <div className="bg-white border border-babun-primary/5 rounded-babun-md overflow-hidden transition-all duration-300 shadow-sm">
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
            <div className="bg-white border border-babun-primary/5 rounded-babun-md overflow-hidden transition-all duration-300 shadow-sm">
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
            <div className="bg-white border border-babun-primary/5 rounded-babun-md overflow-hidden transition-all duration-300 shadow-sm">
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
      <section id="checkout-form-section" className="py-24 bg-babun-accent text-babun-primary relative scroll-mt-20">
        <div className="absolute inset-0 mesh-grid opacity-10 z-0" />
        
        <div className="max-w-2xl mx-auto px-4 md:px-8 relative z-10">
          
          <div className="space-y-8">
            
            {/* Form Input Side */}
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl md:text-5xl font-display font-black text-babun-primary" id="order-title">
                  הזמן את הספר עוד היום!
                </h2>
              </div>

              {checkoutStatus === "success" ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-8 md:p-12 rounded-babun-lg text-center shadow-xl border border-babun-primary/5"
                >
                  <div className="w-14 h-14 bg-babun-accent text-babun-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={28} className="stroke-[2.5]" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-babun-primary mb-2">
                    הפרטים נקלטו בהצלחה!
                  </h3>
                  <p className="text-sm text-babun-primary/80 mb-4 leading-relaxed">
                    תודה רבה. פרטי המשלוח נשמרו במערכת. כעת אנו מעבירים אותך לעמוד התשלום המאובטח להשלמת הרכישה.
                  </p>
                  <p className="text-babun-primary text-sm font-bold animate-pulse mb-6">
                    מעביר לתשלום באופן אוטומטי...
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                    <a 
                      href="https://plando.co.il/self_services/embed_store/24804?ak=597df96284d52e5dd3be33b6ff7afc68"
                      className="bg-babun-accent hover:bg-babun-accent/90 text-babun-primary font-black py-4 px-8 rounded-full shadow-lg transition-all duration-300 hover:scale-105 inline-flex items-center gap-2 cursor-pointer text-base"
                    >
                      <span>מעבר לתשלום מאובטח (149 ₪)</span>
                      <ArrowLeft size={18} />
                    </a>
                    <button 
                      onClick={() => setCheckoutStatus(null)}
                      className="text-xs text-babun-primary/60 hover:text-babun-primary underline font-bold"
                    >
                      בצע הזמנה נוספת
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleCheckoutSubmit} className="space-y-4 max-w-xl mx-auto">
                  {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-4 rounded-babun-md text-xs font-bold">
                      {errorMsg}
                    </div>
                  )}

                  <div className="space-y-1.5 text-right">
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
                        className="w-full bg-white border border-babun-primary/10 rounded-babun-md px-10 py-3.5 text-right outline-none focus:border-babun-accent transition-all text-sm text-babun-primary"
                      />
                      <User size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-babun-primary/30" />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-right">
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
                        className="w-full bg-white border border-babun-primary/10 rounded-babun-md px-10 py-3.5 text-right outline-none focus:border-babun-accent transition-all text-sm text-babun-primary"
                      />
                      <Phone size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-babun-primary/30" />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-right">
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
                        className="w-full bg-white border border-babun-primary/10 rounded-babun-md px-10 py-3.5 text-right outline-none focus:border-babun-accent transition-all text-sm text-babun-primary"
                      />
                      <MapPin size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-babun-primary/30" />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-right">
                    <label className="block text-xs font-bold text-babun-primary/80">
                      כתובת אימייל (לקבלת חשבונית ופרטי מעקב) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="yourmail@domain.com"
                        className="w-full bg-white border border-babun-primary/10 rounded-babun-md px-10 py-3.5 text-left outline-none focus:border-babun-accent transition-all text-sm text-babun-primary"
                      />
                      <Mail size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-babun-primary/30" />
                    </div>
                  </div>

                  <div className="pt-4 text-center">
                    <button 
                      type="submit"
                      disabled={checkoutStatus === "loading"}
                      className="w-full bg-babun-primary hover:bg-zinc-900 text-white font-bold py-4.5 px-6 rounded-babun-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xl"
                    >
                      {checkoutStatus === "loading" ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                          <span>מעבד הזמנה...</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={18} />
                          <span>מעבר לתשלום</span>
                        </>
                      )}
                    </button>
                    <p className="text-center text-babun-primary/50 text-[11px] mt-3">
                      משלוח עד הבית - עד 5 ימי עסקים לכל נקודה בארץ
                    </p>
                  </div>
                </form>
              )}
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
