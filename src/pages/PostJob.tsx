import { useState } from "react";
import { motion } from "motion/react";
import { Send, CheckCircle, Building2, Briefcase, MapPin, DollarSign, Loader2 } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";

export default function PostJob() {
  const [status, setStatus] = useState<null | "loading" | "success">(null);
  const [formData, setFormData] = useState({
    title: "",
    companyName: "",
    location: "",
    type: "full-time",
    category: "פיננסים",
    salary: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await addDoc(collection(db, "jobs"), {
        ...formData,
        createdAt: serverTimestamp(),
      });
      setStatus("success");
    } catch (error) {
      console.error("Error posting job:", error);
      handleFirestoreError(error, OperationType.WRITE, "jobs");
      setStatus(null);
    }
  };

  return (
    <div className="bg-babun-light pt-32 pb-24 min-h-screen">
      {/* Header Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-16 text-right">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 border-b border-babun-primary/10 pb-20">
          <div className="max-w-3xl">
             <span className="inline-block text-[11px] font-bold uppercase tracking-[0.5em] text-babun-accent mb-6 px-4 py-1.5 border border-babun-accent/20 bg-babun-accent/5">
                מצאו את הטובים ביותר
              </span>
              <h1 className="text-6xl md:text-8xl font-display font-black leading-[0.9] text-babun-primary mb-8 lowercase text-right tracking-tighter">
                Hire <br />
                <span className="text-babun-accent italic">Success.</span>
              </h1>
          </div>
          <div className="lg:max-w-md pt-12">
             <p className="text-babun-primary/60 text-lg leading-relaxed">
               המשרות שלכם מגיעות ישירות לכישרונות המובילים במגזר. פרסמו עכשיו והתחילו לקבל פניות איכותיות וממותגות.
             </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-20 shadow-2xl shadow-babun-primary/5 relative overflow-hidden"
        >
          {/* Inner decorative border */}
          <div className="absolute inset-4 border border-babun-primary/5 pointer-events-none" />

          {status === "success" ? (
            <div className="text-center py-20 relative z-10">
               <div className="w-24 h-24 bg-babun-accent/20 rounded-full flex items-center justify-center mx-auto mb-8 text-babun-primary">
                  <CheckCircle size={64} />
               </div>
               <h2 className="text-4xl font-display font-bold mb-4 text-babun-primary">המשרה פורסמה בהצלחה!</h2>
               <p className="text-lg text-babun-primary/60 mb-12">המשרה תופיע בלוח לאחר סריקה מהירה של צוות המערכת.</p>
               <button 
                  onClick={() => setStatus(null)}
                  className="btn-babun-primary"
               >
                  פרסום משרה נוספת
               </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-12 relative z-10 text-right">
              {/* Job Basics */}
              <div className="space-y-8">
                 <div className="flex items-center justify-end gap-3 text-babun-accent font-black uppercase tracking-widest text-xs">
                    פרטי המשרה <Briefcase size={16} />
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-babun-primary/40 uppercase tracking-widest">שם המשרה</label>
                       <input 
                        required
                        className="input-babun text-right"
                        placeholder="למשל: מנהל חשבונות בכיר"
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-babun-primary/40 uppercase tracking-widest">קטגוריה</label>
                       <select 
                        className="input-babun text-right appearance-none"
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                       >
                          <option>פיננסים</option>
                          <option>הייטק</option>
                          <option>שיווק</option>
                          <option>מנהלה</option>
                          <option>ניהול</option>
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-babun-primary/40 uppercase tracking-widest">מיקום</label>
                       <input 
                        required
                        className="input-babun text-right"
                        placeholder="למשל: בני ברק"
                        value={formData.location}
                        onChange={e => setFormData({...formData, location: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-babun-primary/40 uppercase tracking-widest">סוג משרה</label>
                       <select 
                        className="input-babun text-right appearance-none"
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value})}
                       >
                          <option value="full-time">משרה מלאה</option>
                          <option value="part-time">משרה חלקית</option>
                          <option value="contract">פרויקט</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-babun-primary/40 uppercase tracking-widest">שכר משוער (אופציונלי)</label>
                       <input 
                        className="input-babun text-right"
                        placeholder="טווח שכר"
                        value={formData.salary}
                        onChange={e => setFormData({...formData, salary: e.target.value})}
                       />
                    </div>
                 </div>
              </div>

              {/* Company Info */}
              <div className="space-y-8 pt-12 border-t border-babun-primary/5">
                 <div className="flex items-center justify-end gap-3 text-babun-accent font-black uppercase tracking-widest text-xs">
                    פרטי החברה <Building2 size={16} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-babun-primary/40 uppercase tracking-widest">שם החברה / המשרד</label>
                    <input 
                      required
                      className="input-babun text-right"
                      placeholder="שם המעסיק המלא"
                      value={formData.companyName}
                      onChange={e => setFormData({...formData, companyName: e.target.value})}
                    />
                 </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                  <label className="text-[10px] font-bold text-babun-primary/40 uppercase tracking-widest">תיאור המשרה ודרישות קדם</label>
                  <textarea 
                    required
                    rows={8}
                    className="input-babun text-right resize-none"
                    placeholder="פרטו ככל הניתן על המשרה, האחריות והדרישות..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
              </div>

              <div className="pt-8">
                 <button 
                  disabled={status === "loading"}
                  className="w-full bg-babun-primary text-white py-6 uppercase tracking-[0.4em] font-black text-xs hover:bg-babun-accent hover:text-babun-primary transition-all duration-500 shadow-2xl flex items-center justify-center gap-4"
                 >
                   {status === "loading" && <Loader2 className="animate-spin" size={18} />}
                   {status === "loading" ? "מעלה משרה..." : "פרסום משרה עכשיו"}
                 </button>
                 <p className="text-center text-[10px] font-bold opacity-30 mt-6 uppercase tracking-widest">
                   על ידי פרסום המשרה אתם מסכימים לתנאי השימוש וכללי הפרסום של המערכת.
                 </p>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
