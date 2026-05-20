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
      <section className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden">
        {/* Background Video Holder */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/60 z-10" />
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
              שליש <span className="text-babun-accent italic">בקרקע</span>
            </h1>
            <p className="text-2xl md:text-5xl font-display font-black text-white leading-tight drop-shadow-xl">
              בהירות והכוונה בעולם הנדל״ן
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-32 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          <div className="lg:col-span-12 xl:col-span-8 order-2 xl:order-1 text-right space-y-24">
             <section className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div className="order-2 md:order-1">
                   <h3 className="text-4xl font-display font-black text-babun-primary mb-10 tracking-tight">על הספר.</h3>
                   <div className="text-xl text-babun-primary/70 leading-relaxed font-light space-y-8">
                      <p>כתבתי את הספר הזה אחרי שנים של ניתוחים, כתבות, וייעוצים. שוב ושוב נתקלתי באותן שאלות - מאנשים חכמים שפשוט לא ידעו.</p>
                      <p>"שליש בקרקע" נותן לך את המשקפיים המקצועיים. לא כדי שתהיה מומחה - כדי שלא יוכלו לרמות אותך.</p>
                   </div>
                </div>
                <div className="order-1 md:order-2">
                   <div className="aspect-[3/4] bg-babun-primary grayscale shadow-2xl rounded-babun-lg relative overflow-hidden group">
                      <img src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
                      <div className="absolute inset-0 bg-gradient-to-t from-babun-primary to-transparent" />
                      <div className="absolute bottom-10 right-10 left-10 text-white">
                         <div className="text-4xl font-display font-black text-babun-accent mb-2">148</div>
                         <div className="text-xs uppercase tracking-widest font-bold opacity-60">דפים של ידע מזוקק</div>
                      </div>
                   </div>
                </div>
             </section>

             <section>
                <div className="flex items-center justify-between flex-row-reverse mb-12 border-b border-babun-primary/5 pb-4">
                   <h3 className="text-3xl font-display font-black text-babun-primary tracking-tight">מה תלמד?</h3>
                   <Bookmark className="text-babun-accent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                   {whatYouLearn.map((text, i) => (
                      <div key={i} className="flex items-center gap-6 justify-end group">
                         <span className="text-lg font-light text-babun-primary/70 group-hover:text-babun-primary transition-colors">{text}</span>
                         <div className="w-10 h-10 bg-babun-accent/10 rounded-full flex items-center justify-center shrink-0">
                            <CheckCircle size={18} className="text-babun-accent" />
                         </div>
                      </div>
                   ))}
                </div>
             </section>
          </div>

          <aside className="lg:col-span-12 xl:col-span-4 order-1 xl:order-2">
             <div className="sticky top-32">
                <div className="bg-white p-10 md:p-14 shadow-2xl border border-babun-accent/30 rounded-babun-lg text-right">
                   <div className="flex justify-between items-center flex-row-reverse mb-10">
                      <div>
                         <h2 className="text-3xl font-display font-black text-babun-primary mb-1 leading-none">הזמנת הספר</h2>
                         <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Buy the book</p>
                      </div>
                      <div className="text-4xl font-display font-black text-babun-accent">₪149</div>
                   </div>

                   <div className="space-y-6 mb-12">
                      <div className="flex items-center gap-4 justify-end text-sm font-bold text-babun-primary/50">
                         <span>משלוח: ₪50 (לא כולל)</span>
                         <ShieldCheck size={18} className="text-babun-accent" />
                      </div>
                      <div className="flex items-center gap-4 justify-end text-sm font-bold text-babun-primary/50">
                         <span>תמיכה מלאה ברכישה</span>
                         <ShoppingCart size={18} className="text-babun-accent" />
                      </div>
                   </div>

                   {status === "success" ? (
                      <div className="text-center py-12 bg-babun-accent/10 border border-babun-accent rounded-babun-md">
                         <h4 className="font-bold text-babun-primary mb-2">הזמנתך התקבלה!</h4>
                         <p className="text-xs opacity-60">ניצור קשר להשלמת התשלום והמשלוח.</p>
                      </div>
                   ) : (
                      <form onSubmit={handleOrder} className="space-y-8">
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest block">שם מלא</label>
                            <input 
                              required
                              className="input-babun w-full text-right"
                              value={formData.name}
                              onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest block">כתובת למשלוח</label>
                            <input 
                              required
                              className="input-babun w-full text-right"
                              value={formData.address}
                              onChange={e => setFormData({...formData, address: e.target.value})}
                            />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest block">טלפון</label>
                            <input 
                              required
                              className="input-babun w-full text-left"
                              value={formData.phone}
                              onChange={e => setFormData({...formData, phone: e.target.value})}
                            />
                         </div>
                         <button 
                           disabled={status === "loading"}
                           className="w-full btn-babun-primary justify-center py-6 uppercase tracking-[0.3em] font-black text-[11px] shadow-2xl"
                         >
                           {status === "loading" ? "מעבד..." : "הזמן עכשיו"}
                         </button>
                      </form>
                   )}
                   
                   <div className="mt-12 text-center pt-8 border-t border-babun-primary/5">
                      <p className="text-[10px] font-bold opacity-30 leading-relaxed uppercase tracking-widest">הספר שהפך ידע מקצועי לשפה של כולם.</p>
                   </div>
                </div>
             </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
