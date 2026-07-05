import { motion } from "motion/react";
import { Send } from "lucide-react";
import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";

export default function Contact() {
  const [formStatus, setFormStatus] = useState<null | "success" | "loading">(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "ייעוץ אישי",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("loading");
    
    try {
      await addDoc(collection(db, "leads"), {
        ...formData,
        createdAt: serverTimestamp()
      });
      setFormStatus("success");
    } catch (error) {
      console.error("Error submitting lead:", error);
      handleFirestoreError(error, OperationType.WRITE, "leads");
      setFormStatus(null);
    }
  };

  return (
    <div className="bg-babun-light min-h-screen">
      {/* PAGE HERO */}
      <section className="bg-babun-primary text-white pt-48 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 mesh-grid opacity-20 z-0" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 text-right">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8 border-b border-white/10 pb-20">
            <div className="max-w-3xl">
              <span className="inline-block text-[11px] font-bold uppercase tracking-[0.5em] text-babun-accent mb-6 px-4 py-1.5 border border-babun-accent/20 bg-babun-accent/5">
                Always Online
              </span>
              <h1 className="text-6xl md:text-8xl font-display font-black leading-[0.9] text-white mb-8 lowercase text-right tracking-tighter">
                Get in <br />
                <span className="text-babun-accent italic">Touch.</span>
              </h1>
            </div>
            <div className="lg:max-w-md pt-12">
              <p className="text-white/60 text-lg leading-relaxed font-light">
                שאלה. ייעוץ. שיתוף פעולה. הרצאה. כאן עונים. הצוות המקצועי שלנו כאן כדי לתת לכם מענה מדויק.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          
          {/* Info Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4 text-right"
          >
            <div className="space-y-16">
              <div className="group">
                <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-babun-accent mb-6">LOCATION</div>
                <h4 className="text-2xl font-display font-bold text-babun-primary mb-4">בני ברק, ישראל</h4>
                <div className="text-babun-primary/60 text-sm leading-loose">
                   מגדל בסר 3, מצדה 9, מרכז העסקים בני ברק <br />
                   יעקב רייניץ - נדל"ן וכלכלה נבונה
                </div>
              </div>

              <div className="group">
                <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-babun-accent mb-6">CONTACT</div>
                <div className="space-y-4">
                  <a href="tel:0504141516" className="block text-2xl font-display font-bold text-babun-primary hover:text-babun-accent transition-colors">050-4141516</a>
                  <a href="mailto:r0504141516@gmail.com" className="block text-lg font-light text-babun-primary/60 hover:text-babun-accent transition-colors">r0504141516@gmail.com</a>
                </div>
              </div>
              
              <div className="pt-8 group">
                <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-babun-accent mb-6">SOCIAL</div>
                <div className="flex gap-6 justify-end">
                   {['Linkedin', 'Facebook', 'Whatsapp'].map(social => {
                     const href = social === 'Whatsapp' ? 'https://chat.whatsapp.com/C2tWdG3sQ6r0UcqN9tgetQ?m' : '#';
                     return (
                       <a 
                         key={social} 
                         href={href} 
                         target={social === 'Whatsapp' ? '_blank' : undefined}
                         rel={social === 'Whatsapp' ? 'noopener noreferrer' : undefined}
                         className="text-[10px] font-black uppercase tracking-widest text-babun-primary/30 border-b-2 border-transparent hover:text-babun-accent hover:border-babun-accent transition-all pb-1"
                       >
                         {social}
                       </a>
                     );
                   })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form Side */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-8"
          >
            <div className="bg-white p-10 md:p-20 shadow-2xl shadow-babun-primary/5 relative overflow-hidden rounded-babun-lg">
              <div className="absolute inset-4 border border-babun-primary/5 pointer-events-none" />
              
              {formStatus === "success" ? (
                <div className="text-center py-20 relative z-10 font-display">
                   <div className="w-24 h-24 bg-babun-accent/20 text-babun-primary rounded-full flex items-center justify-center mx-auto mb-8 animate-in zoom-in">
                      <Send size={40} />
                   </div>
                   <h3 className="text-4xl font-bold text-babun-primary mb-4">הודעתכם נשלחה!</h3>
                   <p className="text-lg text-babun-primary/60 mb-12">תודה שפניתם אלינו. נשיב לכם בהקדם.</p>
                   <button 
                    onClick={() => setFormStatus(null)}
                    className="btn-babun-outline"
                   >
                     שליחת הודעה נוספת
                   </button>
                </div>
              ) : (
                <form className="space-y-12 relative z-10 text-right" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-babun-primary/30 uppercase tracking-widest">שם מלא</label>
                       <input 
                        required 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="input-babun !bg-transparent border-0 border-b rounded-none px-0 focus:border-babun-accent" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-babun-primary/30 uppercase tracking-widest">כתובת דוא"ל</label>
                       <input 
                        required 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="input-babun !bg-transparent border-0 border-b rounded-none px-0 focus:border-babun-accent" 
                       />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-babun-primary/30 uppercase tracking-widest">טלפון</label>
                       <input 
                        required 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="input-babun !bg-transparent border-0 border-b rounded-none px-0 focus:border-babun-accent text-left" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-babun-primary/30 uppercase tracking-widest">נושא</label>
                       <select 
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        className="input-babun !bg-transparent border-0 border-b rounded-none px-0 focus:border-babun-accent appearance-none cursor-pointer"
                       >
                          <option>ייעוץ</option>
                          <option>קורס</option>
                          <option>הרצאה</option>
                          <option>ספר</option>
                          <option>שיתוף פעולה</option>
                          <option>אחר</option>
                       </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-babun-primary/30 uppercase tracking-widest">הודעה</label>
                     <textarea 
                      required
                      rows={4} 
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="input-babun !bg-transparent border-0 border-b rounded-none px-0 focus:border-babun-accent resize-none mt-2"
                     ></textarea>
                  </div>
                  
                  <div className="pt-6">
                    <button 
                      type="submit" 
                      disabled={formStatus === "loading"}
                      className="w-full bg-babun-primary text-white py-6 uppercase tracking-[0.4em] font-black text-xs hover:bg-babun-accent hover:text-babun-primary transition-all duration-500 shadow-2xl flex items-center justify-center gap-4"
                    >
                      {formStatus === "loading" ? "שולח הודעה..." : "שלחו אליי"}
                      <Send size={16} />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
