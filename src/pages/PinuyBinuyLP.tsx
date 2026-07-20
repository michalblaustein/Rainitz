import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  Check, 
  Loader2, 
  ChevronDown, 
  Mail, 
  Phone, 
  User, 
  Clock, 
  BookOpen, 
  Award, 
  Users, 
  CheckCircle2,
  FileText
} from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { syncLeadToBackend } from "../lib/leadSync";

export default function PinuyBinuyLP() {
  const [formStatus, setFormStatus] = useState<null | "success" | "loading" | "error">(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: ""
  });

  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
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
    if (!formData.name || !formData.phone || !formData.email) {
      alert("אנא מלאו את כל שדות החובה");
      return;
    }
    setFormStatus("loading");
    try {
      // 1. Save to Firestore backup
      await addDoc(collection(db, "leads"), {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        message: formData.message || "נרשם דרך עמוד נחיתה - פינוי בינוי",
        subject: "דף נחיתה - קורס פינוי בינוי",
        source: "lp-pinuy-binuy",
        createdAt: serverTimestamp()
      });

      // 2. Synchronize with backend (Plando & Email notification)
      await syncLeadToBackend({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        message: formData.message || "נרשם דרך עמוד נחיתה - פינוי בינוי",
        source: "דף נחיתה - קורס פינוי בינוי",
        tag: "דף נחיתה פינוי בינוי"
      });

      setFormStatus("success");
      setFormData({ name: "", phone: "", email: "", message: "" });
    } catch (err) {
      console.error("Error submitting lead:", err);
      try {
        handleFirestoreError(err, OperationType.WRITE, "leads");
      } catch (e) {}
      setFormStatus("error");
    }
  };

  const metrics = [
    {
      value: "18",
      text: "שנים של פגישות ייעוץ"
    },
    {
      value: "2000+",
      text: "משפחות שליווינו לרכישה בטוחה"
    },
    {
      value: "60",
      text: "דקות שנותנות לך תמונה בהירה"
    },
    {
      value: "12",
      text: "קורסים שלימדו את רזי סודות הנדל״ן"
    }
  ];

  const lessons = [
    {
      number: "1",
      title: "להבין את המשחק לפני שנכנסים אליו",
      topics: [
        { title: "המנגנון הכלכלי:", desc: "מי מרוויח ממה ואיך הכל עובד בפועל" },
        { title: "מפת הדרכים והאחריות:", desc: "משלב הרעיון ועד המסירה בדלת" },
        { title: "יזם אמיתי מול יזם מתחזה ומנצל:", desc: "איך מזהים את ההבדל" },
        { title: "נקודת המפנה הדרמטית:", desc: "מה קורה ביום שהתכנית מאושרת" },
        { title: "מתי ערך הנכס קופץ ומתי הוא עומד במקום" }
      ]
    },
    {
      number: "2",
      title: "המדריך הלא מתנצל של השקעה בהתחדשות עירונית",
      topics: [
        { title: "תמחור:", desc: "לא קונים חלום. קונים שלב" },
        { title: "הגורם שהכי מהרס עסקאות:", desc: "המון וכיצד מונעים אותו" },
        { title: "ארבעת הפוזיציות שאף יזם לא יספר לכם,", desc: "כולל מבוא לחוק 21" },
        { title: "בדיקת הנכס הספציפי שלכם:", desc: "כיווני אוויר, שלב ביצוע ומה שביניהם" },
        { title: "צ'ק ליסט יישומי:", desc: "השאלות לשאול לפני שחותמים על חוזה" },
        { title: "מתי עדיף לוותר על העסקה לגמרי" }
      ]
    }
  ];

  const targetAudiences = [
    "בעלי דירות במתחמי התחדשות",
    "משקיעים שמתעניינים ברכישה",
    "זוגות שרוצים לקנות בפרויקט פינוי בינוי",
    "כל מי ששמע \"פינוי בינוי\" ולא הבין מה זה"
  ];

  const faqs = [
    {
      q: "האם הקורס מתאים לי אם עוד לא קניתי?",
      a: "בהחלט! הקורס נועד בדיוק כדי לתת לכם את הכלים והידע המלאים לזהות הזדמנויות רכישה נכונות בשלבים הנכונים, בשביל שלא תרכשו 'חתול בשק' ותדעו לבחור את העסקה הכי מדויקת עבורכם."
    },
    {
      q: "האם אפשר להצטרף באמצע סדנה?",
      a: "התכנים מובנים ומסודרים בצורה כרונולוגית שיטתית, ולכן מומלץ להתחיל מהתחלה. עם זאת, כל המפגשים והחומרים מוקלטים ונגישים במלואם לחברי הקורס."
    },
    {
      q: "יש קורס דיגיטלי?",
      a: "כן! הקורס זמין בגרסה דיגיטלית מתקדמת עם גישה מיידית לכל תכני הווידאו, המחשבונים המקצועיים, והצ'קליסטים היישומיים כדי שתוכלו ללמוד בזמן ובקצב שלכם."
    },
    {
      q: "האם הקורס מתאים לאנשי מקצוע?",
      a: "הקורס מציג מידע מעשי רחב ערך, סודות משפטיים וניתוחים כלכליים שגם מתווכים, משקיעים מנוסים ויועצי משכנתאות מעידים ששינו להם את נקודת המבט על עסקאות התחדשות עירונית."
    },
    {
      q: "כמה משתתפים בקבוצה?",
      a: "אנחנו שומרים על קבוצות קטנות ואינטימיות כדי לאפשר לכל משתתף לקבל מענה אישי, לשאול שאלות על הנכסים והתלבטויות שלו, ולהפיק את המרב מהסדנה המעשית."
    }
  ];

  return (
    <div className="bg-white min-h-screen relative text-right overflow-x-hidden select-none" dir="rtl">
      
      {/* 1. HERO HEADER SECTION */}
      <section className="bg-babun-primary text-white pt-10 pb-20 relative overflow-hidden">
        {/* Subtle architectural grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#fee00010_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-60 z-0 pointer-events-none" />
        <div className="absolute top-0 right-0 left-0 h-40 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Logo bar inside page */}
          <div className="flex justify-between items-center mb-16">
            <div /> {/* spacing */}
            <div className="flex items-center gap-3">
              <img 
                src="https://lh3.googleusercontent.com/d/1TtktR-B0LsjkNXjvcdUP8JPkZye4U8Ks" 
                alt="מרכז רייניץ לנדלן" 
                className="h-16 md:h-20 w-auto"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Right Side: Headline and pitch */}
            <div className="lg:col-span-7 flex flex-col items-start gap-8 order-2 lg:order-1">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-black leading-tight text-white tracking-tight">
                בפינוי־בינוי, <span className="text-babun-accent">הרווח נקבע</span>
                <br />
                לא רק מהפרויקט,
                <br />
                אלא בעיקר{" "}
                <span className="relative inline-block px-3 py-1.5 border-2 border-babun-accent text-babun-accent font-black rounded-lg transform -skew-x-3 mx-1 my-1">
                  במחיר הרכישה
                </span>
                <br />
                ביחס לשלב ההתקדמות שלו.
              </h1>

              <button 
                onClick={scrollToForm}
                className="group bg-babun-accent text-babun-primary font-black text-xl px-10 py-5 rounded-babun-md hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 shadow-2xl flex items-center gap-3 cursor-pointer mt-4"
              >
                <span>להרשמה</span>
                <span className="text-2xl group-hover:translate-x-[-4px] transition-transform duration-300">{"<"}</span>
              </button>
            </div>

            {/* Left Side: Portrait Photo with Badge */}
            <div className="lg:col-span-5 flex justify-center items-center relative order-1 lg:order-2">
              <div className="relative w-80 h-80 md:w-96 md:h-96">
                <div className="absolute inset-0 rounded-full overflow-hidden bg-black shadow-inner pointer-events-none">
                  <iframe 
                    src="https://www.youtube.com/embed/i6-AD36z860?autoplay=1&mute=1&loop=1&playlist=i6-AD36z860&controls=0&modestbranding=1&playsinline=1&rel=0&showinfo=0&iv_load_policy=3" 
                    title="יעקב רייניץ - סרטון הסבר"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    style={{ 
                      position: 'absolute',
                      top: '0',
                      left: '-38.89%',
                      width: '177.78%',
                      height: '100%'
                    }}
                  />
                </div>

                {/* Left side circular rating badge */}
                <div className="absolute bottom-6 right-4 bg-white text-babun-primary py-2.5 px-4 rounded-babun-md shadow-xl border border-gray-100 flex flex-col items-center">
                  <span className="text-2xl font-black text-babun-primary">2000+</span>
                  <span className="text-[10px] font-bold text-gray-500 tracking-wider">משפחות מיועצות</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. STATS / METRICS SECTION */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-black text-babun-primary mb-3">
              מרכז רייניץ <span className="text-babun-accent bg-babun-primary px-3 py-1.5 rounded-babun-sm inline-block">במספרים</span>
            </h2>
            <div className="h-1 w-16 bg-babun-accent mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {metrics.map((m, index) => (
              <div key={index} className="flex flex-col items-center text-center p-6 bg-gray-50/50 rounded-babun-md border border-gray-50/50 hover:bg-gray-50 transition-colors duration-200">
                <span className="text-5xl md:text-7xl font-display font-black text-babun-primary tracking-tight mb-2">
                  {m.value}
                </span>
                <span className="text-sm sm:text-base md:text-lg text-gray-600 font-medium leading-relaxed whitespace-nowrap">
                  {m.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SYLLABUS / COURSE CURRICULUM */}
      <section className="py-24 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-black text-babun-primary mb-4">
              קורס מעשי בנושא פינוי בינוי
            </h2>
            <div className="h-1.5 w-24 bg-babun-accent mx-auto rounded-full mb-6" />
            <p className="text-xl md:text-2xl font-bold text-gray-700 font-display">
              - מה נלמד? -
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {lessons.map((lesson, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-babun-lg p-8 md:p-10 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
              >
                {/* Yellow accent tag floating */}
                <div className="absolute top-0 right-0 left-0 h-2 bg-babun-accent" />

                {/* Lesson number badge */}
                <div className="flex justify-between items-center mb-8">
                  <div className="bg-babun-accent text-babun-primary text-sm font-black w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-md">
                    <span className="text-[10px] leading-none uppercase font-bold text-babun-primary/75">שיעור</span>
                    <span className="text-lg leading-none mt-0.5">{lesson.number}</span>
                  </div>
                </div>

                <h3 className="text-2xl md:text-3xl font-display font-black text-babun-primary mb-8 leading-snug">
                  {lesson.title}
                </h3>

                <ul className="space-y-6">
                  {lesson.topics.map((topic, tIdx) => (
                    <li key={tIdx} className="flex gap-4 items-start">
                      <div className="w-6 h-6 rounded-full bg-babun-accent/10 border border-babun-accent flex items-center justify-center flex-shrink-0 mt-1">
                        <Check size={12} className="text-babun-primary stroke-[3px]" />
                      </div>
                      <div className="text-base md:text-lg text-gray-700 leading-relaxed">
                        {topic.title && <strong className="font-bold text-babun-primary">{topic.title} </strong>}
                        {topic.desc && <span className="text-gray-600">{topic.desc}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <button 
              onClick={scrollToForm}
              className="group bg-babun-accent text-babun-primary font-black text-xl px-10 py-5 rounded-babun-md hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 shadow-xl flex items-center gap-3 cursor-pointer mx-auto"
            >
              <span>להרשמה</span>
              <span className="text-2xl group-hover:translate-x-[-4px] transition-transform duration-300">{"<"}</span>
            </button>
          </div>

        </div>
      </section>

      {/* 4. WHO IS THIS FOR? SECTION */}
      <section className="bg-babun-primary text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=50')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-display font-black text-babun-accent mb-16">
            למי זה מיועד?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
            {targetAudiences.map((tag, index) => (
              <div 
                key={index}
                className="w-56 h-56 rounded-full border-4 border-babun-accent bg-babun-accent text-babun-primary flex items-center justify-center p-6 text-center shadow-2xl hover:scale-105 hover:bg-transparent hover:text-babun-accent transition-all duration-300 cursor-default group"
              >
                <span className="text-xl font-display font-black leading-snug">
                  {tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. QUOTE SECTION (Yellow highlight band) */}
      <section className="bg-babun-accent text-babun-primary py-12 border-y-4 border-babun-primary/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl md:text-2xl lg:text-3xl font-display font-black leading-relaxed max-w-4xl mx-auto">
            "לעולם ישליש אדם את מעותיו: שליש בקרקע, ושליש בפרקמטיא (מסחר/עסקים), ושליש תחת ידו (מזומן זמין).*"
          </p>
          <p className="text-sm md:text-base font-bold text-babun-primary/70 mt-4 tracking-wide font-sans">
            תלמוד בבלי, מסכת בבא מציעא, דף מ"ב, עמוד א.
          </p>
        </div>
      </section>

      {/* 6. ABOUT THE EXPERT SECTION */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Right side text columns */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-3xl md:text-5xl font-display font-black text-babun-primary">
                על יעקב רייניץ
              </h2>
              <h3 className="text-xl md:text-2xl font-bold text-babun-accent bg-babun-primary/95 inline-block px-5 py-2.5 rounded-babun-sm">
                עיתונאי כלכלי שהפך למומחה נדל"ן. מומחה שהפך לשליחות.
              </h3>
              
              <div className="text-base md:text-lg text-gray-600 leading-relaxed space-y-4">
                <p>
                  התחלתי כעיתונאי כלכלי - כיסיתי את שוק הנדל"ן הסוער והמבלבל מכל כיוון. הבנתי די מהר שבלעדי המילים והמדדים שכתבתי, הציבור בארץ לא רואה או מבין לעומק ראיונות יתר מדי פעמים מה קורה כשנושאים מורכבים עולים לדיונים ללא כל ידע קודם.
                </p>
                <p>
                  כשהעברתי באופן רשמי למחקר וייעוץ אישי, הבנתי אמת פשוטה: הבעיה העיקרית היא איננה קיומם של אדמות, דונמים והדרישות בשוק. הבעיה המרכזית היא חוסר הוודאות של יזמים מקומיים שמעבר לעוד מפרט מנסים להתקבל בדלת הבנק.
                </p>
              </div>

              {/* Callout box */}
              <div className="border-r-4 border-babun-accent bg-babun-accent/5 p-6 rounded-babun-md md:text-lg text-gray-900 font-bold leading-relaxed shadow-sm">
                "הנוף המוכר שלי כ'חסידי', הספר שכתבתי "שליש בקרקע" והקורסים שאני מעביר כיום - כולם קיימים עם מטרה אחת ברורה ובלעדית: שגם אתה תוכל לרכוש נדל"ן מתוך הבנה המונעת מחשש ומידע נכונה."
              </div>

              <p className="text-base md:text-lg text-gray-500 italic mt-4 leading-relaxed">
                אני לא מבטיח 'כסף קל', 'רווח מהיר' או להפוך כל אחד ליזם נדל"ן בין לילה. אני כן מתחייב לתת כוח וידע מעשי שיחליף את חוסר האונים ויקבוץ דרך נכונה ואחת בלבד: האם זה נכון ומדויק עבורך.
              </p>
            </div>

            {/* Left side circular photo and badge */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <div className="relative w-72 h-72 md:w-80 md:h-80">
                <div className="absolute inset-0 rounded-full border-4 border-babun-accent border-solid" />
                <div className="absolute inset-2.5 rounded-full overflow-hidden bg-babun-accent/20">
                  <img 
                    src="https://lh3.googleusercontent.com/d/1wzfE5sZMtpfnHN39XgYqYtvsHanSB_vn" 
                    alt="יעקב רייניץ" 
                    className="w-[125%] h-auto max-w-none object-cover absolute bottom-0 right-[50%] translate-x-[50%] scale-102"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Floating Badge */}
                <div className="absolute -bottom-4 right-[50%] translate-x-[50%] bg-white text-babun-primary py-2 px-6 rounded-babun-md shadow-lg border border-gray-100 flex flex-col items-center whitespace-nowrap">
                  <span className="text-xl font-black text-babun-primary">+18 שנים</span>
                  <span className="text-[10px] font-bold text-gray-500 tracking-wider">ניסיון והתמחות בשטח</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-black text-babun-primary">
              שאלות נפוצות
            </h2>
            <div className="h-1.5 w-20 bg-babun-accent mx-auto rounded-full mt-4" />
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-babun-md shadow-sm border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full text-right px-6 py-5 flex justify-between items-center gap-4 hover:bg-gray-50/50 transition-colors"
                >
                  <span className="text-lg font-bold text-babun-primary font-display">
                    {faq.q}
                  </span>
                  <ChevronDown 
                    className={`text-babun-primary transition-transform duration-300 flex-shrink-0 ${
                      activeFaq === idx ? "rotate-180" : ""
                    }`} 
                    size={20}
                  />
                </button>

                <AnimatePresence>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-gray-50"
                    >
                      <div className="px-6 py-5 text-gray-600 text-base leading-relaxed bg-white/50">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8. FORM / CALL TO ACTION (Yellow Background Footer Form) */}
      <section ref={formRef} id="register-form" className="bg-[#fee000] text-babun-primary py-24 scroll-mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Title Right Side */}
            <div className="lg:col-span-6 flex flex-col items-start gap-4">
              <h2 className="text-4xl md:text-6xl font-display font-black text-babun-primary tracking-tight leading-none">
                מספיק לשמוע סיפורים
              </h2>
              <p className="text-xl md:text-2xl font-bold font-display text-babun-primary/90">
                הגיע הזמן להבין את העסקה לפני שנכנסים אליה
              </p>
            </div>

            {/* Form Left Side */}
            <div className="lg:col-span-6">
              <div className="bg-white/80 backdrop-blur-md rounded-babun-lg p-8 md:p-10 shadow-2xl border border-white/50 relative">
                
                <AnimatePresence mode="wait">
                  {formStatus === "success" ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center justify-center text-center py-8"
                    >
                      <div className="w-16 h-16 bg-babun-primary text-babun-accent rounded-full flex items-center justify-center mb-6 shadow-xl leading-none">
                        <Check size={36} className="stroke-[3.5px]" />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-display font-black text-babun-primary mb-3">
                        תודה רבה!
                      </h3>
                      <p className="text-gray-600 text-lg">
                        פרטיכם התקבלו בהצלחה. ניצור עמכם קשר בהקדם האפשרי.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.form 
                      onSubmit={handleSubmit}
                      className="space-y-6"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {/* Name input */}
                      <div>
                        <label className="block text-sm font-bold text-babun-primary mb-2">
                          שם מלא <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute right-4 top-[50%] translate-y-[-50%] text-gray-400">
                            <User size={18} />
                          </span>
                          <input 
                            type="text" 
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="ישראל ישראלי" 
                            className="w-full bg-white border border-gray-200 rounded-babun-md pr-12 pl-4 py-4 outline-none focus:border-babun-primary font-medium text-babun-primary shadow-sm"
                          />
                        </div>
                      </div>

                      {/* Phone input */}
                      <div>
                        <label className="block text-sm font-bold text-babun-primary mb-2">
                          מספר טלפון <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute right-4 top-[50%] translate-y-[-50%] text-gray-400">
                            <Phone size={18} />
                          </span>
                          <input 
                            type="tel" 
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="050-0000000" 
                            className="w-full bg-white border border-gray-200 rounded-babun-md pr-12 pl-4 py-4 outline-none focus:border-babun-primary font-medium text-babun-primary shadow-sm"
                          />
                        </div>
                      </div>

                      {/* Email input */}
                      <div>
                        <label className="block text-sm font-bold text-babun-primary mb-2">
                          כתובת מייל <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute right-4 top-[50%] translate-y-[-50%] text-gray-400">
                            <Mail size={18} />
                          </span>
                          <input 
                            type="email" 
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="yourname@gmail.com" 
                            className="w-full bg-white border border-gray-200 rounded-babun-md pr-12 pl-4 py-4 outline-none focus:border-babun-primary font-medium text-babun-primary shadow-sm"
                          />
                        </div>
                      </div>

                      {/* Textarea note */}
                      <div>
                        <label className="block text-sm font-bold text-babun-primary mb-2">
                          על מה תרצו לדבר?
                        </label>
                        <div className="relative">
                          <textarea 
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            rows={3}
                            placeholder="למשל: בוחנים רכישת דירה 4 חדרים בשכונה..." 
                            className="w-full bg-white border border-gray-200 rounded-babun-md px-4 py-4 outline-none focus:border-babun-primary font-medium text-babun-primary shadow-sm resize-none"
                          />
                        </div>
                      </div>

                      {/* Submit */}
                      <button 
                        type="submit"
                        disabled={formStatus === "loading"}
                        className="w-full bg-babun-primary text-white font-black text-lg py-4 px-8 rounded-babun-md transition-all duration-300 hover:bg-black/90 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                      >
                        {formStatus === "loading" ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            <span>שולח...</span>
                          </>
                        ) : (
                          <>
                            <span>שליחת פרטים</span>
                            <ArrowLeft size={18} />
                          </>
                        )}
                      </button>

                      {formStatus === "error" && (
                        <p className="text-red-600 text-sm font-bold text-center mt-2">
                          אירעה שגיאה בשליחת הטופס. אנא נסו שוב.
                        </p>
                      )}

                    </motion.form>
                  )}
                </AnimatePresence>

              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
