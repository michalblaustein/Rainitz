import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Linkedin, Facebook, Send } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-babun-primary text-white pt-24 pb-8 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 text-right">
        <div className="flex flex-col lg:flex-row-reverse justify-between items-start gap-16 mb-20 border-b border-white/10 pb-20">
          <div className="max-w-md lg:text-right">
            <Link to="/" className="flex items-center justify-start lg:justify-end mb-8">
              <img 
                src="https://lh3.googleusercontent.com/d/1TtktR-B0LsjkNXjvcdUP8JPkZye4U8Ks" 
                alt="יעקב רייניץ" 
                className="h-16 md:h-24 w-auto"
                referrerPolicy="no-referrer"
              />
            </Link>
            <p className="text-lg text-white/50 font-light leading-relaxed mb-10">
              18 שנות ניסיון. טור שבועי ב"המודיע". ספר שמסביר מה אף אחד לא אמר לך. יעקב רייניץ לצידך — מהשאלה הראשונה עד חתימת הטאבו.
            </p>
            <div className="flex gap-4 justify-start lg:justify-end">
              {['FB', 'LN', 'WA'].map(social => (
                <a key={social} href="#" className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center text-[10px] font-bold hover:bg-babun-accent hover:text-babun-primary transition-all">
                  {social}
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 lg:gap-24 text-right">
            <div>
              <h5 className="text-xs font-bold uppercase tracking-[0.3em] text-babun-accent mb-8">תפריט</h5>
              <ul className="space-y-4 text-sm text-white/60">
                <li><Link to="/courses" className="hover:text-white transition-colors">קורסים והרצאות</Link></li>
                <li><Link to="/consulting" className="hover:text-white transition-colors">פגישת ייעוץ</Link></li>
                <li><Link to="/calculators" className="hover:text-white transition-colors">מחשבונים</Link></li>
                <li><Link to="/book" className="hover:text-white transition-colors">הספר</Link></li>
                <li><Link to="/articles" className="hover:text-white transition-colors">מאמרים ופודקאסטים</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-bold uppercase tracking-[0.3em] text-babun-accent mb-8">צור קשר</h5>
              <ul className="space-y-4 text-sm text-white/60">
                <li className="flex items-center gap-3 justify-end">office@rainitznadlan.co.il <Mail size={14} /></li>
                <li className="flex items-center gap-3 justify-end">050-4141516 <Phone size={14} /></li>
                <li className="flex items-start gap-3 justify-end text-right">בני ברק, מרכז העסקים מצדה 3 <MapPin size={14} /></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row-reverse justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-white/30">
          <p>© {new Date().getFullYear()} RAINITZ NADLAN. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <Link to="/contact" className="hover:text-white transition-colors">מדיניות פרטיות</Link>
            <Link to="/contact" className="hover:text-white transition-colors">תנאי שימוש</Link>
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
