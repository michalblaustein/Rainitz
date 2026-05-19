import { useState } from "react";
import { motion } from "motion/react";
import { Search, MapPin, Briefcase, Filter, ArrowRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const MOCK_JOBS = [
  { 
    id: "1", 
    title: "מנהל כספים בכיר (CFO)", 
    company: "Capital Group", 
    location: "ירושלים", 
    type: "full-time",
    category: "פיננסים",
    salary: "35k - 45k",
    postedAt: "לפני יומיים"
  },
  { 
    id: "2", 
    title: "מפתח Full Stack", 
    company: "DataVision", 
    location: "תל אביב", 
    type: "full-time",
    category: "הייטק",
    salary: "28k - 38k",
    postedAt: "היום"
  },
  { 
    id: "3", 
    title: "מנהלת הנהלת חשבונות", 
    company: "משרד רו״ח עוז", 
    location: "בני ברק", 
    type: "part-time",
    category: "פיננסים",
    salary: "12k - 15k",
    postedAt: "לפני שבוע"
  },
  { 
    id: "4", 
    title: "מנהל שיווק דיגיטלי", 
    company: "Growth Boost", 
    location: "רמת גן", 
    type: "contract",
    category: "שיווק",
    salary: "18k - 22k",
    postedAt: "לפני 3 ימים"
  },
];

export default function JobList() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filteredJobs = MOCK_JOBS.filter(job => 
    job.title.toLowerCase().includes(search.toLowerCase()) && 
    (filterType === "all" || job.type === filterType)
  );

  return (
    <div className="bg-babun-light pt-32 pb-24 min-h-screen">
      {/* Search Header */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-16 text-right">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 border-b border-babun-primary/10 pb-20">
          <div className="max-w-3xl">
             <span className="inline-block text-[11px] font-bold uppercase tracking-[0.5em] text-babun-accent mb-6 px-4 py-1.5 border border-babun-accent/20 bg-babun-accent/5">
                מצא את הייעוד הבא שלך
              </span>
              <h1 className="text-6xl md:text-8xl font-display font-black leading-[0.9] text-babun-primary mb-8 lowercase text-right tracking-tighter">
                Explore <br />
                <span className="text-babun-accent italic">Jobs.</span>
              </h1>
          </div>
          <div className="lg:max-w-md pt-12">
             <p className="text-babun-primary/60 text-lg leading-relaxed">
               מגוון משרות איכותיות בחברות המובילות במשק. סננו לפי תחום עיסוק, מיקום או סוג משרה ומצאו את ההתאמה המושלמת.
             </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-3 space-y-8 order-2 lg:order-1">
            <div className="bg-white p-8 border border-babun-primary/5 shadow-sm rounded-babun-md text-right">
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center justify-end gap-3 text-babun-primary">
                חיפוש מתקדם <Filter size={16} />
              </h3>
              
              <div className="space-y-6">
                <div>
                   <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 block mb-3">מילת מפתח</label>
                   <div className="relative">
                      <Search className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20" size={16} />
                      <input 
                        type="text" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="שם משרה, חברה..."
                        className="w-full h-12 pr-12 pl-4 bg-babun-light border-none outline-none focus:ring-1 ring-babun-accent text-sm" 
                      />
                   </div>
                </div>

                <div>
                   <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 block mb-3">סוג משרה</label>
                   <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full h-12 px-4 bg-babun-light border-none outline-none focus:ring-1 ring-babun-accent text-sm appearance-none cursor-pointer"
                   >
                     <option value="all">כל המשרות</option>
                     <option value="full-time">משרה מלאה</option>
                     <option value="part-time">משרה חלקית</option>
                     <option value="contract">פרויקט / חוזה</option>
                   </select>
                </div>
              </div>
            </div>

            <div className="bg-babun-primary p-8 rounded-babun-md text-white text-right overflow-hidden relative">
               <div className="relative z-10">
                 <h4 className="text-xl font-display font-bold mb-4">אל תפספסו אף הזדמנות</h4>
                 <p className="text-white/60 text-sm mb-6">הירשמו לסוכן החכם שלנו וקבלו משרות חדשות ישירות למייל.</p>
                 <button className="w-full bg-babun-accent text-babun-primary py-3 font-bold text-xs uppercase tracking-widest hover:bg-white transition-all">להרשמה</button>
               </div>
               <Briefcase className="absolute -bottom-4 -left-4 text-white/5" size={120} />
            </div>
          </aside>

          {/* Job List */}
          <main className="lg:col-span-9 order-1 lg:order-2">
            <div className="flex justify-between items-center mb-8 flex-row-reverse font-bold text-[11px] uppercase tracking-widest opacity-40">
               <span>נמצאו {filteredJobs.length} משרות</span>
               <span className="hidden md:block">מיין לפי: החדש ביותר</span>
            </div>

            <div className="space-y-4">
              {filteredJobs.length > 0 ? filteredJobs.map((job) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={job.id}
                  className="group bg-white p-8 border border-babun-primary/5 hover:border-babun-accent/50 transition-all duration-500 rounded-babun-md flex flex-col md:flex-row items-center justify-between text-right"
                >
                  <div className="flex-1 w-full md:w-auto">
                    <div className="flex items-center gap-4 mb-2 justify-end">
                       <span className="text-[10px] font-black py-1 px-3 bg-babun-accent/10 text-babun-primary uppercase tracking-widest">{job.category}</span>
                       <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">{job.type}</span>
                    </div>
                    <Link to={`/job/${job.id}`} className="block">
                       <h3 className="text-2xl font-display font-bold text-babun-primary group-hover:text-babun-accent transition-colors">{job.title}</h3>
                    </Link>
                    <div className="flex gap-4 mt-3 opacity-50 font-bold text-[10px] uppercase tracking-widest justify-end">
                       <span className="flex items-center gap-1">{job.company} <Building2 size={12} className="inline" /></span>
                       <span>•</span>
                       <span className="flex items-center gap-1">{job.location} <MapPin size={12} className="inline" /></span>
                    </div>
                  </div>
                  
                  <div className="mt-8 md:mt-0 flex items-center gap-8 md:border-r border-babun-primary/5 md:pr-12 md:mr-12 w-full md:w-auto justify-end">
                    <div className="text-right">
                       <div className="text-[10px] uppercase font-bold opacity-30 mb-1">שכר משוער</div>
                       <div className="text-babun-primary font-bold">{job.salary}</div>
                    </div>
                    <Link 
                      to={`/job/${job.id}`} 
                      className="w-12 h-12 rounded-full border-2 border-babun-primary hover:bg-babun-primary hover:text-white flex items-center justify-center transition-all duration-300"
                    >
                      <ArrowLeft size={20} />
                    </Link>
                  </div>
                </motion.div>
              )) : (
                <div className="bg-white p-20 text-center border border-dashed border-babun-primary/10">
                   <p className="text-lg opacity-40 font-bold italic">לא נמצאו משרות התואמות את החיפוש שלך...</p>
                </div>
              )}
            </div>

            {/* Pagination Mock */}
            <div className="mt-12 flex justify-center gap-4 flex-row-reverse">
               <button className="w-10 h-10 bg-babun-accent flex items-center justify-center font-bold">1</button>
               <button className="w-10 h-10 border border-babun-primary/10 flex items-center justify-center font-bold hover:bg-babun-accent transition-colors">2</button>
               <button className="w-10 h-10 border border-babun-primary/10 flex items-center justify-center font-bold hover:bg-babun-accent transition-colors">3</button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function Building2({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/>
    </svg>
  );
}
