import { motion } from "motion/react";
import { Book as BookIcon, CheckCircle, ShoppingCart, MessageCircle, Star, ShieldCheck, Bookmark } from "lucide-react";
import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Book() {
  const [status, setStatus] = useState<null | "loading" | "success">(null);
  const [formData, setFormData] = useState({ name: "", address: "", phone: "" });

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await addDoc(collection(db, "book_orders"), { ...formData, createdAt: serverTimestamp() });
      setStatus("success");
    } catch (e) {
      console.error(e);
      setStatus(null);
    }
  };

  const whatYouLearn = [
    "איך עובדת המשכנתא - מה שהבנק לא מסביר",
    "מה זה \"מחיר למשתכן\" ואיך לא לפספס",
    "קבוצות רכישה - מתי כדאי ומתי לברוח",
    "תמ\"א 38 / פינוי-בינוי - מה שווה לדעת",
    "ניהול משא ומתן - מה לשאול ומה לא לחתום",
    "מיסוי נדל\"ן - מה שאפשר לחסוך"
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* PAGE HERO - VIDEO HEADER */}
      <section className="relative h-[40vh] md:h-[60vh] w-full overflow-hidden">
        {/* Background Video Holder */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/80 z-10" />
          <iframe 
            className="w-full h-full scale-[1.3] md:scale-[1.5] pointer-events-none"
            src="https://www.youtube.com/embed/ZtiNxcUOgeI?autoplay=1&mute=1&loop=1&playlist=ZtiNxcUOgeI&controls=0&rel=0&modestbranding=1" 
            title="background video"
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          ></iframe>
        </div>

        {/* Content Overlay */}
        <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl"
          >
            <h1 className="text-6xl md:text-9xl font-display font-black text-white mb-6 tracking-tighter leading-none drop-shadow-2xl">
              שליש <span className="text-babun-accent">בקרקע</span>
            </h1>
            <p className="text-2xl md:text-5xl font-display font-black text-white leading-tight drop-shadow-xl">
              בהירות והכוונה בעולם הנדל״ן
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-32 pb-24 space-y-24">
             <section>
                <div className="max-w-4xl mx-auto">
                   <h3 className="text-4xl font-display font-black text-babun-primary mb-10 tracking-tight text-right">על הספר.</h3>
                   <div className="text-xl text-babun-primary/70 leading-relaxed font-light space-y-8 text-right">
                      <p>כתבתי את הספר הזה אחרי שנים של ניתוחים, כתבות, וייעוצים. שוב ושוב נתקלתי באותן שאלות - מאנשים חכמים שפשוט לא ידעו.</p>
                      <p>"שליש בקרקע" נותן לך את המשקפיים המקצועיים. לא כדי שתהיה מומחה - כדי שלא יוכלו לרמות אותך.</p>
                   </div>
                </div>
             </section>

             <section className="text-right">
                <div className="flex items-center justify-between flex-row-reverse mb-12 border-b border-babun-primary/5 pb-4">
                   <h3 className="text-3xl font-display font-black text-babun-primary tracking-tight">מה תלמד?</h3>
                   <Bookmark className="text-babun-accent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                   {whatYouLearn.map((text, i) => (
                      <div key={i} className="flex items-center gap-6 justify-end group">
                         <span className="text-lg font-light text-babun-primary/70 group-hover:text-babun-primary transition-colors text-right">{text}</span>
                         <div className="w-10 h-10 bg-babun-accent/10 rounded-full flex items-center justify-center shrink-0">
                            <CheckCircle size={18} className="text-babun-accent" />
                         </div>
                      </div>
                   ))}
                </div>
             </section>
      </div>
    </div>
  );
}
