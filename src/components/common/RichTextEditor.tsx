import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignRight,
  AlignCenter,
  AlignLeft,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Link2,
  Unlink,
  Palette,
  Highlighter,
  Type,
  Undo2,
  Redo2,
  RemoveFormatting,
  Quote,
  Minus,
  Code,
  Eye,
  Edit3,
  Check,
  X,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

// Hebrew & Universal Font Families
const FONT_FAMILIES = [
  { name: "ברירת מחדל (Heebo)", value: "'Heebo', sans-serif" },
  { name: "אסיסטנט (Assistant)", value: "'Assistant', sans-serif" },
  { name: "רוביק (Rubik)", value: "'Rubik', sans-serif" },
  { name: "פרנק רוהל (Frank Ruhl)", value: "'Frank Ruhl Libre', serif" },
  { name: "דוד (David Libre)", value: "'David Libre', serif" },
  { name: "אריאל (Arial)", value: "Arial, sans-serif" },
  { name: "טהומה (Tahoma)", value: "Tahoma, sans-serif" },
  { name: "ג'ורג'יה (Georgia)", value: "Georgia, serif" },
  { name: "קוד / מונוספייס (Courier)", value: "'Courier New', monospace" },
];

// Font Sizes with clear Hebrew labels
const FONT_SIZES = [
  { label: "13px - קטן מאוד", value: "13px" },
  { label: "15px - קטן", value: "15px" },
  { label: "17px - רגיל (ברירת מחדל)", value: "17px" },
  { label: "19px - בינוני", value: "19px" },
  { label: "22px - מודגש מוגדל", value: "22px" },
  { label: "26px - כותרת משנה", value: "26px" },
  { label: "32px - כותרת ראשית", value: "32px" },
  { label: "38px - כותרת ענק", value: "38px" },
];

// Quick color palette presets
const TEXT_COLORS = [
  { name: "שחור פחם", color: "#18181b" },
  { name: "כחול רייניץ כהה", color: "#0f172a" },
  { name: "כחול רויאל", color: "#1d4ed8" },
  { name: "זהב רייניץ", color: "#b45309" },
  { name: "ירוק אמרלד", color: "#15803d" },
  { name: "בורדו / אדום", color: "#b91c1c" },
  { name: "סגול עמוק", color: "#6b21a8" },
  { name: "אפור כהה", color: "#475569" },
];

const HIGHLIGHT_COLORS = [
  { name: "ללא רקע", color: "transparent" },
  { name: "צהוב זוהר", color: "#fef08a" },
  { name: "ירוק פסטל", color: "#bbf7d0" },
  { name: "תכלת מרענן", color: "#bae6fd" },
  { name: "כתום אפרסק", color: "#fed7aa" },
  { name: "ורוד עדין", color: "#fbcfe8" },
  { name: "אפור בהיר", color: "#f1f5f9" },
];

/**
 * Converts Markdown headings/bold/lists to HTML if initial content is pure markdown
 */
