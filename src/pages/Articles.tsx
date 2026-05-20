import { motion } from "motion/react";
import { MessageCircle, PlayCircle, BookOpen, Newspaper, ExternalLink, Calendar, ArrowLeft } from "lucide-react";

const mediaCategories = [
  { id: "weekly", name: "טור שבועי", icon: BookOpen, desc: "ניתוחים שבועיים ב'המודיע' כבר שנים." },
  { id: "podcast", name: "פודקאסטים", icon: PlayCircle, desc: "ראיונות והסברים קוליים על שוק הנדל\"ן." },
  { id: "articles", name: "כתבות ומאמרים", icon: Newspaper, desc: "כל מה שפורסם ב'כלכלה נבונה' ובאתרים." },
  { id: "kavei", name: "קווי מידע", icon: MessageCircle, desc: "שיתוף פעולה עם איצה דלוביצקי." }
];

const articles = [
  {
    title: "שוק הנדל\"ן 2026: מה באמת קורה מאחורי הקלעים?",
    category: "טור שבועי",
    date: "15.05.2026",
    link: "#",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "המדריך המלא למשקיע המתחיל: איך לא ליפול בפח?",
    category: "מאמר מקצועי",
    date: "10.05.2026",
    link: "#",
    image: "https://images.unsplash.com/photo-1454165833772-d996d4ad510d?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "פודקאסט: למה כולם מדברים על התחדשות עירונית?",
    category: "פודקאסט",
    date: "05.05.2026",
    link: "#",
    image: "https://images.unsplash.com/photo-1478737270239-2fccd2c7862a?auto=format&fit=crop&q=80&w=800"
  }
];

export default function Articles() {
  return (
    <div className="bg-babun-light min-h-screen">
      {/* PAGE HERO */}
      <section className="bg-babun-primary text-white pt-48 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 mesh-grid opacity-20 z-0" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 text-right">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8 border-b border-white/10 pb-20">
            <div className="max-w-3xl">
              <span className="inline-block text-[11px] font-bold uppercase tracking-[0.5em] text-babun-accent mb-6 px-4 py-1.5 border border-babun-accent/20 bg-babun-accent/5">
                MEDIA & INSIGHTS
              </span>
              <h1 className="text-6xl md:text-8xl font-display font-black leading-[0.9] text-white mb-8 lowercase tracking-tighter">
                Media <br />
                <span className="text-babun-accent italic">Center.</span>
              </h1>
            </div>
            <div className="lg:max-w-md pt-12">
              <h2 className="text-2xl font-display font-bold text-white mb-4">הידע פה. קח.</h2>
              <p className="text-white/60 text-lg leading-relaxed font-light">
                טור שבועי. פודקאסט. ראיונות. כתבות. כל מה שכתבתי - במקום אחד.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-24">
        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
           {mediaCategories.map((cat, i) => (
             <motion.div
               key={i}
               whileHover={{ y: -5 }}
               className="bg-white p-10 shadow-2xl shadow-babun-primary/5 border border-babun-primary/5 rounded-babun-lg text-right group transition-all duration-500"
             >
                <div className="mb-8 text-babun-primary group-hover:text-babun-accent transition-colors">
                   <cat.icon size={32} strokeWidth={1.5} />
                </div>
                <h4 className="text-xl font-display font-bold mb-4 text-babun-primary">{cat.name}</h4>
                <p className="text-babun-primary/40 text-sm leading-relaxed mb-8">{cat.desc}</p>
                <button className="text-[10px] font-black uppercase tracking-widest text-babun-accent border-b-2 border-transparent hover:border-babun-accent pb-1 transition-all">
                   צפייה בכל התכנים
                </button>
             </motion.div>
           ))}
        </div>

        {/* Recent Content */}
        <section>
           <div className="flex items-center justify-between flex-row-reverse mb-16 border-b border-babun-primary/5 pb-6">
              <h3 className="text-4xl font-display font-black text-babun-primary tracking-tight">הכי חדשים.</h3>
              <div className="hidden md:flex items-center gap-4 text-xs font-bold opacity-30 lowercase tracking-[0.2em] uppercase">VIEW ALL INSIGHTS</div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {articles.map((article, i) => (
                <div key={i} className="group cursor-pointer text-right">
                   <div className="aspect-video bg-babun-primary overflow-hidden rounded-babun-lg mb-8 relative">
                      <img src={article.image} className="w-full h-full object-cover grayscale brightness-75 group-hover:scale-110 transition-transform duration-1000" />
                      <div className="absolute top-4 right-4 bg-babun-accent text-babun-primary px-4 py-1.5 text-[10px] font-black uppercase tracking-widest">
                         {article.category}
                      </div>
                   </div>
                   <div className="flex items-center gap-2 justify-end text-xs font-bold opacity-30 mb-4 uppercase tracking-widest">
                      <span>{article.date}</span>
                      <Calendar size={14} />
                   </div>
                   <h4 className="text-2xl font-display font-bold text-babun-primary mb-6 group-hover:text-babun-accent transition-colors leading-tight">
                      {article.title}
                   </h4>
                   <a href={article.link} className="inline-flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-babun-primary/40 group-hover:text-babun-accent transition-colors">
                      קרא את המאמר <ArrowLeft size={16} />
                   </a>
                </div>
              ))}
           </div>
        </section>

        {/* FEED SECTION */}
        <section className="mt-40 bg-babun-primary text-white p-12 md:p-20 rounded-babun-lg relative overflow-hidden">
           <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16 text-right">
              <div className="flex-1">
                 <h3 className="text-3xl font-display font-black text-babun-accent mb-6 italic">חדשות נדל"ן - עדכון שוטף</h3>
                 <div className="space-y-8">
                    {[
                      "עליית ריבית בנק ישראל: מה המשמעות למשכנתא שלכם?",
                      "המכרזים החדשים בפריפריה - הזדמנות או מלכודת?",
                      "התחדשות עירונית בבני ברק: פני העתיד"
                    ].map((news, i) => (
                      <div key={i} className="flex items-center gap-4 justify-end border-b border-white/5 pb-4 group cursor-pointer">
                         <span className="text-lg font-light text-white/60 group-hover:text-babun-accent transition-colors">{news}</span>
                         <ExternalLink size={16} className="text-babun-accent opacity-20 group-hover:opacity-100" />
                      </div>
                    ))}
                 </div>
              </div>
              <div className="flex-1 max-w-sm">
                 <div className="text-5xl font-display font-black text-babun-accent mb-6 leading-none">REAL TIME.</div>
                 <p className="text-white/40 text-sm leading-relaxed">אנחנו דואגים שתהיו מעודכנים במידע הכי חם וקריטי בשוק הנדל"ן החרדי והכללי בישראל.</p>
              </div>
           </div>
           <Newspaper className="absolute -bottom-10 -right-10 text-white/5" size={250} />
        </section>
      </div>
    </div>
  );
}
