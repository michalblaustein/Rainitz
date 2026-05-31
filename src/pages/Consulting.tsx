import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  Send
} from "lucide-react";

export default function Consulting() {
  // Booking Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      setErrorMsg("אנא מלא שם מלא ומספר טלפון.");
      return;
    }
    setErrorMsg("");
    setIsSubmitting(true);

    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ fullName: "", phone: "", email: "", message: "" });
    }, 1200);
  };

  // Scroll smoothly to appointment form
  const scrollToBooking = () => {
    const bookingSection = document.getElementById("booking-section");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const trustItems = [
    { label: "מ-2006", sub: "בשוק הנדל\"ן" },
    { label: "ייעוץ אישי", sub: "שעה ממוקדת" },
    { label: "בלי אינטרסים", sub: "לא קשר לשום קבלן" },
    { label: "בני ברק / זום", sub: "מצדה 3" }
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
      <section className="bg-babun-primary text-white pt-40 pb-28 relative overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0 opacity-40 select-none pointer-events-none">
          <iframe 
            className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto aspect-video -translate-x-1/2 -translate-y-1/2 pointer-events-none object-cover scale-150"
            src="https://www.youtube.com/embed/FaIjjdPNoiI?autoplay=1&mute=1&loop=1&playlist=FaIjjdPNoiI&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&disablekb=1&fs=0&autohide=1"
            allow="autoplay; encrypted-media"
            frameBorder="0"
          />
          {/* Transparent click/tap block layer */}
          <div className="absolute inset-0 bg-transparent z-[10] pointer-events-auto" />
          {/* Dark Gradient Overlay & Black Semi-Transparent Layer */}
          <div className="absolute inset-0 bg-black/60 z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-t from-babun-primary via-transparent to-babun-primary/80 z-[2]" />
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-8 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-babun-accent/30 bg-babun-accent/10 text-babun-accent font-medium text-xs mb-8 justify-center"
          >
            <Sparkles size={14} />
            <span>ייעוץ עצמאי ללא פשרות</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-display font-black leading-tight text-white mb-6 max-w-4xl mx-auto tracking-tight"
            id="hero-main-title"
          >
            שאלה אחת יכולה לחסוך לך <br />
            <span className="text-babun-accent drop-shadow-sm font-black">עשרות אלפי שקלים.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
          >
            פגישת ייעוץ אישית עם יעקב רייניץ. שעה אחת. תשובות ישירות. בלי אינטרסים נסתרים.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center gap-3"
          >
            <button 
              onClick={scrollToBooking}
              className="bg-babun-accent hover:bg-white text-babun-primary hover:text-babun-primary px-10 py-5 rounded-babun-md font-bold text-lg md:text-xl shadow-xl hover:shadow-babun-accent/25 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-3 z-10 cursor-pointer"
              id="hero-cta-btn"
            >
              <ArrowLeft size={20} className="stroke-[2.5px] animate-pulse" />
              <span>קבע פגישה עכשיו</span>
            </button>
            <span className="text-white/60 text-sm md:text-base font-medium mt-1">
              ₪1,200 לשעה | בני ברק או זום
            </span>
          </motion.div>
        </div>
      </section>

      {/* 2. TRUST BAR */}
      <section className="bg-babun-secondary py-8 border-y border-white/10 relative z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {trustItems.map((item, index) => (
              <div 
                key={index} 
                className={`flex flex-col items-center justify-center ${index < 3 ? 'border-l border-white/10 max-lg:border-l-0 max-lg:odd:border-l' : ''}`}
              >
                <div className="text-babun-accent text-xl md:text-2xl font-black font-display mb-1">
                  {item.label}
                </div>
                <div className="text-white/60 text-sm font-light">
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
          <div className="text-center md:text-right max-w-3xl mx-auto">
            <span className="text-babun-primary/40 font-bold tracking-widest text-xs uppercase mb-3 block">
              המציאות של רוב העסקאות
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-black text-babun-primary mb-8" id="truth-title">
              האמת שרוב הייעוצים לא אומרים לך
            </h2>
            
            <div className="space-y-6 text-lg text-babun-primary/80 leading-relaxed font-light">
              <p>
                רוב האנשים שמגיעים אלי - מגיעים אחרי שחתמו. אחרי שגילו שהנכס שרכשו שווה פחות ממה שחשבו. אחרי שלקחו משכנתא שלא הבינו לגמרי. אחרי שהמתווך "עזר" - לצד השני.
              </p>
              <p className="border-r-4 border-babun-accent pr-6 py-2 bg-babun-accent/5 font-normal text-babun-primary">
                שאלה אחת לפני החתימה יכולה לשנות את כל התמונה. שאלה אחת אחרי - עולה הרבה יותר.
              </p>
              <p className="text-xl font-medium text-babun-primary pt-2">
                הפגישה הזו קיימת כדי שאתה תשאל לפני.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHAT WE DO IN THE MEETING */}
      <section className="py-24 bg-babun-light border-y border-babun-primary/5">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <span className="text-babun-accent bg-babun-primary text-xs px-3 py-1 rounded font-bold mb-3 inline-block">
              ממוקד • יעיל • תכלס
            </span>
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
                  <div className="w-12 h-12 bg-babun-primary text-babun-accent rounded-babun-md flex items-center justify-center font-black text-lg mb-6">
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

      {/* 5. MEETING DETAILS TABLE */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="mb-12 text-center md:text-right">
            <h2 className="text-3xl font-display font-black text-babun-primary mb-2">
              פרטי הפגישה
            </h2>
            <p className="text-babun-primary/60 text-base font-light">
              שקיפות מלאה לכל שאלה
            </p>
          </div>

          <div className="border border-babun-primary/10 rounded-babun-lg overflow-hidden shadow-sm">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-babun-primary text-white border-b border-babun-primary/20">
                  <th className="py-5 px-6 font-display font-bold text-lg w-1/3 text-babun-accent">פרט</th>
                  <th className="py-5 px-6 font-display font-bold text-lg text-white">מידע</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-babun-primary/5 text-base">
                <tr className="bg-white hover:bg-babun-light/50 transition-colors">
                  <td className="py-4.5 px-6 font-bold text-babun-primary">משך הפגישה</td>
                  <td className="py-4.5 px-6 text-babun-primary/80">שעה</td>
                </tr>
                <tr className="bg-babun-light/20 hover:bg-babun-light/50 transition-colors">
                  <td className="py-4.5 px-6 font-bold text-babun-primary">עלות</td>
                  <td className="py-4.5 px-6 text-babun-primary/80 font-medium">₪1,200</td>
                </tr>
                <tr className="bg-white hover:bg-babun-light/50 transition-colors">
                  <td className="py-4.5 px-6 font-bold text-babun-primary">מיקום</td>
                  <td className="py-4.5 px-6 text-babun-primary/80">מצדה 3, בני ברק - או זום</td>
                </tr>
                <tr className="bg-babun-light/20 hover:bg-babun-light/50 transition-colors">
                  <td className="py-4.5 px-6 font-bold text-babun-primary">שפה</td>
                  <td className="py-4.5 px-6 text-babun-primary/80">עברית</td>
                </tr>
                <tr className="bg-white hover:bg-babun-light/50 transition-colors">
                  <td className="py-4.5 px-6 font-bold text-babun-primary">זמינות</td>
                  <td className="py-4.5 px-6 text-babun-primary/80">ימי א'-ה'</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. WHO IS THIS FOR */}
      <section className="py-24 bg-babun-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 mesh-grid opacity-10 z-0" />
        <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="text-babun-accent font-display font-bold text-sm uppercase tracking-widest block mb-2">
              התאמה מדויקת
            </span>
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
        </div>
      </section>

      {/* 7. ABOUT JACOB REINITZ */}
      <section className="py-24 bg-white relative">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Quote and Profile Visual Column */}
            <div className="lg:col-span-5 bg-babun-light p-10 rounded-babun-lg border border-babun-primary/5 text-center relative max-lg:order-2">
              <div className="absolute top-4 right-4 text-babun-accent/40 font-serif text-8xl leading-none">“</div>
              <div className="relative z-10">
                <p className="text-lg md:text-xl font-semibold text-babun-primary italic mb-6 leading-relaxed">
                  "אני לא יועץ שמוכר לך. אני יועץ שעובד בשבילך."
                </p>
                <div className="inline-block h-1 w-16 bg-babun-accent mb-4"></div>
                <h4 className="text-xl font-display font-black text-babun-primary">
                  יעקב רייניץ
                </h4>
                <p className="text-sm text-babun-primary/50 mt-1 shadow-none">
                  עצמאות מלאה בשוק הנדל"ן
                </p>
              </div>
            </div>

            {/* Main Content Column */}
            <div className="lg:col-span-7 text-right max-lg:order-1">
              <span className="text-babun-primary/40 text-xs font-bold uppercase block mb-3">
                היועץ שמוביל אותך להחלטה
              </span>
              <h2 className="text-3xl md:text-5xl font-display font-black text-babun-primary mb-8" id="about-jacob-title">
                על יעקב רייניץ
              </h2>

              <div className="space-y-6 text-base md:text-lg text-babun-primary/80 leading-relaxed font-light">
                <p>
                  התחלתי כעיתונאי כלכלי - כיסיתי שוק הנדל"ן מבחוץ. ראיתי מה קורה כשאנשים חותמים בלי ידע. כשעברתי לייעוץ, החלטתי: <span className="font-semibold text-babun-primary">עצמאות מלאה.</span>
                </p>
                <p>
                  אני לא מחויב לאף קבלן. לאף יזם. לאף גורם בשוק. מה שתשמע ממני עובר דרך שאלה אחת בלבד: <span className="font-semibold text-babun-primary">האם זה נכון לך?</span>
                </p>
                <p className="text-babun-primary bg-babun-light/60 p-4 rounded border-r-4 border-babun-primary font-medium text-base">
                  ספר "שליש בקרקע". טור שבועי ב"המודיע". מאות עסקאות מלוות. לא כדי להתרברב - כדי שתדע ממי אתה שואל.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. FAQs SECTION */}
      <section className="py-24 bg-babun-light border-y border-babun-primary/5">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <span className="text-babun-accent bg-babun-primary text-xs px-3 py-1 rounded font-bold mb-3 inline-block">
              שאלות נפוצות
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-black text-babun-primary" id="faq-title">
              על מה הכי הרבה שואלים אותי?
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

      {/* 9. BOOKING FORM SECTION */}
      <section id="booking-section" className="py-24 bg-white relative scroll-mt-28">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="bg-babun-primary text-white rounded-babun-lg p-8 md:p-14 relative overflow-hidden shadow-2xl border border-white/5">
            <div className="absolute inset-0 mesh-grid opacity-10 z-0" />
            
            <div className="relative z-10 text-center md:text-right">
              <span className="text-babun-accent font-display font-bold text-xs uppercase tracking-widest block mb-3">
                צעד קטן שחוסך עשרות אלפים
              </span>
              <h2 className="text-3xl md:text-5xl font-display font-black text-white mb-4" id="booking-form-title">
                מוכן לשאול את השאלות הנכונות?
              </h2>
              <p className="text-white/80 text-base md:text-lg font-light mb-10 max-w-2xl leading-relaxed">
                שאלה אחת בפגישה יכולה לשנות החלטה של מאות אלפי שקלים. קבע עכשיו.
              </p>

              {isSubmitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/10 border border-babun-accent/30 p-8 rounded-babun-md text-center max-w-xl mx-auto"
                >
                  <div className="w-16 h-16 bg-babun-accent text-babun-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={32} className="stroke-[2.5]" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-babun-accent mb-3">
                    הבקשה התקבלה בהצלחה!
                  </h3>
                  <p className="text-white text-base leading-relaxed font-light mb-4">
                    תודה רבה. פרטיך נרשמו במערכת ונבדוק את פנייתך בהקדם המרבי.
                  </p>
                  <p className="text-babun-accent text-sm font-bold animate-pulse">
                    אנחנו חוזרים אליך תוך 24 שעות!
                  </p>
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="mt-6 text-xs text-white/50 hover:text-white underline"
                  >
                    שלח פנייה נוספת
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {errorMsg && (
                    <div className="bg-red-500/15 border border-red-500/30 text-red-100 p-4 rounded-babun-md text-sm text-right font-medium">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-white/90 text-right">
                        שם מלא <span className="text-babun-accent">*</span>
                      </label>
                      <div className="relative">
                        <input 
                          type="text"
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="ישראל ישראלי"
                          className="w-full bg-white/5 hover:bg-white/10 focus:bg-white text-white focus:text-babun-primary border border-white/15 focus:border-babun-accent rounded-babun-md px-12 py-4 text-right outline-none transition-all duration-300"
                        />
                        <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-white/90 text-right">
                        מספר טלפון <span className="text-babun-accent">*</span>
                      </label>
                      <div className="relative">
                        <input 
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="050-0000000"
                          className="w-full bg-white/5 hover:bg-white/10 focus:bg-white text-white focus:text-babun-primary border border-white/15 focus:border-babun-accent rounded-babun-md px-12 py-4 text-right outline-none transition-all duration-300"
                        />
                        <Phone size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-white/90 text-right">
                      כתובת מייל (בלתי חובה)
                    </label>
                    <div className="relative">
                      <input 
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="yourname@gmail.com"
                        className="w-full bg-white/5 hover:bg-white/10 focus:bg-white text-white focus:text-babun-primary border border-white/15 focus:border-babun-accent rounded-babun-md px-12 py-4 text-left outline-none transition-all duration-300"
                      />
                      <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                    </div>
                  </div>

                  {/* Topic / Message */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-white/90 text-right">
                      על מה תרצה לדבר? <span className="text-white/60 font-light">(בקצרה)</span>
                    </label>
                    <div className="relative">
                      <textarea 
                        name="message"
                        rows={3}
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="למשל: בוחנים רכישת דירת 4 חדרים בשכונה..."
                        className="w-full bg-white/5 hover:bg-white/10 focus:bg-white text-white focus:text-babun-primary border border-white/15 focus:border-babun-accent rounded-babun-md px-12 py-4 text-right outline-none transition-all duration-300 resize-none"
                      />
                      <MessageSquare size={18} className="absolute right-4 top-4 text-white/40 pointer-events-none" />
                    </div>
                  </div>

                  {/* Submit button */}
                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-babun-accent hover:bg-white text-babun-primary font-bold py-5 px-8 rounded-babun-md transition-all duration-300 flex items-center justify-center gap-3 shadow-lg cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-babun-primary border-t-transparent" />
                          <span>שולח...</span>
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          <span>קבע פגישה עכשיו</span>
                        </>
                      )}
                    </button>
                    <p className="text-center text-white/40 text-xs mt-4">
                      כל פנייה ← אנחנו חוזרים תוך 24 שעות
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
