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

// Component to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-babun-light selection:bg-babun-accent selection:text-babun-primary font-sans antialiased" dir="rtl">
        <Navbar />
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
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />

        {/* Floating WhatsApp Button */}
        <a 
          href="https://wa.me/972504141516" 
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
    </Router>
  );
}
