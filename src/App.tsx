import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";

// Lazy load pages for performance
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Calculators = lazy(() => import("./pages/Calculators"));
const Courses = lazy(() => import("./pages/Courses"));
const Consulting = lazy(() => import("./pages/Consulting"));
const Book = lazy(() => import("./pages/Book"));
const Articles = lazy(() => import("./pages/Articles"));
const PinuyBinuyLP = lazy(() => import("./pages/PinuyBinuyLP"));
const Scheduler = lazy(() => import("./pages/Scheduler"));
const DatabaseViewer = lazy(() => import("./pages/DatabaseViewer"));

// Component to scroll to top on route change & track Google Analytics pageviews
function ScrollAndAnalyticsTracker() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    const siteName = 'יעקב רייניץ - נדל"ן וכלכלה נבונה';
    const titleMap: Record<string, string> = {
      "/": siteName,
      "/courses": `קורסים והכשרות נדל"ן | ${siteName}`,
      "/consulting": `פגישת ייעוץ אישית | ${siteName}`,
      "/book": `הספר "שליש בקרקע" | ${siteName}`,
      "/calculators": `מחשבוני נדל"ן וכלכלה | ${siteName}`,
      "/articles": `מאגר ידע, מאמרים ופודקאסטים | ${siteName}`,
      "/about": `אודות | ${siteName}`,
      "/contact": `צור קשר | ${siteName}`,
      "/pinuy-binuy": `פינוי בינוי | ${siteName}`,
      "/scheduler": `תיאום פגישה | ${siteName}`,
      "/database": `ניהול מסד נתונים | ${siteName}`,
    };

    document.title = titleMap[pathname] || siteName;

    // Track pageview on route change in Google Analytics (SPA support)
    if (typeof (window as any).gtag === "function") {
      const pagePath = pathname + search;
      (window as any).gtag("event", "page_view", {
        page_path: pagePath,
        page_location: window.location.href,
        page_title: document.title,
      });
      (window as any).gtag("config", "G-94L6RJTJJE", {
        page_path: pagePath,
        page_title: document.title,
      });
    }
  }, [pathname, search]);

  return null;
}

function AppContent() {
  const location = useLocation();
  const isLandingPage = location.pathname === "/pinuy-binuy" || location.pathname === "/pinuy-binuy/";

  // Auto-sync articles from local cache to server in the background
  useEffect(() => {
    try {
      const cached = localStorage.getItem("babun_articles_cache");
      if (cached) {
        const localList = JSON.parse(cached);
        if (Array.isArray(localList) && localList.length > 0) {
          fetch("/api/articles")
            .then((res) => (res.ok ? res.json() : []))
            .then((serverData) => {
              const serverIds = new Set((serverData || []).map((s: any) => s.id));
              const missingOnServer = localList.filter((l: any) => !serverIds.has(l.id));
              if (missingOnServer.length > 0) {
                const combined = [...serverData, ...missingOnServer].map((a: any) => {
                  const { _source, ...rest } = a;
                  return rest;
                });
                fetch("/api/articles/sync", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(combined),
                }).catch(() => {});
              }
            })
            .catch(() => {});
        }
      }
    } catch (e) {}
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-babun-light selection:bg-babun-accent selection:text-babun-primary font-sans antialiased" dir="rtl">
      {!isLandingPage && <Navbar />}
      <main className="flex-grow">
        <Suspense fallback={
          <div className="h-screen w-full flex items-center justify-center bg-babun-light font-display">
             <div className="text-babun-primary animate-pulse tracking-[0.3em] uppercase font-black text-center">
               מרכז רייניץ <br />
               <span className="text-babun-accent">Loading...</span>
             </div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/consulting" element={<Consulting />} />
            <Route path="/book" element={<Book />} />
            <Route path="/calculators" element={<Calculators />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/articles/:id" element={<Articles />} />
            <Route path="/article/:id" element={<Articles />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/pinuy-binuy" element={<PinuyBinuyLP />} />
            <Route path="/scheduler" element={<Scheduler />} />
            <Route path="/database" element={<DatabaseViewer />} />
          </Routes>
        </Suspense>
      </main>
      {!isLandingPage && <Footer />}

      {/* Floating WhatsApp Button */}
      <a 
        href="https://chat.whatsapp.com/C2tWdG3sQ6r0UcqN9tgetQ?m" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-8 left-8 z-50 w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300 group"
        title="הצטרפו לקבוצת הווצאפ שלנו"
      >
        <MessageCircle size={32} />
        <span className="absolute right-full mr-4 bg-babun-primary text-white px-4 py-2 text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-babun-sm uppercase tracking-widest">
          הצטרפו לקהילה
        </span>
      </a>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollAndAnalyticsTracker />
      <AppContent />
    </Router>
  );
}
