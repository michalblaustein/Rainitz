import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import Markdown from "react-markdown";
import { 
  MessageCircle, PlayCircle, BookOpen, Newspaper, ExternalLink, Calendar, ArrowLeft, 
  LayoutGrid, Plus, Trash2, X, Loader2, Sparkles, Copy, Check, Lock, LogIn, ChevronRight, Eye, Info 
} from "lucide-react";
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc, Timestamp, onSnapshot } from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from "firebase/auth";
import { db, auth } from "../lib/firebase";

// Category definitions matching the design guidelines
const mediaCategories = [
  { id: "all", name: "כל התוכן", icon: LayoutGrid },
  { id: "weekly", name: "טור שבועי", icon: BookOpen },
  { id: "podcast", name: "פודקאסטים", icon: PlayCircle },
  { id: "articles", name: "כתבות ומאמרים", icon: Newspaper },
  { id: "kavei", name: "קווי מידע", icon: MessageCircle }
];

// Richly-detailed base seed articles (with copyable, readable Hebrew text)
const seedArticles = [
  {
    title: "השקעה בקרקע חקלאית: הזדמנות אמיתית או הרפתקה פיננסית מסוכנת?",
    category: "טור שבועי",
    categoryId: "weekly",
    date: "01.06.2026",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200",
    content: `### שליש בקרקע - ניתוח כלכלי מקיף ומציאותי של השקעות בקרקעות בישראל

ההבטחה הגדולה של משווקי הקרקעות החקלאיות נשמעת מפתה ביותר: *"רכשו היום מגרש חקלאי במחיר רצפה של כמה עשרות אלפי שקלים, וכאשר הקרקע תופשר לבנייה ותשונה ייעודה למגורים - ערכה יזנק במאות אחוזים והעתיד שלכם מובטח"*. אך האם במבחן המציאות מדובר אכן בהשקעה נבונה או בסיכון שאינו מחושב?

בטור שבועי זה נעמיק בסוגיה הזו מול ניסיון של 18 שנה בשטח, ונדון בארבעת הכללים הקריטיים שכל משקיע חייב לבדוק לפני שהוא שם את כספו בקרקע:

#### 1. המשוכה השמאית: 'תקן 21'
תקן 21 הוא המסמך הרשמי היחיד שעליו אתם יכולים להסתמך. מדובר בהנחיה ממשלתית המחייבת שמאים להעריך באופן אובייקטיבי ושקוף את סיכויי ההפשרה של הקרקע, את הזמן הנדרש להפשרה המשוערת, ואת שווי המגרש המשוער במצבו הנוכחי והעתידי. אם חברת השיווק מסרבת להציג לכם דוח תקן 21 מעודכן למגרש הספציפי - **פיסחו על העסקה מיד.**

#### 2. קונספט תוחלת הזמן
קרקע חקלאית אינה דירה. היא אינה מניבה שכר דירה חודשי, והכסף שלכם 'נעול' בתוכה ללא נזילות. תהליכי תכנון ובנייה בישראל נמתחים בממוצע על פני 12 עד 25 שנים. המשמעות היא שאתם צריכים להשקיע אך ורק כסף חופשי שאינכם זקוקים לו בעתיד הנראה לעין.

#### 3. היטלי השבחה וזכויות הפקעה
אנשים נוטים לשכוח שההפרש בין מחיר הקנייה לשווי לאחר הפשרה לא נכנס כולו לכיס. עם קבלת תוכנית המתאר החדשה ואישור הבנייה, המשקיע ייאלץ לשלם **היטל השבחה בגובה 50% מההשבחה הריאלית של הקרקע** לבסיס הרשות המקומית, בנוסף לעלויות פיתוח וסלילת כבישים כבדות. מעבר לכך, המדינה רשאית להפקיע עד 40% מהחלקה לטובת כבישים, פארקים, בתי כנסת ומוסדות חינוך, ללא תשלום פיצוי.

#### 4. ההמלצה להלכה ולמעשה
קרקע חקלאית יכולה להיות רכיב מעולה והורשה כלכלית לילדים, בתנאי שהבדיקות המשפטיות והתכנוניות נעשו כהלכה ואינכם נשענים על מצגות שיווקיות נוצצות או הבטחות בעל פה. קבלו ייעוץ אישי חסר פניות לפני חתימה.`,
    link: "#"
  },
  {
    title: "תכנון משכנתא נבון בשנת 2026: להשיל עשרות אלפים מחוב הבנק",
    category: "כתבות ומאמרים",
    categoryId: "articles",
    date: "25.05.2026",
    image: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&q=80&w=1200",
    content: `### המדריך להלוואה החשובה בחייכם: דיוק בתמהילים פיננסיים

רכישת דירה היא ללא ספק העסקה הפיננסית הגדולה והמשמעותית ביותר שמרבית המשפחות יעשו במהלך חייהן הבוגרים. למרות זאת, רבים ניגשים לנטילת משכנתא מתוך חוסר הבנה בסיסי, תוך הסתמכות כמעט עיוורת על 'יועץ המשכנתאות' המועסק על ידי הבנק עצמו - שכל מטרתו היא למקסם את רווחיות התעריף של מוסד הבנקאות.

ריכזנו עבורכם שלושה עוגנים בלעדיים לתכנון משכנתא אחראי וכלכלי:

#### א. יחס ההחזר מול הדנא של משק הבית
מרבית האנשים בודקים רק כמה הבנק יאפשר להם להחזיר בחודש (עד 40% מההכנסה המוכרת). דרך עבודה נבונה מציעה שלא לעבור את ה-25% מההכנסה נטו האמיתית, תוך התחשבות באינפלציה ובשינויים עתידיים בצרכי המשפחה (לידות, הוצאות לימוד וכו').

#### ב. אשליית מסלול הפריים
שילוב מסלול פריים נראה לעיתים אטרקטיבי בטווח הקצר, אך בעת סביבת אינפלציה וריביות בנק ישראל תנודתיות, מסלולים צמודי פריים עלולים לזנק במאות שקלים בחודש תוך פרק זמן קצר ביותר ולהכניס משק בית לחוסר יציבות משווע.

#### ג. יצירת מנגנון פירעון מוקדם חכם
בנו את תמהיל ההלוואה כך שסימנים פיננסיים ידועים מראש - כמו כספי קרנות השתלמות, פיצויים או חסכונות שישתחררו בעתיד - יוכלו לשמש לסגירת חלקים משמעותיים מהחוב ללא הטלת קנסות ועמלות פירעון מפרכות מהבנקים. יועץ אובייקטיבי שאינו קשור לבנק יסייע לכם לחסוך עשרות אלפי שקלים במצטבר.`,
    link: "#"
  },
  {
    title: "מצוקת הדיור החרדית 2026: פתרונות מעשיים מתוך תיקיית הכתבות והניתוחים של רייניץ",
    category: "כתבות ומאמרים",
    categoryId: "articles",
    date: "03.06.2026",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200",
    content: `### ניתוח מתוך תיקיית הכתבות המלאה: מצוקת דיור בלתי מתפשרת וערוצי הפתרון

מיומן הכתבות וצילומי העיתונות מארכיון הנדל"ן וכלכלה נבונה של יעקב רייניץ, אנו חושפים בפרק זה את תצלומי השטח המדויקים המשרטטים את ערוצי פתרון משבר הדיור במגזר החרדי לשנת 2026. 

העיניים הציבוריות נשואות תמיד לשאלת הריכוזים החרדיים החדשים, אולם בדיקה אמיתית מגלה כי הפתרון הכלכלי היציב והזמין ביותר מונח בשלושה נתיבים מקבילים:

#### א. התכתבות עם הדבר האמיתי - תמ\"א 38 ופינוי בינוי בלב הריכוזים החרדים
פרויקטים של התחדשות עירונית בבני ברק, אלעד, ירושלים ובית שמש מהווים תמריץ כלכלי דרמטי. הדירה הישנה משודרגת, מתווסף ממ"ד חיוני, מרפסת סוכה תקנית, וערך הנכס מאמיר בעשרות אחוזים ללא תשלום רוכש.

#### ב. נדידה מבוקרת לפריפריה מתפתחת
הערים בדרום וצפון הארץ - אופקים, כרמיאל, נתיבות ועוד - מספקות מעטפת פיתוח אדירה עם מחירי דיור שפויים המאפשרים למשפחות צעירות להתחיל חיים יצרניים ללא שיעבוד פיננסי חונק לבנקים.

#### ג. פרויקטים למשתכן וסבסוד קרקעות ממשלתי
ניתוחי הכתבות מארכיון 'המבשר' ו'המודיע' של רייניץ מראים בבירור כי עמידה קפדנית בתנאי המכרזים מספקת הטבה ריאלית של מאות אלפי שקלים לזכאים.

*אתם מוזמנים לעיין בקובצי הכתבות המלאים המשותפים בתיקיית הדרייב הציבורית, להעלות קובצי צילומים נוספים במערכת הניהול הממוחשבת שלכם וליהנות מסנכון טקסט חי (AI OCR).*`,
    link: "https://drive.google.com/drive/folders/17CDdsjp5yKDwxh5SLt3VTdblJ9KumJKp"
  },
  {
    title: "נדל״ן בשלושה: פרק חדש עם יעקב רייניץ",
    category: "פודקאסטים",
    categoryId: "podcast",
    date: "28.04.2026",
    image: "https://img.youtube.com/vi/WEhvhlX_UhY/maxresdefault.jpg",
    content: `### נדל״ן בשלושה - פרק 1: המציאות האמיתית בשוק הנדל"ן החרדי

בפרק זה בסדרה המבוקשת "נדל״ן בשלושה", מארח יעקב רייניץ דיון פתוח ומעמיק מאין כמוהו על החששות, המכשולים, וההזדמנויות החדשות שמביאות איתן שנות ה-2020 המאוחרות למגזר החרדי והכללי בישראל.

#### נושאי הפרק המרכזיים:
*   **עמידות השוק באזורי הביקוש**: למה מחירי הנדל"ן בערים המרכזיות כמו בני ברק, ירושלים ואלעד ממשיכים לשמור על יציבות למרות התנודות בריבית הבנקאית.
*   **חשיפת מלכודות המימון**: איך להימנע מהלוואות בלון קטלניות בריביות משתנות ולוודא שהחזר המשכנתא החודשי שומר על בריאותו הכלכלית של משק הבית שלכם.
*   **שאלה אחת נכונה בשטח**: הכלים והשאלות שחובה לשאול כל יזם, מתווך ומשווק לפני שיוצאים לדרך כדי להגן על כספכם.

*הקשיבו לפרק המלא וצפו בטיפים המעשיים שישמרו על ההון העצמי שלכם ויהפכו אותו לכח קנייה מנצח.*`,
    link: "https://www.youtube.com/watch?v=WEhvhlX_UhY"
  },
  {
    title: "נדל״ן בשלושה: פרק 2 - מינוף פיננסי חכם והון עצמי נמוך",
    category: "פודקאסטים",
    categoryId: "podcast",
    date: "05.05.2024",
    image: "https://img.youtube.com/vi/7DEf5WmqTWY/maxresdefault.jpg",
    content: `### נדל״ן בשלושה - פרק 2: אומנות המינוף וההון העצמי הנמוך בשוק תחרותי

האם באמת אפשר לרכוש דירה ראשונה או נכס מניב כאשר ברשותכם הון עצמי התחלתי נמוך בלבד? בפרק מרתק זה, מפרק יעקב רייניץ את המיתוסים הגדולים סביב דרישות הסף של הבנקים למשכנתאות ומציע מפת דרכים ריאלית, שקולה ובטוחה.

#### נקודות מפתח בפרק:
*   **אסטרטגיית 'שליש בקרקע' במעשה**: כיצד לחלק את מקורות המימון בצורה מאוזנת בין הון עצמי, משכנתא קונבנציונלית וסיוע משפחתי או מוסדי מבוקר.
*   **ניתוח כדאיות מקיף**: מתי רכישת דירה להשקעה בפריפריה והמשך מגורים בשכירות במרכז היא המהלך המשתלם ביותר, ומתי מדובר בנטל מימוני כבד מדי.
*   **הגנת סיכונים קריטית**: איך לבנות כרית ביטחון פיננסית חסינת אינפלציה למקרה של תקופות ממושכות ללא שוכרים בנכס.

*צפו בווידאו וקבלו עצות מסדרת 'נדל״ן בשלושה' שהנחו אלפי משפחות בדרך לעסקה בטוחה ורווחית.*`,
    link: "https://www.youtube.com/watch?v=7DEf5WmqTWY"
  },
  {
    title: "נדל״ן בשלושה: פרק 3 - סודות המשא ומתן וסגירת חוזה מנצח",
    category: "פודקאסטים",
    categoryId: "podcast",
    date: "12.05.2024",
    image: "https://img.youtube.com/vi/7yseEP-6D5Q/maxresdefault.jpg",
    content: `### נדל״ן בשלושה - פרק 3: איך לנהל משא ומתן מול קבלנים ומתווכים ולחסוך עשרות אלפים

משא ומתן נדל"ני מוצלח הוא לא סתם ויכוח על מחיר - מדובר בפילוסופיה פיננסית ותרבות דיון שלמה. בפרק זה, מעניק יעקב רייניץ ארגז כלים ייחודי ומנוסה שיאפשר לכם להגיע לשולחן הדיונים כשידכם על העליונה, בשלווה ובביטחון מקצועי מלא.

#### נלמד בפרק זה:
*   **פסיכולוגיה של מוכרים וקבלנים**: מהם המניעים האמתיים שעומדים מאחורי עמדת הקבלן או המתווך וכיצד למנף אותם לטובת הנחה משמעותית בחוזה המכר.
*   **נספחי שינויים ותשלומים**: למה הנספח הטכני ונספח התשלומים חשובים לא פחות ממחיר הדירה הנומינלי, ואיך לחסוך הון בהצמדה למדד תשומות הבנייה.
*   **נקודת היציאה הבטוחה**: כיצד להוסיף סעיפי הגנה בחוזה המאפשרים לכם לסגת מהעסקה ללא קנסות במידה ואישור המשכנתא הסופי מהבנק מתעכב.

*הצטרפו לפרק זה של 'נדל״ן בשלושה' והפכו למשא ומתן ממולח ויציב שמגן על הכלכלה הביתית שלכם בכל תנאי.*`,
    link: "https://www.youtube.com/watch?v=7yseEP-6D5Q"
  },
  {
    title: "נדל״ן בשלושה: פרק 4 - רכישת דירה על הנייר לעומת נכס מוכן",
    category: "פודקאסטים",
    categoryId: "podcast",
    date: "19.05.2024",
    image: "https://img.youtube.com/vi/g7uc_KUZ0kM/maxresdefault.jpg",
    content: `### נדל״ן בשלושה - פרק 4: רכישה מקבלן 'על הנייר' מול קניית דירת יד שנייה מוכנה

אחת השאלות השכיחות ביותר שאני נשאל בפגישות הייעוץ היא: *"יעקב, האם עדיף לקחת סיכון מסוים ולקנות דירה 'על הנייר' ישירות מקבלן במחיר מוזל, או לשלם פרמיה מסוימת וללכת על דירת יד שנייה מוכנה למגורים מיידיים?"* בפרק מיוחד זה אנו עושים סדר כלכלי ומשפטי מוחלט בסוגיה זו.

#### סעיפי הדיון המרכזיים בפרק:
*   **סיכוני ביצוע וערבויות חוק המכר**: מהם המנגנונים המשפטיים שמחובתכם לדרוש מהקבלן על מנת לוודא שכספכם מוגן באופן הרמטי בכל שלב בפרויקט.
*   **חישוב עלויות נסתרות**: ננתח ביחד את שכר הדירה שתשלמו בתקופת ההמתנה לבנייה, את הריביות המצטברות, ואת שינויי המדדים המייקרים את העסקה 'על הנייר'.
*   **הערכת פוטנציאל ההשבחה הריאלי**: כיצד לחזות את עליית הערך העתידית של שכונות חדשות שנמצאות בעיצומי שלבי הפיתוח לעומת שכונות ותיקות ויציבות.

*אל תחמיצו את הניתוח המפורט שימנע טעויות קריטיות של מיליוני שקלים ויעזור לכם לבחור את המסלול הנכון והרגוע עבור משפחתכם.*`,
    link: "https://www.youtube.com/watch?v=g7uc_KUZ0kM"
  }
];

