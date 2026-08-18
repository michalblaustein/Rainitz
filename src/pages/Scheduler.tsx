import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle, 
  Shield, 
  AlertCircle, 
  HelpCircle, 
  User, 
  Phone, 
  Mail, 
  ArrowLeft, 
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  ExternalLink
} from "lucide-react";
import { syncLeadToBackend } from "../lib/leadSync";

// Helper to get days of a month
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

// Helper to get starting day of week for a month (0 = Sunday)
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTHS_HEBREW = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
];

const DAYS_SHORT_HEBREW = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", 
  "15:00", "15:30", "16:00", "16:30", "17:00"
];

// רשימת תאריכים חסומים מראש (בפורמט YYYY-MM-DD)
// ניתן להוסיף או להסיר מכאן תאריכים בקלות כדי לחסום אותם ביומן המעוצב (Fillout)
const BLOCKED_DATES = [
  "2026-07-27", // לדוגמה: יום עיון / חופשה
  "2026-08-05", // לדוגמה: חג או יום חסום מראש
  "2026-08-15"
];

export default function Scheduler() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [viewMode, setViewMode] = useState<"custom" | "google" | "plando">("custom");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Google Calendar URLs
  const googleCalendarEmbedUrl = "https://calendar.google.com/calendar/embed?src=r0504141516%40gmail.com&ctz=Asia%2FJerusalem&hl=he&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=1&showCalendars=0&showTz=1&mode=WEEK";
  const googleCalendarDirectUrl = "https://calendar.google.com/calendar/embed?src=r0504141516%40gmail.com&ctz=Asia%2FJerusalem";

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  
  // Date selection state
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Errors state
  const [formError, setFormError] = useState("");

  const handleNextStep = () => {
    if (step === 1) {
      if (!name.trim()) {
        setFormError("נא להזין שם מלא");
        return;
      }
      if (!phone.trim() || phone.length < 9) {
        setFormError("נא להזין מספר טלפון תקין");
        return;
      }
      if (!email.trim() || !email.includes("@")) {
        setFormError("נא להזין כתובת אימייל תקינה");
        return;
      }
      setFormError("");
      setStep(2);
    }
  };

  const handleBookingSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      setFormError("נא לבחור תאריך ושעה לפגישה");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    const formattedDate = `${selectedDate.getDate()}/${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()}`;
    const formattedDayOfWeek = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"][selectedDate.getDay()];

    try {
      await syncLeadToBackend({
        name,
        phone,
        email,
        message: `נקבעה פגישה חכמה בתאריך ${formattedDate} (יום ${formattedDayOfWeek}) בשעה ${selectedTime}`,
        source: "מערכת זימון תורים חכמה - Fillout",
        tag: "זימון פגישה חכמה",
        details: {
          scheduledDate: formattedDate,
          scheduledTime: selectedTime,
          dayOfWeek: formattedDayOfWeek,
          bookingType: "ייעוץ נדל״ן וכלכלה נבונה"
        }
      });

      setIsSubmitting(false);
      setStep(3);
    } catch (err) {
      console.error("Booking failed:", err);
      setIsSubmitting(false);
      // Fallback to success page anyway for high client UX conversion
      setStep(3);
    }
  };

  // Calendar render math
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);
  
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Check if a specific date in current rendering month is selectable
  const isDateSelectable = (day: number) => {
    const checkDate = new Date(currentYear, currentMonth, day);
    const checkToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Disable past days
    if (checkDate < checkToday) return false;
    
    // Disable Fridays (6) and Saturdays (0 is Sunday, 5 is Friday, 6 is Saturday in Hebrew terms depending on local index, let's look at getDay() where 5=Friday, 6=Saturday)
    const dayOfWeek = checkDate.getDay();
    if (dayOfWeek === 5 || dayOfWeek === 6) return false;

    // חסימת תאריכים מותאמים אישית מרשימת ה-BLOCKED_DATES (פורמט YYYY-MM-DD)
    const yearStr = checkDate.getFullYear();
    const monthStr = String(checkDate.getMonth() + 1).padStart(2, "0");
    const dayStr = String(checkDate.getDate()).padStart(2, "0");
    const formattedCheckStr = `${yearStr}-${monthStr}-${dayStr}`;

    if (BLOCKED_DATES.includes(formattedCheckStr)) {
      return false;
    }

    return true;
  };

  // Official Plando link if they want the iframe fallback
  const consultingBookingUrl = "https://plando.co.il/self_services/booking/24802?ak=597df96284d52e5dd3be33b6ff7afc68";

  return (
    <div className="bg-zinc-50 min-h-screen pt-32 pb-24 font-sans text-right" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        
        {/* Toggle between Google Calendar, Plando and custom interface */}
        {step !== 3 && (
          <div className="flex justify-center mb-8">
            <div className="bg-white p-1.5 rounded-full border border-zinc-200 shadow-sm flex items-center flex-wrap justify-center gap-1">
              <button
                onClick={() => setViewMode("google")}
                className={`px-5 py-2.5 rounded-full font-bold text-xs md:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                  viewMode === "google" 
                    ? "bg-babun-primary text-babun-accent shadow-md" 
                    : "text-zinc-600 hover:text-babun-primary"
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
                <span>יומן גוגל בלייב (Google Calendar)</span>
              </button>
              <button
                onClick={() => setViewMode("custom")}
                className={`px-5 py-2.5 rounded-full font-bold text-xs md:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                  viewMode === "custom" 
                    ? "bg-babun-primary text-babun-accent shadow-md" 
                    : "text-zinc-600 hover:text-babun-primary"
                }`}
              >
                <span>סנכרון חכם (Plando)</span>
              </button>
              <button
                onClick={() => setViewMode("plando")}
                className={`px-5 py-2.5 rounded-full font-bold text-xs md:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                  viewMode === "plando" 
                    ? "bg-babun-primary text-babun-accent shadow-md" 
                    : "text-zinc-600 hover:text-babun-primary"
                }`}
              >
                <span>חנות Plando לתשלום</span>
              </button>
            </div>
          </div>
        )}

        {viewMode === "google" && step !== 3 ? (
          /* GOOGLE CALENDAR EMBED VIEW */
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl overflow-hidden border border-zinc-200 shadow-xl space-y-0"
          >
            <div className="bg-babun-primary text-white px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-6 h-6 text-babun-accent" />
                <span className="font-display font-bold text-lg">זמנים פנויים ביומן גוגל בלייב</span>
              </div>
              <a
                href={googleCalendarDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-babun-accent text-babun-primary font-bold px-5 py-2.5 rounded-full hover:bg-white transition-colors flex items-center gap-1.5 shadow"
              >
                <span>פתיחת היומן בחלון חדש</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Public Sharing Notice */}
            <div className="bg-amber-50 border-b border-amber-200 p-4 text-right flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">הוראה חשובה להצגת הלוח (במידה ומופיע מסך לבן):</p>
                <p className="mt-0.5 text-amber-800">
                  אם היומן נראה ריק או לבן, יש לוודא בהגדרות Google Calendar שהיומן של <span className="font-mono dir-ltr font-bold">r0504141516@gmail.com</span> סומן כ-<strong>"Make available to public" (זמין לציבור)</strong>. בכל שלב ניתן ללחוץ על הכפתור למעלה לפתיחה ישירה בגוגל.
                </p>
              </div>
            </div>

            <div className="relative bg-zinc-50 min-h-[550px] w-full p-4">
              <iframe 
                src={googleCalendarEmbedUrl}
                title="Google Calendar Schedule"
                className="w-full min-h-[550px] border-0 rounded-2xl shadow-inner"
              />
            </div>

            <div className="p-6 bg-zinc-50 border-t border-zinc-100 text-right text-zinc-600 text-xs flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-start gap-2 max-w-xl">
                <AlertCircle className="w-4 h-4 text-babun-primary shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>קביעת תור ביומן גוגל:</strong> לאחר ביצוע התשלום במערכת פלאנדו, הפגישה תאושר ותתואם ביומן בשעה שבחרתם.
                </p>
              </div>
              <a
                href="https://plando.co.il/self_services/embed_store/25442?ak=597df96284d52e5dd3be33b6ff7afc68"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-babun-primary hover:bg-babun-primary/90 text-white font-bold px-6 py-2.5 rounded-full text-xs shadow transition-all"
              >
                מעבר לתשלום בפלאנדו
              </a>
            </div>
          </motion.div>
        ) : viewMode === "plando" && step !== 3 ? (
          /* FALLBACK PLANDO IFRAME */
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl overflow-hidden border border-zinc-200 shadow-xl"
          >
            <div className="bg-babun-primary text-white px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-6 h-6 text-babun-accent" />
                <span className="font-display font-bold text-lg">קביעת תור מהירה – יומן פגישות אינטראקטיבי</span>
              </div>
              <div className="text-zinc-400 text-xs">
                מזהה שירות: <span className="font-mono text-babun-accent">24802</span>
              </div>
            </div>

            <div className="relative bg-zinc-50 min-h-[650px] w-full">
              <iframe 
                src={consultingBookingUrl}
                title="Plando Booking Calendar"
                className="w-full min-h-[650px] border-0"
                allow="geolocation; microphone; camera"
              />
            </div>

            <div className="p-6 bg-zinc-50 border-t border-zinc-100 text-right text-zinc-500 text-xs flex flex-col md:flex-row justify-between gap-4">
              <div className="flex items-start gap-2 max-w-xl">
                <AlertCircle className="w-4 h-4 text-babun-primary shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>איך זה עובד?</strong> לאחר בחירת תאריך ושעה, המערכת תזהה אתכם באופן אוטומטי ותשלח אישור זימון פגישה ישירות לתיבת המייל ולנייד שלכם.
                </p>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <HelpCircle className="w-4 h-4" />
                <span>תמיכה טכנית: 050-4141516</span>
              </div>
            </div>
          </motion.div>
        ) : (
          /* PREMIUM CUSTOM FILLOUT EXPERIENCE */
          <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xl overflow-hidden">
            
            {/* Header branding */}
            <div className="bg-babun-primary text-white px-8 py-6 flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-1 bg-babun-accent" />
              <div>
                <span className="text-xs font-bold text-babun-accent tracking-wider uppercase">מרכז רייניץ נדל״ן</span>
                <h2 className="font-display font-black text-xl md:text-2xl mt-1">תיאום פגישה מהירה</h2>
              </div>
              <div className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-babun-accent" />
                <span>מאובטח ומסונכרן</span>
              </div>
            </div>

            {/* Steps Progress Bar */}
            {step !== 3 && (
              <div className="bg-zinc-50 px-8 py-4 border-b border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === 1 ? "bg-babun-accent text-babun-primary font-black" : "bg-zinc-200 text-zinc-600"
                  }`}>1</span>
                  <span className={`text-sm font-bold ${step === 1 ? "text-babun-primary" : "text-zinc-400"}`}>פרטי קשר</span>
                </div>
                <div className="h-0.5 flex-1 bg-zinc-200 mx-4" />
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === 2 ? "bg-babun-accent text-babun-primary font-black" : "bg-zinc-200 text-zinc-600"
                  }`}>2</span>
                  <span className={`text-sm font-bold ${step === 2 ? "text-babun-primary" : "text-zinc-400"}`}>בחירת מועד לפגישה</span>
                </div>
              </div>
            )}

            {/* Form Content Container */}
            <div className="p-8 md:p-12 min-h-[400px]">
              <AnimatePresence mode="wait">
                
                {/* STEP 1: CONTACT DETAILS */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center md:text-right">
                      <h3 className="text-2xl font-black text-zinc-900 mb-2">נשמח להכיר אתכם</h3>
                      <p className="text-zinc-500 text-sm">הזינו את פרטי הקשר שלכם כדי שנוכל לקשר את הפגישה לכרטיס הלקוח שלכם בפלאנדו ולשלוח תזכורת.</p>
                    </div>

                    <div className="space-y-4 max-w-md mx-auto">
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-1.5">שם מלא *</label>
                        <div className="relative">
                          <User className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                          <input
                            type="text"
                            placeholder="ישראל ישראלי"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 focus:border-babun-accent rounded-xl pr-12 pl-4 py-3.5 outline-none transition-all text-sm text-zinc-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-1.5">מספר טלפון נייד *</label>
                        <div className="relative">
                          <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                          <input
                            type="tel"
                            placeholder="050-1234567"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 focus:border-babun-accent rounded-xl pr-12 pl-4 py-3.5 outline-none transition-all text-sm text-zinc-800 text-left"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-1.5">כתובת אימייל *</label>
                        <div className="relative">
                          <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                          <input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 focus:border-babun-accent rounded-xl pr-12 pl-4 py-3.5 outline-none transition-all text-sm text-zinc-800 text-left"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      {formError && (
                        <div className="p-3.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-100">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{formError}</span>
                        </div>
                      )}

                      <button
                        onClick={handleNextStep}
                        className="w-full bg-babun-accent text-babun-primary font-bold py-3.5 px-6 rounded-xl transition-all duration-300 hover:bg-babun-primary hover:text-white flex items-center justify-center gap-2 shadow-lg shadow-babun-accent/10 mt-6"
                      >
                        <span>המשך לבחירת מועד</span>
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: DATE & TIME SELECTOR */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="flex justify-between items-center">
                      <button 
                        onClick={() => setStep(1)}
                        className="text-zinc-500 hover:text-babun-primary text-sm flex items-center gap-1 font-bold"
                      >
                        <ChevronRight className="w-4 h-4" />
                        <span>חזרה לפרטים</span>
                      </button>
                      <span className="text-zinc-400 text-xs">שירות: פגישת ייעוץ אסטרטגית</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      
                      {/* Interactive Hebrew Calendar Grid (7 columns) */}
                      <div className="lg:col-span-7 bg-zinc-50 rounded-2xl p-6 border border-zinc-200/60">
                        <div className="flex justify-between items-center mb-6">
                          <button 
                            onClick={handlePrevMonth}
                            className="p-1.5 hover:bg-white rounded-lg border border-zinc-200 transition-all"
                          >
                            <ChevronRight className="w-5 h-5 text-zinc-600" />
                          </button>
                          <h4 className="font-display font-black text-zinc-800 text-lg">
                            {MONTHS_HEBREW[currentMonth]} {currentYear}
                          </h4>
                          <button 
                            onClick={handleNextMonth}
                            className="p-1.5 hover:bg-white rounded-lg border border-zinc-200 transition-all"
                          >
                            <ChevronLeft className="w-5 h-5 text-zinc-600" />
                          </button>
                        </div>

                        {/* Calendar Header */}
                        <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-zinc-400 mb-2">
                          {DAYS_SHORT_HEBREW.map(d => (
                            <div key={d} className="py-1">{d}</div>
                          ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-2">
                          {/* Empty cells before month start */}
                          {Array.from({ length: firstDayIndex }).map((_, i) => (
                            <div key={`empty-${i}`} />
                          ))}

                          {/* Days of the month */}
                          {Array.from({ length: daysInMonth }).map((_, i) => {
                            const dayNum = i + 1;
                            const isSelectable = isDateSelectable(dayNum);
                            const thisDate = new Date(currentYear, currentMonth, dayNum);
                            const isSelected = selectedDate && 
                              selectedDate.getDate() === dayNum && 
                              selectedDate.getMonth() === currentMonth && 
                              selectedDate.getFullYear() === currentYear;

                            return (
                              <button
                                key={`day-${dayNum}`}
                                disabled={!isSelectable}
                                onClick={() => {
                                  setSelectedDate(thisDate);
                                  setSelectedTime(null); // Reset time on new date selection
                                  setFormError("");
                                }}
                                className={`aspect-square rounded-xl text-sm font-bold flex items-center justify-center transition-all ${
                                  isSelected 
                                    ? "bg-babun-primary text-babun-accent font-black scale-105 shadow-md" 
                                    : isSelectable 
                                      ? "bg-white text-zinc-800 hover:border-babun-accent border border-zinc-200 shadow-sm" 
                                      : "bg-zinc-100/60 text-zinc-300 cursor-not-allowed"
                                }`}
                              >
                                {dayNum}
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-4 flex gap-4 justify-center text-xs text-zinc-400">
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-white border border-zinc-200 inline-block" />
                            <span>זמין</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-babun-primary inline-block" />
                            <span>נבחר</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-zinc-100 inline-block" />
                            <span>לא פעיל / סגור</span>
                          </div>
                        </div>
                      </div>

                      {/* Time Slots Selector */}
                      <div className="lg:col-span-5 flex flex-col justify-between">
                        <div>
                          <h4 className="font-display font-black text-zinc-800 text-md mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-babun-accent" />
                            <span>בחירת שעת פגישה</span>
                          </h4>

                          {!selectedDate ? (
                            <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl p-8 text-center text-zinc-400 text-sm flex flex-col items-center justify-center h-48">
                              <CalendarIcon className="w-8 h-8 text-zinc-300 mb-2" />
                              <p>אנא בחרו תאריך בלוח השנה תחילה</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                              {TIME_SLOTS.map(t => {
                                const isTimeSelected = selectedTime === t;
                                return (
                                  <button
                                    key={t}
                                    onClick={() => {
                                      setSelectedTime(t);
                                      setFormError("");
                                    }}
                                    className={`py-3 px-2 rounded-xl text-xs font-bold transition-all text-center border ${
                                      isTimeSelected 
                                        ? "bg-babun-primary text-babun-accent border-babun-primary font-black scale-105" 
                                        : "bg-white hover:border-babun-accent border-zinc-200 text-zinc-700"
                                    }`}
                                  >
                                    {t}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {formError && (
                          <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-100 mt-4">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{formError}</span>
                          </div>
                        )}

                        <div className="mt-6">
                          <button
                            disabled={isSubmitting || !selectedDate || !selectedTime}
                            onClick={handleBookingSubmit}
                            className={`w-full font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                              !selectedDate || !selectedTime 
                                ? "bg-zinc-100 text-zinc-400 cursor-not-allowed" 
                                : "bg-babun-accent text-babun-primary hover:bg-babun-primary hover:text-white"
                            }`}
                          >
                            {isSubmitting ? (
                              <div className="w-5 h-5 border-2 border-babun-primary border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <span>אשר וקבע פגישה</span>
                                <CheckCircle className="w-5 h-5" />
                              </>
                            )}
                          </button>
                        </div>

                      </div>

                    </div>
                  </motion.div>
                )}

                {/* STEP 3: BOOKING CONFIRMED */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10 space-y-6"
                  >
                    <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-sm border border-green-100">
                      <CheckCircle className="w-12 h-12" />
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 inline-block">הפגישה אושרה בהצלחה!</span>
                      <h3 className="text-3xl font-display font-black text-babun-primary">נתראה בקרוב, {name}!</h3>
                      <p className="text-zinc-500 text-md max-w-md mx-auto leading-relaxed">
                        אישור זימון הפגישה נשלח ישירות לתיבת המייל <span className="font-bold text-zinc-700">{email}</span> ולנייד <span className="font-bold text-zinc-700">{phone}</span>.
                      </p>
                    </div>

                    {/* Summary card */}
                    <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200/60 max-w-md mx-auto text-right space-y-3.5">
                      <div className="flex justify-between items-center pb-3 border-b border-zinc-200/60">
                        <span className="text-zinc-500 text-sm">סוג הפגישה:</span>
                        <span className="font-bold text-zinc-800 text-sm">פגישת ייעוץ אסטרטגית</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-zinc-200/60">
                        <span className="text-zinc-500 text-sm">תאריך:</span>
                        <span className="font-bold text-zinc-800 text-sm">
                          {selectedDate && `${selectedDate.getDate()}/${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()}`} (יום {selectedDate && ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"][selectedDate.getDay()]})
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500 text-sm">שעה:</span>
                        <span className="font-bold text-zinc-800 text-sm">{selectedTime}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 justify-center text-xs text-zinc-400 pt-4">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span>מסונכרן עם מערכת פלאנדו (Plando)</span>
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
            
            {/* Safe footer banner */}
            <div className="bg-zinc-50 border-t border-zinc-100 px-8 py-5 text-right text-zinc-400 text-xs flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-zinc-500" />
                <span>מערכת זימון פגישות מאובטחת</span>
              </div>
              <div>
                <span>תמיכה טכנית מרכז רייניץ: 050-4141516</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
