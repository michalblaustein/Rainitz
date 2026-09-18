import defaultArticlesJson from "./articles.json";

export const defaultSeedArticles: any[] = (Array.isArray(defaultArticlesJson) && defaultArticlesJson.length > 0)
  ? defaultArticlesJson
  : [
  {
    id: "podcast_1",
    title: "פודקאסט: למה כולם מדברים על התחדשות עירונית ואיך נמנעים מטעויות?",
    category: "פודקאסטים",
    categoryId: "podcast",
    date: "18.05.2026",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
    innerImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
    summary: "שיחה מעמיקה עם יעקב רייניץ על מה שבאמת קורה מאחורי הקלעים של עסקאות פינוי בינוי, היכן המשקיעים נופלים, ומה שואלים לפני שחותמים.",
    content: "בפרק זה ננתח את השינויים הדרמטיים בשוק ההתחדשות העירונית בישראל.\n\n### נקודות מפתח שעלו בפרק:\n- **הבנת השלבים האמיתיים**: מתי פרויקט נחשב בעל היתכנות אמיתית ומתי מדובר בחלום שיווקי?\n- **חישוב הרווחיות הריאלית**: איך מחשבים את עלויות המימון והזמן עד לקבלת המפתח.\n- **האותיות הקטנות בהסכמי דיירים ויזמים**: 4 הדגשים שאסור לוותר עליהם בחוזה.\n\nהאזנה מועילה!",
    link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }
];

