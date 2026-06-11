import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Linkedin, Facebook, Send } from "lucide-react";

export default function Footer() {
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
              18 שנות ניסיון. טור שבועי ב"המודיע". ספר שמסביר מה אף אחד לא אמר לך. יעקב רייניץ לצידך - מהשאלה הראשונה עד חתימת הטאבו.
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
                <span className="group-hover:text-white transition-colors">office@rainitznadlan.co.il</span>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-babun-accent/20 transition-colors"><Phone size={18} /></div>
                <span className="group-hover:text-white transition-colors underline decoration-babun-accent">050-4141516</span>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-babun-accent/20 transition-colors"><MapPin size={18} /></div>
                <span className="group-hover:text-white transition-colors max-w-[200px]">מצדה 3, מרכז עסקים, בני ברק</span>
              </li>
            </ul>
          </div>

          {/* COLUMN 4 - FAR-LEFT: RECENT ARTICLES & PODCASTS */}
          <div className="flex flex-col items-start w-full">
            <h5 className="text-xl font-display font-bold text-babun-accent mb-8 w-full">כתבות ופודקאסטים</h5>
            <div className="space-y-4 w-full">
              <Link to="/articles" className="group flex items-center gap-4 hover:text-babun-accent transition-colors w-full">
                <img 
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=80&h=80&q=50" 
                  alt="שוק הנדלן" 
                  className="w-16 h-16 rounded-md object-cover flex-shrink-0 border border-white/10 group-hover:border-babun-accent/40 transition-all duration-300 shadow-md group-hover:scale-[1.03]"
                  referrerPolicy="no-referrer"
                />
                <div className="flex flex-col min-w-0">
                  <span className="line-clamp-2 leading-snug font-normal text-white/90 group-hover:text-babun-accent transition-colors text-sm">
                    שוק הנדל"ן 2026: מה באמת קורה מאחורי הקלעים?
                  </span>
                  <span className="text-xs text-white/30 mt-1">15.05.2026 • טור שבועי</span>
                </div>
              </Link>
              
              <Link to="/articles" className="group flex items-center gap-4 hover:text-babun-accent transition-colors w-full border-t border-white/5 pt-4">
                <img 
                  src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=80&h=80&q=50" 
                  alt="מדריך למשקיע" 
                  className="w-16 h-16 rounded-md object-cover flex-shrink-0 border border-white/10 group-hover:border-babun-accent/40 transition-all duration-300 shadow-md group-hover:scale-[1.03]"
                  referrerPolicy="no-referrer"
                />
                <div className="flex flex-col min-w-0">
                  <span className="line-clamp-2 leading-snug font-normal text-white/90 group-hover:text-babun-accent transition-colors text-sm">
                    המדריך המלא למשקיע המתחיל: איך לא ליפול בפח?
                  </span>
                  <span className="text-xs text-white/30 mt-1">10.05.2026 • מאמר מקצועי</span>
                </div>
              </Link>

              <Link to="/articles" className="group flex items-center gap-4 hover:text-babun-accent transition-colors w-full border-t border-white/5 pt-4">
                <img 
                  src="https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=80&h=80&q=50" 
                  alt="פודקאסט התחדשות עירונית" 
                  className="w-16 h-16 rounded-md object-cover flex-shrink-0 border border-white/10 group-hover:border-babun-accent/40 transition-all duration-300 shadow-md group-hover:scale-[1.03]"
                  referrerPolicy="no-referrer"
                />
                <div className="flex flex-col min-w-0">
                  <span className="line-clamp-2 leading-snug font-normal text-white/90 group-hover:text-babun-accent transition-colors text-sm">
                    פודקאסט: למה כולם מדברים על התחדשות עירונית?
                  </span>
                  <span className="text-xs text-white/30 mt-1">05.05.2026 • פודקאסט</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row-reverse justify-between items-center gap-6 text-[11px] font-bold uppercase tracking-widest text-white/20">
          <p dir="ltr">© {new Date().getFullYear()} RAINITZ NADLAN. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <Link to="/contact" className="hover:text-white transition-colors">מדיניות פרטיות</Link>
            <Link to="/contact" className="hover:text-white transition-colors">הצהרת נגישות</Link>
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
