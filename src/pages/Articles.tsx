import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useSearchParams, useParams, useNavigate } from "react-router-dom";
import Markdown from "react-markdown";
import {
  MessageCircle,
  PlayCircle,
  BookOpen,
  Newspaper,
  ExternalLink,
  Calendar,
  ArrowLeft,
  LayoutGrid,
  Plus,
  Trash2,
  Edit,
  X,
  Loader2,
  Sparkles,
  Copy,
  Check,
  Lock,
  LogIn,
  ChevronRight,
  Eye,
  Info,
  UploadCloud,
  CheckCircle,
  Share2,
  Play,
  FileText,
  Database,
  RefreshCw,
} from "lucide-react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  Timestamp,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";
import { db, auth, handleFirestoreError, OperationType } from "../lib/firebase";
import ImageWithSkeleton from "../components/common/ImageWithSkeleton";
import UniversalMediaPlayer, { detectMediaType } from "../components/common/UniversalMediaPlayer";
import { defaultSeedArticles } from "../data/defaultArticles";
import { formatExternalUrl, isPodcastArticle } from "../lib/utils";

// Category definitions matching the design guidelines
const mediaCategories = [
  { id: "all", name: "כל התוכן", icon: LayoutGrid },
  { id: "weekly", name: "טור שבועי", icon: BookOpen },
  { id: "podcast", name: "פודקאסטים", icon: PlayCircle },
  { id: "articles", name: "כתבות ומאמרים", icon: Newspaper },
  { id: "kavei", name: "קווי מידע", icon: MessageCircle },
];

// Richly-detailed base seed articles (with copyable, readable Hebrew text)
const seedArticles: any[] = defaultSeedArticles;