function markdownToHtml(md: string): string {
  if (!md) return "";
  // If already looks like HTML (contains closing tags or paragraphs)
  if (/<[a-z][\s\S]*>/i.test(md)) {
    return md;
  }

  const lines = md.split("\n");
  let html = "";
  let inUl = false;
  let inOl = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Close lists if blank line
    if (!line.trim()) {
      if (inUl) {
        html += "</ul>";
        inUl = false;
      }
      if (inOl) {
        html += "</ol>";
        inOl = false;
      }
      continue;
    }

    // Unordered list
    if (/^[\*\-]\s+(.+)/.test(line)) {
      if (!inUl) {
        if (inOl) {
          html += "</ol>";
          inOl = false;
        }
        html += '<ul style="list-style-type: disc; padding-right: 24px; margin: 12px 0;">';
        inUl = true;
      }
      const content = line.replace(/^[\*\-]\s+/, "");
      html += `<li>${formatInline(content)}</li>`;
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+(.+)/.test(line)) {
      if (!inOl) {
        if (inUl) {
          html += "</ul>";
          inUl = false;
        }
        html += '<ol style="list-style-type: decimal; padding-right: 24px; margin: 12px 0;">';
        inOl = true;
      }
      const content = line.replace(/^\d+\.\s+/, "");
      html += `<li>${formatInline(content)}</li>`;
      continue;
    }

    // Close any open lists
    if (inUl) {
      html += "</ul>";
      inUl = false;
    }
    if (inOl) {
      html += "</ol>";
      inOl = false;
    }

    // Headings
    if (/^#\s+(.+)/.test(line)) {
      html += `<h1 style="font-size: 28px; font-weight: 800; color: #0f172a; margin: 20px 0 10px 0;">${formatInline(line.replace(/^#\s+/, ""))}</h1>`;
    } else if (/^##\s+(.+)/.test(line)) {
      html += `<h2 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 18px 0 8px 0;">${formatInline(line.replace(/^##\s+/, ""))}</h2>`;
    } else if (/^###\s+(.+)/.test(line)) {
      html += `<h3 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 16px 0 6px 0;">${formatInline(line.replace(/^###\s+/, ""))}</h3>`;
    } else if (/^####\s+(.+)/.test(line)) {
      html += `<h4 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 14px 0 4px 0;">${formatInline(line.replace(/^####\s+/, ""))}</h4>`;
    } else if (/^>\s+(.+)/.test(line)) {
      html += `<blockquote style="border-right: 4px solid #facc15; padding: 10px 16px; margin: 14px 0; background-color: #fefce8; font-style: italic;">${formatInline(line.replace(/^>\s+/, ""))}</blockquote>`;
    } else {
      html += `<p style="margin: 10px 0; line-height: 1.8;">${formatInline(line)}</p>`;
    }
  }

  if (inUl) html += "</ul>";
  if (inOl) html += "</ol>";

  return html;
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #0f172a; font-weight: bold; text-decoration: underline;">$1</a>');
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "הקלד כאן את תוכן המאמר...",
  minHeight = "360px",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<"visual" | "html" | "preview">("visual");
  const [htmlSource, setHtmlSource] = useState<string>("");
  const isInternalChange = useRef<boolean>(false);
  const savedSelection = useRef<Range | null>(null);

  // Formatting state indicators
  const [currentFont, setCurrentFont] = useState<string>("'Heebo', sans-serif");
  const [currentSize, setCurrentSize] = useState<string>("17px");
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState<boolean>(false);
  const [customTextColor, setCustomTextColor] = useState<string>("#18181b");
  const [customBgColor, setCustomBgColor] = useState<string>("#fef08a");

  // Link Dialog Modal State
  const [showLinkModal, setShowLinkModal] = useState<boolean>(false);
  const [linkUrl, setLinkUrl] = useState<string>("");
  const [linkText, setLinkText] = useState<string>("");
  const [linkTargetBlank, setLinkTargetBlank] = useState<boolean>(true);

  // Sync initial content or external updates
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      const converted = markdownToHtml(value || "");
      if (editorRef.current.innerHTML !== converted) {
        editorRef.current.innerHTML = converted;
      }
      setHtmlSource(converted);
    }
    isInternalChange.current = false;
  }, [value]);

  const saveCurrentSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelection.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    if (savedSelection.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelection.current);
      }
    }
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    isInternalChange.current = true;
    const html = editorRef.current.innerHTML;
    setHtmlSource(html);
    onChange(html);
  };

  // Execute standard execCommand with proper focus preservation
  const executeCommand = (command: string, value: string | undefined = undefined) => {
    if (viewMode !== "visual") return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, value);
    handleInput();
  };

  // Font family application
  const handleFontChange = (fontFamily: string) => {
    setCurrentFont(fontFamily);
    if (viewMode !== "visual") return;
    if (editorRef.current) editorRef.current.focus();
    
    // Use modern styling or execCommand
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const span = document.createElement("span");
      span.style.fontFamily = fontFamily;
      try {
        span.appendChild(range.extractContents());
        range.insertNode(span);
        sel.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        sel.addRange(newRange);
      } catch (e) {
        document.execCommand("fontName", false, fontFamily);
      }
    } else {
      document.execCommand("fontName", false, fontFamily);
    }
    handleInput();
  };

  // Font size application
  const handleSizeChange = (fontSize: string) => {
    setCurrentSize(fontSize);
    if (viewMode !== "visual") return;
    if (editorRef.current) editorRef.current.focus();

    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const span = document.createElement("span");
      span.style.fontSize = fontSize;
      try {
        span.appendChild(range.extractContents());
        range.insertNode(span);
        sel.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        sel.addRange(newRange);
      } catch (e) {
        document.execCommand("fontSize", false, "4");
      }
    } else {
      // If collapsed, exec command
      document.execCommand("fontSize", false, "4");
    }
    handleInput();
  };

  // Text Color application
  const handleTextColor = (color: string) => {
    setCustomTextColor(color);
    executeCommand("foreColor", color);
    setShowColorPicker(false);
  };

  // Background Highlight application
  const handleBgColor = (color: string) => {
    setCustomBgColor(color);
    if (color === "transparent") {
      executeCommand("removeFormat");
    } else {
      executeCommand("hiliteColor", color);
    }
    setShowBgColorPicker(false);
  };

  // Heading application
  const handleHeading = (tag: string) => {
    executeCommand("formatBlock", `<${tag}>`);
  };

  // Open Link Dialog
  const handleOpenLinkModal = () => {
    saveCurrentSelection();
    const sel = window.getSelection();
    let selectedText = "";
    if (sel && !sel.isCollapsed) {
      selectedText = sel.toString();
    }
    setLinkText(selectedText);
    setLinkUrl("");
    setLinkTargetBlank(true);
    setShowLinkModal(true);
  };

  // Apply Link
  const handleApplyLink = (e: React.FormEvent) => {
    e.preventDefault();
    setShowLinkModal(false);
    if (!linkUrl.trim()) return;

    let finalUrl = linkUrl.trim();
    if (!/^https?:\/\//i.test(finalUrl) && !/^mailto:/i.test(finalUrl) && !/^tel:/i.test(finalUrl)) {
      finalUrl = "https://" + finalUrl;
    }

    if (editorRef.current) editorRef.current.focus();
    restoreSelection();

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const a = document.createElement("a");
      a.href = finalUrl;
      if (linkTargetBlank) {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
      a.style.color = "#0f172a";
      a.style.fontWeight = "bold";
      a.style.textDecoration = "underline";
      a.textContent = linkText.trim() || finalUrl;

      range.deleteContents();
      range.insertNode(a);

      // Move caret after link
      range.setStartAfter(a);
      range.setEndAfter(a);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      document.execCommand("createLink", false, finalUrl);
    }

    handleInput();
  };

  // Unlink
  const handleUnlink = () => {
    executeCommand("unlink");
  };

  // Insert Horizontal Divider
  const handleInsertDivider = () => {
    executeCommand("insertHorizontalRule");
  };

  // Toggle Source HTML mode
  const handleSwitchToHtml = () => {
    if (editorRef.current) {
      setHtmlSource(editorRef.current.innerHTML);
    }
    setViewMode("html");
  };

  const handleSwitchToVisual = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = htmlSource;
    }
    setViewMode("visual");
    onChange(htmlSource);
  };

  const handleHtmlSourceChange = (newHtml: string) => {
    setHtmlSource(newHtml);
    isInternalChange.current = true;
    onChange(newHtml);
  };

  // Word count & Char count
  const textOnly = (value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const wordCount = textOnly ? textOnly.split(" ").length : 0;
  const charCount = textOnly.length;

  return (
    <div className="w-full border-2 border-babun-primary/20 hover:border-babun-primary/40 focus-within:border-babun-accent rounded-babun-md bg-white shadow-sm transition-colors text-right relative flex flex-col" dir="rtl">
      
      {/* ================= TOP TOOLBAR ================= */}
      <div className="bg-slate-50 border-b border-babun-primary/10 p-2.5 flex flex-wrap items-center justify-between gap-y-2 gap-x-1.5 select-none text-babun-primary">
        
        {/* Left Toolbar Controls (RTL: right side buttons) */}
        <div className="flex flex-wrap items-center gap-1">
          
          {/* Undo / Redo */}
          <div className="flex items-center bg-white border border-slate-200 rounded-sm p-0.5 shadow-2xs">
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); executeCommand("undo"); }}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-black cursor-pointer transition-colors"
              title="בטל פעולה אחרונה (Ctrl+Z)"
            >
              <Undo2 size={16} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); executeCommand("redo"); }}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-black cursor-pointer transition-colors"
              title="בצע שוב (Ctrl+Y)"
            >
              <Redo2 size={16} />
            </button>
          </div>

          <div className="w-px h-6 bg-slate-300 mx-1 hidden sm:block" />

          {/* 1. Font Family Selector */}
          <div className="relative inline-block">
            <select
              value={currentFont}
              onChange={(e) => handleFontChange(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded px-2.5 py-1.5 cursor-pointer shadow-2xs hover:border-slate-300 focus:outline-hidden focus:border-babun-accent pr-2 pl-6 appearance-none"
              title="בחירת סוג גופן"
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.name}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
          </div>

          {/* 2. Font Size Selector */}
          <div className="relative inline-block">
            <select
              value={currentSize}
              onChange={(e) => handleSizeChange(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded px-2 py-1.5 cursor-pointer shadow-2xs hover:border-slate-300 focus:outline-hidden focus:border-babun-accent pr-2 pl-6 appearance-none"
              title="בחירת גודל גופן"
            >
              {FONT_SIZES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
          </div>

          <div className="w-px h-6 bg-slate-300 mx-1 hidden sm:block" />

          {/* 3. Headings Dropdown / Buttons */}
          <div className="flex items-center bg-white border border-slate-200 rounded-sm p-0.5 shadow-2xs">
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleHeading("p"); }}
              className="px-2 py-1 hover:bg-slate-100 rounded text-xs font-bold text-slate-700 cursor-pointer"
              title="פסקה רגילה"
            >
              טקסט
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleHeading("h1"); }}
              className="px-2 py-1 hover:bg-slate-100 rounded text-xs font-black text-slate-900 cursor-pointer flex items-center gap-0.5"
              title="כותרת ראשית (H1)"
            >
              <Heading1 size={15} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleHeading("h2"); }}
              className="px-2 py-1 hover:bg-slate-100 rounded text-xs font-bold text-slate-900 cursor-pointer flex items-center gap-0.5"
              title="כותרת משנה (H2)"
            >
              <Heading2 size={15} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleHeading("h3"); }}
              className="px-2 py-1 hover:bg-slate-100 rounded text-xs font-bold text-slate-800 cursor-pointer flex items-center gap-0.5"
              title="כותרת קטנה (H3)"
            >
              <Heading3 size={15} />
            </button>
          </div>

          <div className="w-px h-6 bg-slate-300 mx-1 hidden sm:block" />

          {/* 4. Text Styling: Bold, Italic, Underline, Strikethrough */}
          <div className="flex items-center bg-white border border-slate-200 rounded-sm p-0.5 shadow-2xs">
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); executeCommand("bold"); }}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-800 hover:text-black font-black cursor-pointer transition-colors"
              title="מודגש (Ctrl+B)"
            >
              <Bold size={16} className="stroke-[2.5]" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); executeCommand("italic"); }}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-800 hover:text-black cursor-pointer transition-colors"
              title="נטוי (Ctrl+I)"
            >
              <Italic size={16} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); executeCommand("underline"); }}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-800 hover:text-black cursor-pointer transition-colors"
              title="קו תחתון (Ctrl+U)"
            >
              <Underline size={16} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); executeCommand("strikeThrough"); }}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-800 hover:text-black cursor-pointer transition-colors"
              title="קו חוצה"
            >
              <Strikethrough size={16} />
            </button>
          </div>

          <div className="w-px h-6 bg-slate-300 mx-1 hidden sm:block" />

          {/* 5. Colors: Text Color & Highlight Background Color */}
          <div className="flex items-center gap-1">
            {/* Text Color Picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowColorPicker(!showColorPicker);
                  setShowBgColorPicker(false);
                }}
                className="flex items-center gap-1 px-2 py-1.5 bg-white border border-slate-200 rounded shadow-2xs text-xs font-bold text-slate-800 hover:border-slate-300 cursor-pointer"
                title="צבע טקסט"
              >
                <Palette size={15} style={{ color: customTextColor }} />
                <span className="hidden sm:inline">צבע</span>
                <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: customTextColor }} />
              </button>

              {showColorPicker && (
                <div className="absolute top-full right-0 mt-1 z-50 bg-white border border-slate-300 p-3 rounded-md shadow-xl w-56 text-right">
                  <div className="text-[11px] font-bold text-slate-600 mb-2">צבעי טקסט מהירים:</div>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {TEXT_COLORS.map((tc) => (
                      <button
                        key={tc.color}
                        type="button"
                        onClick={() => handleTextColor(tc.color)}
                        className="w-full h-7 rounded border border-slate-300 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                        style={{ backgroundColor: tc.color }}
                        title={tc.name}
                      >
                        {customTextColor === tc.color && <Check size={14} className="text-white drop-shadow-md" />}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                    <span className="text-[11px] text-slate-500">בחירה חופשית:</span>
                    <input
                      type="color"
                      value={customTextColor}
                      onChange={(e) => handleTextColor(e.target.value)}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Background Highlight Color Picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowBgColorPicker(!showBgColorPicker);
                  setShowColorPicker(false);
                }}
                className="flex items-center gap-1 px-2 py-1.5 bg-white border border-slate-200 rounded shadow-2xs text-xs font-bold text-slate-800 hover:border-slate-300 cursor-pointer"
                title="צבע רקע / הדגשת מרקר"
              >
                <Highlighter size={15} className="text-amber-600" />
                <span className="hidden sm:inline">מרקר</span>
                <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: customBgColor === 'transparent' ? '#fff' : customBgColor }} />
              </button>

              {showBgColorPicker && (
                <div className="absolute top-full right-0 mt-1 z-50 bg-white border border-slate-300 p-3 rounded-md shadow-xl w-56 text-right">
                  <div className="text-[11px] font-bold text-slate-600 mb-2">צבעי הדגשת רקע:</div>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {HIGHLIGHT_COLORS.map((hc) => (
                      <button
                        key={hc.color}
                        type="button"
                        onClick={() => handleBgColor(hc.color)}
                        className="w-full h-7 rounded border border-slate-300 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform text-[10px] font-bold"
                        style={{ backgroundColor: hc.color === 'transparent' ? '#f8fafc' : hc.color }}
                        title={hc.name}
                      >
                        {hc.color === 'transparent' ? 'ללא' : (customBgColor === hc.color && <Check size={14} className="text-slate-800" />)}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                    <span className="text-[11px] text-slate-500">מרקר מותאם:</span>
                    <input
                      type="color"
                      value={customBgColor === 'transparent' ? '#fef08a' : customBgColor}
                      onChange={(e) => handleBgColor(e.target.value)}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="w-px h-6 bg-slate-300 mx-1 hidden sm:block" />

          {/* 6. Alignment: Right (default RTL), Center, Left, Justify */}
          <div className="flex items-center bg-white border border-slate-200 rounded-sm p-0.5 shadow-2xs">
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); executeCommand("justifyRight"); }}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-800 hover:text-black cursor-pointer transition-colors"
              title="יישור לימין"
            >
              <AlignRight size={16} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); executeCommand("justifyCenter"); }}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-800 hover:text-black cursor-pointer transition-colors"
              title="יישור למרכז"
            >
              <AlignCenter size={16} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); executeCommand("justifyLeft"); }}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-800 hover:text-black cursor-pointer transition-colors"
              title="יישור לשמאל"
            >
              <AlignLeft size={16} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); executeCommand("justifyFull"); }}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-800 hover:text-black cursor-pointer transition-colors"
              title="יישור מלא (שני הצדדים)"
            >
              <AlignJustify size={16} />
            </button>
          </div>

          <div className="w-px h-6 bg-slate-300 mx-1 hidden sm:block" />

          {/* 7. Lists: Bulleted & Numbered */}
          <div className="flex items-center bg-white border border-slate-200 rounded-sm p-0.5 shadow-2xs">
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); executeCommand("insertUnorderedList"); }}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-800 hover:text-black cursor-pointer transition-colors"
              title="רשימת תבליטים"
            >
              <List size={16} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); executeCommand("insertOrderedList"); }}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-800 hover:text-black cursor-pointer transition-colors"
              title="רשימה ממוספרת"
            >
              <ListOrdered size={16} />
            </button>
          </div>

          <div className="w-px h-6 bg-slate-300 mx-1 hidden sm:block" />

          {/* 8. Links: Add Link & Remove Link */}
          <div className="flex items-center bg-white border border-slate-200 rounded-sm p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={handleOpenLinkModal}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-800 hover:text-black cursor-pointer transition-colors flex items-center gap-1 text-xs font-bold"
              title="הוספת קישור לאינטרנט"
            >
              <Link2 size={16} className="text-blue-600" />
              <span className="hidden md:inline">קישור</span>
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleUnlink(); }}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-red-600 cursor-pointer transition-colors"
              title="הסר קישור"
            >
              <Unlink size={16} />
            </button>
          </div>

          {/* 9. Extra formatting: Blockquote, Divider, Clear Formatting */}
          <div className="flex items-center bg-white border border-slate-200 rounded-sm p-0.5 shadow-2xs">
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleHeading("blockquote"); }}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-800 hover:text-black cursor-pointer transition-colors"
              title="בלוק ציטוט מודגש"
            >
              <Quote size={15} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleInsertDivider(); }}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-800 hover:text-black cursor-pointer transition-colors"
              title="קו מפריד"
            >
              <Minus size={16} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); executeCommand("removeFormat"); }}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-red-600 cursor-pointer transition-colors"
              title="נקה עיצוב"
            >
              <RemoveFormatting size={15} />
            </button>
          </div>
        </div>

        {/* View Mode Switcher (Visual WYSIWYG / HTML Source / Preview) */}
        <div className="flex items-center bg-white border border-slate-300 rounded p-0.5 text-xs font-bold shadow-2xs">
          <button
            type="button"
            onClick={handleSwitchToVisual}
            className={`px-3 py-1 rounded flex items-center gap-1.5 cursor-pointer transition-colors ${
              viewMode === "visual"
                ? "bg-babun-primary text-white shadow-2xs"
                : "text-slate-600 hover:text-black"
            }`}
          >
            <Edit3 size={13} />
            <span>עורך ויזואלי</span>
          </button>
          <button
            type="button"
            onClick={handleSwitchToHtml}
            className={`px-3 py-1 rounded flex items-center gap-1.5 cursor-pointer transition-colors ${
              viewMode === "html"
                ? "bg-babun-primary text-white shadow-2xs"
                : "text-slate-600 hover:text-black"
            }`}
          >
            <Code size={13} />
            <span>קוד HTML</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (viewMode === "visual" && editorRef.current) {
                setHtmlSource(editorRef.current.innerHTML);
              }
              setViewMode("preview");
            }}
            className={`px-3 py-1 rounded flex items-center gap-1.5 cursor-pointer transition-colors ${
              viewMode === "preview"
                ? "bg-babun-primary text-white shadow-2xs"
                : "text-slate-600 hover:text-black"
            }`}
          >
            <Eye size={13} />
            <span>תצוגה מקדימה</span>
          </button>
        </div>

      </div>

      {/* ================= EDITOR MAIN BODY ================= */}
      <div className="relative flex-grow flex flex-col">
        {/* Mode 1: Visual WYSIWYG ContentEditable */}
        <div
          ref={editorRef}
          contentEditable={viewMode === "visual"}
          onInput={handleInput}
          onBlur={handleInput}
          style={{ minHeight }}
          dir="rtl"
          data-placeholder={placeholder}
          className={`w-full p-6 text-slate-900 leading-relaxed focus:outline-hidden text-right overflow-y-auto selection:bg-babun-accent selection:text-babun-primary font-sans text-base md:text-lg ${
            viewMode !== "visual" ? "hidden" : "block"
          }`}
        />

        {/* Mode 2: HTML Source Editor */}
        {viewMode === "html" && (
          <div className="flex-grow flex flex-col p-4 bg-slate-950 text-slate-100 font-mono text-xs rounded-b-md">
            <div className="text-[11px] text-slate-400 mb-2 flex items-center justify-between">
              <span>עריכת קוד מקור HTML ישיר:</span>
              <span>תומך בכל תגיות העיצוב</span>
            </div>
            <textarea
              value={htmlSource}
              onChange={(e) => handleHtmlSourceChange(e.target.value)}
              style={{ minHeight }}
              dir="ltr"
              className="w-full flex-grow p-4 bg-slate-900 text-emerald-300 font-mono text-xs leading-relaxed border border-slate-800 rounded focus:outline-hidden focus:border-babun-accent resize-y"
              placeholder="<p>תוכן HTML...</p>"
            />
          </div>
        )}

        {/* Mode 3: Real-time Public Reader Preview */}
        {viewMode === "preview" && (
          <div className="p-8 bg-white rounded-b-md overflow-y-auto" style={{ minHeight }} dir="rtl">
            <div className="max-w-3xl mx-auto">
              <div className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-sm mb-6 inline-block">
                👁️ תצוגה מקדימה: בדיוק כפי שהקורא יראה את המאמר באתר רייניץ
              </div>
              <div
                className="article-content text-zinc-800 text-base md:text-lg leading-[1.85] space-y-4 font-sans"
                dangerouslySetInnerHTML={{ __html: htmlSource || "<p class='text-zinc-400 italic'>אין עדיין תוכן להצגה...</p>" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ================= FOOTER STATUS BAR ================= */}
      <div className="bg-slate-50 border-t border-babun-primary/10 px-4 py-2 flex flex-row items-center justify-between text-[11px] text-slate-500 font-sans select-none">
        <div className="flex items-center gap-3">
          <span>{wordCount} מילים</span>
          <span>•</span>
          <span>{charCount} תווים</span>
          <span>•</span>
          <span className="text-emerald-700 font-bold">✓ עורך פעיל</span>
        </div>
        <div className="text-[10px] text-slate-400 hidden sm:block">
          תומך בגרירת טקסט, העתקה מ-Word/Google Docs, קיצורי מקלדת (Ctrl+B, Ctrl+I, Ctrl+U)
        </div>
      </div>

      {/* ================= LINK INSERTION POPUP MODAL ================= */}
      {showLinkModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-babun-lg p-6 max-w-md w-full shadow-2xl border border-slate-200 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h4 className="font-display font-black text-base text-babun-primary flex items-center gap-2">
                <Link2 size={18} className="text-babun-accent" />
                <span>הוספת קישור לטקסט</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="p-1 text-slate-400 hover:text-black cursor-pointer rounded"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApplyLink} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  כתובת הקישור (URL) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://example.co.il או קישור לעמוד"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  dir="ltr"
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-left font-mono focus:outline-hidden focus:border-babun-accent"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  טקסט להצגה (אופציונלי - אם נבחר טקסט קודם הוא יופיע כאן)
                </label>
                <input
                  type="text"
                  placeholder="למשל: לחצו כאן לקריאה נוספת"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-right focus:outline-hidden focus:border-babun-accent"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="target-blank-checkbox"
                  checked={linkTargetBlank}
                  onChange={(e) => setLinkTargetBlank(e.target.checked)}
                  className="w-4 h-4 text-babun-primary rounded border-slate-300 focus:ring-babun-accent cursor-pointer"
                />
                <label htmlFor="target-blank-checkbox" className="text-xs text-slate-700 cursor-pointer font-medium">
                  פתח את הקישור בלשונית חדשה (מומלץ לקישורים חיצוניים)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded text-xs font-bold text-slate-600 cursor-pointer"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-babun-primary hover:bg-black text-white rounded text-xs font-bold shadow-md cursor-pointer"
                >
                  הוסף קישור
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
