import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calculator, Wallet, DollarSign, Clock, Home, Landmark, PiggyBank, BarChart3 } from "lucide-react";

// Individual Calculator Components
const ProfitCalc = () => {
  const [purchasePrice, setPurchasePrice] = useState(1500000);
  const [salePrice, setSalePrice] = useState(1800000);
  const [expenses, setExpenses] = useState(100000);
  
  const profit = salePrice - purchasePrice - expenses;
  const yield_pct = (profit / purchasePrice) * 100;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-right">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-xl font-display font-bold">מחשבון כדאיות עסקה</h3>
          <div className="space-y-4">
            <label className="block text-[10px] uppercase font-bold opacity-40">מחיר רכישה (₪)</label>
            <input type="number" value={purchasePrice} onChange={e => setPurchasePrice(Number(e.target.value))} className="w-full bg-babun-light p-4 outline-none border-b border-babun-primary/10 text-right" />
            <label className="block text-[10px] uppercase font-bold opacity-40">מחיר מכירה צפוי (₪)</label>
            <input type="number" value={salePrice} onChange={e => setSalePrice(Number(e.target.value))} className="w-full bg-babun-light p-4 outline-none border-b border-babun-primary/10 text-right" />
            <label className="block text-[10px] uppercase font-bold opacity-40">שיפוצים והוצאות נלוות (₪)</label>
             <input type="number" value={expenses} onChange={e => setExpenses(Number(e.target.value))} className="w-full bg-babun-light p-4 outline-none border-b border-babun-primary/10 text-right" />
          </div>
        </div>
        
        <div className="bg-babun-primary text-white p-12 flex flex-col justify-center items-center text-center rounded-babun-md relative overflow-hidden">
          <div className="text-xs uppercase tracking-[0.3em] opacity-50 mb-4">רווח משוער</div>
          <div className="text-6xl font-display font-black text-babun-accent mb-4">₪{profit.toLocaleString()}</div>
          <div className="w-full h-px bg-white/10 my-6" />
          <div className="text-2xl font-display font-bold text-white mb-2">{yield_pct.toFixed(1)}%</div>
          <div className="text-[10px] uppercase tracking-widest opacity-40">תשואה על ההון</div>
          <BarChart3 className="absolute -bottom-4 -left-4 text-white/5" size={120} />
        </div>
      </div>
    </div>
  );
};

const MortgageCalc = () => {
  const [loan, setLoan] = useState(800000);
  const [interest, setInterest] = useState(4.5);
  const [years, setYears] = useState(25);

  const monthlyRate = interest / 100 / 12;
  const numPayments = years * 12;
  const monthlyPayment = (loan * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);

  return (
    <div className="space-y-8 text-right">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="space-y-6">
            <h3 className="text-xl font-display font-bold">מחשבון משכנתא</h3>
            <div className="space-y-4">
               <label className="block text-[10px] uppercase font-bold opacity-40">סכום ההלוואה (₪)</label>
               <input type="number" value={loan} onChange={e => setLoan(Number(e.target.value))} className="w-full bg-babun-light p-4 outline-none border-b border-babun-primary/10 text-right" />
               <label className="block text-[10px] uppercase font-bold opacity-40">ריבית שנתית משוערת (%)</label>
               <input type="number" value={interest} step="0.1" onChange={e => setInterest(Number(e.target.value))} className="w-full bg-babun-light p-4 outline-none border-b border-babun-primary/10 text-right" />
               <label className="block text-[10px] uppercase font-bold opacity-40">תקופה (שנים)</label>
               <input type="number" value={years} onChange={e => setYears(Number(e.target.value))} className="w-full bg-babun-light p-4 outline-none border-b border-babun-primary/10 text-right" />
            </div>
         </div>
         <div className="bg-babun-primary text-white p-12 flex flex-col justify-center items-center text-center rounded-babun-md relative overflow-hidden">
            <div className="text-xs uppercase tracking-[0.3em] opacity-50 mb-4">החזר חודשי משוער</div>
            <div className="text-5xl font-display font-black text-babun-accent mb-4">₪{monthlyPayment.toFixed(0).toLocaleString()}</div>
            <div className="w-full h-px bg-white/10 my-6" />
            <div className="text-xs opacity-60 italic">סה"כ החזר: ₪{(monthlyPayment * numPayments).toFixed(0).toLocaleString()}</div>
            <Landmark className="absolute -bottom-4 -left-4 text-white/5" size={120} />
         </div>
      </div>
    </div>
  );
};