export default function Articles() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [articlesList, setArticlesList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);

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
  const [formContent, setFormContent] = useState<string>("");
  const [formLink, setFormLink] = useState<string>("");

  // OCR Magic Assistant States
  const [ocrLoading, setOcrLoading] = useState<boolean>(false);
  const [ocrStatus, setOcrStatus] = useState<string>("");

  // Load and listen to articles from Firestore
  useEffect(() => {
    setLoading(true);
    const articlesRef = collection(db, "articles");
    const q = query(articlesRef, orderBy("createdAt", "desc"));

    // Real-time snapshot listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setArticlesList(docs);
      setLoading(false);
    }, (error) => {
      console.error("Failed to load articles from Firestore (using seeds):", error);
      // Fallback in case of closed rules or setup issues
      setArticlesList(seedArticles);
      setLoading(false);
    });

    return () => unsubscribe();
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

  // Seeding initial articles directly to their database
  const handleSeedDatabase = async () => {
    setLoading(true);
    try {
      for (const seed of seedArticles) {
        await addDoc(collection(db, "articles"), {
          ...seed,
          createdAt: Timestamp.now()
        });
      }
      alert("הכתבות המובילות הועלו בהצלחה לבסיס הנתונים!");
    } catch (err: any) {
      console.error("Seed error:", err);
      alert(`שגיאה בהעלאה: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // AI-powered Hebrew OCR Assistant Call
  const handleAIOCR = async () => {
    if (!formImage.trim()) {
      alert("אנא הזן תחילה קישור לתמונה או קובץ מגוגל דרייב בשדה למעלה");
      return;
    }

    setOcrLoading(true);
    setOcrStatus("מתחבר ל-Gemini AI...");
    
    try {
      // Rotate friendly messages during parsing
      setTimeout(() => setOcrStatus("מייבא את צילום הכתבה בבטחה..."), 2000);
      setTimeout(() => setOcrStatus("סורק ומפענח אותיות בעברית (OCR)..."), 4500);
      setTimeout(() => setOcrStatus("מלביש פסקאות ומארגן כותרות בפורמט קריא..."), 7000);

      const response = await fetch("/api/articles/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: formImage.trim() })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "שגיאה בפענוח הכתבה");
      }

      setFormContent(data.text);
      setOcrStatus("הפיענוח הושלם בהצלחה!");
    } catch (err: any) {
      console.error("OCR API error:", err);
      alert(`שגיאת במערכת ה-OCR: ${err.message || err}. ודא שהתמונות משותפות באופן פומבי.`);
    } finally {
      setOcrLoading(false);
      setOcrStatus("");
    }
  };

  // Save new article to Firestore
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formImage.trim() || !formContent.trim()) {
      alert("נא למלא את כל שדות החובה");
      return;
    }

    const matchedCat = mediaCategories.find(c => c.id === formCategory);
    const categoryName = matchedCat ? matchedCat.name : "כתבות ומאמרים";

    // Set today's date if empty
    const publishDate = formDate || new Date().toLocaleDateString("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });

    try {
      await addDoc(collection(db, "articles"), {
        title: formTitle,
        category: categoryName,
        categoryId: formCategory,
        date: publishDate,
        image: formImage,
        content: formContent,
        link: formLink || "#",
        createdAt: Timestamp.now()
      });

      // Clear Form state
      setFormTitle("");
      setFormDate("");
      setFormImage("");
      setFormContent("");
      setFormLink("");
      setShowAddForm(false);
    } catch (err: any) {
      console.error("Failed to add article to Firestore:", err);
      alert(`שגיאה בשמירת הכתבה: ${err.message}`);
    }
  };

  // Delete article from Firestore
  const handleDeleteArticle = async (id: string, name: string) => {
    if (!window.confirm(`האם אתה בטוח שברצונך למחוק את הכתבה: "${name}"?`)) return;

    try {
      await deleteDoc(doc(db, "articles", id));
      if (selectedArticle?.id === id) {
        setSelectedArticle(null);
      }
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

    const fileId = fileMatch ? fileMatch[1] : (idMatch ? idMatch[1] : null);

    if (fileId) {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    }
    return url;
  };

  // Actual list to render logic (fallback to static mock if empty/loading fails)
  const activeArticles = articlesList.length > 0 ? articlesList : seedArticles;

  const filteredArticles = activeCategory === "all"
    ? activeArticles
    : activeArticles.filter(article => article.categoryId === activeCategory);

  return (
    <div className="bg-babun-light min-h-screen pb-20 selection:bg-babun-accent selection:text-babun-primary">
      {/* PAGE HERO */}
      <section className="bg-babun-primary text-white pt-48 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 z-0" style={{ backgroundImage: "radial-gradient(ellipse at center, rgba(30,41,59,0.5) 0%, rgba(15,23,42,1) 100%)" }} />
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 text-right">
          <div className="border-b border-white/10 pb-20">
            <div className="space-y-6">
              <span className="text-babun-accent font-mono text-xs uppercase tracking-[0.2em] font-semibold">MEDIA & INSIGHTS</span>
              <h1 className="text-4xl md:text-6xl lg:text-[76px] font-display font-black leading-[1.1] text-white">
                בנדל"ן, <br className="hidden md:block"/>
                הידע הוא הנכס <span className="text-babun-accent font-black">הכי יקר</span>
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* ADMIN ACTION SUBHEADER */}
      {isAdminMode && (
        <div className="bg-babun-primary/5 py-4 border-b border-babun-primary/10 text-right">
          <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-row-reverse flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-row-reverse text-babun-primary">
              <Sparkles size={16} className="text-babun-accent" />
              <span className="text-xs font-bold font-display">מצב עריכת מנהל פעיל</span>
              {user && <span className="text-xs opacity-60">({user.email})</span>}
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowAddForm(true)}
                className="bg-babun-primary hover:bg-babun-primary/90 text-white font-display text-xs font-bold px-4 py-2 rounded-babun-sm flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>הוספת כתבה / פודקאסט</span>
                <Plus size={14} className="text-babun-accent" />
              </button>
              {articlesList.length === 0 && (
                <button 
                  onClick={handleSeedDatabase}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-display text-xs font-bold px-4 py-2 rounded-babun-sm flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  סיד ראשוני של הכתבות
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
      <div id="content-section" className="max-w-7xl mx-auto px-4 md:px-8 pt-16">
        
        {/* Dynamic Category Filtering Buttons */}
        <div className="flex flex-row-reverse flex-wrap items-center justify-center gap-3 md:gap-4 mb-20" id="category-filter-bar">
           {mediaCategories.map((cat) => {
             const Icon = cat.icon;
             const isActive = activeCategory === cat.id;
             return (
               <button
                 key={cat.id}
                 id={`cat-btn-${cat.id}`}
                 onClick={() => setActiveCategory(cat.id)}
                 className={`flex items-center gap-2.5 px-6 py-4 rounded-babun-md font-display font-bold text-sm md:text-base transition-all duration-300 cursor-pointer border ${
                   isActive
                     ? "bg-babun-primary text-white border-babun-primary shadow-xl shadow-babun-primary/15"
                     : "bg-white text-babun-primary/70 hover:text-babun-primary border-babun-primary/10 hover:border-babun-accent/50 shadow-md shadow-babun-primary/[0.02]"
                 }`}
               >
                 <span>{cat.name}</span>
                 <Icon size={18} className={isActive ? "text-babun-accent" : "text-babun-primary/55"} />
               </button>
             );
           })}
        </div>

        {/* LOADING INDICATOR */}
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4 text-babun-primary/40">
            <Loader2 size={40} className="animate-spin text-babun-accent" />
            <span className="font-display font-medium text-sm">טוען את המאמרים והכתבות...</span>
          </div>
        ) : (
          /* ARTICLES GRID CONTAINER */
          <section className="relative">
             <div className="flex items-center justify-between flex-row-reverse mb-16 border-b border-babun-primary/5 pb-6">
                <h3 className="text-3xl md:text-4xl font-display font-black text-babun-primary tracking-tight">הכי חדשים.</h3>
                <div className="hidden md:flex items-center gap-4 text-xs font-bold opacity-30 tracking-[0.2em] font-mono">
                   {filteredArticles.length} ITEMS FOUND
                </div>
             </div>

             {filteredArticles.length === 0 ? (
               <div className="bg-white rounded-babun-md p-16 text-center border border-babun-primary/5 shadow-sm">
                 <Newspaper size={48} className="mx-auto text-babun-primary/20 mb-4 animate-bounce" />
                 <h4 className="font-display font-bold text-lg text-babun-primary mb-2">אין תוכן בקטגוריה זו עדיין</h4>
                 <p className="text-babun-primary/50 text-xs">המנהל יעלה תכנים חמים בקרוב מאוד.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {filteredArticles.map((article, i) => (
                    <motion.div 
                      key={article.id || i}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.4 }}
                      className="group cursor-pointer text-right flex flex-col justify-between"
                    >
                       <div onClick={() => setSelectedArticle(article)}>
                         {/* Card Media Wrapper - Original Scanner clipping view */}
                         <div className="aspect-video bg-babun-primary overflow-hidden rounded-babun-lg mb-6 relative shadow-lg shadow-babun-primary/5">
                            <img 
                              src={getDisplayImage(article.image)} 
                              className="w-full h-full object-cover grayscale brightness-[0.8] group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700" 
                              referrerPolicy="no-referrer"
                              alt={article.title}
                            />
                            {/* Original clipping visual element overlays */}
                            <div className="absolute inset-0 bg-gradient-to-t from-babun-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute top-4 right-4 bg-babun-accent text-babun-primary font-display font-black px-4 py-1.5 text-[10px] uppercase tracking-widest shadow-md">
                               {article.category}
                            </div>
                            <div className="absolute bottom-4 left-4 bg-babun-primary/80 backdrop-blur-xs text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <Eye size={16} className="text-babun-accent" />
                            </div>
                         </div>
                         <div className="flex items-center gap-2 justify-end text-xs font-bold opacity-30 mb-3 font-mono">
                            <span>{article.date}</span>
                            <Calendar size={13} />
                         </div>
                         <h4 className="text-2xl font-display font-bold text-babun-primary mb-4 group-hover:text-babun-accent transition-colors leading-tight line-clamp-2">
                            {article.title}
                         </h4>
                       </div>
                       
                       <div className="flex items-center justify-between mt-2 pt-4 border-t border-babun-primary/5">
                          {isAdminMode && article.id && (
                            <button 
                              onClick={() => handleDeleteArticle(article.id, article.title)}
                              className="text-red-500 hover:text-red-700 p-2 cursor-pointer rounded-babun-sm hover:bg-red-50 transition-colors"
                              title="מחק כתבה"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                          <button 
                            onClick={() => setSelectedArticle(article)}
                            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-babun-primary/45 group-hover:text-babun-accent transition-colors mr-auto"
                          >
                             קרא צילום וטקסט חי <ChevronRight size={14} className="rotate-180" />
                          </button>
                       </div>
                    </motion.div>
                  ))}
               </div>
             )}
          </section>
        )}

        {/* COMPREHENSIVE UPDATE BULLETIN / FEED */}
        <section className="mt-40 bg-babun-primary text-white p-12 md:p-20 rounded-babun-lg relative overflow-hidden">
           <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16 text-right">
              <div className="flex-1 w-full">
                 <h3 className="text-3xl font-display font-black text-babun-accent mb-10 leading-none">חדשות נדל"ן - חם מהשטח</h3>
                 <div className="space-y-6">
                    {[
                      { text: "עליית ריבית בנק ישראל: מה השפעתה המיידית על גובה המשכנתא?", desc: "מדריך מעשי בעקבות הכרזת הנגיד האחרונה." },
                      { text: "מכרזי מחיר מטרה החדשים בפריפריה החרדית - כדאיות מול סיכונים", desc: "סקר נדל\"ני מקיף על פרויקטים תכנוניים באלעד והדרום." },
                      { text: "התחדשות עירונית בבני ברק: פניה של עיר התורה והעתיד", desc: "האישורים החדשים, הסכמי גג וזכויות הדיירים." }
                    ].map((news, i) => (
                      <div key={i} className="border-b border-white/5 pb-6 group cursor-pointer">
                         <div className="flex items-center gap-4 justify-end">
                           <span className="text-lg font-bold text-white group-hover:text-babun-accent transition-colors text-right leading-snug">{news.text}</span>
                           <ExternalLink size={16} className="text-babun-accent opacity-20 group-hover:opacity-100 transition-opacity" />
                         </div>
                         <p className="text-white/40 text-xs mt-1 leading-relaxed text-right">{news.desc}</p>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="flex-1 max-w-sm text-right">
                 <div className="text-5xl font-display font-black text-babun-accent mb-6 leading-none tracking-tight">REAL TIME.</div>
                 <p className="text-white/40 text-sm leading-relaxed">אנחנו דואגים שתהיו מעודכנים במידע הכי חם, מהימן וקריטי בשוק הנדל"ן החרדי והכללי בישראל ישירות משטח המעשה.</p>
              </div>
           </div>
           <Newspaper className="absolute -bottom-10 -right-10 text-white/5 pointer-events-none" size={250} />
        </section>
      </div>

      {/* FLOATING ADMIN LOGIN BUTTON */}
      {!isAdminMode && (
        <button 
          onClick={() => setShowAdminLogin(true)}
          className="fixed bottom-8 right-8 z-55 bg-babun-primary/90 text-white hover:text-babun-accent hover:bg-babun-primary p-4 rounded-full shadow-2xl transition-all duration-300 backdrop-blur-md cursor-pointer flex items-center justify-center"
          title="כניסת מנהל למערכת"
        >
          <Lock size={20} />
        </button>
      )}

      {/* FINAL INTERACTIVE CALL-TO-ACTION */}
      <section className="py-40 text-center bg-white border-t border-babun-primary/5 mt-40">
         <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-4xl md:text-6xl font-display font-black text-babun-primary mb-8 leading-tight">לא בטוח מאיפה להתחיל?</h2>
            <p className="text-lg md:text-xl text-babun-primary/60 font-light mb-12 max-w-2xl mx-auto leading-relaxed">
               שאלה אחת נכונה שווה יותר מעשרה ייעוצים לא ממוקדים. פגוש את השטח בצורה מושכלת. 60 דקות בלבד. ותצא עם תוכנית פיננסית סלולה לעסקה הבאה שלך.
            </p>
            <Link to="/consulting" className="btn-babun-primary inline-block px-14 py-5 shadow-2xl font-display font-bold">קביעת פגישה ←</Link>
         </div>
      </section>

      {/* ==================== 1. MODAL: IMAGE + LIVE TEXT NEWSPAPER READER ==================== */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedArticle(null)}
              className="absolute inset-0 bg-babun-primary/85 backdrop-blur-md"
            />
            
            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-babun-light w-full max-w-6xl h-[85vh] rounded-babun-xl overflow-hidden relative shadow-2xl flex flex-col md:flex-row text-right z-10"
            >
              {/* Close Button overlay */}
              <button 
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 z-55 bg-babun-primary/80 backdrop-blur-xs text-white hover:text-babun-accent p-2.5 rounded-full shadow-lg transition-transform hover:scale-105 cursor-pointer"
              >
                <X size={18} />
              </button>

              {/* LEFT HALF: THE ORIGINAL PHOTOGRAPH/SCAN ("צילום הכתבה") */}
              <div className="w-full md:w-1/2 bg-[#efede8] p-8 flex flex-col justify-between items-center relative border-b md:border-b-0 md:border-l border-babun-primary/5 h-2/5 md:h-full overflow-hidden">
                <span className="text-babun-primary/30 uppercase tracking-[0.2em] font-mono text-[9px] select-none absolute top-4 left-6">ORIGINAL CLIPPING ARCHIVE</span>
                
                {/* Simulated newspaper framing */}
                <div className="w-full h-full flex items-center justify-center p-2 relative">
                  <div className="bg-white p-4 shadow-xl border border-dashed border-babun-primary/10 rounded-babun-sm max-w-full max-h-full overflow-auto flex items-center justify-center relative group">
                    <img 
                      src={getDisplayImage(selectedArticle.image)} 
                      className="max-w-full max-h-[60vh] object-contain shadow-md rounded-babun-xs"
                      referrerPolicy="no-referrer"
                      alt="Original newspaper clip photograph"
                    />
                  </div>
                </div>

                <div className="text-center w-full z-10">
                  <a 
                    href={selectedArticle.image} 
                    target="_blank" 
                    rel="no-referrer"
                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-babun-primary/60 hover:text-babun-accent bg-white px-4 py-2 rounded-babun-xs shadow-sm border border-babun-primary/5 transition-colors"
                  >
                     צפה בצילום בגודל מלא <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {/* RIGHT HALF: THE LIVE SYSTEM TEXT ("טקסט חי") */}
              <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-between h-3/5 md:h-full bg-white text-right">
                {/* Meta info header */}
                <div className="mb-4">
                  <div className="flex items-center justify-between flex-row-reverse mb-3 border-b border-babun-primary/5 pb-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-babun-primary/40">
                      <span>{selectedArticle.date}</span>
                      <Calendar size={13} />
                    </div>
                    <span className="bg-babun-primary/5 text-babun-primary px-3 py-1 text-[10px] font-bold rounded-babun-sm">
                      {selectedArticle.category}
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-display font-black text-babun-primary leading-tight tracking-tight mb-2">
                    {selectedArticle.title}
                  </h3>
                </div>

                {/* Main scrollable text content */}
                <div className="flex-grow overflow-y-auto mb-6 pl-4 text-babun-primary text-right leading-relaxed dir-rtl scrollbar-thin">
                  {selectedArticle.content ? (
                    <div className="markdown-body prose prose-slate max-w-none text-right text-babun-primary/95 text-base space-y-5">
                      <Markdown>{selectedArticle.content}</Markdown>
                    </div>
                  ) : (
                    <p className="text-babun-primary/75 italic">אין טקסט מוקלד לכתבה זו.</p>
                  )}
                </div>

                {/* Footer and interactions */}
                <div className="border-t border-babun-primary/5 pt-6 flex items-center justify-between flex-row-reverse gap-4">
                  {selectedArticle.link && selectedArticle.link !== "#" && (
                    <a 
                      href={selectedArticle.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-babun-primary text-white hover:bg-babun-primary/90 text-xs font-bold px-5 py-3 rounded-babun-sm flex items-center gap-1.5 shadow-md shadow-babun-primary/5"
                    >
                      <ExternalLink size={14} />
                      <span>פתח קישור חיצוני</span>
                    </a>
                  )}
                  
                  {/* Absolute Copy live text utilities */}
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(selectedArticle.content || selectedArticle.title);
                      alert("הטקסט של המאמר הועתק ללוח בבטחה!");
                    }}
                    className="border border-babun-primary/10 hover:border-babun-accent/50 text-babun-primary/75 hover:text-babun-primary text-xs font-bold px-5 py-3 rounded-babun-sm flex items-center gap-1.5 cursor-pointer bg-babun-light/50 transition-all shadow-xs"
                  >
                    <Copy size={14} />
                    <span>העתק טקסט חי</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                <h3 className="text-xl font-display font-black text-babun-primary">כניסת מנהל למערכת</h3>
                <p className="text-xs text-babun-primary/50 mt-1">ערוך כתבות, פודקאסטים ופרסם צילומי עיתונות</p>
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
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                    <span>התחבר עם חשבון Google</span>
                  </button>
                  <p className="text-[10px] text-babun-primary/40 text-center mt-2">הכניסה מוגדרת למייל: michal@extraplus.co.il</p>
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-babun-primary/10"></div>
                  <span className="flex-shrink mx-4 text-xs font-semibold text-babun-primary/30 uppercase">או קוד הדגמה מהיר</span>
                  <div className="flex-grow border-t border-babun-primary/10"></div>
                </div>

                {/* Method B: Fast admin bypass code */}
                <div>
                  <label className="block text-xs font-bold font-display text-babun-primary mb-2">קוד מנהל מהיר (עבור הפירסום המיידי):</label>
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
                  <p className="text-[10px] text-babun-primary/45 mt-2 text-right">קוד לדוגמה מהיר: <span className="font-mono bg-babun-primary/5 px-1 rounded-sm text-yellow-700">reinitz2026</span></p>
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
                  <h3 className="text-xl font-display font-black leading-none">העלאת תוכן חדש (כתבה / פודקאסט)</h3>
                </div>
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="text-white hover:text-babun-accent cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleSaveArticle} className="flex-grow overflow-y-auto p-8 space-y-6 scrollbar-thin">
                
                {/* 1. Article Title */}
                <div>
                  <label className="block text-xs font-black font-display text-babun-primary uppercase tracking-wider mb-2">שם הכתבה / כותרת הפוסט *</label>
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
                    <label className="block text-xs font-black font-display text-babun-primary uppercase tracking-wider mb-2">קטגוריה *</label>
                    <select 
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full border border-babun-primary/15 rounded-babun-md px-4 py-3.5 text-sm focus:outline-hidden focus:border-babun-accent bg-white text-right"
                    >
                      <option value="weekly">טור שבועי</option>
                      <option value="articles">כתבות ומאמרים</option>
                      <option value="podcast">פודקאסטים</option>
                      <option value="kavei">קווי מידע</option>
                    </select>
                  </div>

                  {/* Publish Date */}
                  <div>
                    <label className="block text-xs font-black font-display text-babun-primary uppercase tracking-wider mb-2">תאריך פרסום</label>
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
                    <label className="block text-xs font-black font-display text-babun-primary uppercase tracking-wider mb-2">קישור חיצוני (למשל פודקאסט יוטיוב)</label>
                    <input 
                      type="url" 
                      placeholder="הדבק קישור (למשל: https://youtube.com/...) - אופציונלי"
                      value={formLink}
                      onChange={(e) => setFormLink(e.target.value)}
                      className="w-full border border-babun-primary/15 rounded-babun-md px-4 py-3.5 text-sm focus:outline-hidden focus:border-babun-accent focus:ring-1 focus:ring-babun-accent bg-babun-light/20 text-right font-mono"
                    />
                  </div>
                </div>

                {/* 3. Image URL source with Drive instructions */}
                <div className="bg-babun-primary/5 p-5 rounded-babun-lg border-r-4 border-babun-accent">
                  <div className="flex items-start gap-3 flex-row-reverse mb-3">
                    <Info size={16} className="text-babun-accent mt-0.5" />
                    <div>
                      <h4 className="font-display font-bold text-xs text-babun-primary">על מנת להפיק את ה-צילום + טקסט חי:</h4>
                      <p className="text-[11px] text-babun-primary/60 mt-0.5">
                        העלה את צילום הכתבה (מתוך העיתון) לחשבון הגוגל דרייב שלך, קבע את הקישור ל"כל אחד עם הקישור יכול לצפות", והדבק את כתובת הדרייב בשדה למטה. המערכת תזהה את התמונה אוטומטית ותשלוף לכם תצוגה נקייה!
                      </p>
                    </div>
                  </div>

                  <label className="block text-xs font-black font-display text-babun-primary uppercase tracking-wider mb-2">קישור קובץ צילום הכתבה (גוגל דרייב / כתובת אינטרנט של תמונה) *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="הדבק את כתובת הדרייב (למשל: https://drive.google.com/file/d/...)"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="w-full border border-babun-primary/15 rounded-babun-md px-4 py-3.5 text-xs text-right focus:outline-hidden focus:border-babun-accent focus:ring-1 focus:ring-babun-accent bg-white text-left font-mono"
                  />
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
                          <Sparkles size={14} className="text-babun-primary fill-babun-primary" />
                          <span>🪄 חלץ טקסט חי אוטומטית מהתמונה (AI OCR)</span>
                        </>
                      )}
                    </button>

                    <label className="block text-xs font-black font-display text-babun-primary uppercase tracking-wider">טקסט חי של הכתבה (תוכן מלא במדויק) *</label>
                  </div>

                  <textarea 
                    required
                    rows={8}
                    placeholder="הקלד כאן את הטקסט המלא של המאמר... או לחץ על הכפתור למעלה כדי לחלץ את הטקסט אוטומטית באמצעות כלי ה-AI שלנו מתוך תמונת העמוד שהזנת!"
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    className="w-full border border-babun-primary/15 rounded-babun-md p-4 text-sm focus:outline-hidden focus:border-babun-accent focus:ring-1 focus:ring-babun-accent bg-babun-light/20 text-right leading-relaxed font-sans"
                  />
                  <p className="text-[10px] text-babun-primary/45 text-left">תומך בכתיבת עיצוב כותרות ורשימות ב-Markdown כגון # כותרת, **מודגש** וכדומה.</p>
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
