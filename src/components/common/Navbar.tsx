import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, Phone, Mail } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const navLinks = [
  { name: "קורסים והרצאות", path: "/courses" },
  { name: "פגישת ייעוץ", path: "/consulting" },
  { name: "מחשבונים", path: "/calculators" },
  { name: "הספר", path: "/book" },
  { name: "מאמרים ופודקאסטים", path: "/articles" },
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
              src="https://lh3.googleusercontent.com/d/1CYyzzstemzbU_W4xXZKI79Q0msNLNOdQ" 
              alt="יעקב רייניץ" 
              className="h-20 md:h-28 w-auto transition-all duration-300"
              referrerPolicy="no-referrer"
            />
          </Link>

          {/* Main Navigation - Center */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className={`text-lg font-medium transition-all duration-300 relative group py-2 ${
                  location.pathname === link.path ? "text-black font-bold" : "text-black/70 hover:text-black hover:font-bold"
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-1 right-0 w-full h-1 bg-babun-accent transition-transform duration-500 origin-right ${
                  location.pathname === link.path ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`} />
              </Link>
            ))}
          </nav>

          {/* CTA Left */}
          <div className="flex items-center gap-4">
            <Link 
              to="/consulting" 
              className="btn-babun-primary text-lg py-2.5 px-8 hidden md:flex"
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