const BudgetCalc = () => {
  const [capital, setCapital] = useState(500000);
  const [financing, setFinancing] = useState(75);
  const [buffer, setBuffer] = useState(100000);

  const totalBudget = (capital / (1 - financing / 100)) - buffer;

  return (
    <div className="space-y-8 text-right">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-xl font-display font-bold">מחשבון תקציב רכישה מקסימלי</h3>
          <div className="space-y-4">
            <label className="block text-[10px] uppercase font-bold opacity-40">הון עצמי זמין (₪)</label>
            <input type="number" value={capital} onChange={e => setCapital(Number(e.target.value))} className="w-full bg-babun-light p-4 outline-none border-b border-babun-primary/10 text-right" />
            <label className="block text-[10px] uppercase font-bold opacity-40">אחוז מימון מבוקש (%)</label>
            <input type="number" value={financing} onChange={e => setFinancing(Number(e.target.value))} className="w-full bg-babun-light p-4 outline-none border-b border-babun-primary/10 text-right" />
            <label className="block text-[10px] uppercase font-bold opacity-40">בצ״מ והוצאות נלוות (₪)</label>
            <input type="number" value={buffer} onChange={e => setBuffer(Number(e.target.value))} className="w-full bg-babun-light p-4 outline-none border-b border-babun-primary/10 text-right" />
          </div>
        </div>
        <div className="bg-babun-primary text-white p-12 flex flex-col justify-center items-center text-center rounded-babun-md relative overflow-hidden">
          <div className="text-xs uppercase tracking-[0.3em] opacity-50 mb-4">תקציב רכישה מירבי</div>
          <div className="text-5xl font-display font-black text-babun-accent mb-4">₪{Math.max(0, totalBudget).toFixed(0).toLocaleString()}</div>
          <div className="w-full h-px bg-white/10 my-6" />
          <div className="text-xs opacity-60 italic">כולל משכנתא צפויה של ₪{Math.max(0, totalBudget - capital).toFixed(0).toLocaleString()}</div>
          <Wallet className="absolute -bottom-4 -left-4 text-white/5" size={120} />
        </div>
      </div>
    </div>
  );
};

const CompoundCalc = () => {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(6);
  const [years, setYears] = useState(20);
  const [monthly, setMonthly] = useState(1000);

  let total = principal;
  for (let i = 0; i < years * 12; i++) {
    total = (total + monthly) * (1 + (rate / 100 / 12));
  }

  return (
    <div className="space-y-8 text-right">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-xl font-display font-bold">מחשבון ריבית דריבית (הון לעתיד)</h3>
          <div className="space-y-4">
            <label className="block text-[10px] uppercase font-bold opacity-40">סכום התחלתי (₪)</label>
            <input type="number" value={principal} onChange={e => setPrincipal(Number(e.target.value))} className="w-full bg-babun-light p-4 outline-none border-b border-babun-primary/10 text-right" />
            <label className="block text-[10px] uppercase font-bold opacity-40">אופק השקעה (שנים)</label>
            <input type="number" value={years} onChange={e => setYears(Number(e.target.value))} className="w-full bg-babun-light p-4 outline-none border-b border-babun-primary/10 text-right" />
            <label className="block text-[10px] uppercase font-bold opacity-40">הפקדה חודשית (₪)</label>
            <input type="number" value={monthly} onChange={e => setMonthly(Number(e.target.value))} className="w-full bg-babun-light p-4 outline-none border-b border-babun-primary/10 text-right" />
            <label className="block text-[10px] uppercase font-bold opacity-40">תשואה שנתית משוערת (%)</label>
            <input type="number" value={rate} step="0.1" onChange={e => setRate(Number(e.target.value))} className="w-full bg-babun-light p-4 outline-none border-b border-babun-primary/10 text-right" />
          </div>
        </div>
        <div className="bg-babun-primary text-white p-12 flex flex-col justify-center items-center text-center rounded-babun-md relative overflow-hidden">
          <div className="text-xs uppercase tracking-[0.3em] opacity-50 mb-4">הון מצטבר צפוי</div>
          <div className="text-5xl font-display font-black text-babun-accent mb-4">₪{total.toFixed(0).toLocaleString()}</div>
          <div className="w-full h-px bg-white/10 my-6" />
          <div className="text-xs opacity-60 italic">סה"כ הפקדות: ₪{(principal + monthly * years * 12).toLocaleString()}</div>
          <PiggyBank className="absolute -bottom-4 -left-4 text-white/5" size={120} />
        </div>
      </div>
    </div>
  );
};

