import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calculator, 
  Wallet, 
  Percent, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Coins, 
  Clock, 
  Home, 
  Landmark, 
  PiggyBank, 
  HelpCircle, 
  Info, 
  Plus, 
  Trash2, 
  Save, 
  Check, 
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  User,
  Phone,
  Mail,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  Briefcase,
  Layers,
  Award
} from "lucide-react";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { syncLeadToBackend } from "../lib/leadSync";

interface SavedDeal {
  id: string;
  name: string;
  purchasePrice: number;
  expectedSalePrice: number;
  renovationCost: number;
  loanRatio: number;
  interestRate: number;
  projectMonths: number;
  netProfit: number;
  roi: number;
  totalEquityRequired: number;
  createdAt: number;
}

export default function Calculators() {
  // --- active step wizard state ---
  const [activeStep, setActiveStep] = useState<number>(0);

  // --- 1. CORE CALCULATOR STATES ---
  const [purchasePrice, setPurchasePrice] = useState<number>(1500000);
  const [purchaseTaxRate, setPurchaseTaxRate] = useState<number>(8); // e.g. 8% for secondary home
  const [customPurchaseTax, setCustomPurchaseTax] = useState<boolean>(false);
  const [purchaseTaxAmountInput, setPurchaseTaxAmountInput] = useState<number>(120000);
  
  const [lawyerBuyRate, setLawyerBuyRate] = useState<number>(0.5); // % of purchase price
  const [brokerBuyRate, setBrokerBuyRate] = useState<number>(2); // % of purchase price
  const [otherBuyCosts, setOtherBuyCosts] = useState<number>(15000); // appraisal, inspection, etc.

  // Renovation
  const [renovationCost, setRenovationCost] = useState<number>(180000);
  const [contingencyRate, setContingencyRate] = useState<number>(10); // % of renovation
  const [otherRehabCosts, setOtherRehabCosts] = useState<number>(15000); // supervisor, architecture, design

  // Financing
  const [loanRatio, setLoanRatio] = useState<number>(60); // % of purchase price financed
  const [interestRate, setInterestRate] = useState<number>(6.5); // annual interest %
  const [projectMonths, setProjectMonths] = useState<number>(12); // project duration
  const [financingFees, setFinancingFees] = useState<number>(5000); // advisor, mortgage file fees

  // Exit & Sales
  const [expectedSalePrice, setExpectedSalePrice] = useState<number>(2200000);
  const [lawyerSellRate, setLawyerSellRate] = useState<number>(0.5); // % of sale price
  const [brokerSellRate, setBrokerSellRate] = useState<number>(2); // % of sale price
  const [bettermentLevy, setBettermentLevy] = useState<number>(0); // היטל השבחה
  const [otherSellCosts, setOtherSellCosts] = useState<number>(5000);
  const [exemptFromCapitalGains, setExemptFromCapitalGains] = useState<boolean>(false); // פטור ממס שבח

  // --- 2. LOCAL PERSISTENCE (SAVED DEALS) ---
  const [savedDeals, setSavedDeals] = useState<SavedDeal[]>([]);
  const [dealName, setDealName] = useState<string>("");
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // --- 3. LEAD GENERATION FORM STATES ---
  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [leadMessage, setLeadMessage] = useState<string>("");
  const [isSubmittingLead, setIsSubmittingLead] = useState<boolean>(false);
  const [leadSuccess, setLeadSuccess] = useState<boolean>(false);
  const [leadError, setLeadError] = useState<string>("");

  // Load saved deals on mount
  useEffect(() => {
    const local = localStorage.getItem("babun_saved_flip_deals");
    if (local) {
      try {
        setSavedDeals(JSON.parse(local));
      } catch (e) {
        console.error("Error parsing saved deals", e);
      }
    }
  }, []);

  // --- 4. CALCULATION LOGIC ---
  const purchaseTaxAmount = customPurchaseTax 
    ? purchaseTaxAmountInput 
    : (purchasePrice * purchaseTaxRate) / 100;
    
  const lawyerBuyAmount = (purchasePrice * lawyerBuyRate) / 100;
  const brokerBuyAmount = (purchasePrice * brokerBuyRate) / 100;
  
  const totalBuyCosts = purchaseTaxAmount + lawyerBuyAmount + brokerBuyAmount + otherBuyCosts;

  const contingencyAmount = (renovationCost * contingencyRate) / 100;
  const totalRenovationCosts = renovationCost + contingencyAmount + otherRehabCosts;

  const loanAmount = (purchasePrice * loanRatio) / 100;
  const interestCost = loanAmount * (interestRate / 100) * (projectMonths / 12);
  const totalFinancingCosts = interestCost + financingFees;

  const lawyerSellAmount = (expectedSalePrice * lawyerSellRate) / 100;
  const brokerSellAmount = (expectedSalePrice * brokerSellRate) / 100;
  const totalSellCosts = lawyerSellAmount + brokerSellAmount + bettermentLevy + otherSellCosts;

  // Capital Gains Tax (מס שבח)
  const totalDeductibleExpenses = totalBuyCosts + totalRenovationCosts + totalFinancingCosts + totalSellCosts;
  const taxableGain = expectedSalePrice - purchasePrice - totalDeductibleExpenses;
  const capitalGainsTax = (!exemptFromCapitalGains && taxableGain > 0) 
    ? Math.round(taxableGain * 0.25) 
    : 0;

  const finalProjectCost = purchasePrice + totalDeductibleExpenses + capitalGainsTax;
  const netProfit = expectedSalePrice - finalProjectCost;

  // The total out-of-pocket equity needed is everything not covered by the mortgage
  const totalEquityRequired = Math.max(0, finalProjectCost - loanAmount);
  
  // Return on Investment / Return on Equity
  const roi = totalEquityRequired > 0 ? (netProfit / totalEquityRequired) * 100 : 0;
  const annualizedROI = projectMonths > 0 ? roi * (12 / projectMonths) : 0;

  // Percentage breakdown for visualization
  const totalCostBreakdown = purchasePrice + totalBuyCosts + totalRenovationCosts + totalFinancingCosts + totalSellCosts + capitalGainsTax;
  const purchasePercent = totalCostBreakdown > 0 ? (purchasePrice / totalCostBreakdown) * 100 : 0;
  const rehabPercent = totalCostBreakdown > 0 ? (totalRenovationCosts / totalCostBreakdown) * 100 : 0;
  const taxesFeesPercent = totalCostBreakdown > 0 ? ((totalBuyCosts + totalSellCosts + capitalGainsTax) / totalCostBreakdown) * 100 : 0;
  const financingPercent = totalCostBreakdown > 0 ? (totalFinancingCosts / totalCostBreakdown) * 100 : 0;

  // --- 5. INTERACTIVE FUNCTIONS ---
  const saveDeal = () => {
    if (!dealName.trim()) {
      alert("נא להזין שם עבור העסקה");
      return;
    }

    const newDeal: SavedDeal = {
      id: Math.random().toString(36).substring(2, 9),
      name: dealName,
      purchasePrice,
      expectedSalePrice,
      renovationCost,
      loanRatio,
      interestRate,
      projectMonths,
      netProfit,
      roi,
      totalEquityRequired,
      createdAt: Date.now()
    };

    const updated = [newDeal, ...savedDeals];
    setSavedDeals(updated);
    localStorage.setItem("babun_saved_flip_deals", JSON.stringify(updated));
    setDealName("");
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const deleteDeal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedDeals.filter(d => d.id !== id);
    setSavedDeals(updated);
    localStorage.setItem("babun_saved_flip_deals", JSON.stringify(updated));
  };

  const loadDeal = (deal: SavedDeal) => {
    setPurchasePrice(deal.purchasePrice);
    setExpectedSalePrice(deal.expectedSalePrice);
    setRenovationCost(deal.renovationCost);
    setLoanRatio(deal.loanRatio);
    setInterestRate(deal.interestRate);
    setProjectMonths(deal.projectMonths);
    // Switch to step 4 (summary report) upon load for immediate review
    setActiveStep(4);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !email) {
      setLeadError("נא למלא את כל שדות החובה (שם, טלפון ומייל)");
      return;
    }

    setIsSubmittingLead(true);
    setLeadError("");

    try {
      await addDoc(collection(db, "deal_leads"), {
        fullName,
        phone,
        email,
        message: leadMessage,
        dealDetails: {
          purchasePrice,
          expectedSalePrice,
          renovationCost,
          loanRatio,
          interestRate,
          projectMonths,
          netProfit,
          roi,
          totalEquityRequired,
        },
        createdAt: serverTimestamp(),
      });

      // Synchronize with backend (Plando & Email notification)
      await syncLeadToBackend({
        name: fullName,
        phone,
        email,
        message: leadMessage || "ליד שנרשם לקבלת דוח סיכום עסקה במחשבון",
        source: "מחשבון פליפ בשלבים",
        tag: "מחשבון פליפ בשלבים",
        details: {
          purchasePrice,
          expectedSalePrice,
          renovationCost,
          loanRatio,
          interestRate,
          projectMonths,
          netProfit,
          roi,
          totalEquityRequired,
        }
      });

      setIsSubmittingLead(false);
      setLeadSuccess(true);
      setFullName("");
      setPhone("");
      setEmail("");
      setLeadMessage("");
    } catch (err: any) {
      console.error("Error submitting lead: ", err);
      setLeadError("אירעה שגיאה בשמירת הפרטים. נא לנסות שנית.");
      setIsSubmittingLead(false);
    }
  };

  const steps = [
    { id: 0, title: "1. רכישה", desc: "מחיר ועלויות רכישה", icon: Home },
    { id: 1, title: "2. שיפוץ", desc: "שיפוץ ובצ״מ", icon: Coins },
    { id: 2, title: "3. מימון", desc: "מינוף וזמנים", icon: Landmark },
    { id: 3, title: "4. מכירה ויציאה", desc: "מס שבח ורווחי מכירה", icon: TrendingUp },
    { id: 4, title: "5. סיכום העסקה", desc: "דו״ח מסכם ופעולות", icon: Calculator }
  ];

  return (
    <div className="bg-babun-light min-h-screen font-sans antialiased selection:bg-babun-accent/30 selection:text-babun-primary text-right">
      
      {/* 1. HERO SECTION WITH VIDEO BACKGROUND */}
      <section className="relative bg-black text-white pt-40 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none">
          <iframe
            className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto aspect-video -translate-x-1/2 -translate-y-1/2 pointer-events-none object-cover scale-150 opacity-100"
            src="https://www.youtube.com/embed/i6-AD36z860?autoplay=1&mute=1&loop=1&playlist=i6-AD36z860&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&disablekb=1&fs=0&autohide=1"
            title="Calculators Promo Background Video"
            frameBorder="0"
            allow="autoplay; encrypted-media"
          />
          <div className="absolute inset-0 bg-transparent z-[10] pointer-events-auto" />
          <div className="absolute inset-0 bg-black/75 z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/45 z-[2]" />
          <div className="absolute inset-0 mesh-grid opacity-5 z-[3]" />
        </div>

        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-babun-accent/10 rounded-full blur-[120px] pointer-events-none z-10" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 text-right">
          <div className="border-b border-white/10 pb-12">
            <div className="max-w-3xl">
              <span className="text-babun-accent font-display text-xs md:text-sm tracking-[0.25em] uppercase font-bold block mb-3">מחשבון פליפ אינטראקטיבי בשלבים</span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-black leading-[0.95] text-white mb-6 tracking-tighter drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                מחשבון עסקת פליפ.
              </h1>
              <p className="text-zinc-300 text-sm md:text-base lg:text-lg leading-relaxed font-light drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] max-w-2xl">
                תכנון תקציב קל, נעים ויסודי בשלבים פשוטים. חשבו רווחים, הון עצמי ותשואה על ההון עבור עסקת קנייה, שיפוץ ומכירה ללא עומס מיותר בעין.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC STEPPED CALCULATOR WORKSPACE */}
      <section className="py-12 relative -mt-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          
          {/* STEP PROGRESS NAVIGATION */}
          <div className="bg-white rounded-3xl p-4 md:p-6 mb-8 border border-zinc-200/60 shadow-[0_10px_30px_rgba(0,0,0,0.03)] overflow-x-auto">
            <div className="flex items-center justify-between min-w-[700px] md:min-w-0 px-2 relative">
              
              {/* Desktop Progress Line */}
              <div className="absolute top-[28px] right-8 left-8 h-[2px] bg-zinc-100 -z-10 hidden md:block" />
              <div 
                className="absolute top-[28px] right-8 h-[2px] bg-babun-accent transition-all duration-500 -z-10 hidden md:block"
                style={{ 
                  width: `${(activeStep / (steps.length - 1)) * 100}%`,
                  right: "32px",
                  left: "auto"
                }}
              />

              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = idx < activeStep;
                const isActive = idx === activeStep;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className="flex flex-col items-center flex-1 focus:outline-none transition-all group cursor-pointer"
                  >
                    <div 
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 relative ${
                        isActive 
                          ? "bg-babun-primary text-babun-accent shadow-lg scale-110 border-2 border-babun-accent" 
                          : isCompleted 
                            ? "bg-babun-accent text-babun-primary font-bold shadow-md"
                            : "bg-zinc-50 text-zinc-400 border border-zinc-200/50 hover:bg-zinc-100/50"
                      }`}
                    >
                      {isCompleted ? (
                        <Check size={20} className="stroke-[3]" />
                      ) : (
                        <Icon size={20} className={isActive ? "stroke-[2.5]" : "stroke-[2]"} />
                      )}

                      {/* Number badge */}
                      <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${
                        isActive ? "bg-babun-accent text-babun-primary" : "bg-zinc-200 text-zinc-600"
                      }`}>
                        {idx + 1}
                      </span>
                    </div>

                    <span className={`text-xs md:text-sm font-bold mt-3 transition-colors duration-200 ${
                      isActive ? "text-babun-primary" : "text-zinc-500 group-hover:text-zinc-800"
                    }`}>
                      {step.title.split(". ")[1]}
                    </span>
                    <span className="text-[10px] text-zinc-400 hidden lg:block font-medium mt-0.5 max-w-[120px] text-center">
                      {step.desc}
                    </span>
                  </button>
                );
              })}

            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: ANIMATED ACTIVE STEP FORM (8 Columns on Large) */}
            <div className="lg:col-span-8">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-3xl p-6 md:p-8 border border-zinc-200/60 shadow-[0_10px_35px_rgba(0,0,0,0.03)] min-h-[480px] flex flex-col justify-between"
                >
                  
                  {/* STEP 1: PROPERTY PURCHASE DETAILS */}
                  {activeStep === 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-zinc-100 pb-4 mb-6">
                        <div className="w-10 h-10 rounded-full bg-babun-accent/20 flex items-center justify-center text-babun-primary shrink-0">
                          <Home size={20} className="stroke-[2.5]" />
                        </div>
                        <div>
                          <h3 className="font-display font-black text-lg text-babun-primary">שלב 1: פרטי רכישת הנכס ועלויות</h3>
                          <p className="text-xs text-zinc-400">הגדירו את מחיר קניית הנכס והעלויות הראשוניות הנלוות לעסקה</p>
                        </div>
                      </div>

                      {/* Purchase price Slider + Input */}
                      <div className="bg-zinc-50/50 p-4 rounded-2xl border border-zinc-200/30">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-black text-babun-primary">מחיר רכישת הנכס (₪)</span>
                          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-zinc-200/60">
                            <span className="text-xs font-black text-zinc-400">₪</span>
                            <input 
                              type="number" 
                              value={purchasePrice} 
                              onChange={(e) => setPurchasePrice(Math.max(0, Number(e.target.value)))}
                              className="w-28 text-left bg-transparent font-black text-babun-primary outline-none text-sm"
                            />
                          </div>
                        </div>
                        <input 
                          type="range" 
                          min="200000" 
                          max="10000000" 
                          step="50000"
                          value={purchasePrice} 
                          onChange={(e) => setPurchasePrice(Number(e.target.value))}
                          className="w-full accent-babun-primary h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-zinc-400 mt-1 font-mono">
                          <span>10,000,000 ₪</span>
                          <span>200,000 ₪</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Purchase Tax */}
                        <div className="bg-zinc-50/30 p-4 rounded-2xl border border-zinc-200/30">
                          <label className="block text-xs font-bold text-babun-primary mb-2">מס רכישה</label>
                          <div className="flex gap-2 mb-3">
                            <button 
                              type="button"
                              onClick={() => { setPurchaseTaxRate(0); setCustomPurchaseTax(false); }}
                              className={`flex-1 py-2 text-xs font-black rounded-xl border transition-all ${purchaseTaxRate === 0 && !customPurchaseTax ? "bg-babun-primary text-white border-babun-primary" : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50"}`}
                            >
                              דירה יחידה (0%)
                            </button>
                            <button 
                              type="button"
                              onClick={() => { setPurchaseTaxRate(8); setCustomPurchaseTax(false); }}
                              className={`flex-1 py-2 text-xs font-black rounded-xl border transition-all ${purchaseTaxRate === 8 && !customPurchaseTax ? "bg-babun-primary text-white border-babun-primary" : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50"}`}
                            >
                              להשקעה (8%)
                            </button>
                            <button 
                              type="button"
                              onClick={() => setCustomPurchaseTax(true)}
                              className={`flex-1 py-2 text-xs font-black rounded-xl border transition-all ${customPurchaseTax ? "bg-babun-primary text-white border-babun-primary" : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50"}`}
                            >
                              סכום ידני
                            </button>
                          </div>

                          {customPurchaseTax ? (
                            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-zinc-200">
                              <span className="text-xs text-zinc-400">סכום מס רכישה ב-₪</span>
                              <input 
                                type="number" 
                                value={purchaseTaxAmountInput}
                                onChange={(e) => setPurchaseTaxAmountInput(Math.max(0, Number(e.target.value)))}
                                className="bg-transparent text-left outline-none text-sm font-black text-babun-primary w-24"
                              />
                            </div>
                          ) : (
                            <div className="flex justify-between items-center bg-white px-3 py-2 rounded-xl border border-zinc-200">
                              <span className="text-xs text-zinc-400">אחוז מס רכישה:</span>
                              <div className="flex items-center gap-1">
                                <input 
                                  type="number" 
                                  value={purchaseTaxRate}
                                  onChange={(e) => setPurchaseTaxRate(Math.max(0, Number(e.target.value)))}
                                  className="bg-transparent text-left outline-none text-sm font-black text-babun-primary w-12"
                                />
                                <span className="text-xs text-zinc-400">%</span>
                              </div>
                            </div>
                          )}
                          <p className="text-[11px] text-zinc-400 mt-2">סך מס רכישה: <strong className="text-zinc-600 font-mono">₪{Math.round(purchaseTaxAmount).toLocaleString()}</strong></p>
                        </div>

                        {/* Broker buy */}
                        <div className="bg-zinc-50/30 p-4 rounded-2xl border border-zinc-200/30">
                          <label className="block text-xs font-bold text-babun-primary mb-2">תיווך רכישה</label>
                          <div className="flex gap-2 mb-3">
                            <button 
                              type="button"
                              onClick={() => setBrokerBuyRate(0)}
                              className={`flex-1 py-2 text-xs font-black rounded-xl border transition-all ${brokerBuyRate === 0 ? "bg-babun-primary text-white border-babun-primary" : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50"}`}
                            >
                              ללא (0%)
                            </button>
                            <button 
                              type="button"
                              onClick={() => setBrokerBuyRate(1)}
                              className={`flex-1 py-2 text-xs font-black rounded-xl border transition-all ${brokerBuyRate === 1 ? "bg-babun-primary text-white border-babun-primary" : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50"}`}
                            >
                              מופחת (1%)
                            </button>
                            <button 
                              type="button"
                              onClick={() => setBrokerBuyRate(2)}
                              className={`flex-1 py-2 text-xs font-black rounded-xl border transition-all ${brokerBuyRate === 2 ? "bg-babun-primary text-white border-babun-primary" : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50"}`}
                            >
                              סטנדרט (2%)
                            </button>
                          </div>
                          <div className="flex justify-between items-center bg-white px-3 py-2 rounded-xl border border-zinc-200">
                            <span className="text-xs text-zinc-400">אחוז תיווך:</span>
                            <div className="flex items-center gap-1">
                              <input 
                                type="number" 
                                step="0.1"
                                value={brokerBuyRate}
                                onChange={(e) => setBrokerBuyRate(Math.max(0, Number(e.target.value)))}
                                className="bg-transparent text-left outline-none text-sm font-black text-babun-primary w-12"
                              />
                              <span className="text-xs text-zinc-400">%</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-2">סך תיווך: <strong className="text-zinc-600 font-mono">₪{Math.round(brokerBuyAmount).toLocaleString()}</strong></p>
                        </div>

                        {/* Lawyer buy */}
                        <div className="bg-zinc-50/30 p-4 rounded-2xl border border-zinc-200/30">
                          <label className="block text-xs font-bold text-babun-primary mb-2">עו״ד רכישה</label>
                          <div className="flex gap-2 mb-3">
                            <button 
                              type="button"
                              onClick={() => setLawyerBuyRate(0.25)}
                              className={`flex-1 py-2 text-xs font-black rounded-xl border transition-all ${lawyerBuyRate === 0.25 ? "bg-babun-primary text-white border-babun-primary" : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50"}`}
                            >
                              מוזל (0.25%)
                            </button>
                            <button 
                              type="button"
                              onClick={() => setLawyerBuyRate(0.5)}
                              className={`flex-1 py-2 text-xs font-black rounded-xl border transition-all ${lawyerBuyRate === 0.5 ? "bg-babun-primary text-white border-babun-primary" : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50"}`}
                            >
                              ממוצע (0.5%)
                            </button>
                            <button 
                              type="button"
                              onClick={() => setLawyerBuyRate(1)}
                              className={`flex-1 py-2 text-xs font-black rounded-xl border transition-all ${lawyerBuyRate === 1 ? "bg-babun-primary text-white border-babun-primary" : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50"}`}
                            >
                              מלא (1%)
                            </button>
                          </div>
                          <div className="flex justify-between items-center bg-white px-3 py-2 rounded-xl border border-zinc-200">
                            <span className="text-xs text-zinc-400">שכ״ט עו״ד:</span>
                            <div className="flex items-center gap-1">
                              <input 
                                type="number" 
                                step="0.05"
                                value={lawyerBuyRate}
                                onChange={(e) => setLawyerBuyRate(Math.max(0, Number(e.target.value)))}
                                className="bg-transparent text-left outline-none text-sm font-black text-babun-primary w-12"
                              />
                              <span className="text-xs text-zinc-400">%</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-2">שכ״ט עו״ד מחושב: <strong className="text-zinc-600 font-mono">₪{Math.round(lawyerBuyAmount).toLocaleString()}</strong></p>
                        </div>

                        {/* Other acquisition costs */}
                        <div className="bg-zinc-50/30 p-4 rounded-2xl border border-zinc-200/30 flex flex-col justify-between">
                          <label className="block text-xs font-bold text-babun-primary mb-2">אגרות, שמאי ובדק בית</label>
                          <div className="flex items-center justify-between bg-white px-3 py-3 rounded-xl border border-zinc-200">
                            <span className="text-xs text-zinc-400">הוצאות קטנות לרכישה:</span>
                            <div className="flex items-center gap-1">
                              <input 
                                type="number" 
                                value={otherBuyCosts}
                                onChange={(e) => setOtherBuyCosts(Math.max(0, Number(e.target.value)))}
                                className="bg-transparent text-left outline-none text-sm font-black text-babun-primary w-24"
                              />
                              <span className="text-xs text-zinc-400">₪</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-2">אגרות רישום בטאבו, שמאי בנק וכו׳</p>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* STEP 2: RENOVATION & IMPROVEMENT */}
                  {activeStep === 1 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-zinc-100 pb-4 mb-6">
                        <div className="w-10 h-10 rounded-full bg-babun-accent/20 flex items-center justify-center text-babun-primary shrink-0">
                          <Coins size={20} className="stroke-[2.5]" />
                        </div>
                        <div>
                          <h3 className="font-display font-black text-lg text-babun-primary">שלב 2: תקציב שיפוץ והשבחה</h3>
                          <p className="text-xs text-zinc-400">הגדירו תקציבי עבודות קבלן, אדריכלות ותוספות לבלתי צפוי מראש</p>
                        </div>
                      </div>

                      {/* Renovation price Slider + Input */}
                      <div className="bg-zinc-50/50 p-4 rounded-2xl border border-zinc-200/30">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-black text-babun-primary">תקציב שיפוץ בסיסי (₪)</span>
                          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-zinc-200/60">
                            <span className="text-xs font-black text-zinc-400">₪</span>
                            <input 
                              type="number" 
                              value={renovationCost} 
                              onChange={(e) => setRenovationCost(Math.max(0, Number(e.target.value)))}
                              className="w-24 text-left bg-transparent font-black text-babun-primary outline-none text-sm"
                            />
                          </div>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="1500000" 
                          step="10000"
                          value={renovationCost} 
                          onChange={(e) => setRenovationCost(Number(e.target.value))}
                          className="w-full accent-babun-primary h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-zinc-400 mt-1 font-mono">
                          <span>1,500,000 ₪</span>
                          <span>0 ₪</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Contingency / בצ"מ */}
                        <div className="bg-zinc-50/30 p-4 rounded-2xl border border-zinc-200/30">
                          <label className="block text-xs font-bold text-babun-primary mb-2">רזרבת בצ״מ - בלתי צפוי מראש (% מהשיפוץ)</label>
                          <div className="flex justify-between items-center bg-white px-3 py-2.5 rounded-xl border border-zinc-200">
                            <div className="flex gap-1.5 items-center">
                              <input 
                                type="number" 
                                value={contingencyRate}
                                onChange={(e) => setContingencyRate(Math.min(100, Math.max(0, Number(e.target.value))))}
                                className="bg-transparent text-left outline-none text-sm font-black text-babun-primary w-12"
                              />
                              <span className="text-xs text-zinc-400">%</span>
                            </div>
                            <span className="text-xs text-zinc-400 font-bold">שיעור בצ״מ:</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="30" 
                            step="5"
                            value={contingencyRate} 
                            onChange={(e) => setContingencyRate(Number(e.target.value))}
                            className="w-full accent-babun-primary h-1 bg-zinc-200 rounded-lg mt-2 cursor-pointer"
                          />
                          <p className="text-[11px] text-zinc-400 mt-2">הקצאה כספית לבצ״מ: <strong className="text-zinc-600 font-mono">₪{Math.round(contingencyAmount).toLocaleString()}</strong></p>
                        </div>

                        {/* Architecture and supervisor */}
                        <div className="bg-zinc-50/30 p-4 rounded-2xl border border-zinc-200/30 flex flex-col justify-between">
                          <label className="block text-xs font-bold text-babun-primary mb-2">אדריכלות, עיצוב פנים ופיקוח</label>
                          <div className="flex items-center justify-between bg-white px-3 py-2.5 rounded-xl border border-zinc-200 h-[44px]">
                            <span className="text-xs text-zinc-400">מעצב, הנדסה ופיקוח:</span>
                            <div className="flex items-center gap-1">
                              <input 
                                type="number" 
                                value={otherRehabCosts}
                                onChange={(e) => setOtherRehabCosts(Math.max(0, Number(e.target.value)))}
                                className="bg-transparent text-left outline-none text-sm font-black text-babun-primary w-24"
                              />
                              <span className="text-xs text-zinc-400">₪</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-2">הלבשת הבית (הום סטיילינג), אדריכל וייעוץ הנדסי</p>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* STEP 3: FINANCING & MORTGAGE */}
                  {activeStep === 2 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-zinc-100 pb-4 mb-6">
                        <div className="w-10 h-10 rounded-full bg-babun-accent/20 flex items-center justify-center text-babun-primary shrink-0">
                          <Landmark size={20} className="stroke-[2.5]" />
                        </div>
                        <div>
                          <h3 className="font-display font-black text-lg text-babun-primary">שלב 3: נתוני מימון, משכנתא וזמן</h3>
                          <p className="text-xs text-zinc-400">חשבו את שיעורי המינוף, גובה הריבית ומשך זמן העבודה</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* Financing Ratio Slider */}
                        <div className="bg-zinc-50/50 p-4 rounded-2xl border border-zinc-200/30 space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-bold text-babun-primary">אחוז מימון / מינוף בנקאי</span>
                              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-zinc-200/50">
                                <input 
                                  type="number" 
                                  value={loanRatio} 
                                  onChange={(e) => setLoanRatio(Math.min(100, Math.max(0, Number(e.target.value))))}
                                  className="w-10 text-left bg-transparent font-black text-babun-primary outline-none text-xs"
                                />
                                <span className="text-[10px] text-zinc-400">%</span>
                              </div>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max="85" 
                              step="5"
                              value={loanRatio} 
                              onChange={(e) => setLoanRatio(Number(e.target.value))}
                              className="w-full accent-babun-primary h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                            />
                            <p className="text-[11px] text-zinc-400 mt-2">סכום משכנתא: <strong className="text-zinc-600 font-mono">₪{Math.round(loanAmount).toLocaleString()}</strong></p>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-bold text-babun-primary">ריבית שנתית ממוצעת (%)</span>
                              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-zinc-200/50">
                                <input 
                                  type="number" 
                                  step="0.1"
                                  value={interestRate} 
                                  onChange={(e) => setInterestRate(Math.max(0, Number(e.target.value)))}
                                  className="w-12 text-left bg-transparent font-black text-babun-primary outline-none text-xs"
                                />
                                <span className="text-[10px] text-zinc-400">%</span>
                              </div>
                            </div>
                            <input 
                              type="range" 
                              min="2" 
                              max="15" 
                              step="0.25"
                              value={interestRate} 
                              onChange={(e) => setInterestRate(Number(e.target.value))}
                              className="w-full accent-babun-primary h-1 bg-zinc-200 rounded-lg cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Duration and Fees */}
                        <div className="bg-zinc-50/50 p-4 rounded-2xl border border-zinc-200/30 space-y-4 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-bold text-babun-primary">משך פרויקט משוער (חודשים)</span>
                              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-zinc-200/50">
                                <input 
                                  type="number" 
                                  value={projectMonths} 
                                  onChange={(e) => setProjectMonths(Math.max(1, Number(e.target.value)))}
                                  className="w-8 text-left bg-transparent font-black text-babun-primary outline-none text-xs"
                                />
                                <span className="text-[10px] text-zinc-400">חודש</span>
                              </div>
                            </div>
                            <input 
                              type="range" 
                              min="1" 
                              max="36" 
                              step="1"
                              value={projectMonths} 
                              onChange={(e) => setProjectMonths(Number(e.target.value))}
                              className="w-full accent-babun-primary h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                            />
                            <p className="text-[11px] text-zinc-400 mt-2">סה״כ עלות ריבית לתקופה: <strong className="text-zinc-600 font-mono">₪{Math.round(interestCost).toLocaleString()}</strong></p>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-babun-primary mb-1">הוצאות מימון נלוות</label>
                            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-zinc-200 h-[36px]">
                              <span className="text-[11px] text-zinc-400">יועץ משכנתאות, דמי תיק:</span>
                              <div className="flex items-center gap-1">
                                <input 
                                  type="number" 
                                  value={financingFees}
                                  onChange={(e) => setFinancingFees(Math.max(0, Number(e.target.value)))}
                                  className="bg-transparent text-left outline-none text-xs font-black text-babun-primary w-20"
                                />
                                <span className="text-xs text-zinc-400">₪</span>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* STEP 4: SALES AND EXIT TAXES */}
                  {activeStep === 3 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-zinc-100 pb-4 mb-6">
                        <div className="w-10 h-10 rounded-full bg-babun-accent/20 flex items-center justify-center text-babun-primary shrink-0">
                          <TrendingUp size={20} className="stroke-[2.5]" />
                        </div>
                        <div>
                          <h3 className="font-display font-black text-lg text-babun-primary">שלב 4: שלב המכירה, מיסוי ויציאה</h3>
                          <p className="text-xs text-zinc-400">הערכת שווי נכס במכירה, מס שבח, עלויות תיווך ומכירה נלוות</p>
                        </div>
                      </div>

                      {/* Expected sale price Slider + Input */}
                      <div className="bg-zinc-50/50 p-4 rounded-2xl border border-zinc-200/30">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-black text-babun-primary">מחיר מכירה צפוי (₪)</span>
                          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-zinc-200/60">
                            <span className="text-xs font-black text-zinc-400">₪</span>
                            <input 
                              type="number" 
                              value={expectedSalePrice} 
                              onChange={(e) => setExpectedSalePrice(Math.max(0, Number(e.target.value)))}
                              className="w-28 text-left bg-transparent font-black text-babun-primary outline-none text-sm"
                            />
                          </div>
                        </div>
                        <input 
                          type="range" 
                          min="300000" 
                          max="15000000" 
                          step="50000"
                          value={expectedSalePrice} 
                          onChange={(e) => setExpectedSalePrice(Number(e.target.value))}
                          className="w-full accent-babun-primary h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-zinc-400 mt-1 font-mono">
                          <span>15,000,000 ₪</span>
                          <span>300,000 ₪</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Exemption checkbox */}
                        <div className="bg-zinc-50/30 p-4 rounded-2xl border border-zinc-200/30">
                          <label className="block text-xs font-bold text-babun-primary mb-2">מס שבח (25% מהרווח)</label>
                          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-zinc-200">
                            <input 
                              type="checkbox" 
                              id="exempt-cap-gains"
                              checked={exemptFromCapitalGains}
                              onChange={(e) => setExemptFromCapitalGains(e.target.checked)}
                              className="w-4 h-4 accent-babun-primary cursor-pointer"
                            />
                            <label htmlFor="exempt-cap-gains" className="text-xs font-bold text-babun-primary cursor-pointer select-none">
                              יש לי פטור ממס שבח בעסקה זו
                            </label>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
                            {exemptFromCapitalGains 
                              ? "פטור ממס שבח מופעל. לא יחושב ניכוי של 25% מהרווח הריאלי." 
                              : `מס שבח משוער: ₪${Math.round(capitalGainsTax).toLocaleString()} (מחושב לאחר הכרה בכל ההוצאות הנלוות והשיפוצים כניכוי מס)`
                            }
                          </p>
                        </div>

                        {/* Broker sell */}
                        <div className="bg-zinc-50/30 p-4 rounded-2xl border border-zinc-200/30">
                          <label className="block text-xs font-bold text-babun-primary mb-2">תיווך מכירה</label>
                          <div className="flex gap-2 mb-3">
                            <button 
                              type="button"
                              onClick={() => setBrokerSellRate(0)}
                              className={`flex-1 py-2 text-xs font-black rounded-xl border transition-all ${brokerSellRate === 0 ? "bg-babun-primary text-white border-babun-primary" : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50"}`}
                            >
                              ללא (0%)
                            </button>
                            <button 
                              type="button"
                              onClick={() => setBrokerSellRate(1)}
                              className={`flex-1 py-2 text-xs font-black rounded-xl border transition-all ${brokerSellRate === 1 ? "bg-babun-primary text-white border-babun-primary" : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50"}`}
                            >
                              מופחת (1%)
                            </button>
                            <button 
                              type="button"
                              onClick={() => setBrokerSellRate(2)}
                              className={`flex-1 py-2 text-xs font-black rounded-xl border transition-all ${brokerSellRate === 2 ? "bg-babun-primary text-white border-babun-primary" : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50"}`}
                            >
                              סטנדרט (2%)
                            </button>
                          </div>
                          <div className="flex justify-between items-center bg-white px-3 py-2 rounded-xl border border-zinc-200">
                            <span className="text-xs text-zinc-400">אחוז תיווך:</span>
                            <div className="flex items-center gap-1">
                              <input 
                                type="number" 
                                step="0.1"
                                value={brokerSellRate}
                                onChange={(e) => setBrokerSellRate(Math.max(0, Number(e.target.value)))}
                                className="bg-transparent text-left outline-none text-sm font-black text-babun-primary w-12"
                              />
                              <span className="text-xs text-zinc-400">%</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-2">סך תיווך במכירה: <strong className="text-zinc-600 font-mono">₪{Math.round(brokerSellAmount).toLocaleString()}</strong></p>
                        </div>

                        {/* Betterment levy */}
                        <div className="bg-zinc-50/30 p-4 rounded-2xl border border-zinc-200/30 flex flex-col justify-between">
                          <label className="block text-xs font-bold text-babun-primary mb-2">היטל השבחה לרשות המקומית</label>
                          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-zinc-200 h-[44px]">
                            <span className="text-xs text-zinc-400">היטל השבחה מוערך:</span>
                            <div className="flex items-center gap-1">
                              <input 
                                type="number" 
                                value={bettermentLevy}
                                onChange={(e) => setBettermentLevy(Math.max(0, Number(e.target.value)))}
                                className="bg-transparent text-left outline-none text-sm font-black text-babun-primary w-24"
                              />
                              <span className="text-xs text-zinc-400">₪</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-2">במידה וקיימות תב״עות משביחות או זכויות בנייה נוספות</p>
                        </div>

                        {/* Other selling costs */}
                        <div className="bg-zinc-50/30 p-4 rounded-2xl border border-zinc-200/30 flex flex-col justify-between">
                          <label className="block text-xs font-bold text-babun-primary mb-2">עו״ד והוצאות מכירה נוספות</label>
                          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-zinc-200 h-[44px]">
                            <span className="text-xs text-zinc-400">עורך דין, שיווק ופרסום:</span>
                            <div className="flex items-center gap-1">
                              <input 
                                type="number" 
                                value={otherSellCosts + lawyerSellAmount}
                                onChange={(e) => setOtherSellCosts(Math.max(0, Number(e.target.value) - lawyerSellAmount))}
                                className="bg-transparent text-left outline-none text-sm font-black text-babun-primary w-24"
                              />
                              <span className="text-xs text-zinc-400">₪</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-2">כולל שכ״ט עו״ד מכירה משוער של <strong className="text-zinc-600 font-mono">₪{Math.round(lawyerSellAmount).toLocaleString()}</strong></p>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* STEP 5: EXECUTIVE DETAILED SUMMARY REPORT */}
                  {activeStep === 4 && (
                    <div className="space-y-8">
                      <div className="flex items-center gap-3 border-b border-zinc-100 pb-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-babun-accent/20 flex items-center justify-center text-babun-primary shrink-0">
                          <Award size={20} className="stroke-[2.5]" />
                        </div>
                        <div>
                          <h3 className="font-display font-black text-lg text-babun-primary">שלב 5: דוח ניתוח פיננסי מלא</h3>
                          <p className="text-xs text-zinc-400">סיכום מפורט של כל שלבי עסקת הפליפ, כולל שמירה ופנייה לייעוץ מומחה</p>
                        </div>
                      </div>

                      {/* Detailed Calculations breakdown list */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 space-y-3">
                          <h4 className="text-xs font-black text-babun-primary/70 uppercase border-b border-zinc-200/50 pb-1.5">הוצאות רכישה וקנייה</h4>
                          <div className="flex justify-between text-xs text-zinc-600">
                            <span>מחיר קנייה:</span>
                            <span className="font-mono font-bold text-zinc-800">₪{purchasePrice.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs text-zinc-600">
                            <span>מס רכישה:</span>
                            <span className="font-mono font-bold text-zinc-800">₪{Math.round(purchaseTaxAmount).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs text-zinc-600">
                            <span>תיווך ועו״ד רכישה:</span>
                            <span className="font-mono font-bold text-zinc-800">₪{Math.round(lawyerBuyAmount + brokerBuyAmount).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs text-zinc-600">
                            <span>הוצאות קטנות לרכישה:</span>
                            <span className="font-mono font-bold text-zinc-800">₪{otherBuyCosts.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs font-black text-babun-primary border-t border-zinc-200/50 pt-1.5">
                            <span>סך הכל שלב רכישה:</span>
                            <span className="font-mono">₪{Math.round(purchasePrice + totalBuyCosts).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 space-y-3">
                          <h4 className="text-xs font-black text-babun-primary/70 uppercase border-b border-zinc-200/50 pb-1.5">עלויות שיפוץ ושיפור הנכס</h4>
                          <div className="flex justify-between text-xs text-zinc-600">
                            <span>תקציב שיפוץ בסיסי:</span>
                            <span className="font-mono font-bold text-zinc-800">₪{renovationCost.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs text-zinc-600">
                            <span>בלתי צפוי מראש (בצ״מ):</span>
                            <span className="font-mono font-bold text-zinc-800">₪{Math.round(contingencyAmount).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs text-zinc-600">
                            <span>תכנון, עיצוב ופיקוח:</span>
                            <span className="font-mono font-bold text-zinc-800">₪{otherRehabCosts.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs font-black text-babun-primary border-t border-zinc-200/50 pt-1.5">
                            <span>סך הכל שיפוץ והשבחה:</span>
                            <span className="font-mono">₪{Math.round(totalRenovationCosts).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 space-y-3">
                          <h4 className="text-xs font-black text-babun-primary/70 uppercase border-b border-zinc-200/50 pb-1.5">עלויות מימון ומשכנתא</h4>
                          <div className="flex justify-between text-xs text-zinc-600">
                            <span>סכום ההלוואה (מינוף):</span>
                            <span className="font-mono font-bold text-zinc-800">₪{Math.round(loanAmount).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs text-zinc-600">
                            <span>עלות ריבית לתקופה ({projectMonths} חודשים):</span>
                            <span className="font-mono font-bold text-zinc-800">₪{Math.round(interestCost).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs text-zinc-600">
                            <span>אגרות ודמי פתיחה:</span>
                            <span className="font-mono font-bold text-zinc-800">₪{financingFees.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs font-black text-babun-primary border-t border-zinc-200/50 pt-1.5">
                            <span>סך עלויות מימון:</span>
                            <span className="font-mono">₪{Math.round(totalFinancingCosts).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 space-y-3">
                          <h4 className="text-xs font-black text-babun-primary/70 uppercase border-b border-zinc-200/50 pb-1.5">שלב המכירה, יציאה ומיסוי</h4>
                          <div className="flex justify-between text-xs text-zinc-600">
                            <span>מחיר מכירה עתידי צפוי:</span>
                            <span className="font-mono font-bold text-emerald-600">₪{expectedSalePrice.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs text-zinc-600">
                            <span>מס שבח צפוי (25%):</span>
                            <span className="font-mono font-bold text-rose-500">₪{Math.round(capitalGainsTax).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs text-zinc-600">
                            <span>דמי תיווך במכירה:</span>
                            <span className="font-mono font-bold text-zinc-800">₪{Math.round(brokerSellAmount).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs text-zinc-600">
                            <span>היטל השבחה ועלויות עו״ד:</span>
                            <span className="font-mono font-bold text-zinc-800">₪{Math.round(bettermentLevy + lawyerSellAmount + otherSellCosts).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs font-black text-babun-primary border-t border-zinc-200/50 pt-1.5">
                            <span>סך עלויות מכירה ויציאה:</span>
                            <span className="font-mono">₪{Math.round(totalSellCosts + capitalGainsTax).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* SAVE & COMPARE DEALS (LOCAL STORAGE) */}
                      <div className="bg-zinc-50/50 rounded-2xl p-5 border border-zinc-200/50">
                        <h4 className="font-display font-black text-sm text-babun-primary mb-2 flex items-center gap-2">
                          <Save size={16} className="text-babun-primary stroke-[2.5]" />
                          שמירת החישוב הנוכחי להשוואה מהירה
                        </h4>
                        <p className="text-xs text-zinc-500 mb-4">שמור את הנתונים תחת שם נגיש כדי שתוכל להשוות ביניהם בלחיצת כפתור אחת</p>
                        
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              placeholder="הכנס שם לעסקה (למשל: הרצל 15, דירת 3 חדרים)"
                              value={dealName}
                              onChange={(e) => setDealName(e.target.value)}
                              className="flex-1 bg-white border border-zinc-200/60 rounded-xl px-3 py-2 text-xs outline-none text-right font-bold text-babun-primary focus:border-babun-primary"
                            />
                            <button 
                              onClick={saveDeal}
                              className="bg-babun-primary hover:bg-babun-primary/95 text-white font-black text-xs px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <span>שמור עסקה</span>
                              <Save size={14} />
                            </button>
                          </div>

                          {saveSuccess && (
                            <div className="p-2.5 bg-emerald-50 text-emerald-700 text-xs rounded-xl font-bold flex items-center gap-2">
                              <Check size={14} className="stroke-[3]" />
                              <span>העסקה נשמרה בהצלחה בדפדפן</span>
                            </div>
                          )}

                          {savedDeals.length > 0 && (
                            <div className="pt-3 border-t border-zinc-200/60 space-y-2 max-h-48 overflow-y-auto">
                              <span className="text-[10px] font-black uppercase text-zinc-400 block mb-1">העסקאות השמורות שלך במערכת:</span>
                              {savedDeals.map(deal => (
                                <div 
                                  key={deal.id}
                                  onClick={() => loadDeal(deal)}
                                  className="flex justify-between items-center bg-white hover:bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 transition-all cursor-pointer group text-right"
                                >
                                  <button 
                                    onClick={(e) => deleteDeal(deal.id, e)}
                                    className="text-zinc-400 hover:text-rose-500 p-1 rounded-lg transition-all"
                                    title="מחק עסקה"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                  <div className="flex-1 pr-2">
                                    <div className="text-xs font-black text-babun-primary">{deal.name}</div>
                                    <div className="text-[10px] text-zinc-400 flex justify-end gap-2 font-mono mt-0.5">
                                      <span>הון עצמי: ₪{Math.round(deal.totalEquityRequired).toLocaleString()}</span>
                                      <span>•</span>
                                      <span className="text-emerald-600 font-bold">רווח נקי: ₪{Math.round(deal.netProfit).toLocaleString()} ({deal.roi.toFixed(1)}%)</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* NAVIGATION CONTROLS */}
                  <div className="flex justify-between items-center border-t border-zinc-100 pt-6 mt-8">
                    
                    {/* Back Button */}
                    {activeStep > 0 ? (
                      <button
                        onClick={() => setActiveStep(prev => prev - 1)}
                        className="border border-zinc-200 hover:bg-zinc-50 text-zinc-700 hover:text-babun-primary font-bold text-xs md:text-sm px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2"
                      >
                        <ArrowRight size={16} />
                        <span>חזור לשלב הקודם</span>
                      </button>
                    ) : (
                      <div className="w-10" />
                    )}

                    {/* Progress Indicator Dots */}
                    <div className="flex gap-1.5">
                      {steps.map((_, idx) => (
                        <div 
                          key={idx}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            idx === activeStep 
                              ? "w-6 bg-babun-accent" 
                              : idx < activeStep 
                                ? "w-2 bg-babun-primary/40" 
                                : "w-1.5 bg-zinc-200"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Next Button / Return to start */}
                    {activeStep < steps.length - 1 ? (
                      <button
                        onClick={() => setActiveStep(prev => prev + 1)}
                        className="bg-babun-primary hover:bg-zinc-800 text-white font-bold text-xs md:text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2"
                      >
                        <span>המשך לשלב הבא</span>
                        <ArrowLeft size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveStep(0)}
                        className="bg-babun-accent hover:bg-babun-accent/90 text-babun-primary font-bold text-xs md:text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 border border-babun-primary/10"
                      >
                        <span>עדכן נתונים מחדש</span>
                        <ArrowLeft size={16} />
                      </button>
                    )}

                  </div>

                </motion.div>
              </AnimatePresence>

            </div>

            {/* RIGHT COLUMN: STICKY FLOATING METRICS DISPLAY (4 Columns on Large) */}
            <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-8">
              
              {/* STICKY LIVE RESULTS PANEL */}
              <div className="bg-babun-primary text-white rounded-3xl p-6 md:p-8 border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-4 border border-white/5 pointer-events-none rounded-2xl" />
                <div className="absolute -bottom-10 -left-10 text-white/5 pointer-events-none select-none">
                  <Calculator size={180} />
                </div>

                <div className="relative z-10 text-center space-y-6">
                  
                  {/* Metric 1: Net Profit */}
                  <div className="border-b border-white/10 pb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-babun-accent/80 block mb-1">רווח נקי משוער בעסקה</span>
                    <h2 className={`font-display font-black leading-none tracking-tight ${netProfit >= 0 ? "text-babun-accent" : "text-rose-400"}`} style={{ fontSize: "2.5rem" }}>
                      ₪{Math.round(netProfit).toLocaleString()}
                    </h2>
                    <p className="text-[11px] text-white/50 mt-2">הכנסות בניכוי כלל הוצאות הרכש, השיפוץ והמיסים</p>
                  </div>

                  {/* Dual Grid: ROI & Annualized ROI */}
                  <div className="grid grid-cols-2 gap-4 border-b border-white/10 pb-5">
                    <div className="text-right border-l border-white/10 pl-2">
                      <span className="text-[9px] font-bold text-white/60 block mb-0.5">תשואה על ההון (ROI)</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl md:text-2xl font-display font-black text-white">{roi.toFixed(1)}%</span>
                        {netProfit > 0 ? (
                          <TrendingUp size={14} className="text-babun-accent inline" />
                        ) : (
                          <TrendingDown size={14} className="text-rose-400 inline" />
                        )}
                      </div>
                    </div>
                    <div className="text-right pr-2">
                      <span className="text-[9px] font-bold text-white/60 block mb-0.5">תשואה שנתית מותאמת</span>
                      <span className="text-xl md:text-2xl font-display font-black text-babun-accent">{annualizedROI.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Metric 2: Total Equity Needed */}
                  <div className="flex justify-between items-center text-right border-b border-white/10 pb-4">
                    <div>
                      <span className="text-xs font-bold text-white">סך הון עצמי נדרש לעסקה</span>
                      <p className="text-[10px] text-white/50">השלמה כספית עצמית ללא המינוף</p>
                    </div>
                    <span className="text-lg font-display font-black text-white">
                      ₪{Math.round(totalEquityRequired).toLocaleString()}
                    </span>
                  </div>

                  {/* Metric 3: Total Project cost */}
                  <div className="flex justify-between items-center text-right border-b border-white/10 pb-4">
                    <div>
                      <span className="text-xs font-bold text-white/80">תקציב כולל לפרויקט</span>
                      <p className="text-[10px] text-white/50">שווי קנייה ועלויות כוללות</p>
                    </div>
                    <span className="text-base font-display font-bold text-white/90">
                      ₪{Math.round(finalProjectCost).toLocaleString()}
                    </span>
                  </div>

                  {/* Cost breakdown progress chart */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold text-white/60 block text-right">התפלגות עלויות הפרויקט</span>
                    <div className="w-full h-3 rounded-full overflow-hidden flex bg-white/10">
                      <div 
                        style={{ width: `${purchasePercent}%` }} 
                        className="h-full bg-amber-400 hover:opacity-90 transition-all cursor-help"
                        title={`רכישה: ${purchasePercent.toFixed(1)}%`}
                      />
                      <div 
                        style={{ width: `${rehabPercent}%` }} 
                        className="h-full bg-emerald-400 hover:opacity-90 transition-all cursor-help"
                        title={`שיפוץ: ${rehabPercent.toFixed(1)}%`}
                      />
                      <div 
                        style={{ width: `${taxesFeesPercent}%` }} 
                        className="h-full bg-blue-400 hover:opacity-90 transition-all cursor-help"
                        title={`מיסים והוצאות: ${taxesFeesPercent.toFixed(1)}%`}
                      />
                      <div 
                        style={{ width: `${financingPercent}%` }} 
                        className="h-full bg-purple-400 hover:opacity-90 transition-all cursor-help"
                        title={`מימון: ${financingPercent.toFixed(1)}%`}
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-1 text-[8px] text-white/70 font-bold">
                      <div className="flex items-center gap-1 justify-end"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> רכישה</div>
                      <div className="flex items-center gap-1 justify-end"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> שיפוץ</div>
                      <div className="flex items-center gap-1 justify-end"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> מיסים</div>
                      <div className="flex items-center gap-1 justify-end"><span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> מימון</div>
                    </div>
                  </div>

                </div>
              </div>

              {/* EXPERT CONSULTATION LEAD FORM */}
              <div className="bg-babun-accent/15 rounded-3xl p-6 border border-babun-accent/30 shadow-sm">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-babun-primary flex items-center justify-center text-white shrink-0">
                    <HelpCircle size={16} />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-base text-babun-primary">ניתוח עסקה עם יעקב רייניץ</h4>
                    <p className="text-xs text-babun-primary/85 mt-0.5 leading-relaxed">
                      רוצים לוודא שלא פספסתם הוצאות נלוות או פקטורים קריטיים? שלחו את נתוני העסקה שלכם לקבלת חוות דעת מקצועית של מומחה פליפים מנוסה.
                    </p>
                  </div>
                </div>

                {leadSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-5 rounded-2xl border border-emerald-200 text-center"
                  >
                    <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-3">
                      <Check size={20} className="stroke-[3]" />
                    </div>
                    <h5 className="font-display font-bold text-sm text-babun-primary mb-1">הנתונים נשלחו בהצלחה!</h5>
                    <p className="text-xs text-zinc-500 leading-relaxed mb-1">פרטי פנייתך והחישובים המצורפים הועברו ליעקב רייניץ.</p>
                    <p className="text-xs text-emerald-600 font-bold font-display animate-pulse mt-1">ניצור קשר בהקדם האפשרי!</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleLeadSubmit} className="space-y-3">
                    {leadError && (
                      <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl font-bold">
                        {leadError}
                      </div>
                    )}
                    
                    <div className="relative">
                      <User className="absolute right-3 top-2.5 text-zinc-400" size={14} />
                      <input 
                        type="text" 
                        placeholder="שם מלא *"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-white border border-zinc-200/60 rounded-xl py-2 pr-9 pl-3 text-xs outline-none text-right font-medium text-babun-primary focus:border-babun-primary"
                        required
                      />
                    </div>

                    <div className="relative">
                      <Phone className="absolute right-3 top-2.5 text-zinc-400" size={14} />
                      <input 
                        type="tel" 
                        placeholder="מספר טלפון *"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-white border border-zinc-200/60 rounded-xl py-2 pr-9 pl-3 text-xs outline-none text-right font-medium text-babun-primary focus:border-babun-primary"
                        required
                      />
                    </div>

                    <div className="relative">
                      <Mail className="absolute right-3 top-2.5 text-zinc-400" size={14} />
                      <input 
                        type="email" 
                        placeholder="כתובת אימייל *"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white border border-zinc-200/60 rounded-xl py-2 pr-9 pl-3 text-xs outline-none text-right font-medium text-babun-primary focus:border-babun-primary"
                        required
                      />
                    </div>

                    <div className="relative">
                      <MessageSquare className="absolute right-3 top-2.5 text-zinc-400" size={14} />
                      <textarea 
                        placeholder="הערות או שאלות נוספות..."
                        value={leadMessage}
                        onChange={(e) => setLeadMessage(e.target.value)}
                        className="w-full bg-white border border-zinc-200/60 rounded-xl py-2 pr-9 pl-3 text-xs outline-none text-right font-medium text-babun-primary focus:border-babun-primary h-14 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingLead}
                      className="w-full bg-babun-primary hover:bg-zinc-800 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmittingLead ? "שולח נתונים..." : "שלח נתונים לניתוח"}
                      <ArrowLeft size={14} />
                    </button>
                  </form>
                )}
              </div>

            </div>

          </div>

          {/* 3. PRO TIP / EDUCATION SECTION */}
          <div className="mt-16 bg-white rounded-[32px] p-8 md:p-12 border border-zinc-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <h3 className="font-display font-black text-xl md:text-2xl text-babun-primary mb-4">טיפים מנצחים לניתוח עסקת פליפ מוצלחת</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              
              <div className="space-y-2">
                <span className="text-babun-primary/30 font-display font-black text-4xl block">01</span>
                <h4 className="font-display font-bold text-base text-babun-primary">עלות הבצ״מ היא קריטית</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  תמיד תשאירו לפחות 10% בצ״מ (בלתי צפוי מראש) מתקציב השיפוץ שלכם. בעסקאות פליפ תמיד יצוצו הפתעות בעלויות הבנייה, בצנרת, בריצוף או בדרישות הנדסיות לא צפויות.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-babun-primary/30 font-display font-black text-4xl block">02</span>
                <h4 className="font-display font-bold text-base text-babun-primary">זמן הוא כסף (תרתי משמע)</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  עסקה שנמשכת זמן רב מדי שוחקת את התשואה שלכם באמצעות עלויות ריבית, דמי ניהול וביטוחים. הגדירו לוחות זמנים מהודקים והפעילו לחץ תמידי על הקבלן המבצע.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-babun-primary/30 font-display font-black text-4xl block">03</span>
                <h4 className="font-display font-bold text-base text-babun-primary">מיסוי נדל״ן בישראל</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  מס שבח הוא 25% מהרווח הריאלי בעסקה. עם זאת, כל ההוצאות הנלוות — מס רכישה, עו״ד, מתווכים, ריביות משכנתא, והשיפוצים — הן הוצאות מוכרות המפחיתות את גובה המס! תעדו כל קבלה.
                </p>
              </div>

            </div>

            <div className="w-full h-px bg-zinc-100 my-10" />

            <div className="text-center">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-babun-primary/30 max-w-3xl mx-auto leading-relaxed">
                * החישובים מבוססים על נוסחאות פיננסיות ושיעורי מיסוי נדל״ן המקובלים בישראל. תוצאות אלו הן הערכות בלבד. על מנת לקבל חוות דעת מקצועית ומחייבת, יש להיוועץ עם שמאי מקרקעין, עורך דין או יועץ מס מוסמך.
              </p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
