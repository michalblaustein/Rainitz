import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { defaultSeedArticles } from "../../data/defaultArticles";
import { formatExternalUrl, isPodcastArticle } from "../../lib/utils";

const getDisplayImage = (url: string) => {
  if (!url) return "";
  const driveFileRegex = /\/file\/d\/([a-zA-Z0-9_-]+)/;
  const driveIdRegex = /[?&]id=([a-zA-Z0-9_-]+)/;

  const fileMatch = url.match(driveFileRegex);
  const idMatch = url.match(driveIdRegex);

  const fileId = fileMatch ? fileMatch[1] : idMatch ? idMatch[1] : null;

  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w160`;
  }
  return url;
};

export default function Footer() {
  const [latestArticles, setLatestArticles] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem("babun_articles_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, 3);
        }
      }
    } catch (e) {}
    return defaultSeedArticles.slice(0, 3);
  });

  useEffect(() => {
    // 1. Listen for local events (e.g. when admin adds an article in the same session)
    const handleLocalUpdate = (e: any) => {
      if (e?.detail && Array.isArray(e.detail) && e.detail.length > 0) {
        setLatestArticles(e.detail.slice(0, 3));
      }
    };
    window.addEventListener("articles_updated", handleLocalUpdate);

    // 2. Fetch server API
    fetch("/api/articles")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const existingIds = new Set(data.map((d: any) => d.id));
          const missingDefaults = defaultSeedArticles.filter((d) => !existingIds.has(d.id));
          const combined = [...data, ...missingDefaults];
          setLatestArticles(combined.slice(0, 3));
        }
      })
      .catch((err) => {
        console.warn("Footer articles fetch fallback:", err);
      });

    // 3. Firestore live listener
    let unsubscribe = () => {};
    try {
      const articlesRef = collection(db, "articles");
      const q = query(articlesRef, orderBy("createdAt", "desc"));
      unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const docs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          const existingIds = new Set(docs.map((d: any) => d.id));
          const missingDefaults = defaultSeedArticles.filter((d) => !existingIds.has(d.id));
          const combined = [...docs, ...missingDefaults];
          setLatestArticles(combined.slice(0, 3));
        }
      }, (err) => {
        console.warn("Footer firestore listener warn:", err);
      });
    } catch (e) {}

    return () => {
      window.removeEventListener("articles_updated", handleLocalUpdate);
      unsubscribe();
    };
  }, []);

  return (
    <footer className="bg-babun-primary text-white pt-24 pb-12 overflow-hidden relative" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-24 border-b border-white/10 pb-20 text-right">
          
          {/* COLUMN 1 - RIGHT: LOGO & ABOUT */}
          <div className="flex flex-col items-start">
            <Link to="/" className="mb-8">
              <img 
                src="https://lh3.googleusercontent.com/d/1TtktR-B0LsjkNXjvcdUP8JPkZye4U8Ks" 
                alt="יעקב רייניץ" 
                className="h-20 w-auto"
                referrerPolicy="no-referrer"
              />
            </Link>
            <p className="text-lg text-white/80 font-medium leading-relaxed mb-10 max-w-sm">
              יעקב רייניץ, יועץ נדל"ן בכיר, 18 שנות ניסיון במגזר החרדי
            </p>
          </div>

          {/* COLUMN 2 - MIDDLE: SERVICES */}
          <div className="flex flex-col items-start">
            <h5 className="text-xl font-display font-bold text-babun-accent mb-8">השירותים שלנו</h5>
            <ul className="space-y-5 text-lg text-white/60 font-light">
              <li><Link to="/courses" className="hover:text-babun-accent transition-colors">קורסים</Link></li>
              <li><Link to="/consulting" className="hover:text-babun-accent transition-colors">פגישת ייעוץ</Link></li>
              <li><Link to="/book" className="hover:text-babun-accent transition-colors">הספר "שליש בקרקע"</Link></li>
              <li><Link to="/articles" className="hover:text-babun-accent transition-colors">מאמרים ופודקאסטים</Link></li>
              <li><Link to="/calculators" className="hover:text-babun-accent transition-colors">מחשבוני נדל"ן</Link></li>
            </ul>
          </div>

          {/* COLUMN 3 - LEFT: CONTACT */}
          <div className="flex flex-col items-start">
            <h5 className="text-xl font-display font-bold text-babun-accent mb-8 w-full">צור קשר</h5>
            <ul className="space-y-6 text-lg text-white/60 font-light w-full">
              <li className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-babun-accent/20 transition-colors"><Mail size={18} /></div>
                <span className="group-hover:text-white transition-colors">r0504141516@gmail.com</span>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-babun-accent/20 transition-colors"><Phone size={18} /></div>
                <span className="group-hover:text-white transition-colors underline decoration-babun-accent">050-4141516</span>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-babun-accent/20 transition-colors"><MapPin size={18} /></div>
                <span className="group-hover:text-white transition-colors max-w-[200px]">מגדל בסר 3, מצדה 9 מרכז העסקים בני ברק</span>
              </li>
            </ul>
          </div>

          {/* COLUMN 4 - FAR-LEFT: RECENT ARTICLES & PODCASTS */}
          <div className="flex flex-col items-start w-full">
            <Link to="/articles" className="text-xl font-display font-bold text-babun-accent mb-8 w-full hover:text-white transition-colors block">
              כתבות ופודקאסטים
            </Link>
            <div className="space-y-4 w-full">
              {latestArticles.map((article, idx) => {
                const isPodcast = isPodcastArticle(article) || article.categoryId === "podcast";

                return (
                  <Link 
                    key={article.id || idx}
                    to={`/articles/${article.id || ""}`}
                    className={`group flex items-center gap-4 hover:text-babun-accent transition-colors w-full ${idx > 0 ? "border-t border-white/5 pt-4" : ""}`}
                  >
                    <img 
                      src={getDisplayImage(article.image || article.innerImage)} 
                      alt={article.title} 
                      className="w-16 h-16 rounded-md object-cover flex-shrink-0 border border-white/10 group-hover:border-babun-accent/40 transition-all duration-300 shadow-md group-hover:scale-[1.03]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="line-clamp-2 leading-snug font-normal text-white/90 group-hover:text-babun-accent transition-colors text-sm text-right">
                        {article.title}
                      </span>
                      <span className="text-xs text-white/30 mt-1 text-right">
                        {article.date || ""} • {isPodcast ? "פודקאסט" : article.category || ""}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row-reverse justify-between items-center gap-6 text-[11px] font-bold uppercase tracking-widest text-white/20">
          <p dir="ltr">© {new Date().getFullYear()} RAINITZ NADLAN. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <Link to="/contact" className="hover:text-white transition-colors">מדיניות פרטיות</Link>
            <Link to="/contact" className="hover:text-white transition-colors">הצהרת נגישות</Link>
            <Link to="/database" className="hover:text-white transition-colors">מסד נתונים</Link>
          </div>
        </div>
      </div>

      {/* Corporate Big Text Background */}
      <div className="absolute -bottom-20 left-0 text-[18rem] md:text-[30rem] font-display font-black text-white/[0.03] select-none pointer-events-none tracking-tighter leading-none">
        RAIN
      </div>
    </footer>
  );
}
