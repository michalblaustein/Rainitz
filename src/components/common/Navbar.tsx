import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, Phone, Mail } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const navLinks = [
  { name: "קורסים", path: "/courses" },
  { name: "פגישת ייעוץ", path: "/consulting" },
  { name: "מחשבונים", path: "/calculators" },
  { name: "הספר", path: "/book" },
  { name: "מאמרים ופודקאסטים", path: "/articles" },
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

  const isHomePage = location.pathname === "/";
  const darkHeroPages = ["/courses", "/consulting", "/calculators", "/book", "/articles", "/about", "/contact"];
  const hasDarkHero = isHomePage || darkHeroPages.includes(location.pathname);

  return (
    <header className="fixed top-0 w-full z-50 transition-all duration-300">
      {/* Main Navbar */}
      <div 
        className={`w-full transition-all duration-500 ${
          isScrolled || !hasDarkHero
            ? "bg-white shadow-xl py-4" 
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">
          {/* Logo Right */}
          <Link to="/" className="flex items-center gap-2">
            <img 
              src={isScrolled || !hasDarkHero ? "https://lh3.googleusercontent.com/d/1CYyzzstemzbU_W4xXZKI79Q0msNLNOdQ" : "https://lh3.googleusercontent.com/d/1TtktR-B0LsjkNXjvcdUP8JPkZye4U8Ks"} 
              alt="יעקב רייניץ" 
              className="h-20 md:h-24 w-auto transition-all duration-300"
              referrerPolicy="no-referrer"
            />
          </Link>

          {/* Main Navigation - Center */}
          <nav className="hidden lg:flex items-center gap-0">
            {navLinks.map((link, index) => (
              <div key={link.path} className="flex items-center">
                <Link 
                  to={link.path}
                  className={`text-lg transition-all duration-300 relative group px-6 py-2 flex flex-col items-center ${
                    location.pathname === link.path 
                      ? (isScrolled || !hasDarkHero ? "text-black" : "text-white") 
                      : (isScrolled || !hasDarkHero ? "text-black/70 hover:text-black" : "text-white/70 hover:text-white")
                  }`}
                >
                  <div className="flex flex-col items-center justify-center">
                    <span className="invisible font-bold block h-0 select-none overflow-hidden" aria-hidden="true">
                      {link.name}
                    </span>
                    <span className="font-extrabold transition-all duration-100">
                      {link.name}
                    </span>
                  </div>
                  <span className={`absolute -bottom-1 right-0 w-full h-1 bg-babun-accent transition-transform duration-500 origin-right ${
                    location.pathname === link.path ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`} />
                </Link>
                {index < navLinks.length - 1 && (
                  <div className={`w-px h-6 transition-colors duration-300 ${isScrolled || !hasDarkHero ? "bg-black/10" : "bg-white/20"}`} />
                )}
              </div>
            ))}
          </nav>

          {/* CTA Left */}
          <div className="flex items-center gap-4">
            <Link 
              to="/consulting" 
              className="bg-babun-accent text-babun-primary font-bold text-lg py-3 px-8 rounded-babun-full hidden md:flex transition-transform hover:scale-105 active:scale-95"
            >
              קביעת פגישת ייעוץ
            </Link>

            {/* Mobile Menu Toggle */}
            <button 
              className={`lg:hidden p-2 transition-colors duration-300 ${isScrolled || !hasDarkHero ? "text-babun-primary" : "text-white"}`}
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
