import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Building2, Briefcase, Calendar, ArrowRight, ArrowLeft, CheckCircle, FileText, Send, User, Users } from "lucide-react";
import { collection, addDoc, serverTimestamp, getDoc, doc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";

// Mock for UI preview if ID is numeric
const MOCK_JOBS: Record<string, any> = {
  "1": { 
    title: "מנהל כספים בכיר (CFO)", 
    companyName: "Capital Group", 
    location: "ירושלים", 
    type: "full-time",
    category: "פיננסים",
    salary: "35k - 45k",
    description: "אנחנו מחפשים מנהל כספים מנוסה להוביל את המחלקה הפיננסית שלנו. התפקיד כולל ניהול תקציבים, דוחות כספיים, עבודה מול בנקים וליווי תהליכים אסטרטגיים.",
    requirements: "• ניסיון של 10 שנים לפחות בתחום\n• רו״ח מוסמך - חובה\n• ניסיון בניהול צוות\n• יכולת אנליטית גבוהה"
  },
  "2": { 
    title: "מפתח Full Stack", 
    companyName: "DataVision", 
    location: "תל אביב", 
    type: "full-time",
    category: "הייטק",
    salary: "28k - 38k",
    description: "הצטרפו לצוות הפיתוח שלנו ובנו את הדור הבא של מערכות ה-AI שלנו. עבודה בסביבה טכנולוגית מתקדמת ודינאמית.",
    requirements: "• React, Node.js, TypeScript\n• ניסיון של שנתיים לפחות\n• רקע בענן (AWS/Azure)"
  }
};

export default function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applyStatus, setApplyStatus] = useState<null | "loading" | "success">(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      
      // First check mock
      if (MOCK_JOBS[id]) {
        setJob(MOCK_JOBS[id]);
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "jobs", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setJob(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching job:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyStatus("loading");
    try {
      await addDoc(collection(db, "applications"), {
        ...formData,
        jobId: id,
        jobTitle: job?.title,
        createdAt: serverTimestamp(),
        status: "pending"
      });
      setApplyStatus("success");
    } catch (error) {
      console.error("Error applying:", error);
      handleFirestoreError(error, OperationType.WRITE, "applications");
      setApplyStatus(null);
    }
  };

  if (loading) return <div className="pt-40 text-center font-display">טוען נתונים...</div>;
  if (!job) return <div className="pt-40 text-center font-display text-red-500">משרה לא נמצאה</div>;

  return (
    <div className="bg-babun-light pt-32 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Back Link */}
        <Link to="/jobs" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-babun-accent transition-all mb-12 flex-row-reverse">
           <ArrowRight size={14} /> חזרה ללוח המשרות
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-right">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12 order-2 lg:order-1">
             <div className="bg-white p-12 md:p-20 shadow-2xl shadow-babun-primary/5 relative">
                <div className="absolute inset-4 border border-babun-primary/5 pointer-events-none" />
                
                <h1 className="text-4xl md:text-5xl font-display font-black text-babun-primary mb-6 leading-tight">{job.title}</h1>
                
                <div className="flex flex-wrap gap-8 justify-end text-[11px] font-black uppercase tracking-widest opacity-40 mb-12">
                   <span className="flex items-center gap-2">{job.companyName} <Building2 size={14} /></span>
                   <span className="flex items-center gap-2">{job.location} <MapPin size={14} /></span>
                   <span className="flex items-center gap-2">{job.category} <Briefcase size={14} /></span>
                </div>

                <div className="space-y-10">
                   <div>
                      <h3 className="text-sm font-black uppercase tracking-[0.3em] text-babun-accent mb-6 border-b border-babun-accent/10 pb-2 inline-block">תיאור התפקיד</h3>
                      <div className="text-lg leading-relaxed text-babun-primary/80 whitespace-pre-wrap">{job.description}</div>
                   </div>

                   {job.requirements && (
                     <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-babun-accent mb-6 border-b border-babun-accent/10 pb-2 inline-block">דרישות חובה</h3>
                        <div className="text-lg leading-relaxed text-babun-primary/80 whitespace-pre-wrap">{job.requirements}</div>
                     </div>
                   )}
                </div>
             </div>

             <div className="bg-babun-primary p-12 text-white text-right rounded-babun-md relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                   <div>
                     <h3 className="text-2xl font-display font-bold mb-2 text-babun-accent tracking-tight">רוצים לדעת עוד?</h3>
                     <p className="text-white/60">פנו אלינו לבירור פרטים נוספים אודות המשרה או תהליך הגיוס.</p>
                   </div>
                   <Link to="/contact" className="btn-babun-primary whitespace-nowrap">צור קשר עם המגייס</Link>
                </div>
                <Users className="absolute -bottom-4 -left-4 text-white/5" size={140} />
             </div>
          </div>

          {/* Sidebar - Application Form */}
          <aside className="lg:col-span-4 order-1 lg:order-2">
             <div className="sticky top-32">
                <div className="bg-white p-10 shadow-2xl border border-babun-accent/30 rounded-babun-md text-right">
                   <h2 className="text-2xl font-display font-black text-babun-primary mb-2">הגשת מועמדות</h2>
                   <p className="text-xs font-bold opacity-30 uppercase tracking-widest mb-8">Apply for this opening</p>

                   {applyStatus === "success" ? (
                      <div className="text-center py-12">
                         <div className="w-16 h-16 bg-babun-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 text-babun-primary">
                            <CheckCircle size={32} />
                         </div>
                         <h4 className="text-xl font-bold mb-2">תודה!</h4>
                         <p className="text-sm opacity-60">המועמדות שלך נשלחה בהצלחה.</p>
                      </div>
                   ) : (
                      <form onSubmit={handleApply} className="space-y-6">
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest ml-1">שם מלא</label>
                            <input 
                              required
                              className="w-full h-12 bg-babun-light px-4 outline-none focus:ring-1 ring-babun-accent border-none text-sm transition-all"
                              value={formData.name}
                              onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest ml-1">כתובת דוא"ל</label>
                            <input 
                              required
                              type="email"
                              className="w-full h-12 bg-babun-light px-4 outline-none focus:ring-1 ring-babun-accent border-none text-sm transition-all"
                              value={formData.email}
                              onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest ml-1">טלפון</label>
                            <input 
                              required
                              className="w-full h-12 bg-babun-light px-4 outline-none focus:ring-1 ring-babun-accent border-none text-sm transition-all text-left"
                              value={formData.phone}
                              onChange={e => setFormData({...formData, phone: e.target.value})}
                            />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest ml-1">מסר אישי (אופציונלי)</label>
                            <textarea 
                              rows={4}
                              className="w-full bg-babun-light p-4 outline-none focus:ring-1 ring-babun-accent border-none text-sm transition-all resize-none"
                              value={formData.message}
                              onChange={e => setFormData({...formData, message: e.target.value})}
                            />
                         </div>
                         
                         <button 
                           disabled={applyStatus === "loading"}
                           className="w-full btn-babun-primary justify-center py-4 shadow-xl shadow-babun-primary/10"
                         >
                           {applyStatus === "loading" ? "שולח מועמדות..." : "הגשת מועמדות"}
                           <FileText size={16} />
                         </button>
                      </form>
                   )}
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                   <div className="p-6 bg-white border border-babun-primary/5 text-center rounded-babun-sm">
                      <div className="text-[10px] font-bold opacity-30 uppercase tracking-widest mb-1">פורסמה</div>
                      <div className="text-sm font-bold text-babun-primary">12/05/2026</div>
                   </div>
                   <div className="p-6 bg-white border border-babun-primary/5 text-center rounded-babun-sm">
                      <div className="text-[10px] font-bold opacity-30 uppercase tracking-widest mb-1">סוג</div>
                      <div className="text-sm font-bold text-babun-primary">משרה מלאה</div>
                   </div>
                </div>
             </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
