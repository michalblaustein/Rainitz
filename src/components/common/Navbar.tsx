import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, Phone, Mail } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const navLinks = [
  { name: "בית", path: "/" },
  { name: "אודות", path: "/about" },
  { name: "קורסים והרצאות", path: "/courses" },
  { name: "פגישות ייעוץ", path: "/consulting" },
  { name: "הספר", path: "/book" },
  { name: "מחשבונים", path: "/calculators" },
  { name: "מאמרים ותקשורת", path: "/articles" },
  { name: "צור קשר", path: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 transition-all duration-300">
      {/* Top Info Bar */}
      <div className={`bg-babun-primary text-white text-[10px] uppercase font-bold py-2 transition-all duration-300 ${isScrolled ? "h-0 overflow-hidden opacity-0" : "h-auto opacity-100"}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center tracking-[0.2em]">
          <div className="flex items-center gap-6">
            <span className="opacity-70">מרכז רייניץ לנדל"ן וכלכלה נבונה</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="mailto:office@rainitznadlan.co.il" className="flex items-center gap-2 hover:text-babun-accent transition-colors">
              <Mail size={12} />
              office@rainitznadlan.co.il
            </a>
            <a href="tel:050-4141516" className="flex items-center gap-2 hover:text-babun-accent transition-colors">
              <Phone size={12} />
              050-4141516
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div 
        className={`w-full transition-all duration-500 ${
          isScrolled 
            ? "bg-white shadow-xl py-4" 
            : "bg-white/90 backdrop-blur-sm py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">
          {/* Logo Right */}
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="https://drive.google.com/uc?export=view&id=12Rxg5zyqDjcmcZQN5gL1O0aUjHfOYtRG" 
              alt="יעקב רייניץ" 
              className="h-12 md:h-16 w-auto"
              referrerPolicy="no-referrer"
            />
          </Link>

          {/* Main Navigation - Center */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 hover:text-babun-accent relative group ${
                  location.pathname === link.path ? "text-babun-accent" : "text-babun-primary/70"
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-2 right-0 w-full h-0.5 bg-babun-accent transition-transform duration-500 origin-right ${
                  location.pathname === link.path ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`} />
              </Link>
            ))}
          </nav>

          {/* CTA Left */}
          <div className="flex items-center gap-4">
            <Link 
              to="/consulting" 
              className="btn-babun-primary text-[11px] uppercase tracking-[0.1em] py-2.5 px-6 hidden md:flex"
            >
              קביעת פגישת ייעוץ
            </Link>

            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden p-2 text-babun-primary"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="lg:hidden fixed top-0 right-0 h-screen w-80 bg-white shadow-2xl py-12 px-8 flex flex-col gap-8 z-[60]"
          >
            <button onClick={() => setIsOpen(false)} className="self-start mb-8 p-2 border border-babun-primary/10 rounded-full">
              <X size={20} />
            </button>
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`text-xl font-display font-bold uppercase tracking-widest ${location.pathname === link.path ? "text-babun-accent" : "text-babun-primary"}`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="mt-auto flex flex-col gap-4 pt-8 border-t border-babun-primary/5">
              <Link to="/consulting" className="btn-babun-primary w-full justify-center">קביעת ייעוץ</Link>
              <div className="flex gap-4 justify-center mt-4">
                 <a href="tel:050-4141516" className="w-10 h-10 rounded-full bg-babun-primary/5 flex items-center justify-center"><Phone size={16} /></a>
                 <a href="mailto:office@rainitznadlan.co.il" className="w-10 h-10 rounded-full bg-babun-primary/5 flex items-center justify-center"><Mail size={16} /></a>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
      {isOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[55] lg:hidden" onClick={() => setIsOpen(false)} />}
    </header>
  );
}
