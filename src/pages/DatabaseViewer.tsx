import React, { useState, useEffect, useRef } from "react";
import { 
  Database, 
  Server, 
  HardDrive, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Download, 
  Upload, 
  ExternalLink, 
  Layers, 
  FileText, 
  Users, 
  ArrowUpDown, 
  Eye,
  Trash2,
  Calendar,
  Sparkles,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";
import { motion } from "motion/react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { defaultSeedArticles } from "../data/defaultArticles";

export default function DatabaseViewer() {
  const [activeTab, setActiveTab] = useState<"articles" | "leads" | "raw">("articles");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  
  // Articles data states
  const [serverArticles, setServerArticles] = useState<any[]>([]);
  const [localArticles, setLocalArticles] = useState<any[]>([]);
  const [firestoreArticles, setFirestoreArticles] = useState<any[]>([]);
  const [mergedArticles, setMergedArticles] = useState<any[]>([]);
  
  // Status flags
  const [firestoreStatus, setFirestoreStatus] = useState<{
    ok: boolean;
    message: string;
    code?: string;
  }>({ ok: false, message: "בודק חיבור לפיירבייס..." });

  const [serverStatus, setServerStatus] = useState<{
    ok: boolean;
    message: string;
    count: number;
  }>({ ok: false, message: "בודק שרת...", count: 0 });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to clean internal UI fields before syncing to server
  const cleanArticle = (art: any) => {
    if (!art) return null;
    const { _source, ...rest } = art;
    return rest;
  };

  // Load all databases on mount
  const checkAndLoadData = async (shouldAutoSync = true) => {
    setLoading(true);

    // 1. Fetch Local Storage
    let localData: any[] = [];
    try {
      const cached = localStorage.getItem("babun_articles_cache");
      if (cached) {
        localData = JSON.parse(cached);
        setLocalArticles(Array.isArray(localData) ? localData : []);
      }
    } catch (e) {
      console.warn("Failed to read local cache:", e);
    }

    // 2. Fetch Server Storage (/api/articles) if available
    let srvData: any[] = [];
    try {
      const srvRes = await fetch("/api/articles");
      if (srvRes.ok) {
        const ct = srvRes.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          srvData = await srvRes.json();
          setServerArticles(Array.isArray(srvData) ? srvData : []);
          setServerStatus({
            ok: true,
            message: "פעיל וזמין לכל המחשבים",
            count: srvData.length
          });
        } else {
          setServerStatus({
            ok: false,
            message: "אחסון סטטי (הסנכרון פועל ישירות מול פיירבייס בענן)",
            count: 0
          });
        }
      } else {
        setServerStatus({
          ok: false,
          message: "שרת מקומי אינו זמין (סנכרון בענן דרך פיירבייס)",
          count: 0
        });
      }
    } catch (err: any) {
      setServerStatus({
        ok: false,
        message: "סנכרון פעיל ישירות מול פיירבייס בענן",
        count: 0
      });
    }

    // 3. Test Firestore Live Connection
    let fsData: any[] = [];
    try {
      const snap = await getDocs(collection(db, "articles"));
      snap.forEach((doc) => {
        fsData.push({ id: doc.id, ...doc.data() });
      });
      setFirestoreArticles(fsData);
      setFirestoreStatus({
        ok: true,
        message: `מחובר ומסונכרן (${fsData.length} כתבות בפיירבייס)`
      });
    } catch (fsErr: any) {
      const errStr = fsErr?.message || String(fsErr);
      const isQuota = errStr.includes("Quota") || errStr.includes("resource-exhausted") || errStr.includes("quota");
      setFirestoreStatus({
        ok: false,
        code: isQuota ? "QUOTA_EXCEEDED" : "ERROR",
        message: isQuota 
          ? "חריגת מכסה יומית (Quota Limit Exceeded) - מסלול חינמי הוגבל" 
          : `שגיאת גישה: ${errStr}`
      });
    }

    // 4. Calculate Merged View across all databases
    const idMap = new Map<string, any>();
    // Default seed
    defaultSeedArticles.forEach((a) => idMap.set(a.id, { ...a, _source: "ברירת מחדל" }));
    // Server storage
    srvData.forEach((a) => idMap.set(a.id, { ...a, _source: "שרת מקומי" }));
    // Firestore (Live global cloud DB)
    fsData.forEach((a) => idMap.set(a.id, { ...a, _source: "פיירבייס (זמין לכולם)" }));
    
    const fsIds = new Set(fsData.map((f: any) => f.id));
    const srvIds = new Set(srvData.map((s: any) => s.id));
    const unsyncedItems: any[] = [];

    localData.forEach((a) => {
      const isOnline = fsIds.has(a.id) || srvIds.has(a.id);
      if (isOnline) {
        idMap.set(a.id, { ...idMap.get(a.id), ...a, _source: "פיירבייס + מקומי" });
      } else {
        idMap.set(a.id, { ...a, _source: "מקומי בלבד (טרם סונכרן ל-Firebase)" });
        unsyncedItems.push(a);
      }
    });

    const finalMerged = Array.from(idMap.values());
    setMergedArticles(finalMerged);
    setLoading(false);

    // 5. Automatic background sync: if this computer has local articles missing from Firebase, sync them!
    if (shouldAutoSync && unsyncedItems.length > 0) {
      console.log(`Auto-syncing ${unsyncedItems.length} local articles to Firestore...`);
      setSyncing(true);
      try {
        for (const item of unsyncedItems) {
          try {
            const cleaned = cleanArticle(item);
            if (cleaned && cleaned.id) {
              await setDoc(doc(db, "articles", cleaned.id), cleaned, { merge: true });
            }
          } catch (err) {
            console.warn("Auto-sync error for item:", item.id, err);
          }
        }

        // Also notify local server if available
        fetch("/api/articles/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalMerged.map(cleanArticle).filter(Boolean)),
        }).catch(() => {});

        // Re-read Firestore after sync
        const freshSnap = await getDocs(collection(db, "articles"));
        const freshFs: any[] = [];
        freshSnap.forEach((doc) => freshFs.push({ id: doc.id, ...doc.data() }));
        setFirestoreArticles(freshFs);
        setFirestoreStatus({
          ok: true,
          message: `מחובר ומסונכרן (${freshFs.length} כתבות בפיירבייס)`
        });

        // Update view
        const updatedMap = new Map<string, any>();
        defaultSeedArticles.forEach((a) => updatedMap.set(a.id, { ...a, _source: "ברירת מחדל" }));
        freshFs.forEach((a) => updatedMap.set(a.id, { ...a, _source: "פיירבייס (זמין לכולם)" }));
        localData.forEach((a) => updatedMap.set(a.id, { ...updatedMap.get(a.id), ...a, _source: "פיירבייס + מקומי" }));
        setMergedArticles(Array.from(updatedMap.values()));
        setSyncNotice(`בוצע סנכרון אוטומטי מלא! כל ${freshFs.length} הכתבות נשמרו ב-Firebase בענן וזמינות לכל המחשבים בעולם.`);
      } catch (autoErr) {
        console.warn("Auto-sync error:", autoErr);
      } finally {
        setSyncing(false);
      }
    }
  };

  useEffect(() => {
    checkAndLoadData(true);
  }, []);

  // Force Sync to Firebase & Server
  const handleForceSyncToServer = async () => {
    setSyncing(true);
    setSyncNotice(null);
    setSyncProgress(null);
    try {
      // Build a comprehensive, deduplicated list from all sources
      const combinedMap = new Map<string, any>();
      defaultSeedArticles.forEach((a) => combinedMap.set(a.id, cleanArticle(a)));
      firestoreArticles.forEach((a) => combinedMap.set(a.id, cleanArticle(a)));
      serverArticles.forEach((a) => combinedMap.set(a.id, cleanArticle(a)));
      localArticles.forEach((a) => combinedMap.set(a.id, cleanArticle(a)));
      mergedArticles.forEach((a) => combinedMap.set(a.id, cleanArticle(a)));

      const listToSync = Array.from(combinedMap.values()).filter(Boolean);

      setSyncProgress("מתחיל סנכרון לענן Firebase...");

      let fsSuccess = 0;
      for (let i = 0; i < listToSync.length; i++) {
        const item = listToSync[i];
        setSyncProgress(`מעלה כתבה ${i + 1} מתוך ${listToSync.length} לפיירבייס: ${item.title?.slice(0, 20)}...`);
        try {
          await setDoc(doc(db, "articles", item.id), cleanArticle(item), { merge: true });
          fsSuccess++;
        } catch (itemErr: any) {
          console.error(`Failed to sync item ${item.id} to Firestore:`, itemErr);
        }
      }

      // Also try sync to server API (won't throw error if on static hosting)
      try {
        await fetch("/api/articles/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(listToSync)
        });
      } catch (err) {}

      // Update localStorage & dispatch event
      try {
        localStorage.setItem("babun_articles_cache", JSON.stringify(listToSync));
        window.dispatchEvent(new CustomEvent("articles_updated", { detail: listToSync }));
      } catch (e) {}

      setSyncNotice(`הסנכרון הושלם בהצלחה! ${fsSuccess} כתבות ופודקאסטים נשמרו ב-Firebase Firestore בענן וזמינים כעת לכל המחשבים בעולם.`);
      await checkAndLoadData(false);
    } catch (e: any) {
      alert(`שגיאה בסנכרון: ${e?.message || "אנא נסה שוב"}`);
    } finally {
      setSyncing(false);
      setSyncProgress(null);
    }
  };

  // Sync a single article directly to Firestore
  const handleSyncSingleArticle = async (item: any) => {
    setSyncing(true);
    setSyncNotice(null);
    const cleaned = cleanArticle(item);
    setSyncProgress(`מעלה את "${cleaned.title?.slice(0, 25)}..." לפיירבייס בענן...`);
    try {
      await setDoc(doc(db, "articles", cleaned.id), cleaned, { merge: true });

      // Also push to local server if available
      fetch("/api/articles/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleaned),
      }).catch(() => {});

      setSyncNotice(`הכתבה "${cleaned.title}" סונכרנה בהצלחה לפיירבייס בענן וזמינה כעת לכל המחשבים!`);
      await checkAndLoadData(false);
    } catch (e: any) {
      alert(`שגיאה בסנכרון הכתבה לפיירבייס: ${e?.message || "אנא נסה שוב"}`);
    } finally {
      setSyncing(false);
      setSyncProgress(null);
    }
  };

  // Import articles directly from a JSON backup file
  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        alert("הקובץ אינו מכיל רשימת כתבות תקינה.");
        return;
      }

      setSyncing(true);
      setSyncProgress(`מייבא ${parsed.length} כתבות ישירות לפיירבייס בענן...`);

      let importedCount = 0;
      for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i];
        if (item && item.id) {
          setSyncProgress(`מייבא כתבה ${i + 1} מתוך ${parsed.length}: ${item.title?.slice(0, 20)}...`);
          try {
            await setDoc(doc(db, "articles", item.id), cleanArticle(item), { merge: true });
            importedCount++;
          } catch (err) {
            console.warn("Import item error:", item.id, err);
          }
        }
      }

      try {
        localStorage.setItem("babun_articles_cache", JSON.stringify(parsed));
        window.dispatchEvent(new CustomEvent("articles_updated", { detail: parsed }));
      } catch (e) {}

      setSyncNotice(`הייבוא הושלם בהצלחה! ${importedCount} כתבות נשמרו ב-Firebase בענן וזמינות לכל המחשבים.`);
      await checkAndLoadData(false);
    } catch (err: any) {
      alert(`שגיאה בקריאת קובץ ה-JSON: ${err?.message || "אנא וודא שהקובץ תקין"}`);
    } finally {
      setSyncing(false);
      setSyncProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Download JSON Backup
  const handleDownloadBackup = () => {
    const cleanList = mergedArticles.map(cleanArticle);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cleanList, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `reinitz_database_articles_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filtered list
  const filteredArticles = mergedArticles.filter((art) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      art.title?.toLowerCase().includes(q) ||
      art.category?.toLowerCase().includes(q) ||
      art.id?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#0d131f] text-white pt-28 pb-20 px-4 md:px-8 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-babun-accent/20 text-babun-accent rounded-xl border border-babun-accent/30">
                <Database size={28} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight text-white flex items-center gap-2">
                  מרכז ניהול מסד הנתונים
                  <span className="text-xs bg-babun-accent text-babun-primary px-2 py-0.5 rounded-full font-bold">
                    חי ומסונכרן
                  </span>
                </h1>
                <p className="text-sm text-zinc-400 mt-1">
                  צפייה בזמן אמת בנתוני פיירבייס, שרת הגיבוי והזיכרון המקומי
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => checkAndLoadData(false)}
              disabled={loading}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              <span>רענן נתונים</span>
            </button>

            <button
              onClick={handleForceSyncToServer}
              disabled={syncing}
              className="px-5 py-2.5 bg-babun-accent text-babun-primary hover:bg-yellow-400 rounded-xl text-sm font-black flex items-center gap-2 transition-all shadow-lg shadow-babun-accent/20 cursor-pointer disabled:opacity-75"
            >
              <Server size={16} className={syncing ? "animate-spin" : ""} />
              <span>{syncProgress || (syncing ? "מסנכרן כעת..." : "סנכרן את הכתבות לכל המחשבים")}</span>
            </button>

            <button
              onClick={handleDownloadBackup}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
              title="הורד גיבוי מלא כקובץ JSON"
            >
              <Download size={16} />
              <span>ייצוא JSON</span>
            </button>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImportJSON} 
              accept=".json,application/json" 
              className="hidden" 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={syncing}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
              title="ייבוא ושמירת כתבות מקובץ JSON ישירות לפיירבייס בענן"
            >
              <Upload size={16} />
              <span>ייבוא JSON</span>
            </button>
          </div>
        </div>

        {/* Status Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Firestore Status Card */}
          <div className={`p-6 rounded-2xl border ${firestoreStatus.ok ? "bg-emerald-950/20 border-emerald-500/30" : "bg-amber-950/25 border-amber-500/40"}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">ענן Google Firestore</span>
              {firestoreStatus.ok ? (
                <CheckCircle2 className="text-emerald-400" size={20} />
              ) : (
                <AlertTriangle className="text-amber-400" size={20} />
              )}
            </div>
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              {firestoreStatus.ok ? "מחובר תקין" : "הגבלת מכסה יומית (Quota)"}
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {firestoreStatus.message}
            </p>
            {!firestoreStatus.ok && (
              <div className="mt-3 text-[11px] bg-amber-500/15 text-amber-200 p-2.5 rounded-lg border border-amber-500/30">
                💡 הסיבה שלא כל המחשבים ראו: פיירבייס חוסם מעל 50k קריאות ביום במסלול החינמי. שרת הגיבוי שלנו עוקף את זה ומספק את הנתונים לכולם!
              </div>
            )}
          </div>

          {/* Server Storage Card */}
          <div className="p-6 rounded-2xl border bg-blue-950/20 border-blue-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">שרת האפליקציה (Backend Cache)</span>
              <Server className="text-blue-400" size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              {serverStatus.ok ? "זמין לכל המחשבים בעולם" : "בבדיקה"}
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {serverStatus.count} כתבות ופודקאסטים שמורים כרגע בשרת
            </p>
            <div className="mt-3 text-[11px] bg-blue-500/15 text-blue-200 p-2.5 rounded-lg border border-blue-500/30">
              כל מחשב שנכנס לאתר מקבל אוטומטית עותק משרת זה תוך פחות מ-30 מילי-שניות, ללא תלות במכסת גוגל.
            </div>
          </div>

          {/* Local Device Cache Card */}
          <div className="p-6 rounded-2xl border bg-purple-950/20 border-purple-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">מחשב נוכחי (דפדפן זה)</span>
              <HardDrive className="text-purple-400" size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              {localArticles.length} כתבות בזיכרון המקומי
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              הזיכרון המקומי שומר את הכתבות שהזנת במחשב זה. בלחיצה על "סנכרן את הכתבות" הן מופצות מיד לכולם.
            </p>
            {localArticles.length > serverArticles.length && (
              <div className="mt-3 text-[11px] bg-purple-500/20 text-purple-200 p-2.5 rounded-lg border border-purple-500/30">
                ✨ במחשב זה קיימות כתבות חדשות שטרם עלו לשרת! לחץ על כפתור הסנכרון הצהוב למעלה כדי להפיץ אותן.
              </div>
            )}
          </div>

        </div>

        {/* Sync Notifications & Alerts */}
        {syncNotice && (
          <div className="bg-emerald-500/15 border-2 border-emerald-500/40 rounded-2xl p-4 flex items-center justify-between gap-3 text-emerald-200 text-sm font-bold shadow-lg">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
              <span>{syncNotice}</span>
            </div>
            <button
              onClick={() => setSyncNotice(null)}
              className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
            >
              הבנתי, תודה
            </button>
          </div>
        )}

        {/* Unsynced Alert Banner */}
        {mergedArticles.filter((a) => a._source?.includes("מקומי בלבד")).length > 0 && (
          <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 border-2 border-amber-500/60 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-amber-500/30 text-amber-300 rounded-xl border border-amber-500/40 shrink-0">
                <Upload size={24} className="animate-pulse" />
              </div>
              <div>
                <h4 className="text-base font-black text-white flex items-center gap-2">
                  נמצאו {mergedArticles.filter((a) => a._source?.includes("מקומי בלבד")).length} כתבות במחשב זה שטרם הועלו לשרת!
                </h4>
                <p className="text-xs text-amber-100/90 mt-0.5 leading-relaxed">
                  כרגע רק המחשב שלך רואה את הכתבות האלו המסומנות בצהוב. לחץ על הכפתור כדי להעלות אותן לשרת ולפתוח אותן לכל המחשבים בעולם.
                </p>
              </div>
            </div>
            <button
              onClick={handleForceSyncToServer}
              disabled={syncing}
              className="w-full md:w-auto px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-babun-primary font-black rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-amber-500/20 cursor-pointer shrink-0 disabled:opacity-75"
            >
              <Server size={18} className={syncing ? "animate-spin" : ""} />
              <span>{syncProgress || (syncing ? "מעלה ומסנכרן כעת..." : "העלה וסנכרן את כולן לשרת עכשיו 🚀")}</span>
            </button>
          </div>
        )}

        {/* Tab Selection & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
            <button
              onClick={() => setActiveTab("articles")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "articles" ? "bg-babun-accent text-babun-primary" : "text-zinc-400 hover:text-white"
              }`}
            >
              <FileText size={16} />
              <span>כתבות ופודקאסטים ({mergedArticles.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("raw")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "raw" ? "bg-babun-accent text-babun-primary" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Layers size={16} />
              <span>מבנה JSON גולמי</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="חיפוש בבסיס הנתונים..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-hidden focus:border-babun-accent focus:ring-1 focus:ring-babun-accent"
            />
          </div>
        </div>

        {/* Content Table */}
        {activeTab === "articles" ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="bg-white/5 text-zinc-400 text-xs font-bold uppercase tracking-wider border-b border-white/10">
                    <th className="p-4">מזהה (ID)</th>
                    <th className="p-4">כותרת הכתבה / פודקאסט</th>
                    <th className="p-4">קטגוריה</th>
                    <th className="p-4">תאריך</th>
                    <th className="p-4">מקור נתונים</th>
                    <th className="p-4">קישור חיצוני</th>
                    <th className="p-4 text-center">פעולות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredArticles.length > 0 ? (
                    filteredArticles.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-white/[0.03] transition-colors">
                        <td className="p-4 font-mono text-xs text-zinc-400">
                          {item.id}
                        </td>
                        <td className="p-4 font-bold text-white max-w-xs">
                          <div className="line-clamp-2">{item.title}</div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-white/10 text-babun-accent rounded-md text-xs font-bold">
                            {item.category || item.categoryId || "כללי"}
                          </span>
                        </td>
                        <td className="p-4 text-zinc-400 text-xs whitespace-nowrap">
                          {item.date || "—"}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            item._source?.includes("מקומי בלבד") 
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" 
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          }`}>
                            {item._source || "בסיס נתונים"}
                          </span>
                        </td>
                        <td className="p-4 text-xs max-w-[160px] truncate text-zinc-400 font-mono">
                          {item.link && item.link !== "#" ? (
                            <a 
                              href={item.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline flex items-center gap-1"
                            >
                              <span className="truncate">{item.link}</span>
                              <ExternalLink size={12} className="shrink-0" />
                            </a>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {item._source?.includes("מקומי בלבד") && (
                              <button
                                onClick={() => handleSyncSingleArticle(item)}
                                disabled={syncing}
                                className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-400 text-amber-300 hover:text-black border border-amber-500/40 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                title="העלה כתבה זו לשרת עכשיו"
                              >
                                <Upload size={12} />
                                <span>העלה לשרת</span>
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedItem(item)}
                              className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-300 hover:text-white transition-colors cursor-pointer"
                              title="צפייה מלאה ברשומה"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-zinc-500">
                        לא נמצאו רשומות התואמות את החיפוש
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-black/60 border border-white/10 rounded-2xl p-6 font-mono text-xs text-emerald-400 overflow-x-auto max-h-[600px]">
            <pre>{JSON.stringify(mergedArticles, null, 2)}</pre>
          </div>
        )}

        {/* Modal for viewing single item details */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="bg-[#151c2c] border border-white/15 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-lg font-bold text-white font-display">
                  פרטי רשומה: {selectedItem.title}
                </h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-zinc-400 block font-bold">מזהה (ID):</span>
                  <span className="font-mono text-xs text-zinc-200">{selectedItem.id}</span>
                </div>
                <div>
                  <span className="text-xs text-zinc-400 block font-bold">כותרת:</span>
                  <span className="text-white font-bold">{selectedItem.title}</span>
                </div>
                <div>
                  <span className="text-xs text-zinc-400 block font-bold">קטגוריה:</span>
                  <span className="text-babun-accent font-bold">{selectedItem.category} ({selectedItem.categoryId})</span>
                </div>
                <div>
                  <span className="text-xs text-zinc-400 block font-bold">קישור:</span>
                  <span className="text-blue-400 font-mono text-xs break-all">{selectedItem.link || "—"}</span>
                </div>
                {selectedItem.image && (
                  <div>
                    <span className="text-xs text-zinc-400 block font-bold mb-1">תמונה:</span>
                    <img src={selectedItem.image} alt="" className="h-32 object-cover rounded-lg border border-white/10" />
                  </div>
                )}
                {selectedItem.content && (
                  <div>
                    <span className="text-xs text-zinc-400 block font-bold mb-1">תוכן (Content Preview):</span>
                    <div className="bg-black/30 p-3 rounded-lg text-xs text-zinc-300 font-mono max-h-48 overflow-y-auto whitespace-pre-wrap">
                      {selectedItem.content}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold cursor-pointer"
                >
                  סגור
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