export default function Calculators() {
  const [activeTab, setActiveTab] = useState("profit");

  const tabs = [
    { id: "profit", name: "כדאיות עסקה", icon: Home },
    { id: "mortgage", name: "משכנתא", icon: Landmark },
    { id: "budget", name: "תקציב רכישה", icon: Wallet },
    { id: "compound", name: "ריבית דריבית", icon: PiggyBank }
  ];

  return (
    <div className="bg-babun-light min-h-screen">
      {/* PAGE HERO */}
      <section className="bg-babun-primary text-white pt-48 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 mesh-grid opacity-20 z-0" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 text-right">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8 border-b border-white/10 pb-20">
            <div className="max-w-3xl">
              <span className="inline-block text-[11px] font-bold uppercase tracking-[0.5em] text-babun-accent mb-6 px-4 py-1.5 border border-babun-accent/20 bg-babun-accent/5">
                Financial Reality Check
              </span>
              <h1 className="text-6xl md:text-8xl font-display font-black leading-[0.9] text-white mb-8 lowercase tracking-tighter">
                Calculators.
              </h1>
            </div>
            <div className="lg:max-w-md pt-12">
              <p className="text-white/60 text-lg leading-relaxed font-light">
                חשב לפני שאתה חותם. ארבעה מחשבונים מקצועיים שיעזרו לך להבין את התמונה הפיננסית המלאה לפני כל צעד.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-24">
        <div className="flex flex-wrap justify-center gap-6 mb-20">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group flex items-center gap-4 px-10 py-5 text-[10px] font-black tracking-[0.3em] uppercase transition-all duration-500 relative overflow-hidden rounded-babun-sm ${
                activeTab === tab.id 
                  ? "bg-babun-primary text-white shadow-2xl shadow-babun-primary/20" 
                  : "bg-white text-babun-primary border border-babun-primary/5 hover:border-babun-accent"
              }`}
            >
              <tab.icon size={14} className={activeTab === tab.id ? "text-babun-accent" : "opacity-40"} />
              {tab.name}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-babun-accent" />
              )}
            </button>
          ))}
        </div>

        <div className="bg-white p-10 md:p-20 shadow-2xl shadow-babun-primary/5 relative overflow-hidden rounded-babun-lg min-h-[500px]">
          <div className="absolute inset-4 border border-babun-primary/5 pointer-events-none" />
          
          <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               transition={{ duration: 0.5 }}
               className="relative z-10"
             >
                {activeTab === "profit" && <ProfitCalc />}
                {activeTab === "mortgage" && <MortgageCalc />}
                {activeTab === "budget" && <BudgetCalc />}
                {activeTab === "compound" && <CompoundCalc />}
             </motion.div>
          </AnimatePresence>
        </div>
        
        <div className="mt-16 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-babun-primary/30 max-w-2xl mx-auto leading-relaxed">
              * החישובים מבוססים על הערכות כלליות בלבד. לחישוב מדויק יש להתייעץ עם יועץ משכנתאות או שמאי מוסמך.
            </p>
        </div>
      </div>
    </div>
  );
}