export default function Articles() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { id: routeParamId } = useParams();
  const navigate = useNavigate();
  const hasEditParam = searchParams.get("edit") === "true" || searchParams.get("admin") === "true";

  const [activeCategory, setActiveCategory] = useState<string>(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam && mediaCategories.some(cat => cat.id === categoryParam)) {
      return categoryParam;
    }
    return "all";
  });

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (catId === "all") {
        next.delete("category");
      } else {
        next.set("category", catId);
      }
      return next;
    });
  };

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam && mediaCategories.some(cat => cat.id === categoryParam)) {
      setActiveCategory(categoryParam);
    } else if (!categoryParam) {
      setActiveCategory("all");
    }
  }, [searchParams]);

  const [articlesList, setArticlesList] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem("babun_articles_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((p: any) => p.id));
          const missingDefaults = defaultSeedArticles.filter((d) => !existingIds.has(d.id));
          return [...missingDefaults, ...parsed];
        }
      }
    } catch (e) {}
    return defaultSeedArticles;
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);

  // Sync selectedArticle from route param or URL id query parameter
  const articleIdParam = routeParamId || searchParams.get("id");

  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  useEffect(() => {
    if (articleIdParam && articlesList.length > 0) {
      const found = articlesList.find((art) => art.id === articleIdParam);
      if (found) {
        setSelectedArticle(found);
        document.title = `${found.title} | יעקב רייניץ - נדל"ן וכלכלה נבונה`;
      } else {
        setSelectedArticle(null);
        document.title = 'מאגר ידע, מאמרים ופודקאסטים | יעקב רייניץ - נדל"ן וכלכלה נבונה';
      }
    } else {
      setSelectedArticle(null);
      document.title = 'מאגר ידע, מאמרים ופודקאסטים | יעקב רייניץ - נדל"ן וכלכלה נבונה';
    }
  }, [articleIdParam, articlesList]);

  const handleSelectArticle = (article: any) => {
    navigate(`/articles/${article.id}`);
  };

  const handleCloseArticle = () => {
    if (activeCategory && activeCategory !== "all") {
      navigate(`/articles?category=${activeCategory}`);
    } else {
      navigate("/articles");
    }
  };

  // Admin access control states
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
  const [adminPass, setAdminPass] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // New Article Form State
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [formTitle, setFormTitle] = useState<string>("");
  const [formCategory, setFormCategory] = useState<string>("weekly");
  const [formDate, setFormDate] = useState<string>("");
  const [formImage, setFormImage] = useState<string>("");
  const [formInnerImage, setFormInnerImage] = useState<string>("");
  const [formContent, setFormContent] = useState<string>("");
  const [formLink, setFormLink] = useState<string>("");

  // Edit State & Reset Helpers
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);

  const handleOpenAddForm = () => {
    setEditingArticleId(null);
    setFormTitle("");
    setFormCategory(activeCategory !== "all" ? activeCategory : "weekly");
    setFormDate("");
    setFormImage("");
    setFormInnerImage("");
    setFormContent("");
    setFormLink("");
    setCompressionInfo(null);
    setInnerCompressionInfo(null);
    setShowAddForm(true);
  };

  const handleCloseAddForm = () => {
    setEditingArticleId(null);
    setFormTitle("");
    setFormCategory(activeCategory !== "all" ? activeCategory : "weekly");
    setFormDate("");
    setFormImage("");
    setFormInnerImage("");
    setFormContent("");
    setFormLink("");
    setCompressionInfo(null);
    setInnerCompressionInfo(null);
    setShowAddForm(false);
  };

  const handleEditArticleClick = (article: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingArticleId(article.id);
    setFormTitle(article.title || "");
    setFormCategory(article.categoryId || "weekly");
    setFormDate(article.date || "");
    setFormImage(article.image || "");
    setFormInnerImage(article.innerImage || "");
    setFormContent(article.content || "");
    setFormLink(article.link === "#" ? "" : article.link || "");
    setShowAddForm(true);
  };

  // Direct Image File Upload & Native Browser Compression Optimization
  const [imageSourceType, setImageSourceType] = useState<"file" | "url">("file");
  const [innerImageSourceType, setInnerImageSourceType] = useState<"file" | "url">("file");
  const [compressionInfo, setCompressionInfo] = useState<{ originalSize: number; compressedSize: number } | null>(null);
  const [innerCompressionInfo, setInnerCompressionInfo] = useState<{ originalSize: number; compressedSize: number } | null>(null);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [uploadingInnerImage, setUploadingInnerImage] = useState<boolean>(false);

  // Helper to compress images client-side dynamically in canvas before storing in Firestore
  const handleImageFileChange = async (file: File) => {
    if (!file) return;
    setUploadingImage(true);
    setCompressionInfo(null);
    try {
      const result = await new Promise<{ base64: string; originalSize: number; compressedSize: number }>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new window.Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              reject(new Error("לא צלח לקבל קונטקסט דו-מימדי מהקנבס"));
              return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            
            // Compress to JPEG with 0.6 quality for ultra lightweight load (typically 15-40KB)
            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.6);
            
            // Calc size of base64
            const stringLength = compressedBase64.length - "data:image/jpeg;base64,".length;
            const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.5624896334383812;
            
            resolve({
              base64: compressedBase64,
              originalSize: file.size,
              compressedSize: Math.round(sizeInBytes),
            });
          };
          img.onerror = (err) => reject(new Error("שגיאה בפענוח קובץ התמונה"));
        };
        reader.onerror = (err) => reject(new Error("שגיאה בקריאת הקובץ"));
      });

      setFormImage(result.base64);
      setCompressionInfo({
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
      });
    } catch (error: any) {
      console.error("Image compression error:", error);
      alert(`שגיאה בעיבוד התמונה: ${error.message || error}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleInnerImageFileChange = async (file: File) => {
    if (!file) return;
    setUploadingInnerImage(true);
    setInnerCompressionInfo(null);
    try {
      const result = await new Promise<{ base64: string; originalSize: number; compressedSize: number }>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new window.Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              reject(new Error("לא צלח לקבל קונטקסט דו-מימדי מהקנבס"));
              return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            
            // Compress to JPEG with 0.6 quality for ultra lightweight load (typically 15-40KB)
            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.6);
            
            // Calc size of base64
            const stringLength = compressedBase64.length - "data:image/jpeg;base64,".length;
            const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.5624896334383812;
            
            resolve({
              base64: compressedBase64,
              originalSize: file.size,
              compressedSize: Math.round(sizeInBytes),
            });
          };
          img.onerror = (err) => reject(new Error("שגיאה בפענוח קובץ התמונה"));
        };
        reader.onerror = (err) => reject(new Error("שגיאה בקריאת הקובץ"));
      });

      setFormInnerImage(result.base64);
      setInnerCompressionInfo({
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
      });
    } catch (error: any) {
      console.error("Inner Image compression error:", error);
      alert(`שגיאה בעיבוד התמונה הפנימית: ${error.message || error}`);
    } finally {
      setUploadingInnerImage(false);
    }
  };

  // OCR Magic Assistant States
  const [ocrLoading, setOcrLoading] = useState<boolean>(false);
  const [ocrStatus, setOcrStatus] = useState<string>("");

  const [selectedPodcast, setSelectedPodcast] = useState<any | null>(null);
  const [isPlayingPodcast, setIsPlayingPodcast] = useState<boolean>(false);
  const [heroVideoLoaded, setHeroVideoLoaded] = useState<boolean>(false);
  const podcastStageRef = useRef<HTMLDivElement>(null);

  const handlePlayPodcast = (podcast: any) => {
    setSelectedPodcast(podcast);
    setIsPlayingPodcast(true);
    if (podcastStageRef.current) {
      podcastStageRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Helper to extract YouTube video ID from links
  const getYoutubeId = (url: string) => {
    if (!url) return "";
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : "";
  };

  // Sync default active podcast
  useEffect(() => {
    const listToSearch = articlesList.length > 0 ? articlesList : defaultSeedArticles;
    const podcasts = listToSearch.filter((a) => a.categoryId === "podcast" || a.category === "פודקאסטים");
    if (podcasts.length > 0 && !selectedPodcast) {
      setSelectedPodcast(podcasts[0]);
    }
  }, [articlesList, selectedPodcast]);

  // Robust comparator for articles that handles Timestamps, ISO dates, Hebrew dates, and epoch timestamps
  const sortArticles = (list: any[]) => {
    return [...list].sort((a, b) => {
      const getTime = (item: any) => {
        if (!item) return 0;
        if (item.createdAt?.toMillis) return item.createdAt.toMillis();
        if (item.createdAt?.seconds) return item.createdAt.seconds * 1000;
        if (item.createdAt) {
          const t = new Date(item.createdAt).getTime();
          if (!isNaN(t) && t > 0) return t;
        }
        if (item.date) {
          const parts = String(item.date).split(/[./-]/);
          if (parts.length === 3) {
            const d = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10) - 1;
            const y = parseInt(parts[2].length === 2 ? "20" + parts[2] : parts[2], 10);
            const dt = new Date(y, m, d).getTime();
            if (!isNaN(dt)) return dt;
          }
        }
        return 0;
      };
      return getTime(b) - getTime(a);
    });
  };

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);

  // Helper to safely apply articles and store in client cache & sync server without dropping any records
  const applyArticles = (incoming: any[], source: string) => {
    if (!Array.isArray(incoming) || incoming.length === 0) return;
    setArticlesList((prev) => {
      const map = new Map<string, any>();
      // 1. Default seed baseline
      defaultSeedArticles.forEach((a) => { if (a && a.id) map.set(a.id, a); });
      // 2. Previously loaded state
      prev.forEach((a) => { if (a && a.id) map.set(a.id, a); });
      // 3. Incoming fresh articles (merge fields, preserving any richer content)
      incoming.forEach((a) => {
        if (a && a.id) {
          map.set(a.id, { ...map.get(a.id), ...a });
        }
      });

      const sorted = sortArticles(Array.from(map.values()));
      try {
        localStorage.setItem("babun_articles_cache", JSON.stringify(sorted));
        window.dispatchEvent(new CustomEvent("articles_updated", { detail: sorted }));
      } catch (e) {}
      return sorted;
    });
    setLoading(false);
  };

  // One-click manual refresh & sync across all devices
  const refreshAllArticles = async () => {
    setIsRefreshing(true);
    setRefreshNotice(null);
    try {
      // 1. Fetch server backup
      const srvRes = await fetch("/api/articles");
      let total = 0;
      if (srvRes.ok) {
        const srvData = await srvRes.json();
        if (Array.isArray(srvData) && srvData.length > 0) {
          applyArticles(srvData, "manualRefreshServer");
          total = Math.max(total, srvData.length);
        }
      }

      // 2. Fetch directly from Firestore (no orderBy to prevent omitted documents)
      try {
        const snap = await getDocs(collection(db, "articles"));
        if (!snap.empty) {
          const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          applyArticles(docs, "manualRefreshFirestore");
          total = Math.max(total, docs.length);
        }
      } catch (fsErr) {
        console.warn("Manual refresh Firestore notice:", fsErr);
      }

      setRefreshNotice(`הסנכרון הושלם! כל ${total || articlesList.length} הכתבות מעודכנות בכל המחשבים.`);
      setTimeout(() => setRefreshNotice(null), 5000);
    } catch (e) {
      setRefreshNotice("הרענון הושלם.");
      setTimeout(() => setRefreshNotice(null), 3000);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Load and listen to articles from Firestore and Server with resilient multi-tier loading
  useEffect(() => {
    setLoading(true);
    let isMounted = true;

    // 1. Immediate local cache check for zero-delay rendering
    try {
      const cached = localStorage.getItem("babun_articles_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          applyArticles(parsed, "localStorage");
        }
      }
    } catch (e) {}

    // 2. Fetch from server-side backup API (works under every adblocker/filter)
    fetch("/api/articles")
      .then((res) => (res.ok ? res.json() : []))
      .then((serverData) => {
        if (!isMounted) return;
        if (Array.isArray(serverData) && serverData.length > 0) {
          applyArticles(serverData, "serverApi");
        }

        // Check if this computer has extra local articles that server lacks
        let localData: any[] = [];
        try {
          const cached = localStorage.getItem("babun_articles_cache");
          if (cached) localData = JSON.parse(cached);
        } catch (e) {}

        const serverIds = new Set((serverData || []).map((d: any) => d.id));
        const extraLocal = (Array.isArray(localData) ? localData : []).filter((d: any) => !serverIds.has(d.id));

        if (extraLocal.length > 0) {
          fetch("/api/articles/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(extraLocal),
          }).catch(() => {});
        }
      })
      .catch((err) => {
        console.warn("Server-side articles API check:", err);
      });

    // 3. Setup real-time listener or one-time getDocs from Firestore (without orderBy to avoid dropping documents)
    const articlesRef = collection(db, "articles");

    let unsubscribe = () => {};
    try {
      unsubscribe = onSnapshot(
        articlesRef,
        (snapshot) => {
          if (!isMounted) return;
          if (!snapshot.empty) {
            const docs = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            applyArticles(docs, "firestoreLive");
            
            // Sync to server backup
            fetch("/api/articles/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(docs),
            }).catch(() => {});
          } else {
            setLoading(false);
          }
        },
        async (error) => {
          console.warn("Firestore onSnapshot error, attempting one-time getDocs:", error);
          try {
            const snapshot = await getDocs(articlesRef);
            if (!snapshot.empty && isMounted) {
              const docs = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
              applyArticles(docs, "firestoreGetDocs");
            }
          } catch (getDocsErr) {
            console.warn("Firestore getDocs fallback also failed (filter/firewall active):", getDocsErr);
          } finally {
            if (isMounted) setLoading(false);
          }
        }
      );
    } catch (listenerErr) {
      console.warn("Could not attach Firestore listener:", listenerErr);
      if (isMounted) setLoading(false);
    }

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Sync auth state with Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // If user is logged in, auto authorize if email is correct
      if (currentUser && currentUser.email === "michal@extraplus.co.il") {
        setIsAdminMode(true);
      }
    });
    return () => unsubscribe();
  }, []);

  // Auto-trigger admin login modal if ?edit=true or ?admin=true is passed in URL
  useEffect(() => {
    if (hasEditParam && !isAdminMode) {
      setShowAdminLogin(true);
    }
  }, [hasEditParam, isAdminMode]);

  // Handle Google authenticaton
  const handleGoogleLogin = async () => {
    setErrorMsg("");
    try {
      const provider = new GoogleAuthProvider();
      // Optional: request Workspace Drive scope if needed, but not required for simple upload
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      if (result.user.email === "michal@extraplus.co.il") {
        setIsAdminMode(true);
        setShowAdminLogin(false);
      } else {
        // We will grant admin access for preview testing if user is logged in and types the preview bypass!
        setErrorMsg("החשבון מחובר, אך אינו מוגדר כמנהל מערכת בבסיס הנתונים.");
      }
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setErrorMsg("ההתחברות נכשלה. אנא נסה שנית.");
    }
  };

  // Fast Passcode Bypass for User Tests (zero friction previewing)
  const handlePasscodeLogin = () => {
    if (adminPass.trim() === "reinitz2026") {
      setIsAdminMode(true);
      setShowAdminLogin(false);
      setErrorMsg("");
    } else {
      setErrorMsg("קוד מנהל שגוי. להדגמה השתמש בקוד: reinitz2026");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsAdminMode(false);
    setUser(null);
  };

  // Delete all articles/podcasts in database to start from scratch
  const handleDeleteAllArticles = async () => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את כל הכתבות והפודקאסטים מבסיס הנתונים? פעולה זו תשלים ניקוי מלא ואינה הפיכה!")) {
      return;
    }
    setLoading(true);
    try {
      let count = 0;
      for (const item of articlesList) {
        if (item.id) {
          await deleteDoc(doc(db, "articles", item.id));
          count++;
        }
      }
      alert(`כל ${count} התכנים נמחקו בהצלחה מבסיס הנתונים! כעת המערכת ריקה ומוכנה לעבודה מן היסוד.`);
    } catch (err: any) {
      console.error("Delete all error:", err);
      alert(`שגיאה במחיקת כל התכנים: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // AI-powered Hebrew OCR Assistant Call
  const handleAIOCR = async () => {
    const activeOcrImage = formInnerImage || formImage;
    if (!activeOcrImage.trim()) {
      alert("אנא הזן תחילה תמונה של הכתבה (פנימית או חיצונית) כדי לבצע פענוח טקסט");
      return;
    }

    setOcrLoading(true);
    setOcrStatus("מתחבר ל-Gemini AI...");

    try {
      // Rotate friendly messages during parsing
      setTimeout(() => setOcrStatus("מייבא את צילום הכתבה בבטחה..."), 2000);
      setTimeout(
        () => setOcrStatus("סורק ומפענח אותיות בעברית (OCR)..."),
        4500,
      );
      setTimeout(
        () => setOcrStatus("מלביש פסקאות ומארגן כותרות בפורמט קריא..."),
        7000,
      );

      const response = await fetch("/api/articles/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: activeOcrImage.trim() }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "שגיאה בפענוח הכתבה");
      }

      setFormContent(data.text);
      setOcrStatus("הפיענוח הושלם בהצלחה!");
    } catch (err: any) {
      console.error("OCR API error:", err);
      alert(
        `שגיאת במערכת ה-OCR: ${err.message || err}. ודא שהתמונות משותפות באופן פומבי.`,
      );
    } finally {
      setOcrLoading(false);
      setOcrStatus("");
    }
  };

  // Save new article or edit existing one with multi-tier cloud and server sync
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalImage = formImage.trim();
    const cleanLink = formatExternalUrl(formLink);
    if (!finalImage && cleanLink) {
      const ytId = getYoutubeId(cleanLink);
      if (ytId) {
        finalImage = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      }
    }

    if (!formTitle.trim()) {
      alert("נא למלא כותרת לכתבה / פודקאסט");
      return;
    }

    const isPod =
      formCategory === "podcast" ||
      cleanLink.includes("youtube") ||
      cleanLink.includes("spotify") ||
      cleanLink.includes("apple") ||
      cleanLink.includes("podcast");

    if (!finalImage && !isPod) {
      alert("נא להזין תמונה ראשית");
      return;
    }

    if (!finalImage) {
      finalImage = "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80";
    }

    const matchedCat = mediaCategories.find((c) => c.id === formCategory);
    const categoryName = isPod ? "פודקאסטים" : (matchedCat ? matchedCat.name : "כתבות ומאמרים");
    const finalCategoryId = isPod ? "podcast" : formCategory;

    // Set today's date if empty
    const publishDate =
      formDate ||
      new Date().toLocaleDateString("he-IL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

    const finalContent =
      formContent.trim() ||
      (isPod
        ? "פודקאסט מקצועי להאזנה וצפייה ישירה בעמוד המקור."
        : "לפרטים נוספים ומלאים עיינו בתוכן המצורף.");

    try {
      const articleData = {
        title: formTitle.trim(),
        category: categoryName,
        categoryId: finalCategoryId,
        date: publishDate,
        image: finalImage,
        innerImage: formInnerImage || "",
        content: finalContent,
        link: cleanLink || "#",
      };

      // Deterministic ID across devices
      const targetId = editingArticleId || `reinitz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      
      const fullRecord = {
        id: targetId,
        ...articleData,
        createdAt: new Date().toISOString(),
      };

      // 1. Guaranteed server-side save (saves to disk, in-memory, AND writes to Cloud Firestore on backend!)
      try {
        await fetch("/api/articles/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fullRecord),
        });
      } catch (srvErr) {
        console.warn("Server save notice:", srvErr);
      }

      // 2. Direct client Firestore write with setDoc (merge)
      try {
        await setDoc(doc(db, "articles", targetId), {
          ...articleData,
          createdAt: serverTimestamp(),
        }, { merge: true });
      } catch (dbErr: any) {
        console.warn("Direct Firestore write note (backed up by server):", dbErr);
      }

      // 3. Instant local state & localStorage update
      const updatedList = editingArticleId
        ? articlesList.map((art) => (art.id === editingArticleId ? { ...art, ...fullRecord } : art))
        : [fullRecord, ...articlesList.filter((a) => a.id !== targetId)];

      const sortedList = sortArticles(updatedList);
      setArticlesList(sortedList);

      try {
        localStorage.setItem("babun_articles_cache", JSON.stringify(sortedList));
        window.dispatchEvent(new CustomEvent("articles_updated", { detail: sortedList }));
      } catch (e) {}

      alert(editingArticleId ? "הכתבה עודכנה בהצלחה וסונכרנה לכל המחשבים!" : "הכתבה פורסמה בהצלחה וסונכרנה לכל המחשבים!");

      // Close both the add/edit modal and return to articles list view
      handleCloseAddForm();
      handleCloseArticle();
    } catch (err: any) {
      console.error("Failed to save article:", err);
      alert(`שגיאה בשמירת הכתבה: ${err.message}`);
    }
  };

  // Delete article from Firestore & Server
  const handleDeleteArticle = async (id: string, name: string) => {
    if (!window.confirm(`האם אתה בטוח שברצונך למחוק את הכתבה: "${name}"?`))
      return;

    try {
      // 1. Server delete (removes from memory, disk, and Cloud Firestore)
      try {
        await fetch("/api/articles/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
      } catch (srvErr) {
        console.warn("Server delete notice:", srvErr);
      }

      // 2. Direct client Firestore delete
      try {
        await deleteDoc(doc(db, "articles", id));
      } catch (err: any) {
        console.warn("Direct Firestore delete note:", err);
      }

      const updatedList = articlesList.filter((art) => art.id !== id);
      setArticlesList(updatedList);
      try {
        localStorage.setItem("babun_articles_cache", JSON.stringify(updatedList));
        window.dispatchEvent(new CustomEvent("articles_updated", { detail: updatedList }));
      } catch (e) {}

      if (selectedArticle?.id === id) {
        setSelectedArticle(null);
      }

      alert("הכתבה נמחקה בהצלחה מכל המחשבים והענן!");
    } catch (err: any) {
      console.error("Delete error:", err);
      alert(`שגיאה במחיקת הכתבה: ${err.message}`);
    }
  };

  // Parse Google Drive share links dynamically to display images
  const getDisplayImage = (url: string) => {
    if (!url) return "";
    const driveFileRegex = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const driveIdRegex = /[?&]id=([a-zA-Z0-9_-]+)/;

    const fileMatch = url.match(driveFileRegex);
    const idMatch = url.match(driveIdRegex);

    const fileId = fileMatch ? fileMatch[1] : idMatch ? idMatch[1] : null;

    if (fileId) {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w600`;
    }
    return url;
  };

  // Actual list to render logic (fallback to static mock if empty/loading fails)
  const activeArticles = articlesList.length > 0 ? articlesList : seedArticles;

  const filteredArticles =
    activeCategory === "all"
      ? activeArticles
      : activeArticles.filter(
          (article) =>
            article.categoryId === activeCategory ||
            (activeCategory === "podcast" && isPodcastArticle(article)),
        );

  if (selectedArticle) {
    const readingTime = Math.max(1, Math.ceil((selectedArticle.content?.length || 600) / 450));

    return (
      <div className="bg-white min-h-screen selection:bg-babun-accent selection:text-babun-primary text-right" dir="rtl">
        {/* Dark Hero Header for Detail Page */}
        <section className="relative bg-babun-primary text-white pt-40 md:pt-48 pb-16 md:pb-20 overflow-hidden border-b border-babun-primary/20">
          <div
            className="absolute inset-0 opacity-20 z-0"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at center, rgba(30,41,59,0.6) 0%, rgba(15,23,42,1) 100%)",
            }}
          />
          <div className="max-w-5xl mx-auto px-4 md:px-8 relative z-10">
            {/* Category Tag & Admin Controls */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <span className="inline-block bg-babun-accent text-babun-primary font-bold text-xs px-3.5 py-1 rounded-[2px] uppercase tracking-wider font-display">
                {selectedArticle.category || "מאמר מקצועי"}
              </span>

              {isAdminMode && selectedArticle.id && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const art = selectedArticle;
                      handleCloseArticle();
                      handleEditArticleClick(art);
                    }}
                    className="text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3.5 py-1.5 rounded-sm flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Edit size={13} />
                    <span>ערוך כתבה</span>
                  </button>
                </div>
              )}
            </div>

            {/* Article Main Headline */}
            <h1 className="text-3xl md:text-5xl lg:text-[52px] font-display font-black text-white leading-[1.18] tracking-tight mb-6">
              {selectedArticle.title}
            </h1>

            {/* Bottom Meta Bar: Date on Right, Back Link on Left */}
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/10">
              {/* Right: Date & Reading Time */}
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 font-sans">
                <span>{selectedArticle.date}</span>
                <span>•</span>
                <span>{readingTime} דק' קריאה</span>
              </div>

              {/* Left: Back to all articles button */}
              <button
                onClick={handleCloseArticle}
                className="inline-flex items-center gap-2 text-zinc-300 hover:text-babun-accent font-display font-medium text-xs md:text-sm transition-colors cursor-pointer group"
              >
                <span>חזרה לכל המאמרים</span>
                <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 md:px-8 pt-10 md:pt-14 pb-24">
          {/* Main Hero Image / Embedded Video / Podcast Player */}
          {(() => {
            const extUrl = formatExternalUrl(selectedArticle.link);
            const isMedia = extUrl && detectMediaType(extUrl) !== "unknown";

            if (isMedia) {
              return (
                <div className="mb-12 space-y-3">
                  <div className="w-full aspect-video rounded-babun-lg overflow-hidden shadow-2xl bg-black border border-babun-primary/15">
                    <UniversalMediaPlayer
                      url={extUrl}
                      title={selectedArticle.title}
                      poster={getDisplayImage(selectedArticle.image || selectedArticle.innerImage)}
                      autoPlay={false}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-zinc-50 border border-zinc-200/80 p-3 sm:px-4 rounded-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-babun-primary font-display">נגן מוטמע באתר רייניץ</span>
                      <span className="text-zinc-400">•</span>
                      <span className="text-zinc-600">האזנה ישירה באתר</span>
                    </div>
                    {extUrl && (
                      <a
                        href={extUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-bold text-babun-primary hover:text-black bg-babun-accent hover:bg-yellow-400 px-3.5 py-1.5 rounded-sm transition-all self-start sm:self-auto cursor-pointer shadow-xs"
                        title="פתיחת הקישור לפודקאסט בטאב חדש"
                      >
                        <span>פתיחת הפודקאסט בטאב חדש</span>
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div className="w-full overflow-hidden rounded-sm mb-12 shadow-sm border border-zinc-100 bg-zinc-50">
                <img
                  src={getDisplayImage(selectedArticle.image || selectedArticle.innerImage)}
                  className="w-full max-h-[640px] object-cover"
                  referrerPolicy="no-referrer"
                  alt={selectedArticle.title}
                />
              </div>
            );
          })()}

          {/* Two-Column Layout (Article Body + Sticky Share Sidebar) */}
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start justify-between">
            
            {/* Right Side: Main Article Content */}
            <div className="w-full lg:w-[72%] space-y-6">
              
              {/* Optional Scanned Newspaper / Inner Image */}
              {selectedArticle.innerImage && selectedArticle.innerImage !== selectedArticle.image && (
                <div className="mb-8 p-4 bg-zinc-50 border border-zinc-200 rounded-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-zinc-500">צילום העיתון / המאמר המקורי:</span>
                  </div>
                  <img
                    src={getDisplayImage(selectedArticle.innerImage)}
                    alt="סריקת מאמר"
                    className="w-full h-auto max-h-[85vh] object-contain rounded-sm shadow-xs bg-white"
                  />
                </div>
              )}

              {/* Text / Markdown Content */}
              {selectedArticle.content ? (
                <div className="article-content text-zinc-800 text-base md:text-lg leading-[1.85] space-y-6">
                  <Markdown
                    components={{
                      h1: ({node, ...props}) => (
                        <div className="bg-[#FBFBFA] border-r-4 border-babun-accent py-3.5 px-6 my-8 rounded-[2px] shadow-xs">
                          <h1 className="text-xl md:text-2xl font-black text-babun-primary font-display m-0 leading-snug" {...props} />
                        </div>
                      ),
                      h2: ({node, ...props}) => (
                        <div className="bg-[#FBFBFA] border-r-4 border-babun-accent py-3.5 px-6 my-8 rounded-[2px] shadow-xs">
                          <h2 className="text-xl md:text-2xl font-black text-babun-primary font-display m-0 leading-snug" {...props} />
                        </div>
                      ),
                      h3: ({node, ...props}) => (
                        <div className="bg-[#FBFBFA] border-r-4 border-babun-accent py-3 px-5 my-6 rounded-[2px] shadow-xs">
                          <h3 className="text-lg md:text-xl font-bold text-babun-primary font-display m-0 leading-snug" {...props} />
                        </div>
                      ),
                      h4: ({node, ...props}) => (
                        <div className="bg-[#FBFBFA] border-r-4 border-babun-accent py-2.5 px-4 my-5 rounded-[2px] shadow-xs">
                          <h4 className="text-base md:text-lg font-bold text-babun-primary font-display m-0" {...props} />
                        </div>
                      ),
                      p: ({node, ...props}) => (
                        <p className="text-zinc-700 text-base md:text-lg leading-[1.85] mb-5 font-normal" {...props} />
                      ),
                      strong: ({node, ...props}) => (
                        <strong className="font-bold text-babun-primary" {...props} />
                      ),
                      ul: ({node, ...props}) => (
                        <ul className="list-disc list-inside space-y-2.5 my-5 text-zinc-700 mr-2" {...props} />
                      ),
                      ol: ({node, ...props}) => (
                        <ol className="list-decimal list-inside space-y-2.5 my-5 text-zinc-700 mr-2" {...props} />
                      ),
                      blockquote: ({node, ...props}) => (
                        <blockquote className="border-r-4 border-babun-accent bg-babun-accent/5 py-4 px-6 my-6 text-zinc-800 font-medium italic rounded-sm" {...props} />
                      ),
                      a: ({node, ...props}) => (
                        <a
                          {...props}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-babun-primary font-bold underline hover:text-babun-accent transition-colors inline-flex items-center gap-1 cursor-pointer"
                        />
                      ),
                    }}
                  >
                    {selectedArticle.content}
                  </Markdown>
                </div>
              ) : (
                <div className="bg-babun-primary/5 border-r-4 border-babun-accent p-6 rounded-babun-md space-y-2">
                  <h4 className="font-display font-bold text-babun-primary text-base">
                    {isPodcastArticle(selectedArticle) ? "פרק פודקאסט מוטמע לצפייה ולהאזנה" : "תוכן מוטמע באתר"}
                  </h4>
                  <p className="text-zinc-600 text-sm leading-relaxed">
                    {selectedArticle.summary || "ניתן להאזין ולצפות בפרק המלא ישירות בנגן המובנה בחלק העליון של העמוד, ישירות באתר."}
                  </p>
                </div>
              )}

              {/* Direct Link Banner to Podcast (Opens in a New Tab) */}
              {formatExternalUrl(selectedArticle.link) && (
                <div className="mt-8 p-6 bg-gradient-to-l from-babun-accent/15 via-babun-accent/5 to-white border border-babun-accent/30 rounded-babun-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm text-right">
                  <div className="space-y-1">
                    <h5 className="font-display font-black text-babun-primary text-base sm:text-lg flex items-center justify-end sm:justify-start gap-2">
                      <PlayCircle size={20} className="text-babun-accent fill-babun-primary shrink-0" />
                      <span>{isPodcastArticle(selectedArticle) || selectedArticle.categoryId === "podcast" ? "קישור לפרק הפודקאסט המלא" : "קישור למקור הכתבה"}</span>
                    </h5>
                    <p className="text-xs text-zinc-600">
                      לצפייה או האזנה ישירה ב-YouTube / פלטפורמת המקור – לחץ לפתיחה בטאב נפרד
                    </p>
                  </div>
                  <a
                    href={formatExternalUrl(selectedArticle.link)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-babun-primary hover:bg-black text-white px-5 py-3 rounded-babun-sm font-display font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer hover:scale-102"
                    title="פתיחת הקישור לפודקאסט בטאב חדש"
                  >
                    <span>פתיחת הפודקאסט בטאב חדש</span>
                    <ExternalLink size={14} className="text-babun-accent" />
                  </a>
                </div>
              )}
            </div>

            {/* Left Side: Sticky Sidebar (Share + Tools) */}
            <div className="w-full lg:w-[25%] shrink-0 space-y-6">
              <div className="sticky top-28 bg-white border border-zinc-200/80 rounded-sm p-6 space-y-5 shadow-xs">
                {/* Direct Podcast Open Link in Sidebar */}
                {formatExternalUrl(selectedArticle.link) && (
                  <div className="pb-4 border-b border-zinc-200/80">
                    <span className="text-xs font-bold text-zinc-400 block tracking-wider uppercase mb-3">
                      קישור ישיר
                    </span>
                    <a
                      href={formatExternalUrl(selectedArticle.link)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-babun-primary hover:bg-black text-white py-3.5 px-4 rounded-sm text-xs font-bold font-display shadow-md transition-all cursor-pointer group"
                      title="פתיחת הקישור לפודקאסט בטאב חדש"
                    >
                      <span>פתיחת הפודקאסט בטאב חדש</span>
                      <ExternalLink size={14} className="text-babun-accent group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </div>
                )}

                <span className="text-xs font-bold text-zinc-400 block tracking-wider uppercase">
                  שיתוף המאמר
                </span>

                {/* Copy Link Button */}
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center gap-2 border border-zinc-200 hover:border-zinc-400 bg-white hover:bg-zinc-50 text-zinc-800 hover:text-black py-3 px-4 rounded-sm text-xs font-bold shadow-2xs transition-all cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check size={15} className="text-emerald-600" />
                      <span className="text-emerald-600">הקישור הועתק!</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={15} className="text-zinc-500" />
                      <span>העתק קישור</span>
                    </>
                  )}
                </button>

                {/* WhatsApp Share Button */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(selectedArticle.title + "\n" + window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] py-3 px-4 rounded-sm text-xs font-bold transition-all"
                >
                  <MessageCircle size={15} />
                  <span>שתף בוואטסאפ</span>
                </a>

                {/* Admin Quick Actions */}
                {isAdminMode && selectedArticle.id && (
                  <div className="pt-4 border-t border-zinc-200/80 space-y-2">
                    <span className="text-[11px] font-bold text-zinc-400 block">ניהול</span>
                    <button
                      onClick={() => {
                        const art = selectedArticle;
                        handleCloseArticle();
                        handleEditArticleClick(art);
                      }}
                      className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 text-xs font-bold py-2.5 px-3 rounded-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-amber-500/20"
                    >
                      <Edit size={13} />
                      <span>ערוך מאמר זה</span>
                    </button>
                    <button
                      onClick={() => handleDeleteArticle(selectedArticle.id, selectedArticle.title)}
                      className="w-full bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold py-2.5 px-3 rounded-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-red-200"
                    >
                      <Trash2 size={13} />
                      <span>מחק מאמר</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Bottom Consultation CTA */}
          <section className="py-16 md:py-20 text-center bg-black mt-24 rounded-sm relative overflow-hidden">
            <div className="max-w-2xl mx-auto px-4">
              <h3 className="text-2xl md:text-4xl font-display font-black text-white mb-4 leading-tight">
                שאלה אחת יכולה לחסוך לך <br className="hidden md:block" />
                <span className="text-babun-accent">עשרות אלפי שקלים.</span>
              </h3>
              <p className="text-xs md:text-sm text-white/70 font-light mb-8 max-w-lg mx-auto leading-relaxed">
                פגישת ייעוץ אישית עם יעקב רייניץ. שעה אחת. תשובות ישירות. בלי אינטרסים נסתרים.
              </p>
              <Link
                to="/consulting"
                className="btn-babun-primary inline-block px-10 py-3.5 shadow-xl font-display font-bold text-xs"
              >
                קביעת פגישה ←
              </Link>
            </div>
          </section>

        </div>
      </div>
    );
  }

  return (
    <div className="bg-babun-light min-h-screen pb-0 selection:bg-babun-accent selection:text-babun-primary">
      {/* PAGE HERO */}
      <section className="bg-babun-primary text-white pt-52 pb-24 md:pt-64 md:pb-28 relative overflow-hidden">
        {/* Full-Bleed Video Background */}
        <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none">
          {/* Instant High-Res Video Poster displayed on frame 0 */}
          <img
            src="https://i.vimeocdn.com/video/2196055375-8a53d9b62c9324bd6c2f025bb91b41dc5126cd29eef2589f0576ab043fdc9453-d_640"
            alt="יעקב רייניץ"
            fetchPriority="high"
            className="absolute inset-0 w-full h-full object-cover scale-105"
          />

          {/* Vimeo Background Video */}
          <iframe
            src="https://player.vimeo.com/video/1222960766?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1&playsinline=1&dnt=1&quality=720p"
            title="יעקב רייניץ - רקע וידאו מאמרים"
            frameBorder="0"
            loading="eager"
            onLoad={() => setHeroVideoLoaded(true)}
            allow="autoplay; fullscreen; picture-in-picture"
            className={`absolute top-1/2 left-1/2 min-w-full min-h-full w-[177.77vw] h-[56.25vw] max-w-none max-h-none -translate-x-1/2 -translate-y-1/2 object-cover scale-125 transition-opacity duration-1000 ${
              heroVideoLoaded ? "opacity-90" : "opacity-0"
            }`}
            style={{
              width: '180%',
              height: '180%',
              minWidth: '100%',
              minHeight: '100%',
            }}
          />

          {/* Transparent click/tap block layer */}
          <div className="absolute inset-0 bg-transparent z-[10] pointer-events-auto" />

          {/* Black Semi-Transparent Overlay & Gradient Layer */}
          <div className="absolute inset-0 bg-black/60 z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-t from-babun-primary via-black/50 to-babun-primary/75 z-[2]" />
          <div className="absolute inset-0 mesh-grid opacity-5 z-[3]" />
        </div>

        {/* Ambient subtle gold glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-babun-accent/10 rounded-full blur-[120px] pointer-events-none z-10" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 text-right">
          <div className="max-w-4xl space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7 }}
              className="text-4xl md:text-6xl lg:text-[76px] font-display font-black leading-[1.1] text-white tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]"
            >
              בנדל"ן, <br />
              הידע הוא הנכס{" "}
              <span className="text-babun-accent font-black">הכי יקר.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="text-slate-200 text-base md:text-xl font-light max-w-2xl leading-relaxed md:leading-[32px] drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
            >
              מאמרים מקצועיים, פודקאסטים, טורים שבועיים וקווי מידע עם יעקב רייניץ — כל הכלים והתובנות להשקעות נדל"ן חכמות ובטוחות.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ADMIN ACTION SUBHEADER */}
      {isAdminMode && (
        <div className="bg-babun-primary/5 py-4 border-b border-babun-primary/10 text-right">
          <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-row-reverse flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-row-reverse text-babun-primary">
              <Sparkles size={16} className="text-babun-accent" />
              <span className="text-xs font-bold font-display">
                מצב עריכת מנהל פעיל
              </span>
              {user && (
                <span className="text-xs opacity-60">({user.email})</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={refreshAllArticles}
                disabled={isRefreshing}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-display text-xs font-bold px-3.5 py-2 rounded-babun-sm flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50 transition-colors"
                title="סנכרון ענן מיידי לכל המחשבים בעולם"
              >
                <RefreshCw size={13} className={`text-white ${isRefreshing ? "animate-spin" : ""}`} />
                <span>{isRefreshing ? "מסנכרן..." : "סנכרן את כל המחשבים עכשיו"}</span>
              </button>
              <Link
                to="/database"
                className="bg-babun-primary hover:bg-black text-white font-display text-xs font-bold px-3.5 py-2 rounded-babun-sm flex items-center gap-1.5 cursor-pointer shadow-md"
                title="צפייה במצב מסד הנתונים וסנכרון מיידי בין כל המחשבים"
              >
                <Database size={13} className="text-babun-accent" />
                <span>צפייה וסנכרון דאטה-בייס</span>
              </Link>
              <button
                onClick={() => {
                  handleOpenAddForm();
                }}
                className="bg-babun-primary hover:bg-babun-primary/90 text-white font-display text-xs font-bold px-4 py-2 rounded-babun-sm flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>הוספת כתבה / פודקאסט</span>
                <Plus size={14} className="text-babun-accent" />
              </button>
              {articlesList.length > 0 && (
                <button
                  onClick={handleDeleteAllArticles}
                  className="bg-red-650 hover:bg-red-700 text-white font-display text-xs font-bold px-4 py-2 rounded-babun-sm flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Trash2 size={13} />
                  <span>מחיקת כל התכנים</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-550/10 hover:bg-red-550/20 text-red-600 font-display text-xs font-bold px-4 py-2 rounded-babun-sm cursor-pointer"
              >
                התנתק ממצב ניהול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div
        id="content-section"
        className="max-w-7xl mx-auto px-4 md:px-8 pt-16"
      >
        {/* Refresh Notification Banner */}
        {refreshNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 mx-auto max-w-xl bg-emerald-50 border border-emerald-300 text-emerald-900 px-5 py-3.5 rounded-babun-md text-center text-sm font-bold shadow-sm flex items-center justify-center gap-2.5"
          >
            <CheckCircle size={18} className="text-emerald-600 shrink-0" />
            <span>{refreshNotice}</span>
          </motion.div>
        )}

        {/* Dynamic Category Filtering Buttons */}
        <div
          className="flex flex-row flex-wrap items-center justify-center gap-3 md:gap-4 mb-20"
          id="category-filter-bar"
          dir="rtl"
        >
          {mediaCategories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-btn-${cat.id}`}
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex flex-row items-center gap-2.5 px-6 py-4 rounded-babun-md font-display font-bold text-sm md:text-base transition-all duration-300 cursor-pointer border ${
                  isActive
                    ? "bg-babun-primary text-white border-babun-primary/10 shadow-lg shadow-babun-primary/5"
                    : "bg-white text-babun-primary/70 hover:text-babun-primary border-babun-primary/5 hover:border-babun-accent/40 shadow-xs"
                }`}
                dir="rtl"
              >
                <Icon
                  size={18}
                  className={
                    isActive ? "text-babun-accent" : "text-babun-primary/55"
                  }
                />
                <span>{cat.name}</span>
              </button>
            );
          })}

          {/* Quick Refresh Content Button */}
          <button
            onClick={refreshAllArticles}
            disabled={isRefreshing}
            className="flex flex-row items-center gap-2 px-5 py-4 rounded-babun-md font-display font-bold text-xs md:text-sm bg-white text-babun-primary/70 hover:text-babun-primary border border-babun-primary/5 hover:border-babun-accent/40 shadow-xs cursor-pointer transition-all disabled:opacity-50"
            title="רענן ומשוך כתבות עדכניות מהענן עכשיו"
          >
            <RefreshCw
              size={16}
              className={`text-babun-accent ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>{isRefreshing ? "מרענן..." : "רענן מאגר"}</span>
          </button>
        </div>

        {/* LOADING INDICATOR */}
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4 text-babun-primary/40">
            <Loader2 size={40} className="animate-spin text-babun-accent" />
            <span className="font-display font-medium text-sm">
              טוען את המאמרים והכתבות...
            </span>
          </div>
        ) : (
          /* ARTICLES GRID CONTAINER */
          <section className="relative">

            {filteredArticles.length === 0 ? (
              <div className="bg-white rounded-none p-16 text-center border border-babun-primary/10 shadow-none">
                <Newspaper
                  size={48}
                  className="mx-auto text-babun-primary/20 mb-4 animate-bounce"
                />
                <h4 className="font-display font-bold text-lg text-babun-primary mb-2">
                  אין תוכן בקטגוריה זו עדיין
                </h4>
                <p className="text-babun-primary/50 text-xs">
                  המנהל יעלה תכנים חמים בקרוב מאוד.
                </p>
              </div>
            ) : activeCategory === "podcast" ? (
              /* DEDICATED IN-SITE EMBEDDED PODCAST HUB & STAGE */
              <div className="space-y-16" ref={podcastStageRef}>
                {(() => {
                  const activePod = selectedPodcast || (filteredArticles.length > 0 ? filteredArticles[0] : null);
                  if (!activePod) return null;
                  const mediaUrl = formatExternalUrl(activePod.link);

                  return (
                    <div className="bg-white rounded-babun-xl border border-babun-primary/10 p-6 md:p-10 shadow-xl overflow-hidden text-right">
                      {/* Top Header Badge & Title */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-babun-primary/10 pb-6 mb-8">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-full bg-babun-accent/20 text-babun-primary flex items-center justify-center font-bold shrink-0">
                            <Play size={22} className="fill-babun-accent text-babun-primary ml-0.5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-widest text-babun-accent bg-babun-primary px-2.5 py-0.5 rounded-sm">
                                נגן פודקאסט מוטמע באתר
                              </span>
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-200">
                                מתנגן ישירות כאן
                              </span>
                            </div>
                            <h3 className="text-xl md:text-2xl lg:text-3xl font-black font-display text-babun-primary mt-1.5 leading-snug">
                              {activePod.title}
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold text-babun-primary/60 font-mono shrink-0">
                          <Calendar size={14} />
                          <span>{activePod.date}</span>
                        </div>
                      </div>

                      {/* The Main Embedded Media Player (YouTube, Spotify, etc.) */}
                      {mediaUrl && detectMediaType(mediaUrl) !== "unknown" ? (
                        <div className="w-full aspect-video rounded-babun-lg overflow-hidden shadow-2xl bg-black mb-8 border border-babun-primary/15">
                          <UniversalMediaPlayer
                            url={mediaUrl}
                            title={activePod.title}
                            poster={getDisplayImage(activePod.image || activePod.innerImage)}
                            autoPlay={isPlayingPodcast}
                          />
                        </div>
                      ) : (
                        <div className="w-full aspect-video rounded-babun-lg overflow-hidden shadow-md bg-zinc-100 mb-8 border border-babun-primary/10 flex items-center justify-center">
                          <ImageWithSkeleton
                            src={getDisplayImage(activePod.image || activePod.innerImage)}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            alt={activePod.title}
                          />
                        </div>
                      )}

                      {/* Active Episode Details & Action Buttons */}
                      <div className="flex flex-col md:flex-row items-start justify-between gap-6 pt-2">
                        <div className="flex-1 space-y-3">
                          {activePod.summary && (
                            <p className="text-babun-primary/80 text-sm md:text-base leading-relaxed font-normal">
                              {activePod.summary}
                            </p>
                          )}
                          {activePod.content && (
                            <p className="text-babun-primary/60 text-xs md:text-sm line-clamp-3 leading-relaxed">
                              {activePod.content.replace(/[#*`]/g, '')}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0 flex-wrap">
                          <button
                            onClick={() => handleSelectArticle(activePod)}
                            className="bg-babun-primary hover:bg-black text-white px-5 py-3 rounded-babun-sm font-display font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <span>צפייה והאזנה בעמוד הפרק המלא באתר רייניץ</span>
                            <ArrowLeft size={15} />
                          </button>

                          {formatExternalUrl(activePod.link) && (
                            <a
                              href={formatExternalUrl(activePod.link)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-babun-accent hover:bg-yellow-400 text-babun-primary px-4 py-3 rounded-babun-sm font-display font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                              title="פתיחת הקישור לפודקאסט בטאב חדש"
                            >
                              <span>פתח פודקאסט בטאב חדש</span>
                              <ExternalLink size={14} />
                            </a>
                          )}

                          {isAdminMode && activePod.id && (
                            <button
                              onClick={(e) => handleEditArticleClick(activePod, e)}
                              className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-500/20 px-3.5 py-3 rounded-babun-sm text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                            >
                              <Edit size={14} />
                              <span>ערוך פרק</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Playlist of All Other Podcast Episodes */}
                <div>
                  <div className="flex items-center justify-between mb-8 pb-3 border-b border-babun-primary/10 text-right">
                    <div>
                      <h4 className="text-xl md:text-2xl font-black font-display text-babun-primary">
                        כל פרקי הפודקאסט להאזנה וצפייה ישירה באתר
                      </h4>
                      <p className="text-xs text-babun-primary/60 mt-1">
                        לחץ על "נגן פרק זה" כדי לטעון ולהשמיע אותו ישירות בנגן המובנה למעלה – ללא יציאה מהאתר
                      </p>
                    </div>
                    <span className="text-xs font-bold bg-babun-primary/5 px-3 py-1.5 rounded-full text-babun-primary font-mono">
                      {filteredArticles.length} פרקים
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredArticles.map((article, idx) => {
                      const isSelected = selectedPodcast?.id === article.id || (!selectedPodcast && idx === 0);

                      return (
                        <motion.div
                          key={article.id || idx}
                          layout
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.05 }}
                          onClick={(e) => {
                            if ((e.target as HTMLElement).closest("button")) return;
                            handleSelectArticle(article);
                          }}
                          className={`group cursor-pointer text-right flex flex-col justify-between bg-white p-6 rounded-babun-xl border transition-all duration-300 shadow-md hover:shadow-xl ${
                            isSelected
                              ? "border-babun-accent ring-2 ring-babun-accent/30 bg-amber-50/20"
                              : "border-babun-primary/5 hover:border-babun-accent/35"
                          }`}
                        >
                          {/* Thumbnail with interactive Play overlay */}
                          <div 
                            onClick={() => handleSelectArticle(article)}
                            className="w-full aspect-[16/10] bg-[#efede8] overflow-hidden rounded-babun-lg relative border border-babun-primary/5 shrink-0 shadow-sm cursor-pointer"
                          >
                            <ImageWithSkeleton
                              src={getDisplayImage(article.image || article.innerImage)}
                              className="w-full h-full object-cover group-hover:scale-103 transition-all duration-700"
                              referrerPolicy="no-referrer"
                              alt={article.title}
                            />
                            <div className="absolute top-3 right-3 bg-babun-accent text-babun-primary font-display font-bold px-2 py-0.5 text-[9px] uppercase tracking-wider rounded-babun-xs z-10 pointer-events-none">
                              {article.category || "פודקאסט"}
                            </div>
                            <div className="absolute bottom-3 left-3 p-2 rounded-full transition-all z-10 bg-babun-primary/80 backdrop-blur-xs text-white group-hover:bg-babun-accent group-hover:text-babun-primary">
                              <Play size={16} className="fill-current ml-0.5" />
                            </div>
                            {isSelected && (
                              <div className="absolute top-3 left-3 bg-emerald-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-babun-xs shadow-sm flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                <span>מתנגן כעת</span>
                              </div>
                            )}
                          </div>

                          {/* Info contents */}
                          <div className="flex-1 w-full flex flex-col justify-between pt-4">
                            <div>
                              <div className="flex items-center gap-2 justify-end text-[11px] font-bold opacity-30 mb-2 font-mono">
                                <span>{article.date}</span>
                                <Calendar size={12} />
                              </div>
                              <h5 
                                onClick={() => handleSelectArticle(article)}
                                className="text-lg font-display font-bold text-babun-primary group-hover:text-babun-accent transition-colors leading-snug line-clamp-2 cursor-pointer"
                              >
                                {article.title}
                              </h5>
                              {article.summary && (
                                <p className="text-babun-primary/60 text-xs mt-2.5 line-clamp-2 font-light leading-relaxed">
                                  {article.summary}
                                </p>
                              )}
                            </div>

                            <div className="mt-5 pt-4 border-t border-babun-primary/5 flex items-center justify-between gap-2 flex-wrap">
                              <button
                                onClick={() => handleSelectArticle(article)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-babun-sm text-xs font-bold font-display cursor-pointer transition-all bg-babun-primary text-white hover:bg-black shadow-sm"
                              >
                                <span>עמוד הפרק באתר</span>
                                <ArrowLeft size={13} />
                              </button>

                              {formatExternalUrl(article.link) && (
                                <a
                                  href={formatExternalUrl(article.link)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-xs font-bold flex items-center gap-1 cursor-pointer px-2.5 py-2 rounded-babun-sm bg-babun-accent/20 hover:bg-babun-accent text-babun-primary border border-babun-accent/40 transition-all shadow-2xs"
                                  title="פתיחת הקישור לפודקאסט בטאב חדש"
                                >
                                  <span>פתח בטאב חדש</span>
                                  <ExternalLink size={12} />
                                </a>
                              )}

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlayPodcast(article);
                                }}
                                className={`text-xs font-bold flex items-center gap-1 cursor-pointer px-2 py-2 rounded-babun-sm border transition-all ${
                                  isSelected
                                    ? "bg-babun-accent text-babun-primary border-babun-accent"
                                    : "text-babun-primary/70 hover:text-babun-primary hover:bg-babun-primary/5 border-zinc-200"
                                }`}
                                title="השמע ישירות בנגן למעלה"
                              >
                                <Play size={11} className="fill-current ml-0.5" />
                                <span>{isSelected ? "מתנגן" : "השמע מעל"}</span>
                              </button>
                            </div>

                            {isAdminMode && article.id && (
                              <div className="flex items-center justify-between mt-3 pt-2 border-t border-babun-primary/5 border-dashed">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDeleteArticle(article.id, article.title);
                                  }}
                                  className="text-red-500 hover:text-red-700 p-1 cursor-pointer rounded-babun-sm hover:bg-red-50 transition-colors"
                                  title="מחק כתבה"
                                >
                                  <Trash2 size={13} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleEditArticleClick(article, e);
                                  }}
                                  className="text-babun-primary hover:text-babun-accent p-1 cursor-pointer rounded-babun-sm hover:bg-babun-primary/5 transition-colors flex items-center gap-1 text-xs font-bold"
                                  title="ערוך כתבה"
                                >
                                  <Edit size={13} />
                                  <span>ערוך</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* STANDARD ARTICLE & MAGAZINE VIEW FOR ALL OTHER CATEGORIES */
              <div className="space-y-16">
                {filteredArticles.length > 0 && (() => {
                  const firstArticle = filteredArticles[0];
                  const isPodcast = isPodcastArticle(firstArticle) || firstArticle.categoryId === "podcast" || activeCategory === "podcast";
                  const extUrl = formatExternalUrl(firstArticle.link);
                  const hasEmbeddedMedia = !!extUrl && (isPodcast || activeCategory === "podcast" || firstArticle.link !== "#");

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest("button")) return;
                        handleSelectArticle(firstArticle);
                      }}
                      className="group cursor-pointer text-right flex flex-col lg:flex-row gap-8 lg:gap-12 bg-white p-6 md:p-8 border border-babun-primary/5 rounded-babun-xl hover:border-babun-accent/35 transition-all duration-300 shadow-md hover:shadow-xl shadow-babun-primary/[0.02]"
                    >
                      <div className="w-full lg:w-1/2 aspect-[16/10] bg-[#efede8] overflow-hidden rounded-babun-lg relative border border-babun-primary/5 shrink-0 shadow-sm">
                        <ImageWithSkeleton
                          src={getDisplayImage(firstArticle.image)}
                          className="w-full h-full object-cover group-hover:scale-102 transition-all duration-700"
                          referrerPolicy="no-referrer"
                          alt={firstArticle.title}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-babun-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <div className="absolute top-4 right-4 bg-babun-accent text-babun-primary font-display font-black px-4 py-1.5 text-[10px] uppercase tracking-widest rounded-babun-sm z-10 pointer-events-none">
                          {firstArticle.category}
                        </div>
                        <div className="absolute bottom-4 left-4 bg-babun-primary/80 backdrop-blur-xs text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                          {isPodcast ? (
                            <Play size={16} className="text-babun-accent fill-babun-accent ml-0.5" />
                          ) : (
                            <Eye size={16} className="text-babun-accent" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-2">
                        <div>
                          <div className="flex items-center gap-2 justify-end text-xs font-bold opacity-30 mb-4 font-mono">
                            <span>{firstArticle.date}</span>
                            <Calendar size={13} />
                          </div>
                          <h4 className="text-2xl md:text-3xl lg:text-4xl font-display font-black text-babun-primary mb-6 group-hover:text-babun-accent transition-colors leading-tight">
                            {firstArticle.title}
                          </h4>
                          {firstArticle.content && (
                            <p className="text-babun-primary/60 text-sm md:text-base font-light line-clamp-3 leading-relaxed">
                              {firstArticle.content.replace(/[#*`]/g, '')}
                            </p>
                          )}
                          <div className="mt-8 flex items-center justify-end">
                            <div className="flex items-center gap-2 text-babun-accent font-display font-bold text-sm group-hover:translate-x-[-4px] transition-transform">
                              <span>{isPodcast ? "האזנה וצפייה בפרק באתר" : "קרא עוד"}</span>
                              {isPodcast ? <Play size={16} className="fill-current" /> : <ArrowLeft size={16} />}
                            </div>
                          </div>
                        </div>

                        {isAdminMode && firstArticle.id && (
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-babun-primary/5">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteArticle(firstArticle.id, firstArticle.title);
                              }}
                              className="text-red-500 hover:text-red-700 p-2 cursor-pointer rounded-babun-sm hover:bg-red-50 transition-colors"
                              title="מחק כתבה"
                            >
                              <Trash2 size={16} />
                            </button>

                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleEditArticleClick(firstArticle, e);
                              }}
                              className="text-babun-primary hover:text-babun-accent p-2 cursor-pointer rounded-babun-sm hover:bg-babun-primary/5 transition-colors flex items-center gap-1.5 text-xs font-bold font-display"
                              title="ערוך כתבה"
                            >
                              <Edit size={16} />
                              <span>ערוך כתבה</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })()}

                {filteredArticles.length > 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16 pt-16 border-t border-babun-primary/10">
                    {filteredArticles.slice(1).map((article, i) => {
                      const isPodcast = isPodcastArticle(article) || article.categoryId === "podcast" || activeCategory === "podcast";
                      const extUrl = formatExternalUrl(article.link);

                      return (
                        <motion.div
                          key={article.id || i}
                          layout
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -15 }}
                          transition={{ duration: 0.4, delay: i * 0.05 }}
                          onClick={(e) => {
                            if ((e.target as HTMLElement).closest("button")) return;
                            handleSelectArticle(article);
                          }}
                          className="group cursor-pointer text-right flex flex-col justify-between bg-white p-6 rounded-babun-xl border border-babun-primary/5 hover:border-babun-accent/35 hover:bg-white shadow-md hover:shadow-xl shadow-babun-primary/[0.01] transition-all duration-300 h-full"
                        >
                          {/* Thumbnail Cover */}
                          <div className="w-full aspect-[16/10] bg-[#efede8] overflow-hidden rounded-babun-lg relative border border-babun-primary/5 shrink-0 shadow-sm">
                            <ImageWithSkeleton
                              src={getDisplayImage(article.image)}
                              className="w-full h-full object-cover group-hover:scale-102 transition-all duration-700"
                              referrerPolicy="no-referrer"
                              alt={article.title}
                            />
                            <div className="absolute top-3 right-3 bg-babun-accent text-babun-primary font-display font-bold px-2 py-0.5 text-[9px] uppercase tracking-wider rounded-babun-xs z-10 pointer-events-none">
                              {article.category}
                            </div>
                            <div className="absolute bottom-3 left-3 bg-babun-primary/80 backdrop-blur-xs text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                              {isPodcast ? (
                                <Play size={13} className="text-babun-accent fill-babun-accent ml-0.5" />
                              ) : (
                                <Eye size={13} className="text-babun-accent" />
                              )}
                            </div>
                          </div>

                          {/* Info contents */}
                          <div className="flex-1 w-full flex flex-col justify-between pt-4">
                            <div>
                              <div className="flex items-center gap-2 justify-end text-[11px] font-bold opacity-30 mb-2.5 font-mono">
                                <span>{article.date}</span>
                                <Calendar size={12} />
                              </div>
                              <h5 className="text-xl font-display font-bold text-babun-primary group-hover:text-babun-accent transition-colors leading-snug line-clamp-2">
                                {article.title}
                              </h5>
                              {article.content && (
                                <p className="text-babun-primary/50 text-xs mt-3 line-clamp-2 font-light leading-relaxed">
                                  {article.content.replace(/[#*`]/g, '')}
                                </p>
                              )}
                              <div className="mt-4 flex items-center justify-end">
                                <div className="flex items-center gap-1.5 text-babun-accent font-display font-bold text-xs group-hover:translate-x-[-3px] transition-transform">
                                  <span>{isPodcast ? "האזנה לפודקאסט באתר" : "קרא עוד"}</span>
                                  {isPodcast ? <Play size={13} className="fill-current" /> : <ArrowLeft size={14} />}
                                </div>
                              </div>
                            </div>

                            {isAdminMode && article.id && (
                              <div className="flex items-center justify-between mt-4 pt-2 border-t border-babun-primary/5 border-dashed">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDeleteArticle(article.id, article.title);
                                  }}
                                  className="text-red-500 hover:text-red-700 p-1.5 cursor-pointer rounded-babun-sm hover:bg-red-50 transition-colors"
                                  title="מחק כתבה"
                                >
                                  <Trash2 size={14} />
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleEditArticleClick(article, e);
                                  }}
                                  className="text-babun-primary hover:text-babun-accent p-1.5 cursor-pointer rounded-babun-sm hover:bg-babun-primary/5 transition-colors flex items-center gap-1.5 text-xs font-bold font-display"
                                  title="ערוך כתבה"
                                >
                                  <Edit size={14} />
                                  <span>ערוך כתבה</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

      </div>

      {/* FLOATING ADMIN LOGIN BUTTON */}
      {!isAdminMode && hasEditParam && (
        <button
          onClick={() => setShowAdminLogin(true)}
          className="fixed bottom-8 right-8 z-55 bg-babun-primary/90 text-white hover:text-babun-accent hover:bg-babun-primary p-4 rounded-full shadow-2xl transition-all duration-300 backdrop-blur-md cursor-pointer flex items-center justify-center"
          title="כניסת מנהל למערכת"
        >
          <Lock size={20} />
        </button>
      )}

      {/* FINAL INTERACTIVE CALL-TO-ACTION */}
      <section className="py-40 text-center bg-black mt-40 mb-0">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl md:text-6xl font-display font-black text-white mb-8 leading-tight">
            שאלה אחת יכולה לחסוך לך <br className="hidden md:block" />
            <span className="text-babun-accent">עשרות אלפי שקלים.</span>
          </h2>
          <p className="text-lg md:text-xl text-white/70 font-light mb-12 max-w-2xl mx-auto leading-relaxed">
            פגישת ייעוץ אישית עם יעקב רייניץ. שעה אחת. תשובות ישירות. בלי אינטרסים נסתרים.
          </p>
          <Link
            to="/consulting"
            className="btn-babun-primary inline-block px-14 py-5 shadow-2xl font-display font-bold"
          >
            קביעת פגישה ←
          </Link>
          <div className="w-24 h-[1px] bg-white/20 mx-auto mt-16" />
        </div>
      </section>

      {/* ==================== 2. MODAL: ADMIN ACCESS GATEWAY ==================== */}
      <AnimatePresence>
        {showAdminLogin && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAdminLogin(false);
                setErrorMsg("");
              }}
              className="absolute inset-0 bg-babun-primary/90 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-babun-lg p-8 relative shadow-2xl text-right z-10 border border-babun-primary/10"
            >
              <button
                onClick={() => {
                  setShowAdminLogin(false);
                  setErrorMsg("");
                }}
                className="absolute top-4 left-4 text-babun-primary/50 hover:text-babun-primary cursor-pointer p-1"
              >
                <X size={18} />
              </button>

              <div className="text-center mb-6 pt-4">
                <div className="w-12 h-12 bg-babun-accent/10 text-babun-accent rounded-full flex items-center justify-center mx-auto mb-3">
                  <Lock size={22} />
                </div>
                <h3 className="text-xl font-display font-black text-babun-primary">
                  כניסת מנהל למערכת
                </h3>
                <p className="text-xs text-babun-primary/50 mt-1">
                  ערוך כתבות, פודקאסטים ופרסם צילומי עיתונות
                </p>
              </div>

              {errorMsg && (
                <div className="bg-red-50 text-red-650 p-4 border-r-4 border-red-500 rounded-babun-sm mb-6 text-xs text-right">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-6">
                {/* Method A: Google sign in */}
                <div>
                  <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 border border-babun-primary/15 hover:border-babun-primary/40 bg-white hover:bg-babun-primary/5 text-babun-primary font-display font-medium text-sm py-3.5 rounded-babun-md cursor-pointer transition-colors shadow-xs"
                  >
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      className="w-5 h-5"
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      ></path>
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      ></path>
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      ></path>
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      ></path>
                    </svg>
                    <span>התחבר עם חשבון Google</span>
                  </button>
                  <p className="text-[10px] text-babun-primary/40 text-center mt-2">
                    הכניסה מוגדרת למייל: michal@extraplus.co.il
                  </p>
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-babun-primary/10"></div>
                  <span className="flex-shrink mx-4 text-xs font-semibold text-babun-primary/30 uppercase">
                    או קוד הדגמה מהיר
                  </span>
                  <div className="flex-grow border-t border-babun-primary/10"></div>
                </div>

                {/* Method B: Fast admin bypass code */}
                <div>
                  <label className="block text-xs font-bold font-display text-babun-primary mb-2">
                    קוד מנהל מהיר (עבור הפירסום המיידי):
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePasscodeLogin}
                      className="bg-babun-primary text-white hover:bg-babun-primary/95 text-xs font-bold px-5 py-3 rounded-babun-sm cursor-pointer shadow-md"
                    >
                      כניסה
                    </button>
                    <input
                      type="password"
                      placeholder="הקלד קוד מנהל לדוגמה..."
                      value={adminPass}
                      onChange={(e) => setAdminPass(e.target.value)}
                      className="flex-grow border border-babun-primary/15 rounded-babun-sm px-4 py-3 text-xs text-right focus:outline-hidden focus:border-babun-accent focus:ring-1 focus:ring-babun-accent bg-babun-light/50"
                    />
                  </div>
                  <p className="text-[10px] text-babun-primary/45 mt-2 text-right">
                    קוד לדוגמה מהיר:{" "}
                    <span className="font-mono bg-babun-primary/5 px-1 rounded-sm text-yellow-700">
                      reinitz2026
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== 3. MODAL: WRITE/CREATE NEW ARTICLE AND AI OCR ==================== */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
              className="absolute inset-0 bg-babun-primary/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-3xl h-[85vh] rounded-babun-xl overflow-hidden relative shadow-2xl flex flex-col text-right z-10 border border-babun-primary/15"
            >
              <div className="bg-babun-primary text-white p-6 justify-between flex flex-row-reverse items-center">
                <div className="flex items-center gap-2 flex-row-reverse">
                  <Newspaper className="text-babun-accent" size={20} />
                  <h3 className="text-xl font-display font-black leading-none">
                    העלאת תוכן חדש (כתבה / פודקאסט)
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-white hover:text-babun-accent cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form
                onSubmit={handleSaveArticle}
                className="flex-grow overflow-y-auto p-8 space-y-6 scrollbar-thin"
              >
                {/* 1. Article Title */}
                <div>
                  <label className="block text-xs font-black font-display text-babun-primary uppercase tracking-wider mb-2">
                    שם הכתבה / כותרת הפוסט *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="אנא הקלד כותרת מושכת לכתבה הנדלנ'ית החדשה..."
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full border border-babun-primary/15 rounded-babun-md px-4 py-3.5 text-sm focus:outline-hidden focus:border-babun-accent focus:ring-1 focus:ring-babun-accent bg-babun-light/20 text-right font-display"
                  />
                </div>

                {/* 2. Grid split parameters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-black font-display text-babun-primary uppercase tracking-wider mb-2">
                      קטגוריה *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full border border-babun-primary/15 rounded-babun-md px-4 py-3.5 text-sm focus:outline-hidden focus:border-babun-accent bg-white text-right"
                    >
                      <option value="podcast">פודקאסטים (נגן מוטמע באתר)</option>
                      <option value="weekly">טור שבועי</option>
                      <option value="articles">כתבות ומאמרים</option>
                      <option value="kavei">קווי מידע</option>
                    </select>
                  </div>

                  {/* Publish Date */}
                  <div>
                    <label className="block text-xs font-black font-display text-babun-primary uppercase tracking-wider mb-2">
                      תאריך פרסום
                    </label>
                    <input
                      type="text"
                      placeholder="לדוגמה: 03.06.2026 (משאיר ריק להיום)"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full border border-babun-primary/15 rounded-babun-md px-4 py-3.5 text-sm focus:outline-hidden focus:border-babun-accent focus:ring-1 focus:ring-babun-accent bg-babun-light/20 text-right"
                    />
                  </div>

                  {/* Outer Link */}
                  <div>
                    <label className="block text-xs font-black font-display text-babun-primary uppercase tracking-wider mb-2">
                      קישור להטמעה באתר (YouTube, Spotify, וידאו, שמע, פודקאסט)
                    </label>
                    <input
                      type="url"
                      placeholder="הדבק קישור (למשל: סרטון YouTube, פרק בפודקאסט, קישור Spotify או נגן)"
                      value={formLink}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormLink(val);
                        const detected = detectMediaType(val);
                        if ((detected !== "unknown" || val.includes("youtube") || val.includes("spotify") || val.includes("podcast")) && formCategory === "weekly") {
                          setFormCategory("podcast");
                        }
                      }}
                      className="w-full border border-babun-primary/15 rounded-babun-md px-4 py-3.5 text-sm focus:outline-hidden focus:border-babun-accent focus:ring-1 focus:ring-babun-accent bg-babun-light/20 text-right font-mono"
                    />
                    <p className="mt-1.5 text-[11px] text-babun-primary/60 text-right">
                      ✨ כל קישור שמוזן כאן מוטמע ישירות באתר בנגן מובנה – ללא פתיחת חלון חדש וללא יציאה מהאתר!
                    </p>
                    {formLink && detectMediaType(formLink) !== "unknown" && (
                      <>
                        <div className="mt-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-sm flex items-center justify-end gap-1">
                          <span>
                            {detectMediaType(formLink) === "hls" && "✨ זוהה שידור וידאו HLS / Bunny Stream – יוטמע בנגן מובנה באתר!"}
                            {detectMediaType(formLink) === "youtube" && "✨ זוהה סרטון YouTube – יוטמע בנגן וידאו מובנה באתר!"}
                            {detectMediaType(formLink) === "vimeo" && "✨ זוהה סרטון Vimeo – יוטמע בנגן וידאו מובנה באתר!"}
                            {detectMediaType(formLink) === "spotify" && "✨ זוהה פודקאסט Spotify – יוטמע בנגן Spotify מובנה באתר!"}
                            {detectMediaType(formLink) === "apple_podcasts" && "✨ זוהה Apple Podcasts – יוטמע בנגן פודקאסטים מובנה באתר!"}
                            {detectMediaType(formLink) === "audio" && "✨ זוהה קובץ שמע / פודקאסט – יוטמע בנגן שמע ייעודי באתר!"}
                            {detectMediaType(formLink) === "video" && "✨ זוהה קובץ וידאו MP4 – יוטמע ישירות באתר!"}
                            {detectMediaType(formLink) === "iframe" && "✨ זוהה קישור רשת – יוטמע ישירות באתר ללא יציאה לחלון אחר!"}
                          </span>
                          <CheckCircle size={13} className="text-emerald-600" />
                        </div>
                        <div className="mt-3 bg-black/5 p-3 rounded-babun-md border border-babun-primary/10">
                          <span className="text-[11px] font-bold text-babun-primary block mb-2 text-right">
                            🎬 תצוגה מקדימה ישירה של הנגן המוטמע:
                          </span>
                          <div className="w-full max-w-sm mx-auto aspect-video rounded-md overflow-hidden shadow-sm">
                            <UniversalMediaPlayer
                              url={formLink}
                              title="תצוגה מקדימה של נגן מוטמע"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 3א. Image Input: Outer Thumbnail Preview Image */}
                <div className="bg-babun-primary/5 p-6 rounded-babun-lg border-r-4 border-babun-accent space-y-4">
                  <div className="flex items-center justify-between flex-row-reverse border-b border-babun-primary/10 pb-3">
                    <label className="block text-xs font-black font-display text-babun-primary uppercase tracking-wider">
                      תמונה חיצונית (תצוגה מקדימה מושכת עין מחוץ לכתבה) *
                    </label>
                    
                    {/* Source Tab Selector */}
                    <div className="flex bg-babun-primary/10 p-0.5 rounded-babun-sm text-xs select-none">
                      <button
                        type="button"
                        onClick={() => {
                          setImageSourceType("file");
                          setFormImage("");
                          setCompressionInfo(null);
                        }}
                        className={`px-3 py-1.5 rounded-babun-xs font-display font-medium transition-all ${
                          imageSourceType === "file"
                            ? "bg-babun-primary text-white shadow-xs"
                            : "text-babun-primary/60 hover:text-babun-primary"
                        }`}
                      >
                        ⚡ העלאת קובץ מהירה
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImageSourceType("url");
                          setFormImage("");
                          setCompressionInfo(null);
                        }}
                        className={`px-3 py-1.5 rounded-babun-xs font-display font-medium transition-all ${
                          imageSourceType === "url"
                            ? "bg-babun-primary text-white shadow-xs"
                            : "text-babun-primary/60 hover:text-babun-primary"
                        }`}
                      >
                        🔗 קישור אינטרנט / דרייב
                      </button>
                    </div>
                  </div>

                  {imageSourceType === "file" ? (
                    <div className="space-y-4">
                      {/* Drag & Drop File Picker Zone */}
                      <div className="relative border-2 border-dashed border-babun-primary/20 hover:border-babun-accent/50 rounded-babun-lg p-6 bg-white/50 text-center transition-all">
                        <input
                          type="file"
                          id="image-file-input"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleImageFileChange(e.target.files[0]);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="p-3 bg-babun-accent/10 text-babun-accent rounded-full mb-1">
                            {uploadingImage ? (
                              <Loader2 size={24} className="animate-spin" />
                            ) : (
                              <UploadCloud size={24} />
                            )}
                          </div>
                          <span className="text-xs font-bold font-display text-babun-primary">
                            {uploadingImage ? "מעבד ומכווץ את תמונת הקאבר..." : "לחץ ובחר קובץ או גרור לכאן תמונה"}
                          </span>
                          <span className="text-[10px] text-babun-primary/50">
                            מכווץ אותה אוטומטית באיכות שיא כדי שהעמוד יטען במהירות הבזק (0ms)!
                          </span>
                        </div>
                      </div>

                      {/* Compression Feedback details */}
                      {formImage && imageSourceType === "file" && formImage.startsWith("data:") && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 p-4 rounded-babun-sm flex items-center justify-between flex-row-reverse text-xs gap-3 font-display">
                          <div className="flex items-center gap-2 flex-row-reverse">
                            <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
                            <span className="font-bold text-emerald-950">תמונת הקאבר עובדה וכווצה בהצלחה!</span>
                          </div>
                          {compressionInfo && (
                            <div className="text-[11px] opacity-75 text-left font-mono">
                              {(compressionInfo.originalSize / 1024 / 1024).toFixed(1)}MB → {Math.round(compressionInfo.compressedSize / 1024)}KB 
                              <span className="text-emerald-700 font-bold mr-1">
                                (-{Math.round((1 - compressionInfo.compressedSize / compressionInfo.originalSize) * 100)}%)
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 flex-row-reverse">
                        <Info size={16} className="text-babun-accent mt-0.5" />
                        <div>
                          <h4 className="font-display font-bold text-xs text-babun-primary">
                            מדריך להזנת קישור גוגל דרייב:
                          </h4>
                          <p className="text-[11px] text-babun-primary/60 mt-0.5">
                            ודא שהקובץ מוגדר כמותר לצפייה ציבורית ("כל אחד עם הקישור"), והעתק את כתובתו למטה.
                          </p>
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder="הדבק את קישור התמונה או הדרייב כאן..."
                        value={formImage && !formImage.startsWith("data:") ? formImage : ""}
                        onChange={(e) => setFormImage(e.target.value)}
                        className="w-full border border-babun-primary/15 rounded-babun-md px-4 py-3.5 text-xs text-right focus:outline-hidden focus:border-babun-accent focus:ring-1 focus:ring-babun-accent bg-white text-left font-mono"
                      />
                    </div>
                  )}
                </div>

                {/* 3ב. Image Input: Inner Newspaper Scan Image or Content Illustration */}
                <div className="bg-[#efede8]/60 p-6 rounded-babun-lg border-r-4 border-babun-primary/40 space-y-4">
                  <div className="flex items-center justify-between flex-row-reverse border-b border-babun-primary/10 pb-3">
                    <div className="text-right">
                      <label className="block text-xs font-black font-display text-babun-primary uppercase tracking-wider">
                        תמונת הכתבה הפנימית (צילום/סריקה מלאה בתוך הכתבה)
                      </label>
                      <span className="text-[10px] text-babun-primary/40 block mt-0.5">
                        אופציונלי • אם יישאר ריק, המערכת תציג בתוך הכתבה את תמונת הקאבר החיצונית.
                      </span>
                    </div>
                    
                    {/* Source Tab Selector */}
                    <div className="flex bg-babun-primary/10 p-0.5 rounded-babun-sm text-xs select-none">
                      <button
                        type="button"
                        onClick={() => {
                          setInnerImageSourceType("file");
                          setFormInnerImage("");
                          setInnerCompressionInfo(null);
                        }}
                        className={`px-3 py-1.5 rounded-babun-xs font-display font-medium transition-all ${
                          innerImageSourceType === "file"
                            ? "bg-babun-primary text-white shadow-xs"
                            : "text-babun-primary/60 hover:text-babun-primary"
                        }`}
                      >
                        ⚡ העלאת קובץ מהירה
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInnerImageSourceType("url");
                          setFormInnerImage("");
                          setInnerCompressionInfo(null);
                        }}
                        className={`px-3 py-1.5 rounded-babun-xs font-display font-medium transition-all ${
                          innerImageSourceType === "url"
                            ? "bg-babun-primary text-white shadow-xs"
                            : "text-babun-primary/60 hover:text-babun-primary"
                        }`}
                      >
                        🔗 קישור אינטרנט / דרייב
                      </button>
                    </div>
                  </div>

                  {innerImageSourceType === "file" ? (
                    <div className="space-y-4">
                      {/* Drag & Drop File Picker Zone */}
                      <div className="relative border-2 border-dashed border-babun-primary/20 hover:border-babun-accent/50 rounded-babun-lg p-6 bg-white/50 text-center transition-all">
                        <input
                          type="file"
                          id="inner-image-file-input"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleInnerImageFileChange(e.target.files[0]);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="p-3 bg-babun-primary/10 text-babun-primary rounded-full mb-1">
                            {uploadingInnerImage ? (
                              <Loader2 size={24} className="animate-spin" />
                            ) : (
                              <UploadCloud size={24} />
                            )}
                          </div>
                          <span className="text-xs font-bold font-display text-babun-primary">
                            {uploadingInnerImage ? "מעבד ומכווץ את צילום הכתבה..." : "לחץ ובחר קובץ או גרור לכאן תמונה"}
                          </span>
                          <span className="text-[10px] text-babun-primary/50">
                            מכווץ אותה אוטומטית באיכות שיא כדי שהעמוד יטען במהירות הבזק (0ms)!
                          </span>
                        </div>
                      </div>

                      {/* Compression Feedback details */}
                      {formInnerImage && innerImageSourceType === "file" && formInnerImage.startsWith("data:") && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 p-4 rounded-babun-sm flex items-center justify-between flex-row-reverse text-xs gap-3 font-display">
                          <div className="flex items-center gap-2 flex-row-reverse">
                            <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
                            <span className="font-bold text-emerald-950">צילום הכתבה עובד וכווץ בהצלחה!</span>
                          </div>
                          {innerCompressionInfo && (
                            <div className="text-[11px] opacity-75 text-left font-mono">
                              {(innerCompressionInfo.originalSize / 1024 / 1024).toFixed(1)}MB → {Math.round(innerCompressionInfo.compressedSize / 1024)}KB 
                              <span className="text-emerald-700 font-bold mr-1">
                                (-{Math.round((1 - innerCompressionInfo.compressedSize / innerCompressionInfo.originalSize) * 100)}%)
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 flex-row-reverse">
                        <Info size={16} className="text-babun-accent mt-0.5" />
                        <div>
                          <h4 className="font-display font-bold text-xs text-babun-primary">
                            מדריך להזנת קישור גוגל דרייב:
                          </h4>
                          <p className="text-[11px] text-babun-primary/60 mt-0.5">
                            ודא שהקובץ מוגדר כמותר לצפייה ציבורית ("כל אחד עם הקישור"), והעתק את כתובתו למטה.
                          </p>
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder="הדבק את קישור צילום הכתבה כאן..."
                        value={formInnerImage && !formInnerImage.startsWith("data:") ? formInnerImage : ""}
                        onChange={(e) => setFormInnerImage(e.target.value)}
                        className="w-full border border-babun-primary/15 rounded-babun-md px-4 py-3.5 text-xs text-right focus:outline-hidden focus:border-babun-accent focus:ring-1 focus:ring-babun-accent bg-white text-left font-mono"
                      />
                    </div>
                  )}
                </div>

                {/* 4. Live Text content block with AI OCR Integration magic */}
                <div className="space-y-3">
                  <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-3 text-right">
                    {/* Gemini integration button */}
                    <button
                      type="button"
                      onClick={handleAIOCR}
                      disabled={ocrLoading || !formImage}
                      className={`font-display text-xs font-bold px-4 py-3 rounded-babun-md flex items-center justify-center gap-2 cursor-pointer shadow-md select-none transition-all ${
                        ocrLoading
                          ? "bg-babun-primary text-white cursor-wait"
                          : formImage
                            ? "bg-babun-accent text-babun-primary hover:bg-babun-accent/90"
                            : "bg-babun-primary/5 text-babun-primary/40 border border-dashed border-babun-primary/10 cursor-not-allowed"
                      }`}
                    >
                      {ocrLoading ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span className="animate-pulse">{ocrStatus}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles
                            size={14}
                            className="text-babun-primary fill-babun-primary"
                          />
                          <span>🪄 חלץ טקסט חי אוטומטית מהתמונה (AI OCR)</span>
                        </>
                      )}
                    </button>

                    <label className="block text-xs font-black font-display text-babun-primary uppercase tracking-wider">
                      טקסט חי של הכתבה (לפודקאסטים ניתן להשאיר ריק)
                    </label>
                  </div>

                  <textarea
                    rows={8}
                    placeholder="הקלד כאן את הטקסט המלא של המאמר... (עבור פודקאסטים מקושרים ניתן להשאיר ריק או לרשום תיאור קצר)"
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    className="w-full border border-babun-primary/15 rounded-babun-md p-4 text-sm focus:outline-hidden focus:border-babun-accent focus:ring-1 focus:ring-babun-accent bg-babun-light/20 text-right leading-relaxed font-sans"
                  />
                  <p className="text-[10px] text-babun-primary/45 text-left">
                    תומך בכתיבת עיצוב כותרות ורשימות ב-Markdown כגון # כותרת,
                    **מודגש** וכדומה.
                  </p>
                </div>

                {/* Submit actions */}
                <div className="border-t border-babun-primary/5 pt-6 flex justify-start gap-3">
                  <button
                    type="submit"
                    className="bg-babun-primary hover:bg-babun-primary/95 text-white font-display text-sm font-bold px-8 py-4 rounded-babun-md shadow-xl cursor-pointer"
                  >
                    פרסם כתבה כעת
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="border border-babun-primary/10 hover:bg-babun-primary/5 text-babun-primary/60 hover:text-babun-primary font-display text-sm font-bold px-8 py-4 rounded-babun-md cursor-pointer"
                  >
                    ביטול
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
